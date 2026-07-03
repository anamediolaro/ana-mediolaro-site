import { useCallback, useEffect, useState } from 'react'
import { apiPro } from '../api'
import { TopoApp } from '../componentes/TopoApp'
import { Rosto } from '../componentes/Rosto'
import { rotuloHumor, diaLocal } from '../dados'
import { exportarPdf } from './pdf'

type RegistroPro = {
  id: string
  timestamp: string
  nivel: number
  emocoes: string
  emocoes_livres: string
  atividades: string
  atividade_texto: string | null
  pensamento: string | null
  corpo: string
  acao: string | null
  sono: string | null
  falar_na_sessao: number
}

type Anotacao = { id: string; registro_id: string; texto: string; criado_em: string }

type Tarefa = {
  id: string
  titulo: string
  orientacoes: string | null
  resposta_paciente: string | null
  respondida_em: string | null
  anotacao_terapeuta: string | null
  status: string
  criado_em: string
}

type Perfil = {
  paciente: { id: string; nome: string; arquivado: number; ultimo_acesso_em: string | null }
  estrelas: { total: number; nivel: string }
  totalRegistros: number
  paraSessao: RegistroPro[]
  resumo: {
    totalRegistros: number
    humorMedio: number | null
    emocoes: { item: string; vezes: number }[]
    contextos: { item: string; vezes: number }[]
    corpo: { item: string; vezes: number }[]
  }
}

const lista = (json: string): string[] => {
  try {
    return JSON.parse(json)
  } catch {
    return []
  }
}

const SONO_ROTULO: Record<string, string> = {
  bem: 'Dormi bem',
  mal: 'Dormi mal',
  cansado: 'Acordei cansado(a)',
  insonia: 'Insônia',
}

function BarrasMini({ titulo, itens }: { titulo: string; itens: { item: string; vezes: number }[] }) {
  if (!itens.length) return null
  const maximo = itens[0].vezes
  return (
    <div className="t-card" style={{ flex: 1, minWidth: 200 }}>
      <div className="t-label" style={{ marginTop: 0 }}>
        {titulo}
      </div>
      {itens.map(({ item, vezes }) => (
        <div key={item} className="barra-linha">
          <span style={{ flexBasis: 110 }}>{item}</span>
          <div className="barra-trilho">
            <div className="barra-valor" style={{ width: `${(vezes / maximo) * 100}%` }} />
          </div>
          <small>{vezes}</small>
        </div>
      ))}
    </div>
  )
}

