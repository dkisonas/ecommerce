import { OrderStatus } from '@/components/OrderStatus'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Order } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'
import Link from 'next/link'

type Props = {
  order: Order
}

export const OrderItem: React.FC<Props> = ({ order }) => {
  const itemsLabel = order.items?.length === 1 ? 'Item' : 'Items'

  return (
    <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-sm font-semibold text-foreground">Order #{order.id}</h3>
          {order.status && <OrderStatus status={order.status} />}
        </div>

        <p className="text-sm text-muted-foreground">
          <time dateTime={order.createdAt}>
            {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
          </time>
          <span className="mx-2">·</span>
          <span>{order.items?.length} {itemsLabel}</span>
          {order.amount && (
            <>
              <span className="mx-2">·</span>
              <Price as="span" amount={order.amount} currencyCode={order.currency ?? undefined} />
            </>
          )}
        </p>
      </div>

      <Button variant="outline" size="sm" asChild className="shrink-0">
        <Link href={`/orders/${order.id}`}>View Order</Link>
      </Button>
    </div>
  )
}
