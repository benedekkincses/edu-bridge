# Edu Bridge - Local Development Setup Guide

This guide provides comprehensive instructions to set up and run the Edu Bridge project locally.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Initial Setup](#initial-setup)
- [Database Setup](#database-setup)
- [Keycloak Authentication Setup](#keycloak-authentication-setup)
- [Backend Setup](#backend-setup)
- [Database Seeding](#database-seeding)
- [Mobile App Setup (iOS)](#mobile-app-setup-ios)
- [Running the Project](#running-the-project)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Development Tools](#development-tools)

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software (Backend)
- **Node.js**: v18.0.0 or higher (tested with v24.7.0)
- **npm**: v8.0.0 or higher (tested with v11.5.1)
- **Docker**: Latest stable version
- **Docker Compose**: Latest stable version
- **Git**: Latest stable version

### Required Software (Mobile iOS Development)
- **Xcode**: Latest stable version (download from Mac App Store)
- **Xcode Command Line Tools**: Install via `xcode-select --install`
- **Watchman**: Install via `brew install watchman` (optional, improves performance)
- **Expo CLI**: Install via `npm install -g expo-cli` (or use `npx expo` locally)

### Verify Installations
```bash
# Backend tools
node --version    # Should return v18.0.0 or higher
npm --version     # Should return v8.0.0 or higher
docker --version  # Should return Docker version info
git --version     # Should return Git version info

# Mobile development tools (for iOS)
xcode-select -p      # Should return Xcode path (e.g., /Applications/Xcode.app/Contents/Developer)
watchman --version   # Should return Watchman version (if installed)
expo --version       # Should return Expo CLI version (if installed globally)
npx expo --version   # Alternative: check local Expo version
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

## Keycloak Authentication Setup

Edu Bridge uses **Keycloak** for authentication and authorization. This section covers setting up Keycloak with the pre-configured realm and test users.

### What is Keycloak?

Keycloak is an open-source identity and access management solution that provides:
- Single Sign-On (SSO)
- User authentication and authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- OpenID Connect and OAuth 2.0 support

### Prerequisites

Keycloak requires:
- Docker and Docker Compose (already installed from Database Setup)
- Port 8080 available (default Keycloak port)

### 1. Start Keycloak Container

From the root directory:
```bash
docker compose up -d
```

This will:
- Start both PostgreSQL and Keycloak containers
- Expose Keycloak on port `8080`
- Create a Keycloak admin user (username: `admin`, password: `admin123`)

### 2. Verify Keycloak is Running

Wait for Keycloak to fully start (usually takes 30-60 seconds):
```bash
docker ps | grep keycloak
```

You should see the container running and healthy.

### 3. Import Realm Configuration

Run the automated setup script to import the pre-configured realm with users, clients, and roles:

**For Mac/Linux:**
```bash
./keycloak-config/setup-myrealm.sh
```

**For Windows (PowerShell):**
```powershell
.\keycloak-config\setup-myrealm.ps1
```

**For Windows (Batch):**
```cmd
.\keycloak-config\setup-myrealm.bat
```

The script will:
1. Wait for Keycloak to be fully started and ready
2. Obtain an admin access token
3. Import the MyRealm configuration with all users, clients, and roles
4. Display a configuration summary

### 4. Verify Keycloak Setup

After the setup script completes, verify the configuration:

**Check OpenID Connect discovery endpoint:**
```bash
curl http://localhost:8080/realms/myrealm/.well-known/openid-configuration
```

**Access Keycloak Admin Console:**
Open your browser and visit: http://localhost:8080/admin

Login with:
- Username: `admin`
- Password: `admin123`

### Realm Configuration Details

#### Realm Information
- **Name**: `myrealm`
- **Display Name**: `Edu Bridge Realm`
- **Access Token Lifespan**: 5 minutes
- **SSO Session Timeout**: 30 minutes

#### Test Users

The realm includes 5 pre-configured test users:

| Username   | Password     | Role    | Email                     |
| ---------- | ------------ | ------- | ------------------------- |
| `admin`    | `admin123`   | admin   | admin@edubridge.com       |
| `student1` | `student123` | student | john.doe@student.com      |
| `student2` | `student123` | student | alice.johnson@student.com |
| `teacher1` | `teacher123` | teacher | jane.smith@teacher.com    |
| `teacher2` | `teacher123` | teacher | bob.wilson@teacher.com    |

#### Client Configuration

Two OAuth 2.0 clients are pre-configured:

**Backend Client (`edu-bridge-backend`)**
- **Type**: Confidential
- **Client Secret**: `edu-bridge-backend-secret-key-2024`
- **Grant Types**: Authorization Code, Direct Access Grants
- **Redirect URIs**: `http://localhost:3000/*`, `http://10.1.2.98:3000/*`

**Frontend Client (`edu-bridge-frontend`)**
- **Type**: Public
- **Grant Types**: Authorization Code, Implicit, Direct Access Grants
- **Redirect URIs**:
  - `http://localhost:8081/*`
  - `http://10.1.2.98:8081/*`
  - `exp://localhost:8081/*`
  - `exp://10.1.2.98:8081/*`

#### Roles

Three roles are configured for the application:
- **admin**: Full access to all features
- **teacher**: Access to teaching features and student management
- **student**: Access to learning materials and assignments

### Access URLs

- **Keycloak Admin Console**: http://localhost:8080/admin
- **Realm Admin**: http://localhost:8080/admin/master/console/#/myrealm
- **User Account Management**: http://localhost:8080/realms/myrealm/account
- **OpenID Connect Discovery**: http://localhost:8080/realms/myrealm/.well-known/openid-configuration

### Authentication Flow

The authentication flow in Edu Bridge works as follows:

1. **Frontend** redirects user to Keycloak login page
2. **User** enters credentials (username/password)
3. **Keycloak** validates credentials and returns JWT token
4. **Frontend** stores token and includes it in API requests
5. **Backend** validates JWT token with Keycloak's public keys

### Troubleshooting Keycloak

#### Issue: "Keycloak not ready"
**Solutions**:
- Wait a few more minutes for Keycloak to fully initialize
- Check Docker logs: `docker compose logs keycloak`
- Ensure port 8080 is not in use: `lsof -i :8080`

#### Issue: "Failed to get admin token"
**Solutions**:
- Verify admin credentials: `admin` / `admin123`
- Check if Keycloak is accessible: http://localhost:8080/realms/master

#### Issue: "Failed to import MyRealm"
**Solutions**:
- Check if realm already exists (delete it first if needed)
- Verify JSON syntax in `keycloak-config/myrealm.json`
- Re-run the setup script after fixing any issues

#### Issue: "Permission denied" (Mac/Linux)
**Solution**:
```bash
chmod +x keycloak-config/setup-myrealm.sh
```

### Reset Keycloak Configuration

To completely reset the Keycloak configuration:

1. **Stop containers**: `docker compose down`
2. **Remove volumes**: `docker volume rm edu-bridge_postgres_data`
3. **Restart**: `docker compose up -d`
4. **Re-run setup**: `./keycloak-config/setup-myrealm.sh`

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

## Mobile App Setup (iOS)

The Edu Bridge mobile app is built with **Expo** (React Native framework) and can run on iOS, Android, and web platforms. This section covers iOS simulator setup for Mac.

### Prerequisites for iOS Development

Before running the mobile app on iOS, ensure you have:

1. **Xcode** installed (from Mac App Store)
2. **Xcode Command Line Tools** installed
3. **Watchman** installed (optional but recommended)
4. **Expo CLI** installed globally

Install prerequisites:
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Watchman (optional but recommended)
brew install watchman

# Install Expo CLI globally
npm install -g expo-cli
```

Verify installations:
```bash
xcode-select -p              # Should show Xcode path
xcrun simctl list devices    # Should list available simulators
watchman --version           # Should show version (if installed)
expo --version               # Should show Expo CLI version
```

### Initial Mobile App Setup

#### 1. Navigate to Mobile App Directory
```bash
cd edu-bridge-fe
```

#### 2. Install Dependencies
```bash
npm install
```

This will install:
- Expo SDK (~51.0.0)
- React Native (0.74.5)
- React Navigation
- Axios for API calls
- React Native Async Storage
- React Native Keychain (for secure storage)
- Other required dependencies

#### 3. Configure Backend URL (Optional)

If your backend is running on a different host/port, create or edit `edu-bridge-fe/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For running on physical device, use your computer's local IP:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.X:3000
```

### Running on iOS Simulator

#### Method 1: Quick Start (Recommended)

```bash
cd edu-bridge-fe
npm run ios
```

This will:
1. Start the Expo development server
2. Automatically open the iOS simulator
3. Build and install the app
4. Launch the app with live reload enabled

#### Method 2: Interactive Menu

```bash
cd edu-bridge-fe
npm start
```

Then press:
- `i` - Open iOS simulator
- `w` - Open in web browser
- `r` - Reload app
- `m` - Toggle developer menu

#### Method 3: Specific Device

To run on a specific iPhone model:

```bash
# List available simulators
xcrun simctl list devices available

# Run on specific device
npm run ios -- --simulator="iPhone 15 Pro"
npm run ios -- --simulator="iPhone SE (3rd generation)"
```

### Development Features

Once the app is running on the simulator:

- **Hot Reload**: Automatically reloads on code changes
- **Fast Refresh**: Preserves component state during most updates
- **Developer Menu**: Press `Cmd + D` or shake the device (Device > Shake)
- **Debug Console**: View logs in the terminal where you ran `npm start`
- **Element Inspector**: Press `Cmd + D` > "Show Element Inspector"

### Mobile App Structure

```
edu-bridge-fe/
├── App.tsx                    # Main app entry point
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── src/                       # Source code
│   ├── screens/              # Screen components
│   ├── components/           # Reusable components
│   ├── navigation/           # Navigation setup
│   ├── services/             # API services
│   └── utils/                # Utility functions
└── .expo/                    # Expo cache (generated)
```

### Troubleshooting Mobile App

#### Issue: Simulator Doesn't Open
**Solution**:
1. Open Xcode
2. Go to Xcode > Open Developer Tool > Simulator
3. Select a device from Hardware > Device
4. Run `npm run ios` again

#### Issue: "No devices found"
**Solution**:
```bash
sudo xcode-select --reset
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

#### Issue: Build Failed
**Solution**:
```bash
# Clean cache and reinstall
cd edu-bridge-fe
rm -rf node_modules
rm -rf .expo
rm -rf package-lock.json
npm install
```

#### Issue: "Watchman crawl failed"
**Solution**:
```bash
# If Watchman is installed
watchman watch-del-all

# Or install Watchman
brew install watchman
```

#### Issue: App Not Connecting to Backend
**Solutions**:
- Ensure backend is running: `curl http://localhost:3000`
- Check `EXPO_PUBLIC_API_URL` in `.env` file
- For iOS simulator, use `localhost` or `127.0.0.1`
- Check that no firewall is blocking connections

#### Issue: Metro Bundler Port in Use (8081)
**Solution**:
```bash
# Find and kill process on port 8081
lsof -ti:8081 | xargs kill

# Or start on different port
npm start -- --port 8082
```

### Mobile App npm Scripts

```bash
# From edu-bridge-fe/ directory
npm start        # Start Expo dev server with interactive menu
npm run ios      # Run on iOS simulator
npm run android  # Run on Android emulator
npm run web      # Run in web browser
```

---

## Running the Project

### Complete Stack Startup

To run the complete Edu Bridge application (Backend + Mobile):

#### 1. Start Database (First Time or After System Restart)
```bash
cd edu-bridge
cd infra
docker-compose -f docker-compose.dev.yml up -d
```

#### 2. Start Backend Server
```bash
cd edu-bridge-be
npm run dev
```

The backend API will be available at `http://localhost:3000`

#### 3. Start Mobile App (iOS Simulator)
Open a new terminal window:
```bash
cd edu-bridge-fe
npm run ios
```

The iOS simulator will open automatically with the app running.

### Individual Services

#### Backend Server

**Development Mode (with hot-reload)**
```bash
cd edu-bridge-be
npm run dev
```

The server will start on `http://localhost:3000` with hot-reload enabled.

**Production Build**
```bash
npm run build    # Compile TypeScript to JavaScript
npm start        # Run the compiled code
```

#### Mobile App

**iOS Simulator**
```bash
cd edu-bridge-fe
npm run ios
```

**Android Emulator**
```bash
cd edu-bridge-fe
npm run android
```

**Web Browser**
```bash
cd edu-bridge-fe
npm run web
```

### Background Services

#### Start Prisma Studio (Database GUI)
```bash
cd edu-bridge-be
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

### Backend Setup
Use this checklist to quickly set up the backend:

- [ ] Install Node.js (v18+), Docker, and Git
- [ ] Clone the repository
- [ ] Copy `.env.example` to `.env` (root and backend)
- [ ] Start PostgreSQL: `cd infra && docker-compose -f docker-compose.dev.yml up -d`
- [ ] Start Keycloak: `docker compose up -d`
- [ ] Import Keycloak realm: `./keycloak-config/setup-myrealm.sh` (Mac/Linux) or `.\keycloak-config\setup-myrealm.ps1` (Windows)
- [ ] Verify Keycloak at `http://localhost:8080/admin` (admin/admin123)
- [ ] Install backend dependencies: `cd edu-bridge-be && npm install`
- [ ] Generate Prisma Client: `npm run db:generate`
- [ ] Run migrations: `npm run db:migrate`
- [ ] (Optional) Seed database: `npm run db:seed` or use Prisma Studio
- [ ] Start backend server: `npm run dev`
- [ ] Verify at `http://localhost:3000` and `http://localhost:3000/api-docs`
- [ ] (Optional) Open Prisma Studio: `npm run db:studio`

### Mobile App Setup (iOS)
Use this checklist to quickly set up the mobile app for iOS:

- [ ] Install Xcode from Mac App Store
- [ ] Install Xcode Command Line Tools: `xcode-select --install`
- [ ] (Optional) Install Watchman: `brew install watchman`
- [ ] Install Expo CLI: `npm install -g expo-cli`
- [ ] Open Xcode and accept license agreement
- [ ] Verify Xcode setup: `xcode-select -p`
- [ ] Navigate to mobile app: `cd edu-bridge-fe`
- [ ] Install dependencies: `npm install`
- [ ] (Optional) Configure backend URL in `.env`
- [ ] Start app on iOS simulator: `npm run ios`
- [ ] Verify app opens in simulator and connects to backend

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
