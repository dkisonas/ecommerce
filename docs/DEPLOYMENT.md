# Deployment Guide (Netlify + Neon)

This guide covers deploying to **Netlify** (hosting) with **Neon** (PostgreSQL database) using free tiers.

## Prerequisites

- GitHub repository with your code
- [Netlify account](https://app.netlify.com/signup) (free)
- [Neon account](https://console.neon.tech/signup) (free)
- [Stripe account](https://dashboard.stripe.com/register) (for payments)
- [Resend account](https://resend.com/signup) (for emails, free tier: 100 emails/day)

## Step 1: Set Up Neon Database

1. **Create a Neon project**
   - Go to [console.neon.tech](https://console.neon.tech)
   - Click "New Project"
   - Name it (e.g., "ecommerce-store")
   - Select the region closest to your users

2. **Get the connection string**
   - In your project dashboard, copy the connection string
   - It looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
   - **Important**: Use the pooled connection string for production (ends with `-pooler`)

3. **Free tier limits**
   - 0.5 GB storage
   - 1 project with 10 branches
   - Compute auto-suspends after 5 minutes of inactivity
   - 191.9 compute hours/month

## Step 2: Database Migrations (Automated)

**Migrations run automatically** during `pnpm build:prod`. No manual steps needed for deployment.

When you push code to GitHub:
1. Netlify triggers a build using `pnpm build:prod`
2. Build runs migrations first
3. If migrations succeed, Next.js builds
4. If migrations fail, build fails (no broken deployment)

### Creating New Migrations (Development)

When you change collection schemas locally:

```bash
# 1. Create a migration after schema changes
pnpm migrate:create

# 2. Review the generated file in src/migrations/

# 3. Test locally
pnpm migrate

# 4. Commit and push - migrations run automatically on deploy
git add . && git commit -m "Add migration" && git push
```

## Step 3: Deploy to Netlify

### Option A: Deploy via Netlify UI

1. **Connect your repository**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select GitHub and authorize access
   - Choose your repository

2. **Configure build settings**
   - Build command: `pnpm build:prod`
   - Publish directory: `.next`
   - Add environment variables (see below)

3. **Deploy**
   - Click "Deploy site"

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize the project
netlify init

# Deploy
netlify deploy --prod
```

## Step 4: Configure Environment Variables

In Netlify Dashboard → Site settings → Environment variables, add:

### Required Variables

```bash
# Core
NODE_ENV=production
NEXT_PUBLIC_SERVER_URL=https://your-site.netlify.app
PAYLOAD_SECRET=generate-with-openssl-rand-base64-32

# Database (Neon)
DATABASE_URI=postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Store Name
```

### Optional Variables (Payment Providers)

```bash
# Paysera (if using)
PAYSERA_PROJECT_ID=your_project_id
PAYSERA_SIGN_PASSWORD=your_sign_password
PAYSERA_TEST_MODE=false
NEXT_PUBLIC_PAYSERA_ENABLED=true
```

### Generate PAYLOAD_SECRET

```bash
openssl rand -base64 32
```

## Step 5: Configure Stripe Webhooks

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URLs:
   - Ecommerce: `https://your-site.netlify.app/api/stripe/webhooks/ecommerce`
   - Refunds: `https://your-site.netlify.app/api/stripe/webhooks/refunds`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.refund.updated`
5. Copy the signing secret to `STRIPE_WEBHOOKS_SIGNING_SECRET`

## Step 6: Configure Paysera Callbacks (if using)

If using Paysera payments, configure the callback URL in your Paysera project settings:

```
https://your-site.netlify.app/api/payments/paysera/callback
```

## Step 7: Verify Deployment

After deployment, verify:

- [ ] Site loads at `https://your-site.netlify.app`
- [ ] Admin panel accessible at `/admin`
- [ ] Products display correctly
- [ ] Checkout flow works
- [ ] Stripe payments process successfully
- [ ] Order confirmation emails are sent

## Custom Domain (Optional)

1. In Netlify Dashboard → Domain settings
2. Add your custom domain
3. Update `NEXT_PUBLIC_SERVER_URL` to your custom domain
4. Update Stripe webhook URLs
5. Verify your domain in Resend for email deliverability

## Troubleshooting

### Build Fails

1. Check build logs in Netlify
2. Ensure all environment variables are set
3. Try building locally first: `pnpm build`

### Database Connection Issues

1. Verify DATABASE_URI is correct
2. Use the pooled connection string (contains `-pooler`)
3. Ensure `?sslmode=require` is included

### Neon Compute Suspended

Neon free tier suspends compute after inactivity. First request may be slow as it wakes up. This is normal for free tier.

### Images Not Loading

For production, consider using cloud storage. Options:
- Cloudflare R2 (S3-compatible, generous free tier)
- Uploadthing (generous free tier)

See [File Storage](#file-storage-optional) section below.

## File Storage (Optional)

Netlify includes some blob storage, but for production with many images:

### Option 1: Cloudflare R2 (Recommended for free tier)

1. Install S3 adapter:
   ```bash
   pnpm add @payloadcms/storage-s3
   ```

2. Configure in `payload.config.ts`:
   ```typescript
   import { s3Storage } from '@payloadcms/storage-s3'

   plugins: [
     s3Storage({
       collections: { media: { prefix: 'media' } },
       bucket: process.env.R2_BUCKET!,
       config: {
         credentials: {
           accessKeyId: process.env.R2_ACCESS_KEY_ID!,
           secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
         },
         region: 'auto',
         endpoint: process.env.R2_ENDPOINT!,
       },
     }),
   ]
   ```

3. Add environment variables:
   ```bash
   R2_BUCKET=your-bucket
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret
   R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
   ```

### Option 2: Uploadthing

See [Payload Uploadthing docs](https://payloadcms.com/docs/upload/uploadthing).

## Free Tier Limits Summary

| Service | Free Tier Limits |
|---------|-----------------|
| **Netlify** | 100 GB bandwidth/month, 300 build minutes/month |
| **Neon** | 0.5 GB storage, 191.9 compute hours/month |
| **Stripe** | No monthly fees, 2.9% + 30¢ per transaction |
| **Resend** | 100 emails/day, 3,000 emails/month |
| **Cloudflare R2** | 10 GB storage, 1M requests/month |

## Seed Script (Optional)

After your first deployment, you can optionally run the seed script to create demo content:

```bash
# Set production DATABASE_URI
export DATABASE_URI="your-neon-connection-string"

# Run seed script
pnpm seed
```

**What seed creates:**
- Admin user: `admin@example.com` / `admin1234`
- Demo customer: `demo@example.com` / `demo1234`
- 3 categories (Clothing, Accessories, Home & Living)
- 5 products with images
- 3 shipping methods
- 6 CMS pages (About, Contact, Terms, etc.)
- Footer with columns and social links

**Note:** Seed is not automated - run manually only when you want demo data.

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Using production Stripe keys (`sk_live_`, `pk_live_`)
- [ ] Stripe webhooks configured with production URLs
- [ ] Email domain verified in Resend
- [ ] Custom domain configured (if using)
- [ ] SSL enabled (automatic with Netlify)
- [ ] Test a full checkout flow

## Redeploy After Changes

```bash
# Push changes to GitHub - Netlify auto-deploys
git push

# Or manual deploy via CLI
netlify deploy --prod
```

## Monitoring

- **Netlify**: Dashboard shows deploys, bandwidth, functions usage
- **Neon**: Console shows database metrics, storage usage
- **Stripe**: Dashboard shows payments, webhook logs
- **Resend**: Dashboard shows email delivery stats
