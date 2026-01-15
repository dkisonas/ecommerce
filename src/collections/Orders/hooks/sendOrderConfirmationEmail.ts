import type { CollectionAfterChangeHook } from 'payload'

import type { Order, ShippingMethod } from '@/payload-types'

export const sendOrderConfirmationEmail: CollectionAfterChangeHook<Order> = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  const { payload, context } = req
  payload.logger.info(
    `Order hook triggered: operation=${operation}, orderID=${doc.id}, previousDoc=${previousDoc ? `exists (id: ${previousDoc.id})` : 'null'}`,
  )

  // Skip email sending during seeding
  if (context?.skipValidation) {
    payload.logger.info(`Skipping email - seeding mode`)
    return doc
  }

  // Only send email when order is first created (not on updates)
  // Trust the operation parameter - if it says 'create', send the email
  if (operation !== 'create') {
    payload.logger.info(`Skipping email - operation is ${operation}, not 'create'`)
    return doc
  }

  // If operation is 'create', send the email regardless of previousDoc
  // The ecommerce plugin may have previousDoc set, but if operation is 'create', it's a new order

  // Get the email address to send to
  let emailTo: string | undefined

  if (doc.customerEmail) {
    emailTo = doc.customerEmail
  } else if (doc.customer && typeof doc.customer === 'object' && doc.customer.email) {
    emailTo = doc.customer.email
  }

  if (!emailTo) {
    payload.logger.warn(
      `No email address found for order confirmation. Order ID: ${doc.id}, customerEmail: ${doc.customerEmail}, customer: ${doc.customer ? 'exists' : 'null'}`,
    )
    return doc
  }

  // Verify email adapter is configured
  if (!payload.email) {
    payload.logger.error('Email adapter is not configured!')
    return doc
  }

  payload.logger.info(
    `Preparing to send order confirmation email to ${emailTo} for order #${doc.id}`,
  )

  try {
    // Get settings for site name (fetched from Settings global)
    let siteName = 'Our Store'
    let companyName = siteName
    try {
      const settings = await payload.findGlobal({ slug: 'settings' })
      if (settings?.siteName) siteName = settings.siteName
      if (settings?.companyName) companyName = settings.companyName
    } catch (_e) {
      // Use defaults
    }

    // Get order details for the email
    const orderID = doc.id
    const orderTotal = doc.amount
    const currency = doc.currency || 'GBP'
    const subtotal = doc.subtotal || doc.amount
    const shippingCost = doc.shippingCost || 0

    // Get shipping method name
    let shippingMethodName = 'Standard Delivery'
    if (doc.shippingMethod) {
      if (typeof doc.shippingMethod === 'object') {
        shippingMethodName = (doc.shippingMethod as ShippingMethod).title || shippingMethodName
      } else {
        try {
          const shippingMethod = await payload.findByID({
            collection: 'shipping-methods',
            id: doc.shippingMethod,
          })
          if (shippingMethod?.title) shippingMethodName = shippingMethod.title
        } catch (_e) {
          // Use default
        }
      }
    }

    // Format currency amounts
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currency,
      }).format(amount / 100) // Convert from cents/pence to currency units

    const formattedTotal = formatCurrency(orderTotal || 0)
    const formattedSubtotal = formatCurrency(subtotal || 0)
    const formattedShipping = shippingCost === 0 ? 'Free' : formatCurrency(shippingCost || 0)

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const orderUrl = `${serverUrl}/orders/${orderID}${doc.customerEmail ? `?email=${encodeURIComponent(doc.customerEmail)}` : ''}`
    const trackOrderUrl = `${serverUrl}/track-order`

    payload.logger.info(`Sending email via Resend adapter to ${emailTo}`)

    // Send the email with polished template
    const emailResult = await payload.email.sendEmail({
      to: emailTo,
      subject: `Order Confirmation #${orderID} - ${siteName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation - ${siteName}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f0;">
            <!-- Header -->
            <div style="background-color: #1a1a1a; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #c9a85c; letter-spacing: 1px;">
                ${siteName}
              </h1>
            </div>

            <!-- Main Content -->
            <div style="background-color: #ffffff; padding: 40px 32px;">
              <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                Thank you for your order!
              </h2>
              <p style="margin: 0 0 24px 0; color: #666666; font-size: 16px;">
                We've received your order and will begin processing it right away.
              </p>

              <!-- Order Details Box -->
              <div style="background-color: #fafaf8; border: 1px solid #e5e5e0; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">
                  Order Details
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Order Number</td>
                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: 600;">#${orderID}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Status</td>
                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: 500;">
                      <span style="background-color: #c9a85c; color: #1a1a1a; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
                        ${doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : 'Processing'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Shipping</td>
                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">${shippingMethodName}</td>
                  </tr>
                </table>
              </div>

              <!-- Order Summary -->
              <div style="border-top: 1px solid #e5e5e0; padding-top: 24px; margin-top: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Subtotal</td>
                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">${formattedSubtotal}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Shipping</td>
                    <td style="padding: 8px 0; text-align: right; color: ${shippingCost === 0 ? '#22c55e' : '#1a1a1a'};">${formattedShipping}</td>
                  </tr>
                  <tr>
                    <td style="padding: 16px 0 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 600; border-top: 1px solid #e5e5e0;">Total</td>
                    <td style="padding: 16px 0 8px 0; text-align: right; color: #1a1a1a; font-size: 18px; font-weight: 700; border-top: 1px solid #e5e5e0;">${formattedTotal}</td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${orderUrl}"
                   style="display: inline-block; background-color: #c9a85c; color: #1a1a1a; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  View Order Details
                </a>
              </div>

              <p style="margin: 24px 0 0 0; color: #666666; font-size: 14px; text-align: center;">
                You can also track your order status anytime at <a href="${trackOrderUrl}" style="color: #c9a85c; text-decoration: none;">${serverUrl.replace('https://', '').replace('http://', '')}/track-order</a>
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #1a1a1a; padding: 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #888888; font-size: 14px;">
                Questions? Contact us at <a href="mailto:support@${serverUrl.replace('https://', '').replace('http://', '').split('/')[0]}" style="color: #c9a85c; text-decoration: none;">support</a>
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    payload.logger.info(
      `✅ Order confirmation email sent successfully to ${emailTo} for order #${orderID}. Result: ${JSON.stringify(emailResult || 'success')}`,
    )
  } catch (error) {
    payload.logger.error({
      err: error,
      message: `❌ Failed to send order confirmation email for order #${doc.id}`,
    })

    // Log more details about the error
    if (error instanceof Error) {
      payload.logger.error(`Error details: ${error.message}`)
      payload.logger.error(`Error stack: ${error.stack}`)
    }

    // Don't throw - we don't want to break the order creation process
  }

  return doc
}
