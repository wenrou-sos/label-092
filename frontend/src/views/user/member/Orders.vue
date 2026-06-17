<template>
  <el-card class="orders-card card-shadow">
    <template #header>
      <div class="card-header">
        <h3 class="card-title">
          <el-icon color="#2d5a27"><List /></el-icon>
          我的订单
        </h3>
        <el-tabs v-model="activeTab" class="status-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="全部" name="" />
          <el-tab-pane label="待支付" name="pending" />
          <el-tab-pane label="已支付" name="paid" />
          <el-tab-pane label="已发货" name="shipped" />
          <el-tab-pane label="已完成" name="completed" />
          <el-tab-pane label="已取消" name="cancelled" />
        </el-tabs>
      </div>
    </template>

    <div v-loading="loading" class="orders-list">
      <template v-if="orders.length > 0">
        <el-card
          v-for="order in orders"
          :key="order.id"
          class="order-item card-shadow"
        >
          <div class="order-header">
            <div class="order-info">
              <span class="order-no">订单号：{{ order.orderNo }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <el-tag :type="statusTagType(order.status)" effect="dark" size="small">
              {{ OrderStatusMap[order.status] }}
            </el-tag>
          </div>

          <div class="order-items">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="order-item-row"
            >
              <img
                :src="item.productImage || defaultImage"
                :alt="item.productName"
                class="item-image"
              />
              <div class="item-info">
                <h4 class="item-name text-ellipsis">{{ item.productName }}</h4>
                <p class="item-spec">
                  {{ PackageTypeMap[item.packageType] }} · {{ item.weight }}g × {{ item.quantity }}
                </p>
              </div>
              <div class="item-price">
                <span class="price-value">¥{{ item.subtotal.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-amount">
              <span v-if="order.discountAmount > 0" class="discount">
                优惠：-¥{{ order.discountAmount.toFixed(2) }}
              </span>
              <span class="total">
                实付：<span class="total-value">¥{{ order.actualAmount.toFixed(2) }}</span>
              </span>
            </div>
            <div class="order-actions">
              <el-button
                v-if="order.status === 'pending'"
                type="primary"
                size="small"
                @click="handlePay(order)"
              >
                立即支付
              </el-button>
              <el-button
                v-if="order.status === 'pending'"
                size="small"
                @click="handleCancel(order)"
              >
                取消订单
              </el-button>
              <el-button
                v-if="order.status === 'shipped'"
                type="primary"
                size="small"
                @click="handleConfirm(order)"
              >
                确认收货
              </el-button>
              <el-button
                v-if="order.status === 'completed'"
                size="small"
                @click="handleReview(order)"
              >
                去评价
              </el-button>
              <el-button size="small" @click="handleDetail(order)">
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </template>

      <el-empty v-else description="暂无订单" class="empty-state">
        <el-button type="primary" @click="goShopping">去逛逛</el-button>
      </el-empty>
    </div>

    <div v-if="total > pageSize" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMyOrders, cancelOrder, payOrder, confirmOrder } from '@/api/order';
import { OrderStatusMap, PackageTypeMap, type Order, type OrderStatus } from '@/types';
import { List } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(false);
const activeTab = ref('');
const orders = ref<Order[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const defaultImage = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=100&h=100&fit=crop';

const fetchOrders = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    if (activeTab.value) {
      params.status = activeTab.value;
    }
    const res = await getMyOrders(params);
    orders.value = res.data;
    total.value = res.total || 0;
  } catch (error) {
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

const statusTagType = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'paid':
      return 'primary';
    case 'shipped':
      return 'info';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return '';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN');
};

const handleTabChange = () => {
  currentPage.value = 1;
  fetchOrders();
};

const handleSizeChange = () => {
  currentPage.value = 1;
  fetchOrders();
};

const handleCurrentChange = () => {
  fetchOrders();
};

const handlePay = async (order: Order) => {
  try {
    await ElMessageBox.confirm(`确定支付订单 ¥${order.actualAmount.toFixed(2)} 吗？`, '支付确认', {
      confirmButtonText: '确定支付',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await payOrder(order.id);
    ElMessage.success('支付成功');
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('支付失败');
    }
  }
};

const handleCancel = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定取消该订单吗？', '取消确认', {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'warning',
    });
    await cancelOrder(order.id);
    ElMessage.success('订单已取消');
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败');
    }
  }
};

const handleConfirm = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定已收到商品吗？', '确认收货', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await confirmOrder(order.id);
    ElMessage.success('已确认收货');
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

const handleReview = (order: Order) => {
  router.push({ path: '/member/reviews', query: { orderId: String(order.id) } });
};

const handleDetail = (order: Order) => {
  ElMessage.info(`订单详情功能开发中，订单号：${order.orderNo}`);
};

const goShopping = () => {
  router.push('/products');
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.orders-card {
  border: none !important;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.status-tabs {
  margin: 0;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  border: none !important;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.order-no {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.order-date {
  font-size: 13px;
  color: #999;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  color: #333;
  margin: 0 0 6px 0;
  font-weight: 500;
}

.item-spec {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.item-price {
  text-align: right;
  flex-shrink: 0;
}

.price-value {
  font-size: 16px;
  font-weight: 600;
  color: #c9a227;
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid #eee;
}

.order-amount {
  display: flex;
  align-items: center;
  gap: 16px;
}

.discount {
  font-size: 13px;
  color: #f56c6c;
}

.total {
  font-size: 14px;
  color: #666;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
  color: #c9a227;
  margin-left: 4px;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 60px 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

:deep(.el-button--primary) {
  background: #2d5a27;
  border-color: #2d5a27;
  border-radius: 20px;
}

:deep(.el-button--primary:hover) {
  background: #3d7a37;
  border-color: #3d7a37;
}

:deep(.el-tabs__item.is-active) {
  color: #2d5a27;
}

:deep(.el-tabs__active-bar) {
  background-color: #2d5a27;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).is-active) {
  background-color: #2d5a27;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>
