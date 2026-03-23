import React from 'react'
import ReactDOM from 'react-dom/client'
import PortalCliente from './PortalCliente.jsx'
import PainelAdvogado from './PainelAdvogado.jsx'

// Detecta qual app mostrar pelo URL:
// /painel  → Painel do Advogado
// qualquer outra URL → Portal do Cliente
const isAdmin = window.location.pathname.startsWith('/painel')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? <PainelAdvogado /> : <PortalCliente />}
  </React.StrictMode>
)
