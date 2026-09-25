/**
 * Capa de servicios / llamadas a la API.
 *
 * Este archivo concentra TODA la comunicación con el backend, tal como
 * lo plantea la arquitectura del proyecto integrador:
 *
 *    Frontend React -> API REST -> Backend/MVC -> Base de datos
 *
 * Mientras el backend de microservicios (Usuarios, Solicitudes, Reservas,
 * Recursos, Eventos, Notificaciones) se despliega, este servicio simula
 * las respuestas de esa API usando datos ficticios y persistencia en
 * localStorage. Cuando el backend esté disponible, basta con reemplazar
 * las funciones internas por llamadas `fetch`/`axios` a VITE_API_BASE_URL
 * sin cambiar la forma en que los componentes consumen este módulo.
 *
 * Reglas de autorización simuladas para el rol ADMINISTRADOR:
 *  - Puede actualizar el estado de cualquier solicitud o reserva.
 *  - Puede crear eventos institucionales.
 *  - Puede crear, editar y activar/desactivar usuarios.
 *  - Cada una de esas acciones genera notificaciones en la bandeja del
 *    usuario dueño del recurso (o de todos los usuarios, en el caso de
 *    los eventos).
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

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const LATENCY_MS = 350

const STORAGE_KEYS = {
  solicitudes: 'uajs.solicitudes',
  reservas: 'uajs.reservas',
  eventos: 'uajs.eventos',
  usuarios: 'uajs.usuarios',
  sesion: 'uajs.sesion',
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
    /* almacenamiento no disponible: se ignora en este prototipo */
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
  const respuesta = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!respuesta.ok) {
    throw new Error(`Error de API (${respuesta.status}) al consultar ${url}`)
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

export async function iniciarSesion(cedula, password) {
  if (!USE_MOCK) {
    return fetchJson(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ cedula, password }),
    })
  }
  const encontrado = leerUsuarios().find(
    (u) => u.cedula === cedula.trim() && u.password === password
  )
  if (!encontrado) {
    await simularRed(null)
    throw new Error('Cédula o contraseña incorrectas.')
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
  try {
    window.localStorage.removeItem(STORAGE_KEYS.sesion)
  } catch {
    /* almacenamiento no disponible */
  }
  return simularRed(true)
}

export async function getUsuarioActual() {
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/usuarios/me`)
  const sesion = leerStorage(STORAGE_KEYS.sesion, null)
  return simularRed(sesion)
}

/** Lista completa de usuarios (uso exclusivo del panel de administración). */
export async function getUsuarios() {
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/usuarios`)
  return simularRed(leerUsuarios().map(usuarioPublico))
}

export async function crearUsuario(datos) {
  if (!USE_MOCK) {
    return fetchJson(`${API_BASE_URL}/usuarios`, { method: 'POST', body: JSON.stringify(datos) })
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
    return fetchJson(`${API_BASE_URL}/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) })
  }
  const actuales = leerUsuarios()
  const actualizados = actuales.map((u) => (u.id === id ? { ...u, ...cambios } : u))
  guardarUsuarios(actualizados)

  // Si el usuario editado es quien tiene la sesión activa, refrescamos la sesión.
  const sesion = leerStorage(STORAGE_KEYS.sesion, null)
  if (sesion && sesion.id === id) {
    const actualizado = actualizados.find((u) => u.id === id)
    guardarStorage(STORAGE_KEYS.sesion, usuarioPublico(actualizado))
  }

  return simularRed(usuarioPublico(actualizados.find((u) => u.id === id)))
}

/** Activa o desactiva una cuenta (baja lógica, no se elimina el registro). */
export async function cambiarEstadoUsuario(id, activo) {
  return actualizarUsuario(id, { activo })
}

/* -------------------------------------------------------------------- */
/* SERVICIOS UNIVERSITARIOS                                              */
/* -------------------------------------------------------------------- */

export async function getServicios() {
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/servicios`)
  return simularRed(servicios)
}

export async function getServicioPorId(id) {
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/servicios/${id}`)
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

/** Agrega una notificación nueva a la bandeja de un usuario específico. */
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

/** Envía la misma notificación a todos los usuarios (opcionalmente excluyendo a alguien, p. ej. el propio administrador que la origina). */
function difundirNotificacion({ tipo, mensaje }, { excluirId } = {}) {
  leerUsuarios()
    .filter((u) => u.id !== excluirId)
    .forEach((u) => agregarNotificacion(u.id, { tipo, mensaje }))
}

export async function getNotificaciones(usuarioId) {
  if (!usuarioId) return simularRed([])
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/usuarios/${usuarioId}/notificaciones`)
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
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/solicitudes`)
  const data = leerStorage(STORAGE_KEYS.solicitudes, solicitudesIniciales)
  return simularRed(data)
}

export async function getSolicitudPorId(id) {
  const lista = await getSolicitudes()
  return lista.find((s) => s.id === id) ?? null
}

export async function crearSolicitud(datos, usuarioId) {
  if (!USE_MOCK) {
    return fetchJson(`${API_BASE_URL}/solicitudes`, {
      method: 'POST',
      body: JSON.stringify(datos),
    })
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

/**
 * Actualiza el estado de una solicitud (acción exclusiva del
 * administrador del sistema) y notifica al estudiante o docente dueño
 * del trámite.
 */
export async function actualizarEstadoSolicitud(id, nuevoEstado) {
  if (!USE_MOCK) {
    return fetchJson(`${API_BASE_URL}/solicitudes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: nuevoEstado }),
    })
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
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/reservas`)
  const data = leerStorage(STORAGE_KEYS.reservas, reservasIniciales)
  return simularRed(data)
}

export async function crearReserva(datos, usuario) {
  if (!USE_MOCK) {
    return fetchJson(`${API_BASE_URL}/reservas`, {
      method: 'POST',
      body: JSON.stringify(datos),
    })
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

/**
 * Actualiza el estado de una reserva (acción exclusiva del
 * administrador del sistema) y notifica al usuario que la registró.
 */
export async function actualizarEstadoReserva(id, nuevoEstado) {
  if (!USE_MOCK) {
    return fetchJson(`${API_BASE_URL}/reservas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: nuevoEstado }),
    })
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
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/recursos`)
  return simularRed(recursos)
}

/* -------------------------------------------------------------------- */
/* EVENTOS                                                               */
/* -------------------------------------------------------------------- */

export async function getEventos() {
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/eventos`)
  const data = leerStorage(STORAGE_KEYS.eventos, eventosIniciales)
  return simularRed(data)
}

/**
 * Crea un evento institucional (acción exclusiva del administrador del
 * sistema) y difunde una notificación a toda la comunidad (excepto al
 * propio administrador que lo publicó).
 */
export async function crearEvento(datos, autorId) {
  if (!USE_MOCK) {
    return fetchJson(`${API_BASE_URL}/eventos`, { method: 'POST', body: JSON.stringify(datos) })
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
  const misSolicitudes = esAdmin ? solicitudes : solicitudes.filter((s) => s.usuarioId === usuario?.id)
  const misReservas = esAdmin ? reservas : reservas.filter((r) => r.usuarioId === usuario?.id)

  return {
    solicitudesPendientes: misSolicitudes.filter((s) => !['RESUELTA', 'CERRADA'].includes(s.estado)).length,
    reservasRealizadas: misReservas.length,
    notificacionesNoLeidas: notificaciones.filter((n) => !n.leida).length,
    proximosEventos: listaEventos.length,
    serviciosDisponibles: servicios.length,
  }
}
