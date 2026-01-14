'use client'

// TailwindPlus Component: Application UI.Elements.Dropdowns.Simple
// Version: 2026-01-12-184920
// Adapted for: Product sorting dropdown with click-based interaction

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useRouter, useSearchParams } from 'next/navigation'

type SortOption = {
  name: string
  value: string
}

type Props = {
  options: SortOption[]
  currentSort: string
  currentSortName: string
}

export function SortDropdown({ options, currentSort, currentSortName }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sortValue)
    router.push(`/products?${params.toString()}`)
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton className="group inline-flex items-center justify-center text-sm font-medium text-foreground hover:text-secondary transition-colors">
        Sort: {currentSortName}
        <ChevronDownIcon
          aria-hidden="true"
          className="-mr-1 ml-1 size-5 shrink-0 text-muted-foreground group-hover:text-secondary transition-colors"
        />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-background dark:bg-card shadow-lg ring-1 ring-border transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          {options.map((option) => (
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
  )
}
