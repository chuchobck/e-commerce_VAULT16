import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { ProductSkeleton } from './ProductSkeleton'

interface InfiniteScrollTriggerProps {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  total: number
}

/**
 * Invisible trigger for infinite scroll.
 * When in view and there's a next page → auto-fetch.
 */
export function InfiniteScrollTrigger({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  total,
}: InfiniteScrollTriggerProps) {
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div ref={ref} className="mt-8">
      {/* Loading skeletons */}
      {isFetchingNextPage && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {/* End of list */}
      {!hasNextPage && total > 0 && (
        <p className="text-center text-sm text-text-muted dark:text-text-muted-dark py-8">
          Llegaste al final · {total} productos en total
        </p>
      )}
    </div>
  )
}
