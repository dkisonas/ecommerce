import type { Payload } from 'payload'
import type { Category, Product, VariantType, VariantOption } from '@/payload-types'

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

  const products = await createProducts(payload, categories, mediaIds)
  console.log(`✅ Created ${products.length} products`)

  // Create variant types and options
  const variantTypes = await createVariantTypes(payload)
  console.log(`✅ Created ${variantTypes.length} variant types with options`)

  // Create product variants
  await createProductVariants(payload, products, variantTypes, mediaIds)
  console.log('✅ Created product variants')

  await createNavigation(payload)
  console.log('✅ Created navigation')

  // Create admin account
  await createAdminAccount(payload)
  console.log('✅ Created admin account (admin@example.com / admin1234)')

  // Create demo customer and orders
  const demoCustomer = await createDemoCustomer(payload)
  console.log('✅ Created demo customer (demo@example.com / demo1234)')

  await createDemoOrders(payload, demoCustomer.id, products)
  console.log('✅ Created demo orders with various statuses')

  console.log('🎉 Seed complete!')
}

// Demo data identifiers for cleanup
const DEMO_SLUGS = {
  products: ['classic-t-shirt', 'leather-wallet', 'ceramic-mug', 'canvas-tote-bag', 'scented-candle'],
  categories: ['clothing', 'accessories', 'home-and-living'],
  variantTypes: ['color', 'size'],
}

const DEMO_CUSTOMER_EMAIL = 'demo@example.com'
const DEMO_ADMIN_EMAIL = 'admin@example.com'

async function clearDemoContent(payload: Payload) {
  // Delete demo refunds first (has foreign key to orders)
  try {
    await payload.delete({
      collection: 'refunds',
      where: {
        or: [
          { 'order.customerEmail': { equals: DEMO_CUSTOMER_EMAIL } },
        ],
      },
    })
  } catch {
    // Ignore errors
  }

  // Delete demo transactions
  try {
    await payload.delete({
      collection: 'transactions',
      where: {
        customerEmail: { equals: DEMO_CUSTOMER_EMAIL },
      },
    })
  } catch {
    // Ignore errors
  }

  // Delete demo refund requests
  try {
    await payload.delete({
      collection: 'refund-requests',
      where: {
        customerEmail: { equals: DEMO_CUSTOMER_EMAIL },
      },
    })
  } catch {
    // Ignore errors
  }

  // Delete demo orders
  try {
    await payload.delete({
      collection: 'orders',
      where: {
        customerEmail: { equals: DEMO_CUSTOMER_EMAIL },
      },
    })
  } catch {
    // Ignore errors
  }

  // Delete demo variants first (has foreign key to products)
  try {
    await payload.delete({
      collection: 'variants',
      where: {
        'product.slug': { in: DEMO_SLUGS.products },
      },
    })
  } catch {
    // Ignore errors
  }

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

  // Delete demo variant options (has foreign key to variant types)
  try {
    await payload.delete({
      collection: 'variantOptions',
      where: {
        'variantType.name': { in: DEMO_SLUGS.variantTypes },
      },
    })
  } catch {
    // Ignore errors
  }

  // Delete demo variant types
  try {
    await payload.delete({
      collection: 'variantTypes',
      where: {
        name: { in: DEMO_SLUGS.variantTypes },
      },
    })
  } catch {
    // Ignore errors
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

  // Delete demo customer
  try {
    await payload.delete({
      collection: 'users',
      where: {
        email: { equals: DEMO_CUSTOMER_EMAIL },
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
): Promise<Product[]> {
  const clothing = categories.find((c) => c.slug === 'clothing')
  const accessories = categories.find((c) => c.slug === 'accessories')
  const homeLiving = categories.find((c) => c.slug === 'home-and-living')

  const productsData = [
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

  const createdProducts: Product[] = []

  for (const p of productsData) {
    const gallery = mediaIds[p.imageKey] ? [{ image: mediaIds[p.imageKey] }] : []

    const product = await payload.create({
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
    createdProducts.push(product)
  }

  return createdProducts
}

async function createNavigation(payload: Payload) {
  // Get category IDs for navigation links
  const categories = await payload.find({
    collection: 'categories',
    where: {
      slug: { in: DEMO_SLUGS.categories },
    },
  })

  const categoryNavItems = categories.docs.map((cat) => ({
    link: { type: 'category' as const, category: cat.id, label: cat.title },
  }))

  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        { link: { type: 'custom' as const, url: '/products', label: 'Products' } },
        ...categoryNavItems,
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        { link: { type: 'custom' as const, url: '/products', label: 'Products' } },
      ],
    },
  })
}

async function createAdminAccount(payload: Payload) {
  // Check if admin already exists
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: DEMO_ADMIN_EMAIL } },
  })

  if (existing.docs.length > 0) {
    return existing.docs[0]
  }

  return await payload.create({
    collection: 'users',
    data: {
      email: DEMO_ADMIN_EMAIL,
      password: 'admin1234',
      name: 'Admin User',
      roles: ['admin'],
    },
  })
}

