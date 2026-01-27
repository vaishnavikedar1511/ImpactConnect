/**
 * Create Announcement Banner Entry
 * 
 * Creates or updates the Announcement Banner singleton entry
 * 
 * Usage: node scripts/create-announcement-banner-entry.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const CONTENTSTACK_API_KEY = process.env.CONTENTSTACK_API_KEY;
const CONTENTSTACK_MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const CONTENTSTACK_ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT || 'production';
const REGION = process.env.CONTENTSTACK_REGION || '';
const API_HOST = REGION === 'eu' 
  ? 'https://eu-api.contentstack.io' 
  : REGION === 'azure-na' 
    ? 'https://azure-na-api.contentstack.io'
    : REGION === 'azure-eu'
      ? 'https://azure-eu-api.contentstack.io'
      : 'https://api.contentstack.io';

function validateConfig() {
  const missing = [];
  if (!CONTENTSTACK_API_KEY) missing.push('CONTENTSTACK_API_KEY');
  if (!CONTENTSTACK_MANAGEMENT_TOKEN) missing.push('CONTENTSTACK_MANAGEMENT_TOKEN');
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }
  
  console.log('✅ Configuration validated');
  console.log(`   API Host: ${API_HOST}`);
  console.log(`   Environment: ${CONTENTSTACK_ENVIRONMENT}\n`);
}

/**
 * Get existing entry
 */
async function getExistingEntry(contentTypeUid) {
  const url = `${API_HOST}/v3/content_types/${contentTypeUid}/entries?locale=en-us`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'api_key': CONTENTSTACK_API_KEY,
        'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.entries && data.entries.length > 0 ? data.entries[0] : null;
  } catch (error) {
    console.error('Error fetching existing entry:', error.message);
    return null;
  }
}

/**
 * Create or update entry
 */
async function createOrUpdateEntry(contentTypeUid, entryData) {
  const existing = await getExistingEntry(contentTypeUid);
  
  if (existing) {
    console.log(`📝 Updating existing Announcement Banner entry (${existing.uid})...`);
    return updateEntry(contentTypeUid, existing.uid, entryData, existing._version);
  } else {
    console.log('✨ Creating new Announcement Banner entry...');
    return createEntry(contentTypeUid, entryData);
  }
}

/**
 * Create new entry
 */
async function createEntry(contentTypeUid, entryData) {
  const url = `${API_HOST}/v3/content_types/${contentTypeUid}/entries?locale=en-us`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api_key': CONTENTSTACK_API_KEY,
        'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entry: entryData }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Created Announcement Banner entry');
      return data.entry;
    } else if (data.error_code === 119) {
      console.log('⏭️  Entry already exists');
      return null;
    } else {
      console.error('❌ Failed to create entry:', data.error_message || data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating entry:', error.message);
    return null;
  }
}

/**
 * Update existing entry
 */
async function updateEntry(contentTypeUid, entryUid, entryData, currentVersion) {
  const url = `${API_HOST}/v3/content_types/${contentTypeUid}/entries/${entryUid}?locale=en-us`;
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'api_key': CONTENTSTACK_API_KEY,
        'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          ...entryData,
        },
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Updated Announcement Banner entry');
      return data.entry;
    } else {
      console.error('❌ Failed to update entry:', data.error_message || data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error updating entry:', error.message);
    return null;
  }
}

/**
 * Publish entry
 */
async function publishEntry(contentTypeUid, entryUid) {
  const url = `${API_HOST}/v3/content_types/${contentTypeUid}/entries/${entryUid}/publish`;
  
  try {
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

    if (response.ok) {
      console.log('📤 Published Announcement Banner entry');
      return true;
    } else {
      const data = await response.json();
      console.error('⚠️  Failed to publish entry:', data.error_message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('⚠️  Error publishing entry:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  validateConfig();
  
  console.log('🚀 Creating Announcement Banner entry...\n');
  
  // Entry data for Announcement Banner
  const entryData = {
    enabled: true,
    message: 'Join us in making a difference! Discover new opportunities and connect with causes you care about.',
    link_text: 'Browse Opportunities',
    link_url: '/opportunities',
    background_color: 'info',
    dismissible: true,
    icon: '✨',
    // Optional: Set dates if you want time-based display
    // start_date: '2026-01-01T00:00:00.000Z',
    // end_date: '2026-12-31T23:59:59.000Z',
  };
  
  try {
    const entry = await createOrUpdateEntry('announcement_banner', entryData);
    
    if (entry) {
      // Publish the entry
      await publishEntry('announcement_banner', entry.uid);
      
      console.log('\n✅ Announcement Banner entry created/updated and published!');
      console.log('\n📋 Entry Details:');
      console.log(`   UID: ${entry.uid}`);
      console.log(`   Message: ${entryData.message}`);
      console.log(`   Enabled: ${entryData.enabled}`);
      console.log(`   Background Color: ${entryData.background_color}`);
      console.log('\n💡 You can now edit this entry in Contentstack to customize the message.');
    } else {
      console.log('\n⚠️  Entry creation/update was skipped or failed.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
