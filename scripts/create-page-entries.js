/**
 * Script to create entries for singleton page content types
 * Run with: node scripts/create-page-entries.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const CONTENTSTACK_API_KEY = process.env.CONTENTSTACK_API_KEY;
const CONTENTSTACK_MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const CONTENTSTACK_ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT || 'development';

// Determine API host based on region
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
  console.log(`   Environment: ${CONTENTSTACK_ENVIRONMENT}`);
}

async function createEntry(contentTypeUid, entryData, title) {
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
      console.log(`✅ Created ${title} (${contentTypeUid})`);
      return data.entry;
    } else if (data.error_code === 119) {
      console.log(`⏭️  Skipped ${title} - entry already exists`);
      return null;
    } else {
      console.error(`❌ Failed to create ${title}:`, data.error_message || data);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating ${title}:`, error.message);
    return null;
  }
}

async function publishEntry(contentTypeUid, entryUid, title) {
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
      console.log(`   📤 Published ${title}`);
      return true;
    } else {
      const data = await response.json();
      console.error(`   ⚠️  Failed to publish ${title}:`, data.error_message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error(`   ⚠️  Error publishing ${title}:`, error.message);
    return false;
  }
}

// Entry data for each singleton content type
const entries = [
  {
    contentType: 'landing_page',
    title: 'Landing Page',
    data: {
      hero_title: 'Make an {Impact} in Your Community',
      hero_subtitle: 'Discover volunteer opportunities, connect with causes you care about, and create meaningful change in your city.',
      primary_cta_text: 'Discover Opportunities',
      primary_cta_link: '/opportunities',
      secondary_cta_text: 'Create an Event',
      secondary_cta_link: '/create-event',
      stats_json: JSON.stringify([
        { number: '500+', label: 'Volunteers' },
        { number: '50+', label: 'Events' },
        { number: '20+', label: 'Cities' },
        { number: '4', label: 'Causes' },
      ]),
      how_it_works_title: 'How It Works',
      steps_json: JSON.stringify([
        { title: 'Discover', description: 'Browse opportunities by location, cause, or contribution type' },
        { title: 'Register', description: 'Sign up for events that match your interests and availability' },
        { title: 'Contribute', description: 'Show up, make an impact, and connect with your community' },
      ]),
      causes_title: 'Causes We Support',
      causes_json: JSON.stringify([
        { icon: '📚', name: 'Education', description: 'Teaching, mentoring, skill development', slug: 'education' },
        { icon: '🌱', name: 'Environment', description: 'Cleanups, tree plantation, conservation', slug: 'environment' },
        { icon: '🏥', name: 'Healthcare', description: 'Health camps, blood donation, awareness', slug: 'healthcare' },
        { icon: '🐾', name: 'Animal Welfare', description: 'Shelter support, rescue, care', slug: 'animal-welfare' },
      ]),
      cta_title: 'Ready to Make a Difference?',
      cta_description: 'Join thousands of volunteers creating positive change every day.',
      cta_button_text: 'Get Started',
      cta_button_link: '/opportunities',
    },
  },
  {
    contentType: 'discover_page',
    title: 'Discover Page',
    data: {
      page_title: 'Discover Opportunities',
      page_description: 'Discover volunteering, donation drives, and community service opportunities. Filter by location, cause, and contribution type.',
      subtitle_all: 'Showing all opportunities. Apply filters to narrow results.',
      search_placeholder: 'Search opportunities... e.g., "tree plantation pune" or "online teaching"',
      filters_title: 'Filters',
      location_filter_label: 'Location',
      virtual_label: 'Virtual / Remote',
      clear_filters_text: 'Clear All Filters',
      sort_options_json: JSON.stringify([
        { value: 'date_asc', label: 'Date (Earliest)' },
        { value: 'date_desc', label: 'Date (Latest)' },
        { value: 'relevance', label: 'Relevance' },
        { value: 'spots_available', label: 'Spots Available' },
      ]),
      empty_title: 'No opportunities found',
      empty_message: 'We could not find any opportunities matching your criteria. Try adjusting your filters or check back later.',
      loading_text: 'Finding opportunities...',
      info_banner_text: 'Showing all opportunities. Use the filters to narrow your search.',
    },
  },
  {
    contentType: 'create_event_page',
    title: 'Create Event Page',
    data: {
      page_title: 'Create an Event',
      page_subtitle: 'Submit your event for review. Once approved, it will be visible to the community.',
      section_details_title: 'Event Details',
      section_location_title: 'Location',
      virtual_label: 'This is a virtual/remote event',
      section_categories_title: 'Categories',
      section_datetime_title: 'Date & Time',
      section_contact_title: 'Contact Information',
      section_additional_title: 'Additional Information',
      submit_button_text: 'Submit Event for Review',
      submitting_text: 'Submitting...',
      success_icon: '🎉',
      success_title: 'Event Submitted!',
      success_message: 'Thank you for submitting your event. Our team will review it shortly. Once approved, it will appear in the Discover section.',
      success_button_text: 'Browse Opportunities',
      success_button_link: '/opportunities',
      field_labels_json: JSON.stringify({
        title: 'Event Title',
        summary: 'Short Summary',
        description: 'Full Description',
        cover_image: 'Cover Image',
        country: 'Country',
        state: 'State / Province',
        city: 'City',
        address: 'Street Address / Venue',
        causes: 'Cause(s)',
        contribution_types: 'Contribution Type(s)',
        start_date: 'Start Date',
        end_date: 'End Date',
        start_time: 'Start Time',
        end_time: 'End Time',
        email: 'Contact Email',
        organizer_name: 'Organization / Your Name',
        spots: 'Available Spots',
        requirements: 'Requirements / Notes',
      }),
      field_placeholders_json: JSON.stringify({
        title: 'e.g., Beach Cleanup Drive at Juhu',
        summary: 'Briefly describe your event (shown in listings)',
        description: 'Provide detailed information about the event...',
        address: 'e.g., Central Park, Near Main Gate',
        email: 'you@example.com',
        organizer_name: 'e.g., Green Earth Foundation',
        spots: 'e.g., 50',
        requirements: 'e.g., Bring gloves, wear comfortable shoes...',
      }),
      validation_messages_json: JSON.stringify({
        title: 'Title must be at least 5 characters',
        summary: 'Summary must be at least 20 characters',
        country: 'Please select a country',
        causes: 'Please select at least one cause',
        contribution_types: 'Please select at least one contribution type',
        start_date: 'Start date is required',
        future_date: 'Start date must be in the future',
        email_required: 'Contact email is required',
        email_invalid: 'Please enter a valid email address',
      }),
    },
  },
  {
    contentType: 'my_events_page',
    title: 'My Events Page',
    data: {
      page_title: 'My Events',
      page_subtitle: 'Events you have created and submitted for approval',
      pending_title: 'Pending Approval',
      pending_description: 'These events are waiting for admin approval before they go live.',
      published_title: 'Published Events',
      published_description: 'Your events that are live and visible to volunteers.',
      empty_title: 'No Events Yet',
      empty_message: 'You have not created any events yet. Create your first event to start making an impact!',
      create_cta_text: 'Create Your First Event',
      create_cta_link: '/create-event',
    },
  },
  {
    contentType: 'my_registrations_page',
    title: 'My Registrations Page',
    data: {
      page_title: 'My Registrations',
      page_subtitle: 'Events you have registered for',
      upcoming_title: 'Upcoming Events',
      upcoming_description: 'Events you are registered for that have not happened yet.',
      past_title: 'Past Events',
      past_description: 'Events you have attended. Thank you for making a difference!',
      empty_title: 'No Registrations Yet',
      empty_message: 'You have not registered for any events yet. Explore opportunities and start making an impact!',
      browse_cta_text: 'Browse Opportunities',
      browse_cta_link: '/opportunities',
      confirmation_message: 'You are registered! Check your email for details.',
    },
  },
  {
    contentType: 'navbar',
    title: 'Navbar',
    data: {
      site_name: 'ImpactConnect',
      nav_links_json: JSON.stringify([
        { label: 'Discover', url: '/opportunities' },
        { label: 'About', url: '/about' },
        { label: 'FAQ', url: '/faq' },
      ]),
      cta_button_text: 'Create Event',
      cta_button_url: '/create-event',
      show_user_menu: true,
      my_registrations_label: 'My Registrations',
      my_events_label: 'My Events',
    },
  },
  {
    contentType: 'footer',
    title: 'Footer',
    data: {
      site_name: 'ImpactConnect',
      tagline: 'Connecting people with meaningful opportunities to create positive change.',
      links_json: JSON.stringify([
        { label: 'Discover Opportunities', url: '/opportunities' },
        { label: 'Create an Event', url: '/create-event' },
        { label: 'About Us', url: '/about' },
        { label: 'FAQ', url: '/faq' },
      ]),
      social_links_json: JSON.stringify([
        { platform: 'twitter', url: 'https://twitter.com/impactconnect', icon: '𝕏' },
        { platform: 'instagram', url: 'https://instagram.com/impactconnect', icon: '📷' },
        { platform: 'linkedin', url: 'https://linkedin.com/company/impactconnect', icon: '💼' },
      ]),
      copyright_text: '© 2026 ImpactConnect. All rights reserved.',
      show_newsletter: false,
    },
  },
  {
    contentType: 'announcement_banner',
    title: 'Announcement Banner',
    data: {
      enabled: false,
      message: 'Welcome to ImpactConnect! Start discovering volunteer opportunities today.',
      background_color: 'info',
      dismissible: true,
    },
  },
  {
    contentType: 'global_settings',
    title: 'Global Settings',
    data: {
      site_name: 'ImpactConnect',
      default_meta_title: 'ImpactConnect - Make an Impact in Your Community',
      default_meta_description: 'Discover volunteer opportunities, connect with causes you care about, and create meaningful change in your city.',
      enable_registration: true,
      enable_event_creation: true,
      maintenance_mode: false,
      contact_email: 'hello@impactconnect.org',
      support_email: 'support@impactconnect.org',
    },
  },
  {
    contentType: 'error_pages',
    title: 'Error Pages',
    data: {
      not_found_title: 'Page Not Found',
      not_found_message: 'The page you are looking for does not exist or has been moved.',
      not_found_button_text: 'Go to Homepage',
      not_found_button_url: '/',
      error_title: 'Something Went Wrong',
      error_message: 'We encountered an unexpected error. Please try again later.',
      error_button_text: 'Try Again',
      show_contact_on_error: true,
      contact_message: 'If this problem persists, please contact support.',
    },
  },
  {
    contentType: 'about_page',
    title: 'About Page',
    data: {
      page_title: 'About ImpactConnect',
      hero_subtitle: 'Connecting passionate individuals with meaningful opportunities to create positive change in their communities.',
      mission_title: 'Our Mission',
      mission_statement: 'We believe everyone has the power to make a difference. Our mission is to bridge the gap between those who want to help and organizations that need support, making it easier than ever to find and participate in meaningful volunteer opportunities.',
      story_title: 'Our Story',
      story_content: 'ImpactConnect was born from a simple observation: while countless people want to volunteer and give back, finding the right opportunities can be challenging. We created this platform to solve that problem, bringing together volunteers and organizations in one easy-to-use space.',
      impact_stats_json: JSON.stringify([
        { number: '500+', label: 'Volunteers Connected', icon: '🙌' },
        { number: '50+', label: 'Events Organized', icon: '📅' },
        { number: '20+', label: 'Cities Reached', icon: '🌍' },
        { number: '10K+', label: 'Hours Contributed', icon: '⏱️' },
      ]),
      values_title: 'Our Values',
      values_json: JSON.stringify([
        { title: 'Community', description: 'Fostering strong connections between volunteers and organizations.', icon: '🤝' },
        { title: 'Accessibility', description: 'Making volunteering easy and accessible for everyone.', icon: '♿' },
        { title: 'Impact', description: 'Focusing on meaningful, measurable positive change.', icon: '🎯' },
        { title: 'Transparency', description: 'Building trust through open communication.', icon: '💎' },
      ]),
      team_title: 'Meet Our Team',
      team_members_json: JSON.stringify([]),
      cta_title: 'Ready to Make an Impact?',
      cta_description: 'Join thousands of volunteers who are already making a difference in their communities.',
      cta_button_text: 'Explore Opportunities',
      cta_button_url: '/opportunities',
    },
  },
  {
    contentType: 'faq_page',
    title: 'FAQ Page',
    data: {
      page_title: 'Frequently Asked Questions',
      page_subtitle: 'Find answers to common questions about volunteering with ImpactConnect.',
      faqs_json: JSON.stringify([
        {
          question: 'How do I sign up for a volunteer opportunity?',
          answer: 'Browse our Discover page to find opportunities that interest you. Click on any event to see details, then click "Register" and fill in your information. You will receive a confirmation email with all the details.',
        },
        {
          question: 'Can I create my own volunteer event?',
          answer: 'Yes! Click "Create Event" in the navigation. Fill out the event details and submit for review. Once approved by our team, your event will appear in the Discover section.',
        },
        {
          question: 'Is ImpactConnect free to use?',
          answer: 'Yes, ImpactConnect is completely free for both volunteers and organizations. Our mission is to make volunteering accessible to everyone.',
        },
        {
          question: 'How do I cancel my registration?',
          answer: 'Go to "My Registrations" to see your upcoming events. Contact the organizer directly using the information provided in your confirmation email if you need to cancel.',
        },
        {
          question: 'What types of opportunities are available?',
          answer: 'We have a wide variety including physical volunteering (cleanups, building), skill-based (teaching, mentoring), resource donations, and virtual/remote opportunities you can do from home.',
        },
      ]),
      contact_title: 'Still Have Questions?',
      contact_description: 'Cannot find what you are looking for? Reach out to our support team.',
      contact_email: 'support@impactconnect.org',
      contact_button_text: 'Contact Us',
    },
  },
];

async function main() {
  console.log('\n🚀 Creating Contentstack Page Entries\n');
  console.log('='.repeat(50));
  
  validateConfig();
  console.log('');

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of entries) {
    const result = await createEntry(entry.contentType, entry.data, entry.title);
    
    if (result) {
      created++;
      // Publish the entry
      await publishEntry(entry.contentType, result.uid, entry.title);
    } else if (result === null) {
      // Could be skipped or failed - we logged it above
      skipped++;
    } else {
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('\n✨ Done!\n');
}

main().catch(console.error);
