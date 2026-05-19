import { useRef, useEffect, type ReactNode, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useClickOutside } from '@/shared/hooks/useClickOutside'

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  open: boolean
  onClose: () => void
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, children, open, onClose, align = 'left', className }: DropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useClickOutside(containerRef, onClose, open)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    },
    [open, onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div ref={containerRef} className="relative">
      {trigger}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className={`
              absolute top-full mt-2 z-drawer
              min-w-[200px] rounded-lg
              bg-bg-surface dark:bg-bg-card-dark
              border border-border-base dark:border-border-base-dark
              shadow-modal dark:shadow-modal-dark
              py-1 overflow-hidden
              ${align === 'right' ? 'right-0' : 'left-0'}
              ${className || ''}
            `}
            role="menu"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  danger?: boolean
  className?: string
}

export function DropdownItem({ children, onClick, danger, className }: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`
        w-full text-left px-4 py-2.5 text-sm transition-colors duration-fast
        ${danger
          ? 'text-status-danger dark:text-status-danger-dark hover:bg-status-danger-bg dark:hover:bg-status-danger-bg-dark'
          : 'text-text-primary dark:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark'
        }
        ${className || ''}
      `}
    >
      {children}
    </button>
  )
}

interface DropdownHeaderProps {
  children: ReactNode
}

export function DropdownHeader({ children }: DropdownHeaderProps) {
  return (
    <div className="px-4 py-2.5 text-xs font-medium text-text-muted dark:text-text-muted-dark border-b border-border-base dark:border-border-base-dark">
      {children}
    </div>
  )
}

interface DropdownDividerProps {
  className?: string
}

export function DropdownDivider({ className }: DropdownDividerProps) {
  return <div className={`border-t border-border-base dark:border-border-base-dark my-1 ${className || ''}`} />
}
