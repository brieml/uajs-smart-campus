import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getServicios, getResumenDashboard } from '../services/api'
import { useApp } from '../context/AppContext'
import Card from '../components/common/Card'
import SearchBar from '../components/common/SearchBar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

const INDICADORES = [
  { clave: 'solicitudesPendientes', label: 'Solicitudes pendientes', icon: '📄' },
  { clave: 'reservasRealizadas', label: 'Reservas realizadas', icon: '🗓️' },
  { clave: 'notificacionesNoLeidas', label: 'Notificaciones sin leer', icon: '🔔' },
  { clave: 'proximosEventos', label: 'Próximos eventos', icon: '🎓' },
  { clave: 'serviciosDisponibles', label: 'Servicios disponibles', icon: '🧭' },
]

/**
 * Página principal / dashboard universitario. Muestra el panel de
 * indicadores y el catálogo de servicios, filtrable mediante la barra
 * de búsqueda (compartida desde el encabezado a través del contexto
 * de la ruta, o local si se usa directamente en esta vista).
 */
export default function HomePage() {
  const { usuario } = useApp()
  const navigate = useNavigate()
  const { terminoBusqueda } = useOutletContext() ?? {}
  const [busquedaLocal, setBusquedaLocal] = useState('')

  const terminoActivo = (terminoBusqueda || busquedaLocal || '').trim().toLowerCase()

  const { data: servicios, loading: cargandoServicios } = useFetch(getServicios, [])
  const { data: resumen, loading: cargandoResumen } = useFetch(getResumenDashboard, [])

  const serviciosFiltrados = useMemo(() => {
    if (!servicios) return []
    if (!terminoActivo) return servicios
    return servicios.filter(
      (s) =>
        s.nombre.toLowerCase().includes(terminoActivo) ||
        s.categoria.toLowerCase().includes(terminoActivo)
    )
  }, [servicios, terminoActivo])

  

  return (
    <div className="home-page">
      <section className="home-page__welcome">
        <div>
          <p className="home-page__eyebrow">Panel principal</p>
          <h1 className="home-page__title">Hola, {usuario?.nombre?.split(' ')[0] ?? 'bienvenido'} 👋</h1>
          <p className="home-page__subtitle">Este es el estado actual de tus servicios en UAJS Smart Campus.</p>
        </div>
        <div className="home-page__local-search">
          <SearchBar value={busquedaLocal} onChange={setBusquedaLocal} placeholder="Buscar por nombre o categoría…" />
        </div>
       
      </section>
      

      <section className="home-page__stats" aria-label="Indicadores del dashboard">
        {cargandoResumen && <LoadingSpinner label="Calculando indicadores…" />}
        {resumen && (
          <div className="home-page__stats-grid">
            {INDICADORES.map((indicador) => (
              <Card key={indicador.clave} className="stat-card card--padded">
                <span className="stat-card__icon" aria-hidden="true">{indicador.icon}</span>
                <p className="stat-card__value">{resumen[indicador.clave]}</p>
                <p className="stat-card__label">{indicador.label}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="home-page__services">
        <div className="home-page__services-header">
          <h2>Servicios universitarios</h2>
          <p className="home-page__services-count">{serviciosFiltrados.length} de {servicios?.length ?? 0}</p>
        </div>

        {cargandoServicios && <LoadingSpinner label="Cargando servicios disponibles…" />}

        {!cargandoServicios && serviciosFiltrados.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No encontramos servicios con ese criterio"
            description="Prueba con otro nombre o categoría, por ejemplo «reservas» o «trámites»."
          />
        )}

        {!cargandoServicios && serviciosFiltrados.length > 0 && (
          <div className="home-page__services-grid">
            {serviciosFiltrados.map((servicio) => (
              <Card
                key={servicio.id}
                as="button"
                className={`service-card card--padded card--interactive service-card--${servicio.color}`}
                onClick={() => navigate(`/servicios/${servicio.id}`)}
              >
                <span className="service-card__icon" aria-hidden="true">{servicio.icono}</span>
                <h3 className="service-card__title">{servicio.nombre}</h3>
                <p className="service-card__category">{servicio.categoria}</p>
                <p className="service-card__description">{servicio.descripcionCorta}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
