import type { Access, Where } from 'payload'

import { checkRole } from '@/access/utilities'

/**
 * Access control for refunds: Admin can access all, customers can access refunds for their own orders
 */
export const adminOrRefundOrderOwner: Access = async ({ req: { user } }) => {
  if (user && checkRole(['admin'], user)) {
    return true
  }

  if (user?.id) {
    // Return a Where clause to filter refunds to only those belonging to the user's orders
    return {
      'order.customer': {
        equals: user.id,
      },
    } as Where
  }

  return false
}

