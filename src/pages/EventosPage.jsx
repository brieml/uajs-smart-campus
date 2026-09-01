import { useFetch } from '../hooks/useFetch'
import { getEventos } from '../services/api'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { formatearFecha } from '../utils/formatters'

/**
 * Vista de eventos y actividades institucionales.
 */
export default function EventosPage() {
  const { data: eventos, loading } = useFetch(getEventos, [])

  return (
    <div className="eventos-page">
      <div>
        <h1>Eventos y actividades</h1>
        <p className="eventos-page__subtitle">Conferencias, talleres y actividades académicas de la UAJS.</p>
      </div>

      {loading && <LoadingSpinner label="Cargando agenda institucional…" />}

      {!loading && eventos?.length === 0 && (
        <EmptyState icon="🎓" title="No hay eventos próximos" description="Vuelve pronto para conocer la nueva agenda institucional." />
      )}

      <div className="eventos-page__timeline">
        {eventos?.map((evento) => (
          <Card key={evento.id} className="card--padded evento-item">
            <div className="evento-item__fecha">
              <p className="evento-item__dia">{formatearFecha(evento.fecha)}</p>
              <p className="evento-item__hora">{evento.hora}</p>
            </div>
            <div className="evento-item__cuerpo">
              <span className="evento-item__tipo">{evento.tipo}</span>
              <h3 className="evento-item__nombre">{evento.nombre}</h3>
              <p className="evento-item__descripcion">{evento.descripcion}</p>
              <p className="evento-item__lugar">📍 {evento.lugar}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
