// Estrelas premiam comportamento que o paciente controla, nunca humor.
// Nunca expiram, nunca são descontadas. Todo cálculo acontece aqui no
// servidor, com trilha auditável em evento_estrela.

export const NIVEIS = [
  { nome: 'Percepção', min: 0 },
  { nome: 'Consciência', min: 25 },
  { nome: 'Reprogramação', min: 75 },
  { nome: 'Expansão', min: 150 },
] as const

export function nivelPorEstrelas(total: number) {
  let atual: (typeof NIVEIS)[number] = NIVEIS[0]
  for (const n of NIVEIS) if (total >= n.min) atual = n
  const proximo = NIVEIS.find((n) => n.min > total) ?? null
  return { atual, proximo }
}

// Semana ISO como referência determinística do bônus semanal: o mesmo
// bônus nunca é concedido duas vezes, mesmo com sync repetido.
export function semanaIso(data: Date): string {
  const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()))
  const diaSemana = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - diaSemana)
  const inicioAno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const semana = Math.ceil(((d.getTime() - inicioAno.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(semana).padStart(2, '0')}`
}

type Premio = { origem: string; referencia: string; estrelas: number }

export async function premiarRegistro(
  db: D1Database,
  pacienteId: string,
  registroId: string,
  dataRegistro: Date,
  diasComRegistroNaSemana: number
): Promise<{ total: number; nivel: string; subiuDeNivel: boolean }> {
  const premios: Premio[] = [{ origem: 'registro', referencia: registroId, estrelas: 1 }]
  if (diasComRegistroNaSemana >= 3) {
    premios.push({
      origem: 'bonus_semana',
      referencia: semanaIso(dataRegistro),
      estrelas: 3,
    })
  }

  const antes = await db
    .prepare('SELECT estrelas_total FROM pontuacao WHERE paciente_id = ?')
    .bind(pacienteId)
    .first<{ estrelas_total: number }>()
  const totalAntes = antes?.estrelas_total ?? 0

  const comandos = premios.map((p) =>
    db
      .prepare(
        `INSERT INTO evento_estrela (id, paciente_id, origem, referencia_id, estrelas)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(paciente_id, origem, referencia_id) DO NOTHING`
      )
      .bind(crypto.randomUUID(), pacienteId, p.origem, p.referencia, p.estrelas)
  )
  await db.batch(comandos)

  // O total oficial é sempre a soma do ledger, nunca um contador solto.
  const soma = await db
    .prepare('SELECT COALESCE(SUM(estrelas), 0) AS total FROM evento_estrela WHERE paciente_id = ?')
    .bind(pacienteId)
    .first<{ total: number }>()
  const total = soma?.total ?? 0
  const { atual } = nivelPorEstrelas(total)

  await db
    .prepare(
      `INSERT INTO pontuacao (paciente_id, estrelas_total, nivel_atual)
       VALUES (?, ?, ?)
       ON CONFLICT(paciente_id) DO UPDATE SET estrelas_total = ?, nivel_atual = ?`
    )
    .bind(pacienteId, total, atual.nome, total, atual.nome)
    .run()

  const nivelAntes = nivelPorEstrelas(totalAntes).atual.nome
  return { total, nivel: atual.nome, subiuDeNivel: atual.nome !== nivelAntes }
}
