# EduBridge Architecture Documentation

## Executive Summary

EduBridge is a school-parent communication portal that replaces fragmented tools (Messenger, Facebook, Excel sheets) with a unified platform. This document outlines the technical architecture and business logic for a scalable, startup-friendly implementation.

**Core Stack:**
- Backend: Node.js (TypeScript) with Express/Fastify
- Frontend Web: React with Vite (TypeScript)
- Mobile: React Native with Expo (TypeScript)
- Database: PostgreSQL 15+
- Auth: Keycloak (OIDC)
- Storage: MinIO (S3-compatible)
- Deployment: Docker + Nginx reverse proxy on VPS

---

## Business Logic & Rules

### User Roles

**School Admin**
- Can manage multiple schools
- Can create schools, classes (Class and TeacherRoom types), and children
- Can assign teachers and parents to classes
- Can assign permissions to teachers and parents within classes
- Full access to all content within their schools

**Teacher**
- Can be assigned to multiple schools and classes
- Has class-specific permissions assigned by school admin:
  - Post to class news feed
  - Create group chats within class
  - Delete messages in groups they own
- Can access TeacherRoom (teacher-only classes)

**Parent**
- Can have children in multiple schools and/or multiple classes
- **Cannot** create groups, invite others, or post to news feed (unless given special permission)
- Can request group creation via direct messaging with teachers
- Can have special "group creator" permission for specific cases (e.g., surprise party planning)
- Must switch between child contexts (no feed aggregation)
- Can upload files and delete their own messages

**Child**
- Not a user account - purely a data entity
- Created and managed by school admins
- Links parents to classes
- Can be moved between classes by school admins

### Hierarchy

```
Schools
  └── Classes (type: Class or TeacherRoom)
      ├── News Feed (class-level only)
      ├── Groups (group chats)
      └── Members (teachers, parents, children)
```

**Class Types:**
- **Class**: Contains teachers, parents, and children
- **TeacherRoom**: Contains only teachers and school admins (for teacher collaboration)

### Context Switching

Parents with multiple children must explicitly switch between child contexts:
- Each context shows only that child's class information
- No aggregated feeds across children
- Clear UI indicator of current context

### News Feed

**Scope:**
- School-wide news feed (visible to all members of the school)
- Class-wide news feed (visible to all members of the class)
- **No** group-level news feed (groups only have chat)

**Posting:**
- Only users with "post to news feed" permission can post
- Template-based posts (structured forms, not free text)
- Read-only for other users (no comments, but can react/acknowledge)

### Groups & Privacy

**Group Creation:**
- Teachers (with permission) can create groups within their classes
- Parents cannot create groups (except with special permission)
- No group search - users only see groups they're members of

**Visibility:**
- No "open" vs "closed" vs "secret" distinction
- If you're a member, you see it; otherwise, it doesn't exist for you
- Group membership managed by group owner or school admin

**Messaging:**
- All messaging is two-way (DMs and group chats)
- Everyone can message everyone via DMs
- Threads are contextual (within a DM or group)
- @mentions supported
- "Seen" feature:
  - Group messages: Show list of who has seen it
  - Direct messages: Boolean "seen" indicator
  - News posts: Track read status

### Profile & Privacy

**Default Behavior:**
- All profiles are public by default
- Contact info (email, phone) visible to all

**Privacy Controls:**
- Users can set visibility of their contact info **per school**
- Example: Parent visible in School A, hidden in School B

### Content & Files

**File Uploads:**
- Allowed by: Parents, Teachers
- Supported types: Images (jpg, png, gif, etc.), Office docs (docx, xlsx, pptx), PDF
- Max file size: 200MB
- No storage limit per user/group

**Message Deletion:**
- Users can delete their own messages
- Group owners can delete any message in their groups
- School admins can delete any content in their schools

### Events

**Event Levels:**
- School-wide events (visible to all school members)
- Class-level events (visible to class members)
- Group-level events (visible to group members)

**RSVP:**
- Parents can RSVP to events (Yes/No/Maybe)
- Teachers can see RSVP status

**Booked4US Integration:**
- **Mandatory** for parent-teacher meeting scheduling
- Integrated as external appointment booking system

### AImee Chatbot

