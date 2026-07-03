import { Hono } from 'hono'
import type { Env, Vars } from './tipos'
import { exigePaciente, pacientePorToken } from './auth'
import { premiarRegistro, premiarTarefa, nivelPorEstrelas } from './estrelas'
import { verificarConquistasDeRegistro, verificarConquistaDeTarefa } from './conquistas'
import { calcularPadroes } from './padroes'
import { pro } from './pro'

const app = new Hono<{ Bindings: Env; Variables: Vars }>()

// ---------------------------------------------------------------------------
// Entrada pelo link único do WhatsApp: valida o token, entrega uma página
// mínima que guarda a credencial no aparelho e segue para o app com a URL
// limpa. O token não permanece na barra de endereço nem em chamadas GET.
// ---------------------------------------------------------------------------
app.get('/e/:token', async (c) => {
  const token = c.req.param('token')
  const paciente = await pacientePorToken(c.env.DB, token)
  if (!paciente) {
    return c.html(
      `<!doctype html><html lang="pt-BR"><meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <body style="font-family:sans-serif;background:#F0EBDF;color:#2A3530;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
      <p style="max-width:280px;text-align:center;line-height:1.6">Este link não é mais válido. Fale com a sua psicóloga para receber um novo.</p>
      </body></html>`,
      404
    )
  }
  await c.env.DB.prepare(`UPDATE paciente SET ultimo_acesso_em = datetime('now') WHERE id = ?`)
    .bind(paciente.id)
    .run()
  return c.html(
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8">
    <script>
      localStorage.setItem('diario_token', ${JSON.stringify(token)});
      location.replace('/');
    </script></html>`
  )
})

// Manifest por paciente: o app instalado na tela de início reabre pelo
// link autenticado (no iPhone o app instalado não compartilha dados com
// o Safari; sem isso ele abriria deslogado).
app.get('/manifest.webmanifest', async (c) => {
  const t = c.req.query('t') ?? ''
  const paciente = t ? await pacientePorToken(c.env.DB, t) : null
  const manifest = {
    name: 'Diário das Emoções',
    short_name: 'Diário',
    description: 'Diário das Emoções · Ana Mediolaro',
    start_url: paciente ? `/e/${t}` : '/',
    display: 'standalone',
    background_color: '#F0EBDF',
    theme_color: '#2A3530',
    icons: [
      { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
  return c.json(manifest, 200, { 'Content-Type': 'application/manifest+json' })
})

// ---------------------------------------------------------------------------
// API do paciente. Tudo abaixo passa pelo middleware: o paciente é o dono
// do token, e toda consulta é filtrada pelo id resolvido no servidor.
// ---------------------------------------------------------------------------
const api = new Hono<{ Bindings: Env; Variables: Vars }>()
api.use('*', exigePaciente())

api.get('/eu', async (c) => {
  const paciente = c.get('paciente')
  const hoje = (c.req.query('hoje') ?? '').slice(0, 10)

  const ultimo = await c.env.DB.prepare(
    `SELECT id, timestamp, nivel, emocoes, emocoes_livres, falar_na_sessao
     FROM registro WHERE paciente_id = ? ORDER BY timestamp DESC LIMIT 1`
  )
    .bind(paciente.id)
    .first<Record<string, unknown>>()

  let registrosHoje = 0
  if (hoje) {
    const n = await c.env.DB.prepare(
      `SELECT COUNT(*) AS n FROM registro WHERE paciente_id = ? AND substr(timestamp,1,10) = ?`
    )
      .bind(paciente.id, hoje)
      .first<{ n: number }>()
    registrosHoje = n?.n ?? 0
  }

  let diasDesdeUltimo: number | null = null
  if (ultimo && hoje) {
    const diaUltimo = String(ultimo.timestamp).slice(0, 10)
    diasDesdeUltimo = Math.round((Date.parse(hoje) - Date.parse(diaUltimo)) / 86400000)
  }

  const pontos = await c.env.DB.prepare(
    `SELECT estrelas_total, nivel_atual FROM pontuacao WHERE paciente_id = ?`
  )
    .bind(paciente.id)
    .first<{ estrelas_total: number; nivel_atual: string }>()
  const total = pontos?.estrelas_total ?? 0
  const { atual, proximo } = nivelPorEstrelas(total)

  const tarefas = await c.env.DB.prepare(
    `SELECT COUNT(*) AS n FROM tarefa WHERE paciente_id = ? AND status = 'pendente'`
  )
    .bind(paciente.id)
    .first<{ n: number }>()

  const conquistas = await c.env.DB.prepare(
    `SELECT tipo, desbloqueada_em FROM conquista WHERE paciente_id = ? ORDER BY desbloqueada_em`
  )
    .bind(paciente.id)
    .all()

  return c.json({
    nome: paciente.nome,
    tarefasPendentes: tarefas?.n ?? 0,
    conquistas: conquistas.results ?? [],
    consentiu: Boolean(paciente.consentimento_em),
    ultimoRegistro: ultimo ?? null,
    registrosHoje,
    diasDesdeUltimo,
    estrelas: {
      total,
      nivel: atual.nome,
      proximoNivel: proximo?.nome ?? null,
      faltam: proximo ? proximo.min - total : null,
      progresso: proximo
        ? Math.round(((total - atual.min) / (proximo.min - atual.min)) * 100)
        : 100,
    },
  })
})

api.post('/consentimento', async (c) => {
  const paciente = c.get('paciente')
  const corpo = await c.req.json<{ nome?: string }>().catch(() => ({}) as { nome?: string })
  const nome = (corpo.nome ?? '').trim()
  await c.env.DB.prepare(
    `UPDATE paciente SET consentimento_em = COALESCE(consentimento_em, datetime('now')),
       nome = CASE WHEN ? != '' THEN ? ELSE nome END
     WHERE id = ?`
  )
    .bind(nome, nome, paciente.id)
    .run()
  return c.json({ ok: true })
})

api.get('/emocoes-pessoais', async (c) => {
  const paciente = c.get('paciente')
  const linhas = await c.env.DB.prepare(
    `SELECT palavra FROM emocao_pessoal WHERE paciente_id = ? ORDER BY criado_em`
  )
    .bind(paciente.id)
    .all<{ palavra: string }>()
  return c.json({ palavras: (linhas.results ?? []).map((l) => l.palavra) })
})

api.get('/registros', async (c) => {
  const paciente = c.get('paciente')
  const limite = Math.min(Number(c.req.query('limite') ?? 100), 200)
  const linhas = await c.env.DB.prepare(
    `SELECT id, timestamp, nivel, emocoes, emocoes_livres, atividades,
            atividade_texto, pensamento, corpo, acao, sono, falar_na_sessao
     FROM registro WHERE paciente_id = ?
     ORDER BY timestamp DESC LIMIT ?`
  )
    .bind(paciente.id, limite)
    .all()
  return c.json({ registros: linhas.results ?? [] })
})

const listaDe = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).slice(0, 30) : []

api.post('/registros', async (c) => {
  const paciente = c.get('paciente')
  const corpo = await c.req.json<Record<string, unknown>>().catch(() => null)
  if (!corpo) return c.json({ erro: 'corpo_invalido' }, 400)

  const id = typeof corpo.id === 'string' && /^[0-9a-f-]{36}$/i.test(corpo.id)
    ? corpo.id
    : crypto.randomUUID()
  const nivel = Number(corpo.nivel)
  const timestamp = String(corpo.timestamp ?? '')
  const emocoes = listaDe(corpo.emocoes)
  const emocoesLivres = listaDe(corpo.emocoesLivres)

  if (!Number.isInteger(nivel) || nivel < 1 || nivel > 5)
    return c.json({ erro: 'nivel_invalido' }, 400)
  if (emocoes.length + emocoesLivres.length === 0)
    return c.json({ erro: 'emocao_obrigatoria' }, 400)
  if (!/^\d{4}-\d{2}-\d{2}T/.test(timestamp))
    return c.json({ erro: 'timestamp_invalido' }, 400)

  // Sync offline reenvia o mesmo UUID: se já existe e é deste paciente,
  // responde como sucesso sem duplicar. Se pertence a outro, recusa.
  const existente = await c.env.DB.prepare(
    `SELECT paciente_id FROM registro WHERE id = ?`
  )
    .bind(id)
    .first<{ paciente_id: string }>()
  if (existente && existente.paciente_id !== paciente.id)
    return c.json({ erro: 'conflito' }, 409)

  // Intervalo até o registro anterior, medido antes de gravar: 7+ dias
  // desbloqueia a conquista "Você voltou".
  const anterior = await c.env.DB.prepare(
    `SELECT MAX(substr(timestamp, 1, 10)) AS dia FROM registro WHERE paciente_id = ?`
  )
    .bind(paciente.id)
    .first<{ dia: string | null }>()
  const diasDesdeAnterior = anterior?.dia
    ? Math.round((Date.parse(timestamp.slice(0, 10)) - Date.parse(anterior.dia)) / 86400000)
    : null

  if (!existente) {
    await c.env.DB.prepare(
      `INSERT INTO registro (id, paciente_id, timestamp, nivel, emocoes, emocoes_livres,
         atividades, atividade_texto, pensamento, corpo, acao, sono, falar_na_sessao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        paciente.id,
        timestamp,
        nivel,
        JSON.stringify(emocoes),
        JSON.stringify(emocoesLivres),
        JSON.stringify(listaDe(corpo.atividades)),
        typeof corpo.atividadeTexto === 'string' ? corpo.atividadeTexto.trim() || null : null,
        typeof corpo.pensamento === 'string' ? corpo.pensamento.trim() || null : null,
        JSON.stringify(listaDe(corpo.corpo)),
        typeof corpo.acao === 'string' ? corpo.acao.trim() || null : null,
        typeof corpo.sono === 'string' && corpo.sono ? corpo.sono : null,
        corpo.falarNaSessao ? 1 : 0
      )
      .run()

    // O vocabulário do paciente é dado clínico: cada palavra vira um chip
    // pessoal, preservada exatamente como ele escreveu.
    for (const palavra of emocoesLivres) {
      await c.env.DB.prepare(
        `INSERT INTO emocao_pessoal (id, paciente_id, palavra)
         VALUES (?, ?, ?) ON CONFLICT(paciente_id, palavra) DO NOTHING`
      )
        .bind(crypto.randomUUID(), paciente.id, palavra)
        .run()
    }
  }

  const dia = timestamp.slice(0, 10)
  const diasSemana = await c.env.DB.prepare(
    `SELECT COUNT(DISTINCT substr(timestamp,1,10)) AS n
     FROM registro
     WHERE paciente_id = ?
       AND substr(timestamp,1,10) >= date(?, '-6 days')
       AND substr(timestamp,1,10) <= ?`
  )
    .bind(paciente.id, dia, dia)
    .first<{ n: number }>()

  const estrelas = await premiarRegistro(
    c.env.DB,
    paciente.id,
    id,
    new Date(dia + 'T12:00:00Z'),
    diasSemana?.n ?? 1
  )

  const conquistasNovas = existente
    ? []
    : await verificarConquistasDeRegistro(c.env.DB, paciente.id, {
        escreveuPalavraPropria: emocoesLivres.length > 0,
        diasDesdeAnterior,
      })

  // Fechar o ciclo com ação: humor 1 ou 2 oferece (nunca impõe) um áudio
  // da Ana mapeado pelas emoções marcadas.
  let audioSugerido: Record<string, unknown> | null = null
  if (nivel <= 2) {
    const audios = await c.env.DB.prepare(
      `SELECT id, titulo, emocoes_associadas, duracao_seg FROM audio`
    ).all<{ id: string; titulo: string; emocoes_associadas: string; duracao_seg: number | null }>()
    const marcadas = [...emocoes, ...emocoesLivres].map((e) => e.toLowerCase())
    for (const a of audios.results ?? []) {
      const associadas = (JSON.parse(a.emocoes_associadas) as string[]).map((e) =>
        e.toLowerCase()
      )
      if (associadas.some((e) => marcadas.some((m) => m.includes(e) || e.includes(m)))) {
        audioSugerido = { id: a.id, titulo: a.titulo, duracaoSeg: a.duracao_seg }
        break
      }
    }
  }

  return c.json({ ok: true, id, estrelas, audioSugerido, conquistasNovas })
})

