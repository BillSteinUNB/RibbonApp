## Medium Priority: Configure Build Numbers for iOS and Android

### Location
app.json:5 - only version specified

### Problem
Version 1.0.0 is specified but no build numbers for iOS or Android stores.

### Fix Required
Add build numbers to app.json:
- iOS: Set initial build number in EAS build configuration or eas.json
- Android: Add versionCode field (should be 1 for first submission)

### Apple Requirements
CFBundleShortVersionString: 1.0.0 (marketing version)
CFBundleVersion: 1 (build number - increment each submission)

### Android Requirements
versionName: 1.0.0 (marketing version)
versionCode: 1 (build number - must increment each submission)

### Risk
MEDIUM - Required for submission. Build numbers must increment with each update.