function CartaoRegistroPro({
  registro,
  anotacoes,
  aoAnotar,
  aoMarcarVisto,
}: {
  registro: RegistroPro
  anotacoes: Anotacao[]
  aoAnotar: (registroId: string, texto: string) => Promise<void>
  aoMarcarVisto?: (registroId: string) => Promise<void>
}) {
  const [anotando, setAnotando] = useState(false)
  const [texto, setTexto] = useState('')
  const emocoes = lista(registro.emocoes)
  const pessoais = lista(registro.emocoes_livres)
  const contextos = [
    ...lista(registro.atividades),
    ...(registro.atividade_texto ? [registro.atividade_texto] : []),
  ]
  const corpo = lista(registro.corpo)
  const marcado = Boolean(registro.falar_na_sessao)

  return (
    <div className={`t-card${marcado ? ' destaque-sessao' : ''}`}>
      <div className="linha1">
        <span className="t-nivel">
          <Rosto nivel={registro.nivel} /> {rotuloHumor(registro.nivel)}
        </span>
        <span className="t-hora">
          {registro.timestamp.slice(0, 10).split('-').reverse().join('/')} ·{' '}
          {registro.timestamp.slice(11, 16)}
        </span>
      </div>
      {(emocoes.length > 0 || pessoais.length > 0) && (
        <div className="t-tags">
          {emocoes.map((e) => (
            <span key={e} className="t-tag">
              {e}
            </span>
          ))}
          {pessoais.map((e) => (
            <span key={e} className="t-tag pessoal">
              {e}
            </span>
          ))}
        </div>
      )}
      {contextos.length > 0 && (
        <div className="t-campo">
          <b>Contexto</b>
          <p>{contextos.join(', ')}</p>
        </div>
      )}
      {registro.pensamento && (
        <div className="t-campo">
          <b>Pensamento</b>
          <p>{registro.pensamento}</p>
        </div>
      )}
      {corpo.length > 0 && (
        <div className="t-campo">
          <b>Corpo</b>
          <p>{corpo.join(', ')}</p>
        </div>
      )}
      {registro.acao && (
        <div className="t-campo">
          <b>Ação</b>
          <p>{registro.acao}</p>
        </div>
      )}
      {registro.sono && (
        <div className="t-campo">
          <b>Sono</b>
          <p>{SONO_ROTULO[registro.sono] ?? registro.sono}</p>
        </div>
      )}
      {marcado && <span className="flag-sessao">✦ Quero falar disso na sessão</span>}

      {anotacoes.map((a) => (
        <div key={a.id} className="t-anotacao">
          <b>Minha anotação</b>
          <p>{a.texto}</p>
        </div>
      ))}

      <div className="linha-acoes" style={{ marginTop: 10 }}>
        {anotando ? (
          <div style={{ width: '100%' }}>
            <textarea
              className="t-input"
              style={{ minHeight: 70, marginTop: 0 }}
              placeholder="Visível só para você."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <div className="linha-acoes" style={{ marginTop: 8 }}>
              <button
                className="botao-mini ouro"
                onClick={async () => {
                  if (!texto.trim()) return
                  await aoAnotar(registro.id, texto.trim())
                  setTexto('')
                  setAnotando(false)
                }}
              >
                Guardar anotação
              </button>
              <button className="botao-mini" onClick={() => setAnotando(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <button className="botao-mini" onClick={() => setAnotando(true)}>
              Anotar
            </button>
            {marcado && aoMarcarVisto && (
              <button className="botao-mini" onClick={() => void aoMarcarVisto(registro.id)}>
                Visto na sessão
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function PerfilPaciente({
  pacienteId,
  aoVoltar,
}: {
  pacienteId: string
  aoVoltar: () => void
}) {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [dias, setDias] = useState(30)
  const [registros, setRegistros] = useState<RegistroPro[]>([])
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([])
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [novaTarefa, setNovaTarefa] = useState<{ titulo: string; orientacoes: string } | null>(null)
  const [anotandoTarefa, setAnotandoTarefa] = useState<{ id: string; texto: string } | null>(null)
  const [linkNovo, setLinkNovo] = useState('')
  const [exportando, setExportando] = useState(false)

  const de = diaLocal(new Date(Date.now() - dias * 86400000))
  const ate = diaLocal()

  const carregar = useCallback(async () => {
    const [p, linha, t] = await Promise.all([
      apiPro.perfil(pacienteId, dias),
      apiPro.registrosDoPaciente(pacienteId, de, ate),
      apiPro.tarefas(pacienteId),
    ])
    setPerfil(p)
    setRegistros(linha.registros)
    setAnotacoes(linha.anotacoes)
    setTarefas(t.tarefas)
  }, [pacienteId, dias, de, ate])

  useEffect(() => {
    carregar().catch(() => {})
  }, [carregar])

  if (!perfil) return <div className="tela pro sem-nav" />

  const anotacoesDe = (registroId: string) =>
    anotacoes.filter((a) => a.registro_id === registroId)

  const anotar = async (registroId: string, texto: string) => {
    await apiPro.anotar(registroId, texto)
    await carregar()
  }

  const marcarVisto = async (registroId: string) => {
    await apiPro.marcarVisto(registroId)
    await carregar()
  }

  return (
    <div className="tela pro sem-nav">
      <TopoApp direita="área profissional" />
      <button className="botao-mini" onClick={aoVoltar} style={{ alignSelf: 'flex-start' }}>
        ← Pacientes
      </button>
      <div className="t-h1" style={{ marginTop: 12 }}>
        {perfil.paciente.nome.split(' ')[0]}{' '}
        <em>{perfil.paciente.nome.split(' ').slice(1).join(' ')}</em>
      </div>
      <p className="t-sub">
        Nível {perfil.estrelas.nivel} · <span className="estrela">✦</span> {perfil.estrelas.total}{' '}
        estrelas · {perfil.totalRegistros} registros
      </p>

      {perfil.paraSessao.length > 0 && (
        <>
          <div className="t-label">Para a próxima sessão</div>
          {perfil.paraSessao.map((r) => (
            <CartaoRegistroPro
              key={r.id}
              registro={r}
              anotacoes={anotacoesDe(r.id)}
              aoAnotar={anotar}
              aoMarcarVisto={marcarVisto}
            />
          ))}
        </>
      )}

      <div className="t-label">Resumo do período</div>
      <div className="seletor-periodo">
        {[7, 30, 90].map((d) => (
          <button key={d} className={dias === d ? 'sel' : ''} onClick={() => setDias(d)}>
            {d} dias
          </button>
        ))}
      </div>
      <div className="t-stats">
        <div className="t-stat">
          <div className="n">
            {perfil.resumo.humorMedio !== null
              ? perfil.resumo.humorMedio.toLocaleString('pt-BR')
              : '·'}
          </div>
          <div className="l">humor médio</div>
        </div>
        <div className="t-stat">
          <div className="n">{perfil.resumo.totalRegistros}</div>
          <div className="l">registros no período</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
        <BarrasMini titulo="Emoções recorrentes" itens={perfil.resumo.emocoes} />
        <BarrasMini titulo="Contextos" itens={perfil.resumo.contextos} />
        <BarrasMini titulo="Onde o corpo sente" itens={perfil.resumo.corpo} />
      </div>

      <div className="t-label">Tarefas terapêuticas</div>
      {tarefas.map((t) => (
        <div key={t.id} className="t-card">
          <div className="linha1">
            <b style={{ fontFamily: 'Lora, serif', fontSize: 15 }}>{t.titulo}</b>
            <span className={`status-tarefa${t.status === 'respondida' ? ' ok' : ''}`}>
              {t.status}
            </span>
          </div>
          {t.orientacoes && (
            <div className="t-campo">
              <b>Orientações</b>
              <p>{t.orientacoes}</p>
            </div>
          )}
          {t.resposta_paciente && (
            <div className="t-campo">
              <b>Resposta do paciente</b>
              <p>{t.resposta_paciente}</p>
            </div>
          )}
          {t.anotacao_terapeuta && (
            <div className="t-anotacao">
              <b>Minha anotação</b>
              <p>{t.anotacao_terapeuta}</p>
            </div>
          )}
          <div className="linha-acoes" style={{ marginTop: 10 }}>
            {anotandoTarefa?.id === t.id ? (
              <div style={{ width: '100%' }}>
                <textarea
                  className="t-input"
                  style={{ minHeight: 70, marginTop: 0 }}
                  value={anotandoTarefa.texto}
                  onChange={(e) => setAnotandoTarefa({ id: t.id, texto: e.target.value })}
                />
                <div className="linha-acoes" style={{ marginTop: 8 }}>
                  <button
                    className="botao-mini ouro"
                    onClick={async () => {
                      await apiPro.anotarTarefa(t.id, anotandoTarefa.texto)
                      setAnotandoTarefa(null)
                      await carregar()
                    }}
                  >
                    Guardar anotação
                  </button>
                  <button className="botao-mini" onClick={() => setAnotandoTarefa(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="botao-mini"
                onClick={() => setAnotandoTarefa({ id: t.id, texto: t.anotacao_terapeuta ?? '' })}
              >
                {t.anotacao_terapeuta ? 'Editar anotação' : 'Anotar'}
              </button>
            )}
          </div>
        </div>
      ))}
      {novaTarefa ? (
        <div className="t-card">
          <input
            className="t-input"
            style={{ marginTop: 0 }}
            placeholder="Título da tarefa"
            value={novaTarefa.titulo}
            onChange={(e) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
          />
          <textarea
            className="t-input"
            placeholder="Orientações para o paciente"
            value={novaTarefa.orientacoes}
            onChange={(e) => setNovaTarefa({ ...novaTarefa, orientacoes: e.target.value })}
          />
          <div className="linha-acoes" style={{ marginTop: 10 }}>
            <button
              className="botao-mini ouro"
              onClick={async () => {
                if (!novaTarefa.titulo.trim()) return
                await apiPro.criarTarefa(pacienteId, novaTarefa.titulo.trim(), novaTarefa.orientacoes.trim())
                setNovaTarefa(null)
                await carregar()
              }}
            >
              Criar tarefa
            </button>
            <button className="botao-mini" onClick={() => setNovaTarefa(null)}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          className="t-btn fantasma"
          onClick={() => setNovaTarefa({ titulo: '', orientacoes: '' })}
        >
          + Nova tarefa
        </button>
      )}

      <div className="t-label">Linha do tempo do período</div>
      {registros.length === 0 && <p className="t-sub">Nenhum registro no período escolhido.</p>}
      {registros.map((r) => (
        <CartaoRegistroPro
          key={r.id}
          registro={r}
          anotacoes={anotacoesDe(r.id)}
          aoAnotar={anotar}
        />
      ))}

      <button
        className="t-btn fantasma"
        disabled={exportando}
        onClick={async () => {
          setExportando(true)
          try {
            await exportarPdf(perfil.paciente.nome, de, ate, registros, anotacoes)
          } finally {
            setExportando(false)
          }
        }}
      >
        {exportando ? 'Gerando PDF...' : 'Exportar PDF do período'}
      </button>

      <div className="t-label">Acesso do paciente</div>
      {linkNovo && (
        <div className="t-card">
          <p className="t-sub" style={{ marginTop: 0 }}>
            Novo link gerado. O anterior parou de funcionar. Envie este ao paciente:
          </p>
          <div className="caixa-link">{linkNovo}</div>
        </div>
      )}
      <div className="linha-acoes" style={{ marginTop: 10 }}>
        <button
          className="botao-mini"
          onClick={async () => {
            const r = await apiPro.regenerarLink(pacienteId)
            setLinkNovo(r.link)
          }}
        >
          Gerar novo link de acesso
        </button>
        <button
          className="botao-mini"
          onClick={async () => {
            await apiPro.arquivar(pacienteId, !perfil.paciente.arquivado)
            aoVoltar()
          }}
        >
          {perfil.paciente.arquivado ? 'Reativar paciente' : 'Arquivar paciente'}
        </button>
      </div>
    </div>
  )
}
