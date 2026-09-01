import { Route, Routes } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import LandingPage from '../pages/LandingPage'
import HomePage from '../pages/HomePage'
import ServicePage from '../pages/ServicePage'
import SolicitudesPage from '../pages/SolicitudesPage'
import SolicitudDetallePage from '../pages/SolicitudDetallePage'
import ReservasPage from '../pages/ReservasPage'
import NotificacionesPage from '../pages/NotificacionesPage'
import EventosPage from '../pages/EventosPage'
import PerfilPage from '../pages/PerfilPage'
import NotFoundPage from '../pages/NotFoundPage'

/**
 * Definición centralizada de rutas de UAJS Smart Campus mediante
 * React Router v6. La vista de acceso (landing) vive fuera del
 * layout del panel; el resto de vistas comparten el DashboardLayout
 * (barra lateral + encabezado + pie de página).
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/servicios/:id" element={<ServicePage />} />
        <Route path="/solicitudes" element={<SolicitudesPage />} />
        <Route path="/solicitudes/:id" element={<SolicitudDetallePage />} />
        <Route path="/reservas" element={<ReservasPage />} />
        <Route path="/notificaciones" element={<NotificacionesPage />} />
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
