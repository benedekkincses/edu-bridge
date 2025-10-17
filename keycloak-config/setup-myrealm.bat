@echo off
REM Keycloak Setup Script for Edu Bridge - MyRealm Configuration (Windows)
REM This script sets up the Keycloak realm and configuration using myrealm.json

echo 🚀 Setting up Keycloak MyRealm for Edu Bridge...

REM Wait for Keycloak to be ready
echo ⏳ Waiting for Keycloak to start...
:wait_loop
curl -f http://localhost:8080/realms/master >nul 2>&1
if %errorlevel% neq 0 (
    echo Waiting for Keycloak...
    timeout /t 5 /nobreak >nul
    goto wait_loop
)

echo ✅ Keycloak is ready!

REM Get admin access token using PowerShell (no jq dependency)
echo 🔑 Getting admin access token...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:8080/realms/master/protocol/openid-connect/token' -Method POST -Headers @{'Content-Type'='application/x-www-form-urlencoded'} -Body 'username=admin&password=admin123&grant_type=password&client_id=admin-cli'; $response.access_token } catch { Write-Host 'Failed to get admin token'; exit 1 }" > temp_token.txt

set /p ADMIN_TOKEN=<temp_token.txt
del temp_token.txt

if "%ADMIN_TOKEN%"=="" (
    echo ❌ Failed to get admin token
    exit /b 1
)

echo ✅ Admin token obtained!

REM Import myrealm configuration
echo 📥 Importing MyRealm configuration...
curl -s -X POST http://localhost:8080/admin/realms -H "Authorization: Bearer %ADMIN_TOKEN%" -H "Content-Type: application/json" -d @keycloak-config\myrealm.json

if %errorlevel% equ 0 (
    echo ✅ MyRealm imported successfully!
) else (
    echo ❌ Failed to import MyRealm
    exit /b 1
)

echo.
echo 🎉 Keycloak MyRealm setup completed!
echo.
echo 📋 Configuration Summary:
echo    • Keycloak URL: http://localhost:8080
echo    • Admin Console: http://localhost:8080/admin
echo    • Admin Username: admin
echo    • Admin Password: admin123
echo.
echo 🏰 Realm Configuration:
echo    • Realm Name: myrealm
echo    • Display Name: Edu Bridge Realm
echo.
echo 👥 Test Users:
echo    • Student 1: student1 / student123
echo    • Student 2: student2 / student123
echo    • Teacher 1: teacher1 / teacher123
echo    • Teacher 2: teacher2 / teacher123
echo    • Admin: admin / admin123
echo.
echo 🔧 Client Configuration:
echo    • Backend Client ID: edu-bridge-backend
echo    • Frontend Client ID: edu-bridge-frontend
echo    • Realm: myrealm
echo.
echo 🌐 Access URLs:
echo    • Keycloak Admin: http://localhost:8080/admin
echo    • Realm Admin: http://localhost:8080/admin/master/console/#/myrealm
echo    • Realm Login: http://localhost:8080/realms/myrealm/account
echo.
echo 🔐 Authentication Flow:
echo    1. Frontend app will redirect to Keycloak login
echo    2. User enters credentials
echo    3. Keycloak returns JWT token
echo    4. Frontend stores token and makes authenticated API calls
echo    5. Backend validates JWT token with Keycloak
echo.
pause
