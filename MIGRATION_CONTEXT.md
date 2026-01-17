# RibbonApp Migration & Build Context (Keep-Alive)

This document preserves the full context for the **fresh Expo baseline + Fastlane/TestFlight** migration so the work can continue if the chat context is lost.

## 1) Goal
- Keep **one repo** (`RibbonApp`) working.
- Use **Expo (managed) + expo-router** for app code.
- **Stop using EAS builds** (cost); instead build and upload to **TestFlight** via **Fastlane + GitHub Actions**.
- Migrate the original app code into the fresh baseline **incrementally**, testing after each phase to pinpoint crash sources.

## 2) Current State Snapshot (as of the baseline reset)
- The repo now contains a **fresh Expo project** with minimal app screens:
  - `app/_layout.tsx` and `app/index.tsx` (shows “Ribbon App Works!”)
- **Fastlane** setup exists in `fastlane/` and a **GitHub Actions** workflow in `.github/workflows/ios-testflight.yml`.
- `babel.config.js` includes `expo-router/babel`.
- `app.json` is aligned to the desired config (name/slug/bundle ID/scheme/newArchEnabled false).
- Dependencies match the **minimal allowed set** (no banned modules).

> Important: **All original app code was removed from `app/`** as part of the clean baseline. To migrate, you must pull code from either a prior commit or any backup folder (e.g., from git history before the baseline reset).

## 3) Build System (Fastlane + GitHub Actions)
### Workflow
File: `.github/workflows/ios-testflight.yml`
- Steps:
  1. Checkout
  2. Setup Node (20) and Ruby (3.2)
  3. `npm ci`
  4. Write App Store Connect API key from base64 secret
  5. `npx expo prebuild --platform ios --clean --no-install`
  6. `bundle exec pod install --project-directory=ios`
  7. `bundle exec fastlane ios testflight`

### Fastlane
Files: `fastlane/Appfile`, `fastlane/Matchfile`, `fastlane/Fastfile`
- **Lane:** `ios testflight`
  - Uses App Store Connect API key
  - Pulls signing via `match`
  - `increment_build_number`
  - `build_app` and `upload_to_testflight`

### Required GitHub Secrets
Set all of these in the repo **Secrets**:
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_API_ISSUER_ID`
- `APP_STORE_CONNECT_API_KEY_BASE64` (base64 of the `.p8` key)
- `MATCH_GIT_URL` (private git repo for certificates)
- `MATCH_PASSWORD`
- `MATCH_GIT_BASIC_AUTHORIZATION` **or** `MATCH_GIT_PRIVATE_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Match Setup (One-time, on a Mac)
1. `bundle install`
2. `bundle exec fastlane match appstore`
3. Verify the Match repo now has certs/profiles.

## 4) App Config / Dependency Constraints
### app.json must remain aligned to:
- `name: Ribbon`, `slug: ribbon`, `scheme: ribbon`
- `bundleIdentifier: com.ribbon.app`
- `newArchEnabled: false`
- Plugins: `expo-router`, `expo-secure-store`

### package.json constraints
- `main: "expo-router/entry"`
- **DO NOT upgrade React/RN** beyond what `create-expo-app` installed.

### Allowed Dependencies (minimal set)
**Expo:**
- `expo-router`, `expo-secure-store`, `expo-status-bar`, `expo-constants`, `expo-linking`
- `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`
- `@react-native-async-storage/async-storage`

**Third-party:**
- `@supabase/supabase-js`, `zustand`, `zod`, `lucide-react-native`, `react-native-url-polyfill`

### Banned Dependencies (do NOT install)
- `react-native-purchases` (RevenueCat)
- `@sentry/react-native`
- `expo-notifications`
- `expo-local-authentication`
- `expo-crypto`

### Native Module Rule
**All native modules must be imported dynamically with try/catch** to prevent runtime crashes.

## 5) Minimal App Verification (Before Migrating)
Goal: confirm pipeline is sound.
- Trigger **GitHub Actions** `iOS TestFlight` workflow.
- Validate TestFlight build launches and shows: **“Ribbon App Works!”**

If this fails, fix pipeline/credentials before migrating any app code.

## 6) Migration Plan (Phase-by-Phase)
Source code should be pulled from the **pre-baseline commit** or backup.
Recommended approach to retrieve old code:
```bash
git checkout <commit_before_baseline> -- app/
```
Then copy specific files into the new `app/` directory as described below.

### Phase 1: Constants & Types
- Copy:
  - `app/constants.ts`
  - `app/constants/`
  - `app/types.ts`
  - `app/types/`
- Build/Test after this phase.

### Phase 2: Utilities (no native modules)
- Copy:
  - `app/utils/logger.ts`
  - `app/utils/dates.ts`
  - `app/utils/helpers.ts` (uses `Math.random`, **no expo-crypto**)
- Build/Test.

### Phase 3: Safe Storage Layer
- Copy:
  - `app/lib/safeStorage.ts`
  - `app/lib/secureStorage.ts`
- Build/Test.

### Phase 4: Stores
- Copy:
  - `app/store/`
- Ensure all stores use `getSafeStorage()` and **not** direct `AsyncStorage` imports.
- Build/Test.

### Phase 5: Services
- Copy:
  - `app/services/`
- **Skip files:**
  - `notificationService.ts`
  - `biometricAuthService.ts`
  - `revenueCatService.ts`
  - `sentry.ts`
- Ensure `subscriptionService.ts` is the **stub** (no RevenueCat).
- Build/Test.

### Phase 6: Components
- Copy:
  - `app/components/`
- Ensure `ErrorBoundary.tsx` has **no Sentry**.
- Build/Test.

### Phase 7: Supabase
- Copy:
  - `app/lib/supabase.ts`
  - `app/contexts/`
- Build/Test.

### Phase 8: Routes (one at a time)
- Copy & enable routes in sequence:
  1. `app/(tabs)/` (rename from `_disabled_tabs`)
  2. `app/(auth)/` (rename from `_disabled_auth`)
  3. `app/recipients/`
  4. `app/help.tsx`, `app/onboarding.tsx`
- Build/Test after each sub-step if needed.

### Phase 9: Prompts & Config
- Copy:
  - `app/prompts/`
  - `app/config/`
- Build/Test.

## 7) Environment Variables
Set both locally and in GitHub secrets:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 8) Success Criteria
1. GitHub Actions **TestFlight build** completes without errors.
2. TestFlight app launches without crash.
3. “Ribbon App Works!” shows in minimal state.
4. After full migration, all original functionality works.

## 9) Debug Strategy If a Phase Fails
- The failing phase contains the issue.
- Roll back to last good commit and isolate the problematic file(s).
- Check for static native imports; convert to dynamic with try/catch.
- Avoid re-adding banned dependencies.

---

If you need to continue the migration, start at **Phase 1** and follow the build/test loop after each phase.
