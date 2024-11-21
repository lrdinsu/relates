import { create } from 'zustand';

type TitleStore = {
  title: string;
  setTitle: (title: string) => void;
};

export const useTitleStore = create<TitleStore>((set) => ({
  title: 'Home',
  setTitle: (title) => set({ title }),
}));
