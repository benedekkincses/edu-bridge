# TASK-009: Define User and Auth Models

**Type:** Task
**Epic:** EPIC-002
**Priority:** Critical
**Status:** Backlog
**Assignee:** Unassigned

## Description
Define User and UserPrivacySettings models in Prisma schema with all required fields and relationships.

## Tasks
- [ ] Define User model with Keycloak ID
- [ ] Define UserPrivacySettings model
- [ ] Add relationships between User and UserPrivacySettings
- [ ] Add indexes for performance
- [ ] Generate Prisma Client
- [ ] Test model creation in Prisma Studio

## Acceptance Criteria
- User model matches architecture specification
- Privacy settings linked to users and schools
- All required fields present
- Relationships properly defined

## Technical Notes
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  firstName     String
  lastName      String
  phone         String?
  avatar        String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  privacySettings UserPrivacySettings[]
  // ... other relationships
}

model UserPrivacySettings {
  id           String  @id @default(uuid())
  userId       String
  schoolId     String
  emailVisible Boolean @default(true)
  phoneVisible Boolean @default(true)

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  school School @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  @@unique([userId, schoolId])
}
```

## Estimated Effort
2 hours

## Dependencies
- TASK-008: Initialize Prisma
