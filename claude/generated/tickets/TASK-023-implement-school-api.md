# TASK-023: Implement School API (CRUD)

**Type:** Task
**Epic:** EPIC-004
**Priority:** High
**Status:** Backlog
**Assignee:** Unassigned

## Description
Implement RESTful API endpoints for school management (CRUD operations) with proper authorization.

## Tasks
- [ ] Create schools module structure
- [ ] Implement GET /api/schools (list schools for current admin)
- [ ] Implement POST /api/schools (create school)
- [ ] Implement GET /api/schools/:id (get school details)
- [ ] Implement PATCH /api/schools/:id (update school)
- [ ] Implement DELETE /api/schools/:id (delete school)
- [ ] Add validation with Zod
- [ ] Add authorization middleware (admin only)
- [ ] Write unit tests

## Acceptance Criteria
- All CRUD endpoints working
- Only school admins can access
- Validation rejects invalid data
- Tests cover all endpoints
- Error handling returns appropriate status codes

## Technical Notes
```typescript
// Route example
router.get('/schools', authenticate, requireRole('school-admin'), listSchools)
router.post('/schools', authenticate, requireRole('school-admin'), validateSchool, createSchool)
```

## Estimated Effort
4 hours

## Dependencies
- EPIC-002: Database Setup (School model)
- EPIC-003: Authentication (middleware)
