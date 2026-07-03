import { useEffect, useState } from 'react'
import { apiApoio } from '../api'
import { TopoApp } from '../componentes/TopoApp'

// Protocolo de segurança: caminho direto para pessoas de verdade.
// Tela calma, mesma paleta, sem vermelho.
export function Protocolo({ aoVoltar }: { aoVoltar: () => void }) {
  const [contato, setContato] = useState<string | null>(null)
  const [escrevendo, setEscrevendo] = useState(false)
  const [texto, setTexto] = useState('')
  const [enviada, setEnviada] = useState(false)

  useEffect(() => {
    apiApoio
      .protocoloInfo()
      .then((r: { contatoEmergencia: string | null }) => setContato(r.contatoEmergencia))
      .catch(() => {})
  }, [])

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
      {contato && (
        <div className="prot-card">
          <div style={{ fontFamily: 'Lora, serif', fontSize: 17, fontWeight: 600 }}>{contato}</div>
          <small>contato de emergência indicado pela sua psicóloga</small>
        </div>
      )}
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
      {enviada ? (
        <p className="t-sub" style={{ textAlign: 'center', marginTop: 14 }}>
          Mensagem registrada para a Dra. Ana.
        </p>
      ) : escrevendo ? (
        <>
          <textarea
            className="t-input"
            placeholder="Escreva aqui..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button
            className="t-btn fantasma"
            disabled={!texto.trim()}
            onClick={async () => {
              await apiApoio.mensagemProtocolo(texto.trim())
              setEnviada(true)
            }}
          >
            Enviar mensagem
          </button>
        </>
      ) : (
        <button className="t-btn fantasma" onClick={() => setEscrevendo(true)}>
          Mensagem para a Dra. Ana
        </button>
      )}
      <p className="t-sub" style={{ fontSize: 11, textAlign: 'center', marginTop: 12 }}>
        A mensagem fica registrada. O app não é canal de emergência e a resposta pode não ser
        imediata.
      </p>
      <div style={{ marginTop: 'auto', paddingTop: 14 }}>
        <button className="t-btn fantasma" onClick={aoVoltar}>
          Voltar
        </button>
      </div>
    </div>
  )
}
