'use client'

import React from 'react'
import type { User } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { EditProfileModal } from './EditProfileModal'
import { UserCircleIcon } from '@heroicons/react/24/outline'

export const ProfileCard: React.FC = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
        <div className="size-12 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-48 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  // Build display name from firstName/lastName or fall back to name field
  const displayName = (user as any).firstName && (user as any).lastName
    ? `${(user as any).firstName} ${(user as any).lastName}`
    : (user as any).firstName || user.name || 'No name set'

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">
            {displayName}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.phone && (
            <p className="text-sm text-muted-foreground">{user.phone}</p>
          )}
        </div>
      </div>
      <EditProfileModal />
    </div>
  )
}
