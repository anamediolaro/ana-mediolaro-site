// Gera migrations/seed-demo.sql: dados fictícios para desenvolvimento
// local e demonstração. Nunca aplicar em produção.
// Uso: node scripts/gerar-seed.mjs
import { createHash, randomUUID } from 'node:crypto'
import { writeFileSync } from 'node:fs'

const TOKEN_DEMO = 'DEMO-TOMIO-2026'
const TOKEN_NOVA = 'DEMO-BOASVINDAS'

const hash = (token) => createHash('sha256').update(token).digest('base64url')
const idPaciente = 'pac-demo-tomio'
const idNova = 'pac-demo-nova'

const sql = []
sql.push(`DELETE FROM evento_estrela; DELETE FROM emocao_pessoal; DELETE FROM registro;
DELETE FROM pontuacao; DELETE FROM audio; DELETE FROM paciente; DELETE FROM terapeuta;`)

sql.push(`INSERT INTO terapeuta (id, nome, email, senha_hash) VALUES
  ('ter-ana', 'Ana Mediolaro', 'ana.mediolaro@gmail.com', 'definida-na-etapa-2');`)

sql.push(`INSERT INTO paciente (id, nome, token_hash, consentimento_em, criado_em) VALUES
  ('${idPaciente}', 'Tomio Imakuma', '${hash(TOKEN_DEMO)}', datetime('now', '-40 days'), datetime('now', '-40 days')),
  ('${idNova}', 'Mariana Costa', '${hash(TOKEN_NOVA)}', NULL, datetime('now'));`)

sql.push(`INSERT INTO audio (id, titulo, emocoes_associadas, chave_r2, duracao_seg) VALUES
  ('aud-respiracao', 'Respiração para ansiedade', '["ansios","medo","sobrecarregad"]', 'respiracao-ansiedade.mp3', 240),
  ('aud-autoperdao', 'Acolhimento para culpa', '["culpad","envergonhad"]', 'acolhimento-culpa.mp3', 300);`)

// Registros dos últimos ~35 dias, com humor variado e vocabulário próprio.
const hoje = new Date()
const dia = (atras) => {
  const d = new Date(hoje)
  d.setDate(d.getDate() - atras)
  return d.toISOString().slice(0, 10)
}

const registros = [
  { atras: 0, hora: '08:12', nivel: 1, emocoes: ['Ansioso(a)'], livres: ['Engolido'], atividades: ['Trabalho'], pensamento: 'Se eu recusar o projeto vão achar que não dou conta.', corpo: ['Peito', 'Respiração curta'], acao: 'Aceitei sem pensar. Depois travei.', sessao: 1, sono: 'mal' },
  { atras: 1, hora: '19:40', nivel: 4, emocoes: ['Aliviado(a)'], livres: [], atividades: ['Descanso'], pensamento: 'Terminei a entrega antes do prazo.', corpo: [], acao: 'Saí para caminhar.' },
  { atras: 1, hora: '09:05', nivel: 2, emocoes: ['Sobrecarregado(a)', 'Irritado(a)'], livres: ['No limite'], atividades: ['Reunião'], pensamento: 'Mais uma pauta que vira minha.', corpo: ['Ombros e pescoço'], acao: 'Não falei nada na hora.' },
  { atras: 2, hora: '21:30', nivel: 3, emocoes: ['Cansado(a)'], livres: [], atividades: ['Família'], corpo: ['Cabeça'] },
  { atras: 3, hora: '12:15', nivel: 4, emocoes: ['Confiante', 'Motivado(a)'], livres: [], atividades: ['Trabalho'], pensamento: 'A apresentação saiu melhor do que eu esperava.', corpo: [], acao: 'Agradeci o time.' },
  { atras: 4, hora: '18:50', nivel: 2, emocoes: ['Culpado(a)'], livres: [], atividades: ['Família'], pensamento: 'Faltei no aniversário da minha mãe de novo.', corpo: ['Estômago'], acao: 'Liguei pedindo desculpa.' },
  { atras: 5, hora: '08:40', nivel: 3, emocoes: ['Calmo(a)'], livres: [], atividades: ['Exercício'], corpo: [], sono: 'bem' },
  { atras: 6, hora: '17:20', nivel: 5, emocoes: ['Alegre', 'Grato(a)'], livres: ['Leve'], atividades: ['Conversa difícil'], pensamento: 'Consegui dizer não sem me desmontar.', corpo: [], acao: 'Marquei limites com o sócio.' },
  { atras: 7, hora: '10:00', nivel: 3, emocoes: ['Esperançoso(a)'], livres: [], atividades: ['Trabalho'], corpo: [] },
  { atras: 8, hora: '22:10', nivel: 2, emocoes: ['Ansioso(a)', 'Com medo'], livres: [], atividades: ['Sozinho(a) em casa'], pensamento: 'E se o contrato não sair?', corpo: ['Coração acelerado'], acao: 'Fiquei rolando o celular.', sono: 'insonia' },
  { atras: 9, hora: '14:30', nivel: 4, emocoes: ['Orgulhoso(a)'], livres: [], atividades: ['Trabalho'], corpo: [] },
  { atras: 10, hora: '08:15', nivel: 3, emocoes: ['Calmo(a)'], livres: [], atividades: ['Trânsito'], corpo: [] },
  { atras: 12, hora: '19:00', nivel: 2, emocoes: ['Frustrado(a)'], livres: ['No limite'], atividades: ['Reunião'], pensamento: 'Ninguém leu o documento que preparei.', corpo: ['Garganta'], acao: 'Encerrei a reunião mais cedo.' },
  { atras: 13, hora: '09:30', nivel: 3, emocoes: ['Cansado(a)'], livres: [], atividades: ['Trabalho'], corpo: ['Corpo todo'], sono: 'cansado' },
  { atras: 14, hora: '16:45', nivel: 4, emocoes: ['Aliviado(a)', 'Grato(a)'], livres: [], atividades: ['Família'], corpo: [] },
  { atras: 16, hora: '11:20', nivel: 3, emocoes: ['Calmo(a)'], livres: [], atividades: ['Estudos'], corpo: [] },
  { atras: 17, hora: '20:30', nivel: 2, emocoes: ['Triste', 'Solitário(a)'], livres: [], atividades: ['Sozinho(a) em casa'], pensamento: 'Todo mundo tem para onde voltar.', corpo: ['Peito'], acao: 'Chamei um amigo para jantar quinta.' },
  { atras: 18, hora: '08:00', nivel: 3, emocoes: ['Esperançoso(a)'], livres: [], atividades: ['Exercício'], corpo: [], sono: 'bem' },
  { atras: 19, hora: '15:10', nivel: 4, emocoes: ['Motivado(a)'], livres: [], atividades: ['Trabalho'], corpo: [] },
  { atras: 20, hora: '18:25', nivel: 5, emocoes: ['Alegre'], livres: ['Leve'], atividades: ['Família'], corpo: [] },
  { atras: 22, hora: '09:45', nivel: 2, emocoes: ['Ansioso(a)', 'Impotente'], livres: ['Engolido'], atividades: ['Reunião'], pensamento: 'Falaram por cima de mim o tempo todo.', corpo: ['Garganta', 'Mãos'], acao: 'Anotei o que eu queria ter dito.' },
  { atras: 24, hora: '13:00', nivel: 3, emocoes: ['Calmo(a)'], livres: [], atividades: ['Descanso'], corpo: [] },
  { atras: 26, hora: '10:30', nivel: 4, emocoes: ['Confiante'], livres: [], atividades: ['Trabalho'], corpo: [] },
  { atras: 28, hora: '17:40', nivel: 3, emocoes: ['Cansado(a)'], livres: [], atividades: ['Trabalho'], corpo: ['Ombros e pescoço'] },
  { atras: 30, hora: '08:20', nivel: 2, emocoes: ['Sobrecarregado(a)'], livres: ['No limite'], atividades: ['Trabalho'], pensamento: 'A agenda não fecha nem no papel.', corpo: ['Cabeça'], acao: 'Remarquei duas reuniões.' },
]

