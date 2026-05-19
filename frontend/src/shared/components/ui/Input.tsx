import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, fullWidth, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary dark:text-text-primary-dark"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-text-muted-dark pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-md border px-3 py-2 text-base font-sans transition-colors duration-fast',
              'bg-bg-base dark:bg-bg-hover-dark',
              'border-border-base dark:border-border-base-dark',
              'text-text-primary dark:text-text-primary-dark',
              'placeholder:text-text-muted dark:placeholder:text-text-muted-dark',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-status-danger dark:border-status-danger-dark focus:ring-status-danger',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className,
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-text-muted-dark pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-status-danger dark:text-status-danger-dark" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-text-muted dark:text-text-muted-dark">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
