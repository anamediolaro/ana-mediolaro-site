// Assistente de RPD (registro de pensamento disfuncional).
// Princípios inegociáveis, na ordem: segurança acima de tudo, um trilho
// só (as 7 etapas do RPD), falha segura (sem API, o app oferece as
// técnicas sem IA). O roteiro socrático é fixo; a IA apenas adapta a
// linguagem à resposta do paciente.

export const ETAPAS = [
  {
    campo: 'situacao',
    etiqueta: 'Situação',
    pergunta:
      'Vamos começar pela cena. O que aconteceu? Descreva a situação em uma ou duas frases, como se descrevesse uma foto.',
  },
  {
    campo: 'emocao',
    etiqueta: 'Emoção',
    pergunta:
      'Que emoção veio com essa situação? E de 0 a 100, qual a intensidade dela agora?',
  },
  {
    campo: 'pensamento_automatico',
    etiqueta: 'Pensamento automático',
    pergunta:
      'Qual pensamento passou pela sua cabeça naquele momento? Escreva do jeito que ele veio, sem corrigir.',
  },
  {
    campo: 'evidencias_favor',
    etiqueta: 'Evidências a favor',
    pergunta:
      'Agora vamos olhar esse pensamento de perto. Que fatos concretos sustentam esse pensamento? Fatos, não impressões.',
  },
  {
    campo: 'evidencias_contra',
    etiqueta: 'Evidências contra',
    pergunta:
      'E que fatos falam contra ele? Algo que já aconteceu e não confirma esse pensamento.',
  },
  {
    campo: 'pensamento_alternativo',
    etiqueta: 'Pensamento alternativo',
    pergunta:
      'Olhando as evidências dos dois lados, que outra forma de ver essa situação seria mais justa com os fatos?',
  },
  {
    campo: 'reavaliacao',
    etiqueta: 'Reavaliação',
    pergunta:
      'Releia o que você escreveu até aqui. De 0 a 100, qual a intensidade da emoção agora?',
  },
] as const

// Detector de risco, frente 1: palavras-chave. Errar para o lado da
// segurança é aceitável; interromper à toa custa pouco, não interromper
// custa muito.
const PALAVRAS_RISCO = [
  'me matar',
  'me mate',
  'suicidio',
  'suicídio',
  'suicida',
  'tirar minha vida',
  'tirar a minha vida',
  'acabar com tudo',
  'acabar com a minha vida',
  'me machucar',
  'me cortar',
  'me ferir',
  'me jogar da',
  'me jogar de',
  'nao aguento mais viver',
  'não aguento mais viver',
  'nao quero mais viver',
  'não quero mais viver',
  'queria estar morto',
  'queria estar morta',
  'melhor sem mim',
  'sumir de vez',
  'dar fim na minha vida',
  'automutilacao',
  'automutilação',
]

export function detectarRiscoPorPalavras(texto: string): boolean {
  const normalizado = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  return PALAVRAS_RISCO.some((p) =>
    normalizado.includes(p.normalize('NFD').replace(/[̀-ͯ]/g, ''))
  )
}

