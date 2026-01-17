import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getSafeStorage } from '../lib/safeStorage';

export interface Recipient {
  id: string;
  name: string;
  relationship: string;
  ageRange?: string;
  gender?: string;
  interests: string[];
  dislikes: string;
  budget: {
    minimum: number;
    maximum: number;
    currency: string;
  };
  occasion: {
    type: 'birthday' | 'holiday' | 'anniversary' | 'wedding' | 'other';
    date?: string;
    customName?: string;
  };
  pastGifts: string[];
  notes?: string;
  giftHistory?: GiftIdea[];
  createdAt: string;
  updatedAt: string;
  lastGiftConsultation?: string;
}

export interface GiftIdea {
  id: string;
  recipientId: string;
  name: string;
  description: string;
  reasoning: string;
  price: string;
  category: string;
  url?: string;
  stores: string[];
  tags: string[];
  isSaved: boolean;
  isPurchased: boolean;
  generatedAt: string;
}

interface RecipientState {
  recipients: Recipient[];
  activeRecipient: Recipient | null;
  isLoading: boolean;
  error: string | null;
}

interface RecipientActions {
  setRecipients: (recipients: Recipient[]) => void;
  addRecipient: (recipient: Recipient) => void;
  updateRecipient: (id: string, updates: Partial<Recipient>) => void;
  removeRecipient: (id: string) => void;
  setActiveRecipient: (recipient: Recipient | null) => void;
  addGiftToHistory: (recipientId: string, gift: GiftIdea) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useRecipientStore = create<RecipientState & RecipientActions>()(
  persist(
    (set, get) => ({
      recipients: [],
      activeRecipient: null,
      isLoading: false,
      error: null,

      setRecipients: (recipients) => set({ recipients, error: null }),
      
      addRecipient: (recipient) => {
        set({
          recipients: [...get().recipients, recipient],
          error: null,
        });
      },
      
      updateRecipient: (id, updates) => {
        set({
          recipients: get().recipients.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
          error: null,
        });
      },
      
      removeRecipient: (id) => {
        set({
          recipients: get().recipients.filter((r) => r.id !== id),
          activeRecipient: get().activeRecipient?.id === id ? null : get().activeRecipient,
          error: null,
        });
      },
      
      setActiveRecipient: (recipient) => set({ activeRecipient: recipient }),
      
      addGiftToHistory: (recipientId, gift) => {
        set({
          recipients: get().recipients.map((r) =>
            r.id === recipientId
              ? { ...r, giftHistory: [...(r.giftHistory || []), gift], lastGiftConsultation: new Date().toISOString() }
              : r
          ),
        });
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'recipient-storage',
      storage: createJSONStorage(() => getSafeStorage()),
    }
  )
);

// Selectors
export const selectRecipients = (state: RecipientState & RecipientActions) => state.recipients;
export const selectActiveRecipient = (state: RecipientState & RecipientActions) => state.activeRecipient;
export const selectRecipientById = (id: string) => (state: RecipientState & RecipientActions) =>
  state.recipients.find((r) => r.id === id);
