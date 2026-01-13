import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'
import Link from 'next/link'

import { CreateAccountForm } from '@/components/forms/CreateAccountForm'

export default async function CreateAccount() {
  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background dark:bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-secondary hover:text-secondary/80">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-card dark:bg-card/50 px-6 py-12 shadow-sm sm:rounded-lg sm:px-12 border border-border">
          <RenderParams className="mb-6" />
          <CreateAccountForm />
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Create Account',
    url: '/create-account',
  }),
  title: 'Create Account',
}
