import type { JSX } from 'react'
import { CORES_HUMOR } from '../dados'

const NOMES_MES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

// Dias coloridos pelo humor médio, do sage ao dourado. Dia sem registro
// fica creme: ausência não é falha, não ganha cor de alerta.
export function Calendario({
  mes,
  porDia,
}: {
  mes: string
  porDia: Record<string, number>
}) {
  const [ano, numeroMes] = mes.split('-').map(Number)
  const primeiro = new Date(ano, numeroMes - 1, 1)
  const totalDias = new Date(ano, numeroMes, 0).getDate()
  // Semana começa na segunda, como no layout aprovado (S T Q Q S S D).
  const desloca = (primeiro.getDay() + 6) % 7

  const celulas: JSX.Element[] = []
  for (let i = 0; i < desloca; i++) celulas.push(<span key={`v${i}`} className="cal-dia vazio" />)
  for (let dia = 1; dia <= totalDias; dia++) {
    const chave = `${mes}-${String(dia).padStart(2, '0')}`
    const nivel = porDia[chave]
    const cor = nivel ? CORES_HUMOR[nivel] : undefined
    celulas.push(
      <span
        key={dia}
        className="cal-dia"
        style={
          cor
            ? { background: cor, color: nivel && nivel >= 3 ? 'var(--verde)' : '#fff' }
            : undefined
        }
      >
        {dia}
      </span>
    )
  }

  return (
    <div className="cal">
      <b>
        {NOMES_MES[numeroMes - 1]}, colorido pelo seu humor
      </b>
      <div className="cal-grid">
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
          <i key={i}>{d}</i>
        ))}
        {celulas}
      </div>
    </div>
  )
}
