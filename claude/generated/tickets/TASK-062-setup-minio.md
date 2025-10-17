# TASK-062: Set up MinIO with Docker

**Type:** Task
**Epic:** EPIC-010
**Priority:** High
**Status:** Backlog
**Assignee:** Unassigned

## Description
Set up MinIO S3-compatible storage using Docker for file uploads and storage.

## Tasks
- [ ] Add MinIO service to docker-compose.dev.yml
- [ ] Configure MinIO environment variables
- [ ] Set up persistent volume for file storage
- [ ] Create default bucket "edubridge-files"
- [ ] Test S3 API connectivity from API package
- [ ] Document MinIO setup and credentials

## Acceptance Criteria
- MinIO runs on localhost:9000
- Console accessible on localhost:9001
- Default bucket created
- S3 API accessible from Node.js
- Data persists between restarts

## Technical Notes
```yaml
minio:
  image: minio/minio:latest
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
    MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
  volumes:
    - minio_data:/data
  ports:
    - "9000:9000"
    - "9001:9001"
```

## Estimated Effort
2 hours
