import { motion } from 'framer-motion'

/**
 * Skeleton placeholder for ProductCard — matches exact dimensions.
 */
export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <motion.div
        className="aspect-product rounded-md bg-bg-hover dark:bg-bg-hover-dark"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-bg-hover dark:bg-bg-hover-dark" />
        <div className="h-3 w-1/2 rounded bg-bg-hover dark:bg-bg-hover-dark" />
        <div className="h-4 w-1/3 rounded bg-bg-hover dark:bg-bg-hover-dark" />
      </div>
    </div>
  )
}
