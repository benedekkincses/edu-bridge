# EPIC-006: Messaging System

**Type:** Epic
**Priority:** Critical
**Status:** Backlog

## Description
Implement real-time messaging system with direct messages, threads, @mentions, read receipts, and long polling for message updates.

## Goals
- Direct messaging between users
- Thread support
- @mentions functionality
- "Seen" status tracking
- Long polling for real-time updates
- Message deletion (owner and group admin)

## Acceptance Criteria
- [x] Users can send direct messages to each other
- [x] Messages organized in threads
- [x] @mentions highlight mentioned users
- [x] Read receipts show who has seen messages
- [x] Long polling delivers new messages within 30 seconds
- [x] Message deletion works with proper permissions
- [x] Works on both web and mobile

## Related Tasks
- TASK-036: Implement Thread API
- TASK-037: Implement Message API (CRUD)
- TASK-038: Implement Long Polling endpoint
- TASK-039: Implement @mentions parsing
- TASK-040: Implement Read Status tracking
- TASK-041: Create Messaging UI (web)
- TASK-042: Create Long Polling client (shared)
- TASK-043: Create Message Thread UI components

## Dependencies
- EPIC-002: Database Setup
- EPIC-003: Authentication

## Estimated Effort
24-30 hours
