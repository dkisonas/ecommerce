# Detailed Setup Guide

## Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm (recommended)
- PostgreSQL database
- Stripe account
- Resend account

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
3. Set URL: `https://yourdomain.com/api/stripe/webhooks`
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

## First Content Setup

The system auto-seeds on first run, but you can also manually create:

### 1. Home Page

- Go to Admin → Pages → Create New
- Set slug to `home` (this is your homepage)
- Add content and publish

### 2. Categories

- Go to Admin → Categories
- Create categories for your products

### 3. Products

- Go to Admin → Products → Create New
- Fill in title, description, price, images
- Assign categories
- Publish

## Production Checklist

- [ ] PostgreSQL database configured
- [ ] All environment variables set
- [ ] `NEXT_PUBLIC_SERVER_URL` set to production domain
- [ ] Production Stripe keys (`sk_live_`, `pk_live_`)
- [ ] Stripe webhooks configured for production URL
- [ ] Email domain verified in Resend
- [ ] Run `pnpm build` successfully
- [ ] Run migrations if needed

## Troubleshooting

### "Email adapter is not configured"
- Set `RESEND_API_KEY` in `.env`
- Verify key is correct in Resend dashboard

### "Payment failed" or Stripe errors
- Verify all Stripe keys are set
- Check webhook configuration
- Use test keys in development

### Database connection errors
- Verify `DATABASE_URI` format
- Check PostgreSQL is running
- Ensure database exists and user has permissions

### Homepage returns 404
- Create page with slug `home`
- Make sure it's published

### Types out of date
- Run `pnpm generate:types` after schema changes
