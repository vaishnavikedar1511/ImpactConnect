/**
 * Update Past Events Status
 * 
 * This script fetches all opportunities from Contentstack and updates
 * the status to "completed" for events whose date has passed.
 * 
 * Usage: node scripts/update-past-events-status.js
 * 
 * Required environment variables:
 * - CONTENTSTACK_API_KEY
 * - CONTENTSTACK_DELIVERY_TOKEN
 * - CONTENTSTACK_MANAGEMENT_TOKEN
 * - CONTENTSTACK_ENVIRONMENT
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const CONTENTSTACK_API_KEY = process.env.CONTENTSTACK_API_KEY;
const CONTENTSTACK_DELIVERY_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN;
const CONTENTSTACK_MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const CONTENTSTACK_ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT || 'production';
const CONTENTSTACK_REGION = process.env.CONTENTSTACK_REGION || '';
const API_HOST = CONTENTSTACK_REGION === 'eu' 
  ? 'https://cdn.contentstack.io' 
  : CONTENTSTACK_REGION === 'azure-na' 
    ? 'https://azure-na-cdn.contentstack.io'
    : CONTENTSTACK_REGION === 'azure-eu'
      ? 'https://azure-eu-cdn.contentstack.io'
      : 'https://cdn.contentstack.io';
const MANAGEMENT_API_HOST = CONTENTSTACK_REGION === 'eu'
  ? 'https://api.contentstack.io'
  : CONTENTSTACK_REGION === 'azure-na'
    ? 'https://azure-na-api.contentstack.io'
    : CONTENTSTACK_REGION === 'azure-eu'
      ? 'https://azure-eu-api.contentstack.io'
      : 'https://api.contentstack.io';

function validateConfig() {
  const missing = [];
  if (!CONTENTSTACK_API_KEY) missing.push('CONTENTSTACK_API_KEY');
  if (!CONTENTSTACK_DELIVERY_TOKEN) missing.push('CONTENTSTACK_DELIVERY_TOKEN');
  if (!CONTENTSTACK_MANAGEMENT_TOKEN) missing.push('CONTENTSTACK_MANAGEMENT_TOKEN');
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }
}

function isPast(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

async function fetchAllOpportunities() {
  const url = `${API_HOST}/v3/content_types/opportunity/entries?environment=${CONTENTSTACK_ENVIRONMENT}&locale=en-us&limit=100`;
  
  console.log('📥 Fetching all opportunities from Contentstack...');
  
  const allEntries = [];
  let skip = 0;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`${url}&skip=${skip}`, {
      headers: {
        'api_key': CONTENTSTACK_API_KEY,
        'access_token': CONTENTSTACK_DELIVERY_TOKEN,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch opportunities: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    allEntries.push(...(data.entries || []));
    
    hasMore = data.entries && data.entries.length === 100;
    skip += 100;
    
    console.log(`   Fetched ${allEntries.length} opportunities so far...`);
  }
  
  console.log(`✅ Total opportunities fetched: ${allEntries.length}\n`);
  return allEntries;
}

async function updateOpportunityStatus(entryUid, entryData) {
  const url = `${MANAGEMENT_API_HOST}/v3/content_types/opportunity/entries/${entryUid}?locale=en-us`;
  
  // Update entry with new status
  const updatedEntry = {
    ...entryData,
    status: 'completed',
  };
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entry: updatedEntry,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update entry ${entryUid}: ${response.status} ${errorText}`);
  }
  
  return await response.json();
}

async function publishEntry(entryUid) {
  const url = `${MANAGEMENT_API_HOST}/v3/content_types/opportunity/entries/${entryUid}/publish`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entry: {
        environments: [CONTENTSTACK_ENVIRONMENT],
        locales: ['en-us'],
      },
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to publish entry ${entryUid}: ${response.status} ${errorText}`);
  }
  
  return await response.json();
}

async function main() {
  validateConfig();
  
  console.log('🔄 Starting past events status update...\n');
  
  try {
    // Fetch all opportunities
    const opportunities = await fetchAllOpportunities();
    
    // Filter opportunities that need status update
    const pastEvents = opportunities.filter((entry) => {
      const eventDate = entry.end_date || entry.start_date;
      const hasPastDate = eventDate ? isPast(eventDate) : false;
      const isNotCompleted = entry.status !== 'completed';
      const isNotCancelled = entry.status !== 'cancelled';
      
      return hasPastDate && isNotCompleted && isNotCancelled;
    });
    
    console.log(`📋 Found ${pastEvents.length} past events that need status update:\n`);
    
    if (pastEvents.length === 0) {
      console.log('✅ No events need status updates. All done!');
      return;
    }
    
    // Display events that will be updated
    pastEvents.forEach((entry, index) => {
      const eventDate = entry.end_date || entry.start_date;
      console.log(`   ${index + 1}. ${entry.title} (${entry.uid})`);
      console.log(`      Date: ${eventDate}, Current Status: ${entry.status || 'upcoming'}`);
    });
    
    console.log('\n');
    
    // Update status for each past event
    let updated = 0;
    let failed = 0;
    
    for (const entry of pastEvents) {
      try {
        console.log(`🔄 Updating ${entry.title} (${entry.uid})...`);
        
        // Update status
        const updateResult = await updateOpportunityStatus(entry.uid, entry);
        console.log(`   ✅ Status updated to "completed"`);
        
        // Publish the entry
        await publishEntry(entry.uid);
        console.log(`   ✅ Entry published\n`);
        
        updated++;
      } catch (error) {
        console.error(`   ❌ Failed to update ${entry.title}:`, error.message);
        failed++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📝 Total processed: ${pastEvents.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
