import type { Metadata } from 'next'
import { ProductGrid } from '@/components/ProductGrid'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to our store',
}

export default async function HomePage() {
  return (
    <article className="pt-16 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to Our Store</h1>
        <p className="text-muted-foreground mt-2">Browse our latest products</p>
      </div>

      <ProductGrid />
    </article>
  )
}
