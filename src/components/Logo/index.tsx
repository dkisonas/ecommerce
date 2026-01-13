'use client'

import { Media, Setting } from '@/payload-types'
import { LogoIcon } from '@/components/icons/logo'
import { useTheme } from '@/providers/Theme'
import Image from 'next/image'
import { cn } from '@/utilities/cn'

type LogoProps = {
  settings?: Pick<Setting, 'logoLight' | 'logoDark'> | null
  className?: string
}

export function Logo({ settings, className }: LogoProps) {
  const { theme } = useTheme()

  // Get logo URLs from settings
  const logoLight = settings?.logoLight
  const logoDark = settings?.logoDark

  // Resolve media URLs
  const lightUrl = typeof logoLight === 'object' && logoLight?.url ? logoLight.url : null
  const darkUrl = typeof logoDark === 'object' && logoDark?.url ? logoDark.url : null

  // Determine which logo to show based on theme
  // If no dark logo is set, use light logo for both themes
  const effectiveDarkUrl = darkUrl || lightUrl

  // If no logos are set, show fallback icon
  if (!lightUrl && !darkUrl) {
    return <LogoIcon className={cn('h-8 w-auto text-foreground', className)} />
  }

  // Show appropriate logo based on theme
  // Use both with CSS classes to handle transitions smoothly
  return (
    <div className={cn('relative h-8 w-auto', className)}>
      {/* Light mode logo */}
      {lightUrl && (
        <Image
          src={lightUrl}
          alt="Logo"
          width={120}
          height={32}
          className={cn(
            'h-8 w-auto object-contain transition-opacity',
            theme === 'dark' && effectiveDarkUrl ? 'opacity-0 absolute' : 'opacity-100',
          )}
          priority
        />
      )}
      {/* Dark mode logo */}
      {effectiveDarkUrl && effectiveDarkUrl !== lightUrl && (
        <Image
          src={effectiveDarkUrl}
          alt="Logo"
          width={120}
          height={32}
          className={cn(
            'h-8 w-auto object-contain transition-opacity',
            theme === 'dark' ? 'opacity-100' : 'opacity-0 absolute',
          )}
          priority
        />
      )}
    </div>
  )
}
