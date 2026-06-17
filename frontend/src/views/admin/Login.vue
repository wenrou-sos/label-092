<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand-section">
          <div class="logo-wrapper">
            <el-icon :size="48" color="#c9a227">
              <Setting />
            </el-icon>
          </div>
          <h1 class="brand-title">茗韵轩</h1>
          <p class="brand-subtitle">管理后台</p>
        </div>
        <div class="tea-decoration">
          <img src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=800&fit=crop" alt="tea" />
        </div>
      </div>

      <div class="login-right">
        <div class="login-form-wrapper">
          <div class="form-container">
            <h2 class="welcome-title">管理后台登录</h2>
            <p class="welcome-subtitle">请使用管理员账号登录</p>

            <el-form
              ref="formRef"
              :model="loginForm"
              :rules="loginRules"
              class="login-form"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  size="large"
                  :prefix-icon="User"
                  @keyup.enter="handleLogin"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  :prefix-icon="Lock"
                  :show-password="true"
                  @keyup.enter="handleLogin"
                />
              </el-form-item>

              <div class="form-options">
                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              </div>

              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  class="login-btn"
                  :loading="loading"
                  @click="handleLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>

            <div class="back-link">
              <router-link to="/" class="link-text">
                <el-icon><ArrowLeft /></el-icon>
                返回首页
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { adminLogin } from '@/api/admin';
import {
  User,
  Lock,
  Setting,
  ArrowLeft,
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

const formRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
});

const validateUsername = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入用户名'));
  } else if (value.length < 3) {
    callback(new Error('用户名长度不能少于3位'));
  } else {
    callback();
  }
};

const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'));
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'));
  } else {
    callback();
  }
};

const loginRules: FormRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
};

const handleLogin = async () => {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const res = await adminLogin({
      username: loginForm.username,
      password: loginForm.password,
    });

    localStorage.setItem('adminToken', res.token);
    localStorage.setItem('adminInfo', JSON.stringify(res.admin));

    if (rememberMe.value) {
      localStorage.setItem('rememberedAdminUsername', loginForm.username);
    } else {
      localStorage.removeItem('rememberedAdminUsername');
    }

    ElMessage.success(res.message || '登录成功');

    const redirect = route.query.redirect as string;
    if (redirect) {
      router.push(redirect);
    } else {
      router.push('/admin/dashboard');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败，请重试');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const savedUsername = localStorage.getItem('rememberedAdminUsername');
  if (savedUsername) {
    loginForm.username = savedUsername;
    rememberMe.value = true;
  }
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 1000px;
  height: 600px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(45, 90, 39, 0.15);
  display: flex;
  overflow: hidden;
}

.login-left {
  width: 45%;
  background: linear-gradient(135deg, #2d5a27 0%, #1a3a17 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 60px 40px;
  color: #fff;
}

.brand-section {
  position: relative;
  z-index: 2;
}

.logo-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #fff;
}

.brand-subtitle {
  font-size: 18px;
  color: #c9a227;
  font-weight: 500;
}

.tea-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55%;
  overflow: hidden;
  border-bottom-left-radius: 20px;
}

.tea-decoration img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
  filter: grayscale(20%);
}

.login-right {
  width: 55%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 380px;
}

.welcome-title {
  font-size: 26px;
  font-weight: 700;
  color: #2d5a27;
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 32px;
}

.login-form {
  margin-bottom: 24px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 16px;
  box-shadow: 0 0 0 1px #e0e0e0;
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #2d5a27;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2d5a27, 0 2px 12px rgba(45, 90, 39, 0.15);
}

.login-form :deep(.el-input .el-input__prefix-inner .el-icon) {
  color: #c9a227;
}

.form-options {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: linear-gradient(135deg, #3d7a37 0%, #4d8a47 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(45, 90, 39, 0.3);
}

.login-btn:active {
  transform: translateY(0);
}

.back-link {
  text-align: center;
  font-size: 14px;
  color: #999;
}

.link-text {
  color: #2d5a27;
  font-weight: 500;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.link-text:hover {
  color: #3d7a37;
}

@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
    height: auto;
    max-width: 500px;
  }

  .login-left,
  .login-right {
    width: 100%;
  }

  .login-left {
    height: 180px;
    padding: 30px;
  }

  .tea-decoration {
    display: none;
  }

  .brand-title {
    font-size: 24px;
  }

  .login-right {
    padding: 40px 30px;
  }
}
</style>
