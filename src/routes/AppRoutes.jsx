import { Route, Routes } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/HomePage'
import ServicePage from '../pages/ServicePage'
import SolicitudesPage from '../pages/SolicitudesPage'
import SolicitudDetallePage from '../pages/SolicitudDetallePage'
import ReservasPage from '../pages/ReservasPage'
import NotificacionesPage from '../pages/NotificacionesPage'
import EventosPage from '../pages/EventosPage'
import PerfilPage from '../pages/PerfilPage'
import UsuariosPage from '../pages/UsuariosPage'
import NotFoundPage from '../pages/NotFoundPage'

/**
 * Definición centralizada de rutas de UAJS Smart Campus mediante
 * React Router v6.
 *
 * - "/" (landing) y "/login" son públicas.
 * - Todo lo que vive bajo <ProtectedRoute> exige una sesión iniciada.
 * - "/usuarios" además exige el rol ADMINISTRADOR (<AdminRoute>).
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/servicios/:id" element={<ServicePage />} />
          <Route path="/solicitudes" element={<SolicitudesPage />} />
          <Route path="/solicitudes/:id" element={<SolicitudDetallePage />} />
          <Route path="/reservas" element={<ReservasPage />} />
          <Route path="/notificaciones" element={<NotificacionesPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/perfil" element={<PerfilPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
