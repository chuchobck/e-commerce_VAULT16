import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Package, MapPin, UserCircle } from 'lucide-react'
import { useAuthStore } from '@/shared/stores/authStore'
import { Dropdown, DropdownItem, DropdownHeader, DropdownDivider } from '@/shared/components/ui/Dropdown'

/**
 * UserMenu con dropdown.
 * - Cuando NO logueado: "Iniciar sesión" / "Crear cuenta"
 * - Cuando logueado: email header + Mi perfil / Mis pedidos / Direcciones / Cerrar sesión
 */
export function UserMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleClose = useCallback(() => setOpen(false), [])
  const handleToggle = useCallback(() => setOpen((prev) => !prev), [])

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path)
      setOpen(false)
    },
    [navigate],
  )

  const handleLogout = useCallback(() => {
    logout()
    setOpen(false)
    navigate('/')
  }, [logout, navigate])

  return (
    <Dropdown
      open={open}
      onClose={handleClose}
      align="right"
      trigger={
        <button
          type="button"
          onClick={handleToggle}
          className="p-2 rounded-md text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors duration-fast"
          aria-label="Menú de usuario"
          aria-haspopup="true"
          aria-expanded={open}
        >
          <User className="h-5 w-5" aria-hidden="true" />
        </button>
      }
    >
      {isAuthenticated ? (
        <>
          <DropdownHeader>{user?.email}</DropdownHeader>
          <DropdownItem onClick={() => handleNavigate('/mi-cuenta')}>
            <span className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" aria-hidden="true" />
              Mi perfil
            </span>
          </DropdownItem>
          <DropdownItem onClick={() => handleNavigate('/mi-cuenta/pedidos')}>
            <span className="flex items-center gap-2">
              <Package className="h-4 w-4" aria-hidden="true" />
              Mis pedidos
            </span>
          </DropdownItem>
          <DropdownItem onClick={() => handleNavigate('/mi-cuenta/direcciones')}>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Direcciones
            </span>
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={handleLogout} danger>
            <span className="flex items-center gap-2">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </span>
          </DropdownItem>
        </>
      ) : (
        <>
          <DropdownItem onClick={() => handleNavigate('/login')}>
            Iniciar sesión
          </DropdownItem>
          <DropdownItem onClick={() => handleNavigate('/register')}>
            Crear cuenta
          </DropdownItem>
        </>
      )}
    </Dropdown>
  )
}
