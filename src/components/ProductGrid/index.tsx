import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type Props = {
  limit?: number
  category?: string
}

export async function ProductGrid({ limit, category }: Props) {
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    limit: limit || 100,
    sort: 'title',
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInGBP: true,
    },
    where: {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
        ...(category
          ? [
              {
                categories: {
                  contains: category,
                },
              },
            ]
          : []),
      ],
    },
  })

  if (products.docs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products available yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Add products in the admin panel to see them here.
        </p>
      </div>
    )
  }

  return (
    <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.docs.map((product) => (
        <ProductGridItem key={product.id} product={product} />
      ))}
    </Grid>
  )
}
