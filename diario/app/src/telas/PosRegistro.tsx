import { TopoApp } from '../componentes/TopoApp'
import { Rosto } from '../componentes/Rosto'
import type { ResultadoCheckIn } from './CheckIn'

// Fechar o ciclo: depois de um registro com humor 1 ou 2, o app oferece
// (nunca impõe) um áudio da Ana mapeado pela emoção marcada.
export function PosRegistro({
  resultado,
  aoConcluir,
}: {
  resultado: ResultadoCheckIn | null
  aoConcluir: () => void
}) {
  const audio = resultado?.audioSugerido ?? null

  return (
    <div className="tela sem-nav">
      <TopoApp direita="registro salvo" />
      <div style={{ marginTop: 34, textAlign: 'center' }}>
        <span
          className="rosto"
          style={{ width: 64, height: 64, margin: '0 auto', display: 'inline-flex' }}
        >
          <Rosto nivel={4} />
        </span>
      </div>
      <div className="t-h1" style={{ textAlign: 'center', marginTop: 18 }}>
        Registrado. Obrigada por <em>se olhar</em>.
      </div>
      {resultado?.offline && (
        <p className="t-sub" style={{ textAlign: 'center' }}>
          Sem internet agora. O registro está guardado no seu aparelho e sobe sozinho quando a
          conexão voltar.
        </p>
      )}
      {audio ? (
        <>
          <p className="t-sub" style={{ textAlign: 'center' }}>
            Quer alguns minutos com a Ana antes de voltar para o dia?
          </p>
          <div className="t-card" style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <span
              className="ico"
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--creme)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sage)',
                flexShrink: 0,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 1.6 }}
              >
                <polygon points="9 6 18 12 9 18" />
              </svg>
            </span>
            <span>
              <b style={{ fontFamily: 'Lora, serif', fontSize: 15, display: 'block' }}>
                {audio.titulo}
              </b>
              <small style={{ fontSize: 11.5, color: 'var(--sage)', fontWeight: 300 }}>
                Ana Mediolaro
                {audio.duracaoSeg ? ` · ${Math.round(audio.duracaoSeg / 60)} min` : ''}
              </small>
            </span>
          </div>
          <button className="t-btn ouro" onClick={aoConcluir}>
            Ouvir agora
          </button>
          <button className="t-btn fantasma" onClick={aoConcluir}>
            Agora não
          </button>
          <p className="t-sub" style={{ textAlign: 'center', fontSize: 11, marginTop: 16 }}>
            Sugestão opcional. Nenhum ponto se perde ao pular.
          </p>
        </>
      ) : (
        <>
          <p className="t-sub" style={{ textAlign: 'center' }}>
            O que você sente é informação, não falha. Está registrado.
          </p>
          <button className="t-btn" onClick={aoConcluir}>
            Voltar para o início
          </button>
        </>
      )}
    </div>
  )
}
