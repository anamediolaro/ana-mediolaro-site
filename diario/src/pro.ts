import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { Env, Vars, Terapeuta } from './tipos'
import { gerarToken, hashToken, verificarSenha } from './auth'
import { nivelPorEstrelas } from './estrelas'
import { resumoPeriodo } from './padroes'

const SESSAO_DIAS = 14
const COOKIE = 'sessao_pro'

// ---------------------------------------------------------------------------
// Login com bloqueio de tentativas: 5 erros em 15 minutos bloqueiam a
// chave por 15 minutos. Uma conta só, dado de saúde atrás dela.
// ---------------------------------------------------------------------------
async function registrarFalha(db: D1Database, chave: string) {
  await db
    .prepare(
      `INSERT INTO login_tentativa (chave, tentativas, primeira_em)
       VALUES (?, 1, datetime('now'))
       ON CONFLICT(chave) DO UPDATE SET
         tentativas = CASE
           WHEN primeira_em < datetime('now', '-15 minutes') THEN 1
           ELSE tentativas + 1 END,
         primeira_em = CASE
           WHEN primeira_em < datetime('now', '-15 minutes') THEN datetime('now')
           ELSE primeira_em END,
         bloqueado_ate = CASE
           WHEN (CASE WHEN primeira_em < datetime('now', '-15 minutes') THEN 1 ELSE tentativas + 1 END) >= 5
           THEN datetime('now', '+15 minutes') ELSE bloqueado_ate END`
    )
    .bind(chave)
    .run()
}

async function estaBloqueada(db: D1Database, chave: string): Promise<boolean> {
  const linha = await db
    .prepare(
      `SELECT 1 AS bloqueada FROM login_tentativa
       WHERE chave = ? AND bloqueado_ate IS NOT NULL AND bloqueado_ate > datetime('now')`
    )
    .bind(chave)
    .first()
  return Boolean(linha)
}

function exigeTerapeuta() {
  return async (c: Context<{ Bindings: Env; Variables: Vars }>, next: Next) => {
    const token = getCookie(c, COOKIE) ?? ''
    if (!token) return c.json({ erro: 'nao_autorizado' }, 401)
    const hash = await hashToken(token)
    const linha = await c.env.DB.prepare(
      `SELECT t.id, t.nome, t.email, t.contato_emergencia
       FROM sessao_terapeuta s JOIN terapeuta t ON t.id = s.terapeuta_id
       WHERE s.token_hash = ? AND s.expira_em > datetime('now')`
    )
      .bind(hash)
      .first<Terapeuta>()
    if (!linha) return c.json({ erro: 'nao_autorizado' }, 401)
    c.set('terapeuta', linha)
    await next()
  }
}

export const pro = new Hono<{ Bindings: Env; Variables: Vars }>()

pro.post('/entrar', async (c) => {
  const corpo = await c.req
    .json<{ email?: string; senha?: string }>()
    .catch(() => ({}) as { email?: string; senha?: string })
  const email = (corpo.email ?? '').trim().toLowerCase()
  const senha = corpo.senha ?? ''
  if (!email || !senha) return c.json({ erro: 'dados_incompletos' }, 400)

  if (await estaBloqueada(c.env.DB, email)) return c.json({ erro: 'bloqueado' }, 429)

  const terapeuta = await c.env.DB.prepare(
    `SELECT id, nome, email, senha_hash FROM terapeuta WHERE email = ?`
  )
    .bind(email)
    .first<{ id: string; nome: string; email: string; senha_hash: string }>()

  const confere = terapeuta && (await verificarSenha(senha, terapeuta.senha_hash))
  if (!confere) {
    await registrarFalha(c.env.DB, email)
    return c.json({ erro: 'credenciais' }, 401)
  }

  await c.env.DB.prepare(`DELETE FROM login_tentativa WHERE chave = ?`).bind(email).run()
  await c.env.DB.prepare(`DELETE FROM sessao_terapeuta WHERE expira_em <= datetime('now')`).run()

  const token = gerarToken()
  await c.env.DB.prepare(
    `INSERT INTO sessao_terapeuta (token_hash, terapeuta_id, expira_em)
     VALUES (?, ?, datetime('now', '+${SESSAO_DIAS} days'))`
  )
    .bind(await hashToken(token), terapeuta.id)
    .run()

  setCookie(c, COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/api/pro',
    maxAge: SESSAO_DIAS * 86400,
  })
  return c.json({ ok: true, nome: terapeuta.nome })
})

pro.post('/sair', async (c) => {
  const token = getCookie(c, COOKIE) ?? ''
  if (token) {
    await c.env.DB.prepare(`DELETE FROM sessao_terapeuta WHERE token_hash = ?`)
      .bind(await hashToken(token))
      .run()
  }
  deleteCookie(c, COOKIE, { path: '/api/pro' })
  return c.json({ ok: true })
})

pro.use('*', exigeTerapeuta())

pro.get('/sessao', (c) => {
  const t = c.get('terapeuta')
  return c.json({ nome: t.nome, email: t.email })
})

