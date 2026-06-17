<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="header-content">
        <div class="avatar-wrapper">
          <el-icon :size="48" color="#fff"><User /></el-icon>
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ userStore.userInfo?.name || '会员用户' }}</h2>
          <el-tag :type="levelTagType" effect="dark" size="large" class="level-tag">
            {{ MemberLevelMap[userStore.userInfo?.level || 'normal'] }}
          </el-tag>
        </div>
      </div>
    </div>

    <div class="profile-container">
      <div class="form-section">
        <h3 class="section-title">
          <el-icon><Edit /></el-icon>
          基本信息
        </h3>
        <el-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          class="profile-form"
          label-width="80px"
        >
          <el-form-item label="姓名" prop="name">
            <el-input
              v-model="profileForm.name"
              placeholder="请输入姓名"
              size="large"
              :prefix-icon="User"
              maxlength="20"
            />
          </el-form-item>

          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="profileForm.phone"
              placeholder="请输入手机号"
              size="large"
              :prefix-icon="Cellphone"
              maxlength="11"
              disabled
            />
          </el-form-item>

          <el-form-item label="生日" prop="birthday">
            <el-date-picker
              v-model="profileForm.birthday"
              type="date"
              placeholder="请选择生日"
              size="large"
              :prefix-icon="Calendar"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              :loading="profileLoading"
              @click="handleUpdateProfile"
            >
              保存修改
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="form-section">
        <h3 class="section-title">
          <el-icon><Lock /></el-icon>
          修改密码
        </h3>
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          class="password-form"
          label-width="80px"
        >
          <el-form-item label="原密码" prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              size="large"
              :prefix-icon="Lock"
              :show-password="true"
              maxlength="20"
            />
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（6-20位）"
              size="large"
              :prefix-icon="Lock"
              :show-password="true"
              maxlength="20"
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请确认新密码"
              size="large"
              :prefix-icon="Lock"
              :show-password="true"
              maxlength="20"
              @keyup.enter="handleUpdatePassword"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              :loading="passwordLoading"
              @click="handleUpdatePassword"
            >
              修改密码
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { updateProfile } from '@/api/member';
import { MemberLevelMap, type MemberLevel } from '@/types';
import { User, Cellphone, Calendar, Lock, Edit } from '@element-plus/icons-vue';

const userStore = useUserStore();

const profileFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();
const profileLoading = ref(false);
const passwordLoading = ref(false);

const profileForm = reactive({
  name: '',
  phone: '',
  birthday: '' as string | null,
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const levelTagType = computed(() => {
  const level = userStore.userInfo?.level;
  switch (level) {
    case 'diamond':
      return 'danger';
    case 'gold':
      return 'warning';
    case 'silver':
      return 'info';
    default:
      return 'success';
  }
});

const validateName = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入姓名'));
  } else if (value.length < 2) {
    callback(new Error('姓名至少2个字符'));
  } else {
    callback();
  }
};

const profileRules: FormRules = {
  name: [{ validator: validateName, trigger: 'blur' }],
};

const validateOldPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入原密码'));
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('密码长度为6-20位'));
  } else {
    callback();
  }
};

const validateNewPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入新密码'));
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('密码长度为6-20位'));
  } else {
    callback();
  }
};

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请确认新密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const passwordRules: FormRules = {
  oldPassword: [{ validator: validateOldPassword, trigger: 'blur' }],
  newPassword: [{ validator: validateNewPassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
};

const initForm = () => {
  if (userStore.userInfo) {
    profileForm.name = userStore.userInfo.name;
    profileForm.phone = userStore.userInfo.phone;
    profileForm.birthday = userStore.userInfo.birthday;
  }
};

const handleUpdateProfile = async () => {
  if (!profileFormRef.value) return;

  const valid = await profileFormRef.value.validate().catch(() => false);
  if (!valid) return;

  profileLoading.value = true;
  try {
    const data: { name: string; birthday: string | null } = {
      name: profileForm.name,
      birthday: profileForm.birthday,
    };
    const res = await updateProfile(data);
    userStore.userInfo = res.member;
    localStorage.setItem('userInfo', JSON.stringify(res.member));
    ElMessage.success(res.message || '个人信息更新成功');
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败，请重试');
  } finally {
    profileLoading.value = false;
  }
};

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return;

  const valid = await passwordFormRef.value.validate().catch(() => false);
  if (!valid) return;

  passwordLoading.value = true;
  try {
    const res = await updateProfile({
      password: passwordForm.newPassword,
    });
    userStore.userInfo = res.member;
    localStorage.setItem('userInfo', JSON.stringify(res.member));
    ElMessage.success(res.message || '密码修改成功');
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } catch (error: any) {
    ElMessage.error(error.message || '密码修改失败，请重试');
  } finally {
    passwordLoading.value = false;
  }
};

onMounted(() => {
  initForm();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f0e8;
}

.profile-header {
  background: linear-gradient(135deg, #2d5a27 0%, #1a3a17 100%);
  padding: 40px 0;
  margin-bottom: 30px;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #c9a227 0%, #d4b237 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(201, 162, 39, 0.4);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.level-tag {
  align-self: flex-start;
  border-radius: 20px;
  padding: 4px 16px;
  font-weight: 600;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.form-section {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(45, 90, 39, 0.08);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #2d5a27;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0ebe0;
}

.section-title .el-icon {
  color: #c9a227;
}

.profile-form,
.password-form {
  max-width: 500px;
}

.profile-form :deep(.el-input__wrapper),
.password-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 16px;
  box-shadow: 0 0 0 1px #e0e0e0;
  transition: all 0.3s ease;
}

.profile-form :deep(.el-input__wrapper:hover),
.password-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #2d5a27;
}

.profile-form :deep(.el-input__wrapper.is-focus),
.password-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2d5a27, 0 2px 12px rgba(45, 90, 39, 0.15);
}

.profile-form :deep(.el-input .el-input__prefix-inner .el-icon),
.password-form :deep(.el-input .el-input__prefix-inner .el-icon) {
  color: #c9a227;
}

.profile-form :deep(.el-date-editor),
.password-form :deep(.el-date-editor) {
  width: 100%;
}

.profile-form :deep(.el-date-editor .el-input__wrapper),
.password-form :deep(.el-date-editor .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e0e0e0;
}

.profile-form :deep(.el-date-editor .el-input__wrapper:hover),
.password-form :deep(.el-date-editor .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #2d5a27;
}

.profile-form :deep(.el-date-editor .el-input__wrapper.is-focus),
.password-form :deep(.el-date-editor .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2d5a27, 0 2px 12px rgba(45, 90, 39, 0.15);
}

.profile-form :deep(.el-input.is-disabled .el-input__wrapper),
.password-form :deep(.el-input.is-disabled .el-input__wrapper) {
  background: #f5f5f5;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #3d7a37 0%, #4d8a47 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(45, 90, 39, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .level-tag {
    align-self: center;
  }

  .form-section {
    padding: 24px 20px;
  }

  .profile-form,
  .password-form {
    max-width: 100%;
  }

  .profile-form :deep(.el-form-item__label),
  .password-form :deep(.el-form-item__label) {
    width: 70px !important;
  }
}
</style>
