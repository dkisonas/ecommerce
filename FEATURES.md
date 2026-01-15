# Features

## Core Features

- **Authentication**: User accounts with admin and customer roles
- **Products & Variants**: Full product management with optional variant support (size, color, etc.)
- **Shopping Cart**: Persistent carts for logged-in users and guests
- **Checkout**: Guest and authenticated checkout flows
- **Payments**: Stripe integration for secure payments
- **Orders**: Complete order management and tracking
- **Refunds**: Customer refund requests and admin processing
- **Email Notifications**: Automated order confirmation and refund status emails
- **SEO**: Built-in SEO optimization per page/product
- **Draft Preview**: Preview content before publishing
- **Media Management**: Image upload and management
- **Search**: Product search functionality
- **Categories**: Product categorization
- **Addresses**: Saved shipping addresses for customers
- **Forms**: Contact forms embeddable in rich text content

## Collections

| Collection | Description |
|------------|-------------|
| **Users** | Admin and customer user accounts |
| **Pages** | Content pages with rich text and embeddable forms |
| **Products** | Ecommerce products with optional variants |
| **Categories** | Product categories |
| **Media** | Image and file uploads |
| **Carts** | Shopping cart management |
| **Orders** | Order records and history |
| **Transactions** | Payment transaction records |
| **Addresses** | Customer shipping addresses |
| **Refunds** | Refund records linked to orders |
| **Refund Requests** | Customer-submitted refund requests |
| **Forms** | Dynamic form definitions |
| **Form Submissions** | Submitted form data |

## Globals

| Global | Description |
|--------|-------------|
| **Header** | Site navigation and header configuration |
| **Footer** | Footer content and links |

## Access Control

| Role | Access Level |
|------|--------------|
| **Admin** | Full access to admin panel and all content |
| **Customer** | Own orders, addresses, carts, and refund requests |
| **Guest** | Checkout with email, view orders by ID |
| **Public** | View published pages and products |

## Technical Stack

- **CMS**: Payload CMS 3.x
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Payments**: Stripe (checkout, webhooks, refunds)
- **Email**: Resend (transactional emails)
- **Styling**: Tailwind CSS + TailwindPlus components
- **Rich Text**: Lexical editor with block support

## Plugins Used

- `@payloadcms/plugin-ecommerce` - Products, carts, orders, inventory
- `@payloadcms/plugin-stripe` - Stripe payment integration
- `@payloadcms/plugin-form-builder` - Dynamic forms
- `@payloadcms/plugin-seo` - SEO fields and generation
- `@payloadcms/richtext-lexical` - Rich text editing

## Currency

Default currency is **GBP (British Pound)**. Change in `src/config/store.ts`:

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

## Auto-Seed

On first run with an empty database, the system automatically creates:
- Home page
- Header navigation (Home, Shop links)
- Footer navigation
- 3 demo categories (Clothing, Accessories, Home & Living)

Run `pnpm seed` to manually re-seed demo content.