// ---------------------------------------------------------------------------
// Pacientes: lista com alerta de silêncio e destaque de sessão.
// ---------------------------------------------------------------------------
pro.get('/pacientes', async (c) => {
  const arquivados = c.req.query('arquivados') === '1'
  const pacientes = await c.env.DB.prepare(
    `SELECT p.id, p.nome, p.criado_em,
            (SELECT MAX(timestamp) FROM registro r WHERE r.paciente_id = p.id) AS ultimo_registro,
            (SELECT COUNT(*) FROM registro r WHERE r.paciente_id = p.id) AS total_registros,
            (SELECT ROUND(AVG(nivel), 1) FROM registro r
              WHERE r.paciente_id = p.id
                AND substr(r.timestamp, 1, 10) >= date('now', '-30 days')) AS humor_medio_30d,
            (SELECT COUNT(*) FROM registro r
              WHERE r.paciente_id = p.id AND r.falar_na_sessao = 1
                AND r.flag_resolvida_em IS NULL) AS para_sessao
     FROM paciente p WHERE p.arquivado = ?
     ORDER BY para_sessao DESC, ultimo_registro DESC NULLS LAST`
  )
    .bind(arquivados ? 1 : 0)
    .all()
  return c.json({ pacientes: pacientes.results ?? [] })
})

// Convite: o link completo aparece uma vez; no banco fica só o hash.
pro.post('/pacientes', async (c) => {
  const corpo = await c.req.json<{ nome?: string }>().catch(() => ({}) as { nome?: string })
  const nome = (corpo.nome ?? '').trim()
  if (!nome) return c.json({ erro: 'nome_obrigatorio' }, 400)
  const token = gerarToken()
  const id = crypto.randomUUID()
  await c.env.DB.prepare(`INSERT INTO paciente (id, nome, token_hash) VALUES (?, ?, ?)`)
    .bind(id, nome, await hashToken(token))
    .run()
  const origem = new URL(c.req.url).origin
  return c.json({ id, nome, link: `${origem}/e/${token}` })
})

pro.post('/pacientes/:id/regenerar-link', async (c) => {
  const token = gerarToken()
  const resultado = await c.env.DB.prepare(
    `UPDATE paciente SET token_hash = ? WHERE id = ? AND arquivado = 0`
  )
    .bind(await hashToken(token), c.req.param('id'))
    .run()
  if (!resultado.meta.changes) return c.json({ erro: 'nao_encontrado' }, 404)
  const origem = new URL(c.req.url).origin
  return c.json({ link: `${origem}/e/${token}` })
})

pro.patch('/pacientes/:id', async (c) => {
  const corpo = await c.req
    .json<{ arquivado?: boolean }>()
    .catch(() => ({}) as { arquivado?: boolean })
  if (typeof corpo.arquivado !== 'boolean') return c.json({ erro: 'dados_incompletos' }, 400)
  const resultado = await c.env.DB.prepare(`UPDATE paciente SET arquivado = ? WHERE id = ?`)
    .bind(corpo.arquivado ? 1 : 0, c.req.param('id'))
    .run()
  if (!resultado.meta.changes) return c.json({ erro: 'nao_encontrado' }, 404)
  return c.json({ ok: true })
})

// Perfil: nível, estrelas, resumo do período e registros para a sessão.
pro.get('/pacientes/:id', async (c) => {
  const id = c.req.param('id')
  const paciente = await c.env.DB.prepare(
    `SELECT id, nome, criado_em, arquivado, consentimento_em, ultimo_acesso_em
     FROM paciente WHERE id = ?`
  )
    .bind(id)
    .first()
  if (!paciente) return c.json({ erro: 'nao_encontrado' }, 404)

  const dias = Math.min(Number(c.req.query('dias') ?? 30) || 30, 365)
  const desde = new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10)

  const pontos = await c.env.DB.prepare(
    `SELECT estrelas_total FROM pontuacao WHERE paciente_id = ?`
  )
    .bind(id)
    .first<{ estrelas_total: number }>()
  const total = await c.env.DB.prepare(
    `SELECT COUNT(*) AS n FROM registro WHERE paciente_id = ?`
  )
    .bind(id)
    .first<{ n: number }>()
  const conquistas = await c.env.DB.prepare(
    `SELECT tipo, desbloqueada_em FROM conquista WHERE paciente_id = ? ORDER BY desbloqueada_em`
  )
    .bind(id)
    .all()

  const paraSessao = await c.env.DB.prepare(
    `SELECT id, timestamp, nivel, emocoes, emocoes_livres, atividades, atividade_texto,
            pensamento, corpo, acao, sono, falar_na_sessao
     FROM registro
     WHERE paciente_id = ? AND falar_na_sessao = 1 AND flag_resolvida_em IS NULL
     ORDER BY timestamp DESC LIMIT 20`
  )
    .bind(id)
    .all()

  const estrelas = pontos?.estrelas_total ?? 0
  return c.json({
    paciente,
    estrelas: { total: estrelas, nivel: nivelPorEstrelas(estrelas).atual.nome },
    totalRegistros: total?.n ?? 0,
    conquistas: conquistas.results ?? [],
    paraSessao: paraSessao.results ?? [],
    resumo: await resumoPeriodo(c.env.DB, id, desde),
  })
})

