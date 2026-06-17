<template>
  <div class="admin-orders">
    <el-card class="orders-card card-shadow">
      <template #header>
        <div class="card-header">
          <h3 class="card-title">
            <el-icon color="#2d5a27"><List /></el-icon>
            订单管理
          </h3>
        </div>
      </template>

      <div class="filter-bar">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="订单状态">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 150px">
              <el-option label="待支付" value="pending" />
              <el-option label="已支付" value="paid" />
              <el-option label="已发货" value="shipped" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          <el-form-item label="搜索">
            <el-input
              v-model="filterForm.keyword"
              placeholder="订单号/会员/商品"
              clearable
              style="width: 250px"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Filter /></el-icon>
              筛选
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-loading="loading" class="table-wrapper">
        <el-table :data="filteredOrders" border stripe style="width: 100%">
          <el-table-column prop="orderNo" label="订单号" width="180" />
          <el-table-column prop="memberName" label="会员" width="120">
            <template #default="{ row }">
              <span>{{ getMemberName(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="items" label="商品" min-width="200">
            <template #default="{ row }">
              <div class="product-list">
                <span v-for="(item, index) in row.items" :key="item.id" class="product-name">
                  {{ index > 0 ? '、' : '' }}{{ item.productName }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="actualAmount" label="金额" width="120">
            <template #default="{ row }">
              <span class="amount">¥{{ row.actualAmount.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" effect="dark" size="small">
                {{ OrderStatusMap[row.status] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="170">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="handleDetail(row)">
                详情
              </el-button>
              <el-button
                v-if="row.status !== 'completed' && row.status !== 'cancelled'"
                size="small"
                type="success"
                link
                @click="handleUpdateStatus(row)"
              >
                {{ getNextStatusText(row.status) }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="filteredOrders.length === 0 && !loading" description="暂无订单数据" class="empty-state" />
      </div>

      <div v-if="total > pageSize" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusTagType(currentOrder.status)" effect="dark" size="small">
              {{ OrderStatusMap[currentOrder.status] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="会员">{{ getMemberName(currentOrder) }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentOrder.contactName }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ currentOrder.shippingAddress }}</el-descriptions-item>
          <el-descriptions-item label="商品金额">¥{{ currentOrder.totalAmount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="优惠金额">¥{{ currentOrder.discountAmount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="实付金额" class="highlight">
            <span class="amount">¥{{ currentOrder.actualAmount.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.paidAt" label="支付时间">
            {{ formatDate(currentOrder.paidAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.shippedAt" label="发货时间">
            {{ formatDate(currentOrder.shippedAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.completedAt" label="完成时间">
            {{ formatDate(currentOrder.completedAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.remark" label="备注" :span="2">
            {{ currentOrder.remark }}
          </el-descriptions-item>
        </el-descriptions>

        <h4 class="items-title">商品列表</h4>
        <el-table :data="currentOrder.items" border style="width: 100%">
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="packageType" label="包装类型" width="100">
            <template #default="{ row }">
              {{ PackageTypeMap[row.packageType] }}
            </template>
          </el-table-column>
          <el-table-column prop="weight" label="规格" width="80">
            <template #default="{ row }">{{ row.weight }}g</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="60" />
          <el-table-column prop="unitPrice" label="单价" width="90">
            <template #default="{ row }">¥{{ row.unitPrice.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" width="100">
            <template #default="{ row }">¥{{ row.subtotal.toFixed(2) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentOrder && currentOrder.status !== 'completed' && currentOrder.status !== 'cancelled'"
          type="primary"
          @click="handleUpdateStatus(currentOrder)"
        >
          {{ getNextStatusText(currentOrder.status) }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getOrders, updateOrderStatus } from '@/api/order';
import { OrderStatusMap, PackageTypeMap, type Order, type OrderStatus } from '@/types';
import { List, Search, Filter, Refresh } from '@element-plus/icons-vue';

const loading = ref(false);
const orders = ref<Order[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const filterForm = reactive({
  status: '',
  keyword: '',
});

const detailDialogVisible = ref(false);
const currentOrder = ref<Order | null>(null);

const filteredOrders = computed(() => {
  let result = [...orders.value];
  
  if (filterForm.keyword) {
    const keyword = filterForm.keyword.toLowerCase();
    result = result.filter(order => {
      const orderNoMatch = order.orderNo.toLowerCase().includes(keyword);
      const itemMatch = order.items.some(item => 
        item.productName.toLowerCase().includes(keyword)
      );
      return orderNoMatch || itemMatch;
    });
  }
  
  return result;
});

const fetchOrders = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    if (filterForm.status) {
      params.status = filterForm.status;
    }
    const res = await getOrders(params);
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

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

const getMemberName = (order: Order) => {
  return order.contactName || order.contactPhone || '未知';
};

const getNextStatus = (status: OrderStatus): OrderStatus | null => {
  switch (status) {
    case 'pending':
      return 'paid';
    case 'paid':
      return 'shipped';
    case 'shipped':
      return 'completed';
    default:
      return null;
  }
};

const getNextStatusText = (status: OrderStatus) => {
  const next = getNextStatus(status);
  if (!next) return '';
  const textMap: Record<string, string> = {
    paid: '标记已支付',
    shipped: '标记已发货',
    completed: '标记已完成',
  };
  return textMap[next] || '';
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchOrders();
};

const handleReset = () => {
  filterForm.status = '';
  filterForm.keyword = '';
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

const handleDetail = (order: Order) => {
  currentOrder.value = order;
  detailDialogVisible.value = true;
};

const handleUpdateStatus = async (order: Order) => {
  const nextStatus = getNextStatus(order.status);
  if (!nextStatus) return;

  const statusTextMap: Record<string, string> = {
    paid: '支付',
    shipped: '发货',
    completed: '完成',
  };

  try {
    await ElMessageBox.confirm(
      `确定将订单 ${order.orderNo} 标记为${OrderStatusMap[nextStatus]}吗？`,
      `${statusTextMap[nextStatus]}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await updateOrderStatus(order.id, nextStatus);
    ElMessage.success(`订单已${statusTextMap[nextStatus]}`);
    fetchOrders();
    
    if (detailDialogVisible.value && currentOrder.value?.id === order.id) {
      currentOrder.value = { ...currentOrder.value, status: nextStatus };
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.admin-orders {
  padding: 20px;
}

.orders-card {
  border: none !important;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.filter-bar {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.filter-form {
  margin: 0;
}

.table-wrapper {
  min-height: 300px;
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.product-name {
  font-size: 13px;
  color: #333;
}

.amount {
  font-weight: 600;
  color: #c9a227;
}

.empty-state {
  padding: 60px 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.order-detail {
  padding: 10px 0;
}

.items-title {
  margin: 24px 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.highlight {
  color: #c9a227;
}

.highlight .amount {
  font-size: 16px;
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

:deep(.el-pagination.is-background .el-pager li:not(.disabled).is-active) {
  background-color: #2d5a27;
}

:deep(.el-table .el-table__cell) {
  padding: 10px 12px;
}
</style>
