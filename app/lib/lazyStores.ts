/**
 * Lazy Store Loader
 *
 * CRITICAL: This file provides deferred loading of all stores and services
 * to prevent native module crashes at JavaScript bundle load time.
 *
 * All stores and services that touch native modules MUST be loaded through
 * this file to ensure they are not evaluated until the app is ready.
 */

type AuthStoreModule = typeof import('../store/authStore');
type RecipientStoreModule = typeof import('../store/recipientStore');
type GiftStoreModule = typeof import('../store/giftStore');
type UiStoreModule = typeof import('../store/uiStore');

let authStoreModule: AuthStoreModule | null = null;
let recipientStoreModule: RecipientStoreModule | null = null;
let giftStoreModule: GiftStoreModule | null = null;
let uiStoreModule: UiStoreModule | null = null;

/**
 * Lazily load the auth store module
 */
export async function getAuthStoreModule(): Promise<AuthStoreModule> {
  if (!authStoreModule) {
    authStoreModule = await import('../store/authStore');
  }
  return authStoreModule;
}

/**
 * Lazily load the recipient store module
 */
export async function getRecipientStoreModule(): Promise<RecipientStoreModule> {
  if (!recipientStoreModule) {
    recipientStoreModule = await import('../store/recipientStore');
  }
  return recipientStoreModule;
}

/**
 * Lazily load the gift store module
 */
export async function getGiftStoreModule(): Promise<GiftStoreModule> {
  if (!giftStoreModule) {
    giftStoreModule = await import('../store/giftStore');
  }
  return giftStoreModule;
}

/**
 * Lazily load the UI store module
 */
export async function getUiStoreModule(): Promise<UiStoreModule> {
  if (!uiStoreModule) {
    uiStoreModule = await import('../store/uiStore');
  }
  return uiStoreModule;
}

/**
 * Load all stores at once - useful for screens that need multiple stores
 */
export async function loadAllStores() {
  const [auth, recipient, gift, ui] = await Promise.all([
    getAuthStoreModule(),
    getRecipientStoreModule(),
    getGiftStoreModule(),
    getUiStoreModule(),
  ]);

  return {
    useAuthStore: auth.useAuthStore,
    useRecipientStore: recipient.useRecipientStore,
    useGiftStore: gift.useGiftStore,
    useUIStore: ui.useUIStore,
  };
}

/**
 * Load auth and recipient stores - common combination for most screens
 */
export async function loadCoreStores() {
  const [auth, recipient] = await Promise.all([
    getAuthStoreModule(),
    getRecipientStoreModule(),
  ]);

  return {
    useAuthStore: auth.useAuthStore,
    useRecipientStore: recipient.useRecipientStore,
  };
}
