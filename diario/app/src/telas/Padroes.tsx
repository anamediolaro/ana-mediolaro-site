import { useEffect, useState } from 'react'
import { api } from '../api'
import { TopoApp } from '../componentes/TopoApp'
import { Calendario } from '../componentes/Calendario'
import { diaLocal } from '../dados'

type DadosPadroes = {
  mes: string
  calendario: Record<string, number>
  humorMedio: number | null
  totalRegistrosMes: number
  melhorSequencia: number
  emocoes: { item: string; vezes: number }[]
  contextos: { item: string; vezes: number }[]
  corpo: { item: string; vezes: number }[]
}

function Barras({ titulo, itens }: { titulo: string; itens: { item: string; vezes: number }[] }) {
  if (!itens.length) return null
  const maximo = itens[0].vezes
  return (
    <div className="t-card">
      <div className="t-label" style={{ marginTop: 0 }}>
        {titulo}
      </div>
      {itens.map(({ item, vezes }) => (
        <div key={item} className="barra-linha">
          <span>{item}</span>
          <div className="barra-trilho">
            <div className="barra-valor" style={{ width: `${(vezes / maximo) * 100}%` }} />
          </div>
          <small>{vezes}</small>
        </div>
      ))}
    </div>
  )
}

export function Padroes() {
  const [dados, setDados] = useState<DadosPadroes | null>(null)
  const mes = diaLocal().slice(0, 7)

  useEffect(() => {
    api
      .padroes(mes)
      .then(setDados)
      .catch(() => {})
  }, [mes])

  return (
    <div className="tela">
      <TopoApp />
      <div className="t-h1">
        Seus <em>padrões</em>
      </div>
      <p className="t-sub">O que se repete tem algo a dizer.</p>
      {dados && (
        <>
          <Calendario mes={dados.mes} porDia={dados.calendario} />
          <div className="t-stats">
            <div className="t-stat">
              <div className="n">{dados.melhorSequencia}</div>
              <div className="l">melhor sequência de dias</div>
            </div>
            <div className="t-stat">
              <div className="n">
                {dados.humorMedio !== null ? dados.humorMedio.toLocaleString('pt-BR') : '·'}
              </div>
              <div className="l">humor médio do mês</div>
            </div>
          </div>
          <Barras titulo="Emoções mais presentes" itens={dados.emocoes} />
          <Barras titulo="Contextos que mais aparecem" itens={dados.contextos} />
          <Barras titulo="Onde o corpo mais sente" itens={dados.corpo} />
          {dados.totalRegistrosMes === 0 && (
            <p className="t-sub" style={{ marginTop: 16 }}>
              Os padrões aparecem conforme você registra. Sem pressa.
            </p>
          )}
        </>
      )}
    </div>
  )
}
