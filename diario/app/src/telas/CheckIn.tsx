import { useEffect, useState } from 'react'
import { api } from '../api'
import { TopoApp } from '../componentes/TopoApp'
import { Rosto } from '../componentes/Rosto'
import { Chips } from '../componentes/Chips'
import {
  ATIVIDADES,
  CORPO,
  EMOCOES_AGRADAVEIS,
  EMOCOES_DESAGRADAVEIS,
  HUMOR,
  SONO,
  timestampLocal,
} from '../dados'

export type ResultadoCheckIn = {
  nivel: number
  offline: boolean
  audioSugerido: { id: string; titulo: string; duracaoSeg: number | null } | null
  conquistasNovas: string[]
  subiuDeNivel: boolean
  novoNivel: string | null
}

type Passo = 'humor' | 'sono' | 'emocoes' | 'atividades' | 'pensamento' | 'corpo' | 'acao'

const alternarEm = (lista: string[], valor: string) =>
  lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]

export function CheckIn({
  primeiraDoDia,
  aoSalvar,
  aoSair,
  aoFalhar,
}: {
  primeiraDoDia: boolean
  aoSalvar: (resultado: ResultadoCheckIn) => void
  aoSair: () => void
  aoFalhar: () => void
}) {
  const [passo, setPasso] = useState<Passo>('humor')
  const [nivel, setNivel] = useState(0)
  const [sono, setSono] = useState('')
  const [emocoes, setEmocoes] = useState<string[]>([])
  const [emocoesLivres, setEmocoesLivres] = useState<string[]>([])
  const [chipsPessoais, setChipsPessoais] = useState<string[]>([])
  const [palavraNova, setPalavraNova] = useState('')
  const [atividades, setAtividades] = useState<string[]>([])
  const [atividadeTexto, setAtividadeTexto] = useState('')
  const [pensamento, setPensamento] = useState('')
  const [corpo, setCorpo] = useState<string[]>([])
  const [acao, setAcao] = useState('')
  const [falarNaSessao, setFalarNaSessao] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    api
      .emocoesPessoais()
      .then((r: { palavras: string[] }) => setChipsPessoais(r.palavras))
      .catch(() => {})
  }, [])

  // Os 6 passos do check-in. A pergunta de sono aparece uma vez por dia,
  // entre o humor e as emoções, sem ocupar um segmento da barra.
  const ordem: Passo[] = primeiraDoDia
    ? ['humor', 'sono', 'emocoes', 'atividades', 'pensamento', 'corpo', 'acao']
    : ['humor', 'emocoes', 'atividades', 'pensamento', 'corpo', 'acao']
  const nucleo: Passo[] = ['humor', 'emocoes', 'atividades', 'pensamento', 'corpo', 'acao']
  const indiceNucleo = Math.max(0, nucleo.indexOf(passo === 'sono' ? 'humor' : passo))

  const irPara = (delta: number) => {
    const i = ordem.indexOf(passo) + delta
    if (i < 0) aoSair()
    else if (i < ordem.length) setPasso(ordem[i])
  }

  const adicionarPalavra = () => {
    const palavra = palavraNova.trim()
    if (!palavra) return
    if (!chipsPessoais.includes(palavra)) setChipsPessoais([...chipsPessoais, palavra])
    if (!emocoesLivres.includes(palavra)) setEmocoesLivres([...emocoesLivres, palavra])
    setPalavraNova('')
  }

  const salvar = async () => {
    setSalvando(true)
    try {
      const resposta = await api.salvarRegistro({
        id: crypto.randomUUID(),
        timestamp: timestampLocal(),
        nivel,
        emocoes,
        emocoesLivres,
        atividades,
        atividadeTexto: atividadeTexto.trim(),
        pensamento: pensamento.trim(),
        corpo,
        acao: acao.trim(),
        sono,
        falarNaSessao,
      })
      aoSalvar({
        nivel,
        offline: Boolean(resposta.offline),
        audioSugerido: resposta.audioSugerido ?? null,
        conquistasNovas: resposta.conquistasNovas ?? [],
        subiuDeNivel: Boolean(resposta.estrelas?.subiuDeNivel),
        novoNivel: resposta.estrelas?.nivel ?? null,
      })
    } catch {
      aoFalhar()
      setSalvando(false)
    }
  }

  const podeAvancar =
    passo === 'humor'
      ? nivel > 0
      : passo === 'emocoes'
        ? emocoes.length + emocoesLivres.length > 0
        : true
  const opcional = !['humor', 'emocoes'].includes(passo)
  const ultimo = ordem.indexOf(passo) === ordem.length - 1

  return (
    <div className="tela sem-nav">
      <TopoApp direita={`passo ${indiceNucleo + 1} de 6`} />
      <div className="t-progresso">
        {nucleo.map((p, i) => (
          <span key={p} className={i <= indiceNucleo ? 'ok' : ''} />
        ))}
      </div>

      {passo === 'humor' && (
        <>
          <div className="t-pergunta">Como você está se sentindo agora?</div>
          <p className="t-dica">Não existe resposta certa. Existe a sua.</p>
          <div className="escala">
            {HUMOR.map((h) => (
              <button
                key={h.nivel}
                className={`humor${nivel === h.nivel ? ' sel' : ''}`}
                onClick={() => setNivel(h.nivel)}
              >
                <span className="rosto">
                  <Rosto nivel={h.nivel} />
                </span>
                <small>{h.rotulo}</small>
              </button>
            ))}
          </div>
        </>
      )}

      {passo === 'sono' && (
        <>
          <div className="t-pergunta">E a noite de ontem, como foi?</div>
          <p className="t-dica">Uma pergunta só, uma vez por dia. Pode pular.</p>
          <div className="t-chips" style={{ marginTop: 18 }}>
            {SONO.map((s) => (
              <button
                key={s.valor}
                className={`t-chip${sono === s.valor ? ' sel' : ''}`}
                onClick={() => setSono(sono === s.valor ? '' : s.valor)}
              >
                {s.rotulo}
              </button>
            ))}
          </div>
        </>
      )}

      {passo === 'emocoes' && (
        <>
          <div className="t-pergunta">Que emoções estão presentes?</div>
          <p className="t-dica">Pode marcar mais de uma. Emoções contraditórias convivem, isso é normal.</p>
          <div className="t-label">Agradáveis</div>
          <Chips
            opcoes={EMOCOES_AGRADAVEIS}
            selecionadas={emocoes}
            aoAlternar={(v) => setEmocoes(alternarEm(emocoes, v))}
          />
          <div className="t-label">Desagradáveis</div>
          <Chips
            opcoes={EMOCOES_DESAGRADAVEIS}
            selecionadas={emocoes}
            aoAlternar={(v) => setEmocoes(alternarEm(emocoes, v))}
          />
          {chipsPessoais.length > 0 && (
            <>
              <div className="t-label">Suas palavras</div>
              <Chips
                pessoais
                opcoes={chipsPessoais}
                selecionadas={emocoesLivres}
                aoAlternar={(v) => setEmocoesLivres(alternarEm(emocoesLivres, v))}
              />
            </>
          )}
          <input
            className="t-input"
            value={palavraNova}
            onChange={(e) => setPalavraNova(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && adicionarPalavra()}
            onBlur={adicionarPalavra}
            placeholder="Não achou a palavra? Escreva a sua."
          />
        </>
      )}

      {passo === 'atividades' && (
        <>
          <div className="t-pergunta">O que você estava fazendo?</div>
          <p className="t-dica">O contexto ajuda a enxergar padrões depois.</p>
          <Chips
            opcoes={ATIVIDADES}
            selecionadas={atividades}
            aoAlternar={(v) => setAtividades(alternarEm(atividades, v))}
          />
          <input
            className="t-input"
            value={atividadeTexto}
            onChange={(e) => setAtividadeTexto(e.target.value)}
            placeholder="Outra atividade? Escreva aqui."
          />
        </>
      )}

      {passo === 'pensamento' && (
        <>
          <div className="t-pergunta">O que passou pela sua cabeça?</div>
          <p className="t-dica">Escreva o pensamento como ele veio, sem corrigir e sem julgar.</p>
          <textarea
            className="t-input"
            value={pensamento}
            onChange={(e) => setPensamento(e.target.value)}
            placeholder="Escreva aqui..."
          />
        </>
      )}

      {passo === 'corpo' && (
        <>
          <div className="t-pergunta">E no corpo, onde você sentiu?</div>
          <p className="t-dica">O corpo fala antes da mente perceber.</p>
          <Chips
            opcoes={CORPO}
            selecionadas={corpo}
            aoAlternar={(v) => setCorpo(alternarEm(corpo, v))}
          />
        </>
      )}

      {passo === 'acao' && (
        <>
          <div className="t-pergunta">O que você fez com isso?</div>
          <p className="t-dica">A ação que você tomou, ou a que não tomou. As duas contam.</p>
          <textarea
            className="t-input"
            value={acao}
            onChange={(e) => setAcao(e.target.value)}
            placeholder="Escreva aqui..."
          />
          <button
            className={`flag-sessao${falarNaSessao ? '' : ' inativa'}`}
            style={{ marginTop: 16 }}
            onClick={() => setFalarNaSessao(!falarNaSessao)}
          >
            ✦ Quero falar disso na sessão
          </button>
        </>
      )}

      <div className="rodape-wizard">
        <button className="t-btn fantasma" onClick={() => irPara(-1)}>
          Voltar
        </button>
        {opcional && !ultimo && (
          <button className="t-btn fantasma" onClick={() => irPara(1)}>
            Pular
          </button>
        )}
        <button
          className="t-btn"
          disabled={!podeAvancar || salvando}
          onClick={() => (ultimo ? void salvar() : irPara(1))}
        >
          {ultimo ? 'Salvar' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}
