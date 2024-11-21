import { create } from 'zustand';

type AuthState = {
  accessToken: string | null;
  userId: number | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string | null, userId?: number | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  userId: null,
  setAccessToken: (token, userId = null) =>
    set({ accessToken: token, isAuthenticated: Boolean(token), userId }),
}));
