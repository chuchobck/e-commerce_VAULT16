import { useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { Dropdown, DropdownItem } from '@/shared/components/ui/Dropdown'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'top', label: 'Más vendidos' },
] as const

interface SortDropdownProps {
  value?: string
  onChange: (value: string) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false)

  const current = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0]

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val)
      setOpen(false)
    },
    [onChange],
  )

  return (
    <Dropdown
      open={open}
      onClose={() => setOpen(false)}
      align="right"
      trigger={
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm border border-border-base dark:border-border-base-dark text-text-primary dark:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {current.label}
          <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
        </button>
      }
    >
      {SORT_OPTIONS.map((option) => (
        <DropdownItem
          key={option.value}
          onClick={() => handleSelect(option.value)}
          className={option.value === (value || 'newest') ? '!text-accent !font-medium' : ''}
        >
          {option.label}
        </DropdownItem>
      ))}
    </Dropdown>
  )
}
