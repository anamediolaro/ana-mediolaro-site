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
import { Celebracao } from './telas/Celebracao'
import { Cartao, type PedidoCartao } from './telas/Cartao'
import { Rpd } from './telas/Rpd'
import { Lembretes } from './telas/Lembretes'
import { CONQUISTAS, PATH_ESTRELA } from './dados'

export type Eu = {
  nome: string
  consentiu: boolean
  consentiuIa: boolean
  tarefasPendentes: number
  conquistas: { tipo: string; desbloqueada_em: string }[]
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
  | 'celebracao'
  | 'cartao'
  | 'rpd'
  | 'lembretes'

export function App() {
  const [eu, setEu] = useState<Eu | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [rota, setRota] = useState<Rota>('inicio')
  const [toast, setToast] = useState('')
  const [resultado, setResultado] = useState<ResultadoCheckIn | null>(null)
  const [cartao, setCartao] = useState<PedidoCartao | null>(null)
  const [origemCartao, setOrigemCartao] = useState<Rota>('estrelas')

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

  const avisarConquistas = (tipos: string[]) => {
    if (!tipos.length) return
    const rotulo = CONQUISTAS.find((c) => c.tipo === tipos[0])?.rotulo ?? ''
    avisar(
      tipos.length === 1
        ? `Conquista desbloqueada: ${rotulo}`
        : `${tipos.length} conquistas desbloqueadas`
    )
  }

  const depoisDaCelebracao = (r: ResultadoCheckIn | null) => {
    if (r && r.nivel <= 2) {
      setRota('pos-registro')
    } else {
      setRota('inicio')
      avisar('Registro salvo')
    }
  }

  const aoSalvarCheckIn = (r: ResultadoCheckIn) => {
    setResultado(r)
    void recarregar()
    if (r.subiuDeNivel) {
      setRota('celebracao')
    } else if (r.nivel <= 2) {
      setRota('pos-registro')
      avisarConquistas(r.conquistasNovas)
    } else {
      setRota('inicio')
      if (r.conquistasNovas.length) avisarConquistas(r.conquistasNovas)
      else avisar('Registro salvo')
    }
  }

  const telas: Record<Rota, JSX.Element> = {
    inicio: (
      <Home
        eu={eu}
        aoRegistrar={() => setRota('checkin')}
        aoPedirApoio={() => setRota('apoio')}
        aoAbrirTarefas={() => setRota('tarefas')}
        aoAbrirLembretes={() => setRota('lembretes')}
      />
    ),
    lembretes: <Lembretes aoVoltar={() => setRota('inicio')} />,
    rpd: (
      <Rpd
        consentiuIa={eu.consentiuIa}
        aoConsentir={async () => {
          const { apiApoio } = await import('./api')
          await apiApoio.consentirIa()
          void recarregar()
        }}
        aoSair={() => {
          void recarregar()
          setRota('apoio')
        }}
        aoRisco={() => setRota('protocolo')}
        aoIndisponivel={() => {
          avisar('O assistente não está disponível agora.')
          setRota('apoio')
        }}
        aoConcluir={() => {
          void recarregar()
          avisar('Exercício concluído. 3 estrelas para você.')
        }}
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
    estrelas: (
      <Estrelas
        eu={eu}
        aoCompartilhar={(pedido) => {
          setCartao(pedido)
          setOrigemCartao('estrelas')
          setRota('cartao')
        }}
      />
    ),
    celebracao: (
      <Celebracao
        nivel={resultado?.novoNivel ?? eu.estrelas.nivel}
        aoContinuar={() => depoisDaCelebracao(resultado)}
        aoCompartilhar={() => {
          const nivel = resultado?.novoNivel ?? eu.estrelas.nivel
          setCartao({
            texto: `Cheguei ao nível {${nivel}}.`,
            paths: [PATH_ESTRELA],
            arquivo: `diario-das-emocoes-nivel-${nivel
              .toLowerCase()
              .normalize('NFD')
              .replace(/[̀-ͯ]/g, '')}.jpg`,
          })
          setOrigemCartao('celebracao')
          setRota('cartao')
        }}
      />
    ),
    cartao: cartao ? (
      <Cartao
        pedido={cartao}
        aoVoltar={() => {
          if (origemCartao === 'celebracao') depoisDaCelebracao(resultado)
          else setRota('estrelas')
        }}
      />
    ) : (
      <Estrelas eu={eu} aoCompartilhar={() => {}} />
    ),
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
      <Apoio aoAbrir={(tecnica) => setRota(tecnica)} aoVoltar={() => setRota('inicio')} />
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
