import { useState } from 'react'
import { TopoApp } from '../componentes/TopoApp'

const PASSOS = [
  {
    numero: 5,
    texto: 'coisas que você\nconsegue ver',
    sub: 'Olhe ao redor sem pressa.\nNomeie uma de cada vez.',
    botao: 'Vi as 5',
  },
  {
    numero: 4,
    texto: 'coisas que você\nconsegue tocar',
    sub: 'A mesa. A roupa. O próprio braço.\nToque devagar, uma de cada vez.',
    botao: 'Toquei nas 4',
  },
  {
    numero: 3,
    texto: 'sons que você\nconsegue ouvir',
    sub: 'Perto ou longe.\nSó perceba, sem julgar.',
    botao: 'Ouvi os 3',
  },
  {
    numero: 2,
    texto: 'cheiros que você\nconsegue sentir',
    sub: 'O ar, o café, o ambiente.\nO que estiver aí.',
    botao: 'Senti os 2',
  },
  {
    numero: 1,
    texto: 'sabor que você\nconsegue perceber',
    sub: 'Um gole de água conta.',
    botao: 'Percebi',
  },
]

export function Grounding({
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
      <TopoApp direita={fim ? '' : `${indice + 1} de 5`} />
      {fim ? (
        <div className="centro">
          <div className="t-h1">
            Você voltou para o <em>presente</em>.
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
          <div className="grounding-num">{passo.numero}</div>
          <div className="grounding-txt">
            {passo.texto.split('\n').map((linha) => (
              <div key={linha}>{linha}</div>
            ))}
          </div>
          <p className="grounding-sub">
            {passo.sub.split('\n').map((linha) => (
              <span key={linha}>
                {linha}
                <br />
              </span>
            ))}
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
