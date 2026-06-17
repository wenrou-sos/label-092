import request from '@/utils/request';
import type { TastingEvent, TastingRegistration, ApiResponse } from '@/types';

export const getEvents = (params?: { status?: string; page?: number; pageSize?: number }) => {
  return request.get<any, ApiResponse<TastingEvent[]>>('/tastings', { params });
};

export const getEventById = (id: number) => {
  return request.get<any, TastingEvent>(`/tastings/${id}`);
};

export const registerEvent = (eventId: number, data?: { guestsCount?: number; remark?: string }) => {
  return request.post<any, { message: string; registration: TastingRegistration }>(
    `/tastings/${eventId}/register`,
    data
  );
};

export const getMyRegistrations = (params?: { page?: number; pageSize?: number }) => {
  return request.get<any, ApiResponse<TastingRegistration[]>>('/tastings/registrations/my', { params });
};

export const cancelRegistration = (id: number) => {
  return request.post<any, { message: string }>(`/tastings/registrations/${id}/cancel`);
};

export const createEvent = (data: Partial<TastingEvent>) => {
  return request.post<any, TastingEvent>('/tastings', data);
};

export const updateEvent = (id: number, data: Partial<TastingEvent>) => {
  return request.put<any, TastingEvent>(`/tastings/${id}`, data);
};

export const deleteEvent = (id: number) => {
  return request.delete<any, { message: string }>(`/tastings/${id}`);
};

export const getEventRegistrations = (eventId: number, params?: { page?: number; pageSize?: number }) => {
  return request.get<any, ApiResponse<TastingRegistration[]>>(`/tastings/${eventId}/registrations`, { params });
};
