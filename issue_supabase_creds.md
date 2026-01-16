## Critical Issue: Replace Hardcoded Supabase Credentials with Environment Variables

### Location
app/lib/supabase.ts:22-23

### Current Code
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

### Problem
Supabase credentials are hardcoded as placeholder values. If these remain as-is, the app will fail to connect.

### Fix Required
1. Create .env file (ensure it's in .gitignore)
2. Add: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
3. Update app/lib/supabase.ts to use process.env

### Security Impact
Prevents credential exposure in git history. Enables different credentials per environment.

### Blocker
BLOCKS submission - app will not function without valid credentials.