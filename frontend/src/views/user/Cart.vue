<template>
  <div class="cart-page">
    <Header />
    <main class="container main-content">
      <div class="page-header">
        <h1 class="page-title">
          <el-icon><ShoppingCart /></el-icon>
          我的购物车
        </h1>
      </div>

      <template v-if="userStore.cart.length > 0">
        <div class="cart-header card-shadow">
          <div class="select-all">
            <el-checkbox v-model="isAllSelected" @change="handleSelectAll">全选</el-checkbox>
            <el-button type="text" @click="handleInvertSelection">反选</el-button>
          </div>
          <div class="header-info">
            <span class="info-item">商品信息</span>
            <span class="info-item">包装类型</span>
            <span class="info-item">重量</span>
            <span class="info-item">单价</span>
            <span class="info-item">数量</span>
            <span class="info-item">小计</span>
            <span class="info-item">操作</span>
          </div>
        </div>

        <div class="cart-list">
          <div
            v-for="item in userStore.cart"
            :key="getItemKey(item)"
            class="cart-item card-shadow"
          >
            <div class="item-checkbox">
              <el-checkbox
                :model-value="isSelected(item)"
                @change="(val: boolean) => handleItemSelect(item, val)"
              />
            </div>
            <div class="item-image">
              <img :src="item.productImage || defaultImage" :alt="item.productName" />
            </div>
            <div class="item-name">{{ item.productName }}</div>
            <div class="item-package">
              <el-tag :type="getPackageTagType(item.packageType)" size="small">
                {{ PackageTypeMap[item.packageType] }}
              </el-tag>
            </div>
            <div class="item-weight">
              <template v-if="item.packageType === 'loose'">{{ item.weight }}g</template>
              <template v-else>-</template>
            </div>
            <div class="item-price">¥{{ item.unitPrice.toFixed(2) }}</div>
            <div class="item-quantity">
              <el-input-number
                :model-value="item.quantity"
                :min="1"
                :max="item.stock"
                size="small"
                @update:model-value="(val: number) => handleQuantityChange(item, val)"
              />
            </div>
            <div class="item-subtotal">
              <span class="subtotal-price">¥{{ getItemSubtotal(item).toFixed(2) }}</span>
            </div>
            <div class="item-action">
              <el-button type="danger" text @click="handleDelete(item)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>

        <div class="cart-footer card-shadow">
          <div class="footer-left">
            <el-checkbox v-model="isAllSelected" @change="handleSelectAll">全选</el-checkbox>
            <el-button type="text" @click="handleDeleteSelected" :disabled="selectedCount === 0">
              删除选中
            </el-button>
          </div>
          <div class="footer-right">
            <div class="footer-info">
              <span>已选 <strong class="highlight">{{ selectedCount }}</strong> 件商品</span>
              <span v-if="userStore.userInfo && userStore.userInfo.discount < 1" class="discount-info">
                会员折扣：<strong class="highlight">{{ (userStore.userInfo.discount * 10).toFixed(1) }}折</strong>
              </span>
            </div>
            <div class="footer-total">
              <span class="total-label">合计：</span>
              <span class="total-value">
                <span class="currency">¥</span>
                <span class="price">{{ selectedTotal.toFixed(2) }}</span>
              </span>
              <span v-if="originalTotal > selectedTotal" class="original-total">
                ¥{{ originalTotal.toFixed(2) }}
              </span>
            </div>
            <el-button
              type="primary"
              size="large"
              class="checkout-btn"
              :disabled="selectedCount === 0"
              @click="handleCheckout"
            >
              去结算
            </el-button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="empty-cart card-shadow">
          <el-empty description="购物车空空如也~">
            <el-button type="primary" @click="goShopping">去逛逛</el-button>
          </el-empty>
        </div>
      </template>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { PackageTypeMap, type CartItem, type PackageType } from '@/types';
import Header from '@/components/user/Header.vue';
import Footer from '@/components/user/Footer.vue';

const router = useRouter();
const userStore = useUserStore();

const defaultImage = 'https://via.placeholder.com/80x80?text=%E8%8C%B6%E5%8F%B6';

const selectedItems = ref<Set<string>>(new Set());

const selectedCount = computed(() => selectedItems.value.size);

const isAllSelected = computed({
  get: () => userStore.cart.length > 0 && selectedItems.value.size === userStore.cart.length,
  set: (val: boolean) => {
    if (val) {
      userStore.cart.forEach((item) => {
        selectedItems.value.add(getItemKey(item));
      });
    } else {
      selectedItems.value.clear();
    }
  },
});

const getItemKey = (item: CartItem) =>
  item.packageType === 'loose'
    ? `${item.productId}-${item.packageType}-${item.weight}`
    : `${item.productId}-${item.packageType}`;