- External service with its own endpoint
- Proxy endpoint in main API: `/api/aimee/chat`
- Long polling for chat streaming
- Dedicated chat page in web and mobile

---

## Data Model

### Core Entities

```typescript
// Users (Keycloak-managed, minimal local profile)
User {
  id: UUID (Keycloak user ID)
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  createdAt: timestamp
  updatedAt: timestamp
}

// Per-school privacy settings
UserPrivacySettings {
  id: UUID
  userId: UUID (FK: User)
  schoolId: UUID (FK: School)
  emailVisible: boolean (default: true)
  phoneVisible: boolean (default: true)
}

// Schools
School {
  id: UUID
  name: string
  address?: string
  logo?: string
  createdAt: timestamp
  updatedAt: timestamp
}

// School Admins
SchoolAdmin {
  id: UUID
  userId: UUID (FK: User)
  schoolId: UUID (FK: School)
  createdAt: timestamp
}

// Children (data entity, not users)
Child {
  id: UUID
  firstName: string
  lastName: string
  dateOfBirth?: date
  schoolId: UUID (FK: School)
  createdAt: timestamp
  updatedAt: timestamp
}

// Classes (includes TeacherRoom type)
Class {
  id: UUID
  schoolId: UUID (FK: School)
  name: string
  type: enum('Class', 'TeacherRoom')
  description?: string
  createdAt: timestamp
  updatedAt: timestamp
}

// Class Memberships (teachers and parents)
ClassMembership {
  id: UUID
  classId: UUID (FK: Class)
  userId: UUID (FK: User)
  role: enum('teacher', 'parent')
  permissions: JSON {
    canPostNews: boolean
    canCreateGroups: boolean
    canDeleteMessages: boolean (group owner)
  }
  createdAt: timestamp
}

// Child-Class Assignment
ChildClassAssignment {
  id: UUID
  childId: UUID (FK: Child)
  classId: UUID (FK: Class)
  parentId: UUID (FK: User) // Links parent to child in this class
  createdAt: timestamp
}

// Groups (chat groups within classes)
Group {
  id: UUID
  classId: UUID (FK: Class)
  name: string
  description?: string
  ownerId: UUID (FK: User) // Creator/owner
  createdAt: timestamp
  updatedAt: timestamp
}

// Group Memberships
GroupMembership {
  id: UUID
  groupId: UUID (FK: Group)
  userId: UUID (FK: User)
  joinedAt: timestamp
}

// Messages (DMs and group chat)
Message {
  id: UUID
  threadId: UUID (FK: Thread)
  senderId: UUID (FK: User)
  content: string
  attachments: JSON[] // S3 keys and metadata
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt?: timestamp
}

// Threads (contextual: DM or group)
Thread {
  id: UUID
  type: enum('direct', 'group')
  groupId?: UUID (FK: Group) // if type=group
  createdAt: timestamp
  updatedAt: timestamp
}

// Thread Participants (for DMs)
ThreadParticipant {
  id: UUID
  threadId: UUID (FK: Thread)
  userId: UUID (FK: User)
}

// Message Read Status
MessageReadStatus {
  id: UUID
  messageId: UUID (FK: Message)
  userId: UUID (FK: User)
  readAt: timestamp
}

// News Posts
NewsPost {
  id: UUID
  authorId: UUID (FK: User)
  scope: enum('school', 'class')
  schoolId?: UUID (FK: School) // if scope=school
  classId?: UUID (FK: Class) // if scope=class
  templateType: string // e.g., 'announcement', 'event', 'reminder'
  title: string
  content: JSON // Template-based structured data
  attachments: JSON[]
  publishedAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}

// News Post Read Status
NewsPostReadStatus {
  id: UUID
  newsPostId: UUID (FK: NewsPost)
  userId: UUID (FK: User)
  readAt: timestamp
}

// Events
Event {
  id: UUID
  creatorId: UUID (FK: User)
  scope: enum('school', 'class', 'group')
  schoolId?: UUID (FK: School)
  classId?: UUID (FK: Class)
  groupId?: UUID (FK: Group)
  title: string
  description?: string
  location?: string
  startTime: timestamp
  endTime?: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}

// Event RSVPs
EventRSVP {
  id: UUID
  eventId: UUID (FK: Event)
  userId: UUID (FK: User)
  status: enum('yes', 'no', 'maybe')
  createdAt: timestamp
  updatedAt: timestamp
}

// Booked4US Appointments (external system reference)
Appointment {
  id: UUID
  eventId?: UUID (FK: Event) // Optional link to event
  schoolId: UUID (FK: School)
  teacherId: UUID (FK: User)
  parentId: UUID (FK: User)
  childId: UUID (FK: Child)
  booked4usId: string // External system ID
  startTime: timestamp
  endTime: timestamp
  status: enum('pending', 'confirmed', 'cancelled')
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Key Relationships

- User ↔ School (many-to-many via SchoolAdmin, ClassMembership, or ChildClassAssignment)
- School → Class (one-to-many)
- Class → Group (one-to-many)
- User ↔ Class (many-to-many via ClassMembership with permissions)
- Parent ↔ Child ↔ Class (via ChildClassAssignment)
- Group → Thread (one-to-one for group chats)
- User ↔ User → Thread (many-to-many for DMs)
- Thread → Message (one-to-many)

---

## Technical Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                     │
│       SSL, Static Files, Load Balancing, Rate Limiting       │
└───────────┬─────────────────────────────────┬───────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐         ┌──────────────────────────┐
│   Web Portal (React)  │         │   API Server (Node.js)   │
│   Static Files        │         │   Express/Fastify        │
│   Port 5173 (dev)     │         │   Port 3000              │
└───────────────────────┘         └──────────┬───────────────┘
                                              │
┌───────────────────────┐                    │
│  Mobile (React Native)│────────────────────┘
│  Expo                 │         │
└───────────────────────┘         │
                                  │
                    ┌─────────────┼──────────────┬───────────┐
                    ▼             ▼              ▼           ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐
            │PostgreSQL│  │ Keycloak │  │  MinIO   │  │  AImee  │
            │  :5432   │  │   OIDC   │  │  S3 API  │  │ External│
            └──────────┘  └──────────┘  └──────────┘  └─────────┘
```

