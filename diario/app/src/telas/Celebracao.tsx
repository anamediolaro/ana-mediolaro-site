import { FRASES_NIVEL, PATH_ESTRELA } from '../dados'

// Celebração sóbria de subida de nível: sem confete, uma frase da Ana.
export function Celebracao({
  nivel,
  aoContinuar,
  aoCompartilhar,
}: {
  nivel: string
  aoContinuar: () => void
  aoCompartilhar: () => void
}) {
  return (
    <div className="tela sem-nav">
      <div className="centro">
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: '50%',
            border: '1.5px solid var(--ouro)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ouro)',
            marginBottom: 24,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{ width: 46, height: 46, stroke: 'currentColor', fill: 'none', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }}
          >
            <path d={PATH_ESTRELA} />
          </svg>
        </div>
        <div className="t-h1" style={{ fontSize: 28 }}>
          Você chegou à <em>{nivel}</em>.
        </div>
        <p className="t-sub" style={{ maxWidth: 300, marginTop: 12 }}>
          {FRASES_NIVEL[nivel] ?? ''}
        </p>
        <button className="t-btn" style={{ width: '100%', marginTop: 28 }} onClick={aoContinuar}>
          Continuar
        </button>
        <button className="t-btn fantasma" style={{ width: '100%' }} onClick={aoCompartilhar}>
          Compartilhar conquista
        </button>
      </div>
    </div>
  )
}
