# RibbonApp Migration Verification PRD

This document defines verification tasks to audit the migration work, ensuring all code is syntactically correct, properly structured, and won't cause runtime issues. Ralphy will execute these tasks sequentially.

---

## Phase 1: Verify Constants & Types

- [ ] Verify `app/constants.ts` exports COLORS, SPACING, FONTS, RADIUS - check syntax and types are valid
- [ ] Verify `app/constants/faq.ts` has proper TypeScript syntax and exports FAQ data
- [ ] Verify `app/constants/storageKeys.ts` exports storage key constants with proper typing
- [ ] Verify `app/types.ts` has valid Recipient, Gift, User interface definitions
- [ ] Verify `app/types/api.ts` has valid API response types with no circular dependencies
- [ ] Verify `app/types/errors.ts` has valid error type definitions
- [ ] Verify `app/types/recipient.ts` has valid Recipient-related types
- [ ] Verify `app/types/settings.ts` has valid Settings types
- [ ] Verify `app/types/subscription.ts` has valid Subscription types (no RevenueCat references)
- [ ] Verify `app/types/user.ts` has valid User types
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript errors in types

---

## Phase 2: Verify Utilities

- [ ] Verify `app/utils/logger.ts` has valid logging functions with proper exports
- [ ] Verify `app/utils/dates.ts` has valid date formatting utilities
- [ ] Verify `app/utils/helpers.ts` uses Math.random (NOT expo-crypto) - grep for "expo-crypto"
- [ ] Verify `app/utils/analytics.ts` is stubbed/no-op and doesn't import banned packages
- [ ] Verify `app/utils/debounce.ts` has valid debounce implementation
- [ ] Verify `app/utils/errorMessages.ts` has valid error message utilities
- [ ] Verify `app/utils/merge.ts` has valid merge utility functions
- [ ] Verify `app/utils/validation.ts` has valid Zod schemas - check Zod is in package.json
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript errors in utils

---

## Phase 3: Verify Safe Storage Layer

- [ ] Verify `app/lib/safeStorage.ts` uses dynamic import with try/catch for AsyncStorage
- [ ] Verify `app/lib/safeStorage.ts` has fallback behavior when AsyncStorage unavailable
- [ ] Verify `app/lib/secureStorage.ts` uses dynamic import with try/catch for expo-secure-store
- [ ] Verify `app/lib/secureStorage.ts` has fallback behavior when SecureStore unavailable
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript errors in lib

---

## Phase 4: Verify Stores

- [ ] Verify `app/store/authStore.ts` uses Zustand with proper TypeScript types
- [ ] Verify `app/store/authStore.ts` uses getSafeStorage() for persistence (not direct AsyncStorage)
- [ ] Verify `app/store/giftStore.ts` uses Zustand with proper TypeScript types
- [ ] Verify `app/store/giftStore.ts` uses getSafeStorage() for persistence
- [ ] Verify `app/store/recipientStore.ts` uses Zustand with proper TypeScript types
- [ ] Verify `app/store/recipientStore.ts` uses getSafeStorage() for persistence
- [ ] Verify `app/store/uiStore.ts` has valid UI state management
- [ ] Verify `app/store/index.ts` properly exports all stores
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript errors in stores

---

## Phase 5: Verify Services

- [ ] Verify `app/services/authService.ts` has valid auth functions with proper error handling
- [ ] Verify `app/services/recipientService.ts` has valid recipient CRUD operations
- [ ] Verify `app/services/giftService.ts` has valid gift-related functions
- [ ] Verify `app/services/giftParser.ts` has valid gift parsing logic
- [ ] Verify `app/services/rateLimitService.ts` has valid rate limiting implementation
- [ ] Verify `app/services/aiService.ts` has valid AI service integration (if exists)
- [ ] Verify `app/services/storage.ts` has valid storage service functions
- [ ] Verify `app/services/encryptedStorage.ts` has proper encryption handling with fallbacks
- [ ] Verify `app/services/errorLogger.ts` has valid error logging (no Sentry imports)
- [ ] Grep all services for banned imports: react-native-purchases, @sentry/react-native, expo-notifications, expo-local-authentication, expo-crypto
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript errors in services

---

## Phase 6: Verify Prompts

- [ ] Verify `app/prompts/system.prompt.ts` has valid system prompt template
- [ ] Verify `app/prompts/birthday.prompt.ts` has valid birthday prompt template
- [ ] Verify `app/prompts/anniversary.prompt.ts` has valid anniversary prompt template
- [ ] Verify `app/prompts/holiday.prompt.ts` has valid holiday prompt template
- [ ] Verify `app/prompts/custom.prompt.ts` has valid custom prompt template
- [ ] Verify `app/prompts/index.ts` properly exports all prompts
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript errors in prompts

---

## Phase 7: Verify App Entry Points

- [ ] Verify `app/_layout.tsx` has valid Expo Router layout structure
- [ ] Verify `app/_layout.tsx` properly wraps app with required providers
- [ ] Verify `app/index.tsx` has valid entry point routing logic
- [ ] Verify all imports in entry points resolve correctly
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript errors in entry points

---

## Phase 8: Verify Package Dependencies

- [ ] Verify package.json does NOT contain `react-native-purchases`
- [ ] Verify package.json does NOT contain `@sentry/react-native`
- [ ] Verify package.json does NOT contain `expo-notifications`
- [ ] Verify package.json does NOT contain `expo-local-authentication`
- [ ] Verify package.json does NOT contain `expo-crypto`
- [ ] Verify package.json contains required dependencies: zustand, zod, @supabase/supabase-js
- [ ] Verify package.json contains expo-router and related navigation dependencies
- [ ] Run `npm ls` to check for any missing or conflicting dependencies

---

## Phase 9: Verify App Configuration

- [ ] Verify `app.json` has valid JSON syntax
- [ ] Verify `app.json` has `newArchEnabled: false` in expo.plugins or equivalent
- [ ] Verify `app.json` has correct bundle identifier (com.ribbon.app or similar)
- [ ] Verify `app.json` has privacy policy URL configured
- [ ] Verify `app.json` has support/contact information configured
- [ ] Verify `eas.json` has valid EAS Build configuration
- [ ] Verify `tsconfig.json` has valid TypeScript configuration for Expo

---

## Phase 10: Verify GitHub Workflow

- [ ] Verify `.github/workflows/ios-testflight.yml` has valid YAML syntax
- [ ] Verify workflow triggers on push to main branch
- [ ] Verify workflow has all required secrets referenced (APP_STORE_CONNECT_API_KEY_ID, etc.)
- [ ] Verify workflow runs `npm ci` for dependency installation
- [ ] Verify workflow runs `npx expo prebuild` before building
- [ ] Verify workflow uses fastlane for TestFlight deployment
- [ ] Verify workflow has proper environment variables set

---

## Phase 11: Verify Cross-File Imports

- [ ] Run `npx tsc --noEmit` on entire codebase - fix any errors found
- [ ] Verify all barrel exports (index.ts files) properly re-export their modules
- [ ] Verify no circular dependencies exist using `npx madge --circular app/`
- [ ] Verify all relative imports use correct paths
- [ ] Verify all absolute imports (if any) are configured in tsconfig.json

---

## Phase 12: Verify Runtime Safety Patterns

- [ ] Verify all native module imports use try/catch pattern for graceful fallback
- [ ] Verify all async functions have proper error handling
- [ ] Verify all Zustand stores have proper initial state
- [ ] Verify all API calls have error handling and don't crash on network failures
- [ ] Verify all storage operations handle cases where storage is unavailable

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
