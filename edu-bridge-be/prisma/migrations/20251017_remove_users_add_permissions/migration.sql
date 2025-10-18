-- Migration: Remove users table and add permission tables
-- This migration removes the users table and all foreign key constraints,
-- then creates school_permissions and class_permissions tables

-- Step 1: Drop all foreign key constraints to users table
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_parentId_fkey";
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_teacherId_fkey";
ALTER TABLE "child_class_assignments" DROP CONSTRAINT IF EXISTS "child_class_assignments_parentId_fkey";
ALTER TABLE "class_memberships" DROP CONSTRAINT IF EXISTS "class_memberships_userId_fkey";
ALTER TABLE "event_rsvps" DROP CONSTRAINT IF EXISTS "event_rsvps_userId_fkey";
ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_creatorId_fkey";
ALTER TABLE "group_memberships" DROP CONSTRAINT IF EXISTS "group_memberships_userId_fkey";
ALTER TABLE "groups" DROP CONSTRAINT IF EXISTS "groups_ownerId_fkey";
ALTER TABLE "message_read_status" DROP CONSTRAINT IF EXISTS "message_read_status_userId_fkey";
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_senderId_fkey";
ALTER TABLE "news_post_read_status" DROP CONSTRAINT IF EXISTS "news_post_read_status_userId_fkey";
ALTER TABLE "news_posts" DROP CONSTRAINT IF EXISTS "news_posts_authorId_fkey";
ALTER TABLE "school_admins" DROP CONSTRAINT IF EXISTS "school_admins_userId_fkey";
ALTER TABLE "thread_participants" DROP CONSTRAINT IF EXISTS "thread_participants_userId_fkey";
ALTER TABLE "user_privacy_settings" DROP CONSTRAINT IF EXISTS "user_privacy_settings_userId_fkey";

-- Step 2: Drop the users table
DROP TABLE IF EXISTS "users" CASCADE;

-- Step 3: Create school_permissions table
CREATE TABLE "school_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_permissions_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create class_permissions table
CREATE TABLE "class_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_permissions_pkey" PRIMARY KEY ("id")
);

-- Step 5: Add unique constraints for school_permissions
CREATE UNIQUE INDEX "school_permissions_userId_schoolId_permission_key" ON "school_permissions"("userId", "schoolId", "permission");

-- Step 6: Add index for school_permissions
CREATE INDEX "school_permissions_userId_schoolId_idx" ON "school_permissions"("userId", "schoolId");

-- Step 7: Add unique constraints for class_permissions
CREATE UNIQUE INDEX "class_permissions_userId_classId_permission_key" ON "class_permissions"("userId", "classId", "permission");

-- Step 8: Add index for class_permissions
CREATE INDEX "class_permissions_userId_classId_idx" ON "class_permissions"("userId", "classId");

-- Step 9: Add foreign key for school_permissions
ALTER TABLE "school_permissions" ADD CONSTRAINT "school_permissions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 10: Add foreign key for class_permissions
ALTER TABLE "class_permissions" ADD CONSTRAINT "class_permissions_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
