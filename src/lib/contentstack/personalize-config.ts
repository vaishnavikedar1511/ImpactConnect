/**
 * Contentstack Personalize Configuration
 */

export interface PersonalizeConfig {
  projectUid: string;
  edgeApiUrl?: string;
}

/**
 * Get Personalize configuration from environment variables
 */
export function getPersonalizeConfig(): PersonalizeConfig | null {
  const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
  
  console.log('[Personalize Config] Checking configuration...');
  console.log('[Personalize Config] Project UID exists:', !!projectUid);
  console.log('[Personalize Config] Project UID length:', projectUid?.length || 0);
  
  if (!projectUid) {
    console.error('❌ NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID not set');
    console.error('   Add it to .env.local and restart dev server');
    return null;
  }
  
  if (projectUid.length !== 24) {
    console.warn('⚠️ Project UID should be 24 characters, got:', projectUid.length);
  }

  // Determine Edge API URL based on region
  const region = process.env.CONTENTSTACK_REGION || 'na';
  let edgeApiUrl: string | undefined;

  switch (region.toLowerCase()) {
    case 'eu':
      edgeApiUrl = 'https://eu-personalize-edge.contentstack.com';
      break;
    case 'azure-na':
      edgeApiUrl = 'https://azure-na-personalize-edge.contentstack.com';
      break;
    case 'azure-eu':
      edgeApiUrl = 'https://azure-eu-personalize-edge.contentstack.com';
      break;
    case 'gcp-na':
      edgeApiUrl = 'https://gcp-na-personalize-edge.contentstack.com';
      break;
    case 'aws-au':
      edgeApiUrl = 'https://au-personalize-edge.contentstack.com';
      break;
    default:
      edgeApiUrl = 'https://personalize-edge.contentstack.com'; // AWS NA
  }

  // Allow override via environment variable
  if (process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL) {
    edgeApiUrl = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL;
  }

  return {
    projectUid,
    edgeApiUrl,
  };
}
