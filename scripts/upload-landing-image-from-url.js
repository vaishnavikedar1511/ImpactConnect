/**
 * Script to download image from URL and upload to Contentstack for landing page
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

const IMAGE_URL = 'https://images.contentstack.io/v3/assets/blt784cf10994409141/blt433d033d02b88a90/696f47f350018b8dad634269/pexels-prolificpeople-30477315.jpg';
const FOLDER_NAME = 'Landing Page';

async function downloadImage(url) {
  console.log('📥 Downloading image...');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function findOrCreateFolder() {
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
      console.log(`✅ Found folder: ${folder.uid}`);
      return folder.uid;
    }
  }
  
  // Create folder
  const createRes = await fetch(listUrl, {
    method: 'POST',
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      folder: { name: FOLDER_NAME },
    }),
  });
  
  if (createRes.ok) {
    const data = await createRes.json();
    console.log(`✅ Created folder: ${data.folder.uid}`);
    return data.folder.uid;
  }
  
  return null;
}

async function uploadAsset(imageBuffer, folderUid) {
  console.log('📤 Uploading to Contentstack...');
  
  // Use FormData (available in Node.js 18+)
  const FormData = globalThis.FormData || (await import('form-data')).default;
  const formData = new FormData();
  
  formData.append('asset[upload]', new Blob([imageBuffer], { type: 'image/jpeg' }), 'landing-hero-bg.jpg');
  formData.append('asset[title]', 'Landing Page Hero Background');
  formData.append('asset[description]', 'Background image for landing page hero section');
  
  if (folderUid) {
    formData.append('asset[parent_uid]', folderUid);
  }
  
  const uploadUrl = `${API_HOST}/v3/assets`;
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
      ...(formData.getHeaders ? formData.getHeaders() : {}),
    },
    body: formData,
  });
  
  if (!uploadRes.ok) {
    const error = await uploadRes.json();
    throw new Error(`Upload failed: ${JSON.stringify(error)}`);
  }
  
  const result = await uploadRes.json();
  console.log(`✅ Uploaded: ${result.asset.uid}`);
  
  // Publish asset
  const pubUrl = `${API_HOST}/v3/assets/${result.asset.uid}/publish`;
  await fetch(pubUrl, {
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
  
  return result.asset.uid;
}

async function updateEntry(assetUid) {
  console.log('🔄 Updating landing page entry...');
  
  const getUrl = `${API_HOST}/v3/content_types/landing_page/entries?locale=en-us`;
  const getRes = await fetch(getUrl, {
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'authorization': CONTENTSTACK_MANAGEMENT_TOKEN,
    },
  });
  
  const entry = (await getRes.json()).entries[0];
  
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
        hero_background_image: assetUid,
      },
    }),
  });
  
  if (!updateRes.ok) {
    const error = await updateRes.json();
    throw new Error(`Update failed: ${JSON.stringify(error)}`);
  }
  
  console.log('✅ Entry updated');
  
  // Publish
  const pubUrl = `${API_HOST}/v3/content_types/landing_page/entries/${entry.uid}/publish`;
  await fetch(pubUrl, {
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
  
  console.log('📤 Entry published');
}

async function main() {
  try {
    const imageBuffer = await downloadImage(IMAGE_URL);
    const folderUid = await findOrCreateFolder();
    const assetUid = await uploadAsset(imageBuffer, folderUid);
    await updateEntry(assetUid);
    console.log('\n✨ Done! Background image is now set.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
