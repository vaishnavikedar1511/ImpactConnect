/**
 * Contentstack Seed Script
 * Creates sample entries using the Management API
 * 
 * Usage:
 * 1. Get your Management Token from Contentstack: Settings → Tokens → Management Tokens
 * 2. Run: CONTENTSTACK_API_KEY=xxx CONTENTSTACK_MANAGEMENT_TOKEN=xxx node scripts/seed-contentstack.js
 */

const API_KEY = process.env.CONTENTSTACK_API_KEY;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const REGION = process.env.CONTENTSTACK_REGION || 'us'; // 'us', 'eu', 'azure-na', 'azure-eu'

// Set base URL based on region
const BASE_URLS = {
  'us': 'https://api.contentstack.io',
  'eu': 'https://eu-api.contentstack.io',
  'azure-na': 'https://azure-na-api.contentstack.io',
  'azure-eu': 'https://azure-eu-api.contentstack.io'
};

const BASE_URL = BASE_URLS[REGION] || BASE_URLS['us'];

if (!API_KEY || !MANAGEMENT_TOKEN) {
  console.error('❌ Missing required environment variables!');
  console.error('Please set: CONTENTSTACK_API_KEY and CONTENTSTACK_MANAGEMENT_TOKEN');
  console.error('\nUsage:');
  console.error('CONTENTSTACK_API_KEY=xxx CONTENTSTACK_MANAGEMENT_TOKEN=xxx node scripts/seed-contentstack.js');
  process.exit(1);
}

// Store created entry UIDs for references
const createdEntries = {
  locations: {},
  causes: {},
  organizers: {}
};

// ===================
// SAMPLE DATA
// ===================

const locations = [
  {
    name: 'Mumbai',
    slug: 'mumbai',
    type: 'city',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
    is_popular: true,
    display_order: 1
  },
  {
    name: 'Bangalore',
    slug: 'bangalore',
    type: 'city',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 'Asia/Kolkata',
    is_popular: true,
    display_order: 2
  },
  {
    name: 'Virtual / Remote',
    slug: 'virtual',
    type: 'virtual',
    is_popular: true,
    display_order: 3
  }
];

const causes = [
  {
    name: 'Education',
    slug: 'education',
    description: 'Empowering communities through literacy, tutoring, and educational access programs',
    color: '#4F46E5',
    display_order: 1
  },
  {
    name: 'Environment',
    slug: 'environment',
    description: 'Protecting our planet through conservation, clean-ups, and sustainability initiatives',
    color: '#059669',
    display_order: 2
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    description: 'Improving health outcomes through medical camps, awareness, and support programs',
    color: '#DC2626',
    display_order: 3
  },
  {
    name: 'Animal Welfare',
    slug: 'animal-welfare',
    description: 'Caring for animals through rescue, shelter support, and adoption drives',
    color: '#D97706',
    display_order: 4
  }
];

const organizers = [
  {
    name: 'Green Earth Foundation',
    slug: 'green-earth-foundation',
    type: 'ngo',
    tagline: 'Building a sustainable future, one tree at a time',
    description: 'Green Earth Foundation is a non-profit organization dedicated to environmental conservation and sustainability. We organize tree plantation drives, beach clean-ups, and awareness campaigns across India.',
    contact_email: 'contact@greenearthfoundation.org',
    contact_phone: '+91 98765 43210',
    website: 'https://greenearthfoundation.org',
    instagram: 'https://instagram.com/greenearthfoundation',
    location_slugs: ['mumbai', 'bangalore'],
    verification_status: 'verified',
    founded_year: 2015,
    focus_areas: ['Tree Plantation', 'Beach Cleanup', 'Sustainability Education']
  },
  {
    name: 'Teach For Tomorrow',
    slug: 'teach-for-tomorrow',
    type: 'ngo',
    tagline: 'Every child deserves quality education',
    description: 'Teach For Tomorrow connects passionate volunteers with underprivileged children to provide free tutoring, mentorship, and educational resources. Join us in bridging the education gap.',
    contact_email: 'hello@teachfortomorrow.in',
    contact_phone: '+91 87654 32109',
    website: 'https://teachfortomorrow.in',
    location_slugs: ['mumbai', 'virtual'],
    verification_status: 'verified',
    founded_year: 2018,
    focus_areas: ['Tutoring', 'Mentorship', 'School Supplies']
  },
  {
    name: 'Paws & Hearts',
    slug: 'paws-and-hearts',
    type: 'community_group',
    tagline: 'Giving strays a second chance at life',
    description: 'A community-driven initiative focused on rescuing, rehabilitating, and rehoming stray animals. We organize adoption camps, vaccination drives, and feeding programs.',
    contact_email: 'pawsandhearts@gmail.com',
    contact_phone: '+91 76543 21098',
    instagram: 'https://instagram.com/pawsandhearts',
    location_slugs: ['bangalore'],
    verification_status: 'verified',
    founded_year: 2020,
    focus_areas: ['Animal Rescue', 'Adoption', 'Vaccination Drives']
  }
];

