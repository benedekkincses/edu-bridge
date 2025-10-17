# EduBridge Project Board

Last Updated: 2025-10-17

## Summary

**Total Epics:** 14
**Total Tasks:** 18 (sample tasks created, more to be added per epic)

---

## Backlog

### EPIC-001: Project Setup & Infrastructure
**Priority:** Critical | **Status:** Backlog | [📄 Details](./tickets/EPIC-001-project-setup.md)

**Tasks:**
- [ ] [TASK-001: Initialize monorepo structure](./tickets/TASK-001-init-monorepo.md)
- [ ] [TASK-002: Configure TypeScript](./tickets/TASK-002-configure-typescript.md)
- [ ] [TASK-003: Set up ESLint and Prettier](./tickets/TASK-003-setup-eslint-prettier.md)
- [ ] TASK-004: Configure Git hooks
- [ ] TASK-005: Create npm scripts
- [ ] TASK-006: Set up environment configuration

---

### EPIC-002: Database & Core Models
**Priority:** Critical | **Status:** Backlog | [📄 Details](./tickets/EPIC-002-database-setup.md)

**Tasks:**
- [ ] [TASK-007: Set up PostgreSQL with Docker](./tickets/TASK-007-setup-postgresql.md)
- [ ] [TASK-008: Initialize Prisma](./tickets/TASK-008-initialize-prisma.md)
- [ ] [TASK-009: Define User and Auth Models](./tickets/TASK-009-define-user-auth-models.md)
- [ ] TASK-010: Define School and Admin models
- [ ] TASK-011: Define Class and Child models
- [ ] TASK-012: Define Group and Message models
- [ ] TASK-013: Define News and Event models
- [ ] TASK-014: Create database migrations
- [ ] TASK-015: Create seed data script

---

### EPIC-003: Authentication & Authorization
**Priority:** Critical | **Status:** Backlog | [📄 Details](./tickets/EPIC-003-authentication.md)

**Tasks:**
- [ ] [TASK-016: Set up Keycloak with Docker](./tickets/TASK-016-setup-keycloak.md)
- [ ] [TASK-017: Configure Keycloak realm](./tickets/TASK-017-configure-keycloak-realm.md)
- [ ] TASK-018: Implement OIDC login flow
- [ ] TASK-019: Implement JWT validation middleware
- [ ] TASK-020: Create permission system
- [ ] TASK-021: Implement context switching API
- [ ] TASK-022: Create auth utilities in shared package

---

### EPIC-004: School & User Management
**Priority:** High | **Status:** Backlog | [📄 Details](./tickets/EPIC-004-school-user-management.md)

**Tasks:**
- [ ] [TASK-023: Implement School API (CRUD)](./tickets/TASK-023-implement-school-api.md)
- [ ] TASK-024: Implement User Profile API
- [ ] TASK-025: Implement Privacy Settings API
- [ ] TASK-026: Create School Management UI (web)
- [ ] TASK-027: Create User Profile UI (web)
- [ ] TASK-028: Create Privacy Settings UI (web)

---

### EPIC-005: Class & Child Management
**Priority:** High | **Status:** Backlog | [📄 Details](./tickets/EPIC-005-class-child-management.md)

**Tasks:**
- [ ] TASK-029: Implement Class API (CRUD)
- [ ] TASK-030: Implement Child API (CRUD)
- [ ] TASK-031: Implement Class Membership API
- [ ] TASK-032: Implement Permission Assignment API
- [ ] TASK-033: Create Class Management UI (web)
- [ ] TASK-034: Create Child Management UI (web)
- [ ] TASK-035: Create Class Membership UI (web)

---

### EPIC-006: Messaging System
**Priority:** Critical | **Status:** Backlog | [📄 Details](./tickets/EPIC-006-messaging-system.md)

**Tasks:**
- [ ] [TASK-036: Implement Thread API](./tickets/TASK-036-implement-thread-api.md)
- [ ] TASK-037: Implement Message API (CRUD)
- [ ] [TASK-038: Implement Long Polling endpoint](./tickets/TASK-038-implement-long-polling.md)
- [ ] TASK-039: Implement @mentions parsing
- [ ] TASK-040: Implement Read Status tracking
- [ ] TASK-041: Create Messaging UI (web)
- [ ] TASK-042: Create Long Polling client (shared)
- [ ] TASK-043: Create Message Thread UI components

