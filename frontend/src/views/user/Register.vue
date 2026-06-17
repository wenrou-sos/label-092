<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-left">
        <div class="brand-section">
          <router-link to="/" class="back-home">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </router-link>
          <div class="logo-wrapper">
            <el-icon :size="48" color="#c9a227">
              <Coffee />
            </el-icon>
          </div>
          <h1 class="brand-title">茗韵轩</h1>
          <p class="brand-subtitle">品味中华茶文化的精髓</p>
        </div>

        <div class="benefits-section">
          <h3 class="benefits-title">注册即享专属权益</h3>
          <div class="benefit-item">
            <div class="benefit-icon" :style="{ background: 'linear-gradient(135deg, #c9a227 0%, #d4b237 100%)' }">
              <el-icon :size="20"><Present /></el-icon>
            </div>
            <div class="benefit-content">
              <h4>新人礼包</h4>
              <p>注册即送100积分+首单9折</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon" :style="{ background: 'linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%)' }">
              <el-icon :size="20"><Discount /></el-icon>
            </div>
            <div class="benefit-content">
              <h4>会员折扣</h4>
              <p>消费累计升级，最高享8折优惠</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon" :style="{ background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)' }">
              <el-icon :size="20"><Medal /></el-icon>
            </div>
            <div class="benefit-content">
              <h4>专属活动</h4>
              <p>优先参与品鉴会及茶文化活动</p>
            </div>
          </div>
        </div>
      </div>

      <div class="register-right">
        <div class="register-form-wrapper">
          <h2 class="welcome-title">加入茗韵轩</h2>
          <p class="welcome-subtitle">创建您的账号，开启品茶之旅</p>

          <el-form
            ref="formRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
          >
            <el-form-item prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入手机号"
                size="large"
                :prefix-icon="Cellphone"
                maxlength="11"
              />
            </el-form-item>

            <el-form-item prop="code">
              <div class="code-input-wrapper">
                <el-input
                  v-model="registerForm.code"
                  placeholder="请输入验证码"
                  size="large"
                  :prefix-icon="Key"
                  maxlength="6"
                />
                <el-button
                  type="primary"
                  size="large"
                  class="send-code-btn"
                  :disabled="countdown > 0 || sendingCode"
                  :loading="sendingCode"
                  @click="handleSendCode"
                >
                  {{ countdown > 0 ? `${countdown}s后重试` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item prop="name">
              <el-input
                v-model="registerForm.name"
                placeholder="请输入姓名"
                size="large"
                :prefix-icon="User"
                maxlength="20"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请设置密码（6-20位）"
                size="large"
                :prefix-icon="Lock"
                :show-password="true"
                maxlength="20"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请确认密码"
                size="large"
                :prefix-icon="Lock"
                :show-password="true"
                maxlength="20"
                @keyup.enter="handleRegister"
              />
            </el-form-item>

            <el-form-item prop="agreement">
              <el-checkbox v-model="registerForm.agreement">
                我已阅读并同意
                <router-link to="/agreement" class="agreement-link">《用户协议》</router-link>
                和
                <router-link to="/privacy" class="agreement-link">《隐私政策》</router-link>
              </el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="register-btn"
                :loading="loading"
                @click="handleRegister"
              >
                立即注册
              </el-button>
            </el-form-item>
          </el-form>

          <div class="login-link">
            已有账号？
            <router-link to="/login" class="link-text">立即登录</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useUserStore } from '@/stores/user';
import {
  Cellphone,
  Lock,
  User,
  Key,
  Coffee,
  Present,
  Discount,
  Medal,
  ArrowLeft,
} from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);

const registerForm = reactive({
  phone: '',
  code: '',
  name: '',
  password: '',
  confirmPassword: '',
  agreement: false,
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

const validateCode = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入验证码'));
  } else if (!/^\d{6}$/.test(value)) {
    callback(new Error('验证码为6位数字'));
  } else {
    callback();
  }
};

