// TailwindPlus styled products page with sidebar filters
// Adapted for: React, Tailwind v4, dark mode support

import { ProductGridItem } from '@/components/ProductGridItem'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CategoryFilter } from '@/components/CategoryFilter'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid'

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
        <div className="pt-12 pb-16 lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Sidebar filters */}
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
            {/* Active filters and sort bar */}
            <div className="flex flex-col gap-4 pb-6 border-b border-border sm:flex-row sm:items-center sm:justify-between">
              {/* Active filters */}
              <div className="flex flex-wrap items-center gap-2">
                {searchValue && (
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(selectedCategories.length > 0 ? { categories: selectedCategories.join(',') } : {}),
                      ...(sort ? { sort: String(sort) } : {}),
                    }).toString()}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    Search: &quot;{searchValue}&quot;
                    <XMarkIcon className="size-4" />
                  </Link>
                )}
                {selectedCategoryNames.map((name, idx) => (
                  <Link
                    key={selectedCategories[idx]}
                    href={`/products?${new URLSearchParams({
                      ...(searchValue ? { q: String(searchValue) } : {}),
                      ...(selectedCategories.length > 1
                        ? { categories: selectedCategories.filter((c) => c !== selectedCategories[idx]).join(',') }
                        : {}),
                      ...(sort ? { sort: String(sort) } : {}),
                    }).toString()}`}
                    className="inline-flex items-center gap-1 rounded-full border border-secondary bg-secondary/10 px-3 py-1 text-sm text-secondary hover:bg-secondary/20 transition-colors"
                  >
                    {name}
                    <XMarkIcon className="size-4" />
                  </Link>
                ))}
                {(searchValue || selectedCategories.length > 0) && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {products.docs.length} {resultsText}
                  </span>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="relative group shrink-0">
                <button
                  type="button"
                  className="group inline-flex items-center justify-center text-sm font-medium text-foreground hover:text-secondary transition-colors"
                >
                  Sort: {currentSortName}
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="-mr-1 ml-1 size-5 shrink-0 text-muted-foreground group-hover:text-secondary"
                  />
                </button>
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-background dark:bg-card shadow-lg ring-1 ring-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <Link
                        key={option.value}
                        href={`/products?${new URLSearchParams({
                          ...(searchValue ? { q: String(searchValue) } : {}),
                          ...(selectedCategories.length > 0 ? { categories: selectedCategories.join(',') } : {}),
                          sort: option.value,
                        }).toString()}`}
                        className={`block px-4 py-2 text-sm hover:bg-muted transition-colors ${
                          currentSort === option.value ? 'font-medium text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {option.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile category filter button */}
            <div className="lg:hidden py-4">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-foreground">
                  <span>Filter by Category</span>
                  <ChevronDownIcon className="size-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 pb-4 border-b border-border">
                  <CategoryFilter
                    categories={categoriesResult.docs.map((c) => ({
                      id: String(c.id),
                      title: c.title,
                      slug: c.slug,
                    }))}
                    selectedCategories={selectedCategories}
                  />
                </div>
              </details>
            </div>

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
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
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
