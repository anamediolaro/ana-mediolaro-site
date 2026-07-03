export type Env = {
  DB: D1Database
  ASSETS: Fetcher
}

export type Paciente = {
  id: string
  nome: string
  consentimento_em: string | null
  consentimento_ia_em: string | null
  arquivado: number
}

export type Vars = {
  paciente: Paciente
}
