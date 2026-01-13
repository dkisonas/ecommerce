// TailwindPlus styled account layout
// Adapted for: React, Tailwind v4, dark mode support

import type { ReactNode } from 'react'

import { RenderParams } from '@/components/RenderParams'

export default async function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background dark:bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RenderParams className="my-4" />
        {children}
      </div>
    </div>
  )
}
