# RibbonApp Migration Verification PRD

This document defines verification tasks to audit the migration work, ensuring all code is syntactically correct, properly structured, and won't cause runtime issues. Ralphy will execute these tasks sequentially.

---

## Phase 1: Verify Constants & Types

- [x] Verify `app/constants.ts` exports COLORS, SPACING, FONTS, RADIUS - check syntax and types are valid
- [x] Verify `app/constants/faq.ts` has proper TypeScript syntax and exports FAQ data
- [x] Verify `app/constants/storageKeys.ts` exports storage key constants with proper typing
- [x] Verify `app/types.ts` has valid Recipient, Gift, User interface definitions
- [x] Verify `app/types/api.ts` has valid API response types with no circular dependencies
- [x] Verify `app/types/errors.ts` has valid error type definitions
- [x] Verify `app/types/recipient.ts` has valid Recipient-related types
- [x] Verify `app/types/settings.ts` has valid Settings types
- [x] Verify `app/types/subscription.ts` has valid Subscription types (no RevenueCat references)
- [x] Verify `app/types/user.ts` has valid User types
- [x] Run `npx tsc --noEmit` to confirm no TypeScript errors in types

---

## Phase 2: Verify Utilities

- [x] Verify `app/utils/logger.ts` has valid logging functions with proper exports
- [x] Verify `app/utils/dates.ts` has valid date formatting utilities
- [x] Verify `app/utils/helpers.ts` uses Math.random (NOT expo-crypto) - grep for "expo-crypto"
- [x] Verify `app/utils/analytics.ts` is stubbed/no-op and doesn't import banned packages
- [x] Verify `app/utils/debounce.ts` has valid debounce implementation
- [x] Verify `app/utils/errorMessages.ts` has valid error message utilities
- [x] Verify `app/utils/merge.ts` has valid merge utility functions
- [x] Verify `app/utils/validation.ts` has valid Zod schemas - check Zod is in package.json
- [x] Run `npx tsc --noEmit` to confirm no TypeScript errors in utils

---

## Phase 3: Verify Safe Storage Layer

- [x] Verify `app/lib/safeStorage.ts` uses dynamic import with try/catch for AsyncStorage
- [x] Verify `app/lib/safeStorage.ts` has fallback behavior when AsyncStorage unavailable
- [x] Verify `app/lib/secureStorage.ts` uses dynamic import with try/catch for expo-secure-store
- [x] Verify `app/lib/secureStorage.ts` has fallback behavior when SecureStore unavailable
- [x] Run `npx tsc --noEmit` to confirm no TypeScript errors in lib

---

## Phase 4: Verify Stores

- [x] Verify `app/store/authStore.ts` uses Zustand with proper TypeScript types
- [x] Verify `app/store/authStore.ts` uses getSafeStorage() for persistence (not direct AsyncStorage)
- [x] Verify `app/store/giftStore.ts` uses Zustand with proper TypeScript types
- [x] Verify `app/store/giftStore.ts` uses getSafeStorage() for persistence
- [x] Verify `app/store/recipientStore.ts` uses Zustand with proper TypeScript types
- [x] Verify `app/store/recipientStore.ts` uses getSafeStorage() for persistence
- [x] Verify `app/store/uiStore.ts` has valid UI state management
- [x] Verify `app/store/index.ts` properly exports all stores
- [x] Run `npx tsc --noEmit` to confirm no TypeScript errors in stores

---

## Phase 5: Verify Services

- [x] Verify `app/services/authService.ts` has valid auth functions with proper error handling
- [x] Verify `app/services/recipientService.ts` has valid recipient CRUD operations
- [x] Verify `app/services/giftService.ts` has valid gift-related functions
- [x] Verify `app/services/giftParser.ts` has valid gift parsing logic
- [x] Verify `app/services/rateLimitService.ts` has valid rate limiting implementation
- [x] Verify `app/services/aiService.ts` has valid AI service integration (if exists)
- [x] Verify `app/services/storage.ts` has valid storage service functions
- [x] Verify `app/services/encryptedStorage.ts` has proper encryption handling with fallbacks
- [x] Verify `app/services/errorLogger.ts` has valid error logging (no Sentry imports)
- [x] Grep all services for banned imports: react-native-purchases, @sentry/react-native, expo-notifications, expo-local-authentication, expo-crypto
- [x] Run `npx tsc --noEmit` to confirm no TypeScript errors in services

---

## Phase 6: Verify Prompts

- [x] Verify `app/prompts/system.prompt.ts` has valid system prompt template
- [x] Verify `app/prompts/birthday.prompt.ts` has valid birthday prompt template
- [x] Verify `app/prompts/anniversary.prompt.ts` has valid anniversary prompt template
- [x] Verify `app/prompts/holiday.prompt.ts` has valid holiday prompt template
- [x] Verify `app/prompts/custom.prompt.ts` has valid custom prompt template
- [x] Verify `app/prompts/index.ts` properly exports all prompts
- [x] Run `npx tsc --noEmit` to confirm no TypeScript errors in prompts

---

## Phase 7: Verify App Entry Points

- [x] Verify `app/_layout.tsx` has valid Expo Router layout structure
- [x] Verify `app/_layout.tsx` properly wraps app with required providers
- [x] Verify `app/index.tsx` has valid entry point routing logic
- [x] Verify all imports in entry points resolve correctly
- [x] Run `npx tsc --noEmit` to confirm no TypeScript errors in entry points

---

## Phase 8: Verify Package Dependencies

