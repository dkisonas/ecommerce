# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

### Initial Setup

```bash
pnpm install                # Install dependencies
pnpm approve-builds         # Approve build scripts (esbuild, git-hooks, etc.)
cp .env.example .env        # Copy and configure environment variables
pnpm dev                    # Start dev server
```

### Common Commands

```bash
pnpm dev                    # Start dev server (http://localhost:3000)
pnpm build                  # Production build
pnpm start                  # Start production server
pnpm seed                   # Re-run seed script to reset demo content
pnpm lint                   # Run ESLint
pnpm lint:fix               # Fix linting issues
pnpm generate:types         # Regenerate TypeScript types after schema changes
pnpm payload migrate        # Run database migrations
pnpm stripe-webhooks        # Forward Stripe webhooks to localhost (local dev)
```

### Testing

```bash
pnpm test                   # Run all tests (integration + E2E)
pnpm test:int               # Run Vitest integration tests only
pnpm test:e2e               # Run Playwright E2E tests only
```

## Architecture Overview

This is a **Payload CMS 3.x** ecommerce application using **Next.js 15 App Router** with **PostgreSQL**.

### Key Directories

- `src/collections/` - Payload collection definitions (database models)
- `src/globals/` - Site-wide configuration (Header, Footer)
- `src/blocks/` - Rich text embeddable blocks (Banner, CallToAction, Code, Form, MediaBlock)
- `src/access/` - Access control functions
- `src/config/` - Centralized configuration (store settings, currency)
- `src/seed/` - Auto-seed script for default content
- `src/app/(app)/` - Customer-facing routes
- `src/app/(payload)/admin/` - Admin panel routes
- `src/components/` - React components
- `src/providers/` - React context providers (Auth, Theme, Ecommerce)

### Plugin-Based Architecture

The codebase extends Payload's `@payloadcms/plugin-ecommerce` and `@payloadcms/plugin-stripe`. Collections like Products, Orders, and Transactions are **overridden** rather than replaced—hooks must be merged to preserve plugin functionality.

### Seed Script

Run `pnpm seed` to create demo content:
- Home page (slug: "home")
- Header navigation (Home, Shop links)
- Footer navigation
- Demo categories (Clothing, Accessories, Home & Living)

### Simplified Content Model

- **Pages**: Title + Rich Text content (with embeddable Form blocks) + SEO
- **Products**: Title + Description + Gallery + Price/Inventory + Categories + SEO
- **Homepage**: Automatically displays all published products

### Rich Text Blocks

The following blocks can be embedded in rich text content:
- `FormBlock` - Contact forms (via form-builder plugin)
- `BannerBlock` - Alerts and announcements
- `CallToActionBlock` - CTA buttons
- `MediaBlock` - Images
- `CodeBlock` - Code snippets

## Important Patterns

### Currency Configuration

Currency is configured in a single location: `src/config/store.ts`

```typescript
export const storeConfig = {
  currency: {
    code: 'GBP',
    symbol: '£',
    decimals: 2,
    label: 'British Pound',
  },
}
```

### Home Page

The page with slug `home` serves as the homepage (`/`) and automatically displays all published products.

### Access Control Hierarchy

- `adminOnly` - Admin users only
- `adminOrSelf` - Admin or the user themselves
- `adminOrCustomerOwner` - Admin or order/cart owner
- `adminOrPublishedStatus` - Admin or published content (for public viewing)

### Path Aliases

```typescript
"@/*" → "./src/*"
```

## Code Style

- Prettier: 100 char width, no semicolons, single quotes, trailing commas
- TypeScript strict mode enabled
- Always run `pnpm generate:types` after modifying collection schemas

## Environment Variables

Required:
- `DATABASE_URI` - PostgreSQL connection string
- `PAYLOAD_SECRET` - Min 32 chars
- `NEXT_PUBLIC_SERVER_URL` - Base URL for images and previews
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOKS_SIGNING_SECRET`
- `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`

Optional:
- `SITE_NAME`, `COMPANY_NAME` - Used in footer/metadata
- `PREVIEW_SECRET` - For draft preview functionality

## Recent Simplification Work (January 2026)

### Completed

1. **Seed script** - Run `pnpm seed` to create demo content (`src/seed/index.ts`)
2. **Simplified Pages collection** - Removed complex layout builder and hero, now uses simple rich text with FormBlock support
3. **Simplified Products collection** - Removed layout blocks, kept variants and SEO
4. **Homepage shows products** - `src/app/(app)/[slug]/page.tsx` displays ProductGrid on home page
5. **Centralized config** - Currency in `src/config/store.ts`, imported by plugins and providers
6. **Actionable onboarding** - BeforeDashboard shows quick links to create products
7. **Cleaned up blocks** - Removed ArchiveBlock, Carousel, ThreeItemGrid, Content, RenderBlocks.tsx
8. **Documentation** - Created `FEATURES.md` and `docs/SETUP.md`

### Remaining Issues

**Build fails on pre-existing lint warnings** (not from simplification work):
- Unused variables in: account pages, refund APIs, auth provider, form components
- `any` types in: refund APIs, plugins, form components
- React hooks warnings in: StockIndicator, useIgnoredEffect

To fix, run `pnpm lint:fix` or manually address warnings in:
- `src/app/(app)/(account)/` - unused `error` catches, `index` params
- `src/app/(app)/api/refund*/` - `any` types
- `src/blocks/Form/` - unused imports, `any` types
- `src/providers/Auth/` - unused eslint directives, `error` catches
- `src/components/refunds/` - unused imports

### Files Changed in Simplification

| File | Change |
|------|--------|
| `src/seed/index.ts` | NEW - Seed script (run via `pnpm seed`) |
| `src/config/store.ts` | NEW - Centralized currency config |
| `src/components/ProductGrid/index.tsx` | NEW - Reusable product grid |
| `src/payload.config.ts` | Removed auto-seed (use `pnpm seed` instead) |
| `src/collections/Pages/index.ts` | Removed hero/layout, added rich text with FormBlock |
| `src/collections/Products/index.ts` | Removed layout blocks |
| `src/app/(app)/[slug]/page.tsx` | Shows ProductGrid on homepage |
| `src/app/(app)/shop/page.tsx` | Fixed published status filter |
| `src/plugins/index.ts` | Uses centralized config |
| `src/providers/index.tsx` | Uses centralized config |
| `src/components/BeforeDashboard/index.tsx` | Actionable onboarding |
| `src/components/RichText/index.tsx` | Added FormBlock support |
| `FEATURES.md` | NEW - Feature documentation |
| `docs/SETUP.md` | NEW - Detailed setup guide |
| `README.md` | Simplified, links to docs |

### Deleted Files

- `src/blocks/ArchiveBlock/`
- `src/blocks/Carousel/`
- `src/blocks/ThreeItemGrid/`
- `src/blocks/Content/`
- `src/blocks/RenderBlocks.tsx`