---

### EPIC-007: Group Chat
**Priority:** High | **Status:** Backlog | [📄 Details](./tickets/EPIC-007-group-chat.md)

**Tasks:**
- [ ] TASK-044: Implement Group API (CRUD)
- [ ] TASK-045: Implement Group Membership API
- [ ] TASK-046: Integrate Groups with Messaging
- [ ] TASK-047: Create Group Management UI (web)
- [ ] TASK-048: Create Group Chat UI (web)
- [ ] TASK-049: Create Group Member List UI

---

### EPIC-008: News Feed
**Priority:** High | **Status:** Backlog | [📄 Details](./tickets/EPIC-008-news-feed.md)

**Tasks:**
- [ ] TASK-050: Implement News Post API (CRUD)
- [ ] TASK-051: Create News Templates system
- [ ] TASK-052: Implement News Read Status tracking
- [ ] TASK-053: Create News Feed UI (web)
- [ ] TASK-054: Create News Post Form UI (web)
- [ ] TASK-055: Create News Template components

---

### EPIC-009: Events & RSVP
**Priority:** Medium | **Status:** Backlog | [📄 Details](./tickets/EPIC-009-events-rsvp.md)

**Tasks:**
- [ ] TASK-056: Implement Event API (CRUD)
- [ ] TASK-057: Implement RSVP API
- [ ] TASK-058: Create Event Calendar UI (web)
- [ ] TASK-059: Create Event Details UI (web)
- [ ] TASK-060: Create RSVP Management UI
- [ ] TASK-061: Integrate Events with News Feed

---

### EPIC-010: File Storage & Uploads
**Priority:** High | **Status:** Backlog | [📄 Details](./tickets/EPIC-010-file-storage.md)

**Tasks:**
- [ ] [TASK-062: Set up MinIO with Docker](./tickets/TASK-062-setup-minio.md)
- [ ] [TASK-063: Implement file upload API (pre-signed URLs)](./tickets/TASK-063-implement-file-upload-api.md)
- [ ] TASK-064: Implement file validation
- [ ] TASK-065: Implement file metadata storage
- [ ] TASK-066: Create file upload UI component (shared)
- [ ] TASK-067: Create file preview component (shared)
- [ ] TASK-068: Integrate files with Messages
- [ ] TASK-069: Integrate files with News Feed

---

### EPIC-011: Web Portal
**Priority:** Critical | **Status:** Backlog | [📄 Details](./tickets/EPIC-011-web-portal.md)

**Tasks:**
- [ ] [TASK-070: Set up React + Vite project](./tickets/TASK-070-setup-react-vite.md)
- [ ] TASK-071: Configure React Router
- [ ] TASK-072: Set up Zustand state management
- [ ] TASK-073: Create UI component library
- [ ] TASK-074: Implement Dashboard page
- [ ] TASK-075: Implement School Management pages
- [ ] TASK-076: Implement Class Management pages
- [ ] TASK-077: Implement Messaging pages
- [ ] TASK-078: Implement News Feed pages
- [ ] TASK-079: Implement Events pages
- [ ] TASK-080: Implement Profile pages
- [ ] TASK-081: Create responsive layouts

---

### EPIC-012: Mobile App
**Priority:** Critical | **Status:** Backlog | [📄 Details](./tickets/EPIC-012-mobile-app.md)

**Tasks:**
- [ ] [TASK-082: Set up React Native + Expo project](./tickets/TASK-082-setup-react-native-expo.md)
- [ ] TASK-083: Configure React Navigation
- [ ] TASK-084: Set up shared state management
- [ ] TASK-085: Create mobile UI component library
- [ ] TASK-086: Implement Dashboard screen
- [ ] TASK-087: Implement Messaging screens
- [ ] TASK-088: Implement News Feed screens
- [ ] TASK-089: Implement Events screens
- [ ] TASK-090: Implement Profile screens
- [ ] TASK-091: Test on iOS devices
- [ ] TASK-092: Test on Android devices
- [ ] TASK-093: Create production builds

