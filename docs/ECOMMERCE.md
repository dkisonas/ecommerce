# Ecommerce System Overview

This guide explains how the ecommerce system works, including the collections involved, customer journey, and admin workflows.

## Collections Overview

The ecommerce system uses 5 main collections that work together:

| Collection | Purpose | Created By |
|------------|---------|------------|
| **Carts** | Temporary shopping carts | System (automatic) |
| **Orders** | Completed purchases | System (after payment) |
| **Transactions** | Payment records from Stripe | System (Stripe webhooks) |
| **Refund Requests** | Customer refund requests | Customers |
| **Refunds** | Processed refunds | Admin (after approval) |

## Customer Journey

### 1. Shopping Flow

```
Browse Products → Add to Cart → Checkout → Payment → Order Created
```

1. Customer browses `/products` and individual product pages
2. Items are added to a cart (stored in database + cookie)
3. Customer proceeds to checkout at `/checkout`
4. Customer enters shipping/billing information
5. Payment is processed via Stripe
6. Order is created and confirmation email sent

### 2. Order Tracking

- **Logged-in customers**: View orders at `/orders`
- **Guest customers**: Look up orders at `/find-order` using email

### 3. Refund Flow

```
View Order → Request Refund → Admin Reviews → Refund Processed
```

1. Customer views order at `/orders/[id]`
2. Customer submits refund request with reason
3. Admin reviews request in admin panel
4. Admin approves and processes refund via Stripe
5. Customer receives refunded amount

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
| `status` | `pending`, `processing`, `completed`, `cancelled`, `refunded`, `partially_refunded` |
| `customer` | Link to user account (if registered) |
| `customerEmail` | Email for guest orders |
| `items` | Snapshot of purchased products |
| `amount` | Total amount in cents/pence |
| `currency` | Currency code (e.g., GBP) |
| `transactions` | Links to payment transactions |
| `refunds` | Links to any processed refunds |
| `adminNotes` | Internal notes (admin only) |

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

1. Navigate to **Ecommerce > Orders**
2. Filter by status, date, or search by customer
3. Click an order to view details

### Processing Refund Requests

1. Navigate to **Ecommerce > Refund Requests**
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
              cancelled
                   ↓
              refunded / partially_refunded
```

| Status | Meaning |
|--------|---------|
| `pending` | Order created, payment processing |
| `processing` | Payment confirmed, order being prepared |
| `completed` | Order fulfilled |
| `cancelled` | Order cancelled |
| `refunded` | Full refund processed |
| `partially_refunded` | Partial refund processed |

## Stripe Integration

### Webhooks

The system receives these webhook events:
- `payment_intent.succeeded` - Creates transaction, updates order
- `charge.refunded` - Updates transaction status

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_xxx
```

### Webhook Endpoint

Configure in Stripe Dashboard:
- URL: `https://yourdomain.com/api/stripe/webhooks/ecommerce`
- Events: `payment_intent.succeeded`, `charge.refunded`

## Email Notifications

### Order Confirmation Email

Sent automatically when order is created:
- Recipient: Customer email
- Content: Order number, total, items, view order link

### Refund Status Email

Customers can check refund status through their order page.

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
| `src/collections/Orders.ts` | Orders collection extensions |
| `src/collections/Refunds.ts` | Refunds collection |
| `src/collections/RefundRequests.ts` | Refund requests collection |
| `src/collections/Transactions.ts` | Transactions collection extensions |
| `src/config/store.ts` | Store configuration (currency) |
| `src/app/(app)/api/refund-requests/route.ts` | Customer refund request API |
| `src/app/(app)/api/refunds/process/route.ts` | Admin refund processing API |