// Linha do tempo completa com as anotações da terapeuta (só ela vê).
pro.get('/pacientes/:id/registros', async (c) => {
  const id = c.req.param('id')
  const de = (c.req.query('de') ?? '0000-01-01').slice(0, 10)
  const ate = (c.req.query('ate') ?? '9999-12-31').slice(0, 10)
  const registros = await c.env.DB.prepare(
    `SELECT id, timestamp, nivel, emocoes, emocoes_livres, atividades, atividade_texto,
            pensamento, corpo, acao, sono, falar_na_sessao, flag_resolvida_em
     FROM registro
     WHERE paciente_id = ? AND substr(timestamp, 1, 10) BETWEEN ? AND ?
     ORDER BY timestamp DESC LIMIT 500`
  )
    .bind(id, de, ate)
    .all()

  const anotacoes = await c.env.DB.prepare(
    `SELECT a.id, a.registro_id, a.texto, a.criado_em
     FROM anotacao a JOIN registro r ON r.id = a.registro_id
     WHERE r.paciente_id = ? ORDER BY a.criado_em`
  )
    .bind(id)
    .all()

  return c.json({ registros: registros.results ?? [], anotacoes: anotacoes.results ?? [] })
})

pro.post('/registros/:id/anotacoes', async (c) => {
  const corpo = await c.req.json<{ texto?: string }>().catch(() => ({}) as { texto?: string })
  const texto = (corpo.texto ?? '').trim()
  if (!texto) return c.json({ erro: 'texto_obrigatorio' }, 400)
  const registro = await c.env.DB.prepare(`SELECT id FROM registro WHERE id = ?`)
    .bind(c.req.param('id'))
    .first()
  if (!registro) return c.json({ erro: 'nao_encontrado' }, 404)
  const id = crypto.randomUUID()
  await c.env.DB.prepare(`INSERT INTO anotacao (id, registro_id, texto) VALUES (?, ?, ?)`)
    .bind(id, c.req.param('id'), texto)
    .run()
  return c.json({ ok: true, id })
})

// Depois da sessão a Ana marca o registro como visto: ele sai do topo
// sem apagar nada do histórico.
pro.patch('/registros/:id/flag-resolvida', async (c) => {
  const resultado = await c.env.DB.prepare(
    `UPDATE registro SET flag_resolvida_em = datetime('now')
     WHERE id = ? AND falar_na_sessao = 1 AND flag_resolvida_em IS NULL`
  )
    .bind(c.req.param('id'))
    .run()
  if (!resultado.meta.changes) return c.json({ erro: 'nao_encontrado' }, 404)
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// Tarefas terapêuticas: a Ana cria e anota; o paciente responde pelo app.
// ---------------------------------------------------------------------------
pro.get('/pacientes/:id/tarefas', async (c) => {
  const tarefas = await c.env.DB.prepare(
    `SELECT id, titulo, orientacoes, resposta_paciente, respondida_em,
            anotacao_terapeuta, status, criado_em
     FROM tarefa WHERE paciente_id = ? ORDER BY criado_em DESC`
  )
    .bind(c.req.param('id'))
    .all()
  return c.json({ tarefas: tarefas.results ?? [] })
})

pro.post('/pacientes/:id/tarefas', async (c) => {
  const corpo = await c.req
    .json<{ titulo?: string; orientacoes?: string }>()
    .catch(() => ({}) as { titulo?: string; orientacoes?: string })
  const titulo = (corpo.titulo ?? '').trim()
  if (!titulo) return c.json({ erro: 'titulo_obrigatorio' }, 400)
  const paciente = await c.env.DB.prepare(`SELECT id FROM paciente WHERE id = ?`)
    .bind(c.req.param('id'))
    .first()
  if (!paciente) return c.json({ erro: 'nao_encontrado' }, 404)
  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO tarefa (id, paciente_id, titulo, orientacoes) VALUES (?, ?, ?, ?)`
  )
    .bind(id, c.req.param('id'), titulo, (corpo.orientacoes ?? '').trim() || null)
    .run()
  return c.json({ ok: true, id })
})

pro.patch('/tarefas/:id', async (c) => {
  const corpo = await c.req
    .json<{ anotacaoTerapeuta?: string }>()
    .catch(() => ({}) as { anotacaoTerapeuta?: string })
  if (typeof corpo.anotacaoTerapeuta !== 'string')
    return c.json({ erro: 'dados_incompletos' }, 400)
  const resultado = await c.env.DB.prepare(
    `UPDATE tarefa SET anotacao_terapeuta = ? WHERE id = ?`
  )
    .bind(corpo.anotacaoTerapeuta.trim() || null, c.req.param('id'))
    .run()
  if (!resultado.meta.changes) return c.json({ erro: 'nao_encontrado' }, 404)
  return c.json({ ok: true })
})
