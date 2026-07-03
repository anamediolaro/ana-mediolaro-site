import { TopoApp } from '../componentes/TopoApp'

// Camada 1 do apoio: técnicas fixas, sem IA, funcionam offline.
// Respiração guiada (áudio da Ana) e o assistente de RPD entram na
// Etapa 4; o caminho para o protocolo de segurança existe desde já.
export function Apoio({
  aoAbrir,
  aoVoltar,
}: {
  aoAbrir: (tecnica: 'grounding' | 'stop' | 'protocolo') => void
  aoVoltar: () => void
}) {
  return (
    <div className="tela sem-nav">
      <TopoApp direita="apoio" />
      <div className="t-h1">
        Estou aqui. Vamos <em>um passo</em> de cada vez.
      </div>
      <p className="t-sub">Escolha o que faz sentido agora. Não precisa estar em crise para usar.</p>
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
