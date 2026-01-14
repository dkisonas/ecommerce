'use client'

// TailwindPlus Component: Ecommerce.Components.Category Filters.With dropdown product filters
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/20/solid'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Category = {
  id: string
  title: string
  slug: string | null | undefined
}

type SortOption = {
  name: string
  value: string
}

type Props = {
  categories: Category[]
  selectedCategories: string[]
  selectedCategoryNames: (string | undefined)[]
  sortOptions: SortOption[]
  currentSort: string
  currentSortName: string
  searchValue?: string
  resultsCount: number
}

export function ProductFiltersBar({
  categories,
  selectedCategories,
  selectedCategoryNames,
  sortOptions,
  currentSort,
  currentSortName: _currentSortName,
  searchValue,
  resultsCount,
}: Props) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sortValue)
    router.push(`/products?${params.toString()}`)
  }

  const handleCategoryChange = useCallback(
    (slug: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString())

      let newCategories: string[]
      if (checked) {
        newCategories = [...selectedCategories, slug]
      } else {
        newCategories = selectedCategories.filter((c) => c !== slug)
      }

      if (newCategories.length > 0) {
        params.set('categories', newCategories.join(','))
      } else {
        params.delete('categories')
      }

      router.push(`/products?${params.toString()}`)
    },
    [router, searchParams, selectedCategories],
  )

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('categories')
    params.delete('q')
    router.push(`/products?${params.toString()}`)
  }, [router, searchParams])

  const hasActiveFilters = selectedCategories.length > 0 || searchValue

  return (
    <>
      {/* Mobile filter dialog */}
      <Dialog open={mobileFiltersOpen} onClose={setMobileFiltersOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/30 dark:bg-black/50 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-50 flex">
          <DialogPanel
            transition
            className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-background dark:bg-card pt-4 pb-6 shadow-xl transition duration-300 ease-in-out data-closed:translate-x-full"
          >
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium text-foreground">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="relative -mr-2 flex size-10 items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Mobile Filters */}
            <div className="mt-4">
              <Disclosure as="div" className="border-t border-border px-4 py-6" defaultOpen>
                <h3 className="-mx-2 -my-3 flow-root">
                  <DisclosureButton className="group flex w-full items-center justify-between px-2 py-3 text-muted-foreground hover:text-foreground">
                    <span className="font-medium text-foreground">Categories</span>
                    <span className="ml-6 flex items-center">
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="size-5 rotate-0 transform group-data-open:-rotate-180 transition-transform"
                      />
                    </span>
                  </DisclosureButton>
                </h3>
                <DisclosurePanel className="pt-6">
                  <div className="space-y-4">
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category.slug || '')
                      return (
                        <div key={category.id} className="flex gap-3">
                          <div className="flex h-5 shrink-0 items-center">
                            <div className="group grid size-4 grid-cols-1">
                              <input
                                checked={isSelected}
                                id={`mobile-category-${category.slug}`}
                                name={`mobile-category-${category.slug}`}
                                type="checkbox"
                                onChange={(e) => handleCategoryChange(category.slug || '', e.target.checked)}
                                className="col-start-1 row-start-1 appearance-none rounded-sm border border-border bg-background checked:border-secondary checked:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary dark:bg-muted/20 dark:checked:border-secondary dark:checked:bg-secondary cursor-pointer"
                              />
                              <svg
                                fill="none"
                                viewBox="0 0 14 14"
                                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-secondary-foreground"
                              >
                                <path
                                  d="M3 8L6 11L11 3.5"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="opacity-0 group-has-checked:opacity-100"
                                />
                              </svg>
                            </div>
                          </div>
                          <label
                            htmlFor={`mobile-category-${category.slug}`}
                            className="text-sm text-muted-foreground cursor-pointer select-none"
                          >
                            {category.title}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </DisclosurePanel>
              </Disclosure>
            </div>

            {/* Clear all button in drawer */}
            {hasActiveFilters && (
              <div className="mt-4 px-4">
                <button
                  type="button"
                  onClick={() => {
                    clearAllFilters()
                    setMobileFiltersOpen(false)
                  }}
                  className="text-sm text-secondary hover:text-secondary/80 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      {/* Filter bar */}
      <section aria-labelledby="filter-heading" className="border-b border-border">
        <h2 id="filter-heading" className="sr-only">
          Filters
        </h2>

        <div className="flex items-center justify-between py-4">
          {/* Sort dropdown */}
          <Menu as="div" className="relative">
            <MenuButton className="group inline-flex items-center justify-center text-sm font-medium text-foreground hover:text-secondary transition-colors">
              Sort
              <ChevronDownIcon
                aria-hidden="true"
                className="-mr-1 ml-1 size-5 shrink-0 text-muted-foreground group-hover:text-secondary transition-colors"
              />
            </MenuButton>

            <MenuItems
              transition
              className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-background dark:bg-card shadow-lg ring-1 ring-border transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
              <div className="py-1">
                {sortOptions.map((option) => (
                  <MenuItem key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSortChange(option.value)}
                      className={`block w-full px-4 py-2 text-left text-sm data-focus:bg-muted transition-colors ${
                        currentSort === option.value
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {option.name}
                    </button>
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-secondary transition-colors lg:hidden"
          >
            <FunnelIcon className="size-5" />
            Filters
            {selectedCategories.length > 0 && (
              <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                {selectedCategories.length}
              </span>
            )}
          </button>

          {/* Desktop: hidden placeholder to maintain layout */}
          <div className="hidden lg:block" />
        </div>
      </section>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="py-3 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>

            {searchValue && (
              <Link
                href={`/products?${new URLSearchParams({
                  ...(selectedCategories.length > 0 ? { categories: selectedCategories.join(',') } : {}),
                  ...(currentSort !== 'title' ? { sort: currentSort } : {}),
                }).toString()}`}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground hover:bg-muted transition-colors"
              >
                &quot;{searchValue}&quot;
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
                  ...(currentSort !== 'title' ? { sort: currentSort } : {}),
                }).toString()}`}
                className="inline-flex items-center gap-1 rounded-full border border-secondary bg-secondary/10 px-3 py-1 text-sm text-secondary hover:bg-secondary/20 transition-colors"
              >
                {name}
                <XMarkIcon className="size-4" />
              </Link>
            ))}

            <span className="text-sm text-muted-foreground ml-2">
              {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
            </span>

            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </>
  )
}
