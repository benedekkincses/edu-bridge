# Backend Structure

The backend endpoints are always the following:

Controller -> Service -> Repository

- **Controller**: Handles HTTP requests, passes data to services, and returns responses.
- **Service**: Contains business logic, processes data, and interacts with repositories.
- **Repository**: Directly interacts with the database, performing CRUD operations via prisma client.

## Authentication and User Management

**IMPORTANT:** We do NOT have a users table in the database. All user authentication is handled by Keycloak.

- User data comes from Keycloak JWT tokens
- User IDs throughout the database are Keycloak user IDs (String fields)
- Extract user info from request using `getUserInfo(req)` from keycloakAuth middleware
- See `claude/authentication-and-permissions.md` for full details

## Migrations and Prisma
- Always create a new migration after modifying the prisma schema.