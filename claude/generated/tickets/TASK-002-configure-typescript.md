# TASK-002: Configure TypeScript

**Type:** Task
**Epic:** EPIC-001
**Priority:** Critical
**Status:** Backlog
**Assignee:** Unassigned

## Description
Set up TypeScript configuration for all packages with a shared base configuration and package-specific overrides.

## Tasks
- [ ] Create base tsconfig.json in root
- [ ] Create tsconfig.json for packages/api (Node.js target)
- [ ] Create tsconfig.json for packages/web (ES6 target)
- [ ] Create tsconfig.json for packages/mobile (React Native target)
- [ ] Create tsconfig.json for packages/shared (library target)
- [ ] Install TypeScript as dev dependency
- [ ] Add typecheck scripts to all packages

## Acceptance Criteria
- All packages compile without errors
- Shared types can be imported across packages
- `npm run typecheck` validates all packages
- Strict mode enabled with appropriate compiler options

## Technical Notes
Base tsconfig should include:
- strict: true
- esModuleInterop: true
- skipLibCheck: true
- forceConsistentCasingInFileNames: true

## Estimated Effort
2 hours
