import { useCallback, useEffect, useState, type JSX } from 'react'
import { api, temToken, iniciarSincronizacao } from './api'
import { NavApp, type Aba } from './componentes/NavApp'
import { BoasVindas } from './telas/BoasVindas'
import { Home } from './telas/Home'
import { CheckIn, type ResultadoCheckIn } from './telas/CheckIn'
import { PosRegistro } from './telas/PosRegistro'
import { Historico } from './telas/Historico'
import { Padroes } from './telas/Padroes'
import { Estrelas } from './telas/Estrelas'
import { Apoio } from './telas/Apoio'
import { Grounding } from './telas/Grounding'
import { TecnicaStop } from './telas/TecnicaStop'
import { Protocolo } from './telas/Protocolo'
import { Tarefas } from './telas/Tarefas'

export type Eu = {
  nome: string
  consentiu: boolean
  tarefasPendentes: number
  ultimoRegistro: Record<string, unknown> | null
  registrosHoje: number
  diasDesdeUltimo: number | null
  estrelas: {
    total: number
    nivel: string
    proximoNivel: string | null
    faltam: number | null
    progresso: number
  }
}

type Rota =
  | Aba
  | 'checkin'
  | 'pos-registro'
  | 'apoio'
  | 'grounding'
  | 'stop'
  | 'protocolo'
  | 'tarefas'

export function App() {
  const [eu, setEu] = useState<Eu | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [rota, setRota] = useState<Rota>('inicio')
  const [toast, setToast] = useState('')
  const [resultado, setResultado] = useState<ResultadoCheckIn | null>(null)

  const recarregar = useCallback(async () => {
    try {
      setEu((await api.eu()) as Eu)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (!temToken()) {
      setCarregando(false)
      return
    }
    iniciarSincronizacao()
    void recarregar()
  }, [recarregar])

  const avisar = (mensagem: string) => {
    setToast(mensagem)
    window.setTimeout(() => setToast(''), 2600)
  }

  if (carregando) return <div className="tela sem-nav" />

  if (!temToken()) {
    return (
      <div className="tela sem-nav centro">
        <div className="t-h1">
          Diário das <em>Emoções</em>
        </div>
        <p className="t-sub" style={{ maxWidth: 280 }}>
          Este diário é aberto pelo link pessoal que a sua psicóloga enviou. Se você não tem o
          link, fale com ela.
        </p>
      </div>
    )
  }

  if (!eu) return <div className="tela sem-nav" />

  if (!eu.consentiu) {
    return (
      <BoasVindas
        nome={eu.nome}
        aoComecar={async (nome) => {
          await api.consentir(nome)
          await recarregar()
        }}
      />
    )
  }

  const aoSalvarCheckIn = (r: ResultadoCheckIn) => {
    setResultado(r)
    void recarregar()
    if (r.nivel <= 2) {
      setRota('pos-registro')
    } else {
      setRota('inicio')
      avisar('Registro salvo')
    }
  }

  const telas: Record<Rota, JSX.Element> = {
    inicio: (
      <Home
        eu={eu}
        aoRegistrar={() => setRota('checkin')}
        aoPedirApoio={() => setRota('apoio')}
        aoAbrirTarefas={() => setRota('tarefas')}
      />
    ),
    tarefas: (
      <Tarefas
        aoVoltar={() => setRota('inicio')}
        aoResponder={() => {
          void recarregar()
          avisar('Resposta enviada. 5 estrelas para você.')
        }}
      />
    ),
    historico: <Historico />,
    padroes: <Padroes />,
    estrelas: <Estrelas eu={eu} />,
    checkin: (
      <CheckIn
        primeiraDoDia={eu.registrosHoje === 0}
        aoSalvar={aoSalvarCheckIn}
        aoSair={() => setRota('inicio')}
        aoFalhar={() => avisar('Algo falhou. Tente de novo.')}
      />
    ),
    'pos-registro': (
      <PosRegistro
        resultado={resultado}
        aoConcluir={() => {
          setRota('inicio')
          avisar('Registro salvo')
        }}
      />
    ),
    apoio: (
      <Apoio
        aoAbrir={(tecnica) => setRota(tecnica)}
        aoVoltar={() => setRota('inicio')}
      />
    ),
    grounding: (
      <Grounding aoSair={() => setRota('apoio')} aoRegistrar={() => setRota('checkin')} />
    ),
    stop: (
      <TecnicaStop aoSair={() => setRota('apoio')} aoRegistrar={() => setRota('checkin')} />
    ),
    protocolo: <Protocolo aoVoltar={() => setRota('apoio')} />,
  }

  const navegaveis: Rota[] = ['inicio', 'historico', 'padroes', 'estrelas']

  return (
    <>
      {telas[rota]}
      {navegaveis.includes(rota) && (
        <NavApp ativa={rota as Aba} aoNavegar={(aba) => setRota(aba)} />
      )}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
