import { diaLocal } from './dados'
import { enfileirar, sincronizarFila } from './offline/fila'

function token(): string {
  return localStorage.getItem('diario_token') ?? ''
}

export function temToken(): boolean {
  return Boolean(token())
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function chamar(caminho: string, opcoes: RequestInit = {}): Promise<any> {
  const resposta = await fetch(`/api${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      ...(opcoes.headers ?? {}),
    },
  })
  if (resposta.status === 401) {
    localStorage.removeItem('diario_token')
    location.reload()
    throw new Error('nao_autorizado')
  }
  if (!resposta.ok) throw new Error(`api_${resposta.status}`)
  return resposta.json()
}

export const api = {
  eu: () => chamar(`/eu?hoje=${diaLocal()}`),
  consentir: (nome: string) =>
    chamar('/consentimento', { method: 'POST', body: JSON.stringify({ nome }) }),
  emocoesPessoais: () => chamar('/emocoes-pessoais'),
  registros: () => chamar('/registros'),
  padroes: (mes: string) => chamar(`/padroes?mes=${mes}`),
  marcarSessao: (id: string, falar: boolean) =>
    chamar(`/registros/${id}/sessao`, { method: 'PATCH', body: JSON.stringify({ falar }) }),

  // Salvar registro funciona sem internet: se a rede falhar, o registro
  // entra na fila local e sincroniza quando a conexão voltar.
  salvarRegistro: async (registro: Record<string, unknown>) => {
    try {
      return await chamar('/registros', { method: 'POST', body: JSON.stringify(registro) })
    } catch (e) {
      if (e instanceof TypeError || (e instanceof Error && e.message === 'api_503')) {
        await enfileirar(registro)
        return { ok: true, offline: true, estrelas: null, audioSugerido: null }
      }
      throw e
    }
  },
}

export const apiTarefas = {
  listar: () => chamar('/tarefas'),
  responder: (id: string, texto: string) =>
    chamar(`/tarefas/${id}/resposta`, { method: 'POST', body: JSON.stringify({ texto }) }),
}

// Área profissional: sessão em cookie HttpOnly, nada guardado em JS.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function chamarPro(caminho: string, opcoes: RequestInit = {}): Promise<any> {
  const resposta = await fetch(`/api/pro${caminho}`, {
    ...opcoes,
    headers: { 'Content-Type': 'application/json', ...(opcoes.headers ?? {}) },
  })
  if (!resposta.ok) {
    const erro = new Error(`api_${resposta.status}`) as Error & { status: number }
    erro.status = resposta.status
    throw erro
  }
  return resposta.json()
}

export const apiPro = {
  entrar: (email: string, senha: string) =>
    chamarPro('/entrar', { method: 'POST', body: JSON.stringify({ email, senha }) }),
  sair: () => chamarPro('/sair', { method: 'POST' }),
  sessao: () => chamarPro('/sessao'),
  pacientes: () => chamarPro('/pacientes'),
  convidar: (nome: string) =>
    chamarPro('/pacientes', { method: 'POST', body: JSON.stringify({ nome }) }),
  regenerarLink: (id: string) => chamarPro(`/pacientes/${id}/regenerar-link`, { method: 'POST' }),
  arquivar: (id: string, arquivado: boolean) =>
    chamarPro(`/pacientes/${id}`, { method: 'PATCH', body: JSON.stringify({ arquivado }) }),
  perfil: (id: string, dias: number) => chamarPro(`/pacientes/${id}?dias=${dias}`),
  registrosDoPaciente: (id: string, de: string, ate: string) =>
    chamarPro(`/pacientes/${id}/registros?de=${de}&ate=${ate}`),
  anotar: (registroId: string, texto: string) =>
    chamarPro(`/registros/${registroId}/anotacoes`, {
      method: 'POST',
      body: JSON.stringify({ texto }),
    }),
  marcarVisto: (registroId: string) =>
    chamarPro(`/registros/${registroId}/flag-resolvida`, { method: 'PATCH' }),
  tarefas: (pacienteId: string) => chamarPro(`/pacientes/${pacienteId}/tarefas`),
  criarTarefa: (pacienteId: string, titulo: string, orientacoes: string) =>
    chamarPro(`/pacientes/${pacienteId}/tarefas`, {
      method: 'POST',
      body: JSON.stringify({ titulo, orientacoes }),
    }),
  anotarTarefa: (id: string, anotacaoTerapeuta: string) =>
    chamarPro(`/tarefas/${id}`, { method: 'PATCH', body: JSON.stringify({ anotacaoTerapeuta }) }),
}

export function iniciarSincronizacao() {
  const tentar = () => {
    sincronizarFila((registro) =>
      fetch('/api/registros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(registro),
      }).then((r) => {
        // 409 (registro de outro dono) não deve travar a fila para sempre.
        if (!r.ok && r.status !== 409 && r.status !== 400) throw new Error('falhou')
      })
    ).catch(() => {})
  }
  window.addEventListener('online', tentar)
  tentar()
}
