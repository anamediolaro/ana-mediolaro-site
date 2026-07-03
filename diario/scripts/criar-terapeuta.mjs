// Cria (ou atualiza) a conta da terapeuta com senha em hash PBKDF2.
// Uso:
//   node scripts/criar-terapeuta.mjs "Ana Mediolaro" ana@exemplo.com "senha-forte" > conta.sql
//   npx wrangler d1 execute DB --remote --file=conta.sql && rm conta.sql
// A senha nunca fica gravada em lugar nenhum, só o hash.
import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto'

const [nome, email, senha] = process.argv.slice(2)
if (!nome || !email || !senha) {
  console.error('uso: node scripts/criar-terapeuta.mjs "Nome" email "senha"')
  process.exit(1)
}
if (senha.length < 10) {
  console.error('escolha uma senha com pelo menos 10 caracteres')
  process.exit(1)
}

const ITERACOES = 100_000
const sal = randomBytes(16)
const hash = pbkdf2Sync(senha, sal, ITERACOES, 32, 'sha256')
const b64url = (b) => b.toString('base64url')
const senhaHash = `pbkdf2$${ITERACOES}$${b64url(sal)}$${b64url(hash)}`

console.log(`INSERT INTO terapeuta (id, nome, email, senha_hash)
VALUES ('${randomUUID()}', '${nome.replaceAll("'", "''")}', '${email.toLowerCase()}', '${senhaHash}')
ON CONFLICT(email) DO UPDATE SET nome = excluded.nome, senha_hash = excluded.senha_hash;`)
