/**
 * Script to upload a background image for the landing page
 * Usage: node scripts/update-landing-background.js <path-to-image>
 * Example: node scripts/update-landing-background.js ./public/hero-bg.jpg
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const fs = require('fs');
const path = require('path');

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

const FOLDER_NAME = 'Landing Page';

function validateConfig() {
  const missing = [];
  if (!CONTENTSTACK_API_KEY) missing.push('CONTENTSTACK_API_KEY');
  if (!CONTENTSTACK_MANAGEMENT_TOKEN) missing.push('CONTENTSTACK_MANAGEMENT_TOKEN');
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }
}

async function findOrCreateFolder() {
  console.log(`\n📁 Finding or creating folder: "${FOLDER_NAME}"`);
  
  // First, try to find existing folder
  const listUrl = `${API_HOST}/v3/assets/folders`;
  const listRes = await fetch(listUrl, {
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
    },
  });
  
  if (listRes.ok) {
    const data = await listRes.json();
    const folder = data.folders?.find(f => f.name === FOLDER_NAME);
    if (folder) {
      console.log(`✅ Found existing folder: ${folder.uid}`);
      return folder.uid;
    }
  }
  
  // Create folder if not found
  console.log(`Creating new folder: "${FOLDER_NAME}"`);
  const createUrl = `${API_HOST}/v3/assets/folders`;
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      folder: {
        name: FOLDER_NAME,
      },
    }),
  });
  
  if (createRes.ok) {
    const data = await createRes.json();
    console.log(`✅ Created folder: ${data.folder.uid}`);
    return data.folder.uid;
  } else {
    const error = await createRes.json();
    console.error('❌ Failed to create folder:', error);
    return null;
  }
}

async function uploadImage(imagePath, folderUid) {
  console.log(`\n📤 Uploading image: ${imagePath}`);
  
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Image file not found: ${imagePath}`);
    process.exit(1);
  }
  
  const fileBuffer = fs.readFileSync(imagePath);
  const fileName = path.basename(imagePath);
  const fileExt = path.extname(fileName).toLowerCase();
  
  // Determine content type
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  
  const contentType = contentTypes[fileExt] || 'image/jpeg';
  
  // Create FormData
  const FormData = require('form-data');
  const formData = new FormData();
  formData.append('asset[upload]', fileBuffer, {
    filename: fileName,
    contentType: contentType,
  });
  formData.append('asset[title]', 'Landing Page Hero Background');
  formData.append('asset[description]', 'Background image for the landing page hero section');
  
  if (folderUid) {
    formData.append('asset[parent_uid]', folderUid);
  }
  
  // Upload asset
  const uploadUrl = `${API_HOST}/v3/assets`;
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
      ...formData.getHeaders(),
    },
    body: formData,
  });
  
  if (!uploadRes.ok) {
    const error = await uploadRes.json();
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
  
  const result = await uploadRes.json();
  const assetUid = result.asset.uid;
  const assetUrl = result.asset.url;
  
  console.log(`✅ Image uploaded successfully`);
  console.log(`   Asset UID: ${assetUid}`);
  console.log(`   URL: ${assetUrl}`);
  
  // Publish asset
  const pubUrl = `${API_HOST}/v3/assets/${assetUid}/publish`;
  const pubRes = await fetch(pubUrl, {
    method: 'POST',
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      asset: {
        environments: [CONTENTSTACK_ENVIRONMENT],
        locales: ['en-us'],
      },
    }),
  });
  
  if (pubRes.ok) {
    console.log(`📤 Asset published`);
  } else {
    console.warn(`⚠️  Failed to publish asset (but upload succeeded)`);
  }
  
  return {
    uid: assetUid,
    url: assetUrl,
  };
}

async function updateLandingPageEntry(asset) {
  console.log(`\n🔄 Updating landing page entry`);
  
  // Get existing entry
  const getUrl = `${API_HOST}/v3/content_types/landing_page/entries?locale=en-us`;
  const getRes = await fetch(getUrl, {
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
    },
  });
  
  const getData = await getRes.json();
  if (!getData.entries || getData.entries.length === 0) {
    console.error('❌ Landing page entry not found');
    process.exit(1);
  }
  
  const entry = getData.entries[0];
  console.log(`Found entry: ${entry.uid}`);
  
  // Update entry with asset reference
  const updateUrl = `${API_HOST}/v3/content_types/landing_page/entries/${entry.uid}?locale=en-us`;
  const updateRes = await fetch(updateUrl, {
    method: 'PUT',
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entry: {
        ...entry,
        hero_background_image: {
          uid: asset.uid,
          url: asset.url,
        },
      },
    }),
  });
  
  if (!updateRes.ok) {
    const error = await updateRes.json();
    console.error('❌ Failed to update entry:', error);
    process.exit(1);
  }
  
  console.log(`✅ Entry updated`);
  
  // Publish entry
  const pubUrl = `${API_HOST}/v3/content_types/landing_page/entries/${entry.uid}/publish`;
  const pubRes = await fetch(pubUrl, {
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
  
  if (pubRes.ok) {
    console.log(`📤 Entry published`);
  } else {
    console.warn(`⚠️  Failed to publish entry`);
  }
}

async function main() {
  const imagePath = process.argv[2];
  
  if (!imagePath) {
    console.error('❌ Please provide an image path');
    console.error('Usage: node scripts/update-landing-background.js <path-to-image>');
    console.error('Example: node scripts/update-landing-background.js ./public/hero-bg.jpg');
    process.exit(1);
  }
  
  console.log('\n🚀 Updating Landing Page Background Image\n');
  console.log('='.repeat(50));
  
  validateConfig();
  
  try {
    // Step 1: Find or create folder
    const folderUid = await findOrCreateFolder();
    
    // Step 2: Upload image
    const asset = await uploadImage(imagePath, folderUid);
    
    // Step 3: Update landing page entry
    await updateLandingPageEntry(asset);
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✨ Done! Landing page background image updated.\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
