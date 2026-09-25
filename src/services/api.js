/**
 * Capa de servicios / llamadas a la API.
 *
 *    Frontend React -> API Gateway (:3000/api/v1) -> microservicios
 *
 * Servicios ACTIVOS en backend:
 *  - auth-service        -> /api/v1/auth (login, register, me, refresh, logout, password-reset)
 *  - university-service  -> /api/v1/universidad (terceros, estudiantes, docentes, facultades, programas, empresas)
 *  - catalog-service     -> vía gateway /api/v1/catalogos (rewritten a /api/v1/catalog: document-types, campuses, cities, departments)
 *  - storage-service     -> vía gateway /api/v1/archivos (rewritten a /api/v1/storage)
 *
 * Modo Mock / Híbrido:
 *  - VITE_USE_MOCK_API=true: Opera 100% sobre localStorage sin necesidad de backend.
 *  - VITE_USE_MOCK_API=false: Se conecta a la API real para auth, universidad y catálogos,
 *    y mantiene soporte seguro con fallback local para servicios en andamio (solicitudes, reservas, eventos).
 */
import {
  servicios,
  solicitudesIniciales,
  reservasIniciales,
  recursos,
  eventos as eventosIniciales,
  notificacionesInicialesPorUsuario,
  usuarioActual,
  usuarios as usuariosIniciales,
} from './mockData'

export const esModoMock = import.meta.env.VITE_USE_MOCK_API !== 'false'
const USE_MOCK = esModoMock
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

/**
 * Microservicios en andamio (sin contenedor activo en Docker compose).
 * Evita llamadas fallidas que arrojen 503/404 en consola hasta que sus contenedores
 * estén implementados y en ejecución.
 */
const SERVICIOS_EN_ANDAMIO = {
  servicios: true,
  notificaciones: true,
  solicitudes: true,
  reservas: true,
  recursos: true,
  eventos: true,
  usuarios: true,
}

const LATENCY_MS = 300

const STORAGE_KEYS = {
  solicitudes: 'uajs.solicitudes',
  reservas: 'uajs.reservas',
  eventos: 'uajs.eventos',
  usuarios: 'uajs.usuarios',
  sesion: 'uajs.sesion',
  token: 'uajs.token',
  refreshToken: 'uajs.refreshToken',
  notificacionesPrefix: 'uajs.notificaciones.',
}

function leerStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function guardarStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* almacenamiento no disponible */
  }
}

function simularRed(payload) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(payload), LATENCY_MS)
  })
}

function generarId(prefijo) {
  const numero = Math.floor(1000 + Math.random() * 9000)
  return `${prefijo}-${numero}`
}

async function fetchJson(url, options = {}) {
  const token = leerStorage(STORAGE_KEYS.token, null)
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const respuesta = await fetch(url, {
    ...options,
    headers,
  })

  if (!respuesta.ok) {
    let errorMsg = `Error de API (${respuesta.status}) al consultar ${url}`
    try {
      const errJson = await respuesta.json()
      if (errJson.message) errorMsg = errJson.message
    } catch {
      // mantener mensaje por defecto
    }
    const err = new Error(errorMsg)
    err.status = respuesta.status
    throw err
  }

  return respuesta.json()
}

/* -------------------------------------------------------------------- */
/* USUARIOS / AUTENTICACIÓN                                              */
/* -------------------------------------------------------------------- */

function leerUsuarios() {
  return leerStorage(STORAGE_KEYS.usuarios, usuariosIniciales)
}

function guardarUsuarios(lista) {
  guardarStorage(STORAGE_KEYS.usuarios, lista)
}

function usuarioPublico(usuario) {
  if (!usuario) return null
  const { password: _clave, ...resto } = usuario
  return resto
}