const isSelected = (item: CartItem) => selectedItems.value.has(getItemKey(item));

const handleItemSelect = (item: CartItem, selected: boolean) => {
  const key = getItemKey(item);
  if (selected) {
    selectedItems.value.add(key);
  } else {
    selectedItems.value.delete(key);
  }
};

const handleSelectAll = (val: boolean) => {
  isAllSelected.value = val;
};

const handleInvertSelection = () => {
  userStore.cart.forEach((item) => {
    const key = getItemKey(item);
    if (selectedItems.value.has(key)) {
      selectedItems.value.delete(key);
    } else {
      selectedItems.value.add(key);
    }
  });
};

const getItemSubtotal = (item: CartItem) => {
  return item.unitPrice * item.quantity;
};

const selectedItemsList = computed(() => {
  return userStore.cart.filter((item) => isSelected(item));
});

const originalTotal = computed(() => {
  return selectedItemsList.value.reduce((sum, item) => sum + getItemSubtotal(item), 0);
});

const selectedTotal = computed(() => {
  const discount = userStore.userInfo?.discount || 1;
  return originalTotal.value * discount;
});

const getPackageTagType = (type: PackageType) => {
  if (type === 'giftbox') return 'warning';
  if (type === 'box') return 'success';
  return 'info';
};

const handleQuantityChange = (item: CartItem, quantity: number) => {
  userStore.updateCartItem(getItemKey(item), quantity);
};

const handleDelete = (item: CartItem) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      userStore.removeFromCart(getItemKey(item));
      selectedItems.value.delete(getItemKey(item));
      ElMessage.success('已删除');
    })
    .catch(() => {});
};

const handleDeleteSelected = () => {
  if (selectedItemsList.value.length === 0) return;
  ElMessageBox.confirm(`确定要删除选中的 ${selectedItemsList.value.length} 件商品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      selectedItemsList.value.forEach((item) => {
        userStore.removeFromCart(getItemKey(item));
      });
      selectedItems.value.clear();
      ElMessage.success('已删除');
    })
    .catch(() => {});
};

const handleCheckout = () => {
  if (selectedItemsList.value.length === 0) {
    ElMessage.warning('请选择要结算的商品');
    return;
  }
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  const selectedKeys = Array.from(selectedItems.value);
  sessionStorage.setItem('checkoutItems', JSON.stringify(selectedKeys));
  router.push('/checkout');
};

const goShopping = () => {
  router.push('/products');
};
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 20px 0 40px;
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

.cart-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 15px;
  background: #fff;
  border-radius: 8px;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 180px;
}

.header-info {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #fff;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.cart-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-checkbox {
  width: 50px;
  display: flex;
  justify-content: center;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.item-name {
  flex: 2;
  font-size: 15px;
  color: #333;
  text-align: left;
  padding-right: 20px;
}

.item-package,
.item-weight,
.item-price,
.item-quantity,
.item-subtotal,
.item-action {
  flex: 1;
  text-align: center;
}

.item-weight {
  color: #666;
}

.item-price {
  color: #2d5a27;
  font-weight: 500;
}

.subtotal-price {
  color: #e74c3c;
  font-size: 16px;
  font-weight: 600;
}

.item-action {
  display: flex;
  justify-content: center;
}

.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  position: sticky;
  bottom: 20px;
  z-index: 10;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.highlight {
  color: #2d5a27;
  font-size: 16px;
}

.discount-info {
  color: #e74c3c;
}

.footer-total {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.total-label {
  font-size: 14px;
  color: #666;
}

.total-value {
  color: #e74c3c;
}

.total-value .currency {
  font-size: 14px;
}

.total-value .price {
  font-size: 24px;
  font-weight: 600;
}

.original-total {
  color: #999;
  text-decoration: line-through;
  font-size: 14px;
  margin-left: 10px;
}

.checkout-btn {
  width: 120px;
  font-size: 16px;
  background: #2d5a27;
  border-color: #2d5a27;
}

.checkout-btn:hover {
  background: #3d7a37;
  border-color: #3d7a37;
}

.empty-cart {
  padding: 60px 0;
  background: #fff;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .cart-header {
    display: none;
  }

  .cart-item {
    flex-wrap: wrap;
    gap: 10px;
  }

  .item-checkbox {
    width: 30px;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-name {
    width: calc(100% - 120px);
    padding-right: 0;
  }

  .item-package,
  .item-weight,
  .item-price,
  .item-quantity,
  .item-subtotal,
  .item-action {
    flex: none;
    width: 33.33%;
  }

  .cart-footer {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .footer-right {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 15px;
  }

  .checkout-btn {
    width: 100%;
  }
}
</style>
