import { Banner } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

export const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to your store!</h4>
      </Banner>

      <div className={`${baseClass}__section`}>
        <h5>Quick Start</h5>
        <ul className={`${baseClass}__checklist`}>
          <li>
            <Link href="/admin/collections/products/create">Add your first product</Link>
            {' — Give it a title, description, price, and at least one image.'}
          </li>
          <li>
            <Link href="/admin/collections/categories">Create categories</Link>
            {' — Organize your products (e.g., "Clothing", "Accessories").'}
          </li>
          <li>
            <a href="/" target="_blank" rel="noopener noreferrer">
              Visit your store
            </a>
            {' — See your products live on the homepage.'}
          </li>
        </ul>
      </div>

      <div className={`${baseClass}__section`}>
        <h5>Configuration</h5>
        <ul className={`${baseClass}__checklist`}>
          <li>
            <strong>Stripe:</strong>
            {' Set up '}
            <a
              href="https://dashboard.stripe.com/test/apikeys"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stripe API keys
            </a>
            {' in your .env file for payments.'}
          </li>
          <li>
            <strong>Email:</strong>
            {' Configure '}
            <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">
              Resend API key
            </a>
            {' for order confirmation emails.'}
          </li>
          <li>
            <Link href="/admin/globals/header">Update header navigation</Link>
            {' — Add links to your store pages.'}
          </li>
        </ul>
      </div>

      <p className={`${baseClass}__tip`}>
        <strong>Tip:</strong> Demo content was created automatically. Feel free to delete it once
        you add your own products.
      </p>
    </div>
  )
}
