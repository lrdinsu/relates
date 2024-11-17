import { AuthResponse, axiosInstance } from '@/api/axiosConfig.ts';
import { useAuthStore } from '@/stores/authStore.ts';

export async function refreshAccessToken() {
  try {
    const response = await axiosInstance.get<AuthResponse>(
      '/auth/refresh-token',
    );
    const accessToken = response.data.accessToken;
    useAuthStore.getState().setAccessToken(accessToken);
    return response.data.accessToken;
  } catch {
    useAuthStore.getState().setAccessToken(null);
    return null;
  }
}
