## Critical Issue: Host Privacy Policy on Live HTTPS Website

### Location
PRIVACY_POLICY.md - exists locally but not hosted

### Problem
Privacy policy exists as local file but not accessible via live HTTPS URL.

### Fix Required
1. Create simple website (Netlify, Vercel, GitHub Pages)
2. Deploy to: https://yourdomain.com/privacy
3. Update app/(tabs)/settings.tsx with link
4. Update app.json with privacyPolicyUrl

### Requirements
- URL must use HTTPS
- URL must be publicly accessible
- No authentication required

### Blocker
BLOCKS submission. Apple and Google reject apps without accessible privacy policy.