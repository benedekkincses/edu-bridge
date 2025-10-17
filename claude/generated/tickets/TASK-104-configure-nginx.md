# TASK-104: Configure Nginx

**Type:** Task
**Epic:** EPIC-014
**Priority:** High
**Status:** Backlog
**Assignee:** Unassigned

## Description
Configure Nginx as reverse proxy for API and static file serving for web portal.

## Tasks
- [ ] Create nginx.conf with upstream configuration
- [ ] Configure reverse proxy for /api/* to API server
- [ ] Configure static file serving for web portal
- [ ] Set up long polling support (proxy timeouts)
- [ ] Configure rate limiting
- [ ] Add security headers
- [ ] Test configuration

## Acceptance Criteria
- Web portal served at root /
- API requests proxied to /api/*
- Long polling connections work (30+ seconds)
- Rate limiting prevents abuse
- Security headers present in responses
- Configuration validated with `nginx -t`

## Technical Notes
```nginx
location /api/ {
  proxy_pass http://api:3000;
  proxy_read_timeout 35s;  # Long polling
  proxy_buffering off;
  proxy_cache off;
}
```

## Estimated Effort
3 hours

## Dependencies
- TASK-101: Create Docker Compose Configuration
