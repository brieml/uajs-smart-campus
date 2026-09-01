/**
 * Punto de entrada de gestión de estado de la aplicación.
 *
 * Para este prototipo, UAJS Smart Campus gestiona el estado global
 * (usuario autenticado y notificaciones) mediante la Context API de
 * React — ver `src/context/AppContext.jsx` — en lugar de una librería
 * externa como Redux o Zustand, dado el tamaño del proyecto.
 *
 * Este módulo se conserva como punto único de acceso al estado
 * global, de modo que si el proyecto evoluciona y crece en
 * complejidad, sea sencillo migrar a una librería dedicada sin tener
 * que cambiar los imports en cada componente.
 */
export { AppProvider, useApp } from '../context/AppContext'
