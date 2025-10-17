# Backend Structure

The backend endpoints are always the following:

Controller -> Service -> Repository

- **Controller**: Handles HTTP requests, passes data to services, and returns responses.
- **Service**: Contains business logic, processes data, and interacts with repositories.
- **Repository**: Directly interacts with the database, performing CRUD operations via prisma client.