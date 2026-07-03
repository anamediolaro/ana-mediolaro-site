// Conquistas premiam marcos de comportamento, nunca humor. Uma vez
// desbloqueada, a conquista não sai (UNIQUE paciente_id + tipo).

export const TIPOS_CONQUISTA = [
  'primeiro_registro',
  'semana_3',
  'voce_voltou',
  'primeira_palavra',
  'registros_10',
  'registros_30',
  'primeira_tarefa',
] as const

export type TipoConquista = (typeof TIPOS_CONQUISTA)[number]

async function desbloquear(
  db: D1Database,
  pacienteId: string,
  tipo: TipoConquista
): Promise<boolean> {
  const resultado = await db
    .prepare(
      `INSERT INTO conquista (id, paciente_id, tipo)
       VALUES (?, ?, ?) ON CONFLICT(paciente_id, tipo) DO NOTHING`
    )
    .bind(crypto.randomUUID(), pacienteId, tipo)
    .run()
  return resultado.meta.changes > 0
}

// Chamada depois de salvar um registro. diasDesdeAnterior é o intervalo
// até o registro anterior, calculado antes da gravação: 7 ou mais dias
// desbloqueia "Você voltou" (o retorno é recompensado, nunca a ausência
// punida).
export async function verificarConquistasDeRegistro(
  db: D1Database,
  pacienteId: string,
  opcoes: { escreveuPalavraPropria: boolean; diasDesdeAnterior: number | null }
): Promise<TipoConquista[]> {
  const novas: TipoConquista[] = []

  const totais = await db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM registro WHERE paciente_id = ?1) AS registros,
        (SELECT COUNT(*) FROM evento_estrela WHERE paciente_id = ?1 AND origem = 'bonus_semana') AS bonus,
        (SELECT COUNT(*) FROM emocao_pessoal WHERE paciente_id = ?1) AS palavras`
    )
    .bind(pacienteId)
    .first<{ registros: number; bonus: number; palavras: number }>()

  const checagens: [boolean, TipoConquista][] = [
    [(totais?.registros ?? 0) >= 1, 'primeiro_registro'],
    [(totais?.registros ?? 0) >= 10, 'registros_10'],
    [(totais?.registros ?? 0) >= 30, 'registros_30'],
    [(totais?.bonus ?? 0) >= 1, 'semana_3'],
    [opcoes.escreveuPalavraPropria || (totais?.palavras ?? 0) >= 1, 'primeira_palavra'],
    [opcoes.diasDesdeAnterior !== null && opcoes.diasDesdeAnterior >= 7, 'voce_voltou'],
  ]

  for (const [satisfeita, tipo] of checagens) {
    if (satisfeita && (await desbloquear(db, pacienteId, tipo))) novas.push(tipo)
  }
  return novas
}

export async function verificarConquistaDeTarefa(
  db: D1Database,
  pacienteId: string
): Promise<TipoConquista[]> {
  return (await desbloquear(db, pacienteId, 'primeira_tarefa')) ? ['primeira_tarefa'] : []
}