const validateName = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入姓名'));
  } else if (value.length < 2) {
    callback(new Error('姓名至少2个字符'));
  } else {
    callback();
  }
};

const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请设置密码'));
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('密码长度为6-20位'));
  } else {
    callback();
  }
};

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请确认密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const validateAgreement = (rule: any, value: boolean, callback: any) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议和隐私政策'));
  } else {
    callback();
  }
};

const registerRules: FormRules = {
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  code: [{ validator: validateCode, trigger: 'blur' }],
  name: [{ validator: validateName, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  agreement: [{ validator: validateAgreement, trigger: 'change' }],
};

const handleSendCode = async () => {
  if (!registerForm.phone) {
    ElMessage.warning('请先输入手机号');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }

  sendingCode.value = true;
  try {
    ElMessage.success('验证码已发送（测试码：123456）');
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error: any) {
    ElMessage.error(error.message || '发送失败，请重试');
  } finally {
    sendingCode.value = false;
  }
};

const handleRegister = async () => {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  if (registerForm.code !== '123456') {
    ElMessage.error('验证码错误（测试码：123456）');
    return;
  }

  loading.value = true;
  try {
    await userStore.register({
      phone: registerForm.phone,
      name: registerForm.name,
      password: registerForm.password,
    });
    router.push('/');
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 1200px;
  min-height: 700px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(45, 90, 39, 0.15);
  display: flex;
  overflow: hidden;
}

.register-left {
  width: 45%;
  background: linear-gradient(135deg, #2d5a27 0%, #1a3a17 100%);
  padding: 40px 50px;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 40px;
  transition: color 0.3s ease;
  align-self: flex-start;
}

.back-home:hover {
  color: #c9a227;
}

.brand-section {
  text-align: center;
  margin-bottom: 50px;
}

.logo-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
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

.benefits-section {
  flex: 1;
}

.benefits-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 32px;
  text-align: center;
  color: #c9a227;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.benefit-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(8px);
}

.benefit-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.benefit-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #fff;
}

.benefit-content p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.register-right {
  width: 55%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow-y: auto;
}

.register-form-wrapper {
  width: 100%;
  max-width: 420px;
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

.register-form {
  margin-bottom: 24px;
}

.register-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 16px;
  box-shadow: 0 0 0 1px #e0e0e0;
  transition: all 0.3s ease;
}

.register-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #2d5a27;
}

.register-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2d5a27, 0 2px 12px rgba(45, 90, 39, 0.15);
}

.register-form :deep(.el-input .el-input__prefix-inner .el-icon) {
  color: #c9a227;
}

.code-input-wrapper {
  display: flex;
  gap: 12px;
}

.code-input-wrapper :deep(.el-input) {
  flex: 1;
}

.send-code-btn {
  width: 140px;
  background: linear-gradient(135deg, #c9a227 0%, #d4b237 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.send-code-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d4b237 0%, #dec437 100%);
  transform: translateY(-2px);
}

.send-code-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.agreement-link {
  color: #c9a227;
  transition: color 0.3s ease;
}

.agreement-link:hover {
  color: #d4b237;
}

.register-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-btn:hover {
  background: linear-gradient(135deg, #3d7a37 0%, #4d8a47 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(45, 90, 39, 0.3);
}

.register-btn:active {
  transform: translateY(0);
}

.login-link {
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

@media (max-width: 1024px) {
  .register-container {
    flex-direction: column;
    max-width: 600px;
    min-height: auto;
  }

  .register-left,
  .register-right {
    width: 100%;
  }

  .register-left {
    padding: 30px;
  }

  .benefits-section {
    display: none;
  }

  .brand-section {
    margin-bottom: 0;
  }

  .back-home {
    margin-bottom: 20px;
  }

  .register-right {
    padding: 40px 30px;
  }
}

@media (max-width: 640px) {
  .code-input-wrapper {
    flex-direction: column;
  }

  .send-code-btn {
    width: 100%;
  }
}
</style>