---

### EPIC-013: External Integrations
**Priority:** Medium | **Status:** Backlog | [📄 Details](./tickets/EPIC-013-external-integrations.md)

**Tasks:**
- [ ] [TASK-094: Implement AImee chat proxy API](./tickets/TASK-094-implement-aimee-proxy.md)
- [ ] TASK-095: Implement AImee long polling endpoint
- [ ] TASK-096: Create AImee chat UI (web)
- [ ] TASK-097: Create AImee chat UI (mobile)
- [ ] TASK-098: Implement Booked4US proxy API
- [ ] TASK-099: Create Appointment Booking UI (web)
- [ ] TASK-100: Create Appointment Booking UI (mobile)

---

### EPIC-014: Deployment & DevOps
**Priority:** High | **Status:** Backlog | [📄 Details](./tickets/EPIC-014-deployment.md)

**Tasks:**
- [ ] [TASK-101: Create Docker Compose configuration](./tickets/TASK-101-create-docker-compose.md)
- [ ] TASK-102: Create API Dockerfile
- [ ] TASK-103: Create Web Dockerfile
- [ ] [TASK-104: Configure Nginx](./tickets/TASK-104-configure-nginx.md)
- [ ] TASK-105: Set up SSL certificates
- [ ] TASK-106: Create GitHub Actions CI/CD
- [ ] TASK-107: Set up environment variables
- [ ] TASK-108: Configure database backups
- [ ] TASK-109: Set up logging
- [ ] TASK-110: Deploy to VPS
- [ ] TASK-111: Create deployment documentation

---

## In Progress

*No tasks currently in progress*

---

## Review

*No tasks currently in review*

---

## Done

*No tasks completed yet*

---

## Epic Progress Overview

| Epic | Status | Priority | Progress | Estimated Hours |
|------|--------|----------|----------|-----------------|
| EPIC-001: Project Setup | Backlog | Critical | 0% | 8-12 |
| EPIC-002: Database Setup | Backlog | Critical | 0% | 16-20 |
| EPIC-003: Authentication | Backlog | Critical | 0% | 20-24 |
| EPIC-004: School & User Mgmt | Backlog | High | 0% | 16-20 |
| EPIC-005: Class & Child Mgmt | Backlog | High | 0% | 20-24 |
| EPIC-006: Messaging System | Backlog | Critical | 0% | 24-30 |
| EPIC-007: Group Chat | Backlog | High | 0% | 16-20 |
| EPIC-008: News Feed | Backlog | High | 0% | 16-20 |
| EPIC-009: Events & RSVP | Backlog | Medium | 0% | 16-20 |
| EPIC-010: File Storage | Backlog | High | 0% | 12-16 |
| EPIC-011: Web Portal | Backlog | Critical | 0% | 40-50 |
| EPIC-012: Mobile App | Backlog | Critical | 0% | 40-50 |
| EPIC-013: External Integrations | Backlog | Medium | 0% | 12-16 |
| EPIC-014: Deployment | Backlog | High | 0% | 16-20 |

**Total Estimated Effort:** 274-352 hours

---

## Notes

- All tickets start in Backlog
- Move tickets to "In Progress" when actively working on them
- Move to "Review" when ready for code review
- Move to "Done" when merged and deployed
- Update this board regularly to reflect current status
- Critical priority epics should be completed first for MVP
- Task numbers may have gaps - only key tasks are documented in detail

---

## MVP Critical Path

For fastest time to MVP, follow this order:

1. **Foundation** (EPIC-001, EPIC-002, EPIC-003) - ~44-56 hours
2. **Core Features** (EPIC-004, EPIC-005, EPIC-010) - ~48-60 hours
3. **Communication** (EPIC-006, EPIC-007, EPIC-008) - ~56-70 hours
4. **Frontend** (EPIC-011, EPIC-012) - ~80-100 hours
5. **Deployment** (EPIC-014) - ~16-20 hours

**MVP Total:** ~244-306 hours (2-3 months with 2 developers)

Nice-to-have features for post-MVP:
- EPIC-009: Events & RSVP
- EPIC-013: External Integrations (AImee, Booked4US)