const linhasRegistro = []
const eventos = []
const semanas = new Set()
for (const r of registros) {
  const id = randomUUID()
  const ts = `${dia(r.atras)}T${r.hora}:00-03:00`
  linhasRegistro.push(
    `('${id}', '${idPaciente}', '${ts}', ${r.nivel}, '${JSON.stringify(r.emocoes)}', '${JSON.stringify(r.livres ?? [])}', '${JSON.stringify(r.atividades ?? [])}', NULL, ${r.pensamento ? `'${r.pensamento.replaceAll("'", "''")}'` : 'NULL'}, '${JSON.stringify(r.corpo ?? [])}', ${r.acao ? `'${r.acao.replaceAll("'", "''")}'` : 'NULL'}, ${r.sono ? `'${r.sono}'` : 'NULL'}, ${r.sessao ?? 0})`
  )
  eventos.push(`('${randomUUID()}', '${idPaciente}', 'registro', '${id}', 1)`)
  // bônus por semana com 3+ registros: aproximação para o seed
  const semana = Math.floor(r.atras / 7)
  semanas.add(semana)
}
for (const semana of [0, 1, 2, 3]) {
  eventos.push(`('${randomUUID()}', '${idPaciente}', 'bonus_semana', 'seed-semana-${semana}', 3)`)
}

sql.push(`INSERT INTO registro (id, paciente_id, timestamp, nivel, emocoes, emocoes_livres, atividades, atividade_texto, pensamento, corpo, acao, sono, falar_na_sessao) VALUES\n${linhasRegistro.join(',\n')};`)
sql.push(`INSERT INTO emocao_pessoal (id, paciente_id, palavra) VALUES
  ('${randomUUID()}', '${idPaciente}', 'Engolido'),
  ('${randomUUID()}', '${idPaciente}', 'No limite'),
  ('${randomUUID()}', '${idPaciente}', 'Leve');`)
sql.push(`INSERT INTO evento_estrela (id, paciente_id, origem, referencia_id, estrelas) VALUES\n${eventos.join(',\n')};`)

const total = registros.length + 4 * 3
const nivel = total >= 150 ? 'Expansão' : total >= 75 ? 'Reprogramação' : total >= 25 ? 'Consciência' : 'Percepção'
sql.push(`INSERT INTO pontuacao (paciente_id, estrelas_total, nivel_atual) VALUES ('${idPaciente}', ${total}, '${nivel}');`)

writeFileSync(new URL('./seed-demo.sql', import.meta.url), sql.join('\n\n') + '\n')
console.log(`seed gerado: ${registros.length} registros, ${total} estrelas (${nivel})`)
console.log(`link demo:      /e/${TOKEN_DEMO}`)
console.log(`link boas-vindas: /e/${TOKEN_NOVA}`)
