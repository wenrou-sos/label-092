<template>
  <div class="members-page">
    <el-card class="filter-card">
      <div class="filter-form">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索姓名/手机号"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filterLevel"
          placeholder="会员等级"
          clearable
          class="level-select"
          @change="handleSearch"
        >
          <el-option
            v-for="(label, value) in MemberLevelMap"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
    </el-card>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="members"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column prop="level" label="等级" min-width="120">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.level)" effect="light">
              {{ MemberLevelMap[row.level] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalSpent" label="累计消费" min-width="120">
          <template #default="{ row }">
            <span class="amount-text">¥{{ row.totalSpent.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" min-width="100" />
        <el-table-column prop="birthday" label="生日" min-width="120">
          <template #default="{ row }">
            {{ row.birthday || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
      title="会员详情"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading" class="member-detail">
        <el-descriptions :column="3" border class="member-info">
          <el-descriptions-item label="姓名">
            {{ currentMember?.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentMember?.phone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="会员等级">
            <el-tag v-if="currentMember" :type="levelTagType(currentMember.level)" effect="light">
              {{ MemberLevelMap[currentMember.level] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="累计消费">
            <span class="amount-text">
              ¥{{ currentMember?.totalSpent?.toFixed(2) || '0.00' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="当前积分">
            {{ currentMember?.points || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="会员折扣">
            {{ currentMember?.discount ? `${(currentMember.discount * 10).toFixed(1)}折` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="生日">
            {{ currentMember?.birthday || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            {{ formatDate(currentMember?.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">订单记录</el-divider>

        <el-table
          :data="memberOrders"
          border
          stripe
          style="width: 100%"
          empty-text="暂无订单记录"
        >
          <el-table-column prop="orderNo" label="订单号" min-width="180" />
          <el-table-column prop="totalAmount" label="订单金额" min-width="120">
            <template #default="{ row }">
              <span>¥{{ row.totalAmount?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="discountAmount" label="优惠金额" min-width="120">
            <template #default="{ row }">
              <span class="discount-text">-¥{{ row.discountAmount?.toFixed(2) || '0.00' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="actualAmount" label="实付金额" min-width="120">
            <template #default="{ row }">
              <span class="amount-text">¥{{ row.actualAmount?.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="orderStatusTagType(row.status)" effect="light" size="small">
                {{ OrderStatusMap[row.status] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="下单时间" min-width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import { getMembers, getMemberById } from '@/api/member';
import {
  MemberLevelMap,
  OrderStatusMap,
  type Member,
  type Order,
  type MemberLevel,
  type OrderStatus
} from '@/types';

const loading = ref(false);
const detailLoading = ref(false);
const members = ref<Member[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchKeyword = ref('');
const filterLevel = ref<MemberLevel | ''>('');
const detailDialogVisible = ref(false);
const currentMember = ref<Member | null>(null);
const memberOrders = ref<Order[]>([]);

const fetchMembers = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }
    if (filterLevel.value) {
      params.level = filterLevel.value;
    }
    const res = await getMembers(params);
    members.value = res.data;
    total.value = res.total || 0;
  } catch (error) {
    ElMessage.error('获取会员列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchMembers();
};

const handleReset = () => {
  searchKeyword.value = '';
  filterLevel.value = '';
  currentPage.value = 1;
  fetchMembers();
};

const handleSizeChange = () => {
  currentPage.value = 1;
  fetchMembers();
};

const handleCurrentChange = () => {
  fetchMembers();
};

const handleViewDetail = async (row: Member) => {
  detailDialogVisible.value = true;
  detailLoading.value = true;
  currentMember.value = null;
  memberOrders.value = [];
  try {
    const res = await getMemberById(row.id);
    currentMember.value = res;
    memberOrders.value = res.orders || [];
  } catch (error) {
    ElMessage.error('获取会员详情失败');
  } finally {
    detailLoading.value = false;
  }
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

const levelTagType = (level: MemberLevel) => {
  switch (level) {
    case 'normal':
      return 'info';
    case 'silver':
      return '';
    case 'gold':
      return 'warning';
    case 'diamond':
      return 'success';
    default:
      return '';
  }
};

const orderStatusTagType = (status: OrderStatus) => {
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

onMounted(() => {
  fetchMembers();
});
</script>

<style scoped>
.members-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card {
  border: none !important;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.level-select {
  width: 160px;
}

.table-card {
  border: none !important;
}

.amount-text {
  color: #c9a227;
  font-weight: 600;
}

.discount-text {
  color: #f56c6c;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.member-detail {
  padding: 8px 0;
}

.member-info {
  margin-bottom: 16px;
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

:deep(.el-descriptions__label) {
  width: 100px;
}
</style>
