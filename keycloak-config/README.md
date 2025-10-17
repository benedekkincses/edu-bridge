# Keycloak Setup for Edu Bridge

This directory contains the configuration and setup scripts for Keycloak authentication in the Edu Bridge application.

## 📁 Files Overview

- `myrealm.json` - Complete Keycloak realm configuration
- `setup-myrealm.bat` - Windows batch script for setup
- `setup-myrealm.ps1` - PowerShell script for setup (recommended for Windows)
- `setup-myrealm.sh` - Linux/Mac shell script for setup
- `README.md` - This documentation

## 🚀 Quick Setup

### Prerequisites

1. **Docker and Docker Compose** must be installed and running
2. **Keycloak containers** must be running (use `docker compose up -d`)

### Windows Setup

#### Option 1: PowerShell (Recommended)

```powershell
.\keycloak-config\setup-myrealm.ps1
```

#### Option 2: Batch Script

```cmd
.\keycloak-config\setup-myrealm.bat
```

### Linux/Mac Setup

```bash
./keycloak-config/setup-myrealm.sh
```

## 📋 What the Setup Scripts Do

1. **Wait for Keycloak** to be fully started and ready
2. **Get admin access token** from the master realm
3. **Import the MyRealm configuration** with all users, clients, and roles
4. **Display configuration summary** and access information

## 🏰 Realm Configuration

### Realm Details

- **Name**: `myrealm`
- **Display Name**: `Edu Bridge Realm`
- **Access Token Lifespan**: 5 minutes
- **SSO Session Timeout**: 30 minutes

### 👥 Test Users

| Username   | Password     | Role    | Email                     |
| ---------- | ------------ | ------- | ------------------------- |
| `admin`    | `admin123`   | admin   | admin@edubridge.com       |
| `student1` | `student123` | student | john.doe@student.com      |
| `student2` | `student123` | student | alice.johnson@student.com |
| `teacher1` | `teacher123` | teacher | jane.smith@teacher.com    |
| `teacher2` | `teacher123` | teacher | bob.wilson@teacher.com    |

### 🔧 Client Configuration

#### Backend Client (`edu-bridge-backend`)

- **Type**: Confidential
- **Secret**: `edu-bridge-backend-secret-key-2024`
- **Grant Types**: Authorization Code, Direct Access Grants
- **Redirect URIs**:
  - `http://localhost:3000/*`
  - `http://10.1.2.98:3000/*`

#### Frontend Client (`edu-bridge-frontend`)

- **Type**: Public
- **Grant Types**: Authorization Code, Implicit, Direct Access Grants
- **Redirect URIs**:
  - `http://localhost:8081/*`
  - `http://10.1.2.98:8081/*`
  - `exp://localhost:8081/*`
  - `exp://10.1.2.98:8081/*`

### 🎭 Roles

- **admin**: Full access to all features
- **teacher**: Access to teaching features and student management
- **student**: Access to learning materials and assignments

## 🌐 Access URLs

- **Keycloak Admin Console**: http://localhost:8080/admin
- **Realm Admin**: http://localhost:8080/admin/master/console/#/myrealm
- **User Account Management**: http://localhost:8080/realms/myrealm/account
- **OpenID Connect Discovery**: http://localhost:8080/realms/myrealm/.well-known/openid_configuration

## 🔐 Authentication Flow

1. **Frontend** redirects user to Keycloak login page
2. **User** enters credentials (username/password)
3. **Keycloak** validates credentials and returns JWT token
4. **Frontend** stores token and includes it in API requests
5. **Backend** validates JWT token with Keycloak's public keys

## 🛠️ Manual Setup (Alternative)

If the automated scripts fail, you can manually set up the realm:

1. **Access Keycloak Admin Console**: http://localhost:8080/admin
2. **Login** with admin/admin123
3. **Create Realm**: Click "Create Realm" → Enter "myrealm"
4. **Import Configuration**: Use the "Partial Import" feature to import `myrealm.json`

## 🔍 Troubleshooting

### Common Issues

1. **"Keycloak not ready"**

   - Wait a few more minutes for Keycloak to fully initialize
   - Check Docker logs: `docker compose logs keycloak`

2. **"Failed to get admin token"**

   - Verify admin credentials: admin/admin123
   - Check if Keycloak is accessible: http://localhost:8080/realms/master

3. **"Failed to import MyRealm"**

   - Check if realm already exists (delete it first if needed)
   - Verify JSON syntax in `myrealm.json`

4. **"Permission denied" (Linux/Mac)**
   - Make script executable: `chmod +x setup-myrealm.sh`

### Verification Steps

After setup, verify the configuration:

1. **Check Realm**: http://localhost:8080/admin/master/console/#/myrealm
2. **Test Login**: http://localhost:8080/realms/myrealm/account
3. **Check Clients**: Verify both clients exist with correct settings
4. **Test Users**: Try logging in with test credentials

## 📚 Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OpenID Connect Specification](https://openid.net/connect/)
- [JWT Token Validation](https://jwt.io/)

## 🔄 Reset Configuration

To reset the Keycloak configuration:

1. **Stop containers**: `docker compose down`
2. **Remove volumes**: `docker volume rm edu-bridge_postgres_data`
3. **Restart**: `docker compose up -d`
4. **Re-run setup**: Use the appropriate setup script
