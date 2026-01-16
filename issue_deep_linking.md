## Low Priority: Configure Deep Linking if Needed

### Location
app.json, expo-linking package

### Problem
No Universal Links (iOS) or App Links (Android) configured for deep linking.

### Fix Required
Only needed if app will support deep linking from website or marketing emails.

If deep linking needed:

1. Configure Universal Links for iOS in app.json
2. Configure App Links for Android 
3. Ensure expo-linking package is properly integrated
4. Test deep link URLs on both platforms

### Example Use Case
If users can share Ribbon gift ideas like ribbonapp.com/gift/123

### Impact
Optional feature. Only configure if sharing/external navigation is a feature requirement.

### Risk
LOW - Not required unless deep linking is in scope