import type { Metadata } from 'next'

import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React from 'react'
import { notFound } from 'next/navigation'
import { ProductGrid } from '@/components/ProductGrid'
import { RichText } from '@/components/RichText'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params }: Args) {
  const { slug = 'home' } = await params

  const page = await queryPageBySlug({
    slug,
  })

  if (!page) {
    return notFound()
  }

  const isHomePage = slug === 'home'

  return (
    <article className="pt-16 pb-24">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{page.title}</h1>
      </div>

      {/* Rich text content if any */}
      {page.content && (
        <div className="mb-12">
          <RichText data={page.content} enableGutter={false} />
        </div>
      )}

      {/* Show products on homepage */}
      {isHomePage && <ProductGrid />}
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params

  const page = await queryPageBySlug({
    slug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