function normalizarUsuarioBackend(user) {
  if (!user) return null
  const roles = user.roles || (user.rol ? [user.rol] : [])
  const rolPrincipal = roles[0] || 'ESTUDIANTE'
  const rolNorm = String(rolPrincipal).toUpperCase()

  let tipoUsuario = 'ESTUDIANTE'
  if (['ADMIN', 'SUPERADMIN', 'SUPER_ADMINISTRADOR', 'ADMINISTRADOR'].includes(rolNorm)) {
    tipoUsuario = 'ADMINISTRADOR'
  } else if (['STAFF', 'PERSONAL', 'ADMINISTRATIVO'].includes(rolNorm)) {
    tipoUsuario = 'ADMINISTRATIVO'
  } else if (['TEACHER', 'DOCENTE'].includes(rolNorm)) {
    tipoUsuario = 'DOCENTE'
  }

  const codigo = user.codigo || user.estudiante?.codigoEstudiante || user.docente?.codigoDocente || ''
  const programa = user.programa || user.estudiante?.programa?.nombre || user.docente?.facultad?.nombre || ''

  return {
    ...user,
    id: user.id,
    nombre: user.nombre || user.email?.split('@')[0] || 'Usuario',
    cedula: user.cedula || '',
    correo: user.email || user.correo,
    codigo,
    programa,
    tipoUsuario,
    roles,
  }
}

export async function iniciarSesion(identificador, password) {
  if (!USE_MOCK) {
    const res = await fetchJson(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: String(identificador).trim(), password }),
    })
    const payload = res.data || res
    const { accessToken, refreshToken, user } = payload

    if (accessToken) guardarStorage(STORAGE_KEYS.token, accessToken)
    if (refreshToken) guardarStorage(STORAGE_KEYS.refreshToken, refreshToken)

    let publico = normalizarUsuarioBackend(user)
    try {
      const meRes = await fetchJson(`${API_BASE_URL}/auth/me`)
      const meUser = meRes.data || meRes
      publico = normalizarUsuarioBackend({ ...publico, ...meUser })
    } catch {
      // mantener perfil inicial si me falla
    }

    guardarStorage(STORAGE_KEYS.sesion, publico)
    return publico
  }

  const idTrim = String(identificador).trim().toLowerCase()
  const encontrado = leerUsuarios().find(
    (u) =>
      (String(u.cedula).trim() === idTrim || (u.correo && u.correo.toLowerCase() === idTrim)) &&
      u.password === password
  )

  if (!encontrado) {
    await simularRed(null)
    throw new Error('Cédula/correo o contraseña incorrectos.')
  }
  if (encontrado.activo === false) {
    await simularRed(null)
    throw new Error('Esta cuenta se encuentra desactivada. Contacta al administrador del sistema.')
  }

  const publico = usuarioPublico(encontrado)
  guardarStorage(STORAGE_KEYS.sesion, publico)
  return simularRed(publico)
}

export async function cerrarSesion() {
  if (!USE_MOCK) {
    try {
      const refreshToken = leerStorage(STORAGE_KEYS.refreshToken, null)
      if (refreshToken) {
        await fetchJson(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        })
      }
    } catch {
      // Ignorar fallos de red al cerrar sesión
    }
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.sesion)
    window.localStorage.removeItem(STORAGE_KEYS.token)
    window.localStorage.removeItem(STORAGE_KEYS.refreshToken)
  } catch {
    /* almacenamiento no disponible */
  }
  return simularRed(true)
}

export async function getUsuarioActual() {
  if (!USE_MOCK) {
    const token = leerStorage(STORAGE_KEYS.token, null)
    const sesion = leerStorage(STORAGE_KEYS.sesion, null)
    if (!token && !sesion) return null

    if (token) {
      try {
        const res = await fetchJson(`${API_BASE_URL}/auth/me`)
        const user = res.data || res
        const publico = normalizarUsuarioBackend({ ...sesion, ...user })
        guardarStorage(STORAGE_KEYS.sesion, publico)
        return publico
      } catch {
        return sesion
      }
    }
    return sesion
  }

  const sesion = leerStorage(STORAGE_KEYS.sesion, null)
  return simularRed(sesion)
}