### Project Structure (Monorepo)

```
edu-bridge/                           # Project root
├── edu-bridge-be/                    # Node.js backend (TypeScript)
│   ├── src/
│   │   ├── modules/                  # Feature modules
│   │   │   ├── auth/                 # OIDC + JWT validation
│   │   │   ├── users/                # User profiles, privacy
│   │   │   ├── schools/              # School CRUD
│   │   │   ├── classes/              # Class + TeacherRoom
│   │   │   ├── children/             # Child data management
│   │   │   ├── groups/               # Group chat management
│   │   │   ├── messages/             # DMs, threads, polling
│   │   │   ├── news/                 # News feed + templates
│   │   │   ├── events/               # Events + RSVP
│   │   │   ├── appointments/         # Booked4US integration
│   │   │   ├── aimee/                # AImee chat proxy
│   │   │   └── storage/              # File uploads (MinIO)
│   │   ├── db/
│   │   │   ├── schema.prisma         # Prisma schema
│   │   │   └── migrations/
│   │   ├── common/
│   │   │   ├── middleware/           # Auth, error handling
│   │   │   ├── polling/              # Long polling manager
│   │   │   └── permissions/          # Permission checker
│   │   ├── config/                   # Environment config
│   │   └── server.ts                 # App entry point
│   ├── tests/
│   ├── tsconfig.json
│   └── package.json
│
├── edu-bridge-fe/                    # React Native mobile app (Expo)
│   ├── src/
│   │   ├── features/                 # Feature modules
│   │   │   ├── auth/                 # Login, OIDC flow
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── schools/              # School management (admin)
│   │   │   ├── classes/              # Class views
│   │   │   ├── groups/               # Group chats
│   │   │   ├── messages/             # Direct messaging
│   │   │   ├── news/                 # News feed
│   │   │   ├── events/               # Events calendar
│   │   │   ├── appointments/         # Meeting booking
│   │   │   ├── aimee/                # AImee chatbot
│   │   │   └── profile/              # User profile + privacy
│   │   ├── shared/
│   │   │   ├── components/           # Reusable UI components
│   │   │   ├── hooks/                # Custom hooks
│   │   │   └── navigation/           # React Navigation
│   │   ├── stores/                   # Zustand stores
│   │   └── api/                      # API client
│   ├── android/                      # Android native code
│   ├── ios/                          # iOS native code
│   ├── App.tsx                       # App entry point
│   ├── app.json                      # Expo configuration
│   ├── babel.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── packages/
│   ├── api/                          # Shared API layer (if needed)
│   │   ├── src/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── shared/                       # Shared types/utils
│       ├── types/                    # TypeScript definitions
│       │   ├── user.ts
│       │   ├── school.ts
│       │   ├── class.ts
│       │   ├── message.ts
│       │   └── index.ts
│       ├── utils/                    # Shared utilities
│       ├── tsconfig.json
│       └── package.json
│
├── infra/                            # Infrastructure configuration
│   ├── docker/
│   │   ├── docker-compose.yml        # Production setup
│   │   ├── docker-compose.dev.yml    # Development overrides
│   │   ├── api.Dockerfile
│   │   └── nginx.conf
│   └── k8s/                          # Kubernetes configs (future)
│
├── claude/                           # Claude Code instructions
│   ├── concept.md                    # Project concept
│   ├── features.md                   # Feature requirements
│   ├── technical.md                  # Technical specifications
│   └── generated/                    # Generated documentation
│       ├── architecture.md           # This file
│       ├── board.md                  # Project board
│       └── tickets/                  # Ticket breakdown
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI/CD pipeline
│       └── deploy.yml
│
├── .gitignore
├── package.json                      # Workspace root
├── tsconfig.json                     # Base TS config
├── CLAUDE.md                         # Claude instructions entry point
└── README.md

**Note:** Web portal (React with Vite) will be added in the future as a separate directory
(e.g., `edu-bridge-web/`) following the same feature structure as the mobile app.
```

