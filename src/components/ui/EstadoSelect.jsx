import { etiquetaEstado } from '../../utils/formatters'

/**
 * Selector de estado usado por el administrador del sistema para
 * actualizar el estado de una solicitud o reserva. Al cambiar de
 * valor dispara `onChange` con el nuevo estado; el propio backend
 * simulado (services/api.js) se encarga de notificar al usuario dueño
 * del recurso.
 */
export default function EstadoSelect({ estado, opciones, onChange, disabled }) {
  return (
    <select
      className="estado-select"
      value={estado}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Actualizar estado"
      onClick={(e) => e.stopPropagation()}
    >
      {opciones.map((opcion) => (
        <option key={opcion} value={opcion}>
          {etiquetaEstado(opcion)}
        </option>
      ))}
    </select>
  )
}
