<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="220px" class="admin-aside">
        <div class="logo">
          <span>茗韵轩管理后台</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          background-color="#2d5a27"
          text-color="#ffffff"
          active-text-color="#c9a227"
          router
          class="admin-menu"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>控制台</span>
          </el-menu-item>
          <el-menu-item index="/admin/products">
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/members">
            <el-icon><User /></el-icon>
            <span>会员管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/tastings">
            <el-icon><CoffeeCup /></el-icon>
            <span>品鉴会管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/login" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="admin-header">
          <div class="header-left">
            <span class="page-title">{{ pageTitle }}</span>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="admin-info">
                <el-icon><UserFilled /></el-icon>
                <span>{{ adminName }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" size="small" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出
            </el-button>
          </div>
        </el-header>
        <el-main class="admin-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import {
  Odometer,
  Goods,
  List,
  User,
  CoffeeCup,
  SwitchButton,
  UserFilled,
  ArrowDown,
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const adminName = ref(localStorage.getItem('adminName') || '管理员');

const activeMenu = computed(() => route.path);

const pageTitle = computed(() => {
  return (route.meta.title as string) || '管理后台';
});

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    ElMessage.success('已退出登录');
    router.push('/admin/login');
  } catch {
    // 用户取消
  }
};

const handleCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout();
  }
};
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.admin-aside {
  background-color: #2d5a27;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  background-color: #1e3d1a;
  border-bottom: 1px solid #1a3516;
}

.admin-menu {
  border-right: none;
  flex: 1;
}

.admin-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

.admin-menu :deep(.el-menu-item:hover) {
  background-color: #3d7a36;
}

.admin-menu :deep(.el-menu-item.is-active) {
  background-color: #1e3d1a;
}

.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left .page-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d5a27;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
}

.admin-info:hover {
  color: #2d5a27;
}

.admin-main {
  background-color: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
