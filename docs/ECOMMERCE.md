# Ecommerce System Overview

This guide explains how the ecommerce system works, including the collections involved, customer journey, and admin workflows.

## Collections Overview

The ecommerce system uses these main collections:

| Collection | Purpose | Created By |
|------------|---------|------------|
| **Carts** | Temporary shopping carts | System (automatic) |
| **Orders** | Completed purchases | System (after payment) |
| **Transactions** | Payment records from Stripe | System (Stripe webhooks) |
| **Shipping Methods** | Configurable shipping options | Admin |
| **Refund Requests** | Customer refund requests | Customers |
| **Refunds** | Processed refunds | Admin (after approval) |

## Customer Journey

### 1. Shopping Flow

```
Browse Products → Add to Cart → Checkout → Select Shipping → Payment → Order Created
```

1. Customer browses `/products` and individual product pages
2. Items are added to a cart (stored in database + cookie)
3. Customer proceeds to checkout at `/checkout`
4. Customer enters shipping/billing information
5. Customer selects shipping method
6. Payment is processed via Stripe
7. Order is created and confirmation email sent

### 2. Order Tracking

- **Logged-in customers**: View orders at `/orders`
- **Guest customers**: Look up orders at `/track-order` using email + order ID

### 3. Refund Flow

```
View Order → Request Refund → Admin Reviews → Refund Processed
```

1. Customer views order at `/orders/[id]`
2. Customer submits refund request with reason
3. Order status changes to `refund_requested`
4. Admin reviews request in admin panel
5. Admin approves and processes refund via Stripe
6. Customer receives refunded amount

## Collection Details

### Carts

Temporary storage for items before purchase.

| Field | Description |
|-------|-------------|
| `items` | Array of products with quantities and variants |
| `customer` | Link to user (if logged in) |
| `total` | Cart total in cents/pence |

**Lifecycle**: Carts are created automatically when items are added. They're cleared after successful checkout.

### Orders

Completed purchases with full order information.

| Field | Description |
|-------|-------------|
| `status` | Order status (see lifecycle below) |
| `customer` | Link to user account (if registered) |
| `customerEmail` | Email for guest orders |
| `items` | Snapshot of purchased products |
| `subtotal` | Items total before shipping (in pence) |
| `shippingMethod` | Selected shipping method |
| `shippingCost` | Shipping cost (in pence) |
| `amount` | Total amount including shipping (in pence) |
| `currency` | Currency code (e.g., GBP) |
| `shippingAddress` | Delivery address |
| `transactions` | Links to payment transactions |
| `refunds` | Links to any processed refunds |
| `totalRefunded` | Total amount refunded |
| `adminNotes` | Internal notes (admin only) |

### Shipping Methods

Configurable shipping options shown at checkout.

| Field | Description |
|-------|-------------|
| `title` | Display name (e.g., "Standard Delivery") |
| `description` | Optional description |
| `price` | Cost in pence (e.g., 399 = £3.99) |
| `freeAbove` | Free shipping threshold (in pence) |
| `estimatedDays` | Delivery estimate (e.g., "3-5 business days") |
| `enabled` | Show at checkout |
| `sortOrder` | Display order (lower = first) |

### Transactions

Payment records created by Stripe webhooks.

| Field | Description |
|-------|-------------|
| `order` | Link to the order |
| `customer` | Link to user |
| `customerEmail` | Email for reference |
| `amount` | Transaction amount |
| `currency` | Currency code |
| `status` | `pending`, `completed`, `failed`, `refunded` |
| `paymentIntentId` | Stripe payment intent ID |
| `stripeChargeId` | Stripe charge ID |

### Refund Requests

Customer-initiated refund requests awaiting admin review.

| Field | Description |
|-------|-------------|
| `order` | Link to the order |
| `type` | `full` or `partial` |
| `amount` | Requested refund amount |
| `reason` | Customer's reason for refund |
| `items` | Selected items for partial refund |
| `status` | `pending`, `approved`, `rejected`, `processed` |
| `customerEmail` | Customer's email |
| `adminNotes` | Admin notes/response |
| `rejectionReason` | Reason if rejected |

### Refunds

Processed refunds with Stripe details.

| Field | Description |
|-------|-------------|
| `order` | Link to the order |
| `refundRequest` | Link to original request |
| `transaction` | Link to original transaction |
| `amount` | Refund amount in cents/pence |
| `type` | `full` or `partial` |
| `status` | `processing`, `completed` |
| `stripeRefundId` | Stripe refund ID |
| `reason` | Refund reason |

## Admin Workflows

### Viewing Orders

1. Navigate to **Shop > Orders**
2. Filter by status, date, or search by customer
3. Click an order to view details

### Managing Shipping Methods

1. Navigate to **Shop > Shipping Methods**
2. Edit prices, thresholds, or descriptions
3. Enable/disable methods as needed
4. Changes reflect immediately in checkout

### Processing Refund Requests

1. Navigate to **Shop > Refund Requests**
2. Filter by `pending` status to see new requests
3. Review the request details and reason
4. Click **Approve** or **Reject**
5. If approved, the refund is processed via Stripe automatically
6. Order status updates to `refunded` or `partially_refunded`

### Manual Refund (Without Customer Request)

1. Navigate to the order
2. Note the transaction ID
3. Process refund through Stripe Dashboard
4. Webhook will update the system automatically

### Adding Admin Notes to Orders

1. Open the order in admin panel
2. Scroll to **Admin Notes** field
3. Add notes (only visible to admins)
4. Save the order

## Order Status Lifecycle

```
pending → processing → completed
              ↓
         refund_requested → refunded / partially_refunded
              ↓
          cancelled
```

