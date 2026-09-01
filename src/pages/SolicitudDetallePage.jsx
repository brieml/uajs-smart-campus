import { useNavigate, useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getSolicitudPorId } from '../services/api'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import StatusStepper from '../components/ui/StatusStepper'
import { formatearFecha } from '../utils/formatters'

/**
 * Vista de detalle de una solicitud específica: información completa
 * y evolución de su estado mediante el StatusStepper en tamaño
 * completo.
 */
export default function SolicitudDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: solicitud, loading } = useFetch(() => getSolicitudPorId(id), [id])

  if (loading) return <LoadingSpinner label="Cargando solicitud…" />

  if (!solicitud) {
    return (
      <EmptyState
        icon="🚫"
        title={`No encontramos la solicitud ${id}`}
        description="Puede que ya haya sido eliminada o el enlace sea incorrecto."
        action={<Button variant="ghost" onClick={() => navigate('/solicitudes')}>Volver a solicitudes</Button>}
      />
    )
  }

  return (
    <div className="solicitud-detalle">
      <Button variant="link" onClick={() => navigate('/solicitudes')}>← Volver a solicitudes</Button>

      <div className="solicitud-detalle__header">
        <div>
          <p className="solicitud-detalle__id">{solicitud.id}</p>
          <h1 className="solicitud-detalle__title">{solicitud.tipoServicio}</h1>
        </div>
        <Badge estado={solicitud.estado} />
      </div>

      <Card className="card--padded solicitud-detalle__stepper-card">
        <h2 className="solicitud-detalle__section-title">Evolución del estado</h2>
        <StatusStepper estadoActual={solicitud.estado} />
      </Card>

      <div className="solicitud-detalle__grid">
        <Card className="card--padded">
          <h2 className="solicitud-detalle__section-title">Descripción</h2>
          <p className="solicitud-detalle__text">{solicitud.descripcion}</p>
        </Card>

        <Card className="card--padded">
          <h2 className="solicitud-detalle__section-title">Información del trámite</h2>
          <dl className="solicitud-detalle__fields">
            <div><dt>Dependencia</dt><dd>{solicitud.dependencia}</dd></div>
            <div><dt>Fecha de registro</dt><dd>{formatearFecha(solicitud.fecha)}</dd></div>
            <div><dt>Prioridad</dt><dd>{solicitud.prioridad}</dd></div>
            <div><dt>Responsable</dt><dd>{solicitud.responsable}</dd></div>
          </dl>
        </Card>
      </div>
    </div>
  )
}