- [x] Verify package.json does NOT contain `react-native-purchases`
- [x] Verify package.json does NOT contain `@sentry/react-native`
- [x] Verify package.json does NOT contain `expo-notifications`
- [x] Verify package.json does NOT contain `expo-local-authentication`
- [x] Verify package.json does NOT contain `expo-crypto`
- [x] Verify package.json contains required dependencies: zustand, zod, @supabase/supabase-js
- [x] Verify package.json contains expo-router and related navigation dependencies
- [x] Run `npm ls` to check for any missing or conflicting dependencies

---

## Phase 9: Verify App Configuration

- [x] Verify `app.json` has valid JSON syntax
- [x] Verify `app.json` has `newArchEnabled: false` in expo.plugins or equivalent
- [x] Verify `app.json` has correct bundle identifier (com.ribbon.app or similar)
- [x] Verify `app.json` has privacy policy URL configured
- [x] Verify `app.json` has support/contact information configured
- [x] Verify `eas.json` has valid EAS Build configuration
- [x] Verify `tsconfig.json` has valid TypeScript configuration for Expo

---

## Phase 10: Verify GitHub Workflow

- [x] Verify `.github/workflows/ios-testflight.yml` has valid YAML syntax
- [x] Verify workflow triggers on push to main branch
- [x] Verify workflow has all required secrets referenced (APP_STORE_CONNECT_API_KEY_ID, etc.)
- [x] Verify workflow runs `npm ci` for dependency installation
- [x] Verify workflow runs `npx expo prebuild` before building
- [x] Verify workflow uses fastlane for TestFlight deployment
- [x] Verify workflow has proper environment variables set

---

## Phase 11: Verify Cross-File Imports

- [x] Run `npx tsc --noEmit` on entire codebase - fix any errors found
- [x] Verify all barrel exports (index.ts files) properly re-export their modules
- [x] Verify no circular dependencies exist using `npx madge --circular app/`
- [x] Verify all relative imports use correct paths
- [x] Verify all absolute imports (if any) are configured in tsconfig.json

---

## Phase 12: Verify Runtime Safety Patterns

- [x] Verify all native module imports use try/catch pattern for graceful fallback
- [x] Verify all async functions have proper error handling
- [x] Verify all Zustand stores have proper initial state
- [x] Verify all API calls have error handling and don't crash on network failures
- [x] Verify all storage operations handle cases where storage is unavailable

---

## Phase 13: Verify Code Quality

- [ ] Check for any `console.log` statements that should be removed (use logger instead)
- [ ] Check for any hardcoded secrets or API keys in source code
- [ ] Check for any TODO/FIXME comments that indicate incomplete work
- [ ] Check for any unused imports in all TypeScript files
- [ ] Check for any unused variables or functions
- [ ] Verify consistent code formatting across all files

---

## Phase 14: Verify Type Safety

- [ ] Verify no `any` types are used unnecessarily - grep for `: any` and review each
- [ ] Verify all function parameters have proper TypeScript types
- [ ] Verify all function return types are properly typed
- [ ] Verify all React components have proper Props interfaces
- [ ] Verify all Zustand store states have proper type definitions

---

## Phase 15: Verify Error Handling Patterns

- [ ] Verify ErrorBoundary component exists and catches React errors
- [ ] Verify ErrorBoundary has NO Sentry imports
- [ ] Verify all services have consistent error handling patterns
- [ ] Verify error messages are user-friendly in errorMessages.ts
- [ ] Verify errors are logged appropriately via errorLogger.ts

---

## Phase 16: Verify Data Flow

- [ ] Trace auth flow: authService -> authStore -> components (verify data flows correctly)
- [ ] Trace recipient flow: recipientService -> recipientStore -> components
- [ ] Trace gift flow: giftService -> giftStore -> components
- [ ] Verify stores properly update when services return data
- [ ] Verify components properly subscribe to store changes

---

## Phase 17: Verify Storage Persistence

- [ ] Verify authStore persists user session correctly
- [ ] Verify recipientStore persists recipient data correctly
- [ ] Verify giftStore persists gift data correctly
- [ ] Verify storage keys in storageKeys.ts are unique and descriptive
- [ ] Verify storage operations are async and don't block UI

---

## Phase 18: Verify Supabase Integration

- [ ] Verify `app/lib/supabase.ts` exists and initializes Supabase client
- [ ] Verify Supabase client uses environment variables for URL and key
- [ ] Verify Supabase client handles initialization errors gracefully
- [ ] Verify auth service properly integrates with Supabase auth
- [ ] Verify database operations use proper Supabase query patterns

---

## Phase 19: Verify Expo Router Setup

- [ ] Verify `app/_layout.tsx` sets up navigation correctly
- [ ] Verify file-based routing structure matches expected routes
- [ ] Verify all route files export default React components
- [ ] Verify navigation between routes works (no broken links)
- [ ] Verify deep linking configuration in app.json (if applicable)

---

## Phase 20: Final Verification & Summary

- [ ] Run full TypeScript check: `npx tsc --noEmit`
- [ ] Run dependency check: `npm ls`
- [ ] Generate summary report of all verification results
- [ ] Document any issues found that need manual resolution
- [ ] Create GitHub issues for any problems discovered during verification
- [ ] Mark verification PRD as complete

---

## Critical Rules Reminder

1. **NEVER install banned dependencies:**
   - `react-native-purchases`
   - `@sentry/react-native`
   - `expo-notifications`
   - `expo-local-authentication`
   - `expo-crypto`

2. **All native modules MUST use dynamic imports with try/catch**

3. **Report issues - don't silently skip problems**

4. **Create GitHub issues for any problems found**

---

## Success Criteria

- [ ] All 20 phases complete with no blocking issues
- [ ] Zero TypeScript errors
- [ ] Zero banned dependency imports in codebase
- [ ] All cross-file imports resolve correctly
- [ ] All stores properly persist data
- [ ] All services have proper error handling
- [ ] GitHub workflow is valid and ready to run
