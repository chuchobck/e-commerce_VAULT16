import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent hover:bg-accent-hover active:bg-accent-active text-white shadow-sm',
  secondary:
    'border border-accent text-accent hover:bg-accent/10 active:bg-accent/20',
  ghost:
    'text-text-secondary dark:text-text-secondary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark hover:text-text-primary dark:hover:text-text-primary-dark',
  danger:
    'bg-status-danger dark:bg-status-danger-dark text-white hover:opacity-90 active:opacity-80',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-sm',
  md: 'h-10 px-4 text-base gap-2 rounded-md',
  lg: 'h-12 px-6 text-lg gap-2.5 rounded-md',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-fast ease-smooth',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    )
  },
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize }
