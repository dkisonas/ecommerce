import { getPayload } from 'payload'
import config from '@payload-config'
import { seed } from './index'

async function run() {
  try {
    const payload = await getPayload({ config })
    await seed(payload)
  } catch (error: unknown) {
    console.error('Seed failed:', error)
    if (error && typeof error === 'object' && 'data' in error) {
      console.error('Error details:', JSON.stringify((error as { data: unknown }).data, null, 2))
    }
    process.exit(1)
  }

  process.exit(0)
}

await run()
