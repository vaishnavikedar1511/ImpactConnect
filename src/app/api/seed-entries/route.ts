/**
 * Seed Entries API Route
 * Creates sample opportunity entries using Management API
 * 
 * Usage: Visit http://localhost:3000/api/seed-entries in your browser
 */

import { NextResponse } from 'next/server';

const ENTRIES = [
  {
    title: "Beach Cleanup Drive at Juhu",
    slug: "beach-cleanup-juhu",
    summary: "Join us for a morning beach cleanup at Juhu Beach. Help remove plastic waste.",
    status: "upcoming",
    is_virtual: false,
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    cause_slugs: ["environment"],
    contribution_types: ["physical_effort", "time"],
    start_date: "2026-02-15",
    start_time: "07:00",
    end_time: "10:00",
    organizer_name: "Clean Seas Foundation",
    organizer_email: "volunteer@cleanseas.org",
    spots_available: 50
  },
  {
    title: "Teaching English to Children",
    slug: "teach-english-dharavi",
    summary: "Volunteer as an English teacher for children in Dharavi.",
    status: "ongoing",
    is_virtual: false,
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    cause_slugs: ["education"],
    contribution_types: ["skills", "time"],
    start_date: "2026-01-01",
    organizer_name: "Teach India Foundation",
    organizer_email: "info@teachindia.org",
    spots_available: 20
  },
  {
    title: "Blood Donation Camp",
    slug: "blood-donation-bangalore",
    summary: "Donate blood and save lives. One donation can save up to 3 lives!",
    status: "upcoming",
    is_virtual: false,
    country: "India",
    state: "Karnataka",
    city: "Bangalore",
    cause_slugs: ["healthcare"],
    contribution_types: ["resources"],
    start_date: "2026-02-20",
    organizer_name: "Red Cross Society",
    organizer_email: "bangalore@redcross.in",
    spots_available: 100
  },
  {
    title: "Animal Shelter Volunteering",
    slug: "animal-shelter-pune",
    summary: "Spend time with rescued animals at our shelter.",
    status: "ongoing",
    is_virtual: false,
    country: "India",
    state: "Maharashtra",
    city: "Pune",
    cause_slugs: ["animal-welfare"],
    contribution_types: ["physical_effort", "time"],
    start_date: "2026-01-01",
    organizer_name: "PAWS Animal Welfare",
    organizer_email: "volunteer@pawspune.org",
    spots_available: 30
  },
  {
    title: "Tree Plantation Drive",
    slug: "tree-plantation-delhi",
    summary: "Plant trees and help combat air pollution in Delhi NCR.",
    status: "upcoming",
    is_virtual: false,
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    cause_slugs: ["environment"],
    contribution_types: ["physical_effort", "time"],
    start_date: "2026-03-01",
    organizer_name: "Green Delhi Initiative",
    organizer_email: "contact@greendelhi.org",
    spots_available: 200
  },
  {
    title: "Free Health Checkup Camp",
    slug: "health-checkup-chennai",
    summary: "Volunteer doctors and nurses needed for a free health camp.",
    status: "upcoming",
    is_virtual: false,
    country: "India",
    state: "Tamil Nadu",
    city: "Chennai",
    cause_slugs: ["healthcare"],
    contribution_types: ["skills", "time"],
    start_date: "2026-02-28",
    organizer_name: "Healthcare For All",
    organizer_email: "healthcamp@hfa.org.in",
    spots_available: 40
  },
  {
    title: "Online Mentorship Program",
    slug: "online-mentorship-program",
    summary: "Mentor first-generation college students online.",
    status: "ongoing",
    is_virtual: true,
    country: "",
    state: "",
    city: "",
    cause_slugs: ["education"],
    contribution_types: ["skills", "time"],
    start_date: "2026-01-15",
    organizer_name: "Career Catalyst",
    organizer_email: "mentors@careercatalyst.in",
    spots_available: 100
  },
  {
    title: "Food Distribution Drive",
    slug: "food-distribution-hyderabad",
    summary: "Help distribute meals to homeless individuals in Hyderabad.",
    status: "ongoing",
    is_virtual: false,
    country: "India",
    state: "Telangana",
    city: "Hyderabad",
    cause_slugs: ["healthcare"],
    contribution_types: ["physical_effort", "time", "resources"],
    start_date: "2026-01-05",
    organizer_name: "Feeding Hope",
    organizer_email: "volunteer@feedinghope.org",
    spots_available: 25
  },
  {
    title: "Coastal Cleanup Goa",
    slug: "coastal-cleanup-goa",
    summary: "Clean Goa beaches and learn about marine conservation.",
    status: "upcoming",
    is_virtual: false,
    country: "India",
    state: "Goa",
    city: "Calangute",
    cause_slugs: ["environment"],
    contribution_types: ["physical_effort", "time"],
    start_date: "2026-03-15",
    organizer_name: "Ocean Warriors Goa",
    organizer_email: "events@oceanwarriorsgoa.org",
    spots_available: 60
  },
  {
    title: "Stray Dog Vaccination Drive",
    slug: "stray-dog-vaccination-jaipur",
    summary: "Help catch and vaccinate stray dogs in Jaipur.",
    status: "upcoming",
    is_virtual: false,
    country: "India",
    state: "Rajasthan",
    city: "Jaipur",
    cause_slugs: ["animal-welfare", "healthcare"],
    contribution_types: ["physical_effort", "time"],
    start_date: "2026-02-08",
    organizer_name: "Animal Aid Jaipur",
    organizer_email: "vaccination@animalaidjaipur.org",
    spots_available: 15
  }
];

async function createEntry(entry: typeof ENTRIES[0]) {
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const token = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
  
  const response = await fetch(
    'https://api.contentstack.io/v3/content_types/opportunity/entries?locale=en-us',
    {
      method: 'POST',
      headers: {
        'api_key': apiKey!,
        'authorization': token!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entry }),
    }
  );
  
  const result = await response.json();
  return { 
    success: response.ok, 
    title: entry.title,
    uid: result.entry?.uid,
    error: result.error_message 
  };
}

async function publishEntry(uid: string) {
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const token = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
  
  await fetch(
    `https://api.contentstack.io/v3/content_types/opportunity/entries/${uid}/publish`,
    {
      method: 'POST',
      headers: {
        'api_key': apiKey!,
        'authorization': token!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          environments: ['production'],
          locales: ['en-us']
        }
      }),
    }
  );
}

export async function GET() {
  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const token = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
  
  if (!apiKey || !token) {
    return NextResponse.json({ 
      error: 'Missing CONTENTSTACK_API_KEY or CONTENTSTACK_MANAGEMENT_TOKEN' 
    }, { status: 500 });
  }
  
  const results = [];
  
  for (const entry of ENTRIES) {
    const result = await createEntry(entry);
    results.push(result);
    
    // Publish if created successfully
    if (result.success && result.uid) {
      await publishEntry(result.uid);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  return NextResponse.json({
    message: `Created ${successful.length} entries, ${failed.length} failed`,
    successful: successful.map(r => r.title),
    failed: failed.map(r => ({ title: r.title, error: r.error }))
  });
}
