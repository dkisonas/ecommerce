import Link from 'next/link'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type ProductsPaginationProps = {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export function ProductsPagination({
  currentPage,
  totalPages,
  baseUrl,
}: ProductsPaginationProps) {
  if (totalPages <= 1) return null

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const showEllipsisThreshold = 7

    if (totalPages <= showEllipsisThreshold) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const buildUrl = (page: number) => {
    const url = new URL(baseUrl, 'http://localhost')
    url.searchParams.set('page', String(page))
    return `${url.pathname}${url.search}`
  }

  const pageNumbers = getPageNumbers()

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <Link href={buildUrl(currentPage - 1)} passHref legacyBehavior>
              <PaginationPrevious />
            </Link>
          </PaginationItem>
        )}

        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <Link href={buildUrl(page)} passHref legacyBehavior>
                <PaginationLink isActive={currentPage === page}>{page}</PaginationLink>
              </Link>
            </PaginationItem>
          ),
        )}

        {currentPage < totalPages && (
          <PaginationItem>
            <Link href={buildUrl(currentPage + 1)} passHref legacyBehavior>
              <PaginationNext />
            </Link>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}
