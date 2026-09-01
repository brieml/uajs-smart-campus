import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { crearReserva, getRecursos, getReservas } from '../services/api'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/ui/Modal'
import FormField from '../components/common/FormField'
import { formatearFecha } from '../utils/formatters'

const FORMULARIO_VACIO = { recurso: '', tipo: 'Laboratorio', fecha: '', hora: '' }

/**
 * Vista de reservas: catálogo de recursos disponibles y listado de
 * reservas registradas por el usuario, con modal para crear una
 * nueva reserva.
 */
export default function ReservasPage() {
  const { data: reservas, loading: cargandoReservas, refetch } = useFetch(getReservas, [])
  const { data: recursos, loading: cargandoRecursos } = useFetch(getRecursos, [])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [enviando, setEnviando] = useState(false)

  function actualizarCampo(campo) {
    return (e) => setFormulario((prev) => ({ ...prev, [campo]: e.target.value }))
  }

  function abrirModalConRecurso(recurso) {
    setFormulario({ recurso: recurso.nombre, tipo: recurso.tipo, fecha: '', hora: '' })
    setModalAbierto(true)
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setEnviando(true)
    await crearReserva(formulario)
    setEnviando(false)
    setModalAbierto(false)
    setFormulario(FORMULARIO_VACIO)
    refetch()
  }

  return (
    <div className="reservas-page">
      <div className="reservas-page__header">
        <div>
          <h1>Reservas</h1>
          <p className="reservas-page__subtitle">Consulta la disponibilidad y reserva salas, laboratorios y equipos.</p>
        </div>
        <Button variant="accent" onClick={() => setModalAbierto(true)}>+ Nueva reserva</Button>
      </div>

      <section>
        <h2 className="reservas-page__section-title">Recursos disponibles</h2>
        {cargandoRecursos && <LoadingSpinner label="Consultando disponibilidad…" />}
        <div className="reservas-page__recursos-grid">
          {recursos?.map((recurso) => (
            <Card key={recurso.id} className="recurso-card card--padded">
              <div className="recurso-card__top">
                <p className="recurso-card__codigo">{recurso.codigo}</p>
                <Badge tono={recurso.disponible ? 'success' : 'neutral'}>{recurso.estado}</Badge>
              </div>
              <h3 className="recurso-card__nombre">{recurso.nombre}</h3>
              <p className="recurso-card__meta">{recurso.tipo} · {recurso.ubicacion}</p>
              <Button
                variant="ghost"
                size="sm"
                disabled={!recurso.disponible}
                onClick={() => abrirModalConRecurso(recurso)}
              >
                {recurso.disponible ? 'Reservar' : 'No disponible'}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="reservas-page__section-title">Tus reservas</h2>
        {cargandoReservas && <LoadingSpinner label="Cargando tus reservas…" />}
        {!cargandoReservas && reservas?.length === 0 && (
          <EmptyState icon="🗓️" title="No tienes reservas registradas" description="Elige un recurso disponible arriba para crear tu primera reserva." />
        )}
        <div className="reservas-page__lista">
          {reservas?.map((reserva) => (
            <Card key={reserva.id} className="card--padded reserva-item">
              <div>
                <p className="reserva-item__id">{reserva.id}</p>
                <h3 className="reserva-item__nombre">{reserva.recurso}</h3>
                <p className="reserva-item__meta">{formatearFecha(reserva.fecha)} · {reserva.hora}</p>
              </div>
              <Badge estado={reserva.estado} />
            </Card>
          ))}
        </div>
      </section>

      <Modal open={modalAbierto} title="Registrar nueva reserva" onClose={() => setModalAbierto(false)}>
        <form onSubmit={manejarEnvio}>
          <FormField label="Recurso" required value={formulario.recurso} onChange={actualizarCampo('recurso')} placeholder="Ej. Laboratorio de Redes 2" />
          <FormField label="Tipo" as="select" options={['Laboratorio', 'Sala', 'Espacio académico', 'Equipo tecnológico']} value={formulario.tipo} onChange={actualizarCampo('tipo')} />
          <FormField label="Fecha" type="date" required value={formulario.fecha} onChange={actualizarCampo('fecha')} />
          <FormField label="Hora" required placeholder="Ej. 08:00 - 10:00" value={formulario.hora} onChange={actualizarCampo('hora')} />
          <div className="reservas-page__form-actions">
            <Button type="button" variant="ghost" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={enviando}>{enviando ? 'Guardando…' : 'Registrar reserva'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
