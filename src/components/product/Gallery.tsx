'use client'

// TailwindPlus Component: Ecommerce.Components.Product Overviews.With image gallery and expandable details
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support (manually added)

import type { Media as MediaType, Product } from '@/payload-types'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { DefaultDocumentIDType } from 'payload'

type Props = {
  gallery: NonNullable<Product['gallery']>
}

export const Gallery: React.FC<Props> = ({ gallery }) => {
  const searchParams = useSearchParams()
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter out items with null/undefined images
  const validGalleryItems = gallery.filter((item) => item.image && typeof item.image === 'object')

  // Handle variant selection from URL params
  useEffect(() => {
    const values = searchParams.values().toArray()

    if (values && validGalleryItems.length > 0) {
      const index = validGalleryItems.findIndex((item) => {
        if (!item.variantOption) return false

        let variantID: DefaultDocumentIDType

        if (typeof item.variantOption === 'object') {
          variantID = item.variantOption.id
        } else variantID = item.variantOption

        return Boolean(values.find((value) => value === String(variantID)))
      })
      if (index !== -1) {
        setSelectedIndex(index)
      }
    }
  }, [searchParams, validGalleryItems])

  if (validGalleryItems.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted dark:bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">No image available</span>
      </div>
    )
  }

  return (
    <TabGroup
      selectedIndex={selectedIndex}
      onChange={setSelectedIndex}
      className="flex flex-col-reverse"
    >
      {/* Image selector (thumbnails) */}
      {validGalleryItems.length > 1 && (
        <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
          <TabList className="grid grid-cols-4 gap-6">
            {validGalleryItems.map((item, index) => {
              const image = item.image as MediaType
              return (
                <Tab
                  key={image.id || index}
                  className="group relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-muted dark:bg-muted text-sm font-medium uppercase hover:bg-muted/80 focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background focus:outline-none"
                >
                  <span className="sr-only">{image.alt || `Image ${index + 1}`}</span>
                  <span className="absolute inset-0 overflow-hidden rounded-md">
                    {image.url && (
                      <Image
                        alt={image.alt || ''}
                        src={image.url}
                        fill
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-transparent ring-offset-2 group-data-[selected]:ring-secondary"
                  />
                </Tab>
              )
            })}
          </TabList>
        </div>
      )}

      {/* Main image panels */}
      <TabPanels>
        {validGalleryItems.map((item, index) => {
          const image = item.image as MediaType
          return (
            <TabPanel key={image.id || index}>
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted dark:bg-muted">
                {image.url && (
                  <Image
                    alt={image.alt || ''}
                    src={image.url}
                    width={800}
                    height={800}
                    className="size-full object-cover"
                    priority={index === 0}
                  />
                )}
              </div>
            </TabPanel>
          )
        })}
      </TabPanels>
    </TabGroup>
  )
}
