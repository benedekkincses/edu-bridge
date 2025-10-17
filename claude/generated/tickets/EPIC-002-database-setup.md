# EPIC-002: Database & Core Models

**Type:** Epic
**Priority:** Critical
**Status:** Backlog

## Description
Set up PostgreSQL database with Prisma ORM and implement the complete data model including all entities, relationships, and migrations for the EduBridge application.

## Goals
- Set up PostgreSQL with Docker
- Configure Prisma ORM
- Define complete database schema
- Create migrations
- Implement seed data for development
- Set up Prisma Studio for database inspection

## Acceptance Criteria
- [x] PostgreSQL running in Docker
- [x] Prisma schema matches architecture design
- [x] All entities and relationships defined
- [x] Migrations run successfully
- [x] Seed data creates test schools, users, classes
- [x] Prisma Studio accessible for debugging

## Related Tasks
- TASK-007: Set up PostgreSQL with Docker
- TASK-008: Initialize Prisma
- TASK-009: Define User and Auth models
- TASK-010: Define School and Admin models
- TASK-011: Define Class and Child models
- TASK-012: Define Group and Message models
- TASK-013: Define News and Event models
- TASK-014: Create database migrations
- TASK-015: Create seed data script

## Dependencies
- EPIC-001: Project Setup (for monorepo structure)

## Estimated Effort
16-20 hours