---

## API Architecture

### Module-Based Structure

Each feature is self-contained with:
- **Routes**: Express/Fastify route definitions
- **Controllers**: Request/response handling
- **Services**: Business logic
- **Repository**: Data access (Prisma)
- **Validators**: Request validation (Zod)

Example module structure:
```
src/modules/messages/
├── messages.routes.ts
├── messages.controller.ts
├── messages.service.ts
├── messages.repository.ts
├── messages.validators.ts
└── messages.types.ts
```

### Key API Endpoints

**Authentication**
```
POST   /api/auth/login              # OIDC login redirect
GET    /api/auth/callback           # OIDC callback
POST   /api/auth/logout             # Logout
GET    /api/auth/me                 # Current user info
```

**Schools (Admin only)**
```
GET    /api/schools                 # List schools (for current admin)
POST   /api/schools                 # Create school
GET    /api/schools/:id             # Get school details
PATCH  /api/schools/:id             # Update school
DELETE /api/schools/:id             # Delete school
```

**Classes**
```
GET    /api/schools/:schoolId/classes              # List classes
POST   /api/schools/:schoolId/classes              # Create class (admin)
GET    /api/classes/:id                            # Get class details
PATCH  /api/classes/:id                            # Update class (admin)
DELETE /api/classes/:id                            # Delete class (admin)
POST   /api/classes/:id/members                    # Add member (admin)
DELETE /api/classes/:id/members/:userId            # Remove member (admin)
PATCH  /api/classes/:id/members/:userId            # Update permissions (admin)
```

**Children (Admin only)**
```
GET    /api/schools/:schoolId/children             # List children
POST   /api/schools/:schoolId/children             # Create child
GET    /api/children/:id                           # Get child details
PATCH  /api/children/:id                           # Update child
DELETE /api/children/:id                           # Delete child
POST   /api/children/:id/assign-class              # Assign to class
POST   /api/children/:id/assign-parent             # Assign parent
```

**Context Switching (Parents)**
```
GET    /api/me/contexts                            # List available contexts
POST   /api/me/contexts/switch                     # Switch to child context
```

**Groups**
```
GET    /api/classes/:classId/groups                # List groups in class
POST   /api/classes/:classId/groups                # Create group (permission required)
GET    /api/groups/:id                             # Get group details
PATCH  /api/groups/:id                             # Update group (owner)
DELETE /api/groups/:id                             # Delete group (owner)
POST   /api/groups/:id/members                     # Add member (owner)
DELETE /api/groups/:id/members/:userId             # Remove member (owner)
```

