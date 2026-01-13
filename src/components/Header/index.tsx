import { getCachedGlobal } from '@/utilities/getGlobals'
import { HeaderClient } from './index.client'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function Header() {
  const header = await getCachedGlobal('header', 2)()

  // Get user server-side for instant rendering (no loading flash)
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return <HeaderClient header={header} user={user} />
}
