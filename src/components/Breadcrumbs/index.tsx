// TailwindPlus Component: Application UI.Navigation.Breadcrumbs.Simple with chevrons
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support

import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

export type BreadcrumbItem = {
  name: string
  href: string
  current?: boolean
}

type Props = {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {items.map((item) => (
          <li key={item.name}>
            <div className="flex items-center">
              <ChevronRightIcon
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground"
              />
              <Link
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={`ml-4 text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
