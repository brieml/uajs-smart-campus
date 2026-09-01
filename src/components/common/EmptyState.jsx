/**
 * Estado vacío reutilizable: comunica qué pasó y qué acción tomar,
 * en lugar de dejar una sección en blanco.
 */
export default function EmptyState({ icon = '🗂️', title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">{icon}</span>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
