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

// Conquistas: rótulo, desenho da medalha (paths SVG em viewBox 24) e o
// texto do cartão compartilhável. {chaves} viram itálico dourado. Zero
// dado clínico nos cartões.
export type InfoConquista = {
  tipo: string
  rotulo: string
  paths: string[]
  cartao: string
  arquivo: string
}

export const CONQUISTAS: InfoConquista[] = [
  {
    tipo: 'primeiro_registro',
    rotulo: 'Primeiro registro',
    paths: ['M5 13l4 4L19 7'],
    cartao: 'Comecei a treinar minha {saúde mental}.',
    arquivo: 'treinando-saude-mental-primeiro-registro.jpg',
  },
  {
    tipo: 'semana_3',
    rotulo: 'Semana com 3 registros',
    paths: ['M4 20 Q12 4 20 20', 'M12 7.6a1.4 1.4 0 1 0 0 2.8a1.4 1.4 0 1 0 0-2.8'],
    cartao: 'Uma semana treinando minha {saúde mental}.',
    arquivo: 'treinando-saude-mental-uma-semana.jpg',
  },
  {
    tipo: 'voce_voltou',
    rotulo: 'Você voltou',
    paths: ['M12 20V8', 'M7 13l5-5 5 5'],
    cartao: 'Voltei. E voltar também é {treino}.',
    arquivo: 'treinando-saude-mental-voltei.jpg',
  },
  {
    tipo: 'primeira_palavra',
    rotulo: 'Primeira palavra sua',
    paths: ['M4 7h16M4 12h10M4 17h7'],
    cartao: 'Minhas emoções, nas {minhas palavras}.',
    arquivo: 'emocoes-nas-minhas-palavras.jpg',
  },
  {
    tipo: 'registros_10',
    rotulo: '10 registros',
    paths: ['M12 6.5a5.5 5.5 0 1 0 0 11a5.5 5.5 0 1 0 0-11'],
    cartao: '10 registros treinando minha {saúde mental}.',
    arquivo: 'treinando-saude-mental-10-registros.jpg',
  },
  {
    tipo: 'registros_30',
    rotulo: '30 registros',
    paths: ['M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17'],
    cartao: '30 registros treinando minha {saúde mental}.',
    arquivo: 'treinando-saude-mental-30-registros.jpg',
  },
  {
    tipo: 'primeira_tarefa',
    rotulo: 'Primeira tarefa',
    paths: ['M5 5h14v14H5z'],
    cartao: 'Primeira tarefa concluída. Um passo de {cada vez}.',
    arquivo: 'treinando-saude-mental-primeira-tarefa.jpg',
  },
]

export const PATH_ESTRELA = 'M12 3l2.5 5.5L20 9.5l-4 4 1 5.5-5-2.8-5 2.8 1-5.5-4-4 5.5-1z'

// Frase da Ana por nível. A de Consciência veio do layout aprovado; as
// outras são rascunhos aguardando o texto definitivo dela.
export const FRASES_NIVEL: Record<string, string> = {
  'Percepção': 'Você começou a se olhar. Perceber é o primeiro movimento.',
  'Consciência': 'Perceber já era. Agora você nomeia o que sente. É daqui que a mudança parte.',
  'Reprogramação': 'Você já nomeia o que sente. Agora treina novas respostas para velhos gatilhos.',
  'Expansão': 'O que você treinou por dentro começa a aparecer por fora: nas escolhas, nos limites, no descanso.',
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
