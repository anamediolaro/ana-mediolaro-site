import type { JSX } from 'react'

export type Aba = 'inicio' | 'historico' | 'padroes' | 'estrelas'

const ICONES: Record<Aba, JSX.Element> = {
  inicio: (
    <svg viewBox="0 0 24 24">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  ),
  historico: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  padroes: (
    <svg viewBox="0 0 24 24">
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-8" />
    </svg>
  ),
  estrelas: (
    <svg viewBox="0 0 24 24">
      <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 5.5-5-2.8-5 2.8 1-5.5-4-4 5.5-1z" />
    </svg>
  ),
}

const ROTULOS: Record<Aba, string> = {
  inicio: 'Início',
  historico: 'Histórico',
  padroes: 'Padrões',
  estrelas: 'Estrelas',
}

export function NavApp({ ativa, aoNavegar }: { ativa: Aba; aoNavegar: (aba: Aba) => void }) {
  return (
    <nav className="nav-app">
      {(Object.keys(ROTULOS) as Aba[]).map((aba) => (
        <button key={aba} className={aba === ativa ? 'on' : ''} onClick={() => aoNavegar(aba)}>
          {ICONES[aba]}
          {ROTULOS[aba]}
        </button>
      ))}
    </nav>
  )
}
