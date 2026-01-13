# Testing Plan

Complete manual testing checklist for the ecommerce platform. Run `pnpm seed` before testing to ensure all demo content is available.

---

## Prerequisites

```bash
pnpm seed          # Create demo content
pnpm dev           # Start dev server at http://localhost:3000
```

### Test Accounts

| Account | Email | Password |
|---------|-------|----------|
| Admin | admin@example.com | admin1234 |
| Customer | demo@example.com | demo1234 |
| Guest | guest@example.com | (no login) |

---

## 1. Public Pages (No Login Required)

### 1.1 Homepage

- [ ] Visit `/` - Homepage loads with products
- [ ] Hero section displays correctly
- [ ] Featured products are visible
- [ ] Products link to detail pages
- [ ] Header displays logo and navigation
- [ ] Footer displays columns, links, and social icons

### 1.2 Products Page

- [ ] Visit `/products` - Product grid displays
- [ ] Category filter sidebar works
- [ ] Click category → URL updates to `/products?category={slug}`
- [ ] Sort dropdown changes product order
- [ ] Product cards show image, title, price
- [ ] Hover on product → Quick add button appears
- [ ] Click quick add → Product added to cart (toast notification)

### 1.3 Product Detail Page

- [ ] Click any product → Detail page loads
- [ ] Image gallery displays with thumbnails
- [ ] Click thumbnail → Main image changes
- [ ] Product title, price, description visible
- [ ] **For Classic T-Shirt (has variants):**
  - [ ] Color selector appears
  - [ ] Size selector appears
  - [ ] Select different options → Price may update
  - [ ] Add to cart with variant selected
- [ ] **For Leather Wallet (no variants):**
  - [ ] No variant selectors shown
  - [ ] Add to cart works directly
- [ ] Quantity selector works
- [ ] "Add to Cart" button works
- [ ] Stock indicator shows availability

### 1.4 Cart Modal

- [ ] Click cart icon in header → Cart modal opens
- [ ] Cart shows added items with images
- [ ] Quantity can be adjusted (+/-)
- [ ] Remove item button works
- [ ] Subtotal updates correctly
- [ ] "Checkout" button navigates to `/checkout`
- [ ] Empty cart shows appropriate message

### 1.5 CMS Pages

- [ ] Visit `/about` - About Us page renders
- [ ] Visit `/contact` - Contact page renders
- [ ] Visit `/terms-conditions` - Terms page renders
- [ ] Visit `/privacy-policy` - Privacy page renders
- [ ] Visit `/shipping-policy` - Shipping info renders
- [ ] Visit `/returns-refunds` - Returns info renders
- [ ] Breadcrumbs display on all pages
- [ ] Rich text content renders correctly

---

## 2. Authentication

### 2.1 Login

- [ ] Visit `/login`
- [ ] Form displays email and password fields
- [ ] Enter invalid credentials → Error message shown
- [ ] Enter `demo@example.com` / `demo1234` → Login successful
- [ ] Redirects to homepage after login
- [ ] Header shows account icon (logged in state)

### 2.2 Create Account

- [ ] Visit `/create-account`
- [ ] Form displays name, email, password fields
- [ ] Submit with existing email → Error shown
- [ ] Submit with new valid email → Account created
- [ ] Redirects to homepage after creation
- [ ] New user can log in

### 2.3 Forgot Password

- [ ] Visit `/forgot-password`
- [ ] Enter email address
- [ ] Submit → Confirmation message shown
- [ ] (Email delivery depends on Resend configuration)

### 2.4 Logout

- [ ] While logged in, click account dropdown
- [ ] Click "Sign Out"
- [ ] User is logged out
- [ ] Redirected to homepage
- [ ] Header shows logged-out state

---

## 3. Checkout Flow

### 3.1 Guest Checkout

- [ ] Add products to cart (not logged in)
- [ ] Go to `/checkout`
- [ ] **Step 1: Contact & Shipping**
  - [ ] Enter email: `newguest@test.com`
  - [ ] Enter shipping address details
  - [ ] Click "Continue to Shipping"
