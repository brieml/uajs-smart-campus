import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import './Sidebar.css'
import './Header.css'
import './Footer.css'
import './DashboardLayout.css'

/**
 * Layout compartido por todas las vistas internas del panel
 * (dashboard, solicitudes, reservas, eventos, notificaciones, perfil).
 * Contiene la barra lateral, el encabezado y el pie de página, y
 * renderiza la vista activa mediante <Outlet /> de React Router.
 */
export default function DashboardLayout() {
  const [sidebarAbierta, setSidebarAbierta] = useState(false)
  const [terminoBusqueda, setTerminoBusqueda] = useState('')

  return (
    <div className="dashboard-layout">
      <Sidebar open={sidebarAbierta} onClose={() => setSidebarAbierta(false)} />

      <div className="dashboard-layout__content">
        <Header
          onToggleSidebar={() => setSidebarAbierta((v) => !v)}
          onSearch={setTerminoBusqueda}
        />
        <main className="dashboard-layout__main">
          <div className="u-container">
            <Outlet context={{ terminoBusqueda }} />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
