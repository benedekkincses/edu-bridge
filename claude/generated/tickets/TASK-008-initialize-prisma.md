# TASK-008: Initialize Prisma

**Type:** Task
**Epic:** EPIC-002
**Priority:** Critical
**Status:** Backlog
**Assignee:** Unassigned

## Description
Initialize Prisma ORM in the API package and configure it to work with PostgreSQL database.

## Tasks
- [ ] Install Prisma and Prisma Client in packages/api
- [ ] Run `npx prisma init`
- [ ] Configure DATABASE_URL in .env
- [ ] Create prisma/schema.prisma with datasource and generator
- [ ] Test connection to PostgreSQL
- [ ] Add Prisma scripts to package.json (migrate, studio, generate, seed)

## Acceptance Criteria
- Prisma CLI commands work from packages/api
- Database connection successful
- Prisma Client can be imported in TypeScript
- `npm run db:studio` opens Prisma Studio

## Technical Notes
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}
```

## Estimated Effort
1 hour

## Dependencies
- TASK-007: Set up PostgreSQL with Docker
