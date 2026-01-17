import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getSafeStorage } from '../lib/safeStorage';

export type ModalType = 'none' | 'upgrade' | 'deleteRecipient' | 'signOut' | 'settings';

interface UIState {
  isBottomSheetOpen: boolean;
  activeModal: ModalType;
  modalData: any;
  isLoadingOverlay: boolean;
  loadingMessage: string;
  theme: 'light' | 'dark' | 'auto';
  keyboardVisible: boolean;
  keyboardHeight: number;
}

interface UIActions {
  openBottomSheet: () => void;
  closeBottomSheet: () => void;
  openModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;
  showLoadingOverlay: (message?: string) => void;
  hideLoadingOverlay: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setKeyboardVisible: (visible: boolean) => void;
  setKeyboardHeight: (height: number) => void;
  reset: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      isBottomSheetOpen: false,
      activeModal: 'none',
      modalData: null,
      isLoadingOverlay: false,
      loadingMessage: '',
      theme: 'auto',
      keyboardVisible: false,
      keyboardHeight: 0,

      openBottomSheet: () => set({ isBottomSheetOpen: true }),
      closeBottomSheet: () => set({ isBottomSheetOpen: false }),
      
      openModal: (modal, data) => set({ activeModal: modal, modalData: data || null }),
      closeModal: () => set({ activeModal: 'none', modalData: null }),
      
      showLoadingOverlay: (message = 'Loading...') => set({ isLoadingOverlay: true, loadingMessage: message }),
      hideLoadingOverlay: () => set({ isLoadingOverlay: false, loadingMessage: '' }),
      
      setTheme: (theme) => set({ theme }),
      setKeyboardVisible: (visible) => set({ keyboardVisible: visible }),
      setKeyboardHeight: (height) => set({ keyboardHeight: height }),
      
      reset: () => set({
        isBottomSheetOpen: false,
        activeModal: 'none',
        modalData: null,
        isLoadingOverlay: false,
        loadingMessage: '',
      }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => getSafeStorage()),
    }
  )
);

// Selectors
export const selectActiveModal = (state: UIState & UIActions) => state.activeModal;
export const selectModalData = (state: UIState & UIActions) => state.modalData;
export const selectIsLoadingOverlay = (state: UIState & UIActions) => state.isLoadingOverlay;
export const selectTheme = (state: UIState & UIActions) => state.theme;
