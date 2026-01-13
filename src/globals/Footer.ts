import type { GlobalConfig } from 'payload'

import { navLink } from '@/fields/navLink'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: 'Footer Columns',
      maxRows: 4,
      admin: {
        description: 'Add up to 4 columns of links to the footer',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Column Title',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          maxRows: 8,
          fields: [navLink],
        },
      ],
    },
    {
      name: 'showSocialLinks',
      type: 'checkbox',
      label: 'Show Social Links',
      defaultValue: false,
      admin: {
        description: 'Toggle social media links in the footer',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      maxRows: 6,
      admin: {
        condition: (data) => data?.showSocialLinks === true,
        description: 'Add social media links',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: 'Platform',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'X (Twitter)', value: 'twitter' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'LinkedIn', value: 'linkedin' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
          admin: {
            placeholder: 'https://...',
          },
        },
      ],
    },
    // Legacy field - keep for backwards compatibility
    {
      name: 'navItems',
      type: 'array',
      fields: [navLink],
      maxRows: 6,
      admin: {
        description: 'Legacy navigation items (use Columns instead)',
        condition: () => false, // Hide in admin
      },
    },
  ],
}
