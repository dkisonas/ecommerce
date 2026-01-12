// TailwindPlus styled account layout
// Adapted for: React, Tailwind v4, dark mode support

import type { ReactNode } from 'react'

import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RenderParams } from '@/components/RenderParams'
import { AccountNav } from '@/components/AccountNav'

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return (
    <div className="bg-background dark:bg-background min-h-[80vh]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RenderParams className="mb-6" />

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Sidebar navigation */}
          {user && (
            <aside className="shrink-0 lg:w-64">
              <AccountNav />
            </aside>
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
