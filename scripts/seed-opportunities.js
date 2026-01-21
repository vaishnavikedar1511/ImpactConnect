/**
 * Seed Opportunities Script
 * Creates opportunity entries in Contentstack using Management API
 * 
 * Usage: node scripts/seed-opportunities.js
 * 
 * Required environment variables:
 * - CONTENTSTACK_API_KEY
 * - CONTENTSTACK_MANAGEMENT_TOKEN
 * - CONTENTSTACK_REGION (optional, defaults to 'na')
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
}

loadEnv();

const API_KEY = process.env.CONTENTSTACK_API_KEY;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const REGION = process.env.CONTENTSTACK_REGION || 'na';

// Determine base URL based on region
function getBaseHost() {
  switch (REGION.toLowerCase()) {
    case 'eu':
      return 'eu-api.contentstack.io';
    case 'azure-na':
      return 'azure-na-api.contentstack.io';
    case 'azure-eu':
      return 'azure-eu-api.contentstack.io';
    default:
      return 'api.contentstack.io';
  }
}

const BASE_HOST = getBaseHost();

// Validate environment
function validateEnv() {
  const missing = [];
  if (!API_KEY) missing.push('CONTENTSTACK_API_KEY');
  if (!MANAGEMENT_TOKEN) missing.push('CONTENTSTACK_MANAGEMENT_TOKEN');
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\nMake sure your .env file contains these variables.');
    process.exit(1);
  }
}

// Load opportunities from JSON file
function loadOpportunities() {
  const filePath = path.join(__dirname, '../contentstack/sample-data/opportunities.json');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ opportunities.json not found at:', filePath);
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data.entries || [];
}

// Make HTTPS request
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Create a single entry
async function createEntry(entry, index, total) {
  const entryData = {
    entry: {
      title: entry.title,
      slug: entry.slug,
      summary: entry.summary || '',
      description: entry.description || '',
      status: entry.status || 'upcoming',
      is_virtual: entry.is_virtual || false,
      country: entry.country || '',
      state: entry.state || '',
      city: entry.city || '',
      address: entry.address || '',
      cause_slugs: entry.cause_slugs || [],
      contribution_types: entry.contribution_types || [],
      start_date: entry.start_date,
      end_date: entry.end_date || '',
      start_time: entry.start_time || '',
      end_time: entry.end_time || '',
      organizer_name: entry.organizer_name || '',
      organizer_email: entry.organizer_email || '',
      spots_available: entry.spots_available || null,
      requirements: entry.requirements || '',
    }
  };

  const options = {
    hostname: BASE_HOST,
    port: 443,
    path: '/v3/content_types/opportunity/entries?locale=en-us',
    method: 'POST',
    headers: {
      'api_key': API_KEY,
      'authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json',
    }
  };

  try {
    const result = await makeRequest(options, entryData);

    if (result.status >= 200 && result.status < 300 && result.data.entry) {
      console.log(`✅ [${index + 1}/${total}] Created: ${entry.title}`);
      return { success: true, uid: result.data.entry.uid, title: entry.title };
    } else {
      console.error(`❌ [${index + 1}/${total}] Failed: ${entry.title}`);
      console.error(`   Status: ${result.status}`);
      console.error(`   Error: ${result.data.error_message || JSON.stringify(result.data)}`);
      return { success: false, title: entry.title, error: result.data.error_message || 'Unknown error' };
    }
  } catch (error) {
    console.error(`❌ [${index + 1}/${total}] Error: ${entry.title}`);
    console.error(`   ${error.message}`);
    return { success: false, title: entry.title, error: error.message };
  }
}

// Publish an entry
async function publishEntry(uid, title) {
  const publishData = {
    entry: {
      environments: ['production'],
      locales: ['en-us']
    }
  };

  const options = {
    hostname: BASE_HOST,
    port: 443,
    path: `/v3/content_types/opportunity/entries/${uid}/publish`,
    method: 'POST',
    headers: {
      'api_key': API_KEY,
      'authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json',
    }
  };

  try {
    const result = await makeRequest(options, publishData);

    if (result.status >= 200 && result.status < 300) {
      console.log(`   📢 Published: ${title}`);
      return true;
    } else {
      console.error(`   ⚠️ Publish failed: ${title} - ${result.data.error_message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error(`   ⚠️ Publish error: ${title} - ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.log('🌱 Contentstack Opportunity Seeder');
  console.log('===================================\n');
  
  // Validate environment
  validateEnv();
  
  console.log(`📍 Region: ${REGION}`);
  console.log(`🔗 API Host: ${BASE_HOST}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`🔐 Token: ${MANAGEMENT_TOKEN.substring(0, 8)}...\n`);
  
  // Load opportunities
  const opportunities = loadOpportunities();
  console.log(`📦 Found ${opportunities.length} opportunities to create\n`);
  
  if (opportunities.length === 0) {
    console.log('No opportunities to create. Exiting.');
    return;
  }
  
  // Ask for confirmation
  console.log('This will create entries in your Contentstack stack.');
  console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Create entries
  console.log('Creating entries...\n');
  const results = [];
  
  for (let i = 0; i < opportunities.length; i++) {
    const result = await createEntry(opportunities[i], i, opportunities.length);
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('\n===================================');
  console.log('📊 Summary');
  console.log('===================================');
  console.log(`✅ Created: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\nFailed entries:');
    failed.forEach(f => console.log(`   - ${f.title}: ${f.error}`));
  }
  
  // Publish successful entries
  if (successful.length > 0) {
    console.log('\n📢 Publishing entries to production...\n');
    
    for (const entry of successful) {
      await publishEntry(entry.uid, entry.title);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n✅ Done! Entries have been created and published.');
  }
}

// Run
main().catch(console.error);
