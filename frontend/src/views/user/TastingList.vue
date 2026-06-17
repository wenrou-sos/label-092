<template>
  <div class="tasting-list-page">
    <Header />

    <main class="container main-content">
      <div class="page-header">
        <h1 class="page-title">
          <el-icon><CoffeeCup /></el-icon>
          品鉴会
        </h1>
        <p class="page-desc">参与线下品茶活动，与茶师面对面交流，感受茶文化的魅力</p>
      </div>

      <div class="filter-bar card-shadow">
        <div class="filter-tabs">
          <span class="filter-label">活动状态：</span>
          <div class="tab-items">
            <div
              class="tab-item"
              :class="{ active: selectedStatus === '' }"
              @click="handleStatusChange('')"
            >
              全部
            </div>
            <div
              v-for="(name, key) in statusFilterMap"
              :key="key"
              class="tab-item"
              :class="{ active: selectedStatus === key }"
              @click="handleStatusChange(key)"
            >
              {{ name }}
            </div>
          </div>
        </div>
        <div class="filter-result">
          共 <strong>{{ total }}</strong> 场活动
        </div>
      </div>

      <div v-loading="loading" class="event-grid">
        <div
          v-for="event in events"
          :key="event.id"
          class="event-card card-shadow"
        >
          <div class="event-image-wrapper">
            <el-image
              :src="event.image || getPlaceholderImage(event.title)"
              :alt="event.title"
              fit="cover"
              lazy
              class="event-image"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon size="48" color="#ccc"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <el-tag
              class="status-tag"
              :type="getStatusTagType(event.status)"
              effect="dark"
              size="small"
            >
              {{ TastingStatusMap[event.status] }}
            </el-tag>
          </div>

          <div class="event-info">
            <h3 class="event-title">{{ event.title }}</h3>

            <div class="event-meta">
              <div class="meta-item">
                <el-icon size="14"><Calendar /></el-icon>
                <span>{{ formatDate(event.eventDate) }}</span>
              </div>
              <div class="meta-item">
                <el-icon size="14"><Location /></el-icon>
                <span class="text-ellipsis">{{ event.location }}</span>
              </div>
              <div class="meta-item">
                <el-icon size="14"><User /></el-icon>
                <span>{{ event.currentParticipants }}/{{ event.maxParticipants }}人</span>
              </div>
              <div class="meta-item">
                <el-icon size="14"><Star /></el-icon>
                <span>茶师：{{ event.host }}</span>
              </div>
            </div>

            <div class="event-footer">
              <div class="participants-progress">
                <el-progress
                  :percentage="Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)"
                  :show-text="false"
                  :stroke-width="6"
                  :color="getProgressColor(event)"
                />
                <span class="progress-text">
                  {{ event.currentParticipants >= event.maxParticipants ? '已满员' : `剩余${event.maxParticipants - event.currentParticipants}个名额` }}
                </span>
              </div>
              <div class="action-buttons">
                <el-button
                  size="small"
                  @click="goToDetail(event.id)"
                >
                  查看详情
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  :disabled="event.status === 'completed' || event.status === 'cancelled' || event.currentParticipants >= event.maxParticipants"
                  @click.stop="handleRegister(event)"
                >
                  立即报名
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && events.length === 0" description="暂无符合条件的品鉴会活动" />

      <div v-if="total > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[6, 9, 12, 18]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  CoffeeCup,
  Calendar,
  Location,
  User,
  Star,
  Picture,
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import Header from '@/components/user/Header.vue';
import Footer from '@/components/user/Footer.vue';
import { getEvents, registerEvent } from '@/api/tasting';
import { useUserStore } from '@/stores/user';
import type { TastingEvent, TastingStatus } from '@/types';
import { TastingStatusMap } from '@/types';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const events = ref<TastingEvent[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(6);
const selectedStatus = ref<TastingStatus | ''>('');

const statusFilterMap: Record<string, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  completed: '已结束',
};

const fetchEvents = async () => {
  loading.value = true;
  try {
    const params = {
      status: selectedStatus.value || undefined,
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    const res = await getEvents(params);
    events.value = res.data;
    total.value = res.total || 0;
  } catch (error) {
    ElMessage.error('获取品鉴会列表失败');
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

const getPlaceholderImage = (title: string) => {
  return `https://via.placeholder.com/400x250/2d5a27/ffffff?text=${encodeURIComponent(title)}`;
};

const getStatusTagType = (status: TastingStatus): string => {
  const types: Record<TastingStatus, string> = {
    upcoming: 'warning',
    ongoing: 'success',
    completed: 'info',
    cancelled: 'danger',
  };
  return types[status];
};

const getProgressColor = (event: TastingEvent) => {
  const ratio = event.currentParticipants / event.maxParticipants;
  if (ratio >= 1) return '#f56c6c';
  if (ratio >= 0.8) return '#e6a23c';
  return '#67c23a';
};

const handleStatusChange = (status: TastingStatus | '') => {
  selectedStatus.value = status;
  currentPage.value = 1;
  fetchEvents();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchEvents();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchEvents();
};

const goToDetail = (id: number) => {
  router.push(`/tastings/${id}`);
};

const handleRegister = async (event: TastingEvent) => {
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录后再报名', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        router.push({ name: 'login', query: { redirect: `/tastings/${event.id}` } });
      })
      .catch(() => {});
    return;
  }

  try {
    await registerEvent(event.id);
    ElMessage.success('报名成功！');
    fetchEvents();
  } catch (error: any) {
    ElMessage.error(error.message || '报名失败');
  }
};

onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
.tasting-list-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 40px;
}

.page-header {
  padding: 30px 0 20px;
  text-align: center;
}

.page-header .page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 28px;
  margin-bottom: 8px;
}

.page-desc {
  color: #666;
  font-size: 14px;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-label {
  color: #666;
  font-size: 14px;
}

.tab-items {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tab-item {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-item:hover {
  background: #f5f5f5;
  color: #2d5a27;
}

.tab-item.active {
  background: #2d5a27;
  color: #fff;
}

.filter-result {
  font-size: 14px;
  color: #666;
}

.filter-result strong {
  color: #2d5a27;
  font-size: 18px;
  margin: 0 4px;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  min-height: 400px;
}

.event-card {
  overflow: hidden;
  background: #fff;
  transition: all 0.3s;
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.event-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
}

.event-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.status-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  font-weight: 500;
}

.event-info {
  padding: 20px;
}

.event-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  line-height: 1.4;
  min-height: 50px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.event-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.participants-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.participants-progress .el-progress {
  flex: 1;
}

.progress-text {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .event-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-result {
    text-align: center;
  }

  .event-title {
    font-size: 16px;
    min-height: 44px;
  }
}
</style>
