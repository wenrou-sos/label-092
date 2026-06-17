<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand-section">
          <div class="logo-wrapper">
            <el-icon :size="48" color="#c9a227">
              <Coffee />
            </el-icon>
          </div>
          <h1 class="brand-title">茗韵轩</h1>
          <p class="brand-subtitle">品味中华茶文化的精髓</p>
        </div>
        <div class="tea-decoration">
          <img src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=800&fit=crop" alt="tea" />
        </div>
      </div>

      <div class="login-right">
        <div class="login-form-wrapper">
          <div class="login-tabs">
            <div
              class="tab-item"
              :class="{ active: loginType === 'account' }"
              @click="loginType = 'account'"
            >
              账号登录
            </div>
            <div
              class="tab-item"
              :class="{ active: loginType === 'qrcode' }"
              @click="loginType = 'qrcode'"
            >
              扫码登录
            </div>
          </div>

          <div v-if="loginType === 'account'" class="form-container">
            <h2 class="welcome-title">欢迎回来</h2>
            <p class="welcome-subtitle">请登录您的账号</p>

            <el-form
              ref="formRef"
              :model="loginForm"
              :rules="loginRules"
              class="login-form"
            >
              <el-form-item prop="phone">
                <el-input
                  v-model="loginForm.phone"
                  placeholder="请输入手机号"
                  size="large"
                  :prefix-icon="Cellphone"
                  maxlength="11"
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
                <router-link to="/forgot-password" class="forgot-link">
                  忘记密码？
                </router-link>
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

            <div class="register-link">
              还没有账号？
              <router-link to="/register" class="link-text">立即注册</router-link>
            </div>
          </div>

          <div v-else class="qrcode-container">
            <h2 class="welcome-title">扫码登录</h2>
            <p class="welcome-subtitle">打开手机APP扫码登录</p>

            <div class="qrcode-wrapper">
              <div class="qrcode-placeholder">
                <el-icon :size="80" color="#ccc">
                  <Camera />
                </el-icon>
                <p class="qrcode-tip">二维码加载中...</p>
              </div>
              <el-tag type="success" class="safe-tag" effect="light">
                <el-icon><CircleCheck /></el-icon>
                安全加密
              </el-tag>
            </div>

            <p class="qrcode-desc">
              请使用 <span class="highlight">茗韵轩APP</span> 扫一扫功能扫码登录
            </p>

            <div class="register-link">
              还没有账号？
              <router-link to="/register" class="link-text">立即注册</router-link>
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
import { useUserStore } from '@/stores/user';
import {
  Cellphone,
  Lock,
  Coffee,
  Camera,
  CircleCheck,
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const loginType = ref<'account' | 'qrcode'>('account');
const rememberMe = ref(false);

const loginForm = reactive({
  phone: '',
  password: '',
});

const validatePhone = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'));
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'));
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
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
};

const handleLogin = async () => {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await userStore.login({
      phone: loginForm.phone,
      password: loginForm.password,
    });

    const redirect = route.query.redirect as string;
    if (redirect) {
      router.push(redirect);
    } else {
      router.push('/');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败，请重试');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const savedPhone = localStorage.getItem('rememberedPhone');
  if (savedPhone) {
    loginForm.phone = savedPhone;
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
  max-width: 1100px;
  height: 650px;
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
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #fff;
}

.brand-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
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
  max-width: 400px;
}

.login-tabs {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
  border-bottom: 2px solid #f0f0f0;
}

.tab-item {
  padding: 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #999;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #2d5a27;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #c9a227;
  border-radius: 1px;
}

.welcome-title {
  font-size: 28px;
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-link {
  color: #2d5a27;
  font-size: 14px;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #3d7a37;
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

.register-link {
  text-align: center;
  font-size: 14px;
  color: #999;
}

.link-text {
  color: #c9a227;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link-text:hover {
  color: #d4b237;
}

.qrcode-container {
  text-align: center;
}

.qrcode-wrapper {
  position: relative;
  display: inline-block;
  margin: 32px 0 24px;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  background: #f8f8f8;
  border: 2px dashed #e0e0e0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.qrcode-tip {
  font-size: 14px;
  color: #999;
}

.safe-tag {
  position: absolute;
  top: -12px;
  right: -12px;
}

.qrcode-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 32px;
}

.qrcode-desc .highlight {
  color: #2d5a27;
  font-weight: 600;
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
    height: 200px;
    padding: 30px;
  }

  .tea-decoration {
    display: none;
  }

  .brand-title {
    font-size: 28px;
  }

  .login-right {
    padding: 40px 30px;
  }
}
</style>