export async function solicitarRecuperacion(email) {
  if (USE_MOCK) {
    return simularRed({ success: true, message: 'Enlace enviado al correo institucional.' })
  }
  return fetchJson(`${API_BASE_URL}/auth/password-reset`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function getUsuarios() {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.usuarios) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/usuarios`)
      return res.data || res
    } catch {
      // user-service en andamio vacío; fallback a almacenamiento local
    }
  }
  return simularRed(leerUsuarios().map(usuarioPublico))
}

export async function crearUsuario(datos) {
  if (!USE_MOCK) {
    try {
      const nombresPartes = (datos.nombre || '').trim().split(' ')
      const primerNombre = nombresPartes[0] || 'Nombre'
      const segundoNombre = nombresPartes.length > 2 ? nombresPartes.slice(1, -1).join(' ') : (nombresPartes[1] || undefined)
      const primerApellido = nombresPartes.length > 1 ? nombresPartes[nombresPartes.length - 1] : 'Apellido'

      const terceroRes = await fetchJson(`${API_BASE_URL}/universidad/terceros`, {
        method: 'POST',
        body: JSON.stringify({
          tipoDocumento: datos.documentTypeCode || 'CC',
          numeroDocumento: String(datos.cedula),
          primerNombre,
          segundoNombre,
          primerApellido,
          emailInstitucional: datos.correo,
          telefono: '3001234567',
          direccion: 'Campus Principal',
          ciudadId: 1,
        }),
      })
      const tercero = terceroRes.data || terceroRes

      const rolUpper = datos.tipoUsuario?.toUpperCase()
      if (rolUpper === 'ESTUDIANTE' && datos.programaId) {
        await fetchJson(`${API_BASE_URL}/universidad/estudiantes`, {
          method: 'POST',
          body: JSON.stringify({
            terceroId: tercero.id,
            programaId: Number(datos.programaId),
            codigo: datos.codigo || `EST-${String(datos.cedula).slice(-4)}`,
            semestre: 1,
            estado: 'ACTIVO',
            password: datos.password || 'uajs206**',
          }),
        })
      } else if (rolUpper === 'DOCENTE' && datos.facultadId) {
        await fetchJson(`${API_BASE_URL}/universidad/docentes`, {
          method: 'POST',
          body: JSON.stringify({
            terceroId: tercero.id,
            facultadId: Number(datos.facultadId),
            codigo: datos.codigo || `DOC-${String(datos.cedula).slice(-4)}`,
            tipoContrato: 'TIEMPO_COMPLETO',
            categoria: 'ASOCIADO',
            estado: 'ACTIVO',
            password: datos.password || 'uajs206**',
          }),
        })
      } else {
        const rolAuth = rolUpper === 'ADMINISTRADOR' ? 'ADMIN' : rolUpper === 'ADMINISTRATIVO' ? 'STAFF' : 'STUDENT'
        await fetchJson(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          body: JSON.stringify({
            thirdPartyId: tercero.id,
            email: datos.correo,
            password: datos.password || 'uajs206**',
            roles: [rolAuth],
          }),
        })
      }

      // Guardar también en lista local para reflejo inmediato en el UI
      const actuales = leerUsuarios()
      const nuevo = {
        id: tercero.id || generarId('u'),
        activo: true,
        codigo: datos.codigo || `COD-${String(datos.cedula).slice(-4)}`,
        ...datos,
      }
      guardarUsuarios([...actuales, nuevo])
      return nuevo
    } catch (err) {
      throw new Error(err.message || 'Error al crear usuario en backend real.')
    }
  }

  const actuales = leerUsuarios()
  if (actuales.some((u) => u.cedula === datos.cedula)) {
    await simularRed(null)
    throw new Error('Ya existe un usuario registrado con esa cédula.')
  }
  const nuevo = {
    id: generarId('u'),
    activo: true,
    codigo: datos.codigo || generarId('COD'),
    ...datos,
  }
  guardarUsuarios([...actuales, nuevo])
  return simularRed(usuarioPublico(nuevo))
}

export async function actualizarUsuario(id, cambios) {
  if (!USE_MOCK) {
    try {
      await fetchJson(`${API_BASE_URL}/universidad/terceros/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cambios),
      })
    } catch {
      // Manejar gracefully
    }
  }
  const actuales = leerUsuarios()
  const actualizados = actuales.map((u) => (u.id === id ? { ...u, ...cambios } : u))
  guardarUsuarios(actualizados)

  const sesion = leerStorage(STORAGE_KEYS.sesion, null)
  if (sesion && sesion.id === id) {
    const actualizado = actualizados.find((u) => u.id === id)
    guardarStorage(STORAGE_KEYS.sesion, usuarioPublico(actualizado))
  }

  return simularRed(usuarioPublico(actualizados.find((u) => u.id === id)))
}

