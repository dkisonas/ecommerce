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

## Multi-Provider Payment Architecture

The system supports multiple payment providers with both embedded (Stripe) and redirect-based (Paysera, Neopay) payment flows.

### Supported Providers

| Provider | Flow Type | Status |
|----------|-----------|--------|
| **Stripe** | Embedded | Active (default) |
| **Paysera** | Redirect | Optional |
| **Neopay** | Redirect | Optional |

### Payment Flow Types

**Embedded Flow (Stripe)**:
1. User enters payment details on checkout page
2. Payment is processed inline
3. User sees confirmation immediately

**Redirect Flow (Paysera, Neopay)**:
1. User selects payment method
2. User is redirected to provider's payment page
3. After payment, user is redirected back to `/checkout/payment-callback`
4. Order is confirmed and user sees confirmation

### Configuration

#### Environment Variables

```env
# Stripe (default)
STRIPE_SECRET_KEY=sk_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_xxx

# Paysera (optional)
PAYSERA_PROJECT_ID=your_project_id
PAYSERA_SIGN_PASSWORD=your_sign_password
PAYSERA_TEST_MODE=true
NEXT_PUBLIC_PAYSERA_ENABLED=true

# Neopay (optional)
NEOPAY_MERCHANT_ID=your_merchant_id
NEOPAY_SECRET_KEY=your_secret_key
NEOPAY_TEST_MODE=true
NEXT_PUBLIC_NEOPAY_ENABLED=true
```

#### Admin Settings

Navigate to **Settings > Payments** to enable/disable payment methods. The Settings UI provides toggles for each provider.

### Architecture Overview

```
src/lib/payments/
├── types.ts                    # Payment type definitions
├── index.ts                    # Main exports
├── refunds.ts                  # Provider-agnostic refund handler
└── adapters/
    ├── redirect-base.ts        # Base adapter for redirect providers
    ├── paysera/
    │   ├── index.ts            # Paysera adapter exports
    │   ├── provider.ts         # Paysera provider implementation
    │   └── types.ts            # Paysera-specific types
    └── neopay/
        ├── index.ts            # Neopay adapter exports
        ├── provider.ts         # Neopay provider implementation
        └── types.ts            # Neopay-specific types
```

### Checkout Flow

When multiple payment methods are enabled:

1. **Payment Method Selector** appears in checkout
2. User selects preferred method
3. For Stripe: Stripe Elements form appears
4. For redirect providers: User is redirected to provider

### Payment Callback Handling

**Browser Redirects** → `/checkout/payment-callback?provider={provider}`
- Handled by `PaymentCallback` component
- Uses plugin's `confirmOrder` function

**Server Callbacks** → `/api/payments/{provider}/callback`
- Validates provider signature
- Logs callback for audit

### Refund System

Refunds are processed through a provider-agnostic handler:

```typescript
import { processRefund } from '@/lib/payments/refunds'

// Process refund through appropriate provider
const result = await processRefund(
  'stripe',           // Provider name
  'pi_xxx',           // Transaction ID
  1000,               // Amount (optional for partial)
  'Customer request'  // Reason
)
```

**Provider-Specific Refund Behavior**:
- **Stripe**: Automated via Stripe API
- **Paysera**: Returns pending status (manual processing required)
- **Neopay**: Automated via Neopay API

### Adding New Providers

To add a new redirect-based provider:

1. Create adapter in `src/lib/payments/adapters/{provider}/`
2. Implement `RedirectPaymentProvider` interface:
   ```typescript
   interface RedirectPaymentProvider {
     name: string
     label: string
     flowType: 'redirect'
     createPaymentSession(data: PaymentSessionData): Promise<RedirectPaymentResult>
     parseCallback(request: Request): Promise<PaymentCallbackResult>
     refundPayment(transactionId: string, amount?: number): Promise<RefundResult>
   }
   ```
3. Export client adapter from `src/lib/payments/index.ts`
4. Add to `src/providers/index.tsx` in `getAvailablePaymentMethods()`
5. Create callback route at `/api/payments/{provider}/callback`
6. Add environment variables

### Implementation Files

| File | Purpose |
|------|---------|
| `src/lib/payments/types.ts` | Payment type definitions |
| `src/lib/payments/refunds.ts` | Provider-agnostic refund handler |
| `src/providers/index.tsx` | Payment method registration |
| `src/components/checkout/PaymentMethodSelector.tsx` | UI component |
| `src/components/checkout/PaymentCallback.tsx` | Redirect callback handler |
| `src/app/(app)/checkout/payment-callback/page.tsx` | Callback page |
| `src/app/(app)/api/payments/paysera/callback/route.ts` | Paysera webhook |
| `src/app/(app)/api/payments/neopay/callback/route.ts` | Neopay webhook |
| `src/globals/Settings.ts` | Payment settings (Payments tab) |

### Security Considerations

- **Signature Verification**: All callbacks are verified using provider-specific signatures
  - Paysera: MD5 hash verification
  - Neopay: HMAC-SHA256 signature
- **Environment Variables**: Credentials stored in environment, not in code
- **HTTPS Required**: All callback URLs must use HTTPS in production

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
