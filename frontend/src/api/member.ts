import request from '@/utils/request';
import type { Member, ApiResponse } from '@/types';

export const register = (data: { phone: string; name: string; password?: string }) => {
  return request.post<any, { token: string; member: Member; message: string }>('/auth/register', data);
};

export const login = (data: { phone: string; password: string }) => {
  return request.post<any, { token: string; member: Member; message: string }>('/auth/login', data);
};

export const getProfile = () => {
  return request.get<any, Member>('/member/profile');
};

export const updateProfile = (data: Partial<Member> & { password?: string }) => {
  return request.put<any, { message: string; member: Member }>('/member/profile', data);
};

export const getMembers = (params?: { page?: number; pageSize?: number; keyword?: string; level?: string }) => {
  return request.get<any, ApiResponse<Member[]>>('/admin/members', { params });
};

export const getMemberById = (id: number) => {
  return request.get<any, Member>(`/admin/members/${id}`);
};
