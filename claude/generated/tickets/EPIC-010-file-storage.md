# EPIC-010: File Storage & Uploads

**Type:** Epic
**Priority:** High
**Status:** Backlog

## Description
Implement S3-compatible file storage with MinIO, including pre-signed URL uploads, file type validation, and file management.

## Goals
- Set up MinIO with Docker
- Implement pre-signed URL upload flow
- File type validation (images, office docs, PDF)
- File size limit enforcement (200MB)
- File metadata storage
- File access control

## Acceptance Criteria
- [x] MinIO running and accessible
- [x] Files upload via pre-signed URLs
- [x] Only allowed file types can be uploaded
- [x] Files larger than 200MB are rejected
- [x] File metadata stored in database
- [x] Files accessible only with permission
- [x] File upload works on web and mobile

## Related Tasks
- TASK-062: Set up MinIO with Docker
- TASK-063: Implement file upload API (pre-signed URLs)
- TASK-064: Implement file validation
- TASK-065: Implement file metadata storage
- TASK-066: Create file upload UI component (shared)
- TASK-067: Create file preview component (shared)
- TASK-068: Integrate files with Messages
- TASK-069: Integrate files with News Feed

## Dependencies
- EPIC-002: Database Setup
- EPIC-003: Authentication

## Estimated Effort
12-16 hours
