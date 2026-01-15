import type { CollectionAfterChangeHook } from 'payload'

import type { Form, FormSubmission, Setting } from '@/payload-types'

export const sendFormSubmissionEmail: CollectionAfterChangeHook<FormSubmission> = async ({
  doc,
  req: { payload },
  operation,
}) => {
  // Only send email on new submissions
  if (operation !== 'create') {
    return doc
  }

  // Fetch the settings (site name comes from Settings global)
  let settings: Setting | null = null
  let siteName = 'Our Store'
  let companyName = siteName

  try {
    settings = await payload.findGlobal({
      slug: 'settings',
    })
    if (settings?.siteName) siteName = settings.siteName
    if (settings?.companyName) companyName = settings.companyName
  } catch (_error) {
    payload.logger.warn('Could not fetch Settings global for form submission email')
  }

  const emailTo = settings?.formSubmissionEmail
  if (!emailTo) {
    payload.logger.info('No form submission email configured in Settings - skipping notification')
    return doc
  }

  // Verify email adapter is configured
  if (!payload.email) {
    payload.logger.error('Email adapter is not configured!')
    return doc
  }

  // Fetch the form to get its title
  let formTitle = 'Unknown Form'
  if (doc.form) {
    try {
      const formId = typeof doc.form === 'number' ? doc.form : doc.form.id
      const form = (await payload.findByID({
        collection: 'forms',
        id: formId,
      })) as Form
      formTitle = form?.title || 'Unknown Form'
    } catch (_error) {
      payload.logger.warn(`Could not fetch form details for submission ${doc.id}`)
    }
  }

  // Format submission data as HTML table rows
  const submissionDataHtml =
    doc.submissionData
      ?.map(
        (item) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e0; color: #666666; font-size: 14px; font-weight: 500;">${item.field}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e0; color: #1a1a1a; font-size: 14px;">${item.value || '-'}</td>
        </tr>`,
      )
      .join('') || '<tr><td colspan="2" style="padding: 16px; text-align: center; color: #666;">No data submitted</td></tr>'

  // Format timestamp
  const submittedAt = new Date(doc.createdAt).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const adminUrl = `${serverUrl}/admin/collections/form-submissions/${doc.id}`

  try {
    payload.logger.info(
      `Sending form submission notification to ${emailTo} for form "${formTitle}"`,
    )

    await payload.email.sendEmail({
      to: emailTo,
      subject: `New Form Submission: ${formTitle} - ${siteName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Form Submission - ${siteName}</title>
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
                New Form Submission
              </h2>
              <p style="margin: 0 0 24px 0; color: #666666; font-size: 16px;">
                A new submission has been received from your website.
              </p>

              <!-- Submission Info Box -->
              <div style="background-color: #fafaf8; border: 1px solid #e5e5e0; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${formTitle}
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Submitted</td>
                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a;">${submittedAt}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Submission ID</td>
                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: 600;">#${doc.id}</td>
                  </tr>
                </table>
              </div>

              <!-- Submission Data Table -->
              <h3 style="margin: 32px 0 16px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">
                Submission Data
              </h3>
              <table style="width: 100%; border-collapse: collapse; background-color: #fafaf8; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #1a1a1a;">
                    <th style="padding: 12px 16px; text-align: left; color: #c9a85c; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Field</th>
                    <th style="padding: 12px 16px; text-align: left; color: #c9a85c; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${submissionDataHtml}
                </tbody>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${adminUrl}"
                   style="display: inline-block; background-color: #c9a85c; color: #1a1a1a; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  View in Admin Panel
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #1a1a1a; padding: 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #888888; font-size: 14px;">
                This notification was sent because you have form notifications enabled in your store settings.
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
      `Form submission notification sent to ${emailTo} for submission #${doc.id}`,
    )
  } catch (error) {
    payload.logger.error({
      err: error,
      message: `Failed to send form submission notification for submission #${doc.id}`,
    })

    if (error instanceof Error) {
      payload.logger.error(`Error details: ${error.message}`)
    }

    // Don't throw - we don't want to break the submission process
  }

  return doc
}
