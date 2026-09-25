import { Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'

/**
 * Restringe una ruta al rol ADMINISTRADOR. Se usa anidada dentro de
 * <ProtectedRoute> (que ya garantiza que hay sesión iniciada), por lo
 * que aquí solo se valida el rol.
 */
export default function AdminRoute() {
  const { esAdmin } = useApp()
  const navigate = useNavigate()

  if (!esAdmin) {
    return (
      <EmptyState
        icon="🔒"
        title="Acceso solo para el administrador del sistema"
        description="Esta sección permite gestionar usuarios, solicitudes, reservas y eventos, y está reservada al rol Administrador."
        action={<Button variant="ghost" onClick={() => navigate('/home')}>Volver al inicio</Button>}
      />
    )
  }

  return <Outlet />
}
