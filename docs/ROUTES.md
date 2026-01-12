# System Routes

Complete reference of all frontend routes in the application.

## Public Routes (No Authentication)

### Store Pages

| Route | Purpose | Notes |
|-------|---------|-------|
| `/` | Homepage | Shows featured products, hero content |
| `/products` | Product catalog | Filterable by category |
| `/products?category={slug}` | Filtered catalog | Shows products in category |
| `/products/[slug]` | Product detail | Individual product page |

### Checkout

| Route | Purpose | Notes |
|-------|---------|-------|
| `/checkout` | Checkout flow | Cart review, shipping, payment |
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
| `/find-order` | Guest order lookup | Enter email to find orders |

### CMS Pages

| Route | Purpose | Notes |
|-------|---------|-------|
| `/[slug]` | Dynamic CMS pages | About, Contact, etc. |

## Authenticated Routes

These routes require customer login.

### Account Management

| Route | Purpose | Notes |
|-------|---------|-------|
| `/account` | Account dashboard | Profile overview |
| `/account/addresses` | Address book | Manage shipping/billing addresses |

### Orders

| Route | Purpose | Notes |
|-------|---------|-------|
| `/orders` | Order history | List of all customer orders |
| `/orders/[id]` | Order detail | View order, request refunds |
| `/orders/[id]?email={email}` | Guest order access | Access with email verification |

### Session

| Route | Purpose | Notes |
|-------|---------|-------|
| `/logout` | Logout | Ends customer session |

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
| `/api/stripe/webhooks/ecommerce` | POST | Ecommerce payment events |
| `/api/stripe/webhooks/refunds` | POST | Refund status events |

### Form Submissions

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/form-submissions` | POST | Submit form data |

## Admin Routes

The Payload CMS admin panel is available at:

| Route | Purpose |
|-------|---------|
| `/admin` | Admin dashboard |
| `/admin/collections/products` | Manage products |
| `/admin/collections/orders` | View orders |
| `/admin/collections/refund-requests` | Review refund requests |
| `/admin/collections/forms` | Manage forms |
| `/admin/collections/form-submissions` | View submissions |
| `/admin/collections/pages` | Manage CMS pages |
| `/admin/globals/header` | Edit navigation |
| `/admin/globals/footer` | Edit footer |
| `/admin/globals/settings` | Store settings |

## Navigation Configuration

### Header Structure

The header contains:
1. **Logo** - Links to home (`/`)
2. **Nav Items** - Configurable links (Products, Categories, Pages)
3. **Account Icon** - User menu (desktop only)
   - Logged out: Links to `/login`
   - Logged in: Dropdown with Account, Orders, Addresses, Logout
4. **Cart Icon** - Opens cart drawer

### Default Navigation Items

**Header Navigation:**
- Products (`/products`)
- Category links (`/products?category={slug}`)

**Footer Navigation:**
- Products (`/products`)
- Custom links as needed

### Adding Navigation Items

1. Go to **Settings > Header** or **Settings > Footer**
2. Add navigation items with link type:
   - **Category**: Links to `/products?category={slug}`
   - **Page**: Links to CMS pages (`/{slug}`)
   - **Custom URL**: Any external or custom path

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
├── logout/
│   └── page.tsx                # Logout (/logout)
├── (account)/
│   ├── account/
│   │   ├── page.tsx            # Dashboard (/account)
│   │   └── addresses/
│   │       └── page.tsx        # Addresses (/account/addresses)
│   └── orders/
│       ├── page.tsx            # Order history (/orders)
│       └── [id]/
│           └── page.tsx        # Order detail (/orders/[id])
├── find-order/
│   └── page.tsx                # Guest order lookup (/find-order)
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

These routes don't require database pages:
- `/` - Homepage
- `/products` - Product catalog
- `/checkout` - Checkout
- `/login`, `/create-account`, `/forgot-password`
- `/account`, `/orders`
- `/find-order`

### Dynamic (CMS-Managed)

These routes depend on database content:
- `/products/[slug]` - Product pages (from Products collection)
- `/[slug]` - CMS pages (from Pages collection)
- `/products?category=[slug]` - Category filters (from Categories collection)
