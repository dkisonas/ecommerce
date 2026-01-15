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

Run `pnpm seed` to create demo content (navigation, categories).

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
pnpm build            # Build for production (local)
pnpm build:prod       # Build with migrations (for deployment)
pnpm start            # Start production server
pnpm seed             # Create demo content
pnpm migrate          # Run database migrations
pnpm migrate:create   # Create a new migration file
pnpm generate:types   # Regenerate TypeScript types
pnpm lint             # Run linter
```

## Production Deployment

See [Deployment Guide](./docs/DEPLOYMENT.md) for full instructions on deploying to Netlify with Neon database (free tiers).

Quick steps:
1. Create a Neon database
2. Deploy to Netlify and configure environment variables (migrations run automatically)
3. Configure Stripe webhooks for your production URL
4. Verify your email domain in Resend

## Currency

Default currency is GBP. To change it, edit `src/config/store.ts`.

## Documentation

All documentation is in the `docs/` folder:

| Document | Description |
|----------|-------------|
| [Deployment Guide](./docs/DEPLOYMENT.md) | Deploy to Netlify + Neon (free tiers) |
| [Setup Guide](./docs/SETUP.md) | Detailed local setup, Stripe CLI, email |
| [Features](./docs/FEATURES.md) | Full feature list and technical stack |
| [Ecommerce](./docs/ECOMMERCE.md) | Orders, payments, refunds, shipping |
| [Routes](./docs/ROUTES.md) | All frontend and API routes |
| [Admin Guide](./docs/ADMIN-GUIDE.md) | Quick reference for admin tasks |
| [Forms](./docs/FORMS.md) | How to create and use forms |
| [Testing Plan](./docs/TESTING-PLAN.md) | Comprehensive testing checklist |

### External Resources

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Netlify Docs](https://docs.netlify.com)

## License

MIT
