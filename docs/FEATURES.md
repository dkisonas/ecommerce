# Feature Documentation

This document explains all major features of the ecommerce platform and how to configure them.

---

## Table of Contents

1. [Track Order (Guest Order Lookup)](#1-track-order-guest-order-lookup)
2. [Site Settings & Branding](#2-site-settings--branding)
3. [Dynamic Logo](#3-dynamic-logo)
4. [Dark Mode Toggle](#4-dark-mode-toggle)
5. [Footer Configuration](#5-footer-configuration)
6. [Shipping Methods](#6-shipping-methods)
7. [Order Management](#7-order-management)
8. [Refund System](#8-refund-system)
9. [Email Notifications](#9-email-notifications)
10. [CMS Pages](#10-cms-pages)
11. [Forms & Contact](#11-forms--contact)
12. [Authentication](#12-authentication)

---

## 1. Track Order (Guest Order Lookup)

### What It Does

The **Track Order** page (`/track-order`) allows customers who checked out as guests (without creating an account) to view their order status.

### How It Works

1. Customer places an order as a guest (without logging in)
2. Customer receives an order confirmation email with their **Order ID**
3. Customer visits `/track-order`
4. Customer enters their **email address** and **Order ID**
5. System verifies the email matches the order's `customerEmail`
6. If valid, customer is redirected to the order detail page

### Access Control

- **Logged-in users**: Can view their orders directly at `/orders` (no email verification needed)
- **Guest users**: Must provide both email AND order ID to view an order

### Configuration

No configuration needed - this feature works automatically. The Track Order link appears in the footer for logged-out users.

### Email Flow

The order confirmation email includes:
- Order ID prominently displayed
- Direct link to view the order (with email pre-filled in URL)
- Link to the Track Order page

---

## 2. Site Settings & Branding

### What It Does

The **Settings** global allows you to configure site-wide branding without touching code.

### How to Configure

1. Go to **Admin Panel** → **Settings** (in the Settings group)
2. Configure the following fields:

| Field | Purpose | Where It's Used |
|-------|---------|-----------------|
| Site Name | Your store's name | Browser tab, emails, footer |
| Company Name | Legal company name | Footer copyright, emails |
| Tagline | Short description | Footer below logo |
| Logo (Light Mode) | Logo for light backgrounds | Header, Footer |
| Logo (Dark Mode) | Logo for dark backgrounds | Header, Footer (when dark mode active) |
| Enable Dark Mode | Allow users to switch themes | Footer theme selector |
| Form Submission Email | Where form submissions are sent | Contact form notifications |

### Example Configuration

```
Site Name: My Fashion Store
Company Name: Fashion Co Ltd
Tagline: Quality clothing, exceptional service
Logo (Light Mode): [Upload dark logo for light backgrounds]
Logo (Dark Mode): [Upload light logo for dark backgrounds]
Enable Dark Mode: ✓ Checked
Form Submission Email: contact@myfashionstore.com
```

---

## 3. Dynamic Logo

### What It Does

The logo automatically switches between light and dark variants based on the current theme.

### How It Works

1. Upload a **Logo (Light Mode)** - this should be a dark-colored logo that's visible on light backgrounds
2. Upload a **Logo (Dark Mode)** - this should be a light-colored logo that's visible on dark backgrounds
3. The system automatically shows the appropriate logo based on the user's theme preference

### Fallback Behavior

- If only one logo is uploaded, it's used for both themes
- If no logos are uploaded, a default Payload logo icon is shown

### Logo Requirements

- **Recommended format**: SVG or PNG with transparency
- **Recommended height**: 32-64px for best results
- **Aspect ratio**: Any (width will adjust automatically)

---

## 4. Dark Mode Toggle

### What It Does

Users can switch between light, dark, and auto (system) themes using the selector in the footer.

### How to Enable/Disable

1. Go to **Admin Panel** → **Settings**
2. Under **Appearance** tab, toggle **Enable Dark Mode**
3. When **disabled**:
   - Site always uses light theme
   - Theme selector is hidden from footer
   - User preferences are ignored

### Theme Options (when enabled)

| Option | Behavior |
|--------|----------|
| Auto | Follows system preference (prefers-color-scheme) |
| Light | Always light theme |
| Dark | Always dark theme |

---

## 5. Footer Configuration

### What It Does

Configure the footer columns, links, and social media from the admin panel.

### How to Configure

1. Go to **Admin Panel** → **Footer** (in the Globals group)

### Columns

Add up to 4 columns, each with:
- **Title**: Column header (e.g., "Shop", "Support", "Company")
- **Links**: Up to 8 links per column

### Link Types

Each link can be one of three types:

| Type | Description | Example |
|------|-------------|---------|
| Category | Links to `/products?category={slug}` | "Women's Clothing" → `/products?category=womens-clothing` |
| Page | Links to a CMS page `/{slug}` | "Terms & Conditions" → `/terms-conditions` |
| Custom URL | Any URL (internal or external) | "Blog" → `https://blog.example.com` |

### Social Links

1. Enable **Show Social Links**
2. Add social platforms:
   - Facebook
   - Instagram
   - X (Twitter)
   - TikTok
   - YouTube
   - LinkedIn

Each requires a full URL (e.g., `https://instagram.com/yourstore`)

### Example Configuration

```
Columns:
  1. Shop
     - Category: Clothing
     - Category: Accessories
     - Page: New Arrivals

  2. Support
     - Page: Contact Us
     - Page: Shipping Policy
     - Page: Returns & Refunds
     - Custom URL: FAQ → /faq

  3. Company
     - Page: About Us
     - Page: Privacy Policy
     - Page: Terms & Conditions

Show Social Links: ✓
Social Links:
  - Instagram: https://instagram.com/yourstore
  - Facebook: https://facebook.com/yourstore
```

---

## 6. Shipping Methods

### What It Does

Configure flat-rate shipping options that customers can select during checkout.

### How to Configure

1. Go to **Admin Panel** → **Shipping Methods** (in the Shop group)
2. Click **Create New**

### Fields

| Field | Description | Example |
|-------|-------------|---------|
| Method Name | Display name | "Standard Delivery" |
| Description | Optional details | "Delivered by Royal Mail" |
| Price (in pence) | Cost in smallest unit | 499 = £4.99 |
| Free Above (in pence) | Free shipping threshold | 5000 = Free over £50 |
| Estimated Delivery | Delivery timeframe | "3-5 business days" |
| Enabled | Show at checkout | ✓ |
| Sort Order | Display order (lower = first) | 1 |

### Example Configuration

```
1. Standard Delivery
   Price: 399 (£3.99)
   Free Above: 5000 (Free over £50)
   Estimated: 3-5 business days
   Sort Order: 1

2. Express Delivery
   Price: 799 (£7.99)
   Free Above: (empty - never free)
   Estimated: Next business day
   Sort Order: 2

3. Free Shipping (Promo)
   Price: 0
   Estimated: 5-7 business days
   Sort Order: 3
```

### Checkout Behavior

1. All enabled shipping methods are shown at checkout
2. If cart subtotal >= `Free Above`, shipping shows as "Free" with original price crossed out
3. First method is auto-selected by default
4. Order summary shows: Subtotal + Shipping = Total

---

## 7. Order Management

### Order Statuses

| Status | Meaning | Next Steps |
|--------|---------|------------|
| `pending` | Awaiting payment | Wait for payment confirmation |
| `processing` | Payment received | Prepare and ship order |
| `completed` | Order delivered | Customer may request refund |
| `refund_requested` | Customer requested refund | Review in Admin |
| `refunded` | Fully refunded | No action needed |
| `partially_refunded` | Partially refunded | May process additional refunds |
| `cancelled` | Order cancelled | No action needed |

### Viewing Orders (Admin)

1. Go to **Admin Panel** → **Orders**
2. View all orders with filtering by status
3. Click an order to see:
   - Customer details
   - Items ordered
   - Shipping address
   - Payment information
   - Admin notes
   - Refund history

### Admin Notes

Add internal notes to orders (not visible to customers):
1. Open an order in Admin
2. Add notes in the **Admin Notes** section
3. Notes are timestamped and attributed to the admin who added them

---

## 8. Refund System

### How Refunds Work

1. **Customer requests refund**: From their order detail page
2. **Admin reviews request**: In Admin Panel → Refund Requests
3. **Admin approves/rejects**: With optional note
4. **If approved**: Admin processes refund via Stripe

### Customer Flow

1. Customer views order at `/orders/{id}`
2. Clicks "Request Refund" button
3. Provides reason and optional details
4. Submits request
5. Sees status: "Pending Review"
6. Receives updates when status changes

### Admin Flow

1. Go to **Admin Panel** → **Refund Requests**
2. Review pending requests
3. For each request, choose:
   - **Approve**: Customer will be refunded
   - **Reject**: With reason (customer sees this)

### Processing Approved Refunds

1. Go to **Admin Panel** → **Orders**
2. Open the order
3. Use the **Refund Actions** panel in sidebar
4. Enter amount to refund (full or partial)
5. Confirm - Stripe processes the refund
6. Order status updates automatically

---

## 9. Email Notifications

### Order Confirmation Email

**Sent when**: New order is created
**Sent to**: Customer email (from order)

**Contains**:
- Order number and status
- Shipping method selected
- Subtotal, shipping cost, total
- Link to view order
- Link to track order page

### Form Submission Email

**Sent when**: Contact form is submitted
**Sent to**: Email configured in Settings → Form Submission Email

**Contains**:
- Form name
- Submission timestamp
- All form fields and values
- Link to view in Admin

### Email Template Design

Both email templates use the site's cream/gold color scheme:
- Dark header with gold site name
- Clean white content area
- Gold accent buttons
- Dark footer with copyright

To customize:
- Site name is pulled from Settings
- Company name is used in footer
- Colors are hardcoded (edit hook files to change)

---

## 10. CMS Pages

### Creating Pages

1. Go to **Admin Panel** → **Pages**
2. Click **Create New**
3. Fill in:
   - **Title**: Page title (shown in header)
   - **Slug**: URL path (auto-generated from title)
   - **Content**: Rich text editor with:
     - Bold, italic, underline
     - Ordered/unordered lists
     - Links (internal or external)
     - Tables
     - Embedded forms

### Recommended Pages

| Page | Slug | Purpose |
|------|------|---------|
| Terms & Conditions | `terms-conditions` | Legal terms |
| Privacy Policy | `privacy-policy` | Data handling |
| Shipping Policy | `shipping-policy` | Shipping information |
| Returns & Refunds | `returns-refunds` | Return policy |
| About Us | `about` | Company story |
| Contact | `contact` | Contact form + info |

### URL Structure

Pages are accessible at `/{slug}`:
- `example.com/terms-conditions`
- `example.com/privacy-policy`

---

## 11. Forms & Contact

### Creating a Contact Form

1. Go to **Admin Panel** → **Forms**
2. Click **Create New**
3. Add fields:
   - Name (text)
   - Email (email)
   - Subject (text)
   - Message (textarea)
4. Configure confirmation message
5. Save

### Embedding Forms in Pages

1. Create or edit a Page
2. In the content editor, click the "+" button
3. Select **Form Block**
4. Choose your form
5. Optionally add intro text above the form
6. Save

### Form Submission Notifications

1. Go to **Settings** → **Notifications** tab
2. Enter email in **Form Submission Email**
3. All form submissions will be sent to this email

### Viewing Submissions

1. Go to **Admin Panel** → **Form Submissions**
2. View all submissions
3. Filter by form
4. Export if needed

---

## 12. Authentication

### Customer Account Features

**Account Dashboard** (`/account`):
- View profile information
- Manage saved addresses
- View recent orders
- Quick access to order history

**Orders** (`/orders`):
- List all past orders
- View order status
- Click to see details

**Addresses**:
- Add multiple addresses
- Set default address
- Edit or delete addresses
- Used at checkout for faster ordering

### Guest Checkout

Customers can checkout without creating an account:
1. Enter email at checkout
2. Enter shipping/billing address
3. Complete payment
4. Receive confirmation email with Order ID
5. Use `/track-order` to view order later

### Account Pages

| Page | URL | Purpose |
|------|-----|---------|
| Login | `/login` | Sign in |
| Create Account | `/create-account` | Register |
| Forgot Password | `/forgot-password` | Reset password |
| Account | `/account` | Dashboard |
| Orders | `/orders` | Order history |
| Track Order | `/track-order` | Guest order lookup |

---

## Quick Reference: Admin Panel Sections

| Section | Purpose |
|---------|---------|
| **Content** | |
| → Pages | CMS pages (About, Terms, etc.) |
| → Categories | Product categories |
| → Media | Uploaded images/files |
| **Shop** | |
| → Products | Product catalog |
| → Orders | Customer orders |
| → Shipping Methods | Shipping options |
| → Refund Requests | Customer refund requests |
| → Refunds | Processed refunds |
| **Users** | |
| → Users | Customer and admin accounts |
| **Settings** | |
| → Header | Navigation links |
| → Footer | Footer columns and social links |
| → Settings | Site branding and notifications |
