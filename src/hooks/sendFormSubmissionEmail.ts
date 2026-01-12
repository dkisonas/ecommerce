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

  // Fetch the form submission email from Settings global
  let settings: Setting | null = null
  try {
    settings = await payload.findGlobal({
      slug: 'settings',
    })
  } catch (_error) {
    payload.logger.warn('Could not fetch Settings global for form submission email')
    return doc
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
      const form = await payload.findByID({
        collection: 'forms',
        id: formId,
      }) as Form
      formTitle = form?.title || 'Unknown Form'
    } catch (_error) {
      payload.logger.warn(`Could not fetch form details for submission ${doc.id}`)
    }
  }

  // Format submission data as HTML table rows
  const submissionDataHtml = doc.submissionData
    ?.map((item) => `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${item.field}</td><td style="padding: 8px; border: 1px solid #ddd;">${item.value || '-'}</td></tr>`)
    .join('') || '<tr><td colspan="2">No data submitted</td></tr>'

  // Format timestamp
  const submittedAt = new Date(doc.createdAt).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  try {
    payload.logger.info(`Sending form submission notification to ${emailTo} for form "${formTitle}"`)

    await payload.email.sendEmail({
      to: emailTo,
      subject: `New form submission: ${formTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Form Submission</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c3e50;">New Form Submission</h1>
            <p>A new submission has been received from your website.</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #2c3e50;">${formTitle}</h2>
              <p><strong>Submitted:</strong> ${submittedAt}</p>
              <p><strong>Submission ID:</strong> #${doc.id}</p>
            </div>

            <h3 style="color: #2c3e50;">Submission Data</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Field</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Value</th>
                </tr>
              </thead>
              <tbody>
                ${submissionDataHtml}
              </tbody>
            </table>

            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin/collections/form-submissions/${doc.id}"
                 style="color: #007bff; text-decoration: none;">
                View in Admin
              </a>
            </p>

            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              This email was sent because you have form notifications enabled in your store settings.
            </p>
          </body>
        </html>
      `,
    })

    payload.logger.info(`Form submission notification sent to ${emailTo} for submission #${doc.id}`)
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
