import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const metadata = {
  description: 'Search for products in the store.',
  title: 'Shop',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category } = await searchParams
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInGBP: true,
    },
    sort: sort ? String(sort) : 'title',
    where: {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
        ...(searchValue
          ? [
              {
                or: [
                  {
                    title: {
                      like: searchValue,
                    },
                  },
                  {
                    description: {
                      like: searchValue,
                    },
                  },
                ],
              },
            ]
          : []),
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

  const resultsText = products.docs.length > 1 ? 'results' : 'result'

  return (
    <div>
      {searchValue ? (
        <p className="mb-4 text-foreground font-primary">
          {products.docs?.length === 0
            ? 'There are no products that match '
            : `Showing ${products.docs.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {products.docs?.length === 0 && !searchValue && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add products in the admin panel to see them here.
          </p>
        </div>
      )}

      {products?.docs.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.docs.map((product) => {
            return <ProductGridItem key={product.id} product={product} />
          })}
        </Grid>
      ) : null}
    </div>
  )
}
