import type { GlobalConfig } from 'payload'

import { navLink } from '@/fields/navLink'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [navLink],
      maxRows: 6,
    },
  ],
}
