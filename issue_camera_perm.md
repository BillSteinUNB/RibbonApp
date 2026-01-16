## High Priority: Remove Unused Camera Permission Description

### Location
app.json:18 - iOS infoPlist section

### Problem
NSCameraUsageDescription exists but no camera usage found in package.json dependencies or codebase.

### Evidence
We searched app/ for Camera, expo-camera, or camera-related code. No files found that access camera. Permission description suggests camera will be used but it is not.

### Fix Required
Remove the camera permission description from app.json or implement camera feature if actually needed.

### Impact
Apple may reject for requesting permission not needed by functionality.

### Risk
HIGH - Unnecessary permissions can cause rejection