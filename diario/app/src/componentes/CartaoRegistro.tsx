import { Rosto } from './Rosto'
import { rotuloHumor } from '../dados'

export type Registro = {
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

const lista = (json: string): string[] => {
  try {
    return JSON.parse(json)
  } catch {
    return []
  }
}

export function CartaoRegistro({
  registro,
  aoAlternarSessao,
}: {
  registro: Registro
  aoAlternarSessao?: (id: string, falar: boolean) => void
}) {
  const hora = registro.timestamp.slice(11, 16)
  const emocoes = lista(registro.emocoes)
  const pessoais = lista(registro.emocoes_livres)
  const marcado = Boolean(registro.falar_na_sessao)

  return (
    <div className={`t-card${marcado ? ' destaque-sessao' : ''}`}>
      <div className="linha1">
        <span className="t-nivel">
          <Rosto nivel={registro.nivel} /> {rotuloHumor(registro.nivel)}
        </span>
        <span className="t-hora">{hora}</span>
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
      {registro.pensamento && (
        <div className="t-campo">
          <b>Pensamento</b>
          <p>{registro.pensamento}</p>
        </div>
      )}
      {registro.acao && (
        <div className="t-campo">
          <b>Ação</b>
          <p>{registro.acao}</p>
        </div>
      )}
      {aoAlternarSessao && (
        <button
          className={`flag-sessao${marcado ? '' : ' inativa'}`}
          onClick={() => aoAlternarSessao(registro.id, !marcado)}
        >
          ✦ {marcado ? 'Quero falar disso na sessão' : 'Marcar para a sessão'}
        </button>
      )}
    </div>
  )
}
