import type { Field } from 'payload'

/**
 * Navigation link field - provides a user-friendly way to create navigation links
 *
 * Options:
 * - Category: Links to product categories (/products?category={slug})
 * - Page: Links to CMS-managed pages (/{slug})
 * - Custom URL: External or any custom path
 */
export const navLink: Field = {
  name: 'link',
  type: 'group',
  admin: {
    hideGutter: true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          admin: {
            width: '50%',
          },
          defaultValue: 'custom',
          options: [
            { label: 'Category', value: 'category' },
            { label: 'Page', value: 'page' },
            { label: 'Custom URL', value: 'custom' },
          ],
          required: true,
        },
        {
          name: 'newTab',
          type: 'checkbox',
          admin: {
            width: '50%',
            style: {
              alignSelf: 'flex-end',
            },
          },
          label: 'Open in new tab',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        // Category reference
        {
          name: 'category',
          type: 'relationship',
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.type === 'category',
          },
          relationTo: 'categories',
          required: true,
        },
        // Page reference
        {
          name: 'page',
          type: 'relationship',
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.type === 'page',
          },
          relationTo: 'pages',
          required: true,
        },
        // Custom URL
        {
          name: 'url',
          type: 'text',
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.type === 'custom',
          },
          label: 'URL',
          required: true,
        },
        // Label (always shown)
        {
          name: 'label',
          type: 'text',
          admin: {
            width: '50%',
          },
          label: 'Label',
          required: true,
        },
      ],
    },
  ],
}
