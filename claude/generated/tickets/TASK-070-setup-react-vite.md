# TASK-070: Set up React + Vite Project

**Type:** Task
**Epic:** EPIC-011
**Priority:** Critical
**Status:** Backlog
**Assignee:** Unassigned

## Description
Initialize React web application using Vite with TypeScript and proper configuration.

## Tasks
- [ ] Create React + TypeScript project with Vite in packages/web
- [ ] Configure vite.config.ts for development and production
- [ ] Set up proxy for API calls to localhost:3000
- [ ] Install essential dependencies (React Router, Zustand, etc.)
- [ ] Create basic folder structure (features, shared, stores)
- [ ] Configure absolute imports with @ alias
- [ ] Test development server

## Acceptance Criteria
- `npm run dev` starts web app on localhost:5173
- Hot module replacement works
- API proxy works for /api/* requests
- TypeScript compilation successful
- Production build works

## Technical Notes
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

## Estimated Effort
3 hours

## Dependencies
- TASK-001: Initialize monorepo structure
