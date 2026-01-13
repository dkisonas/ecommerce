import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const ShippingMethods: CollectionConfig = {
  slug: 'shipping-methods',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Shop',
    defaultColumns: ['title', 'price', 'estimatedDays', 'enabled'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Method Name',
      required: true,
      admin: {
        description: 'e.g., "Standard Delivery", "Express Shipping"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Optional description shown to customers',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          label: 'Price (in pence)',
          required: true,
          min: 0,
          admin: {
            description: 'Cost in smallest currency unit (e.g., 499 = £4.99)',
            width: '50%',
          },
        },
        {
          name: 'freeAbove',
          type: 'number',
          label: 'Free Above (in pence)',
          min: 0,
          admin: {
            description: 'Free shipping for orders above this amount. Leave empty to disable.',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'estimatedDays',
      type: 'text',
      label: 'Estimated Delivery',
      admin: {
        description: 'e.g., "3-5 business days", "Next day"',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enabled',
          defaultValue: true,
          admin: {
            description: 'Show this method at checkout',
            width: '50%',
          },
        },
        {
          name: 'sortOrder',
          type: 'number',
          label: 'Sort Order',
          defaultValue: 0,
          admin: {
            description: 'Lower numbers appear first',
            width: '50%',
          },
        },
      ],
    },
  ],
}
