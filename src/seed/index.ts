import type { Payload } from 'payload'
import type { Category } from '@/payload-types'

/**
 * Seed script - clears demo content and recreates it
 * Uses direct database operations to bypass Stripe/revalidation hooks
 * Run with: pnpm seed
 */
export async function seed(payload: Payload): Promise<void> {
  console.log('🌱 Starting seed...')

  // Clear existing demo content (direct DB to bypass hooks)
  await clearDemoContent(payload)
  console.log('✅ Cleared existing demo content')

  // Create fresh content
  const categories = await createCategories(payload)
  console.log(`✅ Created ${categories.length} categories`)

  const mediaIds = await uploadImages(payload)
  console.log(`✅ Uploaded ${Object.keys(mediaIds).length} images`)

  await createProducts(payload, categories, mediaIds)
  console.log('✅ Created 5 products')

  await createNavigation(payload)
  console.log('✅ Created navigation')

  console.log('🎉 Seed complete!')
}

// Demo product slugs for cleanup
const DEMO_SLUGS = {
  products: ['classic-t-shirt', 'leather-wallet', 'ceramic-mug', 'canvas-tote-bag', 'scented-candle'],
  categories: ['clothing', 'accessories', 'home-and-living'],
}

async function clearDemoContent(payload: Payload) {
  // Delete demo products - wrap in try/catch to handle Stripe hook errors
  try {
    await payload.delete({
      collection: 'products',
      where: {
        slug: { in: DEMO_SLUGS.products },
      },
    })
  } catch {
    // Stripe hook may fail for products without Stripe IDs - that's ok
    console.log('  ⚠️ Some products could not be deleted via API (Stripe sync issue)')
  }

  // Delete demo media
  try {
    await payload.delete({
      collection: 'media',
      where: {
        filename: { contains: 'seed-' },
      },
    })
  } catch {
    // Ignore errors
  }

  // Delete demo categories
  try {
    await payload.delete({
      collection: 'categories',
      where: {
        slug: { in: DEMO_SLUGS.categories },
      },
    })
  } catch {
    // Ignore errors
  }
}

async function createCategories(payload: Payload): Promise<Category[]> {
  const data = [
    { title: 'Clothing', slug: 'clothing' },
    { title: 'Accessories', slug: 'accessories' },
    { title: 'Home & Living', slug: 'home-and-living' },
  ]

  const categories: Category[] = []
  for (const { title, slug } of data) {
    const category = await payload.create({
      collection: 'categories',
      data: { title, slug, generateSlug: false },
    })
    categories.push(category)
  }

  return categories
}

async function uploadImages(payload: Payload): Promise<Record<string, number>> {
  // Using picsum.photos for reliable placeholder images
  const images = [
    { key: 'tshirt', url: 'https://picsum.photos/seed/tshirt/600/600', alt: 'Classic T-Shirt' },
    { key: 'wallet', url: 'https://picsum.photos/seed/wallet/600/600', alt: 'Leather Wallet' },
    { key: 'mug', url: 'https://picsum.photos/seed/mug/600/600', alt: 'Ceramic Mug' },
    { key: 'tote', url: 'https://picsum.photos/seed/totebag/600/600', alt: 'Canvas Tote Bag' },
    { key: 'candle', url: 'https://picsum.photos/seed/candle/600/600', alt: 'Scented Candle' },
  ]

  const mediaIds: Record<string, number> = {}

  for (const { key, url, alt } of images) {
    console.log(`  📷 Downloading ${key}...`)

    const response = await fetch(url)
    if (!response.ok) {
      console.log(`  ⚠️ Failed to download ${key}, skipping`)
      continue
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    const media = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: buffer,
        mimetype: contentType,
        name: `seed-${key}.jpg`,
        size: buffer.length,
      },
    })

    mediaIds[key] = media.id
  }

  return mediaIds
}

async function createProducts(
  payload: Payload,
  categories: Category[],
  mediaIds: Record<string, number>,
) {
  const clothing = categories.find((c) => c.slug === 'clothing')
  const accessories = categories.find((c) => c.slug === 'accessories')
  const homeLiving = categories.find((c) => c.slug === 'home-and-living')

  const products = [
    {
      title: 'Classic T-Shirt',
      slug: 'classic-t-shirt',
      priceInGBP: 25,
      inventory: 100,
      categories: clothing ? [clothing.id] : [],
      imageKey: 'tshirt',
    },
    {
      title: 'Leather Wallet',
      slug: 'leather-wallet',
      priceInGBP: 45,
      inventory: 50,
      categories: accessories ? [accessories.id] : [],
      imageKey: 'wallet',
    },
    {
      title: 'Ceramic Mug',
      slug: 'ceramic-mug',
      priceInGBP: 15,
      inventory: 200,
      categories: homeLiving ? [homeLiving.id] : [],
      imageKey: 'mug',
    },
    {
      title: 'Canvas Tote Bag',
      slug: 'canvas-tote-bag',
      priceInGBP: 30,
      inventory: 75,
      categories: accessories ? [accessories.id] : [],
      imageKey: 'tote',
    },
    {
      title: 'Scented Candle',
      slug: 'scented-candle',
      priceInGBP: 20,
      inventory: 150,
      categories: homeLiving ? [homeLiving.id] : [],
      imageKey: 'candle',
    },
  ]

  for (const p of products) {
    const gallery = mediaIds[p.imageKey] ? [{ image: mediaIds[p.imageKey] }] : []

    await payload.create({
      collection: 'products',
      data: {
        title: p.title,
        slug: p.slug,
        generateSlug: false,
        priceInGBP: p.priceInGBP,
        inventory: p.inventory,
        categories: p.categories,
        gallery,
        skipSync: true,
        _status: 'published',
      },
    })
  }
}

async function createNavigation(payload: Payload) {
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        { link: { type: 'system', systemPage: '/', label: 'Home' } },
        { link: { type: 'system', systemPage: '/products', label: 'Products' } },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        { link: { type: 'system', systemPage: '/products', label: 'Products' } },
      ],
    },
  })
}