api.patch('/registros/:id/sessao', async (c) => {
  const paciente = c.get('paciente')
  const corpo = await c.req.json<{ falar?: boolean }>().catch(() => ({}) as { falar?: boolean })
  const resultado = await c.env.DB.prepare(
    `UPDATE registro SET falar_na_sessao = ? WHERE id = ? AND paciente_id = ?`
  )
    .bind(corpo.falar ? 1 : 0, c.req.param('id'), paciente.id)
    .run()
  if (!resultado.meta.changes) return c.json({ erro: 'nao_encontrado' }, 404)
  return c.json({ ok: true })
})

// Tarefas terapêuticas do lado do paciente: ele vê as orientações e
// responde. A anotação da terapeuta nunca aparece aqui.
api.get('/tarefas', async (c) => {
  const paciente = c.get('paciente')
  const tarefas = await c.env.DB.prepare(
    `SELECT id, titulo, orientacoes, resposta_paciente, respondida_em, status, criado_em
     FROM tarefa WHERE paciente_id = ? ORDER BY status DESC, criado_em DESC`
  )
    .bind(paciente.id)
    .all()
  return c.json({ tarefas: tarefas.results ?? [] })
})

api.post('/tarefas/:id/resposta', async (c) => {
  const paciente = c.get('paciente')
  const corpo = await c.req.json<{ texto?: string }>().catch(() => ({}) as { texto?: string })
  const texto = (corpo.texto ?? '').trim()
  if (!texto) return c.json({ erro: 'texto_obrigatorio' }, 400)
  const resultado = await c.env.DB.prepare(
    `UPDATE tarefa SET resposta_paciente = ?, respondida_em = datetime('now'), status = 'respondida'
     WHERE id = ? AND paciente_id = ?`
  )
    .bind(texto, c.req.param('id'), paciente.id)
    .run()
  if (!resultado.meta.changes) return c.json({ erro: 'nao_encontrado' }, 404)
  const estrelas = await premiarTarefa(c.env.DB, paciente.id, c.req.param('id'))
  const conquistasNovas = await verificarConquistaDeTarefa(c.env.DB, paciente.id)
  return c.json({ ok: true, estrelas, conquistasNovas })
})

api.get('/padroes', async (c) => {
  const paciente = c.get('paciente')
  const mes = /^\d{4}-\d{2}$/.test(c.req.query('mes') ?? '')
    ? (c.req.query('mes') as string)
    : new Date().toISOString().slice(0, 7)
  return c.json(await calcularPadroes(c.env.DB, paciente.id, mes))
})

// A área profissional é montada antes: o middleware de paciente do
// grupo /api usa curinga e não pode interceptar /api/pro.
app.route('/api/pro', pro)
app.route('/api', api)

export default app
