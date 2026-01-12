import type { Payload } from 'payload'

/**
 * Seed script - clears demo content and recreates it
 * Run with: pnpm seed
 */
export async function seed(payload: Payload): Promise<void> {
  console.log('🌱 Starting seed...')

  // Clear existing demo content
  await clearDemoContent(payload)

  // Create fresh content
  const categories = await createCategories(payload)
  console.log(`✅ Created ${categories.length} categories`)

  const homePage = await createHomePage(payload)
  console.log(`✅ Created home page`)

  await createHeaderNav(payload, homePage.id as number)
  console.log('✅ Created header navigation')

  await createFooterNav(payload)
  console.log('✅ Created footer navigation')

  console.log('🎉 Seed complete!')
}

async function clearDemoContent(payload: Payload) {
  // Delete home page if exists
  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })
  for (const page of pages.docs) {
    await payload.delete({
      collection: 'pages',
      id: page.id,
      context: { disableRevalidate: true },
    })
  }

  // Delete demo categories
  const demoSlugs = ['clothing', 'accessories', 'home-and-living']
  for (const slug of demoSlugs) {
    const cats = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    for (const cat of cats.docs) {
      await payload.delete({
        collection: 'categories',
        id: cat.id,
      })
    }
  }
}

async function createCategories(payload: Payload) {
  const categoryData = [
    { title: 'Clothing', slug: 'clothing' },
    { title: 'Accessories', slug: 'accessories' },
    { title: 'Home & Living', slug: 'home-and-living' },
  ]

  const categories = []
  for (const { title, slug } of categoryData) {
    const category = await payload.create({
      collection: 'categories',
      data: { title, slug, generateSlug: false },
    })
    categories.push(category)
  }

  return categories
}

async function createHomePage(payload: Payload) {
  return await payload.create({
    collection: 'pages',
    data: {
      title: 'Welcome to Our Store',
      slug: 'home',
      _status: 'published',
    },
    context: { disableRevalidate: true },
  })
}

async function createHeaderNav(payload: Payload, homePageId: number) {
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        {
          link: {
            type: 'reference',
            reference: { relationTo: 'pages', value: homePageId },
            label: 'Home',
          },
        },
        {
          link: {
            type: 'custom',
            url: '/shop',
            label: 'Shop',
          },
        },
      ],
    },
  })
}

async function createFooterNav(payload: Payload) {
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        {
          link: {
            type: 'custom',
            url: '/shop',
            label: 'Shop',
          },
        },
      ],
    },
  })
}
