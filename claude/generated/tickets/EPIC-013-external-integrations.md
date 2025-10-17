# EPIC-013: External Integrations

**Type:** Epic
**Priority:** Medium
**Status:** Backlog

## Description
Integrate external services including AImee chatbot (with long polling) and Booked4US appointment booking system.

## Goals
- AImee chatbot proxy API
- AImee chat UI with long polling
- Booked4US appointment booking integration
- Error handling for external services
- Fallback mechanisms

## Acceptance Criteria
- [x] AImee chatbot accessible from dedicated page
- [x] Chat responses stream via long polling
- [x] Appointment booking integrated
- [x] External service failures handled gracefully
- [x] Users can book parent-teacher meetings

## Related Tasks
- TASK-094: Implement AImee chat proxy API
- TASK-095: Implement AImee long polling endpoint
- TASK-096: Create AImee chat UI (web)
- TASK-097: Create AImee chat UI (mobile)
- TASK-098: Implement Booked4US proxy API
- TASK-099: Create Appointment Booking UI (web)
- TASK-100: Create Appointment Booking UI (mobile)

## Dependencies
- EPIC-002: Database Setup
- EPIC-003: Authentication
- EPIC-006: Messaging System (for long polling infrastructure)

## Estimated Effort
12-16 hours
