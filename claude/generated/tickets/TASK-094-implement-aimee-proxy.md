# TASK-094: Implement AImee Chat Proxy API

**Type:** Task
**Epic:** EPIC-013
**Priority:** Medium
**Status:** Backlog
**Assignee:** Unassigned

## Description
Implement proxy API for AImee chatbot that forwards requests to external AImee service and handles responses.

## Tasks
- [ ] Create aimee module in API
- [ ] Implement POST /api/aimee/chat (send message)
- [ ] Implement GET /api/aimee/poll (long polling for responses)
- [ ] Configure external AImee endpoint URL
- [ ] Handle authentication for AImee service
- [ ] Add error handling for external service failures
- [ ] Write tests with mocked external service

## Acceptance Criteria
- Chat messages successfully forwarded to AImee
- Responses streamed back via long polling
- Errors handled gracefully
- Fallback message shown if service unavailable
- Tests cover all scenarios

## Technical Notes
```typescript
// Proxy request to external service
const response = await fetch(AIMEE_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AIMEE_API_KEY}`
  },
  body: JSON.stringify({ message, conversationId })
})
```

## Estimated Effort
4 hours

## Dependencies
- TASK-038: Implement Long Polling (for polling infrastructure)
