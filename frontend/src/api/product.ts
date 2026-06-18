import request from '@/utils/request';
import type { Product, ApiResponse, Review } from '@/types';

export const getProducts = (params: {
  category?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
  isActive?: boolean | 'all' | '';
  maxStock?: number;
  minStock?: number;
}) => {
  return request.get<any, ApiResponse<Product[]>>('/products', { params });
};

export const getProductById = (id: number) => {
  return request.get<any, { product: Product; reviews: Review[]; reviewCount: number }>(`/products/${id}`);
};

export const getProductReviews = (id: number, params?: { page?: number; pageSize?: number }) => {
  return request.get<any, ApiResponse<Review[]>>(`/products/${id}/reviews`, { params });
};

export const createProduct = (data: Partial<Product>) => {
  return request.post<any, Product>('/products', data);
};

export const updateProduct = (id: number, data: Partial<Product>) => {
  return request.put<any, Product>(`/products/${id}`, data);
};

export const deleteProduct = (id: number) => {
  return request.delete<any, { message: string }>(`/products/${id}`);
};

export const updateProductStatus = (id: number, isActive: boolean) => {
  return request.patch<any, { message: string; product: Product }>(`/products/${id}/status`, { isActive });
};
