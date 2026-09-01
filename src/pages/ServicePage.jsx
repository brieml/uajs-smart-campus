import { useNavigate, useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getServicioPorId } from '../services/api'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

const RUTA_POR_SERVICIO = {
  solicitudes: '/solicitudes',
  reservas: '/reservas',
  eventos: '/eventos',
  notificaciones: '/notificaciones',
}

/**
 * Vista de detalle de un servicio universitario: descripción completa,
 * funcionalidades disponibles y acceso directo a la vista funcional
 * asociada (por ejemplo, Reservas → listado de reservas).
 */
export default function ServicePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: servicio, loading } = useFetch(() => getServicioPorId(id), [id])

  if (loading) return <LoadingSpinner label="Cargando servicio…" />

  if (!servicio) {
    return (
      <EmptyState
        icon="🚫"
        title="Servicio no encontrado"
        description="El servicio solicitado no existe o fue movido."
        action={<Button variant="ghost" onClick={() => navigate('/home')}>Volver al inicio</Button>}
      />
    )
  }

  const rutaAsociada = RUTA_POR_SERVICIO[servicio.id]

  return (
    <div className="service-page">
      <Button variant="link" onClick={() => navigate(-1)}>← Volver</Button>

      <header className={`service-page__header service-page__header--${servicio.color}`}>
        <span className="service-page__icon" aria-hidden="true">{servicio.icono}</span>
        <div>
          <p className="service-page__category">{servicio.categoria}</p>
          <h1 className="service-page__title">{servicio.nombre}</h1>
        </div>
      </header>

      <div className="service-page__grid">
        <Card className="card--padded">
          <h2 className="service-page__section-title">Descripción</h2>
          <p className="service-page__description">{servicio.descripcion}</p>
        </Card>

        <Card className="card--padded">
          <h2 className="service-page__section-title">Funcionalidades</h2>
          <ul className="service-page__features">
            {servicio.funcionalidades.map((funcionalidad) => (
              <li key={funcionalidad} className="service-page__feature">
                <span aria-hidden="true">✓</span> {funcionalidad}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {rutaAsociada && (
        <div className="service-page__cta">
          <Button variant="accent" onClick={() => navigate(rutaAsociada)}>
            Ir a {servicio.nombre}
          </Button>
        </div>
      )}
    </div>
  )
}
