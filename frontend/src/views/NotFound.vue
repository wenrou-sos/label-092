<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="tea-icon">
        <el-icon :size="120" color="#2d5a27">
          <CoffeeCup />
        </el-icon>
      </div>
      <h1 class="error-code">404</h1>
      <p class="error-title">页面走丢了</p>
      <p class="error-desc">您访问的页面不存在或已被移除</p>
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="goHome">
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { CoffeeCup, House, ArrowLeft } from '@element-plus/icons-vue';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f6f0 0%, #e8e4d8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.tea-icon {
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.error-code {
  font-size: 96px;
  font-weight: 800;
  color: #2d5a27;
  margin: 0 0 10px 0;
  letter-spacing: 4px;
  text-shadow: 2px 2px 4px rgba(45, 90, 39, 0.2);
}

.error-title {
  font-size: 28px;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.error-desc {
  font-size: 16px;
  color: #666;
  margin: 0 0 40px 0;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

:deep(.el-button--primary) {
  background: #2d5a27;
  border-color: #2d5a27;
  border-radius: 24px;
  padding: 12px 28px;
}

:deep(.el-button--primary:hover) {
  background: #3d7a37;
  border-color: #3d7a37;
}

:deep(.el-button:not(.el-button--primary)) {
  border-radius: 24px;
  padding: 12px 28px;
}
</style>
