# EPIC-003: Authentication & Authorization

**Type:** Epic
**Priority:** Critical
**Status:** Backlog

## Description
Implement OIDC authentication with Keycloak integration, JWT token validation, and permission-based authorization system for the EduBridge application.

## Goals
- Set up Keycloak with Docker
- Configure Keycloak realm and client
- Implement OIDC login flow
- Implement JWT validation middleware
- Create permission checking system
- Implement context switching for parents

## Acceptance Criteria
- [x] Keycloak running and configured
- [x] Users can log in via OIDC
- [x] JWT tokens validated on every API request
- [x] Permission middleware protects endpoints
- [x] Context switching works for parents with multiple children
- [x] Auth flow works on web and mobile

## Related Tasks
- TASK-016: Set up Keycloak with Docker
- TASK-017: Configure Keycloak realm
- TASK-018: Implement OIDC login flow
- TASK-019: Implement JWT validation middleware
- TASK-020: Create permission system
- TASK-021: Implement context switching API
- TASK-022: Create auth utilities in shared package

## Dependencies
- EPIC-001: Project Setup
- EPIC-002: Database Setup (User model)

## Estimated Effort
20-24 hours
