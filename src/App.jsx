import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppRoutes from './routes/AppRoutes'

// Estilos de componentes y páginas
import './components/common/index.css'
import './components/ui/index.css'
import './pages/index.css'

/**
 * Componente raíz de UAJS Smart Campus. Envuelve la aplicación con el
 * proveedor de contexto global y el enrutador de React Router.
 */
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
