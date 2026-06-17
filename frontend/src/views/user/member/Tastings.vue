<template>
  <el-card class="tastings-card card-shadow">
    <template #header>
      <div class="card-header">
        <h3 class="card-title">
          <el-icon color="#2d5a27"><Calendar /></el-icon>
          品鉴会报名
        </h3>
        <el-button type="primary" size="small" @click="goBrowse">
          <el-icon><Plus /></el-icon>
          报名更多活动
        </el-button>
      </div>
    </template>

    <div v-loading="loading" class="registrations-list">
      <template v-if="registrations.length > 0">
        <el-card
          v-for="reg in registrations"
          :key="reg.id"
          class="registration-item card-shadow"
          @click="goDetail(reg.eventId)"
        >
          <div class="event-image-wrapper">
            <img
              :src="reg.event.image || defaultImage"
              :alt="reg.event.title"
              class="event-image"
            />
            <div class="event-status">
              <el-tag :type="eventStatusType(reg.event.status)" effect="dark" size="small">
                {{ TastingStatusMap[reg.event.status] }}
              </el-tag>
            </div>
          </div>
          <div class="event-info">
            <h4 class="event-title text-ellipsis">{{ reg.event.title }}</h4>
            <div class="event-meta">
              <div class="meta-item">
                <el-icon color="#2d5a27"><Calendar /></el-icon>
                <span>{{ formatDate(reg.event.eventDate) }}</span>
              </div>
              <div class="meta-item">
                <el-icon color="#2d5a27"><Location /></el-icon>
                <span class="text-ellipsis">{{ reg.event.location }}</span>
              </div>
              <div class="meta-item">
                <el-icon color="#2d5a27"><User /></el-icon>
                <span>{{ reg.event.currentParticipants }}/{{ reg.event.maxParticipants }}人</span>
              </div>
            </div>
            <div class="registration-info">
              <div class="reg-item">
                <span class="reg-label">报名状态：</span>
                <el-tag :type="regStatusType(reg.status)" effect="dark" size="small">
                  {{ RegistrationStatusMap[reg.status] }}
                </el-tag>
              </div>
              <div class="reg-item">
                <span class="reg-label">随行人数：</span>
                <span>{{ reg.guestsCount }} 人</span>
              </div>
              <div class="reg-item" v-if="reg.remark">
                <span class="reg-label">备注：</span>
                <span>{{ reg.remark }}</span>
              </div>
              <div class="reg-item">
                <span class="reg-label">报名时间：</span>
                <span>{{ formatDate(reg.createdAt) }}</span>
              </div>
            </div>
            <div class="event-actions" @click.stop>
              <el-button
                v-if="reg.status === 'pending' || reg.status === 'confirmed'"
                type="danger"
                size="small"
                @click="handleCancel(reg)"
              >
                取消报名
              </el-button>
              <el-button size="small" @click="goDetail(reg.eventId)">
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </template>

      <el-empty v-else description="暂无报名记录" class="empty-state">
        <el-button type="primary" @click="goBrowse">去报名</el-button>
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
import { getMyRegistrations, cancelRegistration } from '@/api/tasting';
import {
  TastingStatusMap,
  RegistrationStatusMap,
  type TastingRegistration,
  type TastingStatus,
  type RegistrationStatus,
} from '@/types';
import { Calendar, Plus, Location, User } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(false);
const registrations = ref<TastingRegistration[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const defaultImage = 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=200&h=150&fit=crop';

const fetchRegistrations = async () => {
  loading.value = true;
  try {
    const res = await getMyRegistrations({
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    registrations.value = res.data;
    total.value = res.total || 0;
  } catch (error) {
    ElMessage.error('获取报名记录失败');
  } finally {
    loading.value = false;
  }
};

const eventStatusType = (status: TastingStatus) => {
  switch (status) {
    case 'upcoming':
      return 'success';
    case 'ongoing':
      return 'primary';
    case 'completed':
      return 'info';
    case 'cancelled':
      return 'danger';
    default:
      return '';
  }
};

const regStatusType = (status: RegistrationStatus) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'attended':
      return 'primary';
    default:
      return '';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN');
};

const handleSizeChange = () => {
  currentPage.value = 1;
  fetchRegistrations();
};

const handleCurrentChange = () => {
  fetchRegistrations();
};

const handleCancel = async (reg: TastingRegistration) => {
  try {
    await ElMessageBox.confirm('确定取消该品鉴会报名吗？', '取消确认', {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'warning',
    });
    await cancelRegistration(reg.id);
    ElMessage.success('已取消报名');
    fetchRegistrations();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败');
    }
  }
};

const goBrowse = () => {
  router.push('/tastings');
};

const goDetail = (eventId: number) => {
  router.push(`/tastings/${eventId}`);
};

onMounted(() => {
  fetchRegistrations();
});
</script>

<style scoped>
.tastings-card {
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

.registrations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.registration-item {
  display: flex !important;
  gap: 20px;
  border: none !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.registration-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.event-image-wrapper {
  position: relative;
  width: 200px;
  height: 150px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-status {
  position: absolute;
  top: 10px;
  left: 10px;
}

.event-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.event-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.registration-info {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.reg-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
  color: #666;
}

.reg-label {
  color: #999;
  flex-shrink: 0;
}

.event-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: auto;
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

:deep(.el-button--danger) {
  border-radius: 20px;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).is-active) {
  background-color: #2d5a27;
}

@media (max-width: 768px) {
  .registration-item {
    flex-direction: column;
  }

  .event-image-wrapper {
    width: 100%;
    height: 180px;
  }

  .event-meta {
    flex-direction: column;
    gap: 8px;
  }

  .event-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
