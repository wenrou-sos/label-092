import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/user/Home.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/user/ProductList.vue'),
      meta: { title: '商品列表' },
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('@/views/user/ProductDetail.vue'),
      meta: { title: '商品详情' },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/user/Cart.vue'),
      meta: { title: '购物车' },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/user/Checkout.vue'),
      meta: { title: '确认订单', requiresAuth: true },
    },
    {
      path: '/tastings',
      name: 'tastings',
      component: () => import('@/views/user/TastingList.vue'),
      meta: { title: '品鉴会' },
    },
    {
      path: '/tastings/:id',
      name: 'tasting-detail',
      component: () => import('@/views/user/TastingDetail.vue'),
      meta: { title: '品鉴会详情' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/user/Login.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/user/Register.vue'),
      meta: { title: '注册' },
    },
    {
      path: '/member',
      name: 'member',
      component: () => import('@/views/user/MemberCenter.vue'),
      meta: { title: '会员中心', requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/member/profile',
        },
        {
          path: 'profile',
          name: 'member-profile',
          component: () => import('@/views/user/member/Profile.vue'),
          meta: { title: '个人信息' },
        },
        {
          path: 'orders',
          name: 'member-orders',
          component: () => import('@/views/user/member/Orders.vue'),
          meta: { title: '我的订单' },
        },
        {
          path: 'tastings',
          name: 'member-tastings',
          component: () => import('@/views/user/member/Tastings.vue'),
          meta: { title: '品鉴会报名' },
        },
        {
          path: 'reviews',
          name: 'member-reviews',
          component: () => import('@/views/user/member/Reviews.vue'),
          meta: { title: '我的评价' },
        },
      ],
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/Layout.vue'),
      meta: { title: '管理后台' },
      children: [
        {
          path: '',
          redirect: '/admin/login',
        },
        {
          path: 'login',
          name: 'admin-login',
          component: () => import('@/views/admin/Login.vue'),
          meta: { title: '管理员登录' },
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { title: '控制台', requiresAdmin: true },
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/views/admin/Products.vue'),
          meta: { title: '商品管理', requiresAdmin: true },
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('@/views/admin/Orders.vue'),
          meta: { title: '订单管理', requiresAdmin: true },
        },
        {
          path: 'members',
          name: 'admin-members',
          component: () => import('@/views/admin/Members.vue'),
          meta: { title: '会员管理', requiresAdmin: true },
        },
        {
          path: 'tastings',
          name: 'admin-tastings',
          component: () => import('@/views/admin/Tastings.vue'),
          meta: { title: '品鉴会管理', requiresAdmin: true },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const adminToken = localStorage.getItem('adminToken');

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  if (to.meta.requiresAdmin && !adminToken) {
    next({ name: 'admin-login' });
    return;
  }

  if (to.meta.title) {
    document.title = `${to.meta.title} - 茗韵轩`;
  }

  next();
});

export default router;
