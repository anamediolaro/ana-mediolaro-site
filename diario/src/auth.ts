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

// ---------------------------------------------------------------------------
// Senha da terapeuta: PBKDF2-SHA256 via WebCrypto. O runtime dos Workers
// limita o PBKDF2 a 100.000 iterações; compensamos com bloqueio de
// tentativas no login (tabela login_tentativa).
// ---------------------------------------------------------------------------
export const PBKDF2_ITERACOES = 100_000

const paraB64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')

const deB64url = (texto: string) =>
  Uint8Array.from(atob(texto.replaceAll('-', '+').replaceAll('_', '/')), (c) => c.charCodeAt(0))

async function derivarPbkdf2(senha: string, sal: Uint8Array, iteracoes: number) {
  const chave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(senha),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: sal as BufferSource, iterations: iteracoes },
    chave,
    256
  )
  return new Uint8Array(bits)
}

export async function hashSenha(senha: string): Promise<string> {
  const sal = crypto.getRandomValues(new Uint8Array(16))
  const derivada = await derivarPbkdf2(senha, sal, PBKDF2_ITERACOES)
  return `pbkdf2$${PBKDF2_ITERACOES}$${paraB64url(sal)}$${paraB64url(derivada)}`
}

export async function verificarSenha(senha: string, guardado: string): Promise<boolean> {
  const partes = guardado.split('$')
  if (partes.length !== 4 || partes[0] !== 'pbkdf2') return false
  const iteracoes = Number(partes[1])
  if (!Number.isInteger(iteracoes) || iteracoes < 1) return false
  const esperado = deB64url(partes[3])
  const derivada = await derivarPbkdf2(senha, deB64url(partes[2]), iteracoes)
  if (derivada.length !== esperado.length) return false
  let diferente = 0
  for (let i = 0; i < derivada.length; i++) diferente |= derivada[i] ^ esperado[i]
  return diferente === 0
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
