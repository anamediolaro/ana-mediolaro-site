export type Env = {
  DB: D1Database
  ASSETS: Fetcher
  // Opcional: bucket R2 com os áudios da Ana (binding AUDIOS).
  AUDIOS?: R2Bucket
  // Segredos definidos com "wrangler secret put" (ver DEPLOY.md).
  ANTHROPIC_API_KEY?: string
  MODELO_IA?: string
  VAPID_PUBLIC_KEY?: string
  VAPID_PRIVATE_KEY?: string
  VAPID_SUBJECT?: string
}

export type Paciente = {
  id: string
  nome: string
  consentimento_em: string | null
  consentimento_ia_em: string | null
  arquivado: number
}

export type Terapeuta = {
  id: string
  nome: string
  email: string
  contato_emergencia: string | null
}

export type Vars = {
  paciente: Paciente
  terapeuta: Terapeuta
}
