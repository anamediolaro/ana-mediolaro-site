import type { Eu } from '../App'
import { TopoApp } from '../componentes/TopoApp'


// Conquistas chegam na Etapa 3 (recompensas). Por enquanto a tela mostra
// o nível e as estrelas reais, que já são creditadas a cada registro.
const MEDALHAS = [
  {
    nome: 'Primeiro registro',
    icone: <path d="M5 13l4 4L19 7" />,
  },
  {
    nome: 'Semana com 3 registros',
    icone: (
      <>
        <path d="M4 20 Q12 4 20 20" />
        <circle cx="12" cy="9" r="1.4" />
      </>
    ),
  },
  {
    nome: 'Você voltou',
    icone: (
      <>
        <path d="M12 20V8" />
        <path d="M7 13l5-5 5 5" />
      </>
    ),
  },
  {
    nome: 'Primeira palavra sua',
    icone: <path d="M4 7h16M4 12h10M4 17h7" />,
  },
  {
    nome: '30 registros',
    icone: <circle cx="12" cy="12" r="8" />,
  },
  {
    nome: 'Primeira tarefa',
    icone: <rect x="5" y="5" width="14" height="14" rx="3" />,
  },
]

export function Estrelas({ eu }: { eu: Eu }) {
  const { total, nivel, proximoNivel, faltam, progresso } = eu.estrelas
  return (
    <div className="tela">
      <TopoApp />
      <div className="t-h1">
        Suas <em>estrelas</em>
      </div>
      <div className="nivel-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="nm">{nivel}</span>
          <span style={{ fontSize: 15 }}>
            <span className="estrela">✦</span> {total}
          </span>
        </div>
        <div className="trilho">
          <div className="pr" style={{ width: `${progresso}%` }} />
        </div>
        {proximoNivel && faltam !== null ? (
          <small>
            {faltam} {faltam === 1 ? 'estrela' : 'estrelas'} para o nível {proximoNivel}
          </small>
        ) : (
          <small>Você chegou ao nível mais alto.</small>
        )}
      </div>
      <div className="t-label">Conquistas</div>
      <div className="medalhas">
        {MEDALHAS.map((medalha) => (
          <div key={medalha.nome} className="medalha off">
            <div className="ico">
              <svg viewBox="0 0 24 24">{medalha.icone}</svg>
            </div>
            <span>{medalha.nome}</span>
          </div>
        ))}
      </div>
      <p className="t-sub" style={{ marginTop: 14 }}>
        Cada registro vale 1 estrela, completo ou parcial. Estrelas nunca expiram e nunca são
        descontadas.
      </p>
    </div>
  )
}
