// Rostos da escala de humor: círculo, dois pontos de olho, boca em
// curva. Traço fino, nunca emoji.
const BOCAS: Record<number, string> = {
  1: 'M7 16 q5 -4 10 0',
  2: 'M7.5 15.5 q4.5 -2.5 9 0',
  3: 'M8 14.8 h8',
  4: 'M8 14.5 q4 2.5 8 0',
  5: 'M7 14 q5 4 10 0',
}

const OLHOS_Y: Record<number, number> = { 1: 10.5, 2: 10.3, 3: 10, 4: 10, 5: 9.5 }

export function Rosto({ nivel }: { nivel: number }) {
  const y = OLHOS_Y[nivel] ?? 10
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="9" cy={y} r="0.7" fill="currentColor" stroke="none" />
      <circle cx="15" cy={y} r="0.7" fill="currentColor" stroke="none" />
      <path d={BOCAS[nivel] ?? BOCAS[3]} />
    </svg>
  )
}
