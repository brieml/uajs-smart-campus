/**
 * Contenedor de tarjeta genérico usado en dashboard, listados y
 * páginas de detalle.
 */
export default function Card({ children, className = '', as: Component = 'div', ...rest }) {
  return (
    <Component className={`card ${className}`.trim()} {...rest}>
      {children}
    </Component>
  )
}
