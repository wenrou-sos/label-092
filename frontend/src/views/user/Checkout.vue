<template>
  <div class="checkout-page">
    <Header />
    <main class="container main-content">
      <div class="page-header">
        <h1 class="page-title">
          <el-icon><Money /></el-icon>
          确认订单
        </h1>
      </div>

      <template v-if="checkoutItems.length > 0 && !orderSuccess">
        <el-form
          ref="addressFormRef"
          :model="addressForm"
          :rules="addressRules"
          label-width="80px"
          class="card-shadow address-section"
        >
          <div class="section-title">
            <el-icon><Location /></el-icon>
            收货地址
          </div>
          <el-form-item label="收货人" prop="name">
            <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="addressForm.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="详细地址" prop="address">
            <el-input
              v-model="addressForm.address"
              type="textarea"
              :rows="3"
              placeholder="请输入详细收货地址"
            />
          </el-form-item>
        </el-form>

        <div class="card-shadow goods-section">
          <div class="section-title">
            <el-icon><Goods /></el-icon>
            订单商品
          </div>
          <div class="goods-list">
            <div v-for="item in checkoutItems" :key="`${item.productId}-${item.packageType}`" class="goods-item">
              <div class="goods-image">
                <img :src="item.productImage || defaultImage" :alt="item.productName" />
              </div>
              <div class="goods-info">
                <div class="goods-name">{{ item.productName }}</div>
                <div class="goods-spec">
                  <el-tag :type="getPackageTagType(item.packageType)" size="small">
                    {{ PackageTypeMap[item.packageType] }}
                  </el-tag>
                  <span v-if="item.packageType === 'loose'" class="goods-weight">
                    {{ item.weight }}g
                  </span>
                </div>
              </div>
              <div class="goods-price">¥{{ item.unitPrice.toFixed(2) }}</div>
              <div class="goods-quantity">x{{ item.quantity }}</div>
              <div class="goods-subtotal">¥{{ getItemSubtotal(item).toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div class="card-shadow remark-section">
          <div class="section-title">
            <el-icon><Edit /></el-icon>
            订单备注
          </div>
          <el-input
            v-model="remark"
            type="textarea"
            :rows="3"
            placeholder="选填，如有特殊要求请在此填写"
            maxlength="200"
            show-word-limit
          />
        </div>

        <div class="card-shadow price-section">
          <div class="section-title">
            <el-icon><Wallet /></el-icon>
            价格明细
          </div>
          <div class="price-detail">
            <div class="price-row">
              <span class="price-label">商品总额</span>
              <span class="price-value">¥{{ originalTotal.toFixed(2) }}</span>
            </div>
            <div v-if="userStore.userInfo && userStore.userInfo.discount < 1" class="price-row discount">
              <span class="price-label">
                会员折扣
                <el-tag size="small" type="success">{{ MemberLevelMap[userStore.userInfo.level] }}</el-tag>
              </span>
              <span class="price-value">-¥{{ discountAmount.toFixed(2) }}</span>
            </div>
            <div class="price-row total">
              <span class="price-label">应付金额</span>
              <span class="price-value total-price">¥{{ actualTotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="checkout-footer card-shadow">
          <div class="footer-left">
            <span>共 <strong>{{ checkoutItems.length }}</strong> 件商品，合计：</span>
            <span class="footer-total">
              <span class="currency">¥</span>
              <span class="price">{{ actualTotal.toFixed(2) }}</span>
            </span>
          </div>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="submitting"
            @click="handleSubmitOrder"
          >
            提交订单
          </el-button>
        </div>
      </template>

      <template v-if="orderSuccess">
        <div class="card-shadow success-section">
          <div class="success-icon">
            <el-icon :size="80" color="#67c23a"><CircleCheck /></el-icon>
          </div>
          <h2 class="success-title">订单提交成功！</h2>
          <p class="order-info">
            订单号：<span class="order-no">{{ orderResult.orderNo }}</span>
          </p>
          <p class="order-amount">
            应付金额：<span class="amount">¥{{ actualTotal.toFixed(2) }}</span>
          </p>
          <div class="success-actions">
            <el-button type="primary" size="large" :loading="paying" @click="handlePay">
              立即支付
            </el-button>
            <el-button size="large" @click="goToOrders">查看订单</el-button>
            <el-button size="large" @click="goShopping">继续购物</el-button>
          </div>
        </div>
      </template>

      <template v-if="checkoutItems.length === 0 && !orderSuccess">
        <div class="card-shadow empty-section">
          <el-empty description="没有需要结算的商品">
            <el-button type="primary" @click="goToCart">返回购物车</el-button>
          </el-empty>
        </div>
      </template>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { PackageTypeMap, MemberLevelMap, type CartItem, type PackageType } from '@/types';
import { createOrder, payOrder } from '@/api/order';
import Header from '@/components/user/Header.vue';
import Footer from '@/components/user/Footer.vue';

const router = useRouter();
const userStore = useUserStore();

const defaultImage = 'https://via.placeholder.com/80x80?text=%E8%8C%B6%E5%8F%B6';

const addressFormRef = ref<FormInstance>();
const checkoutItems = ref<CartItem[]>([]);
const remark = ref('');
const submitting = ref(false);
const paying = ref(false);
const orderSuccess = ref(false);
const orderResult = ref<{ orderId: number; orderNo: string }>({ orderId: 0, orderNo: '' });

const addressForm = ref({
  name: '',
  phone: '',
  address: '',
});

const addressRules: FormRules = {
  name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
};

onMounted(() => {
  loadCheckoutItems();
  if (userStore.userInfo) {
    addressForm.value.name = userStore.userInfo.name || '';
    addressForm.value.phone = userStore.userInfo.phone || '';
  }
});

const loadCheckoutItems = () => {
  const checkoutKeysStr = sessionStorage.getItem('checkoutItems');
  if (!checkoutKeysStr) {
    checkoutItems.value = userStore.cart.slice();
    return;
  }
  const checkoutKeys: string[] = JSON.parse(checkoutKeysStr);
  checkoutItems.value = userStore.cart.filter((item) => {
    const key = `${item.productId}-${item.packageType}`;
    return checkoutKeys.includes(key);
  });
  if (checkoutItems.value.length === 0) {
    checkoutItems.value = userStore.cart.slice();
  }
};

const getItemSubtotal = (item: CartItem) => {
  return item.unitPrice * item.quantity;
};

const originalTotal = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + getItemSubtotal(item), 0);
});

const discountAmount = computed(() => {
  const discount = userStore.userInfo?.discount || 1;
  return originalTotal.value * (1 - discount);
});

const actualTotal = computed(() => {
  const discount = userStore.userInfo?.discount || 1;
  return originalTotal.value * discount;
});

const getPackageTagType = (type: PackageType) => {
  if (type === 'giftbox') return 'warning';
  if (type === 'box') return 'success';
  return 'info';
};

const handleSubmitOrder = async () => {
  if (!addressFormRef.value) return;

  try {
    await addressFormRef.value.validate();
  } catch (error) {
    ElMessage.warning('请完善收货地址信息');
    return;
  }

  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  if (checkoutItems.value.length === 0) {
    ElMessage.warning('没有可结算的商品');
    return;
  }

  submitting.value = true;
  try {
    const res = await createOrder({
      items: checkoutItems.value.map((item) => ({
        productId: item.productId,
        packageType: item.packageType,
        weight: item.weight,
        quantity: item.quantity,
      })),
      shippingAddress: addressForm.value.address,
      contactPhone: addressForm.value.phone,
      contactName: addressForm.value.name,
      remark: remark.value || undefined,
    });

    orderResult.value = { orderId: res.orderId, orderNo: res.orderNo };

    checkoutItems.value.forEach((item) => {
      userStore.removeFromCart(item.productId, item.packageType);
    });

    sessionStorage.removeItem('checkoutItems');
    orderSuccess.value = true;
    ElMessage.success('订单提交成功');
  } catch (error: any) {
    ElMessage.error(error.message || '订单提交失败，请重试');
  } finally {
    submitting.value = false;
  }
};

const handlePay = async () => {
  if (paying.value) return;

  paying.value = true;
  try {
    const res = await payOrder(orderResult.value.orderId);
    ElMessage.success('支付成功！');
    setTimeout(() => {
      router.push('/member?tab=orders');
    }, 1500);
  } catch (error: any) {
    ElMessage.error(error.message || '支付失败，请重试');
  } finally {
    paying.value = false;
  }
};

const goToCart = () => {
  router.push('/cart');
};

const goToOrders = () => {
  router.push('/member?tab=orders');
};

const goShopping = () => {
  router.push('/products');
};
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 20px 0 40px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  color: #333;
  margin: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.address-section,
.goods-section,
.remark-section,
.price-section {
  background: #fff;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 20px;
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #fafafa;
  border-radius: 8px;
  transition: background 0.3s;
}

.goods-item:hover {
  background: #f5f5f5;
}

.goods-image {
  width: 70px;
  height: 70px;
  margin-right: 15px;
  flex-shrink: 0;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.goods-info {
  flex: 1;
  min-width: 0;
}

.goods-name {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-spec {
  display: flex;
  align-items: center;
  gap: 10px;
}

.goods-weight {
  font-size: 13px;
  color: #999;
}

.goods-price {
  width: 100px;
  text-align: center;
  color: #2d5a27;
  font-weight: 500;
}

.goods-quantity {
  width: 80px;
  text-align: center;
  color: #666;
}

.goods-subtotal {
  width: 100px;
  text-align: center;
  color: #e74c3c;
  font-weight: 600;
}

.price-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.price-label {
  color: #666;
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-value {
  color: #333;
}

.price-row.discount .price-value {
  color: #e74c3c;
}

.price-row.total {
  padding-top: 12px;
  border-top: 1px dashed #eee;
}

.price-row.total .price-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.total-price {
  font-size: 24px;
  font-weight: 600;
  color: #e74c3c;
}

.checkout-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  background: #fff;
  border-radius: 8px;
  position: sticky;
  bottom: 20px;
  z-index: 10;
}

.footer-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.footer-left strong {
  color: #2d5a27;
  font-size: 16px;
}

.footer-total {
  color: #e74c3c;
}

.footer-total .currency {
  font-size: 14px;
}

.footer-total .price {
  font-size: 24px;
  font-weight: 600;
}

.submit-btn {
  width: 150px;
  font-size: 16px;
  background: #2d5a27;
  border-color: #2d5a27;
}

.submit-btn:hover {
  background: #3d7a37;
  border-color: #3d7a37;
}

.success-section {
  background: #fff;
  border-radius: 8px;
  padding: 60px 40px;
  text-align: center;
}

.success-icon {
  margin-bottom: 20px;
}

.success-title {
  font-size: 24px;
  color: #333;
  margin: 0 0 20px;
}

.order-info,
.order-amount {
  font-size: 16px;
  color: #666;
  margin: 10px 0;
}

.order-no {
  color: #2d5a27;
  font-weight: 600;
  font-family: monospace;
}

.amount {
  color: #e74c3c;
  font-size: 24px;
  font-weight: 600;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.empty-section {
  background: #fff;
  border-radius: 8px;
  padding: 60px 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }

  .address-section,
  .goods-section,
  .remark-section,
  .price-section {
    padding: 20px;
  }

  .goods-item {
    flex-wrap: wrap;
    gap: 10px;
  }

  .goods-image {
    width: 60px;
    height: 60px;
  }

  .goods-info {
    width: calc(100% - 90px);
  }

  .goods-price,
  .goods-quantity,
  .goods-subtotal {
    width: 33.33%;
  }

  .checkout-footer {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .footer-left {
    width: 100%;
    justify-content: space-between;
  }

  .submit-btn {
    width: 100%;
  }

  .success-section {
    padding: 40px 20px;
  }

  .success-actions {
    flex-direction: column;
  }

  .success-actions .el-button {
    width: 100%;
  }
}
</style>
