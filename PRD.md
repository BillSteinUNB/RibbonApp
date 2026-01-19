# RibbonApp Migration PRD

This document defines the complete migration plan for restoring RibbonApp functionality to the fresh Expo baseline. Ralphy will execute these tasks sequentially, marking each complete as it progresses.

## Pre-Migration Setup

- [x] Identify the pre-baseline commit hash using `git log --oneline` to find the last commit before the fresh Expo reset
- [x] Verify the minimal baseline app builds successfully before starting migration
- [x] Confirm all GitHub secrets are configured (APP_STORE_CONNECT_API_KEY_ID, MATCH_GIT_URL, etc.)

---

## Phase 1: Constants & Types (11 tasks)

- [x] Extract `app/constants.ts` from pre-baseline commit using `git show <commit>:app/constants.ts`
- [x] Copy extracted `constants.ts` to `app/constants.ts` (contains COLORS, SPACING, FONTS, RADIUS exports)
- [x] Create `app/constants/` directory if it doesn't exist
- [x] Extract and copy `app/constants/faq.ts` from pre-baseline commit
- [x] Extract and copy `app/constants/storageKeys.ts` from pre-baseline commit
- [x] Extract and copy `app/types.ts` from pre-baseline commit (Recipient, Gift, User interfaces)
- [x] Create `app/types/` directory if it doesn't exist
- [x] Extract and copy `app/types/api.ts` from pre-baseline commit
- [x] Extract and copy `app/types/errors.ts` from pre-baseline commit
- [x] Extract and copy `app/types/recipient.ts`, `app/types/settings.ts`, `app/types/subscription.ts`, `app/types/user.ts` from pre-baseline commit
- [x] Run `npx tsc --noEmit` to verify no TypeScript errors after Phase 1

---

## Phase 2: Utilities (11 tasks)

- [x] Create `app/utils/` directory if it doesn't exist
- [x] Extract and copy `app/utils/logger.ts` from pre-baseline commit
- [x] Extract and copy `app/utils/dates.ts` from pre-baseline commit (date formatting utilities)
- [x] Extract and copy `app/utils/helpers.ts` from pre-baseline commit - VERIFY it uses Math.random NOT expo-crypto
- [x] If helpers.ts contains expo-crypto imports, replace with Math.random implementation
- [x] Extract and copy `app/utils/analytics.ts` from pre-baseline commit (should be stubbed/no-op)
- [x] Extract and copy `app/utils/debounce.ts` from pre-baseline commit
- [x] Extract and copy `app/utils/errorMessages.ts` from pre-baseline commit
- [x] Extract and copy `app/utils/merge.ts` from pre-baseline commit
- [x] Extract and copy `app/utils/validation.ts` from pre-baseline commit (Zod schemas)
- [x] Run `npx tsc --noEmit` to verify no TypeScript errors after Phase 2

---

## Phase 3: Safe Storage Layer (4 tasks)

- [x] Create `app/lib/` directory if it doesn't exist
- [x] Extract and copy `app/lib/safeStorage.ts` from pre-baseline commit - VERIFY it uses dynamic import for AsyncStorage with try/catch
- [x] Extract and copy `app/lib/secureStorage.ts` from pre-baseline commit - VERIFY it uses dynamic import for expo-secure-store with try/catch
- [x] Run `npx tsc --noEmit` to verify no TypeScript errors after Phase 3

---

## Phase 4: Stores (6 tasks)

- [x] Create `app/store/` directory if it doesn't exist
- [x] Extract and copy `app/store/authStore.ts` from pre-baseline commit - ensure it uses getSafeStorage() for persistence
- [x] Extract and copy `app/store/giftStore.ts` from pre-baseline commit - ensure it uses getSafeStorage() for persistence
- [x] Extract and copy `app/store/recipientStore.ts` from pre-baseline commit - ensure it uses getSafeStorage() for persistence
- [x] Extract and copy `app/store/uiStore.ts` and `app/store/index.ts` from pre-baseline commit
- [ ] Run `npx tsc --noEmit` to verify no TypeScript errors after Phase 4

---

## Phase 5: Services (15 tasks)

