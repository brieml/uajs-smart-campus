import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useFetch } from '../hooks/useFetch'
import { getResumenDashboard } from '../services/api'
import Card from '../components/common/Card'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'

/**
 * Vista de perfil: información completa del usuario autenticado obtenida
 * desde la API real (GET /api/v1/auth/me), incluyendo:
 * - Datos de persona natural (tercero: nombres, teléfono, dirección, ciudad).
 * - Datos académicos si es estudiante (código, carrera, semestre, promedio).
 * - Datos académicos si es docente (código docente, facultad, título, contrato).
 * - Roles del sistema RBAC y módulos con sus acciones autorizadas.
 */
export default function PerfilPage() {
  const navigate = useNavigate()
  const { usuario, cargandoUsuario, esAdmin, cerrarSesion } = useApp()
  const { data: resumen, loading: cargandoResumen } = useFetch(() => getResumenDashboard(usuario), [usuario])

  const correo = usuario?.correo || usuario?.email || '—'
  const roles = usuario?.roles?.length ? usuario.roles.join(', ') : usuario?.tipoUsuario
  const tercero = usuario?.tercero
  const estudiante = usuario?.estudiante
  const docente = usuario?.docente

  async function manejarCierreSesion() {
    await cerrarSesion()
    navigate('/login')
  }

  function formatearFecha(iso) {
    if (!iso) return '—'
    try {
      const fecha = new Date(iso)
      if (isNaN(fecha.getTime())) return iso
      return fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return iso
    }
  }

  function mapearGenero(g) {
    if (g === 'M') return 'Masculino'
    if (g === 'F') return 'Femenino'
    return g || '—'
  }

  function mapearContrato(c) {
    if (c === 'full_time') return 'Tiempo Completo'
    if (c === 'part_time') return 'Medio Tiempo'
    return c || '—'
  }

  if (cargandoUsuario) return <LoadingSpinner label="Cargando tu perfil…" />

  return (
    <div className="perfil-page">
      <div className="perfil-page__header">
        <div>
          <h1>Perfil Institucional</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13.5px', margin: '4px 0 0' }}>
            Información sincronizada con el servicio de autenticación y registro institucional (UAJS)
          </p>
        </div>
        <Button variant="ghost" onClick={manejarCierreSesion}>Cerrar sesión</Button>
      </div>

      <Card className="card--padded perfil-page__tarjeta">
        <Avatar nombre={usuario?.nombre} size="lg" />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 className="perfil-page__nombre" style={{ margin: 0 }}>{usuario?.nombre}</h2>
            <Badge tono={esAdmin ? 'danger' : usuario?.tipoUsuario === 'DOCENTE' ? 'warning' : 'info'}>
              {usuario?.tipoUsuario}
            </Badge>
          </div>
          <p className="perfil-page__rol">
            {usuario?.programa ? usuario.programa : usuario?.tipoUsuario}
            {usuario?.codigo ? ` · Código: ${usuario.codigo}` : ''}
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px', fontSize: '13px', color: 'var(--color-text-soft)' }}>
            <span>✉️ {correo}</span>
            {usuario?.cedula && <span>🆔 {tercero?.tipoDocumento || 'C.C.'} {usuario.cedula}</span>}
            {tercero?.ciudad && <span>📍 {tercero.ciudad}</span>}
            {tercero?.telefono && <span>📞 {tercero.telefono}</span>}
          </div>
        </div>
      </Card>

      <div className="perfil-page__grid">
        {/* Datos Personales (Tercero) */}
        {tercero && (
          <Card className="card--padded">
            <h3 className="perfil-page__section-title">Datos Personales</h3>
            <dl className="perfil-page__fields">
              <div><dt>Tipo de Documento</dt><dd>{tercero.tipoDocumento || 'CC'}</dd></div>
              <div><dt>Número de Documento</dt><dd>{tercero.numeroDocumento || usuario?.cedula || '—'}</dd></div>
              <div><dt>Teléfono</dt><dd>{tercero.telefono || '—'}</dd></div>
              <div><dt>Dirección</dt><dd>{tercero.direccion || '—'}</dd></div>
              <div><dt>Ciudad</dt><dd>{tercero.ciudad || '—'}</dd></div>
              <div><dt>Fecha de Nacimiento</dt><dd>{formatearFecha(tercero.fechaNacimiento)}</dd></div>
              <div><dt>Género</dt><dd>{mapearGenero(tercero.genero)}</dd></div>
            </dl>
          </Card>
        )}

        {/* Datos Académicos si es Estudiante */}
        {estudiante && (
          <Card className="card--padded">
            <h3 className="perfil-page__section-title">Información Académica</h3>
            <dl className="perfil-page__fields">
              <div><dt>Código Estudiante</dt><dd>{estudiante.codigoEstudiante}</dd></div>
              <div><dt>Programa</dt><dd>{estudiante.programa?.nombre || '—'}</dd></div>
              <div><dt>Código Programa</dt><dd>{estudiante.programa?.codigo || '—'}</dd></div>
              <div><dt>Semestre Actual</dt><dd>{estudiante.semestreActual}° Semestre</dd></div>
              <div><dt>Promedio Acumulado (GPA)</dt><dd style={{ color: 'var(--color-success)', fontWeight: 700 }}>{estudiante.promedio}</dd></div>
              <div><dt>Estado de Matrícula</dt><dd><Badge tono="success">{estudiante.estado}</Badge></dd></div>
              <div><dt>Fecha de Matrícula</dt><dd>{formatearFecha(estudiante.fechaMatricula)}</dd></div>
            </dl>
          </Card>
        )}

        {/* Datos Académicos/Laborales si es Docente */}
        {docente && (
          <Card className="card--padded">
            <h3 className="perfil-page__section-title">Información Docente</h3>
            <dl className="perfil-page__fields">
              <div><dt>Código Docente</dt><dd>{docente.codigoDocente}</dd></div>
              <div><dt>Facultad</dt><dd>{docente.facultad?.nombre || '—'}</dd></div>
              <div><dt>Código Facultad</dt><dd>{docente.facultad?.codigo || '—'}</dd></div>
              <div><dt>Título Académico</dt><dd>{docente.tituloAcademico || '—'}</dd></div>
              <div><dt>Tipo de Contrato</dt><dd>{mapearContrato(docente.tipoContrato)}</dd></div>
              <div><dt>Estado</dt><dd><Badge tono="success">{docente.estado}</Badge></dd></div>
              <div><dt>Fecha de Contratación</dt><dd>{formatearFecha(docente.fechaContratacion)}</dd></div>
            </dl>
          </Card>
        )}

        {/* Si no es estudiante ni docente (Administrador / Administrativo) */}
        {!estudiante && !docente && (
          <Card className="card--padded">
            <h3 className="perfil-page__section-title">Datos Institucionales</h3>
            <dl className="perfil-page__fields">
              <div><dt>Identificador de Cuenta</dt><dd>#{usuario?.id}</dd></div>
              <div><dt>Tipo de Usuario</dt><dd>{usuario?.tipoUsuario}</dd></div>
              <div><dt>Roles Asignados</dt><dd>{roles || '—'}</dd></div>
              <div><dt>Dependencia</dt><dd>{esAdmin ? 'Oficina de Sistemas / Dirección TIC' : 'Personal Administrativo'}</dd></div>
            </dl>
          </Card>
        )}

        {/* Módulos y Permisos RBAC */}
        {usuario?.modulos?.length > 0 && (
          <Card className="card--padded">
            <h3 className="perfil-page__section-title">Módulos y Permisos RBAC</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Permisos asignados según roles en el servicio de autenticación:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {usuario.modulos.map((m) => (
                <div key={m.modulo} style={{ padding: '8px 10px', background: 'var(--color-bg)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', textTransform: 'capitalize', marginBottom: '6px' }}>
                    📦 Módulo {m.modulo}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(m.acciones || []).map((acc) => (
                      <span key={acc} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: 'var(--color-info-bg)', color: 'var(--color-info)', fontWeight: 600 }}>
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Resumen de actividad */}
        <Card className="card--padded">
          <h3 className="perfil-page__section-title">Actividad en Plataforma</h3>
          {cargandoResumen ? (
            <LoadingSpinner label="Calculando actividad…" />
          ) : (
            <dl className="perfil-page__fields">
              <div><dt>{esAdmin ? 'Solicitudes en sistema' : 'Mis solicitudes pendientes'}</dt><dd>{resumen.solicitudesPendientes}</dd></div>
              <div><dt>{esAdmin ? 'Reservas en sistema' : 'Mis reservas realizadas'}</dt><dd>{resumen.reservasRealizadas}</dd></div>
              <div><dt>Notificaciones sin leer</dt><dd>{resumen.notificacionesNoLeidas}</dd></div>
            </dl>
          )}
        </Card>
      </div>
    </div>
  )
}
