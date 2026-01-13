import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GiftIdea } from './recipientStore';

interface GiftState {
  allGifts: GiftIdea[];
  savedGifts: GiftIdea[];
  purchasedGifts: GiftIdea[];
  currentGifts: GiftIdea[];
  isGenerating: boolean;
  generationProgress: string;
  error: string | null;
}

interface GiftActions {
  setAllGifts: (gifts: GiftIdea[]) => void;
  setCurrentGifts: (gifts: GiftIdea[]) => void;
  addGift: (gift: GiftIdea) => void;
  updateGift: (id: string, updates: Partial<GiftIdea>) => void;
  removeGift: (id: string) => void;
  saveGift: (id: string) => void;
  unsaveGift: (id: string) => void;
  markAsPurchased: (id: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useGiftStore = create<GiftState & GiftActions>()(
  persist(
    (set, get) => ({
      allGifts: [],
      savedGifts: [],
      purchasedGifts: [],
      currentGifts: [],
      isGenerating: false,
      generationProgress: '',
      error: null,

      setAllGifts: (gifts) => set({ allGifts: gifts, error: null }),
      setCurrentGifts: (gifts) => set({ currentGifts: gifts, error: null }),
      
      addGift: (gift) => {
        set({
          allGifts: [...get().allGifts, gift],
        });
      },
      
      updateGift: (id, updates) => {
        set({
          allGifts: get().allGifts.map((g) => (g.id === id ? { ...g, ...updates } : g)),
          savedGifts: get().savedGifts.map((g) => (g.id === id ? { ...g, ...updates } : g)),
          purchasedGifts: get().purchasedGifts.map((g) => (g.id === id ? { ...g, ...updates } : g)),
          currentGifts: get().currentGifts.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        });
      },
      
      removeGift: (id) => {
        set({
          allGifts: get().allGifts.filter((g) => g.id !== id),
          savedGifts: get().savedGifts.filter((g) => g.id !== id),
          purchasedGifts: get().purchasedGifts.filter((g) => g.id !== id),
          currentGifts: get().currentGifts.filter((g) => g.id !== id),
        });
      },
      
      saveGift: (id) => {
        const gift = get().allGifts.find((g) => g.id === id);
        if (gift && !gift.isSaved) {
          set({
            allGifts: get().allGifts.map((g) => (g.id === id ? { ...g, isSaved: true } : g)),
            savedGifts: [...get().savedGifts, { ...gift, isSaved: true }],
            currentGifts: get().currentGifts.map((g) => (g.id === id ? { ...g, isSaved: true } : g)),
          });
        }
      },
      
      unsaveGift: (id) => {
        set({
          allGifts: get().allGifts.map((g) => (g.id === id ? { ...g, isSaved: false } : g)),
          savedGifts: get().savedGifts.filter((g) => g.id !== id),
          currentGifts: get().currentGifts.map((g) => (g.id === id ? { ...g, isSaved: false } : g)),
        });
      },
      
      markAsPurchased: (id) => {
        const gift = get().allGifts.find((g) => g.id === id);
        if (gift && !gift.isPurchased) {
          set({
            allGifts: get().allGifts.map((g) => (g.id === id ? { ...g, isPurchased: true } : g)),
            purchasedGifts: [...get().purchasedGifts, { ...gift, isPurchased: true }],
            currentGifts: get().currentGifts.map((g) => (g.id === id ? { ...g, isPurchased: true } : g)),
          });
        }
      },
      
      setIsGenerating: (isGenerating) => set({ isGenerating, error: null }),
      setGenerationProgress: (progress) => set({ generationProgress: progress }),
      setError: (error) => set({ error, isGenerating: false }),
      clearError: () => set({ error: null }),
      
      reset: () => set({
        allGifts: [],
        savedGifts: [],
        purchasedGifts: [],
        currentGifts: [],
        isGenerating: false,
        generationProgress: '',
        error: null,
      }),
    }),
    {
      name: 'gift-storage',
      storage: createJSONStorage(() => require('@react-native-async-storage/async-storage').default),
    }
  )
);
