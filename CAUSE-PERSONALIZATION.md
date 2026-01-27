# Cause-Based Personalization - Complete Guide

## 🎯 Overview

ImpactConnect features a **dynamic cause-based personalization system** that adapts content and visual effects based on the user's most recent registration. The system uses **Contentstack Personalize SDK** to deliver personalized landing pages and applies **color-matched smoke effects** across all pages.

---

## 🔄 How It Works

### Flow Diagram

```
User Registers for Event
         ↓
Registration Saved with causeSlugs
         ↓
getPrimaryCause() → Returns latest cause
         ↓
┌─────────────────────┬─────────────────────┐
│   Personalize SDK   │   Visual Effects    │
│                     │                     │
│  setUserAttributes  │  Fetch Cause Color  │
│  { primaryCause }   │  from Contentstack  │
│         ↓           │         ↓           │
│  SDK Evaluates      │  Apply to           │
│  Segments           │  CauseEffect        │
│         ↓           │         ↓           │
│  Returns Variant    │  Smoky Gradient     │
│         ↓           │  Appears Globally   │
│  Personalized       │                     │
│  Landing Page       │                     │
└─────────────────────┴─────────────────────┘
```

---

## 🏗️ Architecture

### Components

#### 1. **CauseEffect Component** (`src/components/effects/CauseEffect.tsx`)
- Global smoky gradient effect
- Positioned `fixed` with `z-index: 0` (behind all content)
- Flows from left side of screen
- Color dynamically fetched from Contentstack based on primary cause
- Updates in real-time when user registers

#### 2. **Personalize Service** (`src/lib/contentstack/personalize-service.ts`)
- Singleton wrapper around `@contentstack/personalize-edge-sdk`
- Handles SDK initialization, user attributes, and variant retrieval

#### 3. **PersonalizeContext** (`src/components/context/PersonalizeContext.tsx`)
- React Context provider
- Initializes SDK on app load
- Sets `primaryCause` attribute from latest registration
- Polls for registration changes (every 3 seconds)

#### 4. **User Storage** (`src/lib/user/storage.ts`)
- `getPrimaryCause()` - Returns cause from most recent registration
- Sorts registrations by timestamp (most recent first)
- Returns first cause from `causeSlugs` array

#### 5. **API Routes**
- `/api/causes` - Fetches all causes with colors from Contentstack
- `/api/personalized-landing` - Returns personalized landing page based on cause

---

## 🎨 Cause → Color → Variant Mapping

### Contentstack Setup

**Experience:** Cause_experience  
**Short UID:** `a`

| Cause Slug | Variant | Color | Segment Condition |
|------------|---------|-------|-------------------|
| `environment` | 0 | `#22c55e` (Green) | `primaryCause equals "environment"` |
| `healthcare` | 1 | `#ef4444` (Red) | `primaryCause equals "healthcare"` |
| `animal-welfare` | 2 | `#a855f7` (Purple) | `primaryCause equals "animal-welfare"` |
| `education` | 3 | `#3b82f6` (Blue) | `primaryCause equals "education"` |

**To Add More Causes:**
1. Create variant in Experience `a` (e.g., Variant 4, 5, etc.)
2. Create segment with condition: `primaryCause equals "cause-slug"`
3. Link segment to variant
4. Add to cause-variant mapping in `cause-variant-mapping.ts`
5. Color automatically fetched from Contentstack

---

## 📦 Required Contentstack Configuration

### 1. Attribute

```
Name: Primary Cause
UID: primaryCause
Type: Text (String)
Description: User's most recent registration cause
```

### 2. Segments (Audiences)

Create one segment per cause:

**Environment Supporters:**
```
Condition: primaryCause equals "environment"
Status: Published
```

**Healthcare Supporters:**
```
Condition: primaryCause equals "healthcare"
Status: Published
```

**Animal Welfare Supporters:**
```
Condition: primaryCause equals "animal-welfare"
Status: Published
```

**Education Supporters:**
```
Condition: primaryCause equals "education"
Status: Published
```

### 3. Experience

