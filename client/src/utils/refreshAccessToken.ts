import { AuthResponse, axiosInstance } from '@/api/axiosConfig.ts';
import { useAuthStore } from '@/stores/authStore.ts';

export async function refreshAccessToken() {
  try {
    const response = await axiosInstance.get<AuthResponse>(
      '/auth/refresh-token',
    );
    const { accessToken, userId } = response.data;
    useAuthStore.getState().setAccessToken(accessToken, userId);
    return response.data.accessToken;
  } catch {
    useAuthStore.getState().setAccessToken(null, null);
    return null;
  }
}
