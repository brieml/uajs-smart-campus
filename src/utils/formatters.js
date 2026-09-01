/**
 * Utilidades de formato compartidas por toda la aplicación.
 */

const ESTADOS_LABEL = {
  REGISTRADA: 'Registrada',
  EN_REVISION: 'En revisión',
  ASIGNADA: 'Asignada',
  EN_PROCESO: 'En proceso',
  RESUELTA: 'Resuelta',
  CERRADA: 'Cerrada',
  CONFIRMADA: 'Confirmada',
  PENDIENTE: 'Pendiente',
}

const ESTADOS_TONO = {
  REGISTRADA: 'info',
  EN_REVISION: 'warning',
  ASIGNADA: 'warning',
  EN_PROCESO: 'info',
  RESUELTA: 'success',
  CERRADA: 'neutral',
  CONFIRMADA: 'success',
  PENDIENTE: 'warning',
}

export function formatearFecha(fechaISO) {
  if (!fechaISO) return '—'
  const fecha = new Date(`${fechaISO}T00:00:00`)
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function etiquetaEstado(estado) {
  return ESTADOS_LABEL[estado] ?? estado
}

export function tonoEstado(estado) {
  return ESTADOS_TONO[estado] ?? 'neutral'
}

export function iniciales(nombreCompleto = '') {
  return nombreCompleto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase())
    .join('')
}
