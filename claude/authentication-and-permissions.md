# Authentication and Permissions Architecture

## Overview

The edu-bridge application uses Keycloak for user authentication and a permission-based authorization system. **There is no users table in the database.** All user data comes from Keycloak, and user IDs are stored as simple String fields throughout the database.

## Authentication Flow

1. Users authenticate through Keycloak (external identity provider)
2. Upon successful authentication, Keycloak issues a JWT token
3. Every request to the backend includes this JWT token in the Authorization header
4. The backend validates the JWT token using Keycloak's public keys
5. User information (userID, email, roles, etc.) is extracted from the validated JWT token

## User ID Storage

- **No users table exists in the database**
- All user references in the database are stored as String fields containing the Keycloak user ID (sub claim from JWT)
- Example fields:
  - `appointments.teacherId` → Keycloak user ID
  - `appointments.parentId` → Keycloak user ID
  - `events.creatorId` → Keycloak user ID
  - `messages.senderId` → Keycloak user ID

## Permission System

The application uses a fine-grained permission system with two main permission tables:

### School Permissions

Table: `school_permissions`

Defines what actions a user can perform on a specific school.

**Fields:**
- `id`: Unique identifier
- `userId`: Keycloak user ID
- `schoolId`: Reference to the school
- `permission`: Permission string (e.g., "read", "write", "admin", "manage_teachers", "manage_students")
- `createdAt`: Timestamp

**Unique constraint:** `(userId, schoolId, permission)`

**Common permission strings:**
- `read` - View school information
- `write` - Modify school information
- `admin` - Full administrative access to the school
- `manage_teachers` - Add/remove/modify teacher assignments
- `manage_students` - Add/remove/modify student assignments
- `manage_classes` - Create/delete classes within the school

### Class Permissions

Table: `class_permissions`

Defines what actions a user can perform on a specific class.

**Fields:**
- `id`: Unique identifier
- `userId`: Keycloak user ID
- `classId`: Reference to the class
- `permission`: Permission string (e.g., "read", "write", "admin", "post_news", "create_groups", "delete_messages")
- `createdAt`: Timestamp

**Unique constraint:** `(userId, classId, permission)`

**Common permission strings:**
- `read` - View class information and content
- `write` - Modify class information
- `admin` - Full administrative access to the class
- `post_news` - Ability to post news/announcements
- `create_groups` - Create groups within the class
- `delete_messages` - Moderate and delete messages

## User-Entity Relationships

The application uses several linking tables to establish relationships between users and entities:

### School-Level Relationships

**school_admins**
- Links Keycloak users to schools they administer
- `userId` (Keycloak user ID) + `schoolId`
- Provides basic admin access (detailed permissions in `school_permissions`)

**user_privacy_settings**
- User privacy preferences per school
- `userId` (Keycloak user ID) + `schoolId`
- Controls visibility of email, phone, etc.

### Class-Level Relationships

**class_memberships**
- Links users to classes they belong to
- `userId` (Keycloak user ID) + `classId` + `role` (teacher/parent)
- Legacy permission flags: `canPostNews`, `canCreateGroups`, `canDeleteMessages`
- Note: Moving towards using `class_permissions` for granular control

### Parent-Child Relationships

**child_class_assignments**
- Links children to classes with their parent
- `childId` + `classId` + `parentId` (Keycloak user ID)

### Other User Relationships

- **appointments**: `teacherId`, `parentId` (both Keycloak user IDs)
- **events**: `creatorId` (Keycloak user ID)
- **event_rsvps**: `userId` (Keycloak user ID)
- **group_memberships**: `userId` (Keycloak user ID)
- **groups**: `ownerId` (Keycloak user ID)
- **messages**: `senderId` (Keycloak user ID)
- **message_read_status**: `userId` (Keycloak user ID)
- **news_posts**: `authorId` (Keycloak user ID)
- **news_post_read_status**: `userId` (Keycloak user ID)
- **thread_participants**: `userId` (Keycloak user ID)

## Authorization Middleware

### Current Implementation

Located in `/src/middleware/keycloakAuth.ts`:

**verifyToken**
- Validates JWT token from Authorization header
- Extracts user information and attaches to `req.user`
- All protected routes must use this middleware

**requireRole(role: string)**
- Checks if user has a specific Keycloak realm role
- Example: `requireRole('teacher')`

**requireAnyRole(roles: string[])**
- Checks if user has any of the specified roles
- Example: `requireAnyRole(['teacher', 'admin'])`

### Future Implementation (NOT YET IMPLEMENTED)

Permission checking middleware should be added to validate user permissions on specific resources:

```typescript
// Example - not yet implemented
requireSchoolPermission(schoolId: string, permission: string)
requireClassPermission(classId: string, permission: string)
```

## Implementation Guidelines

### Extracting User ID from Request

```typescript
import { getUserInfo } from "../middleware/keycloakAuth.js";

export const someController = (req: Request, res: Response) => {
  const user = getUserInfo(req);
  const userId = user.sub; // Keycloak user ID

  // Use userId to query permissions or create records
};
```

### Checking Permissions (Future Pattern)

```typescript
// This pattern should be implemented in the future
// Check if user has permission to access a school
const hasPermission = await prisma.school_permissions.findFirst({
  where: {
    userId: user.sub,
    schoolId: schoolId,
    permission: 'read'
  }
});

if (!hasPermission) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### Creating Permission Entries

```typescript
// Grant a user permission to a school
await prisma.school_permissions.create({
  data: {
    id: generateId(),
    userId: user.sub, // Keycloak user ID
    schoolId: schoolId,
    permission: 'read',
  }
});
```

## Migration Notes

### What Changed

1. **Removed `users` table** - All user data now comes from Keycloak
2. **Converted all user foreign keys to String fields** - Now store Keycloak user IDs directly
3. **Added `school_permissions` table** - Fine-grained school-level permissions
4. **Added `class_permissions` table** - Fine-grained class-level permissions
5. **Updated all user-related models** - Removed foreign key constraints to users table

### Breaking Changes

- All existing user references must be updated to use Keycloak user IDs
- Any code querying the `users` table must be updated to use Keycloak token data
- Permission checks should gradually migrate from role-based to permission-based

## Security Considerations

1. **Always validate JWT tokens** - Use the `verifyToken` middleware on all protected routes
2. **Extract user ID from token** - Never trust user IDs from request body/params
3. **Implement permission checks** - Validate user has appropriate permissions before allowing actions
4. **Audit trail** - All permission tables include `createdAt` for tracking
5. **Cascade deletes** - Permissions are automatically deleted when school/class is deleted

## Next Steps

1. ✅ Remove users table and update schema
2. ✅ Create permission tables
3. ✅ Update authentication to use Keycloak user IDs
4. 🔜 Implement permission checking middleware
5. 🔜 Add permission checks to all controllers
6. 🔜 Migrate from `class_memberships` permission flags to `class_permissions`
7. 🔜 Create admin UI for managing permissions
8. 🔜 Add audit logging for permission changes
