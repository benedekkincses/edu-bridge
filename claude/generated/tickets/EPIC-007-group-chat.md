# EPIC-007: Group Chat

**Type:** Epic
**Priority:** High
**Status:** Backlog

## Description
Implement group chat functionality within classes, including group creation, membership management, and group-specific messaging features.

## Goals
- Group creation within classes (permission-based)
- Group membership management
- Group chat with threading
- Group-specific seen status
- Group owner controls

## Acceptance Criteria
- [x] Teachers with permission can create groups in their classes
- [x] Special parents can create groups (surprise party feature)
- [x] Group owners can add/remove members
- [x] Group chat supports all messaging features
- [x] Group seen status shows all members who read
- [x] Group owners can delete any message in their group

## Related Tasks
- TASK-044: Implement Group API (CRUD)
- TASK-045: Implement Group Membership API
- TASK-046: Integrate Groups with Messaging
- TASK-047: Create Group Management UI (web)
- TASK-048: Create Group Chat UI (web)
- TASK-049: Create Group Member List UI

## Dependencies
- EPIC-005: Class & Child Management
- EPIC-006: Messaging System

## Estimated Effort
16-20 hours
