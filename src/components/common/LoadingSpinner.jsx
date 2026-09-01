/**
 * Indicador de carga reutilizado mientras `useFetch` resuelve las
 * llamadas al servicio de datos.
 */
export default function LoadingSpinner({ label = 'Cargando información…' }) {
  return (
    <div className="loading-spinner" role="status">
      <span className="loading-spinner__circle" aria-hidden="true" />
      <p className="loading-spinner__label">{label}</p>
    </div>
  )
}
