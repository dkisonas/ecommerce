# Detailed Setup Guide

## Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm (recommended)
- PostgreSQL database
- Stripe account
- Resend account (for emails)

## Quick Start

```bash
pnpm install                # Install dependencies
pnpm approve-builds         # Approve build scripts (esbuild, git-hooks, etc.)
cp .env.example .env        # Copy and configure environment variables
pnpm seed                   # Create demo content (products, orders, settings, etc.)
pnpm dev                    # Start dev server at http://localhost:3000
```

After running `pnpm seed`, you'll have a fully functional demo store with:
- Admin account: `admin@example.com` / `admin1234`
- Customer account: `demo@example.com` / `demo1234`
- 5 products with images
- 3 categories
- 3 shipping methods
- 6 CMS pages (About, Contact, Terms, Privacy, etc.)
- Contact form
- Sample orders for testing

## Database Setup

### PostgreSQL (Required)

1. **Create the database:**
   ```sql
   CREATE DATABASE ecommerce;
   ```

2. **Update `.env`:**
   ```bash
   DATABASE_URI=postgresql://user:password@localhost:5432/ecommerce
   ```

3. **Run migrations (production only):**
   ```bash
   pnpm payload migrate
   ```

### Development vs Production

- **Development**: Uses `push: true` for automatic schema updates
- **Production**: Always run migrations manually, never use auto-push

## Stripe Payment Setup

### 1. Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to [API Keys](https://dashboard.stripe.com/test/apikeys)
3. Copy your **Secret Key** (`sk_test_...`) and **Publishable Key** (`pk_test_...`)
4. Add to `.env`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### 2. Set Up Webhooks (Local Development)

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe  # macOS
   ```

2. Login and forward webhooks:
   ```bash
   stripe login
   pnpm stripe-webhooks
   ```

3. Copy the webhook secret (`whsec_...`) to `.env`:
   ```bash
   STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_...
   ```

### 3. Set Up Webhooks (Production)

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set URL: `https://yourdomain.com/api/stripe/webhooks/ecommerce`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.refund.updated`
5. Copy signing secret to production environment

### 4. Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |

Use any future expiry date and any 3-digit CVC.

## Email Configuration (Resend)

### 1. Get API Key

1. Sign up at [Resend](https://resend.com)
2. Go to [API Keys](https://resend.com/api-keys)
3. Create and copy your API key (`re_...`)

### 2. Configure Sender

1. Add to `.env`:
   ```bash
   RESEND_API_KEY=re_...
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   EMAIL_FROM_NAME=Your Store Name
   ```

2. For production, verify your domain in [Resend Domains](https://resend.com/domains)

## What the Seed Script Creates

Running `pnpm seed` creates all the demo content you need:

| Content | Details |
|---------|---------|
| **Users** | Admin and demo customer accounts |
| **Categories** | Clothing, Accessories, Home & Living |
| **Products** | 5 products with images, 2 with variants |
| **Shipping Methods** | Standard (£3.99), Express (£7.99), Free |
| **Settings** | Site name, company, tagline, dark mode enabled |
| **Footer** | 3 columns with links, social media icons |
| **Pages** | About, Contact, Terms, Privacy, Shipping, Returns |
| **Forms** | Contact form with 4 fields |
| **Orders** | 6 demo orders with various statuses |
| **Guest Order** | For testing track-order page |

## Customizing After Seed

### Site Branding (Admin > Settings)

1. Go to Admin Panel > Settings
2. Update:
   - **Site Name**: Your store name (shown in browser tab, emails)
   - **Company Name**: Legal name (shown in footer copyright)
   - **Tagline**: Short description for footer
   - **Logo**: Upload light and dark mode logos
   - **Enable Dark Mode**: Toggle theme selector visibility

### Shipping Methods (Admin > Shop > Shipping Methods)

1. Edit existing methods or create new ones
2. Configure:
   - Price (in pence, e.g., 399 = £3.99)
   - Free shipping threshold
   - Estimated delivery time
   - Enable/disable methods

### Navigation (Admin > Settings > Header/Footer)

1. Edit header navigation items
2. Configure footer columns and links
3. Add/remove social media links

## Production Checklist

- [ ] PostgreSQL database configured
- [ ] All environment variables set
- [ ] `NEXT_PUBLIC_SERVER_URL` set to production domain
- [ ] Production Stripe keys (`sk_live_`, `pk_live_`)
- [ ] Stripe webhooks configured for production URL
- [ ] Email domain verified in Resend
- [ ] Run `pnpm build` successfully
- [ ] Run migrations if needed
- [ ] Update Settings global with real branding
- [ ] Replace demo content with real products

## Environment Variables Reference

### Required

```env
DATABASE_URI=postgresql://user:password@localhost:5432/ecommerce
PAYLOAD_SECRET=your-32-char-secret-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_...
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Store Name
```

### Optional

```env
PREVIEW_SECRET=preview-secret   # For draft preview functionality
```

## Troubleshooting

### "Email adapter is not configured"
- Set `RESEND_API_KEY` in `.env`
- Verify key is correct in Resend dashboard

### "Payment failed" or Stripe errors
- Verify all Stripe keys are set
- Check webhook configuration
- Use test keys in development
- Run `pnpm stripe-webhooks` for local webhook forwarding

### Database connection errors
- Verify `DATABASE_URI` format
- Check PostgreSQL is running
- Ensure database exists and user has permissions

### Types out of date
- Run `pnpm generate:types` after schema changes

### Seed script errors
- Make sure database is empty or run seed again (it clears demo content first)
- Check database connection is working
