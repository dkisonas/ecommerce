// TailwindPlus styled products page with mobile filter drawer
// Adapted for: React, Tailwind v4, dark mode support

import { ProductGridItem } from '@/components/ProductGridItem'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CategoryFilter } from '@/components/CategoryFilter'
import { ProductFiltersBar } from '@/components/ProductFiltersBar'
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

const sortOptions = [
  { name: 'Name (A-Z)', value: 'title' },
  { name: 'Name (Z-A)', value: '-title' },
  { name: 'Price (Low to High)', value: 'priceInGBP' },
  { name: 'Price (High to Low)', value: '-priceInGBP' },
  { name: 'Newest', value: '-createdAt' },
]

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, categories: categoriesParam } = await searchParams
  const payload = await getPayload({ config: configPromise })

  // Parse multi-select categories from comma-separated string
  const selectedCategories = categoriesParam
    ? String(categoriesParam)
        .split(',')
        .filter((c) => c.trim())
    : []

  // Fetch categories for filter
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })

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
      enableVariants: true,
      inventory: true,
      variants: true,
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
        ...(selectedCategories.length > 0
          ? [
              {
                or: selectedCategories.map((cat) => ({
                  'categories.slug': {
                    equals: cat,
                  },
                })),
              },
            ]
          : []),
      ],
    },
  })

  const resultsText = products.docs.length > 1 ? 'results' : 'result'
  const currentSort = sort ? String(sort) : 'title'
  const currentSortName = sortOptions.find((s) => s.value === currentSort)?.name || 'Name (A-Z)'

  // Get selected category names for display
  const selectedCategoryNames = selectedCategories
    .map((slug) => categoriesResult.docs.find((c) => c.slug === slug)?.title)
    .filter(Boolean)

  return (
    <div className="bg-background dark:bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="py-6">
          <Breadcrumbs items={[{ name: 'Products', href: '/products', current: true }]} />
        </div>

        {/* Page header */}
        <div className="pb-10 border-b border-border">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Shop All Products</h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">
            Browse our collection of quality products. Use filters to find exactly what you&apos;re
            looking for.
          </p>
        </div>

        {/* Main content with sidebar */}
        <div className="pt-8 pb-16 lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Sidebar filters - Desktop only */}
          <aside className="hidden lg:block">
            <h2 className="sr-only">Filters</h2>
            <CategoryFilter
              categories={categoriesResult.docs.map((c) => ({
                id: String(c.id),
                title: c.title,
                slug: c.slug,
              }))}
              selectedCategories={selectedCategories}
            />
          </aside>

          {/* Product grid area */}
          <div className="lg:col-span-3">
            {/* Filter bar with sort dropdown and mobile filter button */}
            <ProductFiltersBar
              categories={categoriesResult.docs.map((c) => ({
                id: String(c.id),
                title: c.title,
                slug: c.slug,
              }))}
              selectedCategories={selectedCategories}
              selectedCategoryNames={selectedCategoryNames}
              sortOptions={sortOptions}
              currentSort={currentSort}
              currentSortName={currentSortName}
              searchValue={searchValue ? String(searchValue) : undefined}
              resultsCount={products.docs.length}
            />

            {/* Products grid */}
            <div className="pt-6">
              {products.docs?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {searchValue || selectedCategories.length > 0
                      ? 'Try adjusting your filters or search terms.'
                      : 'Add products in the admin panel to see them here.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-3 xl:gap-x-8">
                  {products.docs.map((product) => (
                    <ProductGridItem key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
