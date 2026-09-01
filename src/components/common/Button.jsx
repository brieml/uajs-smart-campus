/**
 * Botón reutilizable con variantes visuales. Metodología BEM:
 * bloque `btn`, modificadores `btn--primary`, `btn--ghost`, etc.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  ...rest
}) {
  const clases = ['btn', `btn--${variant}`, `btn--${size}`].join(' ')

  return (
    <button type={type} className={clases} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}