async function createDemoCustomer(payload: Payload) {
  // Check if demo customer already exists
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: DEMO_CUSTOMER_EMAIL } },
  })

  if (existing.docs.length > 0) {
    return existing.docs[0]
  }

  return await payload.create({
    collection: 'users',
    data: {
      email: DEMO_CUSTOMER_EMAIL,
      password: 'demo1234',
      name: 'Demo Customer',
      roles: ['customer'],
    },
  })
}

type VariantTypeWithOptions = VariantType & {
  optionRecords: VariantOption[]
}

async function createVariantTypes(payload: Payload): Promise<VariantTypeWithOptions[]> {
  const variantTypesData = [
    {
      label: 'Color',
      name: 'color',
      options: [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
        { label: 'Black', value: 'black' },
        { label: 'White', value: 'white' },
      ],
    },
    {
      label: 'Size',
      name: 'size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: '40ml', value: '40ml' },
        { label: '100ml', value: '100ml' },
      ],
    },
  ]

  const createdTypes: VariantTypeWithOptions[] = []

  for (const typeData of variantTypesData) {
    // Create the variant type
    const variantType = await payload.create({
      collection: 'variantTypes',
      data: {
        label: typeData.label,
        name: typeData.name,
      },
    })

    // Create options for this type
    const optionRecords: VariantOption[] = []
    for (const opt of typeData.options) {
      const option = await payload.create({
        collection: 'variantOptions',
        data: {
          variantType: variantType.id,
          label: opt.label,
          value: opt.value,
        },
      })
      optionRecords.push(option)
    }

    createdTypes.push({
      ...variantType,
      optionRecords,
    })
  }

  return createdTypes
}

async function createProductVariants(
  payload: Payload,
  products: Product[],
  variantTypes: VariantTypeWithOptions[],
  mediaIds: Record<string, number>,
) {
  const tshirt = products.find((p) => p.slug === 'classic-t-shirt')
  const candle = products.find((p) => p.slug === 'scented-candle')

  const colorType = variantTypes.find((t) => t.name === 'color')
  const sizeType = variantTypes.find((t) => t.name === 'size')

  if (!colorType || !sizeType) {
    console.log('  ⚠️ Could not find variant types')
    return
  }

  // Get color options
  const colorOptions = {
    red: colorType.optionRecords.find((o) => o.value === 'red'),
    blue: colorType.optionRecords.find((o) => o.value === 'blue'),
    black: colorType.optionRecords.find((o) => o.value === 'black'),
    white: colorType.optionRecords.find((o) => o.value === 'white'),
  }

  // Get size options
  const sizeOptions = {
    small: sizeType.optionRecords.find((o) => o.value === 'small'),
    medium: sizeType.optionRecords.find((o) => o.value === 'medium'),
    large: sizeType.optionRecords.find((o) => o.value === 'large'),
    ml40: sizeType.optionRecords.find((o) => o.value === '40ml'),
    ml100: sizeType.optionRecords.find((o) => o.value === '100ml'),
  }

  // Enable variants on T-Shirt and create color/size variants
  if (tshirt) {
    // Update product to enable variants and link variant types
    await payload.update({
      collection: 'products',
      id: tshirt.id,
      data: {
        enableVariants: true,
        variantTypes: [colorType.id, sizeType.id],
        // Clear the base price since variants will have prices
        priceInGBP: null,
        priceInGBPEnabled: false,
      },
    })

    // Create variants for T-Shirt: Color + Size combinations
    const tshirtVariants = [
      { color: colorOptions.red, size: sizeOptions.small, price: 2500, inventory: 20 },
      { color: colorOptions.red, size: sizeOptions.medium, price: 2500, inventory: 25 },
      { color: colorOptions.red, size: sizeOptions.large, price: 2700, inventory: 15 },
      { color: colorOptions.blue, size: sizeOptions.small, price: 2500, inventory: 18 },
      { color: colorOptions.blue, size: sizeOptions.medium, price: 2500, inventory: 30 },
      { color: colorOptions.blue, size: sizeOptions.large, price: 2700, inventory: 12 },
      { color: colorOptions.black, size: sizeOptions.small, price: 2500, inventory: 22 },
      { color: colorOptions.black, size: sizeOptions.medium, price: 2500, inventory: 28 },
      { color: colorOptions.black, size: sizeOptions.large, price: 2700, inventory: 10 },
    ]

    for (const v of tshirtVariants) {
      if (v.color && v.size) {
        await payload.create({
          collection: 'variants',
          data: {
            product: tshirt.id,
            title: `${v.color.label} / ${v.size.label}`,
            options: [v.color.id, v.size.id],
            priceInGBP: v.price,
            priceInGBPEnabled: true,
            inventory: v.inventory,
            _status: 'published',
          },
        })
      }
    }
    console.log(`  🎨 Created ${tshirtVariants.length} variants for Classic T-Shirt`)
  }

  // Enable variants on Scented Candle and create size variants (40ml, 100ml)
  if (candle) {
    // Update product to enable variants
    await payload.update({
      collection: 'products',
      id: candle.id,
      data: {
        enableVariants: true,
        variantTypes: [sizeType.id],
        // Clear the base price since variants will have prices
        priceInGBP: null,
        priceInGBPEnabled: false,
      },
    })

    // Create size variants for candle
    const candleVariants = [
      { size: sizeOptions.ml40, price: 1500, inventory: 50 },
      { size: sizeOptions.ml100, price: 2500, inventory: 30 },
    ]

    for (const v of candleVariants) {
      if (v.size) {
        await payload.create({
          collection: 'variants',
          data: {
            product: candle.id,
            title: v.size.label,
            options: [v.size.id],
            priceInGBP: v.price,
            priceInGBPEnabled: true,
            inventory: v.inventory,
            _status: 'published',
          },
        })
      }
    }
    console.log(`  📏 Created ${candleVariants.length} size variants for Scented Candle`)
  }
}

