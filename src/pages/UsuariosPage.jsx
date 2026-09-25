import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  esModoMock,
  getFacultades,
  getProgramas,
  getTiposDocumento,
  getUsuarios,
} from '../services/api'
import { TIPOS_USUARIO } from '../components/ui/TiposUsuario'
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
  // Campos solo modo real (auth-service + university-service)
  documentTypeCode: 'CC',
  programaId: '',
  facultadId: '',
}

/**
 * Panel de administración de usuarios (exclusivo del rol
 * ADMINISTRADOR).
 * - Modo mock: CRUD local en localStorage (uajs.usuarios).
 * - Modo real: sin user-service, el alta es compuesta:
 *   1) POST /universidad/terceros, 2) POST /universidad/estudiantes|docentes,
 *   3) POST /auth/register. El listado sigue siendo mock hasta que exista
 *   user-service; la edición de terceros numéricos va a PUT /universidad/terceros/:id.
 */
export default function UsuariosPage() {
  const { data: usuarios, loading, refetch } = useFetch(getUsuarios, [])
  const { data: tiposDocumento } = useFetch(getTiposDocumento, [])
  const { data: facultades } = useFetch(getFacultades, [])
  const { data: programas } = useFetch(getProgramas, [])
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
      correo: usuario.correo ?? usuario.email ?? '',
      documentTypeCode: usuario.documentTypeCode || 'CC',
      programaId: '',
      facultadId: '',
    })
    setError('')
    setModalAbierto(true)
  }

  async function manejarEnvio(e) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      if (!esModoMock && !usuarioEnEdicion) {
        if (!formulario.correo?.includes('@')) throw new Error('El correo institucional es obligatorio en modo real.')
        if ((formulario.password || '').length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres (exigencia de auth-service).')
        if (String(formulario.cedula || '').length < 5) throw new Error('El número de documento es inválido (mín. 5).')
      }
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
    try {
      await cambiarEstadoUsuario(usuario.id, usuario.activo === false)
      refetch()
    } catch (err) {
      setError(err.message || 'No fue posible cambiar el estado.')
    }
  }

  return (
    <div className="usuarios-page">
      <div className="usuarios-page__header">
        <div>
          <h1>Usuarios</h1>
          <p className="usuarios-page__subtitle">Administra las cuentas de estudiantes, docentes, personal administrativo y administradores.</p>
          {!esModoMock && (
            <p className="usuarios-page__subtitle">
              Modo real: el alta es compuesta (tercero + estudiante/docente + credencial auth). El listado
              sigue en mock hasta que exista user-service.
            </p>
          )}
        </div>
        <Button variant="accent" onClick={abrirModalNuevo}>+ Nuevo usuario</Button>
      </div>

      {error && !modalAbierto && <p className="usuarios-page__error" role="alert">{error}</p>}

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
          <FormField label="Nombre completo" required value={formulario.nombre} onChange={actualizarCampo('nombre')} placeholder="Nombre y apellidos (se divide en primer/segundo nombre y apellidos en modo real)" />
          <FormField label="Cédula / Núm. documento" required value={formulario.cedula} onChange={actualizarCampo('cedula')} placeholder="1102345678" />
          {!esModoMock && (
            <FormField
              label="Tipo de documento"
              as="select"
              options={(tiposDocumento?.length ? tiposDocumento.map((t) => t.code || t.codigo) : ['CC', 'TI', 'CE', 'PA'])}
              value={formulario.documentTypeCode}
              onChange={actualizarCampo('documentTypeCode')}
            />
          )}
          <FormField
            label={usuarioEnEdicion ? 'Nueva contraseña (opcional)' : esModoMock ? 'Contraseña' : 'Contraseña (mín. 8 caracteres)'}
            type="password"
            required={!usuarioEnEdicion}
            minLength={esModoMock ? undefined : 8}
            value={formulario.password}
            onChange={actualizarCampo('password')}
            placeholder={usuarioEnEdicion ? 'Dejar en blanco para no cambiarla' : '••••••'}
          />
          <FormField label="Tipo de usuario" as="select" options={TIPOS_USUARIO} value={formulario.tipoUsuario} onChange={actualizarCampo('tipoUsuario')} />
          <FormField label="Programa o dependencia" value={formulario.programa} onChange={actualizarCampo('programa')} placeholder="Ej. Ingeniería de Sistemas" />
          {!esModoMock && formulario.tipoUsuario === 'ESTUDIANTE' && (
            <FormField
              label="Programa académico (ID real)"
              as="select"
              options={['', ...(programas || []).map((p) => String(p.id || p.codigo))]}
              value={formulario.programaId}
              onChange={actualizarCampo('programaId')}
            />
          )}
          {!esModoMock && formulario.tipoUsuario === 'DOCENTE' && (
            <FormField
              label="Facultad (ID real)"
              as="select"
              options={['', ...(facultades || []).map((f) => String(f.id || f.codigo))]}
              value={formulario.facultadId}
              onChange={actualizarCampo('facultadId')}
            />
          )}
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
