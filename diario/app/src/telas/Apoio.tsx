import { useEffect, useState } from 'react'
import { apiApoio } from '../api'
import { TopoApp } from '../componentes/TopoApp'
import { PlayerAudio } from '../componentes/PlayerAudio'

type AudioInfo = { id: string; titulo: string; duracao_seg: number | null; camada1: number }

// Menu de apoio: Camada 1 sem IA (funciona offline) e a entrada do
// assistente de RPD. O caminho para o protocolo existe sempre.
export function Apoio({
  aoAbrir,
  aoVoltar,
}: {
  aoAbrir: (tecnica: 'grounding' | 'stop' | 'protocolo' | 'rpd') => void
  aoVoltar: () => void
}) {
  const [respiracao, setRespiracao] = useState<AudioInfo | null>(null)
  const [audioDisponivel, setAudioDisponivel] = useState(false)
  const [tocando, setTocando] = useState(false)

  useEffect(() => {
    apiApoio
      .audios()
      .then((r: { audios: AudioInfo[]; disponivel: boolean }) => {
        setAudioDisponivel(r.disponivel)
        setRespiracao(r.audios.find((a) => a.camada1) ?? null)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="tela sem-nav">
      <TopoApp direita="apoio" />
      <div className="t-h1">
        Estou aqui. Vamos <em>um passo</em> de cada vez.
      </div>
      <p className="t-sub">Escolha o que faz sentido agora. Não precisa estar em crise para usar.</p>
      {respiracao && audioDisponivel && (
        <>
          <button className="apoio-item" onClick={() => setTocando(!tocando)}>
            <span className="ico">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="3.5" />
              </svg>
            </span>
            <span>
              <b>Respiração guiada</b>
              <small>
                áudio da Ana
                {respiracao.duracao_seg ? ` · ${Math.round(respiracao.duracao_seg / 60)} min` : ''}
              </small>
            </span>
          </button>
          {tocando && <PlayerAudio audioId={respiracao.id} />}
        </>
      )}
      <button className="apoio-item" onClick={() => aoAbrir('grounding')}>
        <span className="ico">
          <svg viewBox="0 0 24 24">
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
          </svg>
        </span>
        <span>
          <b>Grounding 5-4-3-2-1</b>
          <small>voltar para o presente · 3 min</small>
        </span>
      </button>
      <button className="apoio-item" onClick={() => aoAbrir('stop')}>
        <span className="ico">
          <svg viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </span>
        <span>
          <b>Técnica STOP</b>
          <small>pare, respire, observe, prossiga</small>
        </span>
      </button>
      <button className="apoio-item" onClick={() => aoAbrir('rpd')}>
        <span className="ico">
          <svg viewBox="0 0 24 24">
            <path d="M4 6h16M4 10h16M4 14h10" />
            <path d="M15 17l2 2 4-4" />
          </svg>
        </span>
        <span>
          <b>Examinar um pensamento</b>
          <small>assistente guiado, passo a passo</small>
        </span>
      </button>
      <button
        className="t-aviso"
        style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
        onClick={() => aoAbrir('protocolo')}
      >
        Se você estiver pensando em se machucar, toque aqui. Tem gente de verdade pronta para te
        ouvir agora.
      </button>
      <div style={{ marginTop: 'auto', paddingTop: 18 }}>
        <button className="t-btn fantasma" onClick={aoVoltar}>
          Voltar para o início
        </button>
      </div>
    </div>
  )
}