- [ ] **Step 2: Shipping Method**
  - [ ] Three shipping options displayed
  - [ ] Standard Delivery: £3.99 (or Free if cart > £30)
  - [ ] Express Delivery: £7.99
  - [ ] Free Shipping: £0.00
  - [ ] Select a shipping method
  - [ ] Order summary updates with shipping cost
  - [ ] Click "Continue to Payment"
- [ ] **Step 3: Payment**
  - [ ] Stripe payment form displays
  - [ ] Enter test card: `4242 4242 4242 4242`
  - [ ] Any future expiry, any CVC
  - [ ] Click "Pay Now"
- [ ] **Confirmation**
  - [ ] Redirects to `/checkout/confirm-order`
  - [ ] Order confirmation displays
  - [ ] Order number shown
  - [ ] (Email sent if Resend configured)

### 3.2 Logged-in Checkout

- [ ] Log in as `demo@example.com`
- [ ] Add products to cart
- [ ] Go to `/checkout`
- [ ] Email pre-filled from account
- [ ] Saved addresses available (if any)
- [ ] Complete checkout as above

### 3.3 Free Shipping Threshold

- [ ] Add £30+ worth of products
- [ ] Go to checkout → Select Standard Delivery
- [ ] Standard Delivery shows as "Free" (was £3.99)
- [ ] Total reflects free shipping

---

## 4. Account Features (Logged In)

### 4.1 Account Dashboard

- [ ] Log in as `demo@example.com`
- [ ] Visit `/account`
- [ ] Profile card shows name and email
- [ ] Recent orders section shows orders
- [ ] Addresses section shows saved addresses
- [ ] Edit profile button works

### 4.2 Order History

- [ ] Visit `/orders`
- [ ] List of demo orders displayed (6 orders)
- [ ] Orders show status badges:
  - [ ] Completed (green)
  - [ ] Processing (yellow)
  - [ ] Refund Requested (orange)
  - [ ] Refunded (gray)
  - [ ] Partially Refunded (purple)
- [ ] Click an order → Goes to detail page

### 4.3 Order Detail

- [ ] Visit `/orders/{id}` for a completed order
- [ ] Order number, date, status displayed
- [ ] Items list with images and quantities
- [ ] Shipping address shown
- [ ] Shipping method and cost shown
- [ ] Subtotal, shipping, total breakdown
- [ ] "Request Refund" button visible (for eligible orders)

### 4.4 Request Refund

- [ ] Open a completed order
- [ ] Click "Request Refund"
- [ ] Refund form modal opens
- [ ] Select refund type (full/partial)
- [ ] Enter reason
- [ ] Submit request
- [ ] Order status changes to "Refund Requested"
- [ ] Confirmation shown

---

## 5. Track Order (Guest)

### 5.1 Track Order Page

- [ ] Visit `/track-order` (not logged in)
- [ ] Form shows email and order ID fields
- [ ] Enter invalid email/ID → Error message
- [ ] Enter `guest@example.com` and guest order ID from seed
- [ ] Click "Find Order"
- [ ] Redirects to `/orders/{id}?email=guest@example.com`
- [ ] Order details displayed for guest

### 5.2 Direct Link Access

- [ ] Copy URL: `/orders/{guestOrderId}?email=guest@example.com`
- [ ] Open in incognito/new browser
- [ ] Order displays without login
- [ ] Try wrong email in URL → Access denied

---

## 6. Dark Mode

### 6.1 Theme Toggle (When Enabled)

- [ ] Footer shows theme selector (sun/moon/auto icons)
- [ ] Click moon icon → Dark mode activates
- [ ] All pages render correctly in dark mode:
  - [ ] Homepage
  - [ ] Products page
  - [ ] Product detail
  - [ ] Checkout
  - [ ] Account pages
  - [ ] CMS pages
- [ ] Click sun icon → Light mode activates
- [ ] Click auto icon → Follows system preference
- [ ] Theme persists across page navigation
- [ ] Theme persists after refresh

