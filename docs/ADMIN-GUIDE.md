# Admin Quick Guide

Quick reference for common admin tasks in the Payload CMS admin panel.

## Accessing the Admin Panel

Navigate to `/admin` and log in with your admin credentials.

Default demo credentials: `admin@example.com` / `admin1234`

## Admin Panel Structure

| Group | Collections/Globals |
|-------|---------------------|
| **Content** | Pages, Categories, Media, Forms, Form Submissions |
| **Shop** | Products, Orders, Shipping Methods, Refund Requests, Refunds |
| **Users** | Users |
| **Settings** | Header, Footer, Settings |

---

## Site Settings

### Branding (Settings > Settings > Branding)

| Field | Purpose |
|-------|---------|
| **Site Name** | Shown in browser tab and emails |
| **Company Name** | Shown in footer copyright |
| **Tagline** | Short description in footer |
| **Logo (Light Mode)** | Logo for light backgrounds |
| **Logo (Dark Mode)** | Logo for dark backgrounds |

### Appearance (Settings > Settings > Appearance)

| Field | Purpose |
|-------|---------|
| **Enable Dark Mode** | Show/hide theme toggle in footer |

When disabled, site always uses light mode and theme selector is hidden.

### Notifications (Settings > Settings > Notifications)

| Field | Purpose |
|-------|---------|
| **Form Submission Email** | Where form submissions are sent |

Leave empty to disable email notifications (submissions still saved).

---

## Navigation

### Header (Settings > Header)

Add navigation items that appear in the site header.

**Adding a Link:**
1. Click **Add Nav Item**
2. Choose link type:
   - **Category** - Links to `/products?category={slug}`
   - **Page** - Links to a CMS page
   - **Custom URL** - Any URL or path
3. Enter label text
4. Save

### Footer (Settings > Footer)

Configure footer columns and social links.

**Columns:**
- Add up to 4 columns
- Each column has a title and list of links
- Links use same types as header (Category, Page, Custom URL)

**Social Links:**
1. Enable "Show Social Links"
2. Add platforms: Facebook, Instagram, X (Twitter), TikTok, YouTube, LinkedIn
3. Enter full URLs (e.g., `https://instagram.com/yourstore`)

---

## Products

**Location:** Shop > Products

### Adding a Product

1. Click **Create New**
2. Fill in basic info (title, description)
3. Add product images in the **Gallery**
4. Set price and inventory in **Product Details** tab
5. Assign categories
6. Publish by setting status to **Published**

### Key Fields

| Field | Description |
|-------|-------------|
| Title | Product name (shown to customers) |
| Slug | URL-friendly name (auto-generated) |
| Price in GBP | Price in pence (e.g., 2500 = £25.00) |
| Inventory | Stock count |
| Categories | Product categorization |
| Gallery | Product images |
| Description | Rich text product description |
| Enable Variants | Toggle for products with options (size, color) |

### Products with Variants

1. Check **Enable Variants**
2. Select variant types (Color, Size, etc.)
3. Create variants with specific options, prices, and inventory

---

## Shipping Methods

**Location:** Shop > Shipping Methods

### Adding a Shipping Method

1. Click **Create New**
2. Configure:

| Field | Description | Example |
|-------|-------------|---------|
| Method Name | Display name | "Standard Delivery" |
| Description | Optional details | "Delivered by Royal Mail" |
| Price (in pence) | Cost | 399 = £3.99 |
| Free Above (in pence) | Free threshold | 3000 = Free over £30 |
| Estimated Delivery | Timeframe | "3-5 business days" |
| Enabled | Show at checkout | ✓ |
| Sort Order | Display order | 1 (lower = first) |

### Checkout Behavior

- All enabled methods shown at checkout
- If cart subtotal >= "Free Above", shows as "Free" with original price crossed out
- First method auto-selected by default

---

## Orders

**Location:** Shop > Orders

### Viewing Orders

- Filter by status (pending, processing, completed, etc.)
- Search by customer email or order ID
- Click an order to view full details

### Order Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| Pending | Payment processing | Wait |
| Processing | Payment received | Prepare and ship |
| Completed | Order fulfilled | None needed |
| Refund Requested | Customer requested refund | Review request |
| Refunded | Fully refunded | None needed |
| Partially Refunded | Partial refund processed | May process more |
| Cancelled | Order cancelled | None needed |

