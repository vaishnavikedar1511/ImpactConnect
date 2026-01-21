# Contentstack Personalize Integration Guide

## Overview

Contentstack Personalize allows you to:
- **Personalize content** based on user attributes (location, interests, behavior)
- **A/B test** different content variations
- **Target specific user segments** with tailored messaging
- **Track performance** of personalized content

## Use Cases for ImpactConnect

### 1. **Personalized Hero Section**
- Show location-specific opportunities in hero
- Display cause-based messaging based on user interests
- A/B test different CTAs ("Join Now" vs "Discover Opportunities")

### 2. **Personalized Opportunity Recommendations**
- Show opportunities near user's location
- Prioritize causes user has shown interest in
- Display opportunities matching user's contribution preferences

### 3. **Personalized Announcement Banners**
- Show location-specific announcements
- Display cause-specific campaigns
- Target new vs returning users

### 4. **Personalized Footer/CTA**
- Show different CTAs based on user engagement level
- Display relevant social links based on user location

## Setup Steps

### Step 1: Enable Personalize in Contentstack

1. Go to your Contentstack stack
2. Navigate to **Settings** → **Personalize**
3. Enable Personalize for your stack
4. Note your **Personalize API Key** (different from Delivery Token)

### Step 2: Create User Segments

Create segments in Contentstack Personalize:
- **Location-based**: "Mumbai Users", "Delhi Users", etc.
- **Interest-based**: "Education Enthusiasts", "Environment Advocates"
- **Behavior-based**: "New Visitors", "Returning Users", "Active Volunteers"

### Step 3: Create Personalized Content Types

Add Personalize fields to your content types:
- Landing Page: Add personalized hero variations
- Opportunities: Add personalized descriptions
- Announcement Banner: Add segment-specific messages

### Step 4: Install Required Packages

```bash
npm install @contentstack/personalize
```

### Step 5: Configure Environment Variables

Add to `.env.local`:
```env
# Contentstack Personalize
CONTENTSTACK_PERSONALIZE_API_KEY=your_personalize_api_key
CONTENTSTACK_PERSONALIZE_ENVIRONMENT=production
```

## Implementation

See `src/lib/contentstack/personalize.ts` for the implementation.

## Usage Examples

### Example 1: Personalized Hero Section

```tsx
import { getPersonalizedContent } from '@/lib/contentstack/personalize';

export default async function LandingPage() {
  // Get user attributes (from cookies, session, etc.)
  const userAttributes = {
    city: 'Mumbai',
    interests: ['education', 'environment'],
    userType: 'returning'
  };

  const content = await getPersonalizedContent('landing_page', userAttributes);
  
  return (
    <div>
      <h1>{content.hero_title}</h1>
      {/* Personalized content */}
    </div>
  );
}
```

### Example 2: Personalized Opportunities

```tsx
import { getPersonalizedOpportunities } from '@/lib/contentstack/personalize';

export default async function OpportunitiesPage() {
  const userAttributes = {
    city: 'Mumbai',
    preferredCauses: ['education', 'healthcare']
  };

  const opportunities = await getPersonalizedOpportunities(userAttributes);
  
  return (
    <div>
      {opportunities.map(opp => (
        <OpportunityCard key={opp.uid} opportunity={opp} />
      ))}
    </div>
  );
}
```

### Example 3: Client-Side Personalization

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getPersonalizedContent } from '@/lib/contentstack/personalize';

export function PersonalizedBanner() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    // Get user attributes from localStorage, cookies, etc.
    const userAttributes = {
      city: localStorage.getItem('userCity'),
      interests: JSON.parse(localStorage.getItem('interests') || '[]')
    };

    getPersonalizedContent('announcement_banner', userAttributes)
      .then(setContent);
  }, []);

  if (!content) return null;

  return <div>{content.message}</div>;
}
```

## User Attributes

Common attributes to track:

```typescript
interface UserAttributes {
  // Location
  city?: string;
  state?: string;
  country?: string;
  
  // Interests
  interests?: string[]; // ['education', 'environment', 'healthcare']
  preferredCauses?: string[];
  
  // Behavior
  userType?: 'new' | 'returning' | 'active';
  registrationCount?: number;
  lastVisitDate?: string;
  
  // Demographics (if available)
  age?: number;
  language?: string;
}
```

## Best Practices

1. **Start Small**: Begin with one personalized component (e.g., hero section)
2. **Track User Attributes**: Store user preferences in localStorage or cookies
3. **Fallback Content**: Always provide default content if personalization fails
4. **Performance**: Cache personalized content appropriately
5. **Privacy**: Only collect necessary user attributes

## Testing

1. **Test with Different Segments**: Verify content changes based on user attributes
2. **Test Fallbacks**: Ensure default content shows when personalization unavailable
3. **Monitor Performance**: Check API response times and cache effectiveness

## Next Steps

1. Enable Personalize in your Contentstack stack
2. Create user segments
3. Add Personalize fields to content types
4. Implement the personalize utility (see `src/lib/contentstack/personalize.ts`)
5. Start with one component (e.g., hero section)
6. Expand to other components gradually
