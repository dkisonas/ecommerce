# Admin Quick Guide

Quick reference for common admin tasks in the Payload CMS admin panel.

## Accessing the Admin Panel

Navigate to `/admin` and log in with your admin credentials.

## Content Management

### Products

**Location:** Ecommerce > Products

**Adding a Product:**
1. Click **Create New**
2. Fill in basic info (title, description)
3. Add product images in the **Gallery**
4. Set price and inventory in **Product Details** tab
5. Assign categories
6. Publish by setting status to **Published**

**Key Fields:**
| Field | Description |
|-------|-------------|
| Title | Product name (shown to customers) |
| Slug | URL-friendly name (auto-generated) |
| Price in GBP | Price in pounds (whole number, e.g., 25 for £25) |
| Inventory | Stock count |
| Categories | Product categorization |
| Gallery | Product images |
| Description | Rich text product description |

### Categories

**Location:** Content > Categories

**Adding a Category:**
1. Click **Create New**
2. Enter title (e.g., "Clothing")
3. Slug auto-generates (e.g., "clothing")
4. Save

### Pages (CMS)

**Location:** Content > Pages

**Creating a Page:**
1. Click **Create New**
2. Enter title and slug
3. Add content using the rich text editor
4. To add a form, type `/` and select **Form Block**
5. Publish

### Forms

**Location:** Content > Forms

See [FORMS.md](./FORMS.md) for detailed instructions.

## Order Management

### Viewing Orders

**Location:** Ecommerce > Orders

- Filter by status (pending, processing, completed, etc.)
- Search by customer email or order ID
- Click an order to view full details

### Order Statuses

| Status | Action Needed |
|--------|---------------|
| Pending | Payment processing |
| Processing | Prepare and ship order |
| Completed | No action (fulfilled) |
| Refunded | Refund processed |

### Adding Admin Notes

1. Open an order
2. Find the **Admin Notes** field
3. Add notes (only visible to admins)
4. Save

## Refund Processing

### Viewing Refund Requests

**Location:** Ecommerce > Refund Requests

1. Filter by **pending** status
2. Review request details
3. Approve or reject with notes

### Processing a Refund

When you approve a request:
1. Open the refund request
2. Change status to **approved**
3. The system processes the refund via Stripe automatically
4. Order status updates accordingly

## Navigation

### Editing Header/Footer Links

**Location:** Settings > Header / Settings > Footer

**Adding a Link:**
1. Click **Add Nav Item**
2. Choose link type:
   - **Category** - Links to `/products?category={slug}`
   - **Page** - Links to a CMS page
   - **Custom URL** - Any URL or path
3. Enter label text
4. Save

### Link Type Examples

| Type | Use Case | Result |
|------|----------|--------|
| Category | Link to Clothing | `/products?category=clothing` |
| Page | Link to About page | `/about` |
| Custom URL | Link to external site | `https://example.com` |

## Settings

### Form Submission Email

**Location:** Settings > Settings

Configure where form submissions are emailed:
1. Open Settings
2. Enter email in **Form Submission Email**
3. Save

Leave empty to disable email notifications.

## Common Tasks

### Updating a Product Price

1. Go to **Ecommerce > Products**
2. Find and open the product
3. Go to **Product Details** tab
4. Update **Price in GBP**
5. Save

### Adding a New Page to Navigation

1. Create the page in **Content > Pages**
2. Go to **Settings > Header**
3. Add nav item with type **Page**
4. Select your page
5. Enter label
6. Save

### Checking Form Submissions

1. Go to **Content > Form Submissions**
2. View submissions with timestamps
3. Click to see full submission data

### Viewing Order Transaction

1. Open an order
2. Find **Transaction ID** field
3. Click to view transaction details

## Keyboard Shortcuts

In the admin panel:
- `Cmd/Ctrl + S` - Save current document
- `Cmd/Ctrl + Shift + S` - Save and continue editing
- `Esc` - Close modal/drawer

## Troubleshooting

### Product Not Appearing on Frontend

- Check status is **Published**
- Check categories are assigned
- Clear browser cache

### Form Emails Not Sending

- Check **Settings > Settings** has email configured
- Verify `RESEND_API_KEY` is set in environment
- Check server logs for email errors

### Order Status Not Updating

- Check Stripe webhook is configured
- Verify webhook endpoint URL
- Check server logs for webhook errors

## Related Documentation

- [ECOMMERCE.md](./ECOMMERCE.md) - Ecommerce system details
- [FORMS.md](./FORMS.md) - Forms configuration
- [ROUTES.md](./ROUTES.md) - All system routes
- [SETUP.md](./SETUP.md) - Initial setup instructions
