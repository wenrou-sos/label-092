import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

service.interceptors.request.use(
  (config: any) => {
    const url = config.url || '';
    const isAdminApi = url.startsWith('/admin');
    
    if (isAdminApi) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    const url = error.config?.url || '';
    const isAdminApi = url.startsWith('/admin');
    
    if (error.response?.status === 401) {
      if (isAdminApi) {
        ElMessage.error('管理员登录已过期，请重新登录');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        if (!window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login';
        }
      } else {
        ElMessage.error('登录已过期，请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else {
      ElMessage.error(error.response?.data?.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

export default service;
