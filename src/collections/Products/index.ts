import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionBeforeValidateHook } from 'payload'
import { DefaultDocumentIDType, slugField, Where } from 'payload'
import { addStripeImage } from './hooks/addStripeImage'
import { debugProductBeforeChange, debugProductChange } from './hooks/debugStripeSync'

// Normalize hooks to arrays (Payload hooks can be a function, array, or undefined)
const normalizeHooks = <T>(hooks: T | T[] | undefined): T[] =>
  Array.isArray(hooks) ? hooks : hooks ? [hooks] : []

/**
 * Skip Stripe sync if required fields are missing
 * This prevents errors when creating products before title is set
 * The Stripe plugin requires a 'name' field, which comes from 'title'
 */
const skipStripeSyncIfMissingFields: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  // Only check on create operation
  if (operation === 'create') {
    // If title is missing, empty, or just whitespace, skip Stripe sync
    const title = data?.title
    if (!title || (typeof title === 'string' && title.trim() === '')) {
      if (req.payload) {
        req.payload.logger.info(
          '⏭️ [STRIPE] Skipping sync - title is missing or empty (required for Stripe product name)',
        )
      }
      // Set skipSync flag to prevent Stripe plugin from running
      return {
        ...data,
        skipSync: true,
      }
    }
  }
  // For update operations, let it through (title should already exist)
  return data
}

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ['title', 'priceInGBP', '_status'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    variantOptions: true,
    variants: true,
    variantTypes: true,
    enableVariants: true,
    gallery: true,
    priceInGBP: true,
    inventory: true,
    meta: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'description',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: 'Description',
            },
            {
              name: 'gallery',
              type: 'array',
              label: 'Product Images',
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'variantOption',
                  type: 'relationship',
                  relationTo: 'variantOptions',
                  admin: {
                    condition: (data) => {
                      return data?.enableVariants === true && data?.variantTypes?.length > 0
                    },
                    description: 'Link this image to a specific variant (optional)',
                  },
                  filterOptions: ({ data }) => {
                    if (data?.enableVariants && data?.variantTypes?.length) {
                      const variantTypeIDs = data.variantTypes.map((item: any) => {
                        if (typeof item === 'object' && item?.id) {
                          return item.id
                        }
                        return item
                      }) as DefaultDocumentIDType[]

                      if (variantTypeIDs.length === 0)
                        return {
                          variantType: {
                            in: [],
                          },
                        }

                      const query: Where = {
                        variantType: {
                          in: variantTypeIDs,
                        },
                      }

                      return query
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    }
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Product Details',
          fields: [
            // Include default fields from ecommerce plugin (price, inventory, variants, etc.)
            ...defaultCollection.fields,
            {
              name: 'relatedProducts',
              type: 'relationship',
              label: 'Related Products',
              admin: {
                description: 'Products to show as recommendations',
              },
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  }
                }
                return {
                  id: {
                    exists: true,
                  },
                }
              },
              hasMany: true,
              relationTo: 'products',
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
        sortOptions: 'title',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    slugField(),
  ],
  hooks: {
    ...defaultCollection.hooks,
    beforeValidate: [
      skipStripeSyncIfMissingFields,
      addStripeImage,
      ...normalizeHooks(defaultCollection.hooks?.beforeValidate),
    ],
    beforeChange: [
      ...normalizeHooks(defaultCollection.hooks?.beforeChange),
      debugProductBeforeChange,
    ],
    afterChange: [...normalizeHooks(defaultCollection.hooks?.afterChange), debugProductChange],
  },
})
