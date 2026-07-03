import { useState } from 'react'
import { TopoApp } from '../componentes/TopoApp'

const PASSOS = [
  {
    letra: 'S',
    titulo: 'Pare.',
    sub: 'O que estiver fazendo pode esperar um minuto.',
    botao: 'Parei',
  },
  {
    letra: 'T',
    titulo: 'Respire.',
    sub: 'Fundo e devagar, três vezes. Sinta o ar entrar e sair.',
    botao: 'Respirei',
  },
  {
    letra: 'O',
    titulo: 'Observe.',
    sub: 'O que você sente, onde o corpo sente, o que passou pela cabeça. Só observe.',
    botao: 'Observei',
  },
  {
    letra: 'P',
    titulo: 'Prossiga.',
    sub: 'Volte para o seu dia, um passo de cada vez. Você escolhe o próximo.',
    botao: 'Concluir',
  },
]

export function TecnicaStop({
  aoSair,
  aoRegistrar,
}: {
  aoSair: () => void
  aoRegistrar: () => void
}) {
  const [indice, setIndice] = useState(0)
  const fim = indice >= PASSOS.length
  const passo = PASSOS[Math.min(indice, PASSOS.length - 1)]

  return (
    <div className="tela sem-nav">
      <TopoApp direita={fim ? '' : `${indice + 1} de 4`} />
      {fim ? (
        <div className="centro">
          <div className="t-h1">
            Um passo de cada <em>vez</em>.
          </div>
          <p className="t-sub" style={{ maxWidth: 280 }}>
            Quer registrar como está agora? É opcional.
          </p>
          <button className="t-btn" style={{ width: '100%' }} onClick={aoRegistrar}>
            Registrar como me sinto
          </button>
          <button className="t-btn fantasma" style={{ width: '100%' }} onClick={aoSair}>
            Agora não
          </button>
        </div>
      ) : (
        <>
          <div className="grounding-num">{passo.letra}</div>
          <div className="grounding-txt">{passo.titulo}</div>
          <p className="grounding-sub" style={{ maxWidth: 280, margin: '12px auto 0' }}>
            {passo.sub}
          </p>
          <div style={{ marginTop: 'auto' }}>
            <button className="t-btn" onClick={() => setIndice(indice + 1)}>
              {passo.botao}
            </button>
            <button className="t-btn fantasma" onClick={aoSair}>
              Sair da técnica
            </button>
          </div>
        </>
      )}
    </div>
  )
}
