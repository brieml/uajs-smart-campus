import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'

const FILTROS = ['Todas', 'No leídas', 'Solicitud', 'Reserva', 'Evento']

/**
 * Vista de notificaciones: comunicaciones generadas por la
 * plataforma, con filtro por tipo y opción de marcar como leídas.
 */
export default function NotificacionesPage() {
  const { notificaciones, marcarComoLeida } = useApp()
  const [filtro, setFiltro] = useState('Todas')

  const notificacionesFiltradas = useMemo(() => {
    if (filtro === 'Todas') return notificaciones
    if (filtro === 'No leídas') return notificaciones.filter((n) => !n.leida)
    return notificaciones.filter((n) => n.tipo === filtro)
  }, [notificaciones, filtro])

  return (
    <div className="notificaciones-page">
      <div>
        <h1>Notificaciones</h1>
        <p className="notificaciones-page__subtitle">Cambios de estado, confirmaciones y comunicaciones de la plataforma.</p>
      </div>

      <div className="notificaciones-page__filtros">
        {FILTROS.map((opcion) => (
          <button
            key={opcion}
            type="button"
            className={`notificaciones-page__filtro ${filtro === opcion ? 'notificaciones-page__filtro--activo' : ''}`}
            onClick={() => setFiltro(opcion)}
          >
            {opcion}
          </button>
        ))}
      </div>

      {notificacionesFiltradas.length === 0 && (
        <EmptyState icon="🔔" title="No hay notificaciones con este filtro" description="Vuelve más tarde o cambia el filtro seleccionado." />
      )}

      <div className="notificaciones-page__lista">
        {notificacionesFiltradas.map((notificacion) => (
          <Card
            key={notificacion.id}
            className={`card--padded notificacion-item ${notificacion.leida ? '' : 'notificacion-item--no-leida'}`}
          >
            <div className="notificacion-item__cuerpo">
              <span className="notificacion-item__tipo">{notificacion.tipo}</span>
              <p className="notificacion-item__mensaje">{notificacion.mensaje}</p>
              <p className="notificacion-item__fecha">{notificacion.fecha}</p>
            </div>
            {!notificacion.leida && (
              <Button variant="ghost" size="sm" onClick={() => marcarComoLeida(notificacion.id)}>
                Marcar leída
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
