'use client'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

type Props = {
  href: string
  title: string
}

export function Item({ href, title }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const category = searchParams.get('category')

  // Check if this item is active
  // For "All" (/products), active when no category is selected
  // For categories (/products?category=slug), active when category matches
  const isAllProducts = href === '/products'
  const active = isAllProducts
    ? pathname === '/products' && !category
    : href === `/products?category=${category}`

  const DynamicTag = active ? 'p' : Link

  return (
    <li className="mt-2 flex text-sm text-black dark:text-white">
      <DynamicTag
        className={clsx(
          'w-full font-tertiary uppercase text-primary/50 px-2 text-sm py-1 rounded-md hover:bg-white/5 hover:text-primary/100',
          {
            'bg-white/5 text-primary/100': active,
          },
        )}
        href={href}
        prefetch={!active ? false : undefined}
      >
        {title}
      </DynamicTag>
    </li>
  )
}