const opportunities = [
  {
    title: 'Beach Cleanup Drive - Juhu',
    slug: 'beach-cleanup-juhu-jan-2026',
    summary: 'Join us for a morning beach cleanup at Juhu Beach. Help remove plastic waste and make our beaches cleaner for everyone.',
    description: "Be part of our monthly beach cleanup initiative! We'll provide gloves, bags, and refreshments. This is a great opportunity for families, students, and corporate groups to contribute to a cleaner environment. No prior experience needed - just bring your enthusiasm and comfortable clothes!",
    organizer_slug: 'green-earth-foundation',
    cause_slugs: ['environment'],
    location_slug: 'mumbai',
    contribution_types: ['physical_effort', 'time'],
    start_date: '2026-01-25',
    end_date: '2026-01-25',
    start_time: '06:30',
    end_time: '09:30',
    duration: '3 hours',
    is_virtual: false,
    street_address: 'Juhu Beach, near SNDT College entrance',
    landmark: 'Opposite JW Marriott',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postal_code: '400049',
    spots_available: 45,
    total_spots: 50,
    requirements: ['Comfortable clothes', 'Sunscreen', 'Water bottle'],
    minimum_age: 12,
    registration_label: 'Join the Cleanup',
    registration_type: 'form',
    status: 'upcoming',
    is_featured: true,
    keywords: ['beach', 'cleanup', 'environment', 'volunteering', 'juhu']
  },
  {
    title: 'Weekend Tutoring - Math & Science',
    slug: 'weekend-tutoring-math-science',
    summary: 'Volunteer to teach Math and Science to underprivileged children every weekend. Make a lasting impact on young minds.',
    description: "We're looking for dedicated volunteers to teach Math and Science to children from low-income families. Sessions are held every Saturday and Sunday at our community center. You'll be working with children aged 10-15 years. Teaching materials and lesson plans are provided - you just need to bring patience and passion!",
    organizer_slug: 'teach-for-tomorrow',
    cause_slugs: ['education'],
    location_slug: 'mumbai',
    contribution_types: ['skills', 'time'],
    start_date: '2026-02-01',
    end_date: '2026-03-31',
    start_time: '10:00',
    end_time: '12:30',
    duration: '2.5 hours per session',
    is_recurring: true,
    recurrence_pattern: 'Every Saturday and Sunday',
    is_virtual: false,
    street_address: 'Dharavi Community Center, 90 Feet Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postal_code: '400017',
    spots_available: 8,
    total_spots: 10,
    requirements: ['Basic teaching skills', 'Commitment for at least 4 weeks'],
    skills_needed: ['Mathematics', 'Science', 'Patience with children'],
    minimum_age: 18,
    registration_label: 'Become a Tutor',
    registration_type: 'form',
    status: 'upcoming',
    is_featured: true,
    keywords: ['teaching', 'tutoring', 'education', 'math', 'science', 'volunteer']
  },
  {
    title: 'Virtual Career Mentorship Program',
    slug: 'virtual-career-mentorship',
    summary: 'Guide college students from underprivileged backgrounds through virtual 1-on-1 mentorship sessions. Flexible timing, big impact.',
    description: "Share your professional experience with first-generation college students! As a mentor, you'll help students with career guidance, resume building, interview preparation, and professional networking. Sessions are conducted online via Zoom - you can mentor from anywhere. Commitment: 2 hours per week for 3 months.",
    organizer_slug: 'teach-for-tomorrow',
    cause_slugs: ['education'],
    location_slug: 'virtual',
    contribution_types: ['skills', 'time'],
    start_date: '2026-02-15',
    end_date: '2026-05-15',
    duration: '2 hours per week',
    is_recurring: true,
    recurrence_pattern: 'Weekly - flexible scheduling',
    is_virtual: true,
    venue_notes: 'Sessions conducted via Zoom. Link shared after registration.',
    spots_available: 20,
    total_spots: 25,
    requirements: ['Minimum 3 years professional experience', 'Laptop with webcam'],
    skills_needed: ['Career counseling', 'Communication', 'Industry knowledge'],
    minimum_age: 25,
    registration_label: 'Become a Mentor',
    registration_type: 'form',
    status: 'upcoming',
    is_featured: true,
    keywords: ['mentorship', 'career', 'virtual', 'online', 'guidance']
  },
  {
    title: 'Stray Dog Vaccination Camp',
    slug: 'stray-dog-vaccination-bangalore',
    summary: 'Help us vaccinate stray dogs in Koramangala. Volunteers needed for catching, holding, and post-care monitoring.',
    description: 'Join our monthly vaccination drive to protect stray dogs from rabies and other diseases. We need volunteers to help identify strays, assist the veterinary team during vaccination, and provide post-vaccination care. Training will be provided on the spot. This is a rewarding experience for animal lovers!',
    organizer_slug: 'paws-and-hearts',
    cause_slugs: ['animal-welfare', 'healthcare'],
    location_slug: 'bangalore',
    contribution_types: ['physical_effort', 'time'],
    start_date: '2026-02-08',
    end_date: '2026-02-08',
    start_time: '07:00',
    end_time: '12:00',
    duration: '5 hours',
    is_virtual: false,
    street_address: 'Koramangala 4th Block, Near BDA Complex',
    landmark: 'Behind Forum Mall',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postal_code: '560034',
    spots_available: 12,
    total_spots: 15,
    requirements: ['Comfortable with dogs', 'Closed shoes', 'Full-sleeve clothes'],
    minimum_age: 16,
    age_notes: 'Under 18 requires parent/guardian consent',
    registration_label: 'Volunteer Now',
    registration_type: 'form',
    status: 'upcoming',
    is_featured: false,
    keywords: ['dogs', 'vaccination', 'animal welfare', 'stray', 'volunteer']
  },
  {
    title: 'Tree Plantation Drive - Cubbon Park',
    slug: 'tree-plantation-cubbon-park',
    summary: "Plant native trees in Cubbon Park and help increase Bangalore's green cover. Saplings and tools provided.",
    description: "Join Green Earth Foundation for our flagship tree plantation event! We'll be planting 500 native saplings in and around Cubbon Park. All materials including saplings, spades, and water will be provided. Participants will receive a certificate of participation. Great opportunity for schools, colleges, and corporate CSR activities!",
    organizer_slug: 'green-earth-foundation',
    cause_slugs: ['environment'],
    location_slug: 'bangalore',
    contribution_types: ['physical_effort', 'time'],
    start_date: '2026-02-15',
    end_date: '2026-02-15',
    start_time: '06:00',
    end_time: '10:00',
    duration: '4 hours',
    is_virtual: false,
    street_address: 'Cubbon Park, Main Entrance Gate',
    landmark: 'Near Bangalore Aquarium',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postal_code: '560001',
    spots_available: 85,
    total_spots: 100,
    requirements: ['Gardening gloves (optional)', 'Sunscreen', 'Hat', 'Water bottle'],
    minimum_age: 10,
    age_notes: 'Children under 14 must be accompanied by an adult',
    registration_label: 'Plant a Tree',
    registration_type: 'form',
    status: 'upcoming',
    is_featured: true,
    keywords: ['trees', 'plantation', 'environment', 'green', 'cubbon park']
  }
];

