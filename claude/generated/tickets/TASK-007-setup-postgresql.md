# TASK-007: Set up PostgreSQL with Docker

**Type:** Task
**Epic:** EPIC-002
**Priority:** Critical
**Status:** Done
**Assignee:** Claude

## Description
Set up PostgreSQL database using Docker for local development and create docker-compose configuration.

## Tasks
- [x] Create docker-compose.dev.yml with PostgreSQL service
- [x] Configure PostgreSQL with environment variables
- [x] Set up persistent volume for database data
- [x] Create .env.example with DATABASE_URL
- [x] Test database connection
- [x] Document database setup in README

## Implementation Notes
- PostgreSQL 15-alpine running on port 5435 (changed from 5432 due to port conflict)
- All files created in /infra directory
- Container name: edubridge-postgres-dev
- Database name: edubridge
- User: edubridge
- Default password: devpassword123 (can be overridden in .env)

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
