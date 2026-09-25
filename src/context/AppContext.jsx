import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  cerrarSesion as cerrarSesionApi,
  getNotificaciones,
  getUsuarioActual,
  iniciarSesion as iniciarSesionApi,
  marcarNotificacionLeida,
} from '../services/api'

/**
 * Contexto global de la aplicación.
 *
 * Comparte el usuario autenticado, su sesión y su bandeja de
 * notificaciones entre el encabezado, la barra lateral y las páginas,
 * evitando tener que pasar props manualmente por cada nivel del árbol.
 */
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [notificaciones, setNotificaciones] = useState([])
  const [cargandoUsuario, setCargandoUsuario] = useState(true)

  // Al montar la aplicación, se intenta recuperar una sesión ya
  // iniciada (persistida en localStorage) antes de mostrar el login.
  useEffect(() => {
    getUsuarioActual().then((data) => {
      setUsuario(data)
      setCargandoUsuario(false)
    })
  }, [])

  // Cada vez que cambia el usuario autenticado, se recarga SU bandeja
  // de notificaciones (nunca una lista global compartida).
  useEffect(() => {
    if (!usuario) {
      setNotificaciones([])
      return
    }
    getNotificaciones(usuario.id).then(setNotificaciones)
  }, [usuario])

  const iniciarSesion = useCallback(async (identificador, password) => {
    const usuarioAutenticado = await iniciarSesionApi(identificador, password)
    setUsuario(usuarioAutenticado)
    return usuarioAutenticado
  }, [])

  const cerrarSesion = useCallback(async () => {
    await cerrarSesionApi()
    setUsuario(null)
  }, [])

  const recargarNotificaciones = useCallback(() => {
    if (!usuario) return
    getNotificaciones(usuario.id).then(setNotificaciones)
  }, [usuario])

  const marcarComoLeida = useCallback(
    async (id) => {
      if (!usuario) return
      const actualizadas = await marcarNotificacionLeida(usuario.id, id)
      setNotificaciones(actualizadas)
    },
    [usuario]
  )

  const noLeidas = useMemo(
    () => notificaciones.filter((n) => !n.leida).length,
    [notificaciones]
  )

  const roles = useMemo(
    () => usuario?.roles || (usuario?.tipoUsuario ? [usuario.tipoUsuario] : []),
    [usuario]
  )
  const rolesNorm = useMemo(() => roles.map((r) => String(r).toUpperCase()), [roles])
  const esAdmin =
    usuario?.tipoUsuario === 'ADMINISTRADOR' || rolesNorm.includes('ADMIN') || rolesNorm.includes('ADMINISTRADOR')
  const esAdministrativo =
    usuario?.tipoUsuario === 'ADMINISTRATIVO' ||
    usuario?.tipoUsuario === 'ADMINISTRADOR' ||
    rolesNorm.includes('STAFF') ||
    rolesNorm.includes('ADMIN')

  const value = {
    usuario,
    cargandoUsuario,
    estaAutenticado: !!usuario,
    esAdmin,
    esAdministrativo,
    iniciarSesion,
    cerrarSesion,
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
