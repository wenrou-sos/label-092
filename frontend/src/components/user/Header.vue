<template>
  <header class="header">
    <div class="container header-inner">
      <router-link to="/" class="logo">
        <el-icon size="32" color="#2d5a27">
          <Cup />
        </el-icon>
        <span class="logo-text">茗韵轩</span>
      </router-link>
      <nav class="nav">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/products" class="nav-item">茶叶商城</router-link>
        <router-link to="/tastings" class="nav-item">品鉴会</router-link>
      </nav>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索茶叶..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <router-link to="/cart" class="cart-link">
          <el-badge :value="userStore.cartCount" :hidden="userStore.cartCount === 0">
            <el-icon size="24"><ShoppingCart /></el-icon>
          </el-badge>
        </router-link>
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon size="20"><User /></el-icon>
              <span>{{ userStore.userInfo?.name }}</span>
              <el-tag
                v-if="userStore.userInfo?.level !== 'normal'"
                :type="levelTagType"
                size="small"
              >
                {{ levelText }}
              </el-tag>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon> 会员中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login" class="login-link">登录</router-link>
          <router-link to="/register" class="register-link">注册</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { MemberLevelMap } from '@/types';

const router = useRouter();
const userStore = useUserStore();
const searchKeyword = ref('');

const levelText = computed(() => {
  if (!userStore.userInfo) return '';
  return MemberLevelMap[userStore.userInfo.level];
});

const levelTagType = computed(() => {
  const level = userStore.userInfo?.level;
  if (level === 'diamond') return 'danger';
  if (level === 'gold') return 'warning';
  if (level === 'silver') return 'info';
  return '';
});

const handleSearch = () => {
  router.push({
    path: '/products',
    query: { keyword: searchKeyword.value },
  });
};

const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/member');
  } else if (command === 'logout') {
    userStore.logout();
    router.push('/');
  }
};
</script>

<style scoped>
.header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  height: 70px;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  font-weight: 600;
  color: #2d5a27;
}

.logo-text {
  letter-spacing: 2px;
}

.nav {
  display: flex;
  gap: 30px;
  flex: 1;
}

.nav-item {
  font-size: 16px;
  color: #333;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #2d5a27;
  border-bottom-color: #2d5a27;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-input {
  width: 200px;
}

.cart-link {
  display: flex;
  align-items: center;
  color: #333;
  padding: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f5f5;
}

.login-link,
.register-link {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  transition: all 0.3s;
}

.login-link {
  color: #2d5a27;
  border: 1px solid #2d5a27;
}

.login-link:hover {
  background: #2d5a27;
  color: #fff;
}

.register-link {
  background: #2d5a27;
  color: #fff;
}

.register-link:hover {
  background: #3d7a37;
}
</style>
