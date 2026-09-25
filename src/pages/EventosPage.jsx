import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { crearEvento, getEventos } from '../services/api'
import { useApp } from '../context/AppContext'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/ui/Modal'
import FormField from '../components/common/FormField'
import { formatearFecha } from '../utils/formatters'

const TIPOS_EVENTO = ['Conferencia', 'Taller', 'Actividad institucional', 'Seminario']

const FORMULARIO_VACIO = {
  nombre: '',
  fecha: '',
  hora: '',
  lugar: '',
  descripcion: '',
  tipo: TIPOS_EVENTO[0],
}

/**
 * Vista de eventos y actividades institucionales. El administrador
 * del sistema y el personal administrativo pueden publicar nuevos
 * eventos; al hacerlo, se notifica automáticamente a toda la
 * comunidad (estudiantes y docentes).
 */
export default function EventosPage() {
  const { usuario, esAdmin, esAdministrativo } = useApp()
  const puedePublicar = esAdmin || esAdministrativo
  const { data: eventos, loading, refetch } = useFetch(getEventos, [])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [enviando, setEnviando] = useState(false)

  function actualizarCampo(campo) {
    return (e) => setFormulario((prev) => ({ ...prev, [campo]: e.target.value }))
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setEnviando(true)
    await crearEvento(formulario, usuario?.id)
    setEnviando(false)
    setModalAbierto(false)
    setFormulario(FORMULARIO_VACIO)
    refetch()
  }

  return (
    <div className="eventos-page">
      <div className="eventos-page__header">
        <div>
          <h1>Eventos y actividades</h1>
          <p className="eventos-page__subtitle">Conferencias, talleres y actividades académicas de la UAJS.</p>
        </div>
        {puedePublicar && <Button variant="accent" onClick={() => setModalAbierto(true)}>+ Nuevo evento</Button>}
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

      <Modal open={modalAbierto} title="Publicar nuevo evento" onClose={() => setModalAbierto(false)}>
        <form onSubmit={manejarEnvio}>
          <FormField label="Nombre del evento" required value={formulario.nombre} onChange={actualizarCampo('nombre')} placeholder="Ej. Semana de la Ingeniería 2026" />
          <FormField label="Tipo" as="select" options={TIPOS_EVENTO} value={formulario.tipo} onChange={actualizarCampo('tipo')} />
          <FormField label="Fecha" type="date" required value={formulario.fecha} onChange={actualizarCampo('fecha')} />
          <FormField label="Hora" required placeholder="Ej. 09:00" value={formulario.hora} onChange={actualizarCampo('hora')} />
          <FormField label="Lugar" required value={formulario.lugar} onChange={actualizarCampo('lugar')} placeholder="Ej. Auditorio Principal" />
          <FormField label="Descripción" as="textarea" required value={formulario.descripcion} onChange={actualizarCampo('descripcion')} placeholder="Describe brevemente el evento…" />
          <p className="eventos-page__aviso">Al publicar, se notificará automáticamente a todos los estudiantes y docentes de la plataforma.</p>
          <div className="eventos-page__form-actions">
            <Button type="button" variant="ghost" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={enviando}>{enviando ? 'Publicando…' : 'Publicar evento'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
