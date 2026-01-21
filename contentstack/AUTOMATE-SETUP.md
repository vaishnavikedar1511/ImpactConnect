# Contentstack Automate Setup for Registration Emails

This guide explains how to set up Contentstack Automate to send confirmation emails when users register for opportunities.

## Overview

The registration flow works as follows:
1. User submits registration form on the frontend
2. Backend creates a **Registration** entry in Contentstack
3. Backend **publishes** the Registration entry
4. Contentstack Automate detects the publish event
5. Automate sends confirmation email to the participant

## Prerequisites

1. Contentstack account with Automate enabled
2. Email service configured in Automate (SendGrid, Mailgun, etc.)
3. Registration content type imported into your stack

## Step 1: Import the Registration Content Type

1. Go to **Content Models** in Contentstack
2. Click **Import Content Type**
3. Select `contentstack/content-types/registration.json`
4. Click **Import**

The Registration content type includes these key fields:
- `participant_name` - User's full name
- `participant_email` - Email address for confirmation
- `opportunity_title` - Name of the event they registered for
- `opportunity_date` - Date of the event
- `opportunity_location` - Location details
- `registration_id` - Unique registration reference
- `registered_at` - Timestamp of registration

## Step 2: Create the Automate Flow

1. Go to **Automate** in your Contentstack dashboard
2. Click **New Automation**
3. Name it: `Registration Confirmation Email`

### Configure the Trigger

1. Click **Add Trigger**
2. Select **Contentstack** → **Entry Published**
3. Configure:
   - **Content Type**: Registration
   - **Environment**: production (or your environment)

### Add Email Action

1. Click **Add Action**
2. Select your email provider (e.g., **SendGrid**, **Gmail**, **Mailchimp**)
3. Configure the email:

#### Email Configuration

**To:** 
```
{{trigger.data.entry.participant_email}}
```

**Subject:**
```
Registration Confirmed: {{trigger.data.entry.opportunity_title}}
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; margin-bottom: 10px; }
    .detail-label { font-weight: 600; width: 120px; color: #6b7280; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Registration Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi {{trigger.data.entry.participant_name}},</p>
      
      <p>Thank you for registering for <strong>{{trigger.data.entry.opportunity_title}}</strong>. We're excited to have you join us!</p>
      
      <div class="details">
        <h3>Event Details</h3>
        <div class="detail-row">
          <span class="detail-label">Event:</span>
          <span>{{trigger.data.entry.opportunity_title}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span>{{trigger.data.entry.opportunity_date}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span>{{trigger.data.entry.opportunity_time}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Location:</span>
          <span>{{#if trigger.data.entry.is_virtual}}Virtual / Online{{else}}{{trigger.data.entry.opportunity_location}}{{/if}}</span>
        </div>
      </div>
      
      <p>Your registration ID is: <strong>{{trigger.data.entry.registration_id}}</strong></p>
      
      <p>Please save this email for your records. If you have any questions, feel free to reach out to the event organizer.</p>
      
      <a href="https://your-domain.com/opportunities/{{trigger.data.entry.opportunity_slug}}" class="button">
        View Event Details
      </a>
    </div>
    <div class="footer">
      <p>ImpactConnect - Making a Difference Together</p>
      <p>You received this email because you registered for an event on ImpactConnect.</p>
    </div>
  </div>
</body>
</html>
```

**From Name:**
```
ImpactConnect
```

**From Email:**
```
noreply@your-domain.com
```

### Save and Activate

1. Click **Save**
2. Toggle the automation to **Active**

## Step 3: (Optional) Organizer Notification Email

Create a second automation to notify organizers:

1. Create new automation: `Organizer Registration Notification`
2. Trigger: **Entry Published** on **Registration**
3. Add condition: `trigger.data.entry.organizer_email` is not empty
4. Email action:

**To:**
```
{{trigger.data.entry.organizer_email}}
```

**Subject:**
```
New Registration: {{trigger.data.entry.participant_name}} for {{trigger.data.entry.opportunity_title}}
```

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 20px; border: 1px solid #e5e7eb; }
    .details { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📋 New Registration Received</h2>
    </div>
    <div class="content">
      <p>Hello {{trigger.data.entry.organizer_name}},</p>
      
      <p>A new participant has registered for your event:</p>
      
      <div class="details">
        <p><strong>Event:</strong> {{trigger.data.entry.opportunity_title}}</p>
        <p><strong>Participant:</strong> {{trigger.data.entry.participant_name}}</p>
        <p><strong>Email:</strong> {{trigger.data.entry.participant_email}}</p>
        {{#if trigger.data.entry.participant_phone}}
        <p><strong>Phone:</strong> {{trigger.data.entry.participant_phone}}</p>
        {{/if}}
        {{#if trigger.data.entry.message}}
        <p><strong>Message:</strong> {{trigger.data.entry.message}}</p>
        {{/if}}
        <p><strong>Registration ID:</strong> {{trigger.data.entry.registration_id}}</p>
        <p><strong>Registered At:</strong> {{trigger.data.entry.registered_at}}</p>
      </div>
      
      <p>You can view all registrations in your Contentstack dashboard.</p>
    </div>
  </div>
</body>
</html>
```

## Step 4: Update Registration Status (Optional)

Create an automation to update the email_sent field after sending:

1. Create new automation: `Mark Email Sent`
2. Trigger: Same publish event
3. Add **Contentstack** action → **Update Entry**
4. Configure to set `email_sent: true`

## Testing

1. Go to your ImpactConnect app
2. Navigate to an opportunity detail page
3. Click "Register" and fill out the form
4. Submit the registration
5. Check:
   - Contentstack dashboard for new Registration entry
   - Your email inbox for confirmation email

## Troubleshooting

### Emails not sending?
- Check Automate execution logs in Contentstack
- Verify email service credentials
- Ensure the automation is Active
- Check the trigger content type matches "registration"

### Variables not rendering?
- Use the exact field UIDs from the content type
- Check Automate variable syntax: `{{trigger.data.entry.field_uid}}`
- Test with a simple email first

### Entry not publishing?
- Verify `CONTENTSTACK_MANAGEMENT_TOKEN` has publish permissions
- Check `CONTENTSTACK_ENVIRONMENT` matches your Automate trigger

## Field Reference

Available variables in Automate templates:

| Variable | Description |
|----------|-------------|
| `{{trigger.data.entry.participant_name}}` | Registrant's full name |
| `{{trigger.data.entry.participant_email}}` | Registrant's email |
| `{{trigger.data.entry.participant_phone}}` | Registrant's phone |
| `{{trigger.data.entry.message}}` | Optional message |
| `{{trigger.data.entry.opportunity_title}}` | Event name |
| `{{trigger.data.entry.opportunity_date}}` | Event date |
| `{{trigger.data.entry.opportunity_time}}` | Event time |
| `{{trigger.data.entry.opportunity_location}}` | Event location |
| `{{trigger.data.entry.opportunity_slug}}` | URL slug for linking |
| `{{trigger.data.entry.is_virtual}}` | Boolean - virtual event |
| `{{trigger.data.entry.organizer_name}}` | Organizer name |
| `{{trigger.data.entry.organizer_email}}` | Organizer email |
| `{{trigger.data.entry.registration_id}}` | Unique registration ID |
| `{{trigger.data.entry.registered_at}}` | Registration timestamp |
