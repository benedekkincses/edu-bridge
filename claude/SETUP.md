# Edu Bridge - Local Development Setup Guide

This guide provides comprehensive instructions to set up and run the Edu Bridge project locally.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Initial Setup](#initial-setup)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [Database Seeding](#database-seeding)
- [Running the Project](#running-the-project)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Development Tools](#development-tools)

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js**: v18.0.0 or higher (tested with v24.7.0)
- **npm**: v8.0.0 or higher (tested with v11.5.1)
- **Docker**: Latest stable version
- **Docker Compose**: Latest stable version
- **Git**: Latest stable version

### Verify Installations
```bash
node --version    # Should return v18.0.0 or higher
npm --version     # Should return v8.0.0 or higher
docker --version  # Should return Docker version info
git --version     # Should return Git version info
```

---

## Project Structure

```
edu-bridge/
├── .env                          # Root environment variables
├── .env.example                  # Environment template
├── CLAUDE.md                     # Claude AI instructions
├── claude/                       # Documentation directory
│   ├── backend.md               # Backend architecture docs
│   └── SETUP.md                 # This file
├── infra/                        # Infrastructure configuration
│   ├── docker-compose.dev.yml   # Development Docker setup
│   └── init-scripts/            # Database initialization scripts
├── edu-bridge-be/                # Backend application
│   ├── src/                     # Source code
│   │   ├── config/              # Configuration files
│   │   ├── controllers/         # HTTP request handlers
│   │   ├── services/            # Business logic
│   │   ├── repositories/        # Database operations
│   │   ├── routes/              # API routes
│   │   ├── db.ts                # Prisma client instance
│   │   └── index.ts             # Application entry point
│   ├── prisma/                  # Prisma ORM files
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Migration history
│   ├── package.json             # Backend dependencies
│   └── tsconfig.json            # TypeScript configuration
└── edu-bridge-fe/                # Frontend application (separate setup)
```

---

## Initial Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd edu-bridge
```

### 2. Configure Environment Variables

#### Root Directory (.env)
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` in the root directory:
```env
# Database Configuration
DB_PASSWORD=devpassword123

# Add other environment variables as needed
```

#### Backend Directory (.env)
Navigate to the backend and create its `.env` file:
```bash
cd edu-bridge-be
```

Create `edu-bridge-be/.env` with the following content:
```env
# Database Connection
DATABASE_URL="postgresql://edubridge:devpassword123@localhost:5435/edubridge"

# Server Configuration
PORT=3000

# Add other backend-specific variables as needed
```

---

## Database Setup

### 1. Start PostgreSQL with Docker

From the root directory:
```bash
cd infra
docker-compose -f docker-compose.dev.yml up -d
```

This will:
- Pull the PostgreSQL 15 Alpine image
- Create a container named `edubridge-postgres-dev`
- Expose PostgreSQL on port `5435`
- Create a database named `edubridge`
- Set up user credentials (user: `edubridge`, password: `devpassword123`)

### 2. Verify Database is Running
```bash
docker ps | grep edubridge-postgres-dev
```

You should see the container running and healthy.

### 3. Test Database Connection
```bash
docker exec -it edubridge-postgres-dev psql -U edubridge -d edubridge -c "SELECT version();"
```

---

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd edu-bridge-be
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- Express.js (API framework)
- Prisma (ORM)
- TypeScript (type safety)
- Swagger UI (API documentation)
- CORS (cross-origin support)
- Other required dependencies

### 3. Generate Prisma Client
```bash
npm run db:generate
```

This generates the Prisma Client based on your schema at:
- Output: `node_modules/@prisma/client`

### 4. Run Database Migrations
```bash
npm run db:migrate
```

This will:
- Apply all pending migrations to the database
- Create all tables, indexes, and relationships
- Update the migration history

The initial migration creates:
- **7 Enums**: AppointmentStatus, ClassType, EventScope, NewsScope, RSVPStatus, ThreadType, UserRole
- **17 Tables**: users, schools, classes, appointments, children, events, groups, messages, news_posts, and more
- **All indexes and constraints**
- **Foreign key relationships**

---

## Database Seeding

Currently, there is no automated seed script. You can seed the database in two ways:

### Option 1: Using API Endpoints (Recommended for Testing)

Start the server first:
```bash
npm run dev
```

Then use the API documentation at `http://localhost:3000/api-docs` or use curl/Postman to create data.

#### Example: Create Users via API (Future Implementation)
```bash
# This endpoint would need to be implemented
# curl -X POST http://localhost:3000/api/users \
#   -H "Content-Type: application/json" \
#   -d '{
#     "email": "john.doe@example.com",
#     "firstName": "John",
#     "lastName": "Doe",
#     "phone": "+1234567890"
#   }'
```

### Option 2: Using Prisma Studio (Manual Entry)

Launch Prisma Studio:
```bash
npm run db:studio
```

This opens a browser interface at `http://localhost:5555` where you can:
- Manually add records to any table
- View and edit existing data
- Explore relationships between tables

### Option 3: Create a Seed Script (Recommended for Development)

Create `prisma/seed.ts` with sample data:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Schools
  const school1 = await prisma.schools.create({
    data: {
      id: 'school-1',
      name: 'Springfield Elementary',
      address: '123 Main St, Springfield',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created school:', school1.name);

  // Create Users
  const teacher1 = await prisma.users.create({
    data: {
      id: 'user-teacher-1',
      email: 'teacher1@springfield.edu',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const parent1 = await prisma.users.create({
    data: {
      id: 'user-parent-1',
      email: 'parent1@example.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      phone: '+0987654321',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created users:', teacher1.email, parent1.email);

  // Create Classes
  const class1 = await prisma.classes.create({
    data: {
      id: 'class-1',
      schoolId: school1.id,
      name: 'Math 101',
      type: 'Class',
      description: 'Introduction to Mathematics',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created class:', class1.name);

  // Create Class Memberships
  await prisma.class_memberships.create({
    data: {
      id: 'membership-1',
      classId: class1.id,
      userId: teacher1.id,
      role: 'teacher',
      canPostNews: true,
      canCreateGroups: true,
      canDeleteMessages: true,
      createdAt: new Date(),
    },
  });

  await prisma.class_memberships.create({
    data: {
      id: 'membership-2',
      classId: class1.id,
      userId: parent1.id,
      role: 'parent',
      canPostNews: false,
      canCreateGroups: false,
      canDeleteMessages: false,
      createdAt: new Date(),
    },
  });

  console.log('✅ Created class memberships');

  // Create Children
  const child1 = await prisma.children.create({
    data: {
      id: 'child-1',
      firstName: 'Tommy',
      lastName: 'Johnson',
      dateOfBirth: new Date('2015-05-15'),
      schoolId: school1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created child:', child1.firstName);

  // Create Child Class Assignment
  await prisma.child_class_assignments.create({
    data: {
      id: 'assignment-1',
      childId: child1.id,
      classId: class1.id,
      parentId: parent1.id,
      createdAt: new Date(),
    },
  });

  console.log('✅ Created child class assignment');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed script:
```bash
npm run db:seed
```

---

## Running the Project

### Start the Backend Server

#### Development Mode (with hot-reload)
```bash
cd edu-bridge-be
npm run dev
```

The server will start on `http://localhost:3000` with hot-reload enabled.

#### Production Build
```bash
npm run build    # Compile TypeScript to JavaScript
npm start        # Run the compiled code
```

### Background Services

#### Start Prisma Studio (Database GUI)
```bash
npm run db:studio
```

Access at: `http://localhost:5555`

---

## Verification

### 1. Health Check
Open your browser or use curl:
```bash
curl http://localhost:3000/
```

Expected response:
```json
{
  "message": "Welcome to Edu Bridge API",
  "documentation": "Visit /api-docs for Swagger documentation",
  "endpoints": {
    "hello": "GET /api/hello",
    "users": "GET /api/users",
    "userById": "GET /api/users/:id"
  }
}
```

### 2. API Documentation
Visit: `http://localhost:3000/api-docs`

You should see the Swagger UI with all available endpoints.

### 3. Test Database Connection
```bash
curl http://localhost:3000/api/users
```

Expected response:
```json
{
  "users": [],
  "count": 0,
  "timestamp": "2024-10-17T12:00:00.000Z"
}
```

### 4. Database Verification
```bash
# Check if migrations are up to date
npm run db:migrate -- --dry-run

# Or check migration status
npx prisma migrate status
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Failed
**Error**: `Can't reach database server at localhost:5435`

**Solutions**:
- Verify PostgreSQL container is running: `docker ps | grep edubridge-postgres-dev`
- Restart the container: `docker-compose -f infra/docker-compose.dev.yml restart`
- Check if port 5435 is available: `lsof -i :5435`
- Verify DATABASE_URL in `.env` matches docker-compose settings

#### 2. Port Already in Use
**Error**: `Port 3000 is already in use`

**Solutions**:
- Find and kill the process: `lsof -ti:3000 | xargs kill`
- Or change the port in `edu-bridge-be/.env`: `PORT=3001`

#### 3. Prisma Client Not Generated
**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npm run db:generate
```

#### 4. Migration Failed
**Error**: Migration errors or schema drift detected

**Solutions**:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create a new migration
npm run db:migrate
```

#### 5. TypeScript Compilation Errors
**Solution**:
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma Client
npm run db:generate
```

#### 6. Docker Container Won't Start
**Solutions**:
```bash
# Check container logs
docker logs edubridge-postgres-dev

# Remove old container and volume
docker-compose -f infra/docker-compose.dev.yml down -v

# Start fresh
docker-compose -f infra/docker-compose.dev.yml up -d
```

---

## Development Tools

### Available npm Scripts

```bash
# Backend (edu-bridge-be/)
npm run dev          # Start dev server with hot-reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production build
npm test             # Run tests (not configured yet)

# Prisma/Database
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Run seed script (if created)
npm run db:push      # Push schema changes without migration
```

### Docker Commands

```bash
# From infra/ directory
docker-compose -f docker-compose.dev.yml up -d      # Start all services
docker-compose -f docker-compose.dev.yml down       # Stop all services
docker-compose -f docker-compose.dev.yml logs -f    # View logs
docker-compose -f docker-compose.dev.yml restart    # Restart services

# Database specific
docker exec -it edubridge-postgres-dev psql -U edubridge -d edubridge  # Connect to DB
docker exec -it edubridge-postgres-dev pg_dump -U edubridge edubridge  # Backup DB
```

### Prisma Commands

```bash
# Schema Management
npx prisma format              # Format schema file
npx prisma validate            # Validate schema

# Migration Management
npx prisma migrate status      # Check migration status
npx prisma migrate dev         # Create and apply migration
npx prisma migrate reset       # Reset database (deletes data!)
npx prisma migrate deploy      # Apply migrations in production

# Database Tools
npx prisma studio              # Open Prisma Studio
npx prisma db pull             # Pull schema from database
npx prisma db push             # Push schema to database (no migration)
```

### API Testing Tools

- **Swagger UI**: `http://localhost:3000/api-docs`
- **Prisma Studio**: `http://localhost:5555`
- **curl**: Command-line HTTP client
- **Postman**: GUI for API testing
- **Thunder Client**: VSCode extension

---

## Quick Start Checklist

Use this checklist to quickly set up the project:

- [ ] Install Node.js (v18+), Docker, and Git
- [ ] Clone the repository
- [ ] Copy `.env.example` to `.env` (root and backend)
- [ ] Start PostgreSQL: `cd infra && docker-compose -f docker-compose.dev.yml up -d`
- [ ] Install backend dependencies: `cd edu-bridge-be && npm install`
- [ ] Generate Prisma Client: `npm run db:generate`
- [ ] Run migrations: `npm run db:migrate`
- [ ] (Optional) Seed database: `npm run db:seed` or use Prisma Studio
- [ ] Start backend server: `npm run dev`
- [ ] Verify at `http://localhost:3000` and `http://localhost:3000/api-docs`
- [ ] (Optional) Open Prisma Studio: `npm run db:studio`

---

## Backend Architecture

The backend follows a layered architecture pattern:

```
Controller → Service → Repository → Database
```

- **Controller**: Handles HTTP requests/responses, validates input
- **Service**: Contains business logic and orchestrates operations
- **Repository**: Direct database operations using Prisma Client

For detailed backend architecture, see: `claude/backend.md`

---

## Additional Resources

- **Prisma Documentation**: https://www.prisma.io/docs
- **Express.js Guide**: https://expressjs.com/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Docker Documentation**: https://docs.docker.com/
- **Swagger/OpenAPI**: https://swagger.io/docs/

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Docker and application logs
3. Verify all prerequisites are correctly installed
4. Ensure all environment variables are properly configured
5. Check that no other services are using required ports (3000, 5435, 5555)

---

**Last Updated**: 2024-10-17
**Version**: 1.0.0
