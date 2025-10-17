# TASK-007: Set up PostgreSQL with Docker

**Type:** Task
**Epic:** EPIC-002
**Priority:** Critical
**Status:** Backlog
**Assignee:** Unassigned

## Description
Set up PostgreSQL database using Docker for local development and create docker-compose configuration.

## Tasks
- [ ] Create docker-compose.dev.yml with PostgreSQL service
- [ ] Configure PostgreSQL with environment variables
- [ ] Set up persistent volume for database data
- [ ] Create .env.example with DATABASE_URL
- [ ] Test database connection
- [ ] Document database setup in README

## Acceptance Criteria
- `docker-compose up postgres` starts PostgreSQL
- Database persists data between restarts
- Connection string in .env works
- Database accessible from API package

## Technical Notes
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: edubridge
    POSTGRES_USER: edubridge
    POSTGRES_PASSWORD: ${DB_PASSWORD}
  volumes:
    - postgres_data:/var/lib/postgresql/data
  ports:
    - "5432:5432"
```

## Estimated Effort
1 hour
