import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Settings',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'formSubmissionEmail',
      type: 'email',
      label: 'Form Submission Email',
      admin: {
        description:
          'Email address where form submissions will be sent. Leave empty to disable email notifications.',
      },
    },
  ],
}