// ===================
// API FUNCTIONS
// ===================

async function createEntry(contentType, entry) {
  const response = await fetch(`${BASE_URL}/v3/content_types/${contentType}/entries?locale=en-us`, {
    method: 'POST',
    headers: {
      'api_key': API_KEY,
      'authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ entry })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to create ${contentType}: ${JSON.stringify(data)}`);
  }
  
  return data.entry;
}

async function publishEntry(contentType, entryUid) {
  const response = await fetch(`${BASE_URL}/v3/content_types/${contentType}/entries/${entryUid}/publish`, {
    method: 'POST',
    headers: {
      'api_key': API_KEY,
      'authorization': MANAGEMENT_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      entry: {
        environments: ['production'],
        locales: ['en-us']
      }
    })
  });

  if (!response.ok) {
    const data = await response.json();
    console.warn(`⚠️  Could not publish ${contentType}/${entryUid}: ${JSON.stringify(data)}`);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================
// SEED FUNCTIONS
// ===================

async function seedLocations() {
  console.log('\n📍 Creating Locations...');
  
  for (const location of locations) {
    try {
      const created = await createEntry('location', location);
      createdEntries.locations[location.slug] = created.uid;
      console.log(`  ✅ Created: ${location.name}`);
      
      await publishEntry('location', created.uid);
      await delay(500); // Rate limiting
    } catch (error) {
      console.error(`  ❌ Failed: ${location.name} - ${error.message}`);
    }
  }
}

async function seedCauses() {
  console.log('\n🎯 Creating Causes...');
  
  for (const cause of causes) {
    try {
      const created = await createEntry('cause', cause);
      createdEntries.causes[cause.slug] = created.uid;
      console.log(`  ✅ Created: ${cause.name}`);
      
      await publishEntry('cause', created.uid);
      await delay(500);
    } catch (error) {
      console.error(`  ❌ Failed: ${cause.name} - ${error.message}`);
    }
  }
}

async function seedOrganizers() {
  console.log('\n🏢 Creating Organizers...');
  
  for (const organizer of organizers) {
    try {
      // Convert location slugs to references if reference field exists
      const entryData = { ...organizer };
      
      // If you have reference fields, convert slugs to UIDs
      if (organizer.location_slugs && createdEntries.locations) {
        entryData.locations = organizer.location_slugs
          .map(slug => createdEntries.locations[slug])
          .filter(Boolean)
          .map(uid => ({ uid, _content_type_uid: 'location' }));
      }
      
      const created = await createEntry('organizer', entryData);
      createdEntries.organizers[organizer.slug] = created.uid;
      console.log(`  ✅ Created: ${organizer.name}`);
      
      await publishEntry('organizer', created.uid);
      await delay(500);
    } catch (error) {
      console.error(`  ❌ Failed: ${organizer.name} - ${error.message}`);
    }
  }
}

async function seedOpportunities() {
  console.log('\n🌟 Creating Opportunities...');
  
  for (const opportunity of opportunities) {
    try {
      const entryData = { ...opportunity };
      
      // Convert organizer slug to reference if reference field exists
      if (opportunity.organizer_slug && createdEntries.organizers[opportunity.organizer_slug]) {
        entryData.organizer = [{
          uid: createdEntries.organizers[opportunity.organizer_slug],
          _content_type_uid: 'organizer'
        }];
      }
      
      // Convert location slug to reference
      if (opportunity.location_slug && createdEntries.locations[opportunity.location_slug]) {
        entryData.location = [{
          uid: createdEntries.locations[opportunity.location_slug],
          _content_type_uid: 'location'
        }];
      }
      
      // Convert cause slugs to references
      if (opportunity.cause_slugs && createdEntries.causes) {
        entryData.causes = opportunity.cause_slugs
          .map(slug => createdEntries.causes[slug])
          .filter(Boolean)
          .map(uid => ({ uid, _content_type_uid: 'cause' }));
      }
      
      const created = await createEntry('opportunity', entryData);
      console.log(`  ✅ Created: ${opportunity.title}`);
      
      await publishEntry('opportunity', created.uid);
      await delay(500);
    } catch (error) {
      console.error(`  ❌ Failed: ${opportunity.title} - ${error.message}`);
    }
  }
}

// ===================
// MAIN
// ===================

async function main() {
  console.log('🚀 Starting Contentstack Seed...');
  console.log(`📡 API Base: ${BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
  
  try {
    await seedLocations();
    await seedCauses();
    await seedOrganizers();
    await seedOpportunities();
    
    console.log('\n✨ Seeding complete!');
    console.log('\nCreated entries:');
    console.log(`  - Locations: ${Object.keys(createdEntries.locations).length}`);
    console.log(`  - Causes: ${Object.keys(createdEntries.causes).length}`);
    console.log(`  - Organizers: ${Object.keys(createdEntries.organizers).length}`);
    console.log(`  - Opportunities: ${opportunities.length}`);
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

main();
