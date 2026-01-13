# System Routes

Complete reference of all frontend routes in the application.

## Public Routes (No Authentication)

### Store Pages

| Route | Purpose | Notes |
|-------|---------|-------|
| `/` | Homepage | Shows featured products |
| `/products` | Product catalog | Filterable by category, sortable |
| `/products?category={slug}` | Filtered catalog | Shows products in category |
| `/products/[slug]` | Product detail | Individual product page with variants |

### Checkout

| Route | Purpose | Notes |
|-------|---------|-------|
| `/checkout` | Checkout flow | Multi-step: Contact → Shipping → Payment |
| `/checkout/confirm-order` | Order confirmation | Shown after successful payment |

### Authentication

| Route | Purpose | Notes |
|-------|---------|-------|
| `/login` | Customer login | Email/password authentication |
| `/create-account` | Registration | New customer signup |
| `/forgot-password` | Password reset | Sends reset email |

### Order Lookup

| Route | Purpose | Notes |
|-------|---------|-------|
| `/track-order` | Guest order lookup | Enter email + order ID to view order |

### CMS Pages

| Route | Purpose | Notes |
|-------|---------|-------|
| `/[slug]` | Dynamic CMS pages | About, Contact, Terms, etc. |

## Authenticated Routes

These routes require customer login (or guest email verification for orders).

### Account Management

| Route | Purpose | Notes |
|-------|---------|-------|
| `/account` | Account dashboard | Profile, recent orders, addresses |

### Orders

| Route | Purpose | Notes |
|-------|---------|-------|
| `/orders` | Order history | List of all customer orders |
| `/orders/[id]` | Order detail | View order, request refunds |
| `/orders/[id]?email={email}` | Guest order access | Access with email verification |

### Logout

Logout is handled via the account dropdown menu, not a dedicated route. The auth provider's `logout()` function clears the session and redirects to home.

## API Routes

### Customer APIs

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/refund-requests` | POST | Submit refund request |

### Admin APIs

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/refunds/process` | POST | Process approved refund |

### Stripe Webhooks

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/stripe/webhooks/ecommerce` | POST | Payment events |
| `/api/stripe/webhooks/refunds` | POST | Refund status events |

### Form Submissions

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/form-submissions` | POST | Submit form data |

## Admin Routes

The Payload CMS admin panel is available at:

### Collections

| Route | Purpose |
|-------|---------|
| `/admin` | Admin dashboard |
| `/admin/collections/products` | Manage products |
| `/admin/collections/orders` | View orders |
| `/admin/collections/shipping-methods` | Configure shipping |
| `/admin/collections/refund-requests` | Review refund requests |
| `/admin/collections/refunds` | View processed refunds |
| `/admin/collections/pages` | Manage CMS pages |
| `/admin/collections/categories` | Manage categories |
| `/admin/collections/forms` | Manage forms |
| `/admin/collections/form-submissions` | View submissions |
| `/admin/collections/users` | Manage users |
| `/admin/collections/media` | Media library |

### Globals

| Route | Purpose |
|-------|---------|
| `/admin/globals/header` | Edit header navigation |
| `/admin/globals/footer` | Edit footer columns and social links |
| `/admin/globals/settings` | Site branding and settings |

## Navigation Configuration

### Header Structure

The header contains:
1. **Logo** - Links to home (`/`), switches between light/dark variants
2. **Nav Items** - Configurable links (Products, Categories, Pages)
3. **Account Icon** - User menu (desktop only)
   - Logged out: Links to `/login`
   - Logged in: Dropdown with Account, Orders, Sign Out
4. **Cart Icon** - Opens cart modal with item count badge

### Footer Structure

The footer contains:
1. **Logo and Tagline** - Site branding
2. **Columns** - Up to 4 configurable link columns
3. **Social Icons** - Facebook, Instagram, X, TikTok, YouTube, LinkedIn
4. **Theme Selector** - Light/Dark/Auto (if enabled in settings)
5. **Copyright** - Company name and year

### Adding Navigation Items

**Header:** Go to Settings > Header

**Footer Columns:** Go to Settings > Footer
- Add columns with title and links
- Each link can be Category, Page, or Custom URL type

### Link Types

| Type | Use Case | Result |
|------|----------|--------|
| Category | Link to Clothing | `/products?category=clothing` |
| Page | Link to About page | `/about` |
| Custom URL | External site | `https://example.com` |

## Route File Structure

```
src/app/(app)/
├── page.tsx                    # Homepage (/)
├── products/
│   ├── page.tsx                # Product catalog (/products)
│   └── [slug]/
│       └── page.tsx            # Product detail (/products/[slug])
├── checkout/
│   ├── page.tsx                # Checkout (/checkout)
│   └── confirm-order/
│       └── page.tsx            # Confirmation (/checkout/confirm-order)
├── login/
│   └── page.tsx                # Login (/login)
├── create-account/
│   └── page.tsx                # Register (/create-account)
├── forgot-password/
│   └── page.tsx                # Password reset (/forgot-password)
├── (account)/
│   ├── account/
│   │   └── page.tsx            # Dashboard (/account)
│   └── orders/
│       ├── page.tsx            # Order history (/orders)
│       └── [id]/
│           └── page.tsx        # Order detail (/orders/[id])
├── track-order/
│   └── page.tsx                # Guest order lookup (/track-order)
├── [slug]/
│   └── page.tsx                # CMS pages (/[slug])
└── api/
    ├── refund-requests/
    │   └── route.ts            # POST /api/refund-requests
    ├── refunds/
    │   └── process/
    │       └── route.ts        # POST /api/refunds/process
    └── stripe/
        └── webhooks/
            ├── ecommerce/
            │   └── route.ts    # POST /api/stripe/webhooks/ecommerce
            └── refunds/
                └── route.ts    # POST /api/stripe/webhooks/refunds
```

## Static vs Dynamic Routes

### Static (Always Available)

These routes don't require database content:
- `/` - Homepage
- `/products` - Product catalog
- `/checkout` - Checkout flow
- `/login`, `/create-account`, `/forgot-password` - Auth pages
- `/account`, `/orders` - Account pages
- `/track-order` - Guest order lookup

### Dynamic (CMS-Managed)

These routes depend on database content:
- `/products/[slug]` - Product pages (from Products collection)
- `/[slug]` - CMS pages (from Pages collection)
- `/products?category=[slug]` - Category filters (from Categories collection)
