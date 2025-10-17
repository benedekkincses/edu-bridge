# TASK-082: Set up React Native + Expo Project

**Type:** Task
**Epic:** EPIC-012
**Priority:** Critical
**Status:** Backlog
**Assignee:** Unassigned

## Description
Initialize React Native mobile application using Expo with TypeScript.

## Tasks
- [ ] Create React Native project with Expo in packages/mobile
- [ ] Configure app.json with proper app name and identifiers
- [ ] Install essential dependencies (React Navigation, Zustand, etc.)
- [ ] Create basic folder structure (features, shared, navigation)
- [ ] Configure TypeScript
- [ ] Test on Expo Go (iOS and Android)

## Acceptance Criteria
- `npm run dev` starts Expo development server
- App runs on Expo Go
- TypeScript compilation works
- Folder structure matches architecture
- Fast Refresh works

## Technical Notes
```json
// app.json
{
  "expo": {
    "name": "EduBridge",
    "slug": "edubridge",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.edubridge.app"
    },
    "android": {
      "package": "com.edubridge.app"
    }
  }
}
```

## Estimated Effort
3 hours

## Dependencies
- TASK-001: Initialize monorepo structure
