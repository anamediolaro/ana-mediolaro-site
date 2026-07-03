import type { Eu } from '../App'
import { TopoApp } from '../componentes/TopoApp'
import { CONQUISTAS } from '../dados'
import type { PedidoCartao } from './Cartao'

export function Estrelas({
  eu,
  aoCompartilhar,
}: {
  eu: Eu
  aoCompartilhar: (pedido: PedidoCartao) => void
}) {
  const { total, nivel, proximoNivel, faltam, progresso } = eu.estrelas
  const desbloqueadas = new Set(eu.conquistas.map((c) => c.tipo))

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
        {CONQUISTAS.map((medalha) => {
          const aberta = desbloqueadas.has(medalha.tipo)
          return (
            <button
              key={medalha.tipo}
              className={`medalha${aberta ? '' : ' off'}`}
              style={{ cursor: aberta ? 'pointer' : 'default', fontFamily: 'Poppins, sans-serif' }}
              disabled={!aberta}
              onClick={() =>
                aoCompartilhar({
                  texto: medalha.cartao,
                  paths: medalha.paths,
                  arquivo: medalha.arquivo,
                })
              }
            >
              <div className="ico">
                <svg viewBox="0 0 24 24">
                  {medalha.paths.map((p) => (
                    <path key={p} d={p} />
                  ))}
                </svg>
              </div>
              <span>{medalha.rotulo}</span>
            </button>
          )
        })}
      </div>
      {desbloqueadas.size > 0 && (
        <p className="t-sub" style={{ marginTop: 12 }}>
          Toque numa conquista para gerar o cartão e compartilhar, se quiser.
        </p>
      )}
      <p className="t-sub" style={{ marginTop: 10 }}>
        Cada registro vale 1 estrela, completo ou parcial. Estrelas nunca expiram e nunca são
        descontadas.
      </p>
    </div>
  )
}
