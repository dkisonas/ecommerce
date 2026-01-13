# Forms System

This guide explains how to create forms, add them to pages, and configure email notifications for form submissions.

## Overview

Forms are built using the `@payloadcms/plugin-form-builder` plugin. The system supports:
- Creating custom forms with various field types
- Adding forms to any page via the rich text editor
- Automatic email notifications when forms are submitted
- Viewing all submissions in the admin panel

## Creating a Form

1. Navigate to **Content > Forms** in the admin panel
2. Click **Create New**
3. Configure your form:

### Form Settings

| Field | Description |
|-------|-------------|
| **Title** | Internal name for the form (shown in admin) |
| **Submit Button Label** | Text displayed on the submit button (e.g., "Submit", "Send Message") |
| **Confirmation Type** | What happens after submission: `Message` (show text) or `Redirect` (go to URL) |
| **Confirmation Message** | Rich text displayed after successful submission (if type is Message) |
| **Redirect URL** | URL to redirect to after submission (if type is Redirect) |

### Available Field Types

| Field Type | Description |
|------------|-------------|
| **Text** | Single line text input |
| **Textarea** | Multi-line text input |
| **Email** | Email address input with validation |
| **Number** | Numeric input |
| **Checkbox** | Single checkbox (yes/no) |
| **Select** | Dropdown menu with predefined options |
| **Country** | Dropdown of countries |
| **State** | Dropdown of states/provinces |
| **Message** | Display text/instructions (not a form field) |

### Field Options

Each field has these common options:

| Option | Description |
|--------|-------------|
| **Name** | Field identifier (used in submission data) |
| **Label** | Display label shown to users |
| **Width** | Field width: 100%, 50%, or 33% |
| **Required** | Whether the field is required |
| **Default Value** | Pre-filled value (optional) |

## Adding a Form to a Page

Forms are added to pages using the rich text editor's block system.

### Steps:

1. Navigate to **Content > Pages** and edit a page
2. In the **Content** rich text editor, position your cursor where you want the form
3. Click the **+** button or type `/` to open the block menu
4. Select **Form Block**
5. Configure the form block:
   - **Enable Intro** - Show introductory text above the form
   - **Intro Content** - Rich text to display above the form
   - **Form** - Select which form to embed

### Example Use Cases

- **Contact Page**: Create a "Contact Us" form with name, email, subject, and message fields
- **Newsletter Signup**: Simple email field form
- **Feedback Form**: Customer feedback with rating and comments

## Email Notifications

### Configuring the Recipient Email

1. Navigate to **Settings > Settings** in the admin panel
2. Go to the **Notifications** tab
3. Enter the **Form Submission Email** address
4. Save the settings

All form submissions will send notification emails to this address.

### Email Content

The notification email includes:
- Form name
- Submission timestamp
- All submitted field data in a styled table
- Link to view the submission in the admin panel
- Cream/gold themed design matching the site

### Disabling Email Notifications

Leave the **Form Submission Email** field empty in Settings to disable notifications. Submissions will still be saved to the database.

## Viewing Form Submissions

1. Navigate to **Content > Form Submissions** in the admin panel
2. View all submissions with filtering and sorting options
3. Click a submission to see full details

### Submission Data

Each submission record contains:
- Reference to the form
- Submission data (field name/value pairs)
- Timestamp

## Demo Contact Form

The seed script (`pnpm seed`) creates a demo contact form with:
- Name (text, required)
- Email (email, required)
- Subject (text, required)
- Message (textarea, required)

## Technical Notes

### Extending Email Recipients

The current implementation uses a global email setting. To extend support for per-form emails:

1. Add an `emails` field to the form's `formOverrides` in `src/plugins/index.ts`
2. Update `src/hooks/sendFormSubmissionEmail.ts` to check for form-specific emails first, then fall back to global

Example extension:

```typescript
// In formOverrides.fields
{
  name: 'notificationEmails',
  type: 'array',
  label: 'Notification Emails',
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    }
  ],
  admin: {
    description: 'Additional emails to notify. Leave empty to use global setting.',
  }
}
```

### Required Environment Variables

For email to work, ensure these are configured:

```env
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Store Name
RESEND_API_KEY=your_resend_api_key
```

### Files Reference

| File | Purpose |
|------|---------|
| `src/plugins/index.ts` | Form builder plugin configuration |
| `src/hooks/sendFormSubmissionEmail.ts` | Email notification hook |
| `src/globals/Settings.ts` | Settings global (form submission email) |
| `src/blocks/Form/Component.tsx` | Frontend form rendering |
| `src/blocks/Form/fields/` | Individual form field components |
