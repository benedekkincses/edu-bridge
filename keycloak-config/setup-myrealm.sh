#!/bin/bash
# Keycloak Setup Script for Edu Bridge - MyRealm Configuration (Linux/Mac)
# This script sets up the Keycloak realm and configuration using myrealm.json

echo "🚀 Setting up Keycloak MyRealm for Edu Bridge..."

# Wait for Keycloak to be ready
echo "⏳ Waiting for Keycloak to start..."
while ! curl -f http://localhost:8080/realms/master >/dev/null 2>&1; do
    echo "Waiting for Keycloak..."
    sleep 5
done

echo "✅ Keycloak is ready!"

# Get admin access token
echo "🔑 Getting admin access token..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin" \
    -d "password=admin123" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" | \
    jq -r '.access_token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Failed to get admin token"
    exit 1
fi

echo "✅ Admin token obtained!"

# Import myrealm configuration
echo "📥 Importing MyRealm configuration..."
IMPORT_RESPONSE=$(curl -s -X POST http://localhost:8080/admin/realms \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d @keycloak-config/myrealm.json)

if [ $? -eq 0 ]; then
    echo "✅ MyRealm imported successfully!"
else
    echo "❌ Failed to import MyRealm"
    exit 1
fi

echo ""
echo "🎉 Keycloak MyRealm setup completed!"
echo ""
echo "📋 Configuration Summary:"
echo "   • Keycloak URL: http://localhost:8080"
echo "   • Admin Console: http://localhost:8080/admin"
echo "   • Admin Username: admin"
echo "   • Admin Password: admin123"
echo ""
echo "🏰 Realm Configuration:"
echo "   • Realm Name: myrealm"
echo "   • Display Name: Edu Bridge Realm"
echo ""
echo "👥 Test Users:"
echo "   • Student 1: student1 / student123"
echo "   • Student 2: student2 / student123"
echo "   • Teacher 1: teacher1 / teacher123"
echo "   • Teacher 2: teacher2 / teacher123"
echo "   • Admin: admin / admin123"
echo ""
echo "🔧 Client Configuration:"
echo "   • Backend Client ID: edu-bridge-backend"
echo "   • Frontend Client ID: edu-bridge-frontend"
echo "   • Realm: myrealm"
echo ""
echo "🌐 Access URLs:"
echo "   • Keycloak Admin: http://localhost:8080/admin"
echo "   • Realm Admin: http://localhost:8080/admin/master/console/#/myrealm"
echo "   • Realm Login: http://localhost:8080/realms/myrealm/account"
echo ""
echo "🔐 Authentication Flow:"
echo "   1. Frontend app will redirect to Keycloak login"
echo "   2. User enters credentials"
echo "   3. Keycloak returns JWT token"
echo "   4. Frontend stores token and makes authenticated API calls"
echo "   5. Backend validates JWT token with Keycloak"
echo ""

read -p "Press Enter to continue..."