**Messages (Long Polling)**
```
GET    /api/messages/poll?context=<id>&since=<timestamp>&timeout=30
                                                   # Long poll for new messages
POST   /api/threads                                # Create DM thread
GET    /api/threads/:id/messages                   # Get thread messages
POST   /api/threads/:id/messages                   # Send message
DELETE /api/messages/:id                           # Delete message
PATCH  /api/messages/:id/read                      # Mark as read
```

**News Feed**
```
GET    /api/news?scope=school|class&id=<id>        # Get news feed
POST   /api/news                                   # Create news post (permission)
GET    /api/news/:id                               # Get news post details
PATCH  /api/news/:id                               # Update news post
DELETE /api/news/:id                               # Delete news post
PATCH  /api/news/:id/read                          # Mark as read
```

**Events**
```
GET    /api/events?scope=school|class|group&id=<id>  # Get events
POST   /api/events                                    # Create event
GET    /api/events/:id                                # Get event details
PATCH  /api/events/:id                                # Update event
DELETE /api/events/:id                                # Delete event
POST   /api/events/:id/rsvp                           # RSVP to event
GET    /api/events/:id/rsvps                          # Get RSVP list
```

**Appointments (Booked4US)**
```
GET    /api/appointments                           # List appointments
POST   /api/appointments                           # Book appointment (proxy to Booked4US)
GET    /api/appointments/:id                       # Get appointment
PATCH  /api/appointments/:id                       # Update appointment
DELETE /api/appointments/:id                       # Cancel appointment
```

**AImee Chatbot**
```
POST   /api/aimee/chat                             # Send message (proxy)
GET    /api/aimee/poll?conversationId=<id>&since=<timestamp>
                                                   # Long poll for responses
```

**File Storage**
```
POST   /api/files/upload                           # Request upload URL
POST   /api/files/confirm                          # Confirm upload complete
GET    /api/files/:id                              # Get file metadata
DELETE /api/files/:id                              # Delete file
```

**User Profile**
```
GET    /api/users/:id                              # Get user profile
PATCH  /api/users/:id                              # Update profile
GET    /api/users/:id/privacy/:schoolId            # Get privacy settings
PATCH  /api/users/:id/privacy/:schoolId            # Update privacy settings
```

### Long Polling Implementation

**Messages Polling:**
```typescript
// Client requests
GET /api/messages/poll?contextId=<class|group|thread>&since=<timestamp>&timeout=30

// Server logic
- Check for new messages since timestamp
- If found: return immediately
- If not found: wait up to 30 seconds
- Return empty array on timeout
- Client reconnects immediately after response
```

**Benefits:**
- No WebSocket infrastructure needed
- Works with all clients (including restrictive networks)
- Nginx can handle long-running connections
- Simple to implement and debug

---

## Authentication & Authorization

### OIDC Flow with Keycloak

1. User clicks "Login"
2. Frontend redirects to `/api/auth/login`
3. API redirects to Keycloak login page
4. User authenticates with Keycloak
5. Keycloak redirects to `/api/auth/callback`
6. API validates token, creates/updates user in DB
7. API sets JWT cookie (httpOnly, secure)
8. API redirects to frontend dashboard

### JWT Validation

Every API request:
1. Extract JWT from cookie or Authorization header
2. Validate signature with Keycloak public key
3. Check expiration
4. Load user from DB (cached)
5. Attach user to request context

### Permission System

**Class-Level Permissions:**
```typescript
ClassMembership {
  permissions: {
    canPostNews: boolean
    canCreateGroups: boolean
    canDeleteMessages: boolean // group owner
  }
}
```

**Permission Checks:**
```typescript
// Middleware example
async function requirePermission(permission: keyof Permissions) {
  return async (req, res, next) => {
    const membership = await getClassMembership(req.user.id, req.params.classId)
    if (!membership?.permissions[permission]) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

// Usage
router.post('/classes/:classId/news',
  authenticate,
  requirePermission('canPostNews'),
  createNewsPost
)
```

**Context-Based Access:**
- School Admins: Full access to all schools they manage
- Teachers: Access to classes they're assigned to
- Parents: Access based on current child context

---

## File Upload Flow

### S3-Compatible Storage with MinIO

