import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

/**
 * Protege las rutas del panel: mientras se verifica si existe una
 * sesión guardada muestra un loader, y si no hay un usuario
 * autenticado redirige a /login.
 */
export default function ProtectedRoute() {
  const { estaAutenticado, cargandoUsuario } = useApp()

  if (cargandoUsuario) {
    return <LoadingSpinner label="Verificando tu sesión…" />
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
