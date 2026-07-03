import { TopoApp } from '../componentes/TopoApp'

// Protocolo de segurança: caminho direto para pessoas de verdade.
// Tela calma, mesma paleta, sem vermelho.
export function Protocolo({ aoVoltar }: { aoVoltar: () => void }) {
  return (
    <div className="tela sem-nav">
      <TopoApp direita="" />
      <div className="t-h1">
        Agora é hora de falar com <em>uma pessoa</em>.
      </div>
      <p className="t-sub">
        O que você está sentindo merece cuidado de verdade, em tempo real. Esses canais funcionam
        agora:
      </p>
      <div className="prot-card">
        <div className="prot-num">188</div>
        <small>CVV · conversa por telefone e chat, 24 horas, gratuito</small>
      </div>
      <div className="prot-card">
        <div className="prot-num">192</div>
        <small>SAMU · emergência médica</small>
      </div>
      <a className="t-btn" href="tel:188" style={{ textDecoration: 'none' }}>
        Ligar para o CVV agora
      </a>
      <a
        className="t-btn fantasma"
        href="https://cvv.org.br/chat/"
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: 'none' }}
      >
        Conversar por chat com o CVV
      </a>
      <div style={{ marginTop: 'auto', paddingTop: 18 }}>
        <button className="t-btn fantasma" onClick={aoVoltar}>
          Voltar
        </button>
      </div>
    </div>
  )
}
