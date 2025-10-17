# TASK-063: Implement File Upload API (Pre-signed URLs)

**Type:** Task
**Epic:** EPIC-010
**Priority:** High
**Status:** Backlog
**Assignee:** Unassigned

## Description
Implement file upload API using pre-signed URLs for secure direct uploads to MinIO.

## Tasks
- [ ] Install AWS SDK for S3 in API package
- [ ] Create storage module with S3 client
- [ ] Implement POST /api/files/upload (request upload URL)
- [ ] Implement POST /api/files/confirm (confirm upload)
- [ ] Implement GET /api/files/:id (get file metadata)
- [ ] Implement DELETE /api/files/:id (delete file)
- [ ] Generate pre-signed URLs with 5-minute expiry
- [ ] Write tests

## Acceptance Criteria
- Pre-signed URLs generated correctly
- Files upload directly to MinIO
- File metadata stored in database
- File deletion removes from MinIO and database
- Authorization checks prevent unauthorized access

## Technical Notes
```typescript
// Generate pre-signed URL
const uploadUrl = await s3.getSignedUrl('putObject', {
  Bucket: 'edubridge-files',
  Key: `uploads/${userId}/${uuid}-${fileName}`,
  Expires: 300,
  ContentType: fileType
})
```

## Estimated Effort
5 hours

## Dependencies
- TASK-062: Set up MinIO with Docker
- EPIC-002: Database Setup (File model)
