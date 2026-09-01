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
 */
import {
  servicios,
  solicitudesIniciales,
  reservasIniciales,
  recursos,
  eventos,
  notificacionesIniciales,
  usuarioActual,
} from './mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const LATENCY_MS = 350

const STORAGE_KEYS = {
  solicitudes: 'uajs.solicitudes',
  reservas: 'uajs.reservas',
  notificaciones: 'uajs.notificaciones',
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

export async function crearSolicitud(datos) {
  if (!USE_MOCK) {
    return fetchJson(`${API_BASE_URL}/solicitudes`, {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  }
  const actuales = leerStorage(STORAGE_KEYS.solicitudes, solicitudesIniciales)
  const nueva = {
    id: generarId('SOL'),
    fecha: new Date().toISOString().slice(0, 10),
    estado: 'REGISTRADA',
    responsable: 'Por asignar',
    ...datos,
  }
  const actualizadas = [nueva, ...actuales]
  guardarStorage(STORAGE_KEYS.solicitudes, actualizadas)
  return simularRed(nueva)
}

/* -------------------------------------------------------------------- */
/* RESERVAS                                                              */
/* -------------------------------------------------------------------- */

export async function getReservas() {
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/reservas`)
  const data = leerStorage(STORAGE_KEYS.reservas, reservasIniciales)
  return simularRed(data)
}

export async function crearReserva(datos) {
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
    usuario: usuarioActual.nombre,
    ...datos,
  }
  const actualizadas = [nueva, ...actuales]
  guardarStorage(STORAGE_KEYS.reservas, actualizadas)
  return simularRed(nueva)
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
  return simularRed(eventos)
}

/* -------------------------------------------------------------------- */
/* NOTIFICACIONES                                                        */
/* -------------------------------------------------------------------- */

export async function getNotificaciones() {
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/notificaciones`)
  const data = leerStorage(STORAGE_KEYS.notificaciones, notificacionesIniciales)
  return simularRed(data)
}

export async function marcarNotificacionLeida(id) {
  const actuales = leerStorage(STORAGE_KEYS.notificaciones, notificacionesIniciales)
  const actualizadas = actuales.map((n) => (n.id === id ? { ...n, leida: true } : n))
  guardarStorage(STORAGE_KEYS.notificaciones, actualizadas)
  return simularRed(actualizadas)
}

/* -------------------------------------------------------------------- */
/* USUARIO / PERFIL                                                      */
/* -------------------------------------------------------------------- */

export async function getUsuarioActual() {
  if (!USE_MOCK) return fetchJson(`${API_BASE_URL}/usuarios/me`)
  return simularRed(usuarioActual)
}

/* -------------------------------------------------------------------- */
/* DASHBOARD                                                             */
/* -------------------------------------------------------------------- */

export async function getResumenDashboard() {
  const [solicitudes, reservas, notificaciones, listaEventos] = await Promise.all([
    getSolicitudes(),
    getReservas(),
    getNotificaciones(),
    getEventos(),
  ])

  return {
    solicitudesPendientes: solicitudes.filter((s) => !['RESUELTA', 'CERRADA'].includes(s.estado)).length,
    reservasRealizadas: reservas.length,
    notificacionesNoLeidas: notificaciones.filter((n) => !n.leida).length,
    proximosEventos: listaEventos.length,
    serviciosDisponibles: servicios.length,
  }
}

/* -------------------------------------------------------------------- */
/* Helper interno para cuando exista backend real                        */
/* -------------------------------------------------------------------- */

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
