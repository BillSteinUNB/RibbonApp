import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GiftIdea } from './recipientStore';
import type { GenerationSession } from '../types/recipient';
import { generateSecureSessionId } from '../utils/helpers';

interface GiftState {
  allGifts: GiftIdea[];
  savedGifts: GiftIdea[];
  purchasedGifts: GiftIdea[];
  currentGifts: GiftIdea[];
  isGenerating: boolean;
  generationProgress: string;
  error: string | null;
  // Refinement state
  currentSessionId: string | null;
  generationSessions: Record<string, GenerationSession>;
  isRefining: boolean;
  refinementProgress: string;
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
  // Refinement actions
  createGenerationSession: (recipientId: string, giftIds: string[]) => string;
  getSession: (sessionId: string) => GenerationSession | null;
  canRefineSession: (sessionId: string) => boolean;
  setGiftFeedback: (giftId: string, feedback: 'liked' | 'disliked' | null) => void;
  markSessionAsRefined: (sessionId: string, refinementData: GenerationSession['refinementData']) => void;
  setIsRefining: (isRefining: boolean) => void;
  setRefinementProgress: (progress: string) => void;
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
      currentSessionId: null,
      generationSessions: {},
      isRefining: false,
      refinementProgress: '',

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
        currentSessionId: null,
        generationSessions: {},
        isRefining: false,
        refinementProgress: '',
      }),

      // Refinement action implementations
      createGenerationSession: (recipientId: string, giftIds: string[]) => {
        const sessionId = generateSecureSessionId('session');
        const session: GenerationSession = {
          id: sessionId,
          recipientId,
          createdAt: new Date().toISOString(),
          hasBeenRefined: false,
          originalGiftIds: giftIds,
        };

        set({
          currentSessionId: sessionId,
          generationSessions: {
            ...get().generationSessions,
            [sessionId]: session,
          },
        });

        return sessionId;
      },

      getSession: (sessionId: string) => {
        return get().generationSessions[sessionId] || null;
      },

      canRefineSession: (sessionId: string) => {
        const session = get().generationSessions[sessionId];
        return session ? !session.hasBeenRefined : false;
      },

      setGiftFeedback: (giftId: string, feedback: 'liked' | 'disliked' | null) => {
        set({
          allGifts: get().allGifts.map((g) =>
            g.id === giftId ? { ...g, refinementFeedback: feedback } : g
          ),
          currentGifts: get().currentGifts.map((g) =>
            g.id === giftId ? { ...g, refinementFeedback: feedback } : g
          ),
        });
      },

      markSessionAsRefined: (sessionId: string, refinementData: GenerationSession['refinementData']) => {
        const session = get().generationSessions[sessionId];
        if (session) {
          set({
            generationSessions: {
              ...get().generationSessions,
              [sessionId]: {
                ...session,
                hasBeenRefined: true,
                refinementData,
              },
            },
          });
        }
      },

      setIsRefining: (isRefining: boolean) => set({ isRefining, error: null }),
      setRefinementProgress: (progress: string) => set({ refinementProgress: progress }),
    }),
    {
      name: 'gift-storage',
      storage: createJSONStorage(() => require('@react-native-async-storage/async-storage').default),
    }
  )
);
