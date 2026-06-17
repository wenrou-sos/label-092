import request from '@/utils/request';
import type { Review, ApiResponse } from '@/types';

export const createReview = (data: {
  productId: number;
  rating: number;
  content?: string;
  images?: string;
}) => {
  return request.post<any, { message: string; review: Review }>('/reviews', data);
};

export const getMyReviews = (params?: { page?: number; pageSize?: number }) => {
  return request.get<any, ApiResponse<Review[]>>('/reviews/my', { params });
};