### 6.2 Dark Mode Disabled (Admin Setting)

- [ ] Go to Admin → Settings → Appearance
- [ ] Uncheck "Enable Dark Mode"
- [ ] Save
- [ ] Visit frontend → Theme selector hidden
- [ ] Site always in light mode
- [ ] Re-enable and verify selector returns

---

## 7. Footer Configuration

### 7.1 Footer Columns

- [ ] Footer displays 3 columns: Shop, Support, Company
- [ ] **Shop column:**
  - [ ] "All Products" links to `/products`
  - [ ] Category links work
- [ ] **Support column:**
  - [ ] "Contact Us" links to `/contact`
  - [ ] "Shipping Policy" links to `/shipping-policy`
  - [ ] "Returns & Refunds" links to `/returns-refunds`
  - [ ] "Track Order" links to `/track-order`
- [ ] **Company column:**
  - [ ] "About Us" links to `/about`
  - [ ] "Privacy Policy" links to `/privacy-policy`
  - [ ] "Terms & Conditions" links to `/terms-conditions`

### 7.2 Social Links

- [ ] Social icons display (Instagram, Facebook, Twitter)
- [ ] Click Instagram → Opens instagram.com/demostore
- [ ] Click Facebook → Opens facebook.com/demostore
- [ ] Click Twitter → Opens twitter.com/demostore

### 7.3 Footer Branding

- [ ] Logo displays in footer
- [ ] Tagline shows: "Quality products, exceptional service"
- [ ] Copyright shows: "© 2026 Demo Store Ltd"

---

## 8. Header & Navigation

### 8.1 Header Elements

- [ ] Logo displays and links to `/`
- [ ] Navigation items: Products, Clothing, Accessories, Home & Living
- [ ] Cart icon shows item count badge
- [ ] Account icon shows (logged out: links to login)

### 8.2 Account Dropdown (Logged In)

- [ ] Log in → Account icon changes
- [ ] Click account icon → Dropdown opens
- [ ] Shows user name/email
- [ ] Links: Account, Orders, Addresses, Sign Out
- [ ] Each link navigates correctly

### 8.3 Mobile Navigation

- [ ] Resize to mobile width
- [ ] Hamburger menu appears
- [ ] Click menu → Mobile nav opens
- [ ] All navigation items accessible
- [ ] Cart and account accessible

---

## 9. Admin Panel

### 9.1 Admin Login

- [ ] Visit `/admin`
- [ ] Login with `admin@example.com` / `admin1234`
- [ ] Dashboard loads

### 9.2 Orders Management

- [ ] Go to Admin → Orders
- [ ] 7 demo orders visible (6 customer + 1 guest)
- [ ] Filter by status works
- [ ] Click order → Detail view opens
- [ ] Shipping method visible in order
- [ ] Admin notes section available

### 9.3 Products Management

- [ ] Go to Admin → Products
- [ ] 5 demo products visible
- [ ] Click product → Edit form opens
- [ ] Can edit title, price, description
- [ ] Gallery images manageable

### 9.4 Refund Requests

- [ ] Go to Admin → Refund Requests
- [ ] Demo refund requests visible
- [ ] Can approve/reject requests
- [ ] Rejection requires reason

### 9.5 Settings

- [ ] Go to Admin → Settings
- [ ] **Branding tab:**
  - [ ] Site Name: "Demo Store"
  - [ ] Company Name: "Demo Store Ltd"
  - [ ] Tagline editable
  - [ ] Logo upload fields
- [ ] **Appearance tab:**
  - [ ] Enable Dark Mode checkbox
- [ ] **Notifications tab:**
  - [ ] Form Submission Email field
- [ ] Changes reflect on frontend after save

### 9.6 Footer Configuration

- [ ] Go to Admin → Footer
- [ ] Columns array visible with 3 items
- [ ] Can add/remove/edit columns
- [ ] Social links section
- [ ] Changes reflect on frontend

