import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ProApp } from './pro/ProApp'
import './estilos/global.css'

// O manifest do PWA leva o token do paciente: o app instalado na tela
// de início reabre autenticado (essencial no iPhone).
const token = localStorage.getItem('diario_token')
if (token) {
  const link = document.getElementById('manifesto') as HTMLLinkElement | null
  if (link) link.href = `/manifest.webmanifest?t=${encodeURIComponent(token)}`
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}

const ehAreaPro = location.pathname === '/pro' || location.pathname.startsWith('/pro/')
createRoot(document.getElementById('raiz')!).render(ehAreaPro ? <ProApp /> : <App />)
