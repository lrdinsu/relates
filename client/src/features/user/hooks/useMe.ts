import { axiosInstance } from '@/api/axiosConfig.ts';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore.ts';

export type MeResponse = {
  username: string;
  profilePic: string | null;
};

export function useMe() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await axiosInstance.get<MeResponse>('/users/me');
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
