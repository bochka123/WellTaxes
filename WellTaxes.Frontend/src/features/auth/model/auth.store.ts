import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    userId: string | null;
    isAuthenticated: boolean;
    setAuth: (userId: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            userId: null,
            isAuthenticated: false,
            setAuth: (userId) => set({ userId, isAuthenticated: true }),
            clearAuth: () => set({ userId: null, isAuthenticated: false }),
        }),
        { name: 'auth-storage' }
    )
);
