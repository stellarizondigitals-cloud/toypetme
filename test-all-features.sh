#!/bin/bash

API="http://localhost:5000/api"
COOKIE_JAR=$(mktemp)

echo "=== COMPREHENSIVE TOYPETME TEST SUITE ==="
echo ""

# Test 1: SIGNUP
echo "1️⃣  TEST: SIGNUP (Email/Password)"
SIGNUP_RESPONSE=$(curl -s -X POST "$API/auth/signup" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456!"
  }')
echo "Response: $SIGNUP_RESPONSE"
USER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✓ User created: $USER_ID"
echo ""

# Test 2: LOGIN (Returning User)
echo "2️⃣  TEST: LOGIN (Returning User)"
LOGIN_RESPONSE=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!"
  }')
echo "Response: $LOGIN_RESPONSE"
echo ""

# Test 3: GET USER (Auth check)
echo "3️⃣  TEST: GET USER (Verify Authentication)"
USER_RESPONSE=$(curl -s -X GET "$API/auth/me" -b "$COOKIE_JAR")
echo "Response: $USER_RESPONSE"
echo ""

# Test 4: CREATE PET
echo "4️⃣  TEST: CREATE PET"
PET_RESPONSE=$(curl -s -X POST "$API/pets" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "name": "TestPet",
    "type": "Fluffy"
  }')
echo "Response: $PET_RESPONSE"
PET_ID=$(echo "$PET_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✓ Pet created: $PET_ID"
echo ""

# Test 5: GET ALL PETS
echo "5️⃣  TEST: GET ALL PETS"
PETS_RESPONSE=$(curl -s -X GET "$API/pets" -b "$COOKIE_JAR")
echo "Response: $PETS_RESPONSE" | head -c 200
echo "..."
echo ""

# Test 6: PET ACTIONS (Feed, Play, Clean, Sleep)
echo "6️⃣  TEST: PET ACTIONS"
echo "   6a. FEED"
FEED_RESPONSE=$(curl -s -X POST "$API/pets/$PET_ID/feed" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{}')
echo "   Response: $FEED_RESPONSE" | head -c 150
echo ""

echo "   6b. PLAY"
PLAY_RESPONSE=$(curl -s -X POST "$API/pets/$PET_ID/play" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{}')
echo "   Response: $PLAY_RESPONSE" | head -c 150
echo ""

echo "   6c. CLEAN"
CLEAN_RESPONSE=$(curl -s -X POST "$API/pets/$PET_ID/clean" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{}')
echo "   Response: $CLEAN_RESPONSE" | head -c 150
echo ""

echo "   6d. SLEEP"
SLEEP_RESPONSE=$(curl -s -X POST "$API/pets/$PET_ID/sleep" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{}')
echo "   Response: $SLEEP_RESPONSE" | head -c 150
echo ""

# Test 7: DAILY REWARD
echo "7️⃣  TEST: DAILY REWARD"
REWARD_RESPONSE=$(curl -s -X POST "$API/rewards/daily" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{}')
echo "Response: $REWARD_RESPONSE" | head -c 200
echo ""

# Test 8: GET CHALLENGES
echo "8️⃣  TEST: GET DAILY CHALLENGES"
CHALLENGES_RESPONSE=$(curl -s -X GET "$API/challenges/daily" -b "$COOKIE_JAR")
echo "Response: $CHALLENGES_RESPONSE" | head -c 300
echo ""

# Test 9: SHOP ITEMS
echo "9️⃣  TEST: GET SHOP ITEMS"
SHOP_RESPONSE=$(curl -s -X GET "$API/shop/items" -b "$COOKIE_JAR")
echo "Response: $SHOP_RESPONSE" | head -c 300
echo ""

# Test 10: INVENTORY
echo "🔟 TEST: GET INVENTORY"
INVENTORY_RESPONSE=$(curl -s -X GET "$API/inventory" -b "$COOKIE_JAR")
echo "Response: $INVENTORY_RESPONSE" | head -c 200
echo ""

# Test 11: MINI-GAMES HUB
echo "1️⃣1️⃣  TEST: MINI-GAMES (List all games)"
GAMES_RESPONSE=$(curl -s -X GET "$API/mini-games" -b "$COOKIE_JAR")
echo "Response: $GAMES_RESPONSE" | head -c 300
echo ""

# Test 12: PLAY MINI-GAME
echo "1️⃣2️⃣  TEST: PLAY MINI-GAME (Submit score)"
GAME_PLAY_RESPONSE=$(curl -s -X POST "$API/mini-games/ball-catch/play" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{"score": 500}')
echo "Response: $GAME_PLAY_RESPONSE" | head -c 250
echo ""

# Test 13: BREEDING - Start breeding
echo "1️⃣3️⃣  TEST: BREEDING (Start breeding)"
# First need to create a second pet
PET2_RESPONSE=$(curl -s -X POST "$API/pets" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "name": "TestPet2",
    "type": "Sparky"
  }')
PET2_ID=$(echo "$PET2_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

BREEDING_RESPONSE=$(curl -s -X POST "$API/breeding/start" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d "{
    \"parent1Id\": \"$PET_ID\",
    \"parent2Id\": \"$PET2_ID\",
    \"paymentMethod\": \"coins\"
  }")
echo "Response: $BREEDING_RESPONSE" | head -c 250
echo ""

# Test 14: GET BREEDING RECORDS
echo "1️⃣4️⃣  TEST: BREEDING RECORDS"
BREEDING_RECORDS=$(curl -s -X GET "$API/breeding" -b "$COOKIE_JAR")
echo "Response: $BREEDING_RECORDS" | head -c 300
echo ""

# Test 15: LEADERBOARD
echo "1️⃣5️⃣  TEST: LEADERBOARD"
LEADERBOARD_RESPONSE=$(curl -s -X GET "$API/leaderboard?category=level" -b "$COOKIE_JAR")
echo "Response: $LEADERBOARD_RESPONSE" | head -c 250
echo ""

# Test 16: USER PROFILE UPDATE
echo "1️⃣6️⃣  TEST: TOGGLE PREMIUM STATUS"
PREMIUM_RESPONSE=$(curl -s -X PATCH "$API/user/premium" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{}')
echo "Response: $PREMIUM_RESPONSE" | head -c 200
echo ""

# Test 17: GET STRIPE PRODUCTS
echo "1️⃣7️⃣  TEST: STRIPE PRODUCTS"
STRIPE_PRODUCTS=$(curl -s -X GET "$API/stripe/products" -b "$COOKIE_JAR")
echo "Response: $STRIPE_PRODUCTS" | head -c 200
echo ""

echo "=== TEST SUITE COMPLETE ==="
rm -f "$COOKIE_JAR"
