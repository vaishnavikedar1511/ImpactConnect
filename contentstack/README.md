# Contentstack Content Models

This folder contains JSON schema definitions for all content types used in ImpactConnect.

## Content Types

| Content Type | UID | Description |
|-------------|-----|-------------|
| Opportunity | `opportunity` | Impact opportunities (volunteering, donation drives, etc.) |
| Organizer | `organizer` | NGOs, individuals, and community groups |
| Cause | `cause` | Categories like Education, Health, Environment |
| Location | `location` | Geographic hierarchy (Country → State → City → Area) |

## Importing Content Types

### Option 1: Manual Creation
Use these JSON files as reference to manually create content types in Contentstack.

### Option 2: Contentstack CLI

1. Install the Contentstack CLI:
```bash
npm install -g @contentstack/cli
```

2. Login to your stack:
```bash
csdx auth:login
csdx config:set:region <region>  # NA, EU, AZURE-NA, or AZURE-EU
```

3. Import content types:
```bash
csdx cm:stacks:import --stack-api-key <YOUR_API_KEY> --data-dir ./contentstack
```

### Option 3: Management API

Use the Contentstack Management API to create content types programmatically:

```bash
curl -X POST "https://api.contentstack.io/v3/content_types" \
  -H "api_key: YOUR_API_KEY" \
  -H "authorization: YOUR_MANAGEMENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @content-types/opportunity.json
```

## Content Type Relationships

```
Location (parent_location) ──────┐
    ↑                            │
    │ self-reference             │
    └────────────────────────────┘

Cause (parent_cause) ────────────┐
    ↑                            │
    │ self-reference             │
    └────────────────────────────┘

Opportunity
    ├── organizer ────→ Organizer
    ├── causes ───────→ Cause (multiple)
    └── location ─────→ Location

Organizer
    └── locations ────→ Location (multiple)
```

## Sample Data Structure

### Location Hierarchy Example
```
India (country)
├── Maharashtra (state)
│   ├── Mumbai (city)
│   │   ├── Andheri (area)
│   │   └── Bandra (area)
│   └── Pune (city)
└── Karnataka (state)
    └── Bangalore (city)
```

### Cause Hierarchy Example
```
Environment
├── Ocean Conservation
├── Tree Plantation
└── Waste Management

Education
├── Literacy Programs
├── Skill Development
└── STEM Education
```

## Field Types Reference

| Contentstack Type | Used For |
|------------------|----------|
| `text` | Single/multi-line text, slugs, URLs |
| `json` | Rich text (with `allow_json_rte: true`) |
| `number` | Counts, years, coordinates |
| `isodate` | Dates |
| `boolean` | Flags (is_featured, is_virtual) |
| `file` | Images |
| `reference` | Relationships between content types |
| `group` | Nested field groups (address, social links) |

## Enumerated Values

### Contribution Types
- `physical_effort` - Physical volunteering
- `skills` - Skill-based contributions
- `resources` - Donations, supplies
- `time` - Time commitment

### Organizer Types
- `ngo` - Non-governmental organization
- `individual` - Individual organizer
- `community_group` - Community-based group

### Location Types
- `country`
- `state`
- `city`
- `area`
- `virtual` - For online opportunities

### Opportunity Status
- `upcoming` - Not yet started
- `ongoing` - Currently happening
- `completed` - Finished
- `cancelled` - Cancelled
