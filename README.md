# ImpactConnect

A content-driven social impact discovery platform built with Next.js and Contentstack.

## Overview

ImpactConnect helps users discover volunteering opportunities, donation drives, and community service initiatives. Users browse **opportunities first** (not organizations), filtering by location, contribution type, cause, and time.

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **CMS**: Contentstack (headless)
- **Styling**: CSS Modules with CSS custom properties
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Contentstack account with configured content types

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Fill in your Contentstack credentials in .env.local
```

### Environment Variables

```bash
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_ENVIRONMENT=development
CONTENTSTACK_REGION=na  # na, eu, azure-na, azure-eu
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── opportunities/ # Opportunity search API
│   ├── opportunities/     # Opportunities listing page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (redirects to /opportunities)
│   └── globals.css        # Global styles & CSS variables
│
├── components/
│   └── opportunities/     # Opportunity-related components
│       ├── OpportunityCard.tsx
│       ├── OpportunityFilters.tsx
│       ├── OpportunityList.tsx
│       ├── LocationSelector.tsx
│       └── OpportunitiesPageClient.tsx
│
├── lib/
│   ├── contentstack/      # CMS integration layer
│   │   ├── client.ts      # REST API client
│   │   ├── config.ts      # Configuration
│   │   ├── opportunities.ts
│   │   ├── taxonomies.ts
│   │   ├── queries.ts
│   │   └── transformers.ts
│   │
│   └── utils/             # Utility functions
│       ├── dates.ts       # Date formatting & filtering
│       └── index.ts
│
└── types/                 # TypeScript definitions
    ├── enums.ts
    ├── common.ts
    ├── taxonomy.ts
    ├── organizer.ts
    ├── opportunity.ts
    └── index.ts
```

## Key Features

### Opportunity Discovery
- **Location-first browsing**: Users select a location before seeing opportunities
- **Multi-filter support**: Contribution type, cause, and time filters
- **Virtual opportunities**: Browse remote/online opportunities

### Filtering Options
- **Contribution Types**: Physical Effort, Skills, Resources, Time
- **Causes**: Education, Health, Environment, etc.
- **Time**: Today, Tomorrow, This Weekend, This Week, This Month

### UI/UX
- Responsive grid layout
- Accessible components with ARIA attributes
- Dark mode support via CSS custom properties
- Skeleton loading states

## Contentstack Setup

### Required Content Types

1. **Opportunity** (opportunity)
   - title, slug, summary, description
   - organizer (reference)
   - causes (reference, multiple)
   - location (reference)
   - contribution_types (select, multiple)
   - start_date, end_date, start_time, end_time
   - registration (modular block)
   - status, is_featured, is_virtual

2. **Organizer** (organizer)
   - name, slug, type, description
   - contact info, locations

3. **Cause** (cause)
   - name, slug, description, icon

4. **Location** (location)
   - name, slug, type, parent_location

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## MVP Scope

This MVP does **not** include:
- User authentication/accounts
- Payment processing
- Social features (likes, comments, sharing)

These features can be added in future iterations.

## License

Private - All rights reserved.
