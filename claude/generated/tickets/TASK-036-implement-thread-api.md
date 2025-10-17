# TASK-036: Implement Thread API

**Type:** Task
**Epic:** EPIC-006
**Priority:** Critical
**Status:** Backlog
**Assignee:** Unassigned

## Description
Implement API for creating and managing message threads (both direct message and group threads).

## Tasks
- [ ] Create threads module structure
- [ ] Implement POST /api/threads (create DM thread)
- [ ] Implement GET /api/threads (list user's threads)
- [ ] Implement GET /api/threads/:id (get thread details)
- [ ] Add logic to find or create DM threads
- [ ] Add authorization checks
- [ ] Write unit tests

## Acceptance Criteria
- Users can create DM threads
- System prevents duplicate DM threads between same users
- Users only see their own threads
- Thread participants properly tracked
- Tests cover all scenarios

## Technical Notes
```typescript
// When creating DM thread, check if thread already exists
const existingThread = await findDirectThread([user1Id, user2Id])
if (existingThread) return existingThread
```

## Estimated Effort
4 hours

## Dependencies
- EPIC-002: Database Setup (Thread model)
- EPIC-003: Authentication