- [ ] Create `app/services/` directory if it doesn't exist
- [ ] Extract and copy `app/services/authService.ts` from pre-baseline commit
- [ ] Extract and copy `app/services/recipientService.ts` from pre-baseline commit
- [ ] Extract and copy `app/services/giftService.ts` from pre-baseline commit
- [ ] Extract and copy `app/services/userService.ts` from pre-baseline commit
- [ ] Extract and copy `app/services/subscriptionService.ts` from pre-baseline commit - STUB OUT all RevenueCat calls (return mock/no-op values)
- [ ] Verify subscriptionService.ts has NO imports from react-native-purchases
- [ ] Extract and copy `app/services/openaiService.ts` from pre-baseline commit (if exists)
- [ ] Extract and copy `app/services/storageService.ts` from pre-baseline commit
- [ ] Extract and copy `app/services/index.ts` from pre-baseline commit
- [ ] SKIP copying `app/services/notificationService.ts` (uses banned expo-notifications)
- [ ] SKIP copying `app/services/biometricAuthService.ts` (uses banned expo-local-authentication)
- [ ] SKIP copying `app/services/revenueCatService.ts` (uses banned react-native-purchases)
- [ ] SKIP copying `app/services/sentry.ts` (uses banned @sentry/react-native)
- [ ] Run `npx tsc --noEmit` to verify no TypeScript errors after Phase 5

---

## Phase 6: Components (15 tasks)

- [ ] Create `app/components/` directory if it doesn't exist
- [ ] Extract and copy `app/components/Button.tsx` from pre-baseline commit
- [ ] Extract and copy `app/components/Card.tsx` from pre-baseline commit
- [ ] Extract and copy `app/components/Input.tsx` from pre-baseline commit
- [ ] Extract and copy `app/components/Loading.tsx` from pre-baseline commit
- [ ] Extract and copy `app/components/ErrorBoundary.tsx` from pre-baseline commit - REMOVE ALL Sentry imports and calls
- [ ] Verify ErrorBoundary.tsx has NO imports from @sentry/react-native
- [ ] Extract and copy `app/components/Header.tsx` from pre-baseline commit
- [ ] Extract and copy `app/components/EmptyState.tsx` from pre-baseline commit
- [ ] Extract and copy `app/components/Avatar.tsx` from pre-baseline commit
- [ ] Create `app/components/forms/` directory if it doesn't exist
- [ ] Extract and copy all files from `app/components/forms/` from pre-baseline commit
- [ ] Extract and copy `app/components/index.ts` from pre-baseline commit (barrel export file)
- [ ] Verify all components use dynamic imports for any native modules with try/catch
- [ ] Run `npx tsc --noEmit` to verify no TypeScript errors after Phase 6

---

## Phase 7: Supabase Integration (5 tasks)

- [ ] Extract and copy `app/lib/supabase.ts` from pre-baseline commit - VERIFY it uses dynamic import for @supabase/supabase-js with try/catch
- [ ] Create `app/contexts/` directory if it doesn't exist
- [ ] Extract and copy `app/contexts/AuthContext.tsx` from pre-baseline commit
- [ ] Extract and copy `app/contexts/SupabaseContext.tsx` from pre-baseline commit
- [ ] Run `npx tsc --noEmit` to verify no TypeScript errors after Phase 7

---

## Phase 8: Routes (19 tasks)

### Tab Routes
- [ ] Create `app/(tabs)/` directory if it doesn't exist
- [ ] Extract and copy `app/(tabs)/_layout.tsx` from pre-baseline commit (tab navigation layout)
- [ ] Extract and copy `app/(tabs)/index.tsx` from pre-baseline commit (home tab)
- [ ] Extract and copy `app/(tabs)/recipients.tsx` from pre-baseline commit (recipients list tab)
- [ ] Extract and copy `app/(tabs)/settings.tsx` from pre-baseline commit (settings tab)
- [ ] Verify tab routes have no static imports of banned dependencies

### Auth Routes
- [ ] Create `app/(auth)/` directory if it doesn't exist
- [ ] Extract and copy `app/(auth)/_layout.tsx` from pre-baseline commit (auth navigation layout)
- [ ] Extract and copy `app/(auth)/login.tsx` from pre-baseline commit
- [ ] Extract and copy `app/(auth)/signup.tsx` from pre-baseline commit
- [ ] Extract and copy `app/(auth)/forgot-password.tsx` from pre-baseline commit (if exists)
- [ ] Verify auth routes have no static imports of banned dependencies

