import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getSafeStorage } from '../lib/safeStorage';

// Re-export all stores for convenience
export { useAuthStore } from './authStore';
export { useRecipientStore } from './recipientStore';
export { useGiftStore } from './giftStore';
export { useOnboardingStore } from './onboardingStore';
export { useUIStore } from './uiStore';

export interface StoreState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface StoreActions<T> {
  setData: (data: T) => void;
  clearData: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export function createStore<T>(
  name: string,
  initialState: StoreState<T>
) {
  return create<StoreState<T> & StoreActions<T>>()(
    persist(
      (set) => ({
        ...initialState,
        setData: (data) => set({ data, error: null }),
        clearData: () => set({ data: null }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error, isLoading: false }),
        reset: () => set(initialState),
      }),
      {
        name,
        storage: createJSONStorage(() => getSafeStorage()),
      }
    )
  );
}
