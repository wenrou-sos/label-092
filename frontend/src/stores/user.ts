import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Member, CartItem, PackageType } from '@/types';
import { login as loginApi, register as registerApi, getProfile } from '@/api/member';
import { ElMessage } from 'element-plus';

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<Member | null>(null);
  const token = ref<string>(localStorage.getItem('token') || '');
  const cart = ref<CartItem[]>(JSON.parse(localStorage.getItem('cart') || '[]'));

  const isLoggedIn = computed(() => !!token.value);

  const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0));

  const cartTotal = computed(() => {
    const discount = userInfo.value?.discount || 1;
    return cart.value.reduce((sum, item) => sum + item.unitPrice * item.quantity * discount, 0);
  });

  const login = async (data: { phone: string; password: string }) => {
    const res = await loginApi(data);
    token.value = res.token;
    userInfo.value = res.member;
    localStorage.setItem('token', res.token);
    localStorage.setItem('userInfo', JSON.stringify(res.member));
    ElMessage.success(res.message);
    return res;
  };

  const register = async (data: { phone: string; name: string; password?: string }) => {
    const res = await registerApi(data);
    token.value = res.token;
    userInfo.value = res.member;
    localStorage.setItem('token', res.token);
    localStorage.setItem('userInfo', JSON.stringify(res.member));
    ElMessage.success(res.message);
    return res;
  };

  const fetchProfile = async () => {
    if (!token.value) return;
    try {
      const res = await getProfile();
      userInfo.value = res;
      localStorage.setItem('userInfo', JSON.stringify(res));
    } catch (error) {
      console.error('获取用户信息失败', error);
    }
  };

  const logout = () => {
    userInfo.value = null;
    token.value = '';
    cart.value = [];
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cart');
    ElMessage.success('已退出登录');
  };

  const cartItemKey = (c: CartItem) =>
    c.packageType === 'loose'
      ? `${c.productId}-${c.packageType}-${c.weight}`
      : `${c.productId}-${c.packageType}`;

  const addToCart = (item: CartItem) => {
    const itemKey = cartItemKey(item);
    const existing = cart.value.find((c) => cartItemKey(c) === itemKey);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.value.push(item);
    }
    saveCart();
    ElMessage.success('已加入购物车');
  };

  const updateCartItem = (key: string, quantity: number) => {
    const item = cart.value.find((c) => cartItemKey(c) === key);
    if (item) {
      item.quantity = Math.max(1, quantity);
      saveCart();
    }
  };

  const removeFromCart = (key: string) => {
    const index = cart.value.findIndex((c) => cartItemKey(c) === key);
    if (index > -1) {
      cart.value.splice(index, 1);
      saveCart();
    }
  };

  const clearCart = () => {
    cart.value = [];
    saveCart();
  };

  const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart.value));
  };

  const initFromStorage = () => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser && token.value) {
      userInfo.value = JSON.parse(storedUser);
    }
  };

  return {
    userInfo,
    token,
    cart,
    isLoggedIn,
    cartCount,
    cartTotal,
    login,
    register,
    fetchProfile,
    logout,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    initFromStorage,
    cartItemKey,
  };
});
