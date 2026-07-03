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
