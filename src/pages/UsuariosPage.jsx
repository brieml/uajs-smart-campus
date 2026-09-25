import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { actualizarUsuario, cambiarEstadoUsuario, crearUsuario, getUsuarios } from '../services/api'
import { TIPOS_USUARIO } from '../services/mockData'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Avatar from '../components/common/Avatar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/ui/Modal'
import FormField from '../components/common/FormField'

const FORMULARIO_VACIO = {
  nombre: '',
  cedula: '',
  password: '',
  tipoUsuario: TIPOS_USUARIO[0],
  programa: '',
  correo: '',
}

/**
 * Panel de administración de usuarios (exclusivo del rol
 * ADMINISTRADOR). Permite ver la comunidad completa de la plataforma,
 * registrar nuevas cuentas y activar/desactivar o editar las
 * existentes.
 */
export default function UsuariosPage() {
  const { data: usuarios, loading, refetch } = useFetch(getUsuarios, [])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null)
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  function actualizarCampo(campo) {
    return (e) => setFormulario((prev) => ({ ...prev, [campo]: e.target.value }))
  }

  function abrirModalNuevo() {
    setUsuarioEnEdicion(null)
    setFormulario(FORMULARIO_VACIO)
    setError('')
    setModalAbierto(true)
  }

  function abrirModalEdicion(usuario) {
    setUsuarioEnEdicion(usuario)
    setFormulario({
      nombre: usuario.nombre,
      cedula: usuario.cedula,
      password: '',
      tipoUsuario: usuario.tipoUsuario,
      programa: usuario.programa ?? '',
      correo: usuario.correo ?? '',
    })
    setError('')
    setModalAbierto(true)
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      if (usuarioEnEdicion) {
        const cambios = { ...formulario }
        if (!cambios.password) delete cambios.password // no sobrescribir la clave si se deja vacía
        await actualizarUsuario(usuarioEnEdicion.id, cambios)
      } else {
        await crearUsuario(formulario)
      }
      setModalAbierto(false)
      refetch()
    } catch (err) {
      setError(err.message || 'No fue posible guardar el usuario.')
    } finally {
      setEnviando(false)
    }
  }

  async function alternarEstado(usuario) {
    await cambiarEstadoUsuario(usuario.id, usuario.activo === false)
    refetch()
  }

  return (
    <div className="usuarios-page">
      <div className="usuarios-page__header">
        <div>
          <h1>Usuarios</h1>
          <p className="usuarios-page__subtitle">Administra las cuentas de estudiantes, docentes, personal administrativo y administradores.</p>
        </div>
        <Button variant="accent" onClick={abrirModalNuevo}>+ Nuevo usuario</Button>
      </div>

      {loading && <LoadingSpinner label="Cargando usuarios…" />}

      {!loading && usuarios?.length === 0 && (
        <EmptyState icon="👥" title="Aún no hay usuarios registrados" description="Crea la primera cuenta con el botón de arriba." />
      )}

      <div className="usuarios-page__lista">
        {usuarios?.map((usuario) => (
          <Card key={usuario.id} className="card--padded usuario-item">
            <Avatar nombre={usuario.nombre} />
            <div className="usuario-item__info">
              <div className="usuario-item__top">
                <h3 className="usuario-item__nombre">{usuario.nombre}</h3>
                <Badge tono={usuario.activo === false ? 'neutral' : 'success'}>
                  {usuario.activo === false ? 'Inactivo' : 'Activo'}
                </Badge>
              </div>
              <p className="usuario-item__meta">
                {usuario.tipoUsuario} · C.C. {usuario.cedula} · {usuario.correo}
              </p>
              {usuario.programa && <p className="usuario-item__programa">{usuario.programa}</p>}
            </div>
            <div className="usuario-item__acciones">
              <Button variant="ghost" size="sm" onClick={() => abrirModalEdicion(usuario)}>Editar</Button>
              <Button
                variant={usuario.activo === false ? 'accent' : 'ghost'}
                size="sm"
                onClick={() => alternarEstado(usuario)}
              >
                {usuario.activo === false ? 'Activar' : 'Desactivar'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modalAbierto}
        title={usuarioEnEdicion ? 'Editar usuario' : 'Registrar nuevo usuario'}
        onClose={() => setModalAbierto(false)}
      >
        <form onSubmit={manejarEnvio}>
          <FormField label="Nombre completo" required value={formulario.nombre} onChange={actualizarCampo('nombre')} placeholder="Nombre y apellidos" />
          <FormField label="Cédula" required value={formulario.cedula} onChange={actualizarCampo('cedula')} placeholder="1102345678" />
          <FormField
            label={usuarioEnEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            type="password"
            required={!usuarioEnEdicion}
            value={formulario.password}
            onChange={actualizarCampo('password')}
            placeholder={usuarioEnEdicion ? 'Dejar en blanco para no cambiarla' : '••••••'}
          />
          <FormField label="Tipo de usuario" as="select" options={TIPOS_USUARIO} value={formulario.tipoUsuario} onChange={actualizarCampo('tipoUsuario')} />
          <FormField label="Programa o dependencia" value={formulario.programa} onChange={actualizarCampo('programa')} placeholder="Ej. Ingeniería de Sistemas" />
          <FormField label="Correo institucional" type="email" required value={formulario.correo} onChange={actualizarCampo('correo')} placeholder="nombre@uajs.edu.co" />

          {error && <p className="usuarios-page__error" role="alert">{error}</p>}

          <div className="usuarios-page__form-actions">
            <Button type="button" variant="ghost" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={enviando}>
              {enviando ? 'Guardando…' : usuarioEnEdicion ? 'Guardar cambios' : 'Registrar usuario'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
