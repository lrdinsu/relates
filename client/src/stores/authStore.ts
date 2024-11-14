// src/stores/authStore.ts
import { NavigateFunction } from 'react-router-dom';
import { create } from 'zustand';

// Define the possible views
type AuthView = 'login' | 'signup' | 'forgotpassword';

// Define the Zustand store interface
type AuthStore = {
  currentView: AuthView;
  setView: (view: AuthView, navigate: NavigateFunction) => void;
};

// Create the Zustand store
export const useAuthStore = create<AuthStore>((set) => ({
  currentView: 'login',
  setView: (view, navigate) => {
    set({ currentView: view });
    navigate(`/${view}`);
  },
}));
