#!/bin/bash

# Debug version with verbose output

API_KEY="blt784cf10994409141"
TOKEN="cs68f0acc0b2e9eb791d8e66b1"

echo "🔍 Debug: Testing network and API..."
echo ""

# Test basic internet
echo "1. Testing internet (google.com)..."
curl -s -I "https://google.com" | head -1
echo ""

# Test Contentstack domain
echo "2. Testing Contentstack domain..."
curl -s -I "https://api.contentstack.io" | head -1
echo ""

# Test with verbose
echo "3. Testing API with verbose output..."
curl -v "https://api.contentstack.io/v3/stacks" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" 2>&1
echo ""
echo ""

# Try creating entry with verbose
echo "4. Creating entry with verbose..."
curl -v -X POST "https://api.contentstack.io/v3/content_types/opportunity/entries?locale=en-us" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"title":"Test Entry","slug":"test-entry-456","summary":"Test","status":"upcoming","start_date":"2026-02-15"}}' 2>&1
echo ""
