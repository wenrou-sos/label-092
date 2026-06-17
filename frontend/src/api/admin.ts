import request from '@/utils/request';

export const adminLogin = (data: { username: string; password: string }) => {
  return request.post<any, { token: string; admin: { id: number; username: string; name: string }; message: string }>(
    '/admin/login',
    data
  );
};

export const getAdminProfile = () => {
  return request.get<any, { id: number; username: string; name: string }>('/admin/profile');
};

export const uploadImage = (type: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<any, { url: string; filename: string; message: string }>(
    `/admin/upload/${type}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};
