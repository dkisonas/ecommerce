'use client'

import type { Setting } from '@/payload-types'
import { Logo } from '@/components/Logo'

type FooterLogoProps = {
  settings?: Pick<Setting, 'logoLight' | 'logoDark'> | null
}

export function FooterLogo({ settings }: FooterLogoProps) {
  return <Logo settings={settings} />
}