### 9.7 Shipping Methods

- [ ] Go to Admin → Shipping Methods
- [ ] 3 methods visible
- [ ] Can edit prices, thresholds
- [ ] Can enable/disable methods
- [ ] Changes reflect in checkout

### 9.8 Pages

- [ ] Go to Admin → Pages
- [ ] 6 demo pages visible
- [ ] Can edit content with rich text editor
- [ ] Can add Form blocks to pages
- [ ] Changes reflect on frontend

### 9.9 Forms

- [ ] Go to Admin → Forms
- [ ] "Contact Form" visible
- [ ] Can edit fields
- [ ] Go to Admin → Form Submissions
- [ ] View any test submissions

---

## 10. Forms & Contact

### 10.1 Contact Form Submission

- [ ] Visit `/contact`
- [ ] Fill form: name, email, subject, message
- [ ] Submit form
- [ ] Confirmation message displays
- [ ] Go to Admin → Form Submissions
- [ ] Submission appears in list
- [ ] (Email sent if Resend + formSubmissionEmail configured)

---

## 11. Email Notifications

> Note: Requires Resend API key and EMAIL_FROM_ADDRESS configured

### 11.1 Order Confirmation Email

- [ ] Complete a checkout
- [ ] Check email inbox
- [ ] Email received with:
  - [ ] Site name in header
  - [ ] Order number and status
  - [ ] Shipping method
  - [ ] Subtotal, shipping cost, total
  - [ ] "View Order Details" button
  - [ ] Track order link

### 11.2 Form Submission Email

- [ ] Submit contact form
- [ ] Check admin email inbox
- [ ] Email received with:
  - [ ] Form name
  - [ ] Submission timestamp
  - [ ] All field values
  - [ ] "View in Admin" button

---

## 12. Error Handling

### 12.1 404 Page

- [ ] Visit `/nonexistent-page`
- [ ] Custom 404 page displays
- [ ] Styled consistently with site
- [ ] Link to go home

### 12.2 Invalid Order Access

- [ ] Visit `/orders/99999` (non-existent)
- [ ] Appropriate error shown
- [ ] Visit `/orders/{id}?email=wrong@email.com`
- [ ] Access denied message

---

## 13. Responsive Design

### 13.1 Mobile (< 640px)

- [ ] Homepage renders correctly
- [ ] Products grid is single column
- [ ] Product detail scrollable
- [ ] Checkout form usable
- [ ] Cart modal full-screen
- [ ] Footer stacks vertically

### 13.2 Tablet (640px - 1024px)

- [ ] Products grid 2-3 columns
- [ ] Checkout layout adapts
- [ ] All features accessible

### 13.3 Desktop (> 1024px)

- [ ] Full layout displays
- [ ] Sidebar filters visible
- [ ] Multi-column footer

---

## Quick Test Scenarios

### Scenario A: Guest Purchase

1. Browse products (not logged in)
2. Add T-Shirt (Red, Medium) to cart
3. Add Ceramic Mug to cart
4. Checkout as guest
5. Select Express Delivery
6. Pay with test card
7. Note order ID
8. Visit `/track-order`
9. Enter email and order ID
10. View order details

### Scenario B: Returning Customer

1. Log in as `demo@example.com`
2. View existing orders at `/orders`
3. Request refund on completed order
4. Check order status changes
5. Add new items to cart
6. Checkout (email pre-filled)
7. Complete purchase
8. View new order in history

### Scenario C: Admin Workflow

1. Log in to admin as `admin@example.com`
2. View pending refund requests
3. Approve one, reject one (with reason)
4. Edit a product price
5. Disable a shipping method
6. Update site tagline
7. Verify changes on frontend

---

## Notes

- **Test Card Numbers:**
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`

- **Stripe Webhooks:** For local testing, run `pnpm stripe-webhooks` in separate terminal

- **Email Testing:** If Resend not configured, emails won't send but orders still complete

- **Database Reset:** Run `pnpm seed` to reset all demo content
