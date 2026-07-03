// Estatísticas da tela Padrões. As datas chegam já no fuso do paciente:
// o cliente envia timestamp local (ISO com offset) e o dia do registro é
// derivado dos 10 primeiros caracteres do timestamp local.

type LinhaRegistro = {
  dia: string
  nivel: number
  emocoes: string
  emocoes_livres: string
  atividades: string
  atividade_texto: string | null
  corpo: string
}

function contar(mapa: Map<string, number>, chave: string) {
  const limpa = chave.trim()
  if (!limpa) return
  mapa.set(limpa, (mapa.get(limpa) ?? 0) + 1)
}

function top(mapa: Map<string, number>, n: number) {
  return [...mapa.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([item, vezes]) => ({ item, vezes }))
}

export async function calcularPadroes(db: D1Database, pacienteId: string, mes: string) {
  const linhas = await db
    .prepare(
      `SELECT substr(timestamp, 1, 10) AS dia, nivel, emocoes, emocoes_livres,
              atividades, atividade_texto, corpo
       FROM registro WHERE paciente_id = ?
       ORDER BY timestamp`
    )
    .bind(pacienteId)
    .all<LinhaRegistro>()

  const todas = linhas.results ?? []
  const doMes = todas.filter((r) => r.dia.startsWith(mes))

  // Calendário: humor médio por dia do mês pedido.
  const porDia = new Map<string, number[]>()
  for (const r of doMes) {
    const lista = porDia.get(r.dia) ?? []
    lista.push(r.nivel)
    porDia.set(r.dia, lista)
  }
  const calendario: Record<string, number> = {}
  for (const [dia, niveis] of porDia) {
    calendario[dia] = Math.round(niveis.reduce((s, n) => s + n, 0) / niveis.length)
  }

  const emocoes = new Map<string, number>()
  const contextos = new Map<string, number>()
  const corpo = new Map<string, number>()
  for (const r of doMes) {
    for (const e of JSON.parse(r.emocoes) as string[]) contar(emocoes, e)
    for (const e of JSON.parse(r.emocoes_livres) as string[]) contar(emocoes, e)
    for (const a of JSON.parse(r.atividades) as string[]) contar(contextos, a)
    if (r.atividade_texto) contar(contextos, r.atividade_texto)
    for (const p of JSON.parse(r.corpo) as string[]) contar(corpo, p)
  }

  const humorMedio = doMes.length
    ? Math.round((doMes.reduce((s, r) => s + r.nivel, 0) / doMes.length) * 10) / 10
    : null

  // Recorde pessoal: melhor sequência de dias consecutivos com registro
  // (histórico inteiro) e mês com mais registros. A única comparação é
  // do paciente com ele mesmo.
  const diasUnicos = [...new Set(todas.map((r) => r.dia))].sort()
  let melhorSequencia = 0
  let sequencia = 0
  let diaAnterior = ''
  for (const dia of diasUnicos) {
    if (diaAnterior && Date.parse(dia) - Date.parse(diaAnterior) === 86400000) {
      sequencia += 1
    } else {
      sequencia = 1
    }
    melhorSequencia = Math.max(melhorSequencia, sequencia)
    diaAnterior = dia
  }

  const porMes = new Map<string, number>()
  for (const r of todas) contar(porMes, r.dia.slice(0, 7))
  const melhorMes = top(porMes, 1)[0] ?? null

  return {
    mes,
    calendario,
    humorMedio,
    totalRegistrosMes: doMes.length,
    melhorSequencia,
    melhorMes,
    emocoes: top(emocoes, 5),
    contextos: top(contextos, 5),
    corpo: top(corpo, 5),
  }
}