async function createDemoOrders(payload: Payload, customerId: number, products: Product[]) {
  const tshirt = products.find((p) => p.slug === 'classic-t-shirt')
  const wallet = products.find((p) => p.slug === 'leather-wallet')
  const mug = products.find((p) => p.slug === 'ceramic-mug')
  const tote = products.find((p) => p.slug === 'canvas-tote-bag')
  const candle = products.find((p) => p.slug === 'scented-candle')

  const demoAddress = {
    firstName: 'Demo',
    lastName: 'Customer',
    addressLine1: '123 Demo Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'GB',
  }

  // 1. Completed order (successful purchase)
  const completedOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: 'completed',
      amount: 4000, // £40.00
      currency: 'GBP',
      items: [
        { product: tshirt?.id, quantity: 1 },
        { product: mug?.id, quantity: 1 },
      ],
      shippingAddress: demoAddress,
    },
  })
  console.log(`  📦 Created completed order #${completedOrder.id}`)

  // 2. Processing order (payment received, being prepared)
  const processingOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: 'processing',
      amount: 4500, // £45.00
      currency: 'GBP',
      items: [{ product: wallet?.id, quantity: 1 }],
      shippingAddress: demoAddress,
    },
  })
  console.log(`  📦 Created processing order #${processingOrder.id}`)

  // 3. Order with pending refund request
  const pendingRefundOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: 'refund_requested',
      amount: 3000, // £30.00
      currency: 'GBP',
      items: [{ product: tote?.id, quantity: 1 }],
      shippingAddress: demoAddress,
    },
  })

  await payload.create({
    collection: 'refund-requests',
    context: { skipValidation: true },
    data: {
      order: pendingRefundOrder.id,
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      type: 'full',
      amount: 3000,
      currency: 'GBP',
      reason: 'The bag arrived damaged. I would like a full refund please.',
      status: 'pending',
    },
  })
  console.log(`  📦 Created order #${pendingRefundOrder.id} with pending refund request`)

  // 4. Order with rejected refund request
  const rejectedRefundOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: 'completed',
      amount: 2000, // £20.00
      currency: 'GBP',
      items: [{ product: candle?.id, quantity: 1 }],
      shippingAddress: demoAddress,
    },
  })

  await payload.create({
    collection: 'refund-requests',
    context: { skipValidation: true },
    data: {
      order: rejectedRefundOrder.id,
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      type: 'full',
      amount: 2000,
      currency: 'GBP',
      reason: 'I changed my mind about the candle.',
      status: 'rejected',
      rejectionReason: 'Refund request denied - item was used. Please see our refund policy.',
      rejectedAt: new Date().toISOString(),
    },
  })
  console.log(`  📦 Created order #${rejectedRefundOrder.id} with rejected refund request`)

  // 5. Refunded order (status set directly, simulates completed refund)
  const refundedOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: 'refunded',
      amount: 2500, // £25.00
      currency: 'GBP',
      totalRefunded: 2500,
      items: [{ product: tshirt?.id, quantity: 1 }],
      shippingAddress: demoAddress,
    },
  })
  console.log(`  📦 Created refunded order #${refundedOrder.id}`)

  // 6. Partially refunded order
  const partialRefundOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: 'partially_refunded',
      amount: 5500, // £55.00 (£25 tshirt + £30 tote)
      currency: 'GBP',
      totalRefunded: 2500, // Only tshirt refunded
      items: [
        { product: tshirt?.id, quantity: 1 },
        { product: tote?.id, quantity: 1 },
      ],
      shippingAddress: demoAddress,
    },
  })
  console.log(`  📦 Created partially refunded order #${partialRefundOrder.id}`)
}
