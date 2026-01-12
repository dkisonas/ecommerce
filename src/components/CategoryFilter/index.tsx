// TailwindPlus Component: Application UI.Forms.Checkboxes.Simple list with heading
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Category = {
  id: string
  title: string
  slug: string | null | undefined
}

type Props = {
  categories: Category[]
  selectedCategories: string[]
}

export function CategoryFilter({ categories, selectedCategories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('categories')
    router.push(`/products?${params.toString()}`)
  }, [router, searchParams])

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-foreground">Categories</legend>
      <div className="mt-4 space-y-3">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.slug || '')
          return (
            <div key={category.id} className="flex gap-3">
              <div className="flex h-5 shrink-0 items-center">
                <div className="group grid size-4 grid-cols-1">
                  <input
                    checked={isSelected}
                    id={`category-${category.slug}`}
                    name={`category-${category.slug}`}
                    type="checkbox"
                    onChange={(e) => handleCategoryChange(category.slug || '', e.target.checked)}
                    className="col-start-1 row-start-1 appearance-none rounded-sm border border-border bg-background checked:border-secondary checked:bg-secondary indeterminate:border-secondary indeterminate:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:border-muted disabled:bg-muted disabled:checked:bg-muted dark:bg-muted/20 dark:checked:border-secondary dark:checked:bg-secondary forced-colors:appearance-auto cursor-pointer"
                  />
                  <svg
                    fill="none"
                    viewBox="0 0 14 14"
                    className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-secondary-foreground group-has-disabled:stroke-muted-foreground"
                  >
                    <path
                      d="M3 8L6 11L11 3.5"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-0 group-has-checked:opacity-100"
                    />
                    <path
                      d="M3 7H11"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-0 group-has-indeterminate:opacity-100"
                    />
                  </svg>
                </div>
              </div>
              <label
                htmlFor={`category-${category.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                {category.title}
              </label>
            </div>
          )
        })}
      </div>
      {selectedCategories.length > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="mt-4 text-sm text-secondary hover:text-secondary/80 transition-colors"
        >
          Clear all
        </button>
      )}
    </fieldset>
  )
}
