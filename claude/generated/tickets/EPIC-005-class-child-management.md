# EPIC-005: Class & Child Management

**Type:** Epic
**Priority:** High
**Status:** Backlog

## Description
Implement APIs and UI for class management (Class and TeacherRoom types), child data management, class membership, and permission assignment.

## Goals
- Class CRUD operations with type support
- Child management (admin only)
- Class membership management
- Permission assignment to teachers and parents
- Child-parent-class linking

## Acceptance Criteria
- [x] School admins can create Class and TeacherRoom types
- [x] School admins can create and manage children
- [x] School admins can assign teachers, parents, children to classes
- [x] School admins can assign permissions to class members
- [x] Parents see classes based on their children
- [x] Teachers see classes they're assigned to

## Related Tasks
- TASK-029: Implement Class API (CRUD)
- TASK-030: Implement Child API (CRUD)
- TASK-031: Implement Class Membership API
- TASK-032: Implement Permission Assignment API
- TASK-033: Create Class Management UI (web)
- TASK-034: Create Child Management UI (web)
- TASK-035: Create Class Membership UI (web)

## Dependencies
- EPIC-002: Database Setup
- EPIC-003: Authentication
- EPIC-004: School & User Management

## Estimated Effort
20-24 hours
