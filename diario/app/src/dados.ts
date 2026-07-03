export const EMOCOES_AGRADAVEIS = [
  'Calmo(a)',
  'Grato(a)',
  'Alegre',
  'Confiante',
  'Motivado(a)',
  'Orgulhoso(a)',
  'Aliviado(a)',
  'Esperançoso(a)',
  'Amado(a)',
]

export const EMOCOES_DESAGRADAVEIS = [
  'Ansioso(a)',
  'Triste',
  'Irritado(a)',
  'Frustrado(a)',
  'Culpado(a)',
  'Envergonhado(a)',
  'Sobrecarregado(a)',
  'Com medo',
  'Solitário(a)',
  'Cansado(a)',
  'Impotente',
]

export const ATIVIDADES = [
  'Trabalho',
  'Reunião',
  'Família',
  'Trânsito',
  'Estudos',
  'Exercício',
  'Redes sociais',
  'Descanso',
  'Conversa difícil',
  'Sozinho(a) em casa',
]

export const CORPO = [
  'Cabeça',
  'Garganta',
  'Peito',
  'Coração acelerado',
  'Estômago',
  'Ombros e pescoço',
  'Mãos',
  'Respiração curta',
  'Corpo todo',
  'Não percebi nada',
]

export const SONO = [
  { valor: 'bem', rotulo: 'Dormi bem' },
  { valor: 'mal', rotulo: 'Dormi mal' },
  { valor: 'cansado', rotulo: 'Acordei cansado(a)' },
  { valor: 'insonia', rotulo: 'Insônia' },
]

export const HUMOR = [
  { nivel: 1, rotulo: 'Muito mal' },
  { nivel: 2, rotulo: 'Mal' },
  { nivel: 3, rotulo: 'Neutro' },
  { nivel: 4, rotulo: 'Bem' },
  { nivel: 5, rotulo: 'Muito bem' },
]

export const CORES_HUMOR: Record<number, string> = {
  1: '#8a9187',
  2: '#a8ab98',
  3: '#c3bda4',
  4: '#d5bc8a',
  5: '#C9A566',
}

export function rotuloHumor(nivel: number): string {
  return HUMOR.find((h) => h.nivel === nivel)?.rotulo ?? ''
}

export function saudacao(hora: number): string {
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

// Timestamp local com offset (ex: 2026-07-03T15:04:05-03:00): o dia do
// registro é sempre o dia que o paciente viveu, não o dia em UTC.
export function timestampLocal(data = new Date()): string {
  const p = (n: number, t = 2) => String(Math.abs(n)).padStart(t, '0')
  const offsetMin = -data.getTimezoneOffset()
  const sinal = offsetMin >= 0 ? '+' : '-'
  return (
    `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}` +
    `T${p(data.getHours())}:${p(data.getMinutes())}:${p(data.getSeconds())}` +
    `${sinal}${p(Math.floor(Math.abs(offsetMin) / 60))}:${p(Math.abs(offsetMin) % 60)}`
  )
}

export function diaLocal(data = new Date()): string {
  return timestampLocal(data).slice(0, 10)
}
