import type { GlobalConfig } from 'payload'

import { navLink } from '@/fields/navLink'

export const Header: GlobalConfig = {
  slug: 'header',
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
