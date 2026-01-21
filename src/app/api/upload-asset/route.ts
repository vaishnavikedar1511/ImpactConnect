/**
 * Upload Asset API Route
 * Uploads images to Contentstack Assets
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    const apiKey = process.env.CONTENTSTACK_API_KEY;
    const managementToken = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
    const folderUid = process.env.CONTENTSTACK_ASSETS_FOLDER_UID;

    if (!apiKey || !managementToken) {
      console.error('[UploadAsset] Missing API credentials');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create form data for Contentstack
    const csFormData = new FormData();
    csFormData.append('asset[upload]', new Blob([buffer], { type: file.type }), file.name);
    csFormData.append('asset[title]', file.name);
    csFormData.append('asset[description]', 'Event cover image');
    
    // Add to specific folder if configured
    if (folderUid) {
      csFormData.append('asset[parent_uid]', folderUid);
      console.log('[UploadAsset] Uploading to folder:', folderUid);
    }

    // Upload to Contentstack
    const response = await fetch('https://api.contentstack.io/v3/assets', {
      method: 'POST',
      headers: {
        'api_key': apiKey,
        'authorization': managementToken,
      },
      body: csFormData,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[UploadAsset] Upload failed:', result);
      return NextResponse.json(
        { success: false, error: result.error_message || 'Failed to upload image' },
        { status: 500 }
      );
    }

    console.log('[UploadAsset] Upload successful:', result.asset?.uid);

    // Publish the asset to make it available
    const assetUid = result.asset.uid;
    const environment = process.env.CONTENTSTACK_ENVIRONMENT || 'production';
    
    try {
      const publishResponse = await fetch(
        `https://api.contentstack.io/v3/assets/${assetUid}/publish`,
        {
          method: 'POST',
          headers: {
            'api_key': apiKey,
            'authorization': managementToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            asset: {
              environments: [environment],
              locales: ['en-us'],
            },
          }),
        }
      );

      if (publishResponse.ok) {
        console.log('[UploadAsset] Asset published successfully');
      } else {
        const publishError = await publishResponse.text();
        console.warn('[UploadAsset] Publish warning:', publishError);
        // Don't fail - asset is uploaded, just not published
      }
    } catch (publishError) {
      console.warn('[UploadAsset] Publish error:', publishError);
      // Don't fail - asset is uploaded, just not published
    }

    return NextResponse.json({
      success: true,
      asset: {
        uid: result.asset.uid,
        url: result.asset.url,
        filename: result.asset.filename,
        title: result.asset.title,
      },
    });

  } catch (error) {
    console.error('[UploadAsset] Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
