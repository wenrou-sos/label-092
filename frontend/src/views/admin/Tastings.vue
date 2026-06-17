<template>
  <div class="admin-tastings-page">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><CoffeeCup /></el-icon>
        品鉴会管理
      </h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增品鉴会
      </el-button>
    </div>

    <div class="filter-bar card-shadow">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="活动状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable @change="handleFilter">
            <el-option label="即将开始" value="upcoming" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container card-shadow">
      <el-table v-loading="loading" :data="events" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="eventDate" label="时间" width="180" :formatter="formatDate" />
        <el-table-column prop="location" label="地点" min-width="180" show-overflow-tooltip />
        <el-table-column label="报名人数" width="120" align="center">
          <template #default="{ row }">
            <span>{{ row.currentParticipants }}/{{ row.maxParticipants }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="dark" size="small">
              {{ TastingStatusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewRegistrations(row)">
              <el-icon><User /></el-icon>
              报名列表
            </el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="total > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="eventDialogVisible"
      :title="isEdit ? '编辑品鉴会' : '新增品鉴会'"
      width="700px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form
        ref="eventFormRef"
        :model="eventForm"
        :rules="eventRules"
        label-width="100px"
      >
        <el-form-item label="活动图片" prop="image">
          <el-upload
            class="image-uploader"
            :show-file-list="false"
            :http-request="handleImageUpload"
            accept="image/*"
          >
            <img v-if="eventForm.image" :src="eventForm.image" class="uploaded-image" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸 800x500，支持 JPG、PNG 格式</div>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="eventForm.title" placeholder="请输入品鉴会标题" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="eventForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入品鉴会详细描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="时间" prop="eventDate">
          <el-date-picker
            v-model="eventForm.eventDate"
            type="datetime"
            placeholder="选择活动时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="地点" prop="location">
          <el-input v-model="eventForm.location" placeholder="请输入活动地点" />
        </el-form-item>

        <el-form-item label="最大人数" prop="maxParticipants">
          <el-input-number v-model="eventForm.maxParticipants" :min="1" :max="200" />
        </el-form-item>

        <el-form-item label="茶品列表" prop="teaList">
          <el-input
            v-model="eventForm.teaList"
            type="textarea"
            :rows="3"
            placeholder="请输入本次品鉴的茶品列表，多个茶品用逗号分隔"
          />
        </el-form-item>

        <el-form-item label="茶师介绍" prop="host">
          <el-input v-model="eventForm.host" placeholder="请输入茶师姓名及介绍" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="eventDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="registrationDialogVisible"
      title="报名列表"
      width="800px"
    >
      <div class="registration-header">
        <h3>{{ currentEvent?.title }}</h3>
        <el-tag size="small">共 {{ registrations.length }} 人报名</el-tag>
      </div>
      <el-table v-loading="registrationsLoading" :data="registrations" border stripe>
        <el-table-column prop="id" label="报名ID" width="80" align="center" />
        <el-table-column prop="memberId" label="会员ID" width="100" align="center" />
        <el-table-column prop="guestsCount" label="随行人数" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getRegistrationTagType(row.status)" size="small">
              {{ RegistrationStatusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="报名时间" width="180" :formatter="formatDateTime" />
      </el-table>
      <el-empty v-if="!registrationsLoading && registrations.length === 0" description="暂无报名记录" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type UploadRequestOptions } from 'element-plus';
import {
  CoffeeCup,
  Plus,
  User,
  Edit,
  Delete,
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
} from '@/api/tasting';
import { uploadImage } from '@/api/admin';
import type {
  TastingEvent,
  TastingStatus,
  TastingRegistration,
  RegistrationStatus,
} from '@/types';
import { TastingStatusMap, RegistrationStatusMap } from '@/types';

const loading = ref(false);
const submitting = ref(false);
const registrationsLoading = ref(false);
const events = ref<TastingEvent[]>([]);
const registrations = ref<TastingRegistration[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const eventDialogVisible = ref(false);
const registrationDialogVisible = ref(false);
const isEdit = ref(false);
const currentEvent = ref<TastingEvent | null>(null);
const eventFormRef = ref<FormInstance>();

const filterForm = reactive({
  status: '' as TastingStatus | '',
});

const eventForm = reactive<Partial<TastingEvent>>({
  title: '',
  description: '',
  eventDate: '',
  location: '',
  maxParticipants: 20,
  teaList: '',
  host: '',
  image: '',
  status: 'upcoming' as TastingStatus,
});

const eventRules = {
  title: [{ required: true, message: '请输入品鉴会标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入品鉴会描述', trigger: 'blur' }],
  eventDate: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  maxParticipants: [{ required: true, message: '请输入最大人数', trigger: 'blur' }],
  teaList: [{ required: true, message: '请输入茶品列表', trigger: 'blur' }],
  host: [{ required: true, message: '请输入茶师介绍', trigger: 'blur' }],
};

const fetchEvents = async () => {
  loading.value = true;
  try {
    const params = {
      status: filterForm.status || undefined,
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

const formatDate = (row: TastingEvent) => {
  return dayjs(row.eventDate).format('YYYY-MM-DD HH:mm');
};

const formatDateTime = (row: TastingRegistration) => {
  return dayjs(row.createdAt).format('YYYY-MM-DD HH:mm:ss');
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

const getRegistrationTagType = (status: RegistrationStatus): string => {
  const types: Record<RegistrationStatus, string> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'info',
    attended: 'primary',
  };
  return types[status];
};

const handleFilter = () => {
  currentPage.value = 1;
  fetchEvents();
};

const handleReset = () => {
  filterForm.status = '';
  currentPage.value = 1;
  fetchEvents();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchEvents();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchEvents();
};

const handleAdd = () => {
  isEdit.value = false;
  Object.assign(eventForm, {
    title: '',
    description: '',
    eventDate: '',
    location: '',
    maxParticipants: 20,
    teaList: '',
    host: '',
    image: '',
    status: 'upcoming' as TastingStatus,
  });
  eventDialogVisible.value = true;
};

const handleEdit = (row: TastingEvent) => {
  isEdit.value = true;
  currentEvent.value = row;
  Object.assign(eventForm, {
    id: row.id,
    title: row.title,
    description: row.description,
    eventDate: row.eventDate,
    location: row.location,
    maxParticipants: row.maxParticipants,
    teaList: row.teaList,
    host: row.host,
    image: row.image,
    status: row.status,
  });
  eventDialogVisible.value = true;
};

const handleDelete = (row: TastingEvent) => {
  ElMessageBox.confirm(
    `确定要删除品鉴会"${row.title}"吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await deleteEvent(row.id);
        ElMessage.success('删除成功');
        fetchEvents();
      } catch (error: any) {
        ElMessage.error(error.message || '删除失败');
      }
    })
    .catch(() => {});
};

const handleImageUpload = async (options: UploadRequestOptions) => {
  try {
    const res = await uploadImage('tasting', options.file);
    eventForm.image = res.url;
    ElMessage.success('图片上传成功');
  } catch (error: any) {
    ElMessage.error(error.message || '图片上传失败');
  }
};

const handleSubmit = async () => {
  if (!eventFormRef.value) return;
  await eventFormRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      if (isEdit.value && eventForm.id) {
        await updateEvent(eventForm.id, eventForm);
        ElMessage.success('更新成功');
      } else {
        await createEvent(eventForm);
        ElMessage.success('创建成功');
      }
      eventDialogVisible.value = false;
      fetchEvents();
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败');
    } finally {
      submitting.value = false;
    }
  });
};

const handleDialogClosed = () => {
  eventFormRef.value?.resetFields();
};

const handleViewRegistrations = async (row: TastingEvent) => {
  currentEvent.value = row;
  registrationDialogVisible.value = true;
  registrationsLoading.value = true;
  try {
    const res = await getEventRegistrations(row.id);
    registrations.value = res.data;
  } catch (error) {
    ElMessage.error('获取报名列表失败');
  } finally {
    registrationsLoading.value = false;
  }
};

onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
.admin-tastings-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-bar {
  background: #fff;
  padding: 16px 24px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 125px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.image-uploader:hover {
  border-color: #409eff;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.registration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.registration-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding-top: 10px;
}
</style>