| Status | Meaning |
|--------|---------|
| `pending` | Order created, payment processing |
| `processing` | Payment confirmed, order being prepared |
| `completed` | Order fulfilled |
| `refund_requested` | Customer requested refund, awaiting review |
| `refunded` | Full refund processed |
| `partially_refunded` | Partial refund processed |
| `cancelled` | Order cancelled |

## Shipping Method Behavior

### At Checkout

1. All enabled shipping methods are displayed
2. Methods sorted by `sortOrder` (lowest first)
3. If cart subtotal >= `freeAbove`, shipping shows as "Free"
4. First method is auto-selected by default
5. Order summary shows: Subtotal + Shipping = Total

### In Orders

- `shippingMethod` stores reference to selected method
- `shippingCost` stores actual cost at time of order
- If method was free due to threshold, `shippingCost` = 0

## Stripe Integration

### Webhooks

The system receives these webhook events:
- `payment_intent.succeeded` - Creates transaction, updates order
- `payment_intent.payment_failed` - Updates order status
- `charge.refunded` - Updates transaction and order status

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_xxx
```

### Webhook Endpoints

Configure in Stripe Dashboard:
- **Ecommerce**: `https://yourdomain.com/api/stripe/webhooks/ecommerce`
- **Refunds**: `https://yourdomain.com/api/stripe/webhooks/refunds`

Events to enable:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.refund.updated`

## Email Notifications

### Order Confirmation Email

Sent automatically when order is created:
- Recipient: Customer email
- Content: Order number, status, items, shipping method, costs, view order link
- Design: Cream/gold theme matching site branding

### Refund Status

Customers can check refund status through their order page at `/orders/[id]`.

## Payment Architecture (Future)

This section documents the architecture for supporting multiple payment providers beyond Stripe.

### Overview

The current system is tightly coupled to Stripe. To support multiple payment providers (Paysera, Neopay, etc.), the system should be refactored to use a provider-agnostic interface.

### Payment Provider Interface

```typescript
// src/lib/payments/types.ts
interface PaymentProvider {
  id: string                    // e.g., 'stripe', 'paysera', 'neopay'
  name: string                  // Display name
  icon?: string                 // Icon path or URL

  // Core methods
  createPaymentIntent(order: Order): Promise<PaymentIntent>
  confirmPayment(paymentId: string): Promise<PaymentResult>
  refundPayment(paymentId: string, amount: number): Promise<RefundResult>

  // Webhook handling
  handleWebhook(payload: unknown, signature: string): Promise<WebhookResult>
}

interface PaymentIntent {
  id: string
  clientSecret?: string         // For client-side confirmation (Stripe)
  redirectUrl?: string          // For redirect-based providers (Paysera)
  amount: number
  currency: string
}

interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
}
```

### Settings Configuration

Add payment method toggles to Settings global:

```typescript
// In src/globals/Settings.ts, add to tabs:
{
  label: 'Payments',
  fields: [
    {
      name: 'enabledPaymentMethods',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'Paysera', value: 'paysera' },
        { label: 'Neopay', value: 'neopay' },
      ],
      defaultValue: ['stripe'],
    },
    // Provider-specific credentials (or use env vars)
  ],
}
```

### Conditional Stripe Hooks

To make Stripe hooks conditional:

```typescript
// src/collections/Products/hooks/conditionalStripeImage.ts
export const conditionalStripeImage = async (args) => {
  const settings = await getSettings()
  const stripeEnabled = settings.enabledPaymentMethods?.includes('stripe')

  if (!stripeEnabled) {
    return args.data
  }

  // Run existing Stripe image sync logic
  return addStripeImage(args)
}
```

### Provider Implementations

Each provider would have its own implementation file:

```
src/lib/payments/
├── types.ts           # Shared interfaces
├── registry.ts        # Provider registry
├── stripe.ts          # Stripe implementation
├── paysera.ts         # Paysera implementation (future)
└── neopay.ts          # Neopay implementation (future)
```

### Checkout Flow Updates

1. Fetch enabled payment methods from Settings
2. Display payment method selector if multiple enabled
3. Each provider handles its own UI:
   - Stripe: Embedded Elements
   - Paysera/Neopay: Redirect to provider's hosted page
4. Webhook endpoints for each provider

### Migration Path

1. Create payment provider interface
2. Refactor existing Stripe code to implement interface
3. Add Settings fields for payment method selection
4. Make Stripe plugin conditional in `src/plugins/index.ts`
5. Add new providers as needed

### Implementation Notes

- Each provider needs its own webhook endpoint
- Transaction collection should store `provider` field
- Refund logic must be provider-aware
- Consider abstracting the checkout UI to handle both embedded and redirect flows

## Currency Configuration

Currency is configured in `src/config/store.ts`:

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

All amounts are stored in the smallest currency unit (e.g., pence for GBP, cents for USD).

## Files Reference

| File | Purpose |
|------|---------|
| `src/plugins/index.ts` | Ecommerce plugin configuration |
| `src/collections/Orders/index.ts` | Orders collection extensions |
| `src/collections/ShippingMethods.ts` | Shipping methods collection |
| `src/collections/Refunds.ts` | Refunds collection |
| `src/collections/RefundRequests.ts` | Refund requests collection |
| `src/collections/Transactions.ts` | Transactions collection extensions |
| `src/config/store.ts` | Store configuration (currency) |
| `src/components/checkout/ShippingMethodSelector.tsx` | Checkout shipping UI |
| `src/collections/Orders/hooks/sendOrderConfirmationEmail.ts` | Order email hook |
| `src/app/(app)/api/refund-requests/route.ts` | Customer refund request API |
| `src/app/(app)/api/refunds/process/route.ts` | Admin refund processing API |
