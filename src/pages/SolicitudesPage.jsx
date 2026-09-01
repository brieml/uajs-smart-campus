import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { crearSolicitud, getSolicitudes } from '../services/api'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/ui/Modal'
import StatusStepper from '../components/ui/StatusStepper'
import FormField from '../components/common/FormField'
import { formatearFecha } from '../utils/formatters'

const TIPOS_SOLICITUD = [
  'Certificado académico',
  'Constancia de matrícula',
  'Reserva de laboratorio',
  'PQRS - Petición',
  'PQRS - Queja',
  'PQRS - Reclamo',
  'PQRS - Sugerencia',
]

const DEPENDENCIAS = ['Registro y Control', 'Bienestar Universitario', 'Facultad de Ingeniería', 'Recursos Físicos']

const FORMULARIO_VACIO = {
  tipoServicio: TIPOS_SOLICITUD[0],
  dependencia: DEPENDENCIAS[0],
  prioridad: 'Media',
  descripcion: '',
}

/**
 * Vista de solicitudes: permite consultar las solicitudes registradas
 * por el usuario y registrar una nueva a través de un modal.
 */
export default function SolicitudesPage() {
  const navigate = useNavigate()
  const { data: solicitudes, loading, refetch } = useFetch(getSolicitudes, [])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [enviando, setEnviando] = useState(false)

  function actualizarCampo(campo) {
    return (e) => setFormulario((prev) => ({ ...prev, [campo]: e.target.value }))
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setEnviando(true)
    await crearSolicitud(formulario)
    setEnviando(false)
    setModalAbierto(false)
    setFormulario(FORMULARIO_VACIO)
    refetch()
  }

  return (
    <div className="solicitudes-page">
      <div className="solicitudes-page__header">
        <div>
          <h1>Solicitudes</h1>
          <p className="solicitudes-page__subtitle">Registro y seguimiento de tus trámites universitarios.</p>
        </div>
        <Button variant="accent" onClick={() => setModalAbierto(true)}>+ Nueva solicitud</Button>
      </div>

      {loading && <LoadingSpinner label="Cargando tus solicitudes…" />}

      {!loading && solicitudes?.length === 0 && (
        <EmptyState
          icon="📄"
          title="Aún no tienes solicitudes registradas"
          description="Cuando registres un trámite, aparecerá aquí con su estado actualizado."
          action={<Button variant="accent" onClick={() => setModalAbierto(true)}>Registrar solicitud</Button>}
        />
      )}

      <div className="solicitudes-page__list">
        {solicitudes?.map((solicitud) => (
          <Card
            key={solicitud.id}
            as="button"
            className="solicitud-card card--padded card--interactive"
            onClick={() => navigate(`/solicitudes/${solicitud.id}`)}
          >
            <div className="solicitud-card__top">
              <div>
                <p className="solicitud-card__id">{solicitud.id}</p>
                <h3 className="solicitud-card__title">{solicitud.tipoServicio}</h3>
              </div>
              <Badge estado={solicitud.estado} />
            </div>
            <p className="solicitud-card__description">{solicitud.descripcion}</p>
            <StatusStepper estadoActual={solicitud.estado} compact />
            <div className="solicitud-card__meta">
              <span>{solicitud.dependencia}</span>
              <span>{formatearFecha(solicitud.fecha)}</span>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalAbierto} title="Registrar nueva solicitud" onClose={() => setModalAbierto(false)}>
        <form onSubmit={manejarEnvio}>
          <FormField label="Tipo de solicitud" as="select" options={TIPOS_SOLICITUD} value={formulario.tipoServicio} onChange={actualizarCampo('tipoServicio')} />
          <FormField label="Dependencia" as="select" options={DEPENDENCIAS} value={formulario.dependencia} onChange={actualizarCampo('dependencia')} />
          <FormField label="Prioridad" as="select" options={['Baja', 'Media', 'Alta']} value={formulario.prioridad} onChange={actualizarCampo('prioridad')} />
          <FormField label="Descripción" as="textarea" required value={formulario.descripcion} onChange={actualizarCampo('descripcion')} placeholder="Describe brevemente tu solicitud…" />
          <div className="solicitudes-page__form-actions">
            <Button type="button" variant="ghost" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={enviando}>
              {enviando ? 'Registrando…' : 'Registrar solicitud'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
