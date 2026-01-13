import type { Payload } from 'payload'
import type { Category, Product, VariantType, VariantOption, ShippingMethod } from '@/payload-types'

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

  // Create shipping methods
  const shippingMethods = await createShippingMethods(payload)
  console.log(`✅ Created ${shippingMethods.length} shipping methods`)

  // Create settings
  await createSettings(payload)
  console.log('✅ Created site settings')

  // Create navigation (header + footer with columns)
  await createNavigation(payload, categories)
  console.log('✅ Created navigation')

  // Create CMS pages
  const pages = await createPages(payload)
  console.log(`✅ Created ${pages.length} CMS pages`)

  // Create contact form
  await createContactForm(payload)
  console.log('✅ Created contact form')

  // Create admin account
  await createAdminAccount(payload)
  console.log('✅ Created admin account (admin@example.com / admin1234)')

  // Create demo customer and orders
  const demoCustomer = await createDemoCustomer(payload)
  console.log('✅ Created demo customer (demo@example.com / demo1234)')

  await createDemoOrders(payload, demoCustomer.id, products, shippingMethods)
  console.log('✅ Created demo orders with various statuses')

  // Create guest order for track-order testing
  await createGuestOrder(payload, products, shippingMethods)
  console.log('✅ Created guest order (guest@example.com) for track-order testing')

  console.log('🎉 Seed complete!')
}

// Demo data identifiers for cleanup
const DEMO_SLUGS = {
  products: ['classic-t-shirt', 'leather-wallet', 'ceramic-mug', 'canvas-tote-bag', 'scented-candle'],
  categories: ['clothing', 'accessories', 'home-and-living'],
  variantTypes: ['color', 'size'],
  pages: ['about', 'contact', 'terms-conditions', 'privacy-policy', 'shipping-policy', 'returns-refunds'],
  shippingMethods: ['Standard Delivery', 'Express Delivery', 'Free Shipping'],
}

const DEMO_CUSTOMER_EMAIL = 'demo@example.com'
const DEMO_GUEST_EMAIL = 'guest@example.com'
const DEMO_ADMIN_EMAIL = 'admin@example.com'
const DEMO_FORM_TITLE = 'Contact Form'