```
Name: Cause_experience
Short UID: a
Type: Segmented
Status: Active
Priority: High (if you have multiple experiences)

Variants:
├─ Variant 0: Environment
│  └─ Linked to: Environment Supporters segment
├─ Variant 1: Healthcare
│  └─ Linked to: Healthcare Supporters segment
├─ Variant 2: animal welfare
│  └─ Linked to: Animal Welfare Supporters segment
└─ Variant 3: Educated
   └─ Linked to: Education Supporters segment
```

### 4. Landing Page Variants

In your Landing Page entry, add personalized variants for each cause:

1. Go to Landing Page entry
2. For each field you want to personalize:
   - Add variant for Experience `a`, Variant 0 (Environment)
   - Add variant for Experience `a`, Variant 1 (Healthcare)
   - Add variant for Experience `a`, Variant 2 (Animal Welfare)
   - Add variant for Experience `a`, Variant 3 (Education)
3. Customize content for each variant
4. Publish the entry

**Fields to Personalize:**
- Hero title/subtitle
- Event carousel title
- Event carousel personalized title
- Event carousel CTA text
- Hero background image

---

## 🚀 User Journey Example

### Scenario: User Registers for Animal Welfare Event

**Step 1: Registration**
```javascript
// User registers for "Animal Shelter Volunteer Day"
addRegistration({
  opportunityTitle: "Animal Shelter Volunteer Day",
  causeSlugs: ["animal-welfare"],
  registeredAt: "2026-01-27T10:30:00.000Z",
  // ... other fields
});
```

**Step 2: Primary Cause Detected**
```javascript
getPrimaryCause() // Returns: "animal-welfare"
```

**Step 3: Personalize SDK Updated**
```javascript
await personalizeService.setUserAttributes({
  primaryCause: "animal-welfare"
});
```

**Step 4: SDK Evaluates**
```
Contentstack Personalize:
├─ Receives attribute: primaryCause = "animal-welfare"
├─ Evaluates segments
├─ Matches: Animal Welfare Supporters
├─ Experience: a (Cause_experience)
├─ Returns: Variant 2
└─ Variant alias: cs_personalize_a_2
```

**Step 5: Color Fetched**
```javascript
// Fetch from /api/causes
const causes = await fetch('/api/causes').then(r => r.json());
const cause = causes.find(c => c.slug === 'animal-welfare');
// cause.color = "#a855f7" (Purple)
```

**Step 6: Visual Effect Applied**
```javascript
// CauseEffect component renders with purple smoke
<div style={{ '--smoke-color': '#a855f7' }}>
  {/* Smoky gradient appears globally */}
</div>
```

**Step 7: Landing Page Personalized**
```javascript
// Carousel fetches personalized landing page
GET /api/personalized-landing?primaryCause=animal-welfare

// Returns:
{
  personalized: true,
  carousel: {
    title: "Paws for a Cause", // Animal Welfare variant
    personalizedTitle: "Perfect for Animal Lovers Like You",
    ctaText: "Help Animals Today"
  }
}
```

**Result:**
- ✅ Purple smoke effect across all pages
- ✅ Landing page shows animal welfare content
- ✅ Carousel shows animal welfare events
- ✅ Effect persists until user registers for different cause

---

## 🧪 Testing

### Test Scenario 1: New User (No Registrations)

```javascript
// In browser console
localStorage.clear();
location.reload();

// Expected:
// - Default purple smoke effect (#a855f7)
// - Default landing page content
// - No personalization active
```

### Test Scenario 2: Register for Education Event

```javascript
// 1. Go to /opportunities
// 2. Find Education opportunity
// 3. Click "Register"
// 4. Complete registration form

// Expected after registration:
// - Smoke effect turns blue (#3b82f6)
// - Landing page shows education content
// - Console shows:
//   [RegistrationModal] Updating Personalize SDK with primary cause: education
//   [CauseEffect] Effect color set to: #3b82f6 for cause: Education
```

### Test Scenario 3: Register for Different Cause

```javascript
// Already registered for Education, now register for Healthcare

// Expected:
// - Smoke effect changes from blue to red (#ef4444)
// - Landing page updates to healthcare content
// - getPrimaryCause() returns 'healthcare' (most recent)
```

### Verification Checklist

