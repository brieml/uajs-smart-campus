/**
 * Barra de búsqueda global reutilizada en el encabezado y en la
 * página principal para filtrar servicios por nombre o categoría.
 */
export default function SearchBar({ value, onChange, placeholder = 'Buscar…' }) {
  return (
    <label className="search-bar">
      <span className="search-bar__icon" aria-hidden="true">🔍</span>
      <input
        type="search"
        className="search-bar__input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
    </label>
  )
}
