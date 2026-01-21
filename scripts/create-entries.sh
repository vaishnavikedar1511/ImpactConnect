#!/bin/bash

# Contentstack Entry Creator
# Run this script in Terminal: bash scripts/create-entries.sh

API_KEY="blt784cf10994409141"
TOKEN="cs68f0acc0b2e9eb791d8e66b1"
BASE_URL="https://api.contentstack.io/v3/content_types/opportunity/entries?locale=en-us"

echo "🌱 Creating Contentstack Entries..."
echo "=================================="
echo ""

# Entry 1
echo "Creating: Beach Cleanup Drive at Juhu..."
curl -s -X POST "$BASE_URL" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"title":"Beach Cleanup Drive at Juhu","slug":"beach-cleanup-juhu","summary":"Join us for a morning beach cleanup at Juhu Beach.","status":"upcoming","is_virtual":false,"country":"India","state":"Maharashtra","city":"Mumbai","cause_slugs":["environment"],"contribution_types":["physical_effort","time"],"start_date":"2026-02-15","start_time":"07:00","end_time":"10:00","organizer_name":"Clean Seas Foundation","organizer_email":"volunteer@cleanseas.org","spots_available":50}}' | grep -o '"uid":"[^"]*"' || echo "Failed"
echo ""

# Entry 2
echo "Creating: Teaching English to Children..."
curl -s -X POST "$BASE_URL" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"title":"Teaching English to Children","slug":"teach-english-dharavi","summary":"Volunteer as an English teacher for children in Dharavi.","status":"ongoing","is_virtual":false,"country":"India","state":"Maharashtra","city":"Mumbai","cause_slugs":["education"],"contribution_types":["skills","time"],"start_date":"2026-01-01","organizer_name":"Teach India Foundation","organizer_email":"info@teachindia.org","spots_available":20}}' | grep -o '"uid":"[^"]*"' || echo "Failed"
echo ""

# Entry 3
echo "Creating: Blood Donation Camp..."
curl -s -X POST "$BASE_URL" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"title":"Blood Donation Camp","slug":"blood-donation-bangalore","summary":"Donate blood and save lives. One donation can save up to 3 lives!","status":"upcoming","is_virtual":false,"country":"India","state":"Karnataka","city":"Bangalore","cause_slugs":["healthcare"],"contribution_types":["resources"],"start_date":"2026-02-20","organizer_name":"Red Cross Society","organizer_email":"bangalore@redcross.in","spots_available":100}}' | grep -o '"uid":"[^"]*"' || echo "Failed"
echo ""

# Entry 4
echo "Creating: Animal Shelter Volunteering..."
curl -s -X POST "$BASE_URL" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"title":"Animal Shelter Volunteering","slug":"animal-shelter-pune","summary":"Spend time with rescued animals at our shelter.","status":"ongoing","is_virtual":false,"country":"India","state":"Maharashtra","city":"Pune","cause_slugs":["animal-welfare"],"contribution_types":["physical_effort","time"],"start_date":"2026-01-01","organizer_name":"PAWS Animal Welfare","organizer_email":"volunteer@pawspune.org","spots_available":30}}' | grep -o '"uid":"[^"]*"' || echo "Failed"
echo ""

# Entry 5
echo "Creating: Tree Plantation Drive..."
curl -s -X POST "$BASE_URL" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"title":"Tree Plantation Drive","slug":"tree-plantation-delhi","summary":"Plant trees and help combat air pollution in Delhi NCR.","status":"upcoming","is_virtual":false,"country":"India","state":"Delhi","city":"New Delhi","cause_slugs":["environment"],"contribution_types":["physical_effort","time"],"start_date":"2026-03-01","organizer_name":"Green Delhi Initiative","organizer_email":"contact@greendelhi.org","spots_available":200}}' | grep -o '"uid":"[^"]*"' || echo "Failed"
echo ""

# Entry 6
echo "Creating: Health Checkup Camp..."
curl -s -X POST "$BASE_URL" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"title":"Free Health Checkup Camp","slug":"health-checkup-chennai","summary":"Volunteer doctors and nurses needed for a free health camp.","status":"upcoming","is_virtual":false,"country":"India","state":"Tamil Nadu","city":"Chennai","cause_slugs":["healthcare"],"contribution_types":["skills","time"],"start_date":"2026-02-28","organizer_name":"Healthcare For All","organizer_email":"healthcamp@hfa.org.in","spots_available":40}}' | grep -o '"uid":"[^"]*"' || echo "Failed"
echo ""

# Entry 7
echo "Creating: Online Mentorship Program..."
curl -s -X POST "$BASE_URL" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"title":"Online Mentorship Program","slug":"online-mentorship-program","summary":"Mentor first-generation college students online.","status":"ongoing","is_virtual":true,"cause_slugs":["education"],"contribution_types":["skills","time"],"start_date":"2026-01-15","organizer_name":"Career Catalyst","organizer_email":"mentors@careercatalyst.in","spots_available":100}}' | grep -o '"uid":"[^"]*"' || echo "Failed"
echo ""

# Entry 8
echo "Creating: Food Distribution Drive..."
curl -s -X POST "$BASE_URL" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"title":"Food Distribution Drive","slug":"food-distribution-hyderabad","summary":"Help distribute meals to homeless individuals in Hyderabad.","status":"ongoing","is_virtual":false,"country":"India","state":"Telangana","city":"Hyderabad","cause_slugs":["healthcare"],"contribution_types":["physical_effort","time","resources"],"start_date":"2026-01-05","organizer_name":"Feeding Hope","organizer_email":"volunteer@feedinghope.org","spots_available":25}}' | grep -o '"uid":"[^"]*"' || echo "Failed"
echo ""

# Entry 9
echo "Creating: Coastal Cleanup Goa..."
curl -s -X POST "$BASE_URL" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"title":"Coastal Cleanup Goa","slug":"coastal-cleanup-goa","summary":"Clean Goas beaches and learn about marine conservation.","status":"upcoming","is_virtual":false,"country":"India","state":"Goa","city":"Calangute","cause_slugs":["environment"],"contribution_types":["physical_effort","time"],"start_date":"2026-03-15","organizer_name":"Ocean Warriors Goa","organizer_email":"events@oceanwarriorsgoa.org","spots_available":60}}' | grep -o '"uid":"[^"]*"' || echo "Failed"
echo ""

# Entry 10
echo "Creating: Stray Dog Vaccination..."
curl -s -X POST "$BASE_URL" \
  -H "api_key: $API_KEY" \
  -H "authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry":{"title":"Stray Dog Vaccination Drive","slug":"stray-dog-vaccination-jaipur","summary":"Help catch and vaccinate stray dogs in Jaipur.","status":"upcoming","is_virtual":false,"country":"India","state":"Rajasthan","city":"Jaipur","cause_slugs":["animal-welfare","healthcare"],"contribution_types":["physical_effort","time"],"start_date":"2026-02-08","organizer_name":"Animal Aid Jaipur","organizer_email":"vaccination@animalaidjaipur.org","spots_available":15}}' | grep -o '"uid":"[^"]*"' || echo "Failed"
echo ""

echo "=================================="
echo "✅ Done! Now go to Contentstack and publish the entries."
echo "   Entries → Select All → Publish → production"
