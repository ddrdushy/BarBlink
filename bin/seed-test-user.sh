#!/bin/bash
# Creates a test user for quick mobile app testing.
#
# Test credentials:
#   Phone: +60 000000000
#   OTP:   123456 (always works in dev)
#
# Usage: ./bin/seed-test-user.sh
# Requires: auth-service (port 3001) and user-service (port 3002) running

set -e

AUTH=http://localhost:3001/v1
USER=http://localhost:3002/v1
PHONE="+60000000000"
EMAIL="test@barblink.dev"
DOB="2000-01-01"

echo "=== Seeding test user ==="
echo "Phone: $PHONE"
echo "OTP:   123456"
echo ""

# Register (ignore 409 if already exists)
echo "1. Registering..."
REG=$(curl -sf "$AUTH/auth/register" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"email\":\"$EMAIL\",\"dateOfBirth\":\"$DOB\"}" 2>&1) || true
echo "   $REG"

# Verify with dev bypass OTP
echo "2. Verifying OTP (123456)..."
VERIFY=$(curl -sf "$AUTH/auth/verify-otp" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"code\":\"123456\"}")
TOKEN=$(echo "$VERIFY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
echo "   Got token: ${TOKEN:0:20}..."

# Create profile (ignore 409 if already exists)
echo "3. Creating profile..."
PROFILE=$(curl -sf "$USER/users/me" -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"testuser","displayName":"Test User","country":"MY"}' 2>&1) || true
echo "   $PROFILE"

echo ""
echo "=== Done! ==="
echo ""
echo "To log in on mobile:"
echo "  1. Tap 'I already have an account'"
echo "  2. Enter phone: 000000000 (country: Malaysia +60)"
echo "  3. Enter OTP: 123456"
echo "  4. You're in!"
