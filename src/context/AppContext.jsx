import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getNotificaciones, getUsuarioActual, marcarNotificacionLeida } from '../services/api'

/**
 * Contexto global de la aplicación.
 *
 * Comparte el usuario autenticado y el contador de notificaciones no
 * leídas entre el encabezado, la barra lateral y las páginas, evitando
 * tener que pasar props manualmente por cada nivel del árbol.
 */
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [notificaciones, setNotificaciones] = useState([])
  const [cargandoUsuario, setCargandoUsuario] = useState(true)

  useEffect(() => {
    getUsuarioActual().then((data) => {
      setUsuario(data)
      setCargandoUsuario(false)
    })
    getNotificaciones().then(setNotificaciones)
  }, [])

  const recargarNotificaciones = useCallback(() => {
    getNotificaciones().then(setNotificaciones)
  }, [])

  const marcarComoLeida = useCallback(async (id) => {
    const actualizadas = await marcarNotificacionLeida(id)
    setNotificaciones(actualizadas)
  }, [])

  const noLeidas = useMemo(
    () => notificaciones.filter((n) => !n.leida).length,
    [notificaciones]
  )

  const value = {
    usuario,
    cargandoUsuario,
    notificaciones,
    noLeidas,
    recargarNotificaciones,
    marcarComoLeida,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/** Custom hook para consumir el AppContext desde cualquier componente. */
export function useApp() {
  const contexto = useContext(AppContext)
  if (!contexto) {
    throw new Error('useApp debe usarse dentro de un <AppProvider>')
  }
  return contexto
}
