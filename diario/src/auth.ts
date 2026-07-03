import type { Context, Next } from 'hono'
import type { Env, Vars, Paciente } from './tipos'

// O token do paciente só existe em claro no link de convite e no
// aparelho dele. No banco fica apenas o hash.
export async function hashToken(token: string): Promise<string> {
  const dados = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', dados)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
}

export function gerarToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
}

export async function pacientePorToken(
  db: D1Database,
  token: string
): Promise<Paciente | null> {
  if (!token) return null
  const hash = await hashToken(token)
  const linha = await db
    .prepare(
      `SELECT id, nome, consentimento_em, consentimento_ia_em, arquivado
       FROM paciente WHERE token_hash = ? AND arquivado = 0`
    )
    .bind(hash)
    .first<Paciente>()
  return linha ?? null
}

// Middleware das rotas do paciente: resolve o dono do token e nada
// além dele. Toda consulta subsequente usa paciente.id daqui, nunca
// um id vindo do cliente.
export function exigePaciente() {
  return async (c: Context<{ Bindings: Env; Variables: Vars }>, next: Next) => {
    const cabecalho = c.req.header('Authorization') ?? ''
    const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : ''
    const paciente = await pacientePorToken(c.env.DB, token)
    if (!paciente) return c.json({ erro: 'nao_autorizado' }, 401)
    c.set('paciente', paciente)
    await next()
  }
}
