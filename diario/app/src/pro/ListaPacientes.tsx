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
  rpd_novos: number
  riscos_novos: number
  mensagens_novas: number
}

function diasDesde(timestamp: string | null): number | null {
  if (!timestamp) return null
  return Math.floor((Date.now() - Date.parse(timestamp)) / 86400000)
}

function linhaMeta(p: PacienteResumo): string {
  const partes: string[] = []
  if (p.riscos_novos > 0) partes.push('evento de risco para ver')
  if (p.mensagens_novas > 0) partes.push('mensagem nova')
  if (p.para_sessao > 0)
    partes.push(`${p.para_sessao} ${p.para_sessao === 1 ? 'registro' : 'registros'} para a sessão`)
  if (p.rpd_novos > 0) partes.push('RPD novo')
  if (partes.length) return `✦ ${partes.join(' · ')}`
  const dias = diasDesde(p.ultimo_registro)
  if (dias === null) return 'ainda sem registros'
  const quando = dias === 0 ? 'hoje' : dias === 1 ? 'ontem' : `há ${dias} dias`
  const humor =
    p.humor_medio_30d !== null ? ` · humor ${p.humor_medio_30d.toLocaleString('pt-BR')}` : ''
  return `último registro ${quando}${humor}`
}

function temDestaque(p: PacienteResumo): boolean {
  return p.para_sessao > 0 || p.rpd_novos > 0 || p.riscos_novos > 0 || p.mensagens_novas > 0
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
        const destaque = temDestaque(p)
        return (
          <button
            key={p.id}
            className={`t-paciente${destaque ? ' destaque-sessao' : ''}`}
            onClick={() => aoAbrir(p.id)}
          >
            <span>
              <span className="nm">
                {parado && <span className="ponto-alerta" />}
                {p.nome}
              </span>
              <span className="mt" style={{ display: 'block', color: destaque ? 'var(--ouro)' : undefined }}>
                {destaque || !parado ? linhaMeta(p) : `sem registrar há ${dias} dias`}
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

      <Configuracoes />

      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <button className="botao-mini" onClick={aoSair}>
          Sair da área profissional
        </button>
      </div>
    </div>
  )
}

// Contato de emergência do protocolo e alertas no aparelho da terapeuta.
function Configuracoes() {
  const [aberto, setAberto] = useState(false)
  const [contato, setContato] = useState('')
  const [aviso, setAviso] = useState('')

  const ativarAlertas = async () => {
    setAviso('')
    try {
      const { chavePublica } = (await fetch('/api/pro/push/chave').then((r) => r.json())) as {
        chavePublica: string | null
      }
      if (!chavePublica || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setAviso('Notificações indisponíveis neste aparelho ou ainda não ativadas no painel.')
        return
      }
      const permissao = await Notification.requestPermission()
      if (permissao !== 'granted') {
        setAviso('Sem a permissão do navegador, o alerta não chega.')
        return
      }
      const registro = await navigator.serviceWorker.ready
      const chave = Uint8Array.from(
        atob((chavePublica as string).replaceAll('-', '+').replaceAll('_', '/')),
        (c) => c.charCodeAt(0)
      )
      const inscricao = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: chave as unknown as BufferSource,
      })
      const json = inscricao.toJSON()
      await fetch('/api/pro/push/inscrever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: inscricao.endpoint,
          p256dh: json.keys?.p256dh ?? '',
          auth: json.keys?.auth ?? '',
        }),
      })
      setAviso('Alertas ativados neste aparelho.')
    } catch {
      setAviso('Não deu para ativar agora. Tente de novo.')
    }
  }

  if (!aberto)
    return (
      <button className="botao-mini" style={{ marginTop: 18 }} onClick={() => setAberto(true)}>
        Configurações
      </button>
    )

  return (
    <div className="t-card" style={{ marginTop: 18 }}>
      <div className="t-label" style={{ marginTop: 0 }}>
        Configurações
      </div>
      <p className="t-sub">
        Contato de emergência exibido no protocolo de segurança dos pacientes (nome e telefone).
      </p>
      <input
        className="t-input"
        placeholder="Ex: Dra. Ana · (11) 9xxxx-xxxx"
        value={contato}
        onChange={(e) => setContato(e.target.value)}
      />
      <div className="linha-acoes" style={{ marginTop: 10 }}>
        <button
          className="botao-mini ouro"
          onClick={async () => {
            await apiPro.salvarConfiguracoes(contato)
            setAviso('Contato salvo.')
          }}
        >
          Salvar contato
        </button>
        <button className="botao-mini" onClick={() => void ativarAlertas()}>
          Ativar alertas neste aparelho
        </button>
        <button className="botao-mini" onClick={() => setAberto(false)}>
          Fechar
        </button>
      </div>
      {aviso && (
        <p className="t-sub" style={{ marginTop: 8 }}>
          {aviso}
        </p>
      )}
    </div>
  )
}
