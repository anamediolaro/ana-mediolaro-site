import { useEffect, useRef, useState } from 'react'
import { apiApoio } from '../api'
import { TopoApp } from '../componentes/TopoApp'

type Balao = { papel: 'assistente' | 'paciente'; texto: string; etiqueta?: string }

// Assistente de RPD: um trilho só, as 7 etapas do registro de pensamento.
// Risco interrompe e vira protocolo; API fora do ar volta para as
// técnicas sem IA.
export function Rpd({
  consentiuIa,
  aoConsentir,
  aoSair,
  aoRisco,
  aoIndisponivel,
  aoConcluir,
}: {
  consentiuIa: boolean
  aoConsentir: () => Promise<void>
  aoSair: () => void
  aoRisco: () => void
  aoIndisponivel: () => void
  aoConcluir: (estrelas: number) => void
}) {
  const [aceitou, setAceitou] = useState(consentiuIa)
  const [rpdId, setRpdId] = useState('')
  const [etiqueta, setEtiqueta] = useState('')
  const [baloes, setBaloes] = useState<Balao[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [terminado, setTerminado] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aceitou || rpdId) return
    apiApoio
      .iniciarRpd()
      .then((r) => {
        setRpdId(r.id)
        setEtiqueta(r.etiqueta)
        setBaloes([{ papel: 'assistente', texto: r.pergunta, etiqueta: r.etiqueta }])
      })
      .catch(() => aoIndisponivel())
  }, [aceitou, rpdId, aoIndisponivel])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [baloes])

  if (!aceitou) {
    return (
      <div className="tela sem-nav">
        <TopoApp direita="assistente" />
        <div className="t-h1">
          Antes de <em>começar</em>
        </div>
        <p className="t-sub">Este exercício é guiado por inteligência artificial. Para usar, você precisa saber:</p>
        <div className="t-aviso">
          O assistente conduz um único exercício, o registro de pensamento, em 7 passos. Ele não é
          uma pessoa, não é a Ana e não substitui a sua psicóloga. Ele não dá conselhos nem
          diagnósticos. O que você escrever aqui fica salvo no seu diário e a Ana lê antes da
          sessão. Se aparecer qualquer sinal de que você não está seguro(a), o exercício para e o
          app mostra os canais de apoio imediato.
        </div>
        <button
          className="t-btn"
          onClick={async () => {
            await aoConsentir()
            setAceitou(true)
          }}
        >
          Entendi, quero começar
        </button>
        <button className="t-btn fantasma" onClick={aoSair}>
          Agora não
        </button>
      </div>
    )
  }

  const enviar = async () => {
    const conteudo = texto.trim()
    if (!conteudo || enviando || !rpdId) return
    setEnviando(true)
    setTexto('')
    const historico = baloes.map((b) => ({ papel: b.papel, texto: b.texto }))
    setBaloes((atuais) => [...atuais, { papel: 'paciente', texto: conteudo }])
    try {
      const r = await apiApoio.mensagemRpd(rpdId, conteudo, historico)
      if (r.risco) {
        aoRisco()
        return
      }
      if (r.indisponivel) {
        aoIndisponivel()
        return
      }
      if (r.etiqueta && r.etiqueta !== etiqueta) setEtiqueta(r.etiqueta)
      setBaloes((atuais) => [
        ...atuais,
        {
          papel: 'assistente',
          texto: r.resposta,
          etiqueta: r.etiqueta && r.etiqueta !== etiqueta ? r.etiqueta : undefined,
        },
      ])
      if (r.concluido) {
        setTerminado(true)
        aoConcluir(r.estrelas?.total ?? 0)
      }
    } catch {
      aoIndisponivel()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="tela sem-nav">
      <TopoApp direita={etiqueta ? `etapa: ${etiqueta}` : ''} />
      <div className="t-h1" style={{ fontSize: 21 }}>
        Examinar um <em>pensamento</em>
      </div>
      <div className="chat-rpd">
        {baloes.map((balao, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
            {balao.etiqueta && <span className="etapa-tag">{balao.etiqueta}</span>}
            <div className={`balao ${balao.papel === 'assistente' ? 'bot' : 'user'}`}>
              {balao.texto}
            </div>
          </div>
        ))}
        {enviando && <div className="balao bot">...</div>}
        <div ref={fimRef} />
      </div>
      {terminado ? (
        <button className="t-btn" onClick={aoSair}>
          Concluir
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            className="t-input"
            style={{ marginTop: 0, flex: 1 }}
            placeholder="Escreva aqui..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void enviar()}
            disabled={enviando}
          />
          <button
            className="t-btn"
            style={{ marginTop: 0, width: 'auto', padding: '0 20px' }}
            disabled={enviando || !texto.trim()}
            onClick={() => void enviar()}
          >
            Enviar
          </button>
        </div>
      )}
      <p className="aviso-ia">Assistente do app. Não substitui a sua psicóloga.</p>
      {!terminado && (
        <button className="botao-mini" style={{ marginTop: 8 }} onClick={aoSair}>
          Sair do exercício
        </button>
      )}
    </div>
  )
}