**Upload Process:**
```
1. Client requests upload
   POST /api/files/upload
   Body: { fileName: string, fileType: string, fileSize: number }

2. Server validates (file type, size < 200MB)

3. Server generates pre-signed URL from MinIO
   const url = await s3.getSignedUrl('putObject', {
     Bucket: 'edubridge-files',
     Key: `uploads/${userId}/${uuid}-${fileName}`,
     Expires: 300, // 5 minutes
     ContentType: fileType
   })

4. Server responds with upload URL
   { uploadUrl: string, fileId: string }

5. Client uploads directly to MinIO
   PUT <uploadUrl>
   Body: <file binary>

6. Client confirms upload
   POST /api/files/confirm
   Body: { fileId: string }

7. Server stores metadata in DB
   File { id, userId, key, fileName, fileType, fileSize, uploadedAt }
```

**Supported File Types:**
- Images: jpg, jpeg, png, gif, webp, svg
- Office: docx, xlsx, pptx, doc, xls, ppt
- PDF: pdf

**File Size Limit:** 200MB per file

**Access Control:**
- Files are private by default
- Pre-signed URLs for download (with permission check)
- Automatic cleanup of orphaned files (cron job)

---

## Deployment Architecture

### Docker Compose Setup

```yaml
version: '3.9'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infra/docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./infra/docker/certs:/etc/nginx/certs:ro
      - web_dist:/usr/share/nginx/html:ro
    depends_on:
      - api
    restart: unless-stopped

  api:
    build:
      context: ./edu-bridge-be
      dockerfile: ../infra/docker/api.Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://edubridge:${DB_PASSWORD}@postgres:5432/edubridge
      KEYCLOAK_URL: http://keycloak:8080
      KEYCLOAK_REALM: edubridge
      KEYCLOAK_CLIENT_ID: edubridge-api
      KEYCLOAK_CLIENT_SECRET: ${KEYCLOAK_CLIENT_SECRET}
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
      AIMEE_ENDPOINT: ${AIMEE_ENDPOINT}
    depends_on:
      - postgres
      - keycloak
      - minio
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: edubridge
      POSTGRES_USER: edubridge
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: edubridge
      KC_DB_PASSWORD: ${DB_PASSWORD}
    command: start-dev
    depends_on:
      - postgres
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  minio_data:
  web_dist:
```

### Nginx Configuration

```nginx
upstream api_backend {
    server api:3000;
}

server {
    listen 80;
    server_name edubridge.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name edubridge.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    # Web app (static files)
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # API (including long polling)
    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;

        # Long polling support
        proxy_read_timeout 35s;
        proxy_connect_timeout 5s;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disable buffering for long polling
        proxy_buffering off;
        proxy_cache off;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req zone=api burst=20 nodelay;
}
```

---

## Development Workflow

### Local Development

```bash
# Initial setup
npm install                        # Install all workspace dependencies
cp .env.example .env              # Configure environment variables
npm run db:setup                  # Setup database (Prisma migrate)
npm run keycloak:setup            # Configure Keycloak realm (script)

# Start development
npm run dev                       # Start all services (api + mobile)

# Individual services
cd edu-bridge-be && npm run dev   # API on localhost:3000
cd edu-bridge-fe && npm start     # Mobile with Expo

# Future: Web portal
# cd edu-bridge-web && npm run dev  # Web on localhost:5173

# Database
npm run db:migrate                # Run migrations
npm run db:studio                 # Open Prisma Studio
npm run db:seed                   # Seed test data

# Testing
npm run test                      # Run all tests
npm run test:api                  # API tests only
npm run test:web                  # Web tests only
npm run test:e2e                  # E2E tests

# Linting & Formatting
npm run lint                      # Lint all packages
npm run format                    # Format with Prettier
npm run typecheck                 # TypeScript checking
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/group-chat
git commit -m "Add group chat functionality"
git push origin feature/group-chat

# Create PR (reviewed by PO + other dev)
# Merge to main after approval
```

