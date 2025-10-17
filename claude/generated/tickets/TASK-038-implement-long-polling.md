# TASK-038: Implement Long Polling Endpoint

**Type:** Task
**Epic:** EPIC-006
**Priority:** Critical
**Status:** Backlog
**Assignee:** Unassigned

## Description
Implement long polling endpoint for real-time message delivery with timeout handling and efficient database querying.

## Tasks
- [ ] Create polling module
- [ ] Implement GET /api/messages/poll endpoint
- [ ] Add query parameters: contextId, since, timeout
- [ ] Implement polling loop with database checks
- [ ] Add timeout handling (30 seconds)
- [ ] Optimize database queries (indexes)
- [ ] Handle connection cleanup
- [ ] Write tests for polling behavior

## Acceptance Criteria
- Endpoint returns new messages immediately if available
- Endpoint waits up to 30 seconds if no new messages
- Client receives empty array on timeout
- Database queries are efficient
- Connection properly closed on client disconnect
- Works with Nginx reverse proxy

## Technical Notes
```typescript
// Polling logic
const startTime = Date.now()
const timeout = 30000 // 30 seconds

while (Date.now() - startTime < timeout) {
  const newMessages = await checkForNewMessages(contextId, since)
  if (newMessages.length > 0) {
    return res.json(newMessages)
  }
  await sleep(1000) // Check every second
}
return res.json([]) // Timeout
```

## Estimated Effort
6 hours

## Dependencies
- TASK-036: Implement Thread API
- TASK-037: Implement Message API