async function clearDemoContent(payload: Payload) {
  // Delete demo refunds first (has foreign key to orders)
  try {
    await payload.delete({
      collection: 'refunds',
      where: {
        or: [
          { 'order.customerEmail': { equals: DEMO_CUSTOMER_EMAIL } },
          { 'order.customerEmail': { equals: DEMO_GUEST_EMAIL } },
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
        or: [
          { customerEmail: { equals: DEMO_CUSTOMER_EMAIL } },
          { customerEmail: { equals: DEMO_GUEST_EMAIL } },
        ],
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
        or: [
          { customerEmail: { equals: DEMO_CUSTOMER_EMAIL } },
          { customerEmail: { equals: DEMO_GUEST_EMAIL } },
        ],
      },
    })
  } catch {
    // Ignore errors
  }

  // Delete demo orders (both customer and guest)
  try {
    await payload.delete({
      collection: 'orders',
      where: {
        or: [
          { customerEmail: { equals: DEMO_CUSTOMER_EMAIL } },
          { customerEmail: { equals: DEMO_GUEST_EMAIL } },
        ],
      },
    })
  } catch {
    // Ignore errors
  }

  // Delete demo shipping methods
  try {
    await payload.delete({
      collection: 'shipping-methods',
      where: {
        title: { in: DEMO_SLUGS.shippingMethods },
      },
    })
  } catch {
    // Ignore errors
  }

  // Delete demo pages
  try {
    await payload.delete({
      collection: 'pages',
      where: {
        slug: { in: DEMO_SLUGS.pages },
      },
    })
  } catch {
    // Ignore errors
  }

  // Delete demo form submissions first
  try {
    const contactForm = await payload.find({
      collection: 'forms',
      where: { title: { equals: DEMO_FORM_TITLE } },
    })
    if (contactForm.docs.length > 0) {
      await payload.delete({
        collection: 'form-submissions',
        where: {
          form: { equals: contactForm.docs[0].id },
        },
      })
    }
  } catch {
    // Ignore errors
  }

  // Delete demo forms
  try {
    await payload.delete({
      collection: 'forms',
      where: {
        title: { equals: DEMO_FORM_TITLE },
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

async function createNavigation(payload: Payload, categories: Category[]) {
  const categoryNavItems = categories.map((cat) => ({
    link: { type: 'category' as const, category: cat.id, label: cat.title },
  }))

  // Header navigation
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        { link: { type: 'custom' as const, url: '/products', label: 'Products' } },
        ...categoryNavItems,
      ],
    },
  })

  // Footer with columns and social links
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      columns: [
        {
          title: 'Shop',
          links: [
            { link: { type: 'custom' as const, url: '/products', label: 'All Products' } },
            ...categoryNavItems.map((item) => ({ link: item.link })),
          ],
        },
        {
          title: 'Support',
          links: [
            { link: { type: 'page' as const, page: null, label: 'Contact Us', url: '/contact' } },
            { link: { type: 'page' as const, page: null, label: 'Shipping Policy', url: '/shipping-policy' } },
            { link: { type: 'page' as const, page: null, label: 'Returns & Refunds', url: '/returns-refunds' } },
            { link: { type: 'custom' as const, url: '/track-order', label: 'Track Order' } },
          ],
        },
        {
          title: 'Company',
          links: [
            { link: { type: 'page' as const, page: null, label: 'About Us', url: '/about' } },
            { link: { type: 'page' as const, page: null, label: 'Privacy Policy', url: '/privacy-policy' } },
            { link: { type: 'page' as const, page: null, label: 'Terms & Conditions', url: '/terms-conditions' } },
          ],
        },
      ],
      showSocialLinks: true,
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com/demostore' },
        { platform: 'facebook', url: 'https://facebook.com/demostore' },
        { platform: 'twitter', url: 'https://twitter.com/demostore' },
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
  _mediaIds: Record<string, number>,
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

async function createDemoOrders(
  payload: Payload,
  customerId: number,
  products: Product[],
  shippingMethods: ShippingMethod[],
) {
  const tshirt = products.find((p) => p.slug === 'classic-t-shirt')
  const wallet = products.find((p) => p.slug === 'leather-wallet')
  const mug = products.find((p) => p.slug === 'ceramic-mug')
  const tote = products.find((p) => p.slug === 'canvas-tote-bag')
  const candle = products.find((p) => p.slug === 'scented-candle')

  const standardShipping = shippingMethods.find((m) => m.title === 'Standard Delivery')
  const expressShipping = shippingMethods.find((m) => m.title === 'Express Delivery')
  const freeShipping = shippingMethods.find((m) => m.title === 'Free Shipping')

  const demoAddress = {
    firstName: 'Demo',
    lastName: 'Customer',
    addressLine1: '123 Demo Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'GB',
  }

  // 1. Completed order (successful purchase with standard shipping)
  const completedOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: 'completed',
      subtotal: 4000, // £40.00 subtotal
      shippingMethod: standardShipping?.id,
      shippingCost: 399, // £3.99
      amount: 4399, // £43.99 total
      currency: 'GBP',
      items: [
        { product: tshirt?.id, quantity: 1 },
        { product: mug?.id, quantity: 1 },
      ],
      shippingAddress: demoAddress,
    },
  })
  console.log(`  📦 Created completed order #${completedOrder.id}`)

  // 2. Processing order (with express shipping)
  const processingOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: 'processing',
      subtotal: 4500, // £45.00 subtotal
      shippingMethod: expressShipping?.id,
      shippingCost: 799, // £7.99
      amount: 5299, // £52.99 total
      currency: 'GBP',
      items: [{ product: wallet?.id, quantity: 1 }],
      shippingAddress: demoAddress,
    },
  })
  console.log(`  📦 Created processing order #${processingOrder.id}`)

  // 3. Order with pending refund request (free shipping over threshold)
  const pendingRefundOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: 'refund_requested',
      subtotal: 3000, // £30.00 subtotal
      shippingMethod: standardShipping?.id,
      shippingCost: 0, // Free (over £30 threshold)
      amount: 3000, // £30.00 total
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

  // 4. Order with rejected refund request (with free shipping promo)
  const rejectedRefundOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: 'completed',
      subtotal: 2000, // £20.00 subtotal
      shippingMethod: freeShipping?.id,
      shippingCost: 0,
      amount: 2000, // £20.00 total
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
      subtotal: 2500, // £25.00 subtotal
      shippingMethod: standardShipping?.id,
      shippingCost: 399,
      amount: 2899, // £28.99 total
      currency: 'GBP',
      totalRefunded: 2899,
      items: [{ product: tshirt?.id, quantity: 1 }],
      shippingAddress: demoAddress,
    },
  })
  console.log(`  📦 Created refunded order #${refundedOrder.id}`)

  // 6. Partially refunded order (with express shipping)
  const partialRefundOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: customerId,
      customerEmail: DEMO_CUSTOMER_EMAIL,
      status: 'partially_refunded',
      subtotal: 5500, // £55.00 subtotal
      shippingMethod: expressShipping?.id,
      shippingCost: 799,
      amount: 6299, // £62.99 total
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

