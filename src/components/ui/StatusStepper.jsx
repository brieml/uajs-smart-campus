import { ESTADOS_SOLICITUD } from '../../services/mockData'
import { etiquetaEstado } from '../../utils/formatters'

/**
 * StatusStepper — elemento visual insignia de UAJS Smart Campus.
 *
 * Traduce el ciclo de vida real de una solicitud
 * (REGISTRADA → EN_REVISION → ASIGNADA → EN_PROCESO → RESUELTA → CERRADA)
 * en una línea de tiempo horizontal. Se usa en tamaño completo en el
 * detalle de una solicitud y en una versión compacta dentro de las
 * tarjetas del listado.
 */
export default function StatusStepper({ estadoActual, compact = false }) {
  const indiceActual = ESTADOS_SOLICITUD.indexOf(estadoActual)

  return (
    <ol className={`status-stepper ${compact ? 'status-stepper--compact' : ''}`}>
      {ESTADOS_SOLICITUD.map((estado, indice) => {
        const completado = indice < indiceActual
        const activo = indice === indiceActual
        const estadoNodo = completado ? 'completado' : activo ? 'activo' : 'pendiente'

        return (
          <li className={`status-stepper__step status-stepper__step--${estadoNodo}`} key={estado}>
            <span className="status-stepper__node" aria-hidden="true">
              {completado ? '✓' : indice + 1}
            </span>
            {!compact && <span className="status-stepper__label">{etiquetaEstado(estado)}</span>}
          </li>
        )
      })}
    </ol>
  )
}
