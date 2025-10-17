# Keycloak Setup Script for Edu Bridge - MyRealm Configuration (PowerShell)
# This script sets up the Keycloak realm and configuration using myrealm.json

Write-Host "Setting up Keycloak MyRealm for Edu Bridge..." -ForegroundColor Green

# Wait for Keycloak to be ready
Write-Host "Waiting for Keycloak to start..." -ForegroundColor Yellow
do {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/realms/master" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            break
        }
    }
    catch {
        Write-Host "Waiting for Keycloak..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
} while ($true)

Write-Host "Keycloak is ready!" -ForegroundColor Green

# Get admin access token
Write-Host "Getting admin access token..." -ForegroundColor Yellow
try {
    $tokenResponse = Invoke-RestMethod -Uri "http://localhost:8080/realms/master/protocol/openid-connect/token" -Method POST -Headers @{
        "Content-Type" = "application/x-www-form-urlencoded"
    } -Body "username=admin&password=admin123&grant_type=password&client_id=admin-cli"
    
    $adminToken = $tokenResponse.access_token
    
    if (-not $adminToken) {
        Write-Host "Failed to get admin token" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Admin token obtained!" -ForegroundColor Green
}
catch {
    Write-Host "Failed to get admin token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Import myrealm configuration
Write-Host "Importing MyRealm configuration..." -ForegroundColor Yellow
try {
    $realmConfig = Get-Content -Path "keycloak-config\myrealm.json" -Raw
    
    $importResponse = Invoke-RestMethod -Uri "http://localhost:8080/admin/realms" -Method POST -Headers @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    } -Body $realmConfig
    
    Write-Host "MyRealm imported successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Failed to import MyRealm: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Keycloak MyRealm setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration Summary:" -ForegroundColor Cyan
Write-Host "   Keycloak URL: http://localhost:8080" -ForegroundColor White
Write-Host "   Admin Console: http://localhost:8080/admin" -ForegroundColor White
Write-Host "   Admin Username: admin" -ForegroundColor White
Write-Host "   Admin Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Realm Configuration:" -ForegroundColor Cyan
Write-Host "   Realm Name: myrealm" -ForegroundColor White
Write-Host "   Display Name: Edu Bridge Realm" -ForegroundColor White
Write-Host ""
Write-Host "Test Users:" -ForegroundColor Cyan
Write-Host "   Student 1: student1 / student123" -ForegroundColor White
Write-Host "   Student 2: student2 / student123" -ForegroundColor White
Write-Host "   Teacher 1: teacher1 / teacher123" -ForegroundColor White
Write-Host "   Teacher 2: teacher2 / teacher123" -ForegroundColor White
Write-Host "   Admin: admin / admin123" -ForegroundColor White
Write-Host ""
Write-Host "Client Configuration:" -ForegroundColor Cyan
Write-Host "   Backend Client ID: edu-bridge-backend" -ForegroundColor White
Write-Host "   Frontend Client ID: edu-bridge-frontend" -ForegroundColor White
Write-Host "   Realm: myrealm" -ForegroundColor White
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "   Keycloak Admin: http://localhost:8080/admin" -ForegroundColor White
Write-Host "   Realm Admin: http://localhost:8080/admin/master/console/#/myrealm" -ForegroundColor White
Write-Host "   Realm Login: http://localhost:8080/realms/myrealm/account" -ForegroundColor White
Write-Host ""
Write-Host "Authentication Flow:" -ForegroundColor Cyan
Write-Host "   1. Frontend app will redirect to Keycloak login" -ForegroundColor White
Write-Host "   2. User enters credentials" -ForegroundColor White
Write-Host "   3. Keycloak returns JWT token" -ForegroundColor White
Write-Host "   4. Frontend stores token and makes authenticated API calls" -ForegroundColor White
Write-Host "   5. Backend validates JWT token with Keycloak" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"