const SISTEMA = `Você é o assistente do Diário das Emoções, um aplicativo usado por pacientes de uma psicóloga entre as sessões.

Sua única função é conduzir UM exercício, e somente um: o registro de pensamento disfuncional (RPD), em 7 etapas fixas: Situação, Emoção e intensidade, Pensamento automático, Evidências a favor, Evidências contra, Pensamento alternativo, Reavaliação da intensidade.

PROIBIÇÕES ABSOLUTAS, sem exceção:
- Não diagnosticar, não rotular, não interpretar o paciente.
- Não aconselhar fora do fluxo do RPD. Nenhuma recomendação de vida, relacionamento, trabalho, medicação ou tratamento.
- Não conversar sobre outros assuntos. Se o paciente fugir do exercício, redirecione com gentileza para a etapa atual.
- Não se apresentar como psicóloga, como Ana, como terapeuta ou como profissional de saúde. Você é "o assistente do Diário das Emoções".
- Não usar travessão nos textos. Use vírgula, dois pontos, ponto ou parênteses.
- Não usar jargão de autoajuda ("jornada", "desbloquear", "mergulhar fundo").

ESTILO: frases curtas, tom acolhedor sem ser meloso, português do Brasil. Uma pergunta por vez. Nunca mais de 3 frases por resposta.

TAREFA A CADA TURNO: você recebe a etapa atual, a pergunta fixa da etapa e a resposta do paciente. Avalie:
1. RISCO: se a mensagem indicar qualquer ideação de se machucar, se matar ou desistir de viver, marque risco=true. Na dúvida, marque risco=true.
2. Se a resposta do paciente responde a pergunta da etapa: avancar=true. Se a etapa pede intensidade (0 a 100), extraia o número em "intensidade".
3. Componha "resposta": se avancar=true, uma frase curta validando o que o paciente trouxe (sem interpretar) seguida da PRÓXIMA pergunta fixa, adaptada com naturalidade à linguagem dele. Se avancar=false, um pedido de esclarecimento gentil que traga o paciente de volta à pergunta da etapa atual.

FORMATO DA SAÍDA: somente JSON válido, nada antes ou depois:
{"risco": boolean, "avancar": boolean, "intensidade": number | null, "resposta": string}`

type SaidaIa = {
  risco: boolean
  avancar: boolean
  intensidade: number | null
  resposta: string
}

export type TurnoHistorico = { papel: 'assistente' | 'paciente'; texto: string }

export async function conduzirEtapa(opcoes: {
  apiKey: string | undefined
  modelo: string
  etapa: number
  textoPaciente: string
  historico: TurnoHistorico[]
}): Promise<SaidaIa | { indisponivel: true }> {
  if (!opcoes.apiKey) return { indisponivel: true }

  const atual = ETAPAS[opcoes.etapa]
  const proxima = ETAPAS[opcoes.etapa + 1] ?? null

  const contexto = `ETAPA ATUAL (${opcoes.etapa + 1} de 7): ${atual.etiqueta}
PERGUNTA FIXA DA ETAPA: ${atual.pergunta}
PRÓXIMA PERGUNTA FIXA (use se avancar=true): ${
    proxima ? `${proxima.etiqueta}: ${proxima.pergunta}` : 'não há; o exercício termina aqui. Encerre agradecendo em uma frase, sem pergunta.'
  }`

  const mensagens = [
    ...opcoes.historico.slice(-12).map((t) => ({
      role: t.papel === 'paciente' ? 'user' : 'assistant',
      content: t.texto.slice(0, 2000),
    })),
    { role: 'user', content: `${contexto}\n\nRESPOSTA DO PACIENTE: ${opcoes.textoPaciente.slice(0, 2000)}` },
  ]

  try {
    const resposta = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': opcoes.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: opcoes.modelo,
        max_tokens: 400,
        system: SISTEMA,
        messages: mensagens,
      }),
    })
    if (!resposta.ok) return { indisponivel: true }
    const corpo = (await resposta.json()) as { content?: { type: string; text?: string }[] }
    const texto = corpo.content?.find((b) => b.type === 'text')?.text ?? ''
    const json = texto.slice(texto.indexOf('{'), texto.lastIndexOf('}') + 1)
    const saida = JSON.parse(json) as SaidaIa
    if (
      typeof saida.risco !== 'boolean' ||
      typeof saida.avancar !== 'boolean' ||
      typeof saida.resposta !== 'string' ||
      !saida.resposta.trim()
    ) {
      return { indisponivel: true }
    }
    return saida
  } catch {
    // Falha segura: API fora do ar ou resposta malformada encerra o
    // assistente; o app oferece as técnicas sem IA.
    return { indisponivel: true }
  }
}

export async function registrarEventoRisco(
  db: D1Database,
  pacienteId: string,
  origem: 'palavra_chave' | 'classificador'
): Promise<void> {
  await db
    .prepare(`INSERT INTO evento_risco (id, paciente_id, origem) VALUES (?, ?, ?)`)
    .bind(crypto.randomUUID(), pacienteId, origem)
    .run()
}