### Recipient Routes
- [ ] Create `app/recipients/` directory if it doesn't exist
- [ ] Extract and copy `app/recipients/_layout.tsx` from pre-baseline commit
- [ ] Extract and copy `app/recipients/[id].tsx` from pre-baseline commit (recipient detail)
- [ ] Extract and copy `app/recipients/add.tsx` from pre-baseline commit (add recipient form)
- [ ] Extract and copy `app/recipients/edit/[id].tsx` from pre-baseline commit (edit recipient form)

### Standalone Routes
- [ ] Extract and copy `app/help.tsx` from pre-baseline commit
- [ ] Extract and copy `app/onboarding.tsx` from pre-baseline commit
- [ ] Run `npx tsc --noEmit` to verify no TypeScript errors after Phase 8

---

## Phase 9: Prompts & Config (8 tasks)

- [ ] Create `app/prompts/` directory if it doesn't exist
- [ ] Extract and copy `app/prompts/system.ts` from pre-baseline commit (system prompt template)
- [ ] Extract and copy `app/prompts/birthday.ts` from pre-baseline commit
- [ ] Extract and copy `app/prompts/anniversary.ts` from pre-baseline commit
- [ ] Extract and copy `app/prompts/holiday.ts` from pre-baseline commit
- [ ] Extract and copy `app/prompts/custom.ts` from pre-baseline commit
- [ ] Extract and copy `app/prompts/index.ts` from pre-baseline commit (barrel export)
- [ ] Run `npx tsc --noEmit` to verify no TypeScript errors after Phase 9

---

## Phase 10: Integration Testing (6 tasks)

- [ ] Test authentication flow: signup, login, logout, password reset
- [ ] Test recipient management: add, edit, view, delete recipients
- [ ] Test navigation between all routes (tabs, auth, recipients, help, onboarding)
- [ ] Test storage persistence: data persists after app reload
- [ ] Test error handling: ErrorBoundary catches and displays errors gracefully
- [ ] Test subscription flow (stubbed): verify app doesn't crash when subscription features are accessed

---

## Phase 11: Build & TestFlight Verification (14 tasks)

### Code Quality Checks
- [ ] Run `npx tsc --noEmit` to verify no TypeScript errors in entire codebase
- [ ] Run `npm run lint` to check for linting errors
- [ ] Fix any linting errors found
- [ ] Run `npm test` to execute all unit tests (if test suite exists)

### Dependency Audit
- [ ] Verify package.json does NOT contain `react-native-purchases`
- [ ] Verify package.json does NOT contain `@sentry/react-native`
- [ ] Verify package.json does NOT contain `expo-notifications`
- [ ] Verify package.json does NOT contain `expo-local-authentication`
- [ ] Verify package.json does NOT contain `expo-crypto`
- [ ] Search codebase for any static imports of banned packages using grep

### App Configuration
- [ ] Update `app.json` with correct privacy policy URL
- [ ] Update `app.json` with correct support email
- [ ] Verify `app.json` has `newArchEnabled: false`

### Build & Deploy
- [ ] Commit all migration changes with message "feat: complete migration from baseline"
- [ ] Push changes to GitHub main branch
- [ ] Verify GitHub Actions workflow triggers automatically
- [ ] Monitor GitHub Actions workflow for successful completion
- [ ] Verify TestFlight build appears in App Store Connect
- [ ] Install TestFlight build on physical device
- [ ] Test app launch - verify no crash on startup
- [ ] Test core functionality: login, view recipients, navigate between tabs
- [ ] Update MIGRATION_CONTEXT.md to mark migration as COMPLETE

---

## Critical Rules Reminder

1. **NEVER install banned dependencies:**
   - `react-native-purchases`
   - `@sentry/react-native`
   - `expo-notifications`
   - `expo-local-authentication`
   - `expo-crypto`

2. **All native modules MUST use dynamic imports with try/catch:**
   ```typescript
   let NativeModule;
   try {
     NativeModule = require('native-module');
   } catch (e) {
     NativeModule = null;
   }
   ```

3. **Build and typecheck after each major phase (1-9)**

4. **Source code retrieval:** Use `git show <pre-baseline-commit>:path/to/file` to extract files

---

## Success Criteria

- [ ] All 119 tasks marked complete
- [ ] Zero TypeScript errors
- [ ] Zero banned dependencies in package.json
- [ ] TestFlight build installs and runs without crash
- [ ] Core app functionality works: auth, recipients, navigation
- [ ] MIGRATION_CONTEXT.md updated with completion status
