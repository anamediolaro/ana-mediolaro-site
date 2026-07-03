// Web Push para lembretes do paciente e alertas da terapeuta.
// Sem dado clínico no conteúdo da notificação: o texto é neutro e o
// aparelho só abre o app.
import { buildPushPayload, type PushSubscription } from '@block65/webcrypto-web-push'

export type EnvPush = {
  VAPID_PUBLIC_KEY?: string
  VAPID_PRIVATE_KEY?: string
  VAPID_SUBJECT?: string
}

export function pushConfigurado(env: EnvPush): boolean {
  return Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY)
}

type LinhaInscricao = {
  id: string
  endpoint: string
  chave_p256dh: string
  chave_auth: string
}

export async function enviarPush(
  env: EnvPush,
  db: D1Database,
  inscricao: LinhaInscricao,
  mensagem: { titulo: string; corpo: string }
): Promise<void> {
  if (!pushConfigurado(env)) return
  const sub: PushSubscription = {
    endpoint: inscricao.endpoint,
    expirationTime: null,
    keys: { p256dh: inscricao.chave_p256dh, auth: inscricao.chave_auth },
  }
  try {
    const payload = await buildPushPayload(
      { data: JSON.stringify(mensagem), options: { ttl: 3600 } },
      sub,
      {
        subject: env.VAPID_SUBJECT ?? 'mailto:ana.mediolaro@gmail.com',
        publicKey: env.VAPID_PUBLIC_KEY!,
        privateKey: env.VAPID_PRIVATE_KEY!,
      }
    )
    const resposta = await fetch(inscricao.endpoint, payload as unknown as RequestInit)
    // Inscrição morta (aparelho trocou, permissão revogada): remove.
    if (resposta.status === 404 || resposta.status === 410) {
      await db.prepare(`DELETE FROM push_subscription WHERE id = ?`).bind(inscricao.id).run()
    }
  } catch {
    // Push é melhor esforço: falha não pode derrubar o fluxo principal.
  }
}

// Textos acolhedores e variados, nunca alarmistas. Nada de "você não
// registrou hoje!".
const TEXTOS_LEMBRETE = [
  'Um minuto para você. Como está agora?',
  'Um respiro no meio do dia. Quer registrar como está?',
  'Seu diário está aqui, quando você quiser.',
]

export async function dispararLembretes(env: EnvPush, db: D1Database): Promise<number> {
  if (!pushConfigurado(env)) return 0

  // Hora local de São Paulo, arredondada para baixo em blocos de 15 min.
  const agora = new Date()
  const sp = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(agora)
  const [hora, minuto] = sp.split(':').map(Number)
  const bloco = `${String(hora).padStart(2, '0')}:${String(Math.floor(minuto / 15) * 15).padStart(2, '0')}`

  const lembretes = await db
    .prepare(
      `SELECT l.paciente_id, l.horarios FROM lembrete l
       JOIN paciente p ON p.id = l.paciente_id AND p.arquivado = 0
       WHERE l.frequencia > 0`
    )
    .all<{ paciente_id: string; horarios: string }>()

  let enviados = 0
  for (const lembrete of lembretes.results ?? []) {
    const horarios = (JSON.parse(lembrete.horarios) as string[]).map((h) => {
      const [hh, mm] = h.split(':').map(Number)
      return `${String(hh).padStart(2, '0')}:${String(Math.floor(mm / 15) * 15).padStart(2, '0')}`
    })
    if (!horarios.includes(bloco)) continue

    const inscricoes = await db
      .prepare(
        `SELECT id, endpoint, chave_p256dh, chave_auth FROM push_subscription
         WHERE paciente_id = ?`
      )
      .bind(lembrete.paciente_id)
      .all<LinhaInscricao>()
    const texto = TEXTOS_LEMBRETE[(hora + enviados) % TEXTOS_LEMBRETE.length]
    for (const inscricao of inscricoes.results ?? []) {
      await enviarPush(env, db, inscricao, { titulo: 'Diário das Emoções', corpo: texto })
      enviados += 1
    }
  }
  return enviados
}

// Alerta de risco para a terapeuta: conteúdo neutro, sem nome de
// paciente e sem dado clínico no canal externo.
export async function notificarTerapeutaRisco(env: EnvPush, db: D1Database): Promise<void> {
  const inscricoes = await db
    .prepare(
      `SELECT id, endpoint, chave_p256dh, chave_auth FROM push_subscription
       WHERE terapeuta_id IS NOT NULL`
    )
    .all<LinhaInscricao>()
  for (const inscricao of inscricoes.results ?? []) {
    await enviarPush(env, db, inscricao, {
      titulo: 'Diário das Emoções',
      corpo: 'Novo evento no painel. Abra a área profissional.',
    })
  }
}
