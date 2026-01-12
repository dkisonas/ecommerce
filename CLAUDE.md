# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Style

- **Update the plan file after each phase is finished** - When working through multi-phase plans, always update the plan file (in `~/.claude/plans/`) to mark completed phases and track progress.

## Build & Development Commands

### Initial Setup

```bash
pnpm install                # Install dependencies
pnpm approve-builds         # Approve build scripts (esbuild, git-hooks, etc.)
cp .env.example .env        # Copy and configure environment variables
pnpm seed                   # Create demo content (admin, customer, products, orders)
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
- `src/globals/` - Site-wide configuration (Header, Footer, Settings)
- `src/blocks/` - Rich text embeddable blocks (Form only)
- `src/access/` - Access control functions
- `src/config/` - Centralized configuration (store settings, currency)
- `src/seed/` - Seed script for demo content
- `src/hooks/` - Shared hooks (e.g., sendFormSubmissionEmail)
- `src/app/(app)/` - Customer-facing routes
- `src/app/(payload)/admin/` - Admin panel routes
- `src/components/` - React components
- `src/providers/` - React context providers (Auth, Theme, Ecommerce)

### Plugin-Based Architecture

The codebase extends Payload's `@payloadcms/plugin-ecommerce` and `@payloadcms/plugin-stripe`. Collections like Products, Orders, and Transactions are **overridden** rather than replaced—hooks must be merged to preserve plugin functionality.

### Seed Script

Run `pnpm seed` to create complete demo content:
- **Admin account**: admin@example.com / admin1234
- **Demo customer**: demo@example.com / demo1234
- **Categories**: Clothing, Accessories, Home & Living
- **Products**: 5 products with placeholder images from picsum.photos
- **Orders**: 6 demo orders with various statuses (completed, processing, refund_requested, refunded, partially_refunded)
- **Navigation**: Header and footer links configured

### Simplified Content Model

- **Pages**: Title + Rich Text content (with embeddable Form blocks) + SEO
- **Products**: Title + Description + Gallery + Price/Inventory + Categories + SEO
- **Homepage** (`/`): Static page showing products - no database entry needed
- **Products page** (`/products`): Lists all products with search and category filters

### Rich Text Blocks

The following block can be embedded in rich text content:
- `FormBlock` - Contact forms (via form-builder plugin)

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

### Navigation Link Types (navLink field)

The navigation system uses 3 link types:
- **Category** - Links to `/products?category={slug}`
- **Page** - Links to CMS pages `/{slug}`
- **Custom URL** - Any URL (internal or external)

### Order Statuses

Orders can have these statuses:
- `pending` - Awaiting payment
- `processing` - Payment received, being prepared
- `completed` - Order fulfilled
- `refund_requested` - Customer requested refund (pending review)
- `refunded` - Fully refunded
- `partially_refunded` - Partially refunded
- `cancelled` - Order cancelled

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

## Documentation

- `docs/FORMS.md` - How to create and use forms
- `docs/ECOMMERCE.md` - Ecommerce system overview (orders, refunds, etc.)
- `docs/ROUTES.md` - All frontend and API routes
- `docs/ADMIN-GUIDE.md` - Quick reference for admin tasks
- `docs/SETUP.md` - Detailed setup guide

## Project Status (January 2026)

### Completed Simplification Work

All simplification phases are complete. The template is now easy to use for casual users:

1. **Seed Script** - `pnpm seed` creates complete demo store
2. **Simplified Navigation** - 3 link types (Category, Page, Custom URL)
3. **Simplified Pages** - Rich text + FormBlock only
4. **Simplified Products** - Clean tabs layout
5. **Centralized Config** - Currency in `src/config/store.ts`
6. **Forms UX** - Settings global + email notifications on submission
7. **Documentation** - Complete docs for forms, ecommerce, routes, admin
8. **Header UX** - Account dropdown menu, simplified layout
9. **Order Statuses** - Added `refund_requested` status

### Key Files Added/Modified

| File | Purpose |
|------|---------|
| `src/seed/index.ts` | Seed script with products, categories, orders, users |
| `src/globals/Settings.ts` | Store-wide settings (form submission email) |
| `src/hooks/sendFormSubmissionEmail.ts` | Email notifications for form submissions |
| `src/fields/navLink.ts` | Simplified navigation link field |
| `src/components/Header/AccountMenu.tsx` | Account dropdown for desktop |
| `src/config/store.ts` | Centralized currency config |

### Next Phase: Design & UX Improvements

The next phase is design work. This includes:
- Theme consistency fixes
- Dark mode improvements
- Visual hierarchy in cart/checkout
- Typography polish
- Mobile UX improvements

User should provide design reference or style direction before starting this phase.

## TailwindPlus Components

Referring to "component" means TailwindPlus component.

### Default Settings
- **Framework**: `react`
- **Tailwind Version**: `4`

### Mode Parameter
- **Application UI & Marketing**: Use `mode: "system"` (has dark mode support)
- **eCommerce**: Use `mode: "none"` (no dark mode in library), then manually add `dark:` classes to support dark mode

### Usage Guidelines
- Always specify: `framework: "react"`, `tailwind_version: "4"`
- Use dot-separated component paths (e.g., `Application UI.Forms.Input Groups.Input with leading icon`)
- All components must support dark mode - add `dark:` classes manually when needed
- Include the component `__name__` and `__version__` as comments in generated source code
- Adapt components to use existing project patterns and `@/components/ui/` conventions
