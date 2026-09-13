import { create } from 'zustand';
import { User, UserProgress } from '@/types';

interface UserStoreState {
  user: User | null;
  progress: UserProgress | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProgress: (progress: UserProgress | null) => void;
  setLoading: (loading: boolean) => void;
  updateXP: (xp: number) => void;
  addBadge: (badge: string) => void;
  updateStreak: (streak: number) => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  progress: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProgress: (progress) => set({ progress }),
  setLoading: (loading) => set({ isLoading: loading }),
  updateXP: (xp) =>
    set((state) => ({
      progress: state.progress
        ? { ...state.progress, xp: state.progress.xp + xp }
        : null,
    })),
  addBadge: (badge) =>
    set((state) => ({
      progress: state.progress
        ? { ...state.progress, badges: [...state.progress.badges, badge] }
        : null,
    })),
  updateStreak: (streak) =>
    set((state) => ({
      progress: state.progress
        ? { ...state.progress, studyStreak: streak }
        : null,
    })),
}));