async function createShippingMethods(payload: Payload): Promise<ShippingMethod[]> {
  const methods = [
    {
      title: 'Standard Delivery',
      description: 'Delivered by Royal Mail',
      price: 399, // £3.99
      freeAbove: 3000, // Free over £30
      estimatedDays: '3-5 business days',
      enabled: true,
      sortOrder: 1,
    },
    {
      title: 'Express Delivery',
      description: 'Next day delivery by DPD',
      price: 799, // £7.99
      freeAbove: null, // Never free
      estimatedDays: 'Next business day',
      enabled: true,
      sortOrder: 2,
    },
    {
      title: 'Free Shipping',
      description: 'Economy delivery - promotional offer',
      price: 0,
      freeAbove: null,
      estimatedDays: '5-7 business days',
      enabled: true,
      sortOrder: 3,
    },
  ]

  const created: ShippingMethod[] = []
  for (const method of methods) {
    const shippingMethod = await payload.create({
      collection: 'shipping-methods',
      data: method,
    })
    created.push(shippingMethod)
  }

  return created
}

async function createSettings(payload: Payload) {
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      siteName: 'Demo Store',
      companyName: 'Demo Store Ltd',
      tagline: 'Quality products, exceptional service',
      enableDarkMode: true,
      formSubmissionEmail: 'admin@example.com',
    },
  })
}

async function createPages(payload: Payload) {
  const pagesData = [
    {
      title: 'About Us',
      slug: 'about',
      content: createRichTextContent([
        { type: 'heading', level: 1, text: 'About Demo Store' },
        {
          type: 'paragraph',
          text: 'Welcome to Demo Store! We are a passionate team dedicated to bringing you the best quality products at affordable prices.',
        },
        { type: 'heading', level: 2, text: 'Our Mission' },
        {
          type: 'paragraph',
          text: 'Our mission is to provide exceptional products and outstanding customer service. We believe in building lasting relationships with our customers.',
        },
        { type: 'heading', level: 2, text: 'Our Story' },
        {
          type: 'paragraph',
          text: 'Founded in 2024, Demo Store started as a small family business with a simple idea: offer great products with honest service. Today, we continue to uphold those values.',
        },
      ]),
    },
    {
      title: 'Contact Us',
      slug: 'contact',
      content: createRichTextContent([
        { type: 'heading', level: 1, text: 'Contact Us' },
        {
          type: 'paragraph',
          text: "We'd love to hear from you! Fill out the form below and we'll get back to you as soon as possible.",
        },
      ]),
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms-conditions',
      content: createRichTextContent([
        { type: 'heading', level: 1, text: 'Terms & Conditions' },
        {
          type: 'paragraph',
          text: 'Please read these terms and conditions carefully before using our services.',
        },
        { type: 'heading', level: 2, text: '1. Introduction' },
        {
          type: 'paragraph',
          text: 'These terms govern your use of our website and services. By using our site, you agree to these terms.',
        },
        { type: 'heading', level: 2, text: '2. Orders' },
        {
          type: 'paragraph',
          text: 'All orders are subject to availability. We reserve the right to refuse any order.',
        },
        { type: 'heading', level: 2, text: '3. Pricing' },
        {
          type: 'paragraph',
          text: 'All prices are in GBP and include VAT where applicable. We reserve the right to change prices without notice.',
        },
      ]),
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: createRichTextContent([
        { type: 'heading', level: 1, text: 'Privacy Policy' },
        {
          type: 'paragraph',
          text: 'Your privacy is important to us. This policy explains how we collect, use, and protect your data.',
        },
        { type: 'heading', level: 2, text: 'Information We Collect' },
        {
          type: 'paragraph',
          text: 'We collect information you provide directly, such as name, email, and shipping address when you place an order.',
        },
        { type: 'heading', level: 2, text: 'How We Use Your Information' },
        {
          type: 'paragraph',
          text: 'We use your information to process orders, communicate with you, and improve our services.',
        },
        { type: 'heading', level: 2, text: 'Data Security' },
        {
          type: 'paragraph',
          text: 'We implement appropriate security measures to protect your personal information.',
        },
      ]),
    },
    {
      title: 'Shipping Policy',
      slug: 'shipping-policy',
      content: createRichTextContent([
        { type: 'heading', level: 1, text: 'Shipping Policy' },
        {
          type: 'paragraph',
          text: 'We offer several shipping options to meet your needs.',
        },
        { type: 'heading', level: 2, text: 'Delivery Options' },
        {
          type: 'paragraph',
          text: 'Standard Delivery: 3-5 business days (£3.99, free over £30)',
        },
        {
          type: 'paragraph',
          text: 'Express Delivery: Next business day (£7.99)',
        },
        { type: 'heading', level: 2, text: 'Processing Time' },
        {
          type: 'paragraph',
          text: 'Orders are typically processed within 1-2 business days.',
        },
        { type: 'heading', level: 2, text: 'Tracking' },
        {
          type: 'paragraph',
          text: 'You will receive tracking information once your order has been dispatched.',
        },
      ]),
    },
    {
      title: 'Returns & Refunds',
      slug: 'returns-refunds',
      content: createRichTextContent([
        { type: 'heading', level: 1, text: 'Returns & Refunds' },
        {
          type: 'paragraph',
          text: "We want you to be completely satisfied with your purchase. If you're not happy, we're here to help.",
        },
        { type: 'heading', level: 2, text: 'Return Policy' },
        {
          type: 'paragraph',
          text: 'You may return most items within 30 days of delivery for a full refund. Items must be unused and in original packaging.',
        },
        { type: 'heading', level: 2, text: 'How to Request a Refund' },
        {
          type: 'paragraph',
          text: "Log into your account, go to your orders, and click 'Request Refund' on the relevant order.",
        },
        { type: 'heading', level: 2, text: 'Refund Processing' },
        {
          type: 'paragraph',
          text: 'Refunds are typically processed within 5-7 business days after we receive and inspect the returned item.',
        },
      ]),
    },
  ]

  const created = []
  for (const pageData of pagesData) {
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: pageData.title,
        slug: pageData.slug,
        content: pageData.content,
        _status: 'published',
      },
    })
    created.push(page)
  }

  return created
}