export async function cambiarEstadoUsuario(id, activo) {
  return actualizarUsuario(id, { activo })
}

/* -------------------------------------------------------------------- */
/* CATÁLOGOS Y UNIVERSIDAD (Documentos, Facultades, Programas)           */
/* -------------------------------------------------------------------- */

export async function getTiposDocumento() {
  if (!USE_MOCK) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/catalogos/document-types`)
      const items = res.data?.items || res.data || res
      if (Array.isArray(items) && items.length > 0) return items
    } catch {
      // fallback
    }
  }
  return simularRed([
    { id: 1, code: 'CC', codigo: 'CC', name: 'Cédula de Ciudadanía' },
    { id: 2, code: 'TI', codigo: 'TI', name: 'Tarjeta de Identidad' },
    { id: 3, code: 'CE', codigo: 'CE', name: 'Cédula de Extranjería' },
    { id: 4, code: 'PA', codigo: 'PA', name: 'Pasaporte' },
  ])
}

export async function getFacultades() {
  if (!USE_MOCK) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/universidad/facultades`)
      const items = res.data?.items || res.data || res
      if (Array.isArray(items) && items.length > 0) return items
    } catch {
      // fallback
    }
  }
  return simularRed([
    { id: 1, nombre: 'Facultad de Ingeniería', codigo: '1' },
    { id: 2, nombre: 'Ciencias de la Salud', codigo: '2' },
    { id: 3, nombre: 'Ciencias Económicas', codigo: '3' },
  ])
}

export async function getProgramas() {
  if (!USE_MOCK) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/universidad/programas`)
      const items = res.data?.items || res.data || res
      if (Array.isArray(items) && items.length > 0) return items
    } catch {
      // fallback
    }
  }
  return simularRed([
    { id: 1, nombre: 'Ingeniería de Sistemas', codigo: '1' },
    { id: 2, nombre: 'Medicina', codigo: '2' },
    { id: 3, nombre: 'Administración de Empresas', codigo: '3' },
  ])
}

/* -------------------------------------------------------------------- */
/* SERVICIOS UNIVERSITARIOS                                              */
/* -------------------------------------------------------------------- */

export async function getServicios() {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.servicios) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/servicios`)
      return res.data || res
    } catch {
      // fallback
    }
  }
  return simularRed(servicios)
}

export async function getServicioPorId(id) {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.servicios) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/servicios/${id}`)
      return res.data || res
    } catch {
      // fallback
    }
  }
  const encontrado = servicios.find((s) => s.id === id)
  return simularRed(encontrado ?? null)
}

/* -------------------------------------------------------------------- */
/* NOTIFICACIONES (bandeja individual por usuario)                       */
/* -------------------------------------------------------------------- */

function claveNotificaciones(usuarioId) {
  return `${STORAGE_KEYS.notificacionesPrefix}${usuarioId}`
}

function leerNotificacionesDe(usuarioId) {
  const semilla = notificacionesInicialesPorUsuario[usuarioId] ?? []
  return leerStorage(claveNotificaciones(usuarioId), semilla)
}

function guardarNotificacionesDe(usuarioId, lista) {
  guardarStorage(claveNotificaciones(usuarioId), lista)
}

function agregarNotificacion(usuarioId, { tipo, mensaje }) {
  if (!usuarioId) return
  const actuales = leerNotificacionesDe(usuarioId)
  const nueva = {
    id: generarId('NOT'),
    tipo,
    mensaje,
    fecha: new Date().toISOString().slice(0, 10),
    leida: false,
  }
  guardarNotificacionesDe(usuarioId, [nueva, ...actuales])
}

function difundirNotificacion({ tipo, mensaje }, { excluirId } = {}) {
  leerUsuarios()
    .filter((u) => u.id !== excluirId)
    .forEach((u) => agregarNotificacion(u.id, { tipo, mensaje }))
}

export async function getNotificaciones(usuarioId) {
  if (!usuarioId) return simularRed([])
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.notificaciones) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/usuarios/${usuarioId}/notificaciones`)
      return res.data || res
    } catch {
      // fallback
    }
  }
  return simularRed(leerNotificacionesDe(usuarioId))
}