### Docker Deployment

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Production deployment (with secrets)
export DB_PASSWORD=$(cat secrets/db_password)
export KEYCLOAK_CLIENT_SECRET=$(cat secrets/keycloak_secret)
docker-compose -f docker-compose.yml up -d
```

---

## Scalability Path

### Phase 1: MVP (Current Architecture)
- Single API instance
- PostgreSQL + MinIO on same VPS
- Nginx reverse proxy
- **Suitable for:** 10-50 schools, ~5,000 users

### Phase 2: Horizontal Scaling
- Multiple API instances (Docker Swarm or Kubernetes)
- Nginx load balancer (round-robin)
- Managed PostgreSQL with read replicas
- Redis for caching (session data, user permissions)
- Separate MinIO cluster (distributed mode)
- **Suitable for:** 100-500 schools, ~50,000 users

### Phase 3: Microservices
- Split modules into services:
  - Core API (auth, schools, classes)
  - Messaging Service (messages, threads, polling)
  - Notification Service (push notifications, emails)
  - Event Service (events, appointments)
- Redis Pub/Sub for inter-service communication
- CDN for static assets (web app, uploaded files)
- **Suitable for:** 1,000+ schools, 500,000+ users

### Phase 4: Advanced Optimizations
- GraphQL API (if needed for complex queries)
- WebSockets (upgrade from long polling)
- Elasticsearch for full-text search
- Analytics pipeline (message volume, engagement)
- Multi-region deployment

---

## Security Considerations

### Authentication
- OIDC with Keycloak (industry standard)
- JWT tokens with httpOnly cookies (XSS protection)
- Refresh token rotation
- Rate limiting on auth endpoints

### Authorization
- Role-based + permission-based access control
- Context-aware permissions (school/class level)
- Least privilege principle

### Data Protection
- Encrypt sensitive data at rest (database encryption)
- HTTPS everywhere (TLS 1.3)
- Secure file uploads (pre-signed URLs, virus scanning in future)
- Regular backups (PostgreSQL + MinIO)

### Input Validation
- Zod schemas for all API inputs
- Sanitize user content (prevent XSS)
- File type validation (magic number checking)

### Privacy
- GDPR-compliant data handling
- User-controlled privacy settings
- Data retention policies
- Right to deletion (cascade deletes)

---

## Testing Strategy

### Unit Tests
- Services (business logic)
- Repositories (data access)
- Utilities

### Integration Tests
- API endpoints (with test database)
- Authentication flows
- Permission checks

### E2E Tests (Playwright)
- User flows (login, create group, send message)
- Cross-browser testing
- Mobile app testing (Detox)

### Load Testing
- Long polling under load (Artillery)
- Concurrent message sending
- File upload stress test

---

## Monitoring & Observability

### Logging
- Structured logging (Winston or Pino)
- Log levels: error, warn, info, debug
- Centralized logs (optional: ELK stack)

### Metrics
- API response times
- Long polling connection count
- Database query performance
- File upload success rate

### Alerts
- High error rate
- Database connection failures
- Disk space warnings
- Long polling timeout spikes

---

## Next Steps

1. **Set up project structure** (npm workspaces, tsconfig)
2. **Initialize database schema** (Prisma)
3. **Implement authentication** (Keycloak OIDC integration)
4. **Build core API modules** (schools, classes, children)
5. **Develop messaging system** (threads, long polling)
6. **Create web portal** (React, basic UI)
7. **Implement mobile app** (React Native, Expo)
8. **Add news feed** (templates, permissions)
9. **Integrate file uploads** (MinIO)
10. **Build events & RSVP** (calendar integration)
11. **Integrate AImee chatbot** (proxy endpoint)
12. **Add Booked4US** (appointment booking)
13. **Testing & QA**
14. **Deployment & DevOps** (Docker, CI/CD)
15. **Launch MVP** (pilot with 1-2 schools)

---

## Conclusions

**Architecture Summary:**
- **Simple, proven stack**: Node.js + React + React Native + PostgreSQL
- **Startup-friendly**: No over-engineering, but designed for future scale
- **Clear separation**: Monorepo with independent packages
- **Security-first**: OIDC, permission-based access, privacy controls
- **Pragmatic choices**: Long polling over WebSockets, module-based over microservices

**Key Differentiators:**
- Context switching (no feed aggregation)
- TeacherRoom (teacher-only collaboration)
- Template-based news (structured content)
- Per-school privacy settings
- Child as data entity (not users)

**Team Structure:**
- 2 developers (full-stack, can split web + mobile if needed)
- 1 PO (requirements, testing, stakeholder management)

This architecture provides a solid foundation for MVP while allowing growth to hundreds of schools and thousands of users without major rewrites.
