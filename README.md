# Payload Ecommerce

A production-ready ecommerce store built with [Payload CMS](https://payloadcms.com) and [Next.js](https://nextjs.org).

## Quick Start

```bash
# 1. Install dependencies
pnpm install
pnpm approve-builds

# 2. Set up environment
cp .env.example .env
# Edit .env with your database, Stripe, and email credentials

# 3. Start the server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your store.
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin panel.

Run `pnpm seed` to create demo content (home page, navigation, categories).

## Environment Variables

Create a `.env` file with these required variables:

```bash
# Database (PostgreSQL)
DATABASE_URI=postgresql://user:password@localhost:5432/ecommerce

# Payload
PAYLOAD_SECRET=your-secret-key-min-32-characters
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Store Name
```

### Getting API Keys

- **Stripe**: [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
- **Resend**: [resend.com/api-keys](https://resend.com/api-keys)

## Adding Products

1. Go to **Admin → Products → Create New**
2. Fill in: title, description, price, and upload at least one image
3. Click **Publish**
4. Visit your store to see the product

## Local Stripe Webhooks

For payment testing, run in a separate terminal:

```bash
pnpm stripe-webhooks
```

This forwards Stripe events to your local server. Copy the webhook secret to your `.env`.

## Test Payments

Use Stripe's test card: `4242 4242 4242 4242` (any future expiry, any CVC).

## Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm seed             # Re-run seed script
pnpm generate:types   # Regenerate TypeScript types
pnpm lint             # Run linter
```

## Production Deployment

1. Set up a PostgreSQL database
2. Configure all environment variables
3. Set `NEXT_PUBLIC_SERVER_URL` to your production domain
4. Use production Stripe keys (`sk_live_`, `pk_live_`)
5. Configure Stripe webhooks to point to `https://yourdomain.com/api/stripe/webhooks`
6. Verify your email domain in Resend

## Currency

Default currency is GBP. To change it, edit `src/config/store.ts`.

## Documentation

- [Features](./FEATURES.md) - Full feature list and technical stack
- [Detailed Setup Guide](./docs/SETUP.md) - Stripe, email, and database configuration
- [Payload CMS Docs](https://payloadcms.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Resend Docs](https://resend.com/docs)

## License

MIT
