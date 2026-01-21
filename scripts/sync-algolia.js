/**
 * Sync Contentstack Opportunities to Algolia
 * 
 * This script fetches all published opportunities from Contentstack
 * and indexes them in Algolia for search.
 * 
 * Usage: node scripts/sync-algolia.js
 * 
 * Required environment variables:
 * - CONTENTSTACK_API_KEY
 * - CONTENTSTACK_DELIVERY_TOKEN
 * - CONTENTSTACK_ENVIRONMENT
 * - NEXT_PUBLIC_ALGOLIA_APP_ID
 * - ALGOLIA_ADMIN_API_KEY
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Configuration
const CONTENTSTACK_API_KEY = process.env.CONTENTSTACK_API_KEY;
const CONTENTSTACK_DELIVERY_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN;
const CONTENTSTACK_ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT || 'production';
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY;
const ALGOLIA_INDEX_NAME = 'impactconnect_events';

// Validate configuration
function validateConfig() {
  const missing = [];
  if (!CONTENTSTACK_API_KEY) missing.push('CONTENTSTACK_API_KEY');
  if (!CONTENTSTACK_DELIVERY_TOKEN) missing.push('CONTENTSTACK_DELIVERY_TOKEN');
  if (!ALGOLIA_APP_ID) missing.push('NEXT_PUBLIC_ALGOLIA_APP_ID');
  if (!ALGOLIA_ADMIN_KEY) missing.push('ALGOLIA_ADMIN_API_KEY');
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }
}

// Fetch opportunities from Contentstack
async function fetchOpportunities() {
  const url = `https://cdn.contentstack.io/v3/content_types/opportunity/entries?environment=${CONTENTSTACK_ENVIRONMENT}&locale=en-us`;
  
  console.log('Fetching opportunities from Contentstack...');
  
  const response = await fetch(url, {
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'access_token': CONTENTSTACK_DELIVERY_TOKEN,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Contentstack API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  console.log(`Found ${data.entries?.length || 0} opportunities`);
  
  return data.entries || [];
}

// Transform Contentstack entry to Algolia record
function transformForAlgolia(entry) {
  return {
    // Algolia requires objectID
    objectID: entry.uid,
    
    // Searchable fields
    title: entry.title || '',
    description: entry.description || '',
    summary: entry.summary || '',
    cause: entry.cause_slugs?.[0] || '', // Primary cause
    causes: entry.cause_slugs || [], // All causes
    tags: entry.cause_slugs || [], // Use causes as tags
    city: entry.city || '',
    state: entry.state || '',
    country: entry.country || '',
    
    // Display fields
    slug: entry.slug || entry.uid,
    cover_image: entry.cover_image ? {
      url: entry.cover_image.url,
      title: entry.cover_image.title || entry.title,
    } : null,
    
    // Event details
    event_date: entry.start_date || null,
    start_date: entry.start_date || null,
    end_date: entry.end_date || null,
    start_time: entry.start_time || null,
    end_time: entry.end_time || null,
    
    // Filters
    is_virtual: entry.is_virtual || false,
    contribution_types: entry.contribution_types || [],
    status: entry.status || 'upcoming',
    
    // Organizer
    organizer_name: entry.organizer_name || '',
    
    // Metadata
    spots_available: entry.spots_available || null,
    requirements: entry.requirements || '',
    
    // Timestamps for sorting
    created_at: entry.created_at,
    updated_at: entry.updated_at,
  };
}

// Main sync function using Algolia REST API directly
async function syncToAlgolia() {
  console.log('Starting Algolia sync...\n');
  
  // Validate configuration
  validateConfig();
  
  try {
    // Fetch opportunities from Contentstack
    const opportunities = await fetchOpportunities();
    
    if (opportunities.length === 0) {
      console.log('No opportunities to sync');
      return;
    }
    
    // Transform for Algolia
    console.log('Transforming records for Algolia...');
    const records = opportunities.map(transformForAlgolia);
    
    // Configure index settings first
    console.log('Configuring Algolia index settings...');
    const settingsResponse = await fetch(
      `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/settings`,
      {
        method: 'PUT',
        headers: {
          'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
          'X-Algolia-Application-Id': ALGOLIA_APP_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchableAttributes: [
            'title',
            'description,summary',
            'causes,tags',
            'city,state,country',
            'organizer_name',
          ],
          attributesForFaceting: [
            'searchable(city)',
            'searchable(causes)',
            'filterOnly(is_virtual)',
            'filterOnly(contribution_types)',
            'filterOnly(status)',
          ],
          attributesToRetrieve: [
            'objectID',
            'title',
            'description',
            'summary',
            'cause',
            'causes',
            'city',
            'state',
            'country',
            'slug',
            'cover_image',
            'event_date',
            'start_date',
            'end_date',
            'start_time',
            'is_virtual',
            'contribution_types',
            'organizer_name',
            'spots_available',
          ],
          attributesToHighlight: ['title', 'description'],
          typoTolerance: true,
          minWordSizefor1Typo: 3,
          minWordSizefor2Typos: 7,
          customRanking: ['desc(event_date)', 'desc(updated_at)'],
          hitsPerPage: 12,
        }),
      }
    );
    
    if (!settingsResponse.ok) {
      const error = await settingsResponse.text();
      throw new Error(`Failed to configure settings: ${error}`);
    }
    console.log('Index settings configured');
    
    // Clear the index
    console.log('Clearing existing records...');
    const clearResponse = await fetch(
      `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/clear`,
      {
        method: 'POST',
        headers: {
          'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
          'X-Algolia-Application-Id': ALGOLIA_APP_ID,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!clearResponse.ok) {
      const error = await clearResponse.text();
      console.warn(`Warning: Could not clear index: ${error}`);
    }
    
    // Wait a bit for clearing to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add records in batches
    console.log('Syncing records to Algolia...');
    const batchResponse = await fetch(
      `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/batch`,
      {
        method: 'POST',
        headers: {
          'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
          'X-Algolia-Application-Id': ALGOLIA_APP_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: records.map(record => ({
            action: 'updateObject',
            body: record,
          })),
        }),
      }
    );
    
    if (!batchResponse.ok) {
      const error = await batchResponse.text();
      throw new Error(`Failed to sync records: ${error}`);
    }
    
    const batchResult = await batchResponse.json();
    
    console.log(`\nSync complete! Indexed ${records.length} records`);
    console.log(`Index: ${ALGOLIA_INDEX_NAME}`);
    console.log(`Task ID: ${batchResult.taskID}`);
    
    // Show sample record
    if (records.length > 0) {
      console.log('\nSample record:');
      console.log(JSON.stringify(records[0], null, 2));
    }
    
  } catch (error) {
    console.error('Sync failed:', error.message);
    process.exit(1);
  }
}

// Run the sync
syncToAlgolia();
