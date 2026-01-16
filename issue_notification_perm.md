## High Priority: Missing iOS Notification Permission Description

### Location
app.json:17-20 - iOS infoPlist section

### Problem
App uses expo-notifications service (app/services/notificationService.ts) but no NSUserNotificationsUsageDescription in infoPlist.

### Evidence
We searched and found:
- Code imports expo-notifications
- Requests notification permissions via getPermissionsAsync()
- Schedules notifications via scheduleNotificationAsync()
- Only Face ID permission description exists

### Fix Required
Add NSUserNotificationsUsageDescription to app.json iOS infoPlist section with clear description of why notifications are needed.

### Current iOS infoPlist
Only NSFaceIDUsageDescription exists. Missing notification permission description.

### Impact
App will be rejected by Apple if permission descriptions missing.

### Risk
HIGH - Likely cause of App Store rejection