// Helper to create rich text content structure for Lexical
type ContentBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }

function createRichTextContent(blocks: ContentBlock[]) {
  return {
    root: {
      type: 'root',
      children: blocks.map((block) => {
        if (block.type === 'heading') {
          return {
            type: 'heading',
            tag: `h${block.level}`,
            children: [{ type: 'text', text: block.text, version: 1 }],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            version: 1,
          }
        }
        return {
          type: 'paragraph',
          children: [{ type: 'text', text: block.text, version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
        }
      }),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

async function createContactForm(payload: Payload) {
  const form = await payload.create({
    collection: 'forms',
    data: {
      title: DEMO_FORM_TITLE,
      fields: [
        {
          blockType: 'text',
          name: 'name',
          label: 'Your Name',
          required: true,
          width: 50,
        },
        {
          blockType: 'email',
          name: 'email',
          label: 'Email Address',
          required: true,
          width: 50,
        },
        {
          blockType: 'text',
          name: 'subject',
          label: 'Subject',
          required: true,
          width: 100,
        },
        {
          blockType: 'textarea',
          name: 'message',
          label: 'Your Message',
          required: true,
          width: 100,
        },
      ],
      submitButtonLabel: 'Send Message',
      confirmationType: 'message',
      confirmationMessage: createRichTextContent([
        {
          type: 'paragraph',
          text: "Thank you for your message! We'll get back to you as soon as possible.",
        },
      ]),
    },
  })

  return form
}

async function createGuestOrder(
  payload: Payload,
  products: Product[],
  shippingMethods: ShippingMethod[],
) {
  const wallet = products.find((p) => p.slug === 'leather-wallet')
  const mug = products.find((p) => p.slug === 'ceramic-mug')
  const standardShipping = shippingMethods.find((m) => m.title === 'Standard Delivery')

  const guestAddress = {
    firstName: 'Guest',
    lastName: 'User',
    addressLine1: '456 Guest Lane',
    city: 'Manchester',
    postcode: 'M1 1AA',
    country: 'GB',
  }

  // Guest order (no customer ID, just email) for track-order testing
  const guestOrder = await payload.create({
    collection: 'orders',
    context: { skipValidation: true },
    data: {
      customer: null, // No linked customer account
      customerEmail: DEMO_GUEST_EMAIL,
      status: 'processing',
      subtotal: 6000, // £60.00 subtotal
      shippingMethod: standardShipping?.id,
      shippingCost: 0, // Free (over £30)
      amount: 6000, // £60.00 total
      currency: 'GBP',
      items: [
        { product: wallet?.id, quantity: 1 },
        { product: mug?.id, quantity: 1 },
      ],
      shippingAddress: guestAddress,
    },
  })

  console.log(
    `  📦 Created guest order #${guestOrder.id} - test track-order with email: ${DEMO_GUEST_EMAIL}`,
  )

  return guestOrder
}
