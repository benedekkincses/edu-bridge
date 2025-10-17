# TASK-017: Configure Keycloak Realm

**Type:** Task
**Epic:** EPIC-003
**Priority:** Critical
**Status:** Backlog
**Assignee:** Unassigned

## Description
Create and configure EduBridge realm in Keycloak with appropriate clients for web, mobile, and API.

## Tasks
- [ ] Create "edubridge" realm
- [ ] Create "edubridge-api" client with OIDC
- [ ] Configure redirect URIs for web and mobile
- [ ] Set up client scopes
- [ ] Configure token lifetimes
- [ ] Create test users for development
- [ ] Export realm configuration

## Acceptance Criteria
- Realm "edubridge" created
- Client configured with correct redirect URIs
- Test users can log in
- Realm configuration exportable for other environments

## Technical Notes
- Redirect URIs: http://localhost:5173/auth/callback, http://localhost:3000/api/auth/callback
- Client type: Confidential
- Standard Flow Enabled: Yes
- Direct Access Grants: No

## Estimated Effort
2 hours

## Dependencies
- TASK-016: Set up Keycloak with Docker
