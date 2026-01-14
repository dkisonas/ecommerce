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
    // Branding Section
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Branding',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              label: 'Site Name',
              admin: {
                description: 'The name of your store (shown in browser tab and emails)',
              },
            },
            {
              name: 'companyName',
              type: 'text',
              label: 'Company Name',
              admin: {
                description: 'Legal company name (shown in footer copyright)',
              },
            },
            {
              name: 'tagline',
              type: 'text',
              label: 'Tagline',
              admin: {
                description: 'Short tagline shown in the footer',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'logoLight',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Logo (Light Mode)',
                  admin: {
                    description: 'Logo displayed on light backgrounds',
                  },
                },
                {
                  name: 'logoDark',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Logo (Dark Mode)',
                  admin: {
                    description: 'Logo displayed on dark backgrounds',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Appearance',
          fields: [
            {
              name: 'enableDarkMode',
              type: 'checkbox',
              label: 'Enable Dark Mode',
              defaultValue: true,
              admin: {
                description:
                  'Allow users to switch between light and dark mode. When disabled, the site will always use light mode.',
              },
            },
          ],
        },
        {
          label: 'Notifications',
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
        },
        {
          label: 'Store Policies',
          description: 'Shipping and returns messaging shown on product pages',
          fields: [
            {
              type: 'group',
              name: 'shipping',
              label: 'Shipping',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Title',
                  defaultValue: 'Free shipping over £50',
                },
                {
                  name: 'description',
                  type: 'text',
                  label: 'Description',
                  defaultValue: 'Standard delivery 3-5 business days',
                },
              ],
            },
            {
              type: 'group',
              name: 'returns',
              label: 'Returns',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Title',
                  defaultValue: 'Free 30-day returns',
                },
                {
                  name: 'description',
                  type: 'text',
                  label: 'Description',
                  defaultValue: 'Hassle-free returns on all orders',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
