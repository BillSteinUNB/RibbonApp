## High Priority: Remove Unused Photo Library Permission Description

### Location
app.json:19 - iOS infoPlist section

### Problem
NSPhotoLibraryUsageDescription exists but no photo library access found in codebase. Search found no expo-image-picker or equivalent.

### Fix Required
Remove photo library permission description from app.json or implement photo picker feature.

### Impact
Apple rejects apps requesting permissions not tied to actual functionality.

### Risk
HIGH - Unused privacy-sensitive permissions cause common rejections