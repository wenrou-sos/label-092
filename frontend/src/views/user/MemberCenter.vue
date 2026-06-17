<template>
  <div class="member-center">
    <Header />
    <div class="member-container">
      <aside class="member-sidebar">
        <div class="sidebar-header">
          <div class="avatar-wrapper">
            <el-icon :size="32" color="#fff"><User /></el-icon>
          </div>
          <div class="user-info">
            <p class="user-name">{{ userStore.userInfo?.name || '会员用户' }}</p>
            <el-tag :type="levelTagType" effect="dark" size="small">
              {{ MemberLevelMap[userStore.userInfo?.level || 'normal'] }}
            </el-tag>
          </div>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="member-menu"
          background-color="#fff"
          text-color="#333"
          active-text-color="#2d5a27"
          router
        >
          <el-menu-item index="/member/profile">
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </el-menu-item>
          <el-menu-item index="/member/orders">
            <el-icon><Goods /></el-icon>
            <span>我的订单</span>
          </el-menu-item>
          <el-menu-item index="/member/tastings">
            <el-icon><Calendar /></el-icon>
            <span>品鉴会报名</span>
          </el-menu-item>
          <el-menu-item index="/member/reviews">
            <el-icon><ChatDotRound /></el-icon>
            <span>我的评价</span>
          </el-menu-item>
          <el-menu-item index="#" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-menu-item>
        </el-menu>
      </aside>
      <main class="member-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { MemberLevelMap, type MemberLevel } from '@/types';
import Header from '@/components/user/Header.vue';
import { User, Goods, Calendar, ChatDotRound, SwitchButton } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);

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

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    userStore.logout();
    router.push('/');
  } catch {
    // 用户取消
  }
};
</script>

<style scoped>
.member-center {
  min-height: 100vh;
  background: #f5f0e8;
  display: flex;
  flex-direction: column;
}

.member-container {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  display: flex;
  gap: 24px;
  width: 100%;
}

.member-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(45, 90, 39, 0.08);
  overflow: hidden;
  align-self: flex-start;
  position: sticky;
  top: 30px;
}

.sidebar-header {
  background: linear-gradient(135deg, #2d5a27 0%, #1a3a17 100%);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #c9a227 0%, #d4b237 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-menu {
  border-right: none;
  padding: 12px 0;
}

.member-menu :deep(.el-menu-item) {
  height: 52px;
  line-height: 52px;
  margin: 4px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.member-menu :deep(.el-menu-item:hover) {
  background: #f5f0e8;
  color: #2d5a27;
}

.member-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%);
  color: #fff;
}

.member-menu :deep(.el-menu-item .el-icon) {
  margin-right: 10px;
  font-size: 18px;
}

.member-main {
  flex: 1;
  min-width: 0;
}

@media (max-width: 1024px) {
  .member-container {
    flex-direction: column;
  }

  .member-sidebar {
    width: 100%;
    position: static;
  }

  .member-menu {
    display: flex;
    overflow-x: auto;
    padding: 12px;
  }

  .member-menu :deep(.el-menu-item) {
    margin: 0 6px;
    white-space: nowrap;
  }
}

@media (max-width: 768px) {
  .member-container {
    padding: 16px 12px;
    gap: 16px;
  }

  .sidebar-header {
    padding: 16px;
  }

  .member-menu :deep(.el-menu-item) {
    height: 44px;
    line-height: 44px;
    font-size: 13px;
    padding: 0 16px !important;
  }

  .member-menu :deep(.el-menu-item .el-icon) {
    font-size: 16px;
    margin-right: 6px;
  }
}
</style>
