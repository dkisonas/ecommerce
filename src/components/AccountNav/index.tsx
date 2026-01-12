'use client'

import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  className?: string
}

export const AccountNav: React.FC<Props> = ({ className }) => {
  const pathname = usePathname()

  return (
    <div className={clsx(className)}>
      <ul className="flex flex-col gap-2">
        <li>
          <Button
            asChild
            variant="link"
            className={clsx('text-foreground/50 hover:text-foreground hover:no-underline', {
              'text-foreground': pathname === '/orders' || pathname.includes('/orders'),
            })}
          >
            <Link href="/orders">Orders</Link>
          </Button>
        </li>

        <li>
          <Button asChild variant="link">
            <Link
              href="/account"
              className={clsx('text-foreground/50 hover:text-foreground hover:no-underline', {
                'text-foreground': pathname === '/account' || pathname.includes('/account'),
              })}
            >
              My Account
            </Link>
          </Button>
        </li>
      </ul>

      <hr className="w-full border-border my-2" />

      <Button
        asChild
        variant="link"
        className="text-foreground/50 hover:text-foreground hover:no-underline"
      >
        <Link href="/logout">Log out</Link>
      </Button>
    </div>
  )
}
