import request from '@/utils/request';
import type { Order, ApiResponse, OrderItem, PackageType } from '@/types';

export interface CreateOrderItem {
  productId: number;
  packageType: PackageType;
  weight: number;
  quantity: number;
}

export const createOrder = (data: {
  items: CreateOrderItem[];
  shippingAddress: string;
  contactPhone: string;
  contactName: string;
  remark?: string;
}) => {
  return request.post<any, { orderId: number; orderNo: string; message: string }>('/orders', data);
};

export const getMyOrders = (params?: { status?: string; page?: number; pageSize?: number }) => {
  return request.get<any, ApiResponse<Order[]>>('/orders/my', { params });
};

export const getOrderById = (id: number) => {
  return request.get<any, Order>(`/orders/${id}`);
};

export const payOrder = (id: number) => {
  return request.post<any, { message: string; order: Order }>(`/orders/${id}/pay`);
};

export const cancelOrder = (id: number) => {
  return request.post<any, { message: string }>(`/orders/${id}/cancel`);
};

export const confirmOrder = (id: number) => {
  return request.post<any, { message: string; order: Order }>(`/orders/${id}/confirm`);
};

export const getOrders = (params?: { status?: string; page?: number; pageSize?: number }) => {
  return request.get<any, ApiResponse<Order[]>>('/admin/orders', { params });
};

export const updateOrderStatus = (id: number, status: string) => {
  return request.put<any, { message: string; order: Order }>(`/admin/orders/${id}/status`, { status });
};
