# EduBridge Tickets System

This directory contains all epics and tasks for the EduBridge project, organized as individual markdown files.

## Structure

```
tickets/
├── EPIC-001-project-setup.md
├── EPIC-002-database-setup.md
├── EPIC-003-authentication.md
├── ... (more epics)
├── TASK-001-init-monorepo.md
├── TASK-002-configure-typescript.md
├── ... (more tasks)
└── README.md (this file)
```

## Naming Convention

- **Epics:** `EPIC-XXX-short-name.md`
- **Tasks:** `TASK-XXX-short-name.md`

Where XXX is a zero-padded number (001, 002, etc.)

## Ticket Template

### Epic Template
```markdown
# EPIC-XXX: Title

**Type:** Epic
**Priority:** Critical|High|Medium|Low
**Status:** Backlog|In Progress|Review|Done

## Description
Brief description of the epic

## Goals
- Goal 1
- Goal 2

## Acceptance Criteria
- [x] Criterion 1
- [x] Criterion 2

## Related Tasks
- TASK-XXX: Task name

## Dependencies
Other epics this depends on

## Estimated Effort
X-Y hours
```

### Task Template
```markdown
# TASK-XXX: Title

**Type:** Task
**Epic:** EPIC-XXX
**Priority:** Critical|High|Medium|Low
**Status:** Backlog|In Progress|Review|Done
**Assignee:** Name or Unassigned

## Description
Brief description of the task

## Tasks
- [ ] Subtask 1
- [ ] Subtask 2

## Acceptance Criteria
- Criterion 1
- Criterion 2

## Technical Notes
Code snippets, technical considerations

## Estimated Effort
X hours

## Dependencies
- TASK-XXX: Other task
```

## Workflow

1. **Pick a task** from Backlog (check board.md)
2. **Update status** to "In Progress" in the ticket file and board.md
3. **Assign yourself** in the ticket file
4. **Work on the task** following the subtasks and acceptance criteria
5. **Create PR** when ready
6. **Update status** to "Review" in the ticket file and board.md
7. **After merge**, update status to "Done"

## Board

The main project board is at: `../board.md`

The board shows all tickets organized by epic in four columns:
- Backlog
- In Progress
- Review
- Done

## Priority Levels

- **Critical:** Must have for MVP, blocking other work
- **High:** Important for MVP, should be done soon
- **Medium:** Nice to have for MVP, can be deferred
- **Low:** Post-MVP, future enhancement

## Epic Dependencies

```
EPIC-001 (Project Setup)
  └─→ EPIC-002 (Database)
       └─→ EPIC-003 (Auth)
            ├─→ EPIC-004 (School & User Mgmt)
            │    └─→ EPIC-005 (Class & Child Mgmt)
            │         └─→ EPIC-007 (Group Chat)
            ├─→ EPIC-006 (Messaging)
            │    └─→ EPIC-013 (External Integrations)
            ├─→ EPIC-008 (News Feed)
            │    └─→ EPIC-009 (Events)
            └─→ EPIC-010 (File Storage)
                 └─→ EPIC-011 (Web Portal)
                      └─→ EPIC-012 (Mobile App)
                           └─→ EPIC-014 (Deployment)
```

## Creating New Tickets

When creating new tickets:

1. Use the next available number
2. Follow the naming convention
3. Fill in all sections of the template
4. Add the ticket to board.md
5. Link related tickets

## Notes

- Not all tasks are documented in detail yet
- Focus on Critical priority epics first
- Update estimates as you learn more
- Keep tickets small and achievable (< 8 hours)
- Break down larger tasks into smaller ones

## Quick Commands

```bash
# List all epics
ls EPIC-*.md

# List all tasks
ls TASK-*.md

# Count tickets
ls EPIC-*.md | wc -l  # Count epics
ls TASK-*.md | wc -l  # Count tasks

# Search for tickets by keyword
grep -r "authentication" *.md
```