- [ ] Smoke effect appears on all pages (home, opportunities, FAQ, etc.)
- [ ] Smoke color matches cause color from Contentstack
- [ ] Landing page carousel shows personalized title
- [ ] Effect updates within 3 seconds of registration
- [ ] Console logs show SDK attribute updates
- [ ] Contentstack segments are published
- [ ] Experience `a` is active
- [ ] Entry variants are published

---

## 🔍 Debugging

### Console Logs to Check

```javascript
// 1. Primary cause detection
[CauseEffect] Primary cause detected: animal-welfare
[Personalize Context] Setting primary cause: animal-welfare

// 2. Color fetching
[CauseEffect] Effect color set to: #a855f7 for cause: Animal Welfare

// 3. SDK attribute sync
✅ User attributes set: {primaryCause: 'animal-welfare'}

// 4. Variant selection (in browser console)
personalizeService.getActiveVariant('a') // Should return '2' for animal-welfare

// 5. Registration update
[RegistrationModal] Updating Personalize SDK with primary cause: animal-welfare
```

### Common Issues

#### Issue 1: Smoke Effect Not Appearing
**Symptoms:** No visual effect on pages  
**Check:**
- CauseEffect component in layout.tsx
- z-index conflicts (should be 0)
- CSS module imported correctly

#### Issue 2: Wrong Color Showing
**Symptoms:** Effect shows default purple despite registration  
**Check:**
```javascript
// In browser console
getPrimaryCause() // Should return cause slug
fetch('/api/causes').then(r => r.json()).then(console.log) // Verify colors
```

#### Issue 3: Personalization Not Working
**Symptoms:** SDK returns null variant  
**Check:**
1. Contentstack segments are **published**
2. Experience `a` is **active**
3. Segment conditions match exactly: `primaryCause equals "cause-slug"`
4. Attribute UID is `primaryCause` (not `primary_cause`)

#### Issue 4: Effect Doesn't Update After Registration
**Symptoms:** Old color persists after new registration  
**Solution:** 
- Wait 3 seconds (polling interval)
- Or refresh page
- Check console for sync logs

---

## 📝 Code Reference

### Get Primary Cause Anywhere

```typescript
import { getPrimaryCause } from '@/lib/user/storage';

const primaryCause = getPrimaryCause();
// Returns: 'animal-welfare' | 'education' | 'healthcare' | 'environment' | null
```

### Get Cause Color

```typescript
const response = await fetch('/api/causes');
const causes = await response.json();
const cause = causes.find(c => c.slug === primaryCause);
const color = cause?.color || '#a855f7'; // Fallback to purple
```

### Manually Set SDK Attribute

```typescript
import { personalizeService } from '@/lib/contentstack/personalize-service';

await personalizeService.setUserAttributes({ 
  primaryCause: 'healthcare' 
});
```

### Get Active Variant

```typescript
const variantShortUid = personalizeService.getActiveVariant('a');
// Returns: '0' | '1' | '2' | '3' | null
```

---

## 🎨 Customizing the Effect

### Change Animation Speed

Edit `CauseEffect.module.css`:

```css
/* Slower (25 seconds) */
animation: smokeFlowFromLeft 25s ease-in-out infinite;

/* Faster (10 seconds) */
animation: smokeFlowFromLeft 10s ease-in-out infinite;
```

### Change Opacity

```css
.causeEffect::before {
  opacity: 0.45; /* More visible: 0.6, Less visible: 0.3 */
}
```

### Change Blur Intensity

```css
filter: blur(70px); /* More blur: 100px, Less blur: 50px */
```

---

## ✅ Summary

**What We Built:**
- ✅ Global cause-based smoke effect (all pages)
- ✅ Dynamic color fetching from Contentstack
- ✅ Real-time updates on registration
- ✅ Personalized landing page content
- ✅ SDK integration with Contentstack Personalize
- ✅ Automatic primary cause detection
- ✅ Polling for registration changes

**Key Features:**
- 🎨 Colors from Contentstack (not hardcoded)
- 🔄 Updates in real-time
- 📊 Based on latest registration
- 🌍 Works across all pages
- 🚀 Scalable (add more causes easily)

**User Experience:**
- Register → Effect changes instantly
- Consistent branding across platform
- Personalized content based on interests
- Smooth, professional visual effects

---

**Last Updated:** January 27, 2026
