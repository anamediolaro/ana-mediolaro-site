import { useEffect, useState } from 'react'
import { apiPro } from '../api'
import { TopoApp } from '../componentes/TopoApp'

type PacienteResumo = {
  id: string
  nome: string
  ultimo_registro: string | null
  total_registros: number
  humor_medio_30d: number | null
  para_sessao: number
}

function diasDesde(timestamp: string | null): number | null {
  if (!timestamp) return null
  return Math.floor((Date.now() - Date.parse(timestamp)) / 86400000)
}

function linhaMeta(p: PacienteResumo): string {
  if (p.para_sessao > 0)
    return `✦ ${p.para_sessao} ${p.para_sessao === 1 ? 'registro' : 'registros'} para a sessão`
  const dias = diasDesde(p.ultimo_registro)
  if (dias === null) return 'ainda sem registros'
  const quando = dias === 0 ? 'hoje' : dias === 1 ? 'ontem' : `há ${dias} dias`
  const humor =
    p.humor_medio_30d !== null ? ` · humor ${p.humor_medio_30d.toLocaleString('pt-BR')}` : ''
  return `último registro ${quando}${humor}`
}

export function ListaPacientes({
  aoAbrir,
  aoSair,
}: {
  aoAbrir: (id: string) => void
  aoSair: () => void
}) {
  const [pacientes, setPacientes] = useState<PacienteResumo[]>([])
  const [convidando, setConvidando] = useState(false)
  const [nomeNovo, setNomeNovo] = useState('')
  const [linkGerado, setLinkGerado] = useState<{ nome: string; link: string } | null>(null)
  const [copiado, setCopiado] = useState(false)

  const carregar = () => {
    apiPro
      .pacientes()
      .then((r: { pacientes: PacienteResumo[] }) => setPacientes(r.pacientes))
      .catch(() => {})
  }
  useEffect(carregar, [])

  const convidar = async () => {
    const nome = nomeNovo.trim()
    if (!nome) return
    const r = await apiPro.convidar(nome)
    setLinkGerado({ nome: r.nome, link: r.link })
    setNomeNovo('')
    setConvidando(false)
    carregar()
  }

  return (
    <div className="tela pro sem-nav">
      <TopoApp direita="Ana Mediolaro" />
      <div className="t-h1">
        Seus <em>pacientes</em>
      </div>
      {pacientes.map((p) => {
        const dias = diasDesde(p.ultimo_registro)
        const parado = dias !== null && dias >= 7
        return (
          <button
            key={p.id}
            className={`t-paciente${p.para_sessao > 0 ? ' destaque-sessao' : ''}`}
            onClick={() => aoAbrir(p.id)}
          >
            <span>
              <span className="nm">
                {parado && <span className="ponto-alerta" />}
                {p.nome}
              </span>
              <span className="mt" style={{ display: 'block', color: p.para_sessao > 0 ? 'var(--ouro)' : undefined }}>
                {parado ? `sem registrar há ${dias} dias` : linhaMeta(p)}
              </span>
            </span>
            <span className="seta">›</span>
          </button>
        )
      })}

      {linkGerado && (
        <div className="t-card">
          <div className="t-label" style={{ marginTop: 0 }}>
            Link de {linkGerado.nome}
          </div>
          <p className="t-sub">
            Envie pelo WhatsApp. Por segurança, o link aparece só agora: se perder, gere outro no
            perfil.
          </p>
          <div className="caixa-link">{linkGerado.link}</div>
          <div className="linha-acoes" style={{ marginTop: 10 }}>
            <button
              className="botao-mini ouro"
              onClick={() => {
                void navigator.clipboard.writeText(linkGerado.link).then(() => setCopiado(true))
              }}
            >
              {copiado ? 'Copiado' : 'Copiar link'}
            </button>
            <button
              className="botao-mini"
              onClick={() => {
                setLinkGerado(null)
                setCopiado(false)
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {convidando ? (
        <div className="t-card">
          <div className="t-label" style={{ marginTop: 0 }}>
            Novo paciente
          </div>
          <input
            className="t-input"
            placeholder="Nome do paciente"
            value={nomeNovo}
            onChange={(e) => setNomeNovo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void convidar()}
          />
          <div className="linha-acoes" style={{ marginTop: 10 }}>
            <button className="botao-mini ouro" onClick={() => void convidar()}>
              Gerar link único
            </button>
            <button className="botao-mini" onClick={() => setConvidando(false)}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button className="t-btn fantasma" onClick={() => setConvidando(true)}>
          + Convidar novo paciente
        </button>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <button className="botao-mini" onClick={aoSair}>
          Sair da área profissional
        </button>
      </div>
    </div>
  )
}
