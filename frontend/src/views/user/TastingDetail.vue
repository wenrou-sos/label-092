<template>
  <div class="tasting-detail-page">
    <Header />

    <main class="main-content">
      <div v-loading="loading" class="detail-wrapper">
        <div class="banner-section">
          <div class="banner-image">
            <img
              :src="event?.image || getPlaceholderImage(event?.title || '')"
              :alt="event?.title"
              class="banner-img"
            />
            <div class="banner-overlay">
              <div class="container banner-content">
                <el-tag
                  class="status-tag"
                  :type="getStatusTagType(event?.status || 'upcoming')"
                  effect="dark"
                  size="large"
                >
                  {{ TastingStatusMap[event?.status || 'upcoming'] }}
                </el-tag>
                <h1 class="event-title">{{ event?.title }}</h1>
                <div class="event-brief">
                  <div class="brief-item">
                    <el-icon size="18"><Calendar /></el-icon>
                    <span>{{ formatDateTime(event?.eventDate || '') }}</span>
                  </div>
                  <div class="brief-item">
                    <el-icon size="18"><Location /></el-icon>
                    <span>{{ event?.location }}</span>
                  </div>
                  <div class="brief-item">
                    <el-icon size="18"><User /></el-icon>
                    <span>{{ event?.currentParticipants }}/{{ event?.maxParticipants }}人</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="container detail-container">
          <div class="detail-layout">
            <div class="detail-main">
              <div class="card-shadow info-card">
                <div class="card-header">
                  <h3 class="card-title">
                    <el-icon><InfoFilled /></el-icon>
                    活动介绍
                  </h3>
                </div>
                <div class="card-body">
                  <div class="description-text">{{ event?.description }}</div>
                </div>
              </div>

              <div class="card-shadow info-card">
                <div class="card-header">
                  <h3 class="card-title">
                    <el-icon><CoffeeCup /></el-icon>
                    品鉴茶品
                  </h3>
                </div>
                <div class="card-body">
                  <div class="tea-list">
                    <div
                      v-for="(tea, idx) in teaList"
                      :key="idx"
                      class="tea-item"
                    >
                      <div class="tea-number">{{ idx + 1 }}</div>
                      <div class="tea-name">{{ tea }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-shadow info-card">
                <div class="card-header">
                  <h3 class="card-title">
                    <el-icon><Avatar /></el-icon>
                    茶师介绍
                  </h3>
                </div>
                <div class="card-body">
                  <div class="host-profile">
                    <div class="host-avatar">
                      <el-avatar :size="80" :icon="UserFilled" />
                    </div>
                    <div class="host-info">
                      <h4 class="host-name">{{ event?.host }}</h4>
                      <p class="host-title">资深评茶师</p>
                      <p class="host-desc">
                        从事茶叶审评工作多年，精通六大茶类品鉴技艺，
                        拥有丰富的茶文化传播经验，致力于让更多人了解和爱上中国茶文化。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-shadow info-card">
                <div class="card-header">
                  <h3 class="card-title">
                    <el-icon><UserFilled /></el-icon>
                    已报名用户
                    <el-tag size="small" type="info" class="count-tag">
                      {{ registrationTotal }}人
                    </el-tag>
                  </h3>
                </div>
                <div class="card-body">
                  <div v-loading="registrationsLoading" class="registrations-list">
                    <div v-if="registrations.length === 0" class="empty-registrations">
                      <el-empty description="暂无报名用户" :image-size="80" />
                    </div>
                    <div v-else class="registrations-grid">
                      <div
                        v-for="reg in registrations"
                        :key="reg.id"
                        class="registration-item"
                      >
                        <el-avatar :size="40" :icon="UserFilled" />
                        <div class="reg-info">
                          <span class="reg-name">{{ getMemberName(reg.memberId) }}</span>
                          <span class="reg-status">
                            <el-tag :type="getRegStatusTagType(reg.status)" size="small">
                              {{ RegistrationStatusMap[reg.status] }}
                            </el-tag>
                          </span>
                        </div>
                        <span class="reg-guests" v-if="reg.guestsCount > 0">
                          +{{ reg.guestsCount }}人随行
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-if="registrationTotal > pageSize" class="pagination-wrapper">
                    <el-pagination
                      v-model:current-page="registrationPage"
                      v-model:page-size="pageSize"
                      :total="registrationTotal"
                      layout="prev, pager, next"
                      background
                      small
                      @current-change="loadRegistrations"
                    />
                  </div>
                </div>
              </div>
            </div>

            <aside class="detail-sidebar">
              <div class="card-shadow register-card">
                <div class="register-header">
                  <h3 class="register-title">
                    <el-icon><Edit /></el-icon>
                    立即报名
                  </h3>
                </div>
                <div class="register-body">
                  <div class="register-info">
                    <div class="info-row">
                      <span class="info-label">活动时间</span>
                      <span class="info-value">{{ formatDateTime(event?.eventDate || '') }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">活动地点</span>
                      <span class="info-value">{{ event?.location }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">名额情况</span>
                      <span class="info-value">
                        <span
                          :class="{ 'text-warning': (event?.currentParticipants || 0) >= (event?.maxParticipants || 0) }"
                        >
                          {{ event?.currentParticipants }}/{{ event?.maxParticipants }}人
                        </span>
                      </span>
                    </div>
                  </div>

                  <el-form
                    ref="formRef"
                    :model="formData"
                    :rules="formRules"
                    label-position="top"
                    class="register-form"
                  >
                    <el-form-item label="参会人数" prop="guestsCount">
                      <el-input-number
                        v-model="formData.guestsCount"
                        :min="0"
                        :max="10"
                        size="large"
                        class="w-full"
                      />
                      <div class="form-tip">包含您本人，可额外携带随行人员</div>
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                      <el-input
                        v-model="formData.remark"
                        type="textarea"
                        :rows="3"
                        placeholder="如有特殊需求请在此说明..."
                        maxlength="200"
                        show-word-limit
                      />
                    </el-form-item>
                  </el-form>

                  <el-button
                    type="primary"
                    size="large"
                    class="register-btn"
                    :loading="registerLoading"
                    :disabled="!canRegister"
                    @click="handleSubmit"
                  >
                    <el-icon><Check /></el-icon>
                    {{ getButtonText() }}
                  </el-button>

                  <div v-if="!canRegister" class="register-tip">
                    <el-icon color="#e6a23c"><Warning /></el-icon>
                    <span>{{ getDisableReason() }}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import {
  Calendar,
  Location,
  User,
  InfoFilled,
  CoffeeCup,
  Avatar,
  UserFilled,
  Edit,
  Check,
  Warning,
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import Header from '@/components/user/Header.vue';
import Footer from '@/components/user/Footer.vue';
import {
  getEventById,
  registerEvent,
  getEventRegistrations,
} from '@/api/tasting';
import { useUserStore } from '@/stores/user';
import type {
  TastingEvent,
  TastingStatus,
  TastingRegistration,
  RegistrationStatus,
} from '@/types';
import { TastingStatusMap, RegistrationStatusMap } from '@/types';

const route = useRoute();
const userStore = useUserStore();
const formRef = ref<FormInstance>();

const loading = ref(false);
const registrationsLoading = ref(false);
const registerLoading = ref(false);
const event = ref<TastingEvent | null>(null);
const registrations = ref<TastingRegistration[]>([]);
const registrationTotal = ref(0);
const registrationPage = ref(1);
const pageSize = ref(8);

const formData = ref({
  guestsCount: 0,
  remark: '',
});

const formRules: FormRules = {
  guestsCount: [
    {
      validator: (_, value, callback) => {
        if (value < 0 || value > 10) {
          callback(new Error('随行人数需在0-10之间'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  remark: [
    { max: 200, message: '备注不能超过200字', trigger: 'blur' },
  ],
};

const teaList = computed(() => {
  if (!event.value?.teaList) return [];
  try {
    const parsed = JSON.parse(event.value.teaList);
    return Array.isArray(parsed) ? parsed : [event.value.teaList];
  } catch {
    return event.value.teaList.split(/[,，、]/).filter(Boolean);
  }
});

const canRegister = computed(() => {
  if (!event.value) return false;
  if (event.value.status === 'completed' || event.value.status === 'cancelled') return false;
  if (event.value.currentParticipants >= event.value.maxParticipants) return false;
  return true;
});

const loadEvent = async () => {
  const id = route.params.id as string;
  if (!id) return;

  loading.value = true;
  try {
    const res = await getEventById(Number(id));
    event.value = res;
  } catch (error: any) {
    ElMessage.error(error.message || '加载活动详情失败');
  } finally {
    loading.value = false;
  }
};

const loadRegistrations = async () => {
  const id = route.params.id as string;
  if (!id) return;

  registrationsLoading.value = true;
  try {
    const res = await getEventRegistrations(Number(id), {
      page: registrationPage.value,
      pageSize: pageSize.value,
    });
    registrations.value = res.data;
    registrationTotal.value = res.total || 0;
  } catch (error) {
    ElMessage.error('加载报名列表失败');
  } finally {
    registrationsLoading.value = false;
  }
};

const formatDateTime = (date: string) => {
  return dayjs(date).format('YYYY年MM月DD日 HH:mm');
};

const getPlaceholderImage = (title: string) => {
  return `https://via.placeholder.com/1200x400/2d5a27/ffffff?text=${encodeURIComponent(title)}`;
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

const getRegStatusTagType = (status: RegistrationStatus): string => {
  const types: Record<RegistrationStatus, string> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'info',
    attended: '',
  };
  return types[status];
};

const getMemberName = (memberId: number) => {
  return `会员${memberId}`;
};

const getButtonText = () => {
  if (!userStore.isLoggedIn) return '请先登录';
  if (!event.value) return '报名';
  if (event.value.currentParticipants >= event.value.maxParticipants) return '名额已满';
  return '确认报名';
};

const getDisableReason = () => {
  if (!event.value) return '';
  if (event.value.status === 'completed') return '该活动已结束';
  if (event.value.status === 'cancelled') return '该活动已取消';
  if (event.value.currentParticipants >= event.value.maxParticipants) return '报名名额已满';
  return '';
};

const handleSubmit = async () => {
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录后再报名', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        window.location.href = `/login?redirect=${encodeURIComponent(route.fullPath)}`;
      })
      .catch(() => {});
    return;
  }

  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid || !event.value) return;

    registerLoading.value = true;
    try {
      await registerEvent(event.value.id, {
        guestsCount: formData.value.guestsCount,
        remark: formData.value.remark || undefined,
      });
      ElMessage.success('报名成功！');
      formData.value = { guestsCount: 0, remark: '' };
      loadEvent();
      loadRegistrations();
    } catch (error: any) {
      ElMessage.error(error.message || '报名失败');
    } finally {
      registerLoading.value = false;
    }
  });
};

onMounted(() => {
  loadEvent();
  loadRegistrations();
});
</script>

<style scoped>
.tasting-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.main-content {
  flex: 1;
}

.detail-wrapper {
  min-height: 400px;
}

.banner-section {
  position: relative;
}

.banner-image {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  align-items: flex-end;
}

.banner-content {
  padding-bottom: 40px;
  color: #fff;
}

.status-tag {
  margin-bottom: 16px;
}

.event-title {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 16px;
  line-height: 1.3;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.event-brief {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.brief-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  opacity: 0.95;
}

.detail-container {
  padding: 30px 20px;
}

.detail-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.detail-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  background: #fff;
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2d5a27;
  margin: 0;
}

.count-tag {
  margin-left: 12px;
}

.card-body {
  padding: 24px;
}

.description-text {
  font-size: 15px;
  line-height: 2;
  color: #555;
  white-space: pre-wrap;
}

.tea-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.tea-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #2d5a27;
}

.tea-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2d5a27;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.tea-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.host-profile {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.host-avatar {
  flex-shrink: 0;
}

.host-avatar :deep(.el-avatar) {
  background: linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%);
}

.host-info {
  flex: 1;
}

.host-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.host-title {
  font-size: 14px;
  color: #2d5a27;
  margin: 0 0 12px;
}

.host-desc {
  font-size: 14px;
  line-height: 1.8;
  color: #666;
  margin: 0;
}

.registrations-list {
  min-height: 100px;
}

.empty-registrations {
  padding: 20px 0;
}

.registrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.registration-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
}

.registration-item :deep(.el-avatar) {
  background: #2d5a27;
}

.reg-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.reg-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.reg-guests {
  font-size: 12px;
  color: #999;
}

.detail-sidebar {
  width: 360px;
  flex-shrink: 0;
  position: sticky;
  top: 90px;
}

.register-card {
  background: #fff;
  overflow: hidden;
}

.register-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%);
}

.register-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.register-body {
  padding: 24px;
}

.register-info {
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  font-size: 14px;
}

.info-label {
  color: #999;
  flex-shrink: 0;
}

.info-value {
  color: #333;
  text-align: right;
  flex: 1;
}

.info-value .text-warning {
  color: #e6a23c;
  font-weight: 600;
}

.register-form {
  margin-bottom: 20px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

.register-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 24px;
}

.register-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
  color: #e6a23c;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.w-full {
  width: 100%;
}

@media (max-width: 1024px) {
  .detail-layout {
    flex-direction: column;
  }

  .detail-sidebar {
    width: 100%;
    position: static;
  }
}

@media (max-width: 768px) {
  .banner-image {
    height: 300px;
  }

  .event-title {
    font-size: 24px;
  }

  .event-brief {
    gap: 16px;
  }

  .brief-item {
    font-size: 14px;
  }

  .detail-container {
    padding: 20px 15px;
  }

  .card-header {
    padding: 16px 20px;
  }

  .card-body {
    padding: 20px;
  }

  .host-profile {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .registrations-grid {
    grid-template-columns: 1fr;
  }

  .tea-list {
    grid-template-columns: 1fr;
  }
}
</style>