export async function marcarNotificacionLeida(usuarioId, notificacionId) {
  const actuales = leerNotificacionesDe(usuarioId)
  const actualizadas = actuales.map((n) => (n.id === notificacionId ? { ...n, leida: true } : n))
  guardarNotificacionesDe(usuarioId, actualizadas)
  return simularRed(actualizadas)
}

/* -------------------------------------------------------------------- */
/* SOLICITUDES                                                           */
/* -------------------------------------------------------------------- */

export async function getSolicitudes() {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.solicitudes) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/solicitudes`)
      return res.data || res
    } catch {
      // fallback
    }
  }
  const data = leerStorage(STORAGE_KEYS.solicitudes, solicitudesIniciales)
  return simularRed(data)
}

export async function getSolicitudPorId(id) {
  const lista = await getSolicitudes()
  return lista.find((s) => s.id === id) ?? null
}

export async function crearSolicitud(datos, usuarioId) {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.solicitudes) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/solicitudes`, {
        method: 'POST',
        body: JSON.stringify(datos),
      })
      return res.data || res
    } catch {
      // fallback local si el microservicio está en andamio
    }
  }
  const actuales = leerStorage(STORAGE_KEYS.solicitudes, solicitudesIniciales)
  const nueva = {
    id: generarId('SOL'),
    usuarioId,
    fecha: new Date().toISOString().slice(0, 10),
    estado: 'REGISTRADA',
    responsable: 'Por asignar',
    ...datos,
  }
  const actualizadas = [nueva, ...actuales]
  guardarStorage(STORAGE_KEYS.solicitudes, actualizadas)
  return simularRed(nueva)
}

export async function actualizarEstadoSolicitud(id, nuevoEstado) {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.solicitudes) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/solicitudes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      return res.data || res
    } catch {
      // fallback local
    }
  }
  const actuales = leerStorage(STORAGE_KEYS.solicitudes, solicitudesIniciales)
  let solicitudActualizada = null
  const actualizadas = actuales.map((s) => {
    if (s.id !== id) return s
    solicitudActualizada = { ...s, estado: nuevoEstado }
    return solicitudActualizada
  })
  guardarStorage(STORAGE_KEYS.solicitudes, actualizadas)

  if (solicitudActualizada?.usuarioId) {
    agregarNotificacion(solicitudActualizada.usuarioId, {
      tipo: 'Solicitud',
      mensaje: `Tu solicitud ${id} (${solicitudActualizada.tipoServicio}) cambió de estado a "${nuevoEstado.replaceAll('_', ' ')}".`,
    })
  }

  return simularRed(solicitudActualizada)
}

/* -------------------------------------------------------------------- */
/* RESERVAS                                                              */
/* -------------------------------------------------------------------- */

