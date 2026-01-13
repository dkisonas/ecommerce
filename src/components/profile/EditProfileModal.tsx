'use client'

import { Button } from '@/components/ui/button'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/providers/Auth'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/forms/FormError'
import { toast } from 'sonner'
import type { User } from '@/payload-types'

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  passwordConfirm: string
}

export const EditProfileModal: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [changePassword, setChangePassword] = useState(false)
  const { user, setUser } = useAuth()

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  // Reset form when modal opens
  useEffect(() => {
    if (open && user) {
      reset({
        firstName: (user as any).firstName || '',
        lastName: (user as any).lastName || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        password: '',
        passwordConfirm: '',
      })
      setChangePassword(false)
    }
  }, [open, user, reset])

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!user) return

      const submitData: Partial<FormData> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      }

      // Only include password fields if changing password
      if (changePassword && data.password) {
        submitData.password = data.password
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
        body: JSON.stringify(submitData),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      })

      if (response.ok) {
        const json = await response.json()
        setUser(json.doc)
        toast.success('Profile updated successfully.')
        setOpen(false)
      } else {
        toast.error('There was a problem updating your profile.')
      }
    },
    [user, setUser, changePassword],
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!changePassword ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register('firstName', { required: 'First name is required.' })}
                    placeholder="First name"
                  />
                  {errors.firstName && <FormError message={errors.firstName.message} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register('lastName', { required: 'Last name is required.' })}
                    placeholder="Last name"
                  />
                  {errors.lastName && <FormError message={errors.lastName.message} />}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required.' })}
                  placeholder="you@example.com"
                />
                {errors.email && <FormError message={errors.email.message} />}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="Your phone number"
                />
                {errors.phone && <FormError message={errors.phone.message} />}
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setChangePassword(true)}
                >
                  Change password
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password', { required: 'Password is required.' })}
                  placeholder="Enter new password"
                />
                {errors.password && <FormError message={errors.password.message} />}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirm Password</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  {...register('passwordConfirm', {
                    required: 'Please confirm your password.',
                    validate: (value) => value === password.current || 'Passwords do not match',
                  })}
                  placeholder="Confirm new password"
                />
                {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setChangePassword(false)}
                >
                  Cancel password change
                </Button>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