### Order Details

Each order shows:
- Customer info and shipping address
- Items ordered with quantities
- Shipping method and cost
- Subtotal, shipping, and total
- Transaction ID (link to Stripe)
- Refund history (if any)

### Adding Admin Notes

1. Open an order
2. Find the **Admin Notes** field
3. Add notes (only visible to admins)
4. Save

---

## Refund Processing

**Location:** Shop > Refund Requests

### Viewing Requests

1. Filter by **pending** status
2. Review request details and reason
3. Approve or reject with notes

### Processing a Refund

When you approve a request:
1. Open the refund request
2. Change status to **approved**
3. The system processes the refund via Stripe automatically
4. Order status updates accordingly

### Rejecting a Request

1. Change status to **rejected**
2. Enter rejection reason (customer will see this)
3. Save

---

## Pages (CMS)

**Location:** Content > Pages

### Creating a Page

1. Click **Create New**
2. Enter title and slug
3. Add content using the rich text editor
4. To add a form, type `/` and select **Form Block**
5. Publish

### Common Pages

| Page | Slug | Purpose |
|------|------|---------|
| About Us | about | Company info |
| Contact | contact | Contact form |
| Terms & Conditions | terms-conditions | Legal terms |
| Privacy Policy | privacy-policy | Data handling |
| Shipping Policy | shipping-policy | Shipping info |
| Returns & Refunds | returns-refunds | Return policy |

---

## Forms

**Location:** Content > Forms

See [FORMS.md](./FORMS.md) for detailed instructions.

### Quick Form Setup

1. Create form with fields
2. Add to a page via Form Block
3. Set notification email in Settings > Settings > Notifications

### Viewing Submissions

**Location:** Content > Form Submissions

- View all submissions with timestamps
- Filter by form
- Click to see full submission data

---

## Categories

**Location:** Content > Categories

### Adding a Category

1. Click **Create New**
2. Enter title (e.g., "Clothing")
3. Slug auto-generates (e.g., "clothing")
4. Save

Categories are used for:
- Product filtering on `/products`
- Navigation links (Category type)
- Footer column links

---

## Common Tasks

### Updating a Product Price

1. Go to **Shop > Products**
2. Find and open the product
3. Go to **Product Details** tab
4. Update **Price in GBP** (in pence)
5. Save

### Adding a New Page to Navigation

1. Create the page in **Content > Pages**
2. Go to **Settings > Header**
3. Add nav item with type **Page**
4. Select your page
5. Enter label
6. Save

### Changing Site Name/Logo

1. Go to **Settings > Settings**
2. Update Branding tab fields
3. Upload new logos if needed
4. Save
5. Changes reflect immediately on frontend

### Disabling Dark Mode

1. Go to **Settings > Settings**
2. Go to Appearance tab
3. Uncheck **Enable Dark Mode**
4. Save
5. Theme selector hidden from footer

### Editing Shipping Prices

1. Go to **Shop > Shipping Methods**
2. Open the shipping method
3. Update price (in pence)
4. Save
5. New price shows immediately at checkout

---

## Keyboard Shortcuts

In the admin panel:
- `Cmd/Ctrl + S` - Save current document
- `Cmd/Ctrl + Shift + S` - Save and continue editing
- `Esc` - Close modal/drawer

---

## Troubleshooting

### Product Not Appearing on Frontend

- Check status is **Published**
- Check categories are assigned
- Clear browser cache

### Form Emails Not Sending

- Check **Settings > Settings > Notifications** has email configured
- Verify `RESEND_API_KEY` is set in environment
- Check server logs for email errors

### Order Status Not Updating

- Check Stripe webhook is configured
- Verify webhook endpoint URL
- Check server logs for webhook errors

### Logo Not Showing

- Verify image uploaded in Settings > Branding
- Check both light and dark variants
- Clear browser cache

---

## Related Documentation

- [FEATURES.md](./FEATURES.md) - Complete feature documentation
- [ECOMMERCE.md](./ECOMMERCE.md) - Ecommerce system details
- [FORMS.md](./FORMS.md) - Forms configuration
- [ROUTES.md](./ROUTES.md) - All system routes
- [SETUP.md](./SETUP.md) - Initial setup instructions
- [TESTING-PLAN.md](./TESTING-PLAN.md) - Testing checklist