export async function getReservas() {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.reservas) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/reservas`)
      return res.data || res
    } catch {
      // fallback local
    }
  }
  const data = leerStorage(STORAGE_KEYS.reservas, reservasIniciales)
  return simularRed(data)
}

export async function crearReserva(datos, usuario) {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.reservas) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/reservas`, {
        method: 'POST',
        body: JSON.stringify(datos),
      })
      return res.data || res
    } catch {
      // fallback local
    }
  }
  const actuales = leerStorage(STORAGE_KEYS.reservas, reservasIniciales)
  const nueva = {
    id: generarId('RES'),
    estado: 'PENDIENTE',
    usuarioId: usuario?.id,
    usuario: usuario?.nombre ?? usuarioActual.nombre,
    ...datos,
  }
  const actualizadas = [nueva, ...actuales]
  guardarStorage(STORAGE_KEYS.reservas, actualizadas)
  return simularRed(nueva)
}

export async function actualizarEstadoReserva(id, nuevoEstado) {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.reservas) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/reservas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      return res.data || res
    } catch {
      // fallback local
    }
  }
  const actuales = leerStorage(STORAGE_KEYS.reservas, reservasIniciales)
  let reservaActualizada = null
  const actualizadas = actuales.map((r) => {
    if (r.id !== id) return r
    reservaActualizada = { ...r, estado: nuevoEstado }
    return reservaActualizada
  })
  guardarStorage(STORAGE_KEYS.reservas, actualizadas)

  if (reservaActualizada?.usuarioId) {
    agregarNotificacion(reservaActualizada.usuarioId, {
      tipo: 'Reserva',
      mensaje: `Tu reserva ${id} (${reservaActualizada.recurso}) cambió de estado a "${nuevoEstado}".`,
    })
  }

  return simularRed(reservaActualizada)
}

/* -------------------------------------------------------------------- */
/* RECURSOS                                                              */
/* -------------------------------------------------------------------- */

export async function getRecursos() {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.recursos) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/recursos`)
      return res.data || res
    } catch {
      // fallback
    }
  }
  return simularRed(recursos)
}

/* -------------------------------------------------------------------- */
/* EVENTOS                                                               */
/* -------------------------------------------------------------------- */

export async function getEventos() {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.eventos) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/eventos`)
      return res.data || res
    } catch {
      // fallback
    }
  }
  const data = leerStorage(STORAGE_KEYS.eventos, eventosIniciales)
  return simularRed(data)
}

export async function crearEvento(datos, autorId) {
  if (!USE_MOCK && !SERVICIOS_EN_ANDAMIO.eventos) {
    try {
      const res = await fetchJson(`${API_BASE_URL}/eventos`, { method: 'POST', body: JSON.stringify(datos) })
      return res.data || res
    } catch {
      // fallback
    }
  }
  const actuales = leerStorage(STORAGE_KEYS.eventos, eventosIniciales)
  const nuevo = { id: generarId('EVT'), ...datos }
  guardarStorage(STORAGE_KEYS.eventos, [nuevo, ...actuales])

  difundirNotificacion(
    { tipo: 'Evento', mensaje: `Nuevo evento publicado: ${nuevo.nombre} (${nuevo.fecha}).` },
    { excluirId: autorId }
  )

  return simularRed(nuevo)
}

/* -------------------------------------------------------------------- */
/* DASHBOARD                                                             */
/* -------------------------------------------------------------------- */

export async function getResumenDashboard(usuario) {
  const [solicitudes, reservas, notificaciones, listaEventos] = await Promise.all([
    getSolicitudes(),
    getReservas(),
    getNotificaciones(usuario?.id),
    getEventos(),
  ])

  const esAdmin = usuario?.tipoUsuario === 'ADMINISTRADOR'
  const misSolicitudes = esAdmin ? solicitudes : (solicitudes || []).filter((s) => s.usuarioId === usuario?.id)
  const misReservas = esAdmin ? reservas : (reservas || []).filter((r) => r.usuarioId === usuario?.id)

  return {
    solicitudesPendientes: misSolicitudes.filter((s) => !['RESUELTA', 'CERRADA'].includes(s.estado)).length,
    reservasRealizadas: misReservas.length,
    notificacionesNoLeidas: (notificaciones || []).filter((n) => !n.leida).length,
    proximosEventos: (listaEventos || []).length,
    serviciosDisponibles: servicios.length,
  }
}
