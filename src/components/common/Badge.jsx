import { etiquetaEstado, tonoEstado } from '../../utils/formatters'

/**
 * Insignia de estado (por ejemplo, el estado de una solicitud o
 * reserva). El color se deriva automáticamente del estado mediante
 * `tonoEstado`, pero también puede forzarse con la prop `tono`.
 */
export default function Badge({ estado, tono, children }) {
  const tonoFinal = tono ?? tonoEstado(estado)
  return (
    <span className={`badge badge--${tonoFinal}`}>
      {children ?? etiquetaEstado(estado)}
    </span>
  )
}
