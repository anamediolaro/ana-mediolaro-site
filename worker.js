/**
 * Worker do site — rotas dinâmicas:
 *
 *   POST /api/enviar-resultado  → envia o resultado do questionário por e-mail
 *   GET  /admin                 → painel administrativo (protegido por senha)
 *   GET  /admin/export.csv      → exportação de estatísticas anônimas
 *
 * Todo o restante é servido como arquivo estático (binding ASSETS).
 *
 * Segredos/variáveis (nunca ficam no navegador — ver docs/QUESTIONARIO.md):
 *   RESEND_API_KEY  (secret)  chave do serviço de e-mail Resend
 *   ADMIN_PASSWORD  (secret)  senha do painel /admin
 *   MAIL_FROM       (var)     remetente, ex.: "Ana Mediolaro <resultado@anamediolaro.com.br>"
 *   STATS           (KV)      opcional — estatísticas anônimas e controle de duplicados
 */

import { resultDescriptions, typeFromScores } from './questionario/scoring.mjs';
import { buildResultEmail } from './questionario/email.mjs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAIR_TOTALS = { EI: 5, SN: 7, TF: 7, JP: 7 };

// Controle de duplicados na memória do isolate (reforçado pelo KV quando existir)
const sentInMemory = new Map();
const MEMORY_TTL = 15 * 60 * 1000;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/enviar-resultado' && request.method === 'POST') {
      return handleSendResult(request, env, ctx);
    }
    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      return handleAdmin(request, env);
    }
    if (url.pathname === '/admin/export.csv') {
      return handleAdminExport(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};

// ─── Validação do pedido ────────────────────────────────────────────────────

/** Valida o corpo recebido. Retorna { error } ou os dados saneados. */
export function validatePayload(body) {
  if (!body || typeof body !== 'object') return { error: 'Corpo inválido.' };

  // honeypot: robôs preenchem o campo invisível — respondemos ok sem enviar nada
  if (body.website) return { honeypot: true };

  const firstName = String(body.firstName || '').trim().slice(0, 60);
  if (!firstName) return { error: 'Primeiro nome é obrigatório.' };

  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 120) return { error: 'E-mail com formato inválido.' };

  const code = String(body.code || '').toUpperCase();
  if (!resultDescriptions[code]) return { error: 'Código de resultado inválido.' };

  const scores = body.scores || {};
  for (const pair of ['EI', 'SN', 'TF', 'JP']) {
    const a = scores[pair[0]], b = scores[pair[1]];
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a + b !== PAIR_TOTALS[pair]) {
      return { error: 'Pontuação inconsistente.' };
    }
  }
  // Reconfere a correção no servidor: o código informado precisa bater com os pontos
  if (typeFromScores(scores) !== code) return { error: 'Resultado não confere com a pontuação.' };

  if (!UUID_RE.test(String(body.submissionId || ''))) return { error: 'Identificador ausente.' };
  const attempt = Number(body.attempt);
  if (!Number.isInteger(attempt) || attempt < 1 || attempt > 20) return { error: 'Tentativa inválida.' };

  let completedAt = new Date(String(body.completedAt || ''));
  if (Number.isNaN(completedAt.getTime()) || Math.abs(Date.now() - completedAt.getTime()) > 48 * 3600 * 1000) {
    completedAt = new Date();
  }

  return {
    firstName, email, code,
    scores: { E: scores.E, I: scores.I, S: scores.S, N: scores.N, T: scores.T, F: scores.F, J: scores.J, P: scores.P },
    submissionId: String(body.submissionId).toLowerCase(),
    attempt,
    completedAt,
    marketingConsent: body.marketingConsent === true,
  };
}

export function formatDateBR(date) {
  const d = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(date);
  const h = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(date);
  return `${d} às ${h.replace(':', 'h')}`;
}

// ─── POST /api/enviar-resultado ─────────────────────────────────────────────

async function handleSendResult(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { body = null; }
  const data = validatePayload(body);
  if (data.honeypot) return json({ status: 'ok' });
  if (data.error) return json({ status: 'error', message: data.error }, 400);

  // Proteção contra envios duplicados: cada conclusão (submissionId) só gera
  // um e-mail por tentativa explícita (attempt cresce apenas quando a pessoa
  // clica em "Enviar novamente por e-mail" ou corrige o e-mail).
  const dedupeKey = `sent:${data.submissionId}:${data.attempt}`;
  const now = Date.now();
  for (const [k, t] of sentInMemory) if (now - t > MEMORY_TTL) sentInMemory.delete(k);
  if (sentInMemory.has(dedupeKey)) return json({ status: 'duplicate' });
  if (env.STATS && (await env.STATS.get(dedupeKey))) return json({ status: 'duplicate' });
  sentInMemory.set(dedupeKey, now);
  if (env.STATS) ctx.waitUntil(env.STATS.put(dedupeKey, '1', { expirationTtl: 86400 }));

  const emailContent = buildResultEmail({
    firstName: data.firstName,
    code: data.code,
    scores: data.scores,
    completedAt: formatDateBR(data.completedAt),
  });

  let sendOk = false;
  let sendError = '';
  if (!env.RESEND_API_KEY) {
    sendError = 'Serviço de e-mail não configurado (RESEND_API_KEY).';
  } else {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.MAIL_FROM || 'Ana Mediolaro <onboarding@resend.dev>',
          to: [data.email],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        }),
      });
      sendOk = res.ok;
      if (!res.ok) sendError = `Serviço de e-mail respondeu ${res.status}.`;
    } catch (e) {
      sendError = 'Falha de rede ao contatar o serviço de e-mail.';
    }
  }

  // Estatísticas anônimas (apenas na primeira tentativa, para não contar reenvios)
  if (env.STATS) {
    ctx.waitUntil(updateStats(env, data, sendOk));
  }

  if (!sendOk) {
    sentInMemory.delete(dedupeKey); // permite tentar de novo após falha
    if (env.STATS) ctx.waitUntil(env.STATS.delete(dedupeKey));
    return json({ status: 'error', message: sendError }, 502);
  }
  return json({ status: 'sent' });
}

async function updateStats(env, data, sendOk) {
  try {
    const raw = await env.STATS.get('stats:v1');
    const s = raw ? JSON.parse(raw) : { total: 0, types: {}, emailsOk: 0, emailsFail: 0, lastDates: [] };
    if (data.attempt === 1) {
      s.total += 1;
      s.types[data.code] = (s.types[data.code] || 0) + 1;
      s.lastDates.unshift(data.completedAt.toISOString());
      s.lastDates = s.lastDates.slice(0, 20);
    }
    if (sendOk) s.emailsOk += 1; else s.emailsFail += 1;
    await env.STATS.put('stats:v1', JSON.stringify(s));
    // Consentimento de marketing é separado e explícito: só então guardamos o contato
    if (data.marketingConsent && data.attempt === 1) {
      await env.STATS.put(`marketing:${data.email}`, data.completedAt.toISOString());
    }
  } catch (e) {
    // estatística nunca pode derrubar o envio
  }
}

// ─── Painel administrativo ──────────────────────────────────────────────────

function unauthorized() {
  return new Response('Acesso restrito.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Painel Ana Mediolaro", charset="UTF-8"' },
  });
}

function checkAuth(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Basic ')) return false;
  try {
    const [user, ...rest] = atob(auth.slice(6)).split(':');
    const pass = rest.join(':');
    return user === 'admin' && timingSafeEqual(pass, env.ADMIN_PASSWORD);
  } catch { return false; }
}

function timingSafeEqual(a, b) {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

async function loadStats(env) {
  if (!env.STATS) return null;
  const raw = await env.STATS.get('stats:v1');
  return raw ? JSON.parse(raw) : { total: 0, types: {}, emailsOk: 0, emailsFail: 0, lastDates: [] };
}

function distributions(types) {
  const dist = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  for (const [code, count] of Object.entries(types)) {
    for (const letter of code) dist[letter] = (dist[letter] || 0) + count;
  }
  return dist;
}

async function handleAdmin(request, env) {
  if (!checkAuth(request, env)) return unauthorized();
  const s = await loadStats(env);
  const esc = (x) => String(x).replace(/</g, '&lt;');
  const ALL_TYPES = Object.keys(resultDescriptions);
  const body = s === null
    ? `<p class="warn">O armazenamento de estatísticas (KV "STATS") ainda não foi configurado.
       O questionário e o envio de e-mails funcionam normalmente; apenas os contadores ficam desativados.
       Veja as instruções em docs/QUESTIONARIO.md.</p>`
    : `
    <div class="cards">
      <div class="card"><div class="n">${s.total}</div><div class="l">Questionários concluídos</div></div>
      <div class="card"><div class="n">${s.emailsOk}</div><div class="l">E-mails enviados com sucesso</div></div>
      <div class="card"><div class="n">${s.emailsFail}</div><div class="l">Falhas de envio</div></div>
    </div>
    <h2>Resultados por tipo</h2>
    <table><tr>${ALL_TYPES.slice(0, 8).map((t) => `<th>${t}</th>`).join('')}</tr>
    <tr>${ALL_TYPES.slice(0, 8).map((t) => `<td>${s.types[t] || 0}</td>`).join('')}</tr>
    <tr>${ALL_TYPES.slice(8).map((t) => `<th>${t}</th>`).join('')}</tr>
    <tr>${ALL_TYPES.slice(8).map((t) => `<td>${s.types[t] || 0}</td>`).join('')}</tr></table>
    <h2>Distribuição por preferência</h2>
    <table>${(() => { const d = distributions(s.types);
      return [['E','I'],['S','N'],['T','F'],['J','P']].map(([a,b]) =>
        `<tr><th>${a}</th><td>${d[a]}</td><th>${b}</th><td>${d[b]}</td></tr>`).join(''); })()}
    </table>
    <h2>Últimos preenchimentos</h2>
    <ul>${s.lastDates.length ? s.lastDates.map((d) => `<li>${esc(formatDateBR(new Date(d)))}</li>`).join('') : '<li>Nenhum ainda.</li>'}</ul>
    <p><a class="btn" href="/admin/export.csv">Exportar estatísticas anônimas (CSV)</a></p>`;

  return new Response(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Painel · Questionário</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;background:#F5F0EA;color:#2C2520;margin:0;padding:32px;}
h1{font-family:Georgia,serif;font-size:26px;} h1 span{color:#B8975A;}
h2{font-size:14px;text-transform:uppercase;letter-spacing:.1em;color:#8B6E3A;margin-top:32px;}
.cards{display:flex;gap:14px;flex-wrap:wrap;margin-top:20px;}
.card{background:#fff;border:1px solid #E2D9CE;border-radius:4px;padding:18px 26px;min-width:180px;}
.card .n{font-family:Georgia,serif;font-size:34px;color:#B8975A;}
.card .l{font-size:12px;color:#7A6E65;margin-top:4px;}
table{border-collapse:collapse;background:#fff;margin-top:10px;}
th,td{border:1px solid #E2D9CE;padding:8px 14px;font-size:13px;text-align:center;}
th{background:#EDE6DC;color:#7A6E65;}
ul{background:#fff;border:1px solid #E2D9CE;border-radius:4px;padding:14px 30px;font-size:13px;max-width:420px;}
.btn{display:inline-block;background:#B8975A;color:#fff;text-decoration:none;padding:10px 18px;border-radius:3px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-top:8px;}
.warn{background:#fff;border:1px solid #E2D9CE;border-left:3px solid #B8975A;padding:16px;border-radius:4px;max-width:560px;line-height:1.6;font-size:14px;}
.note{font-size:12px;color:#7A6E65;margin-top:28px;max-width:560px;line-height:1.6;}
</style></head><body>
<h1><span>●</span> Painel do Questionário de Preferências</h1>
${body}
<p class="note">Este painel mostra apenas números agregados. As respostas individuais das 26 perguntas
não são armazenadas e não podem ser consultadas aqui, por desenho de privacidade.</p>
</body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleAdminExport(request, env) {
  if (!checkAuth(request, env)) return unauthorized();
  const s = await loadStats(env);
  if (s === null) return new Response('KV STATS não configurado.', { status: 503 });
  const d = distributions(s.types);
  const lines = ['métrica,valor',
    `questionarios_concluidos,${s.total}`,
    `emails_enviados,${s.emailsOk}`,
    `falhas_envio,${s.emailsFail}`,
    ...Object.keys(resultDescriptions).map((t) => `total_${t},${s.types[t] || 0}`),
    ...['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'].map((l) => `distribuicao_${l},${d[l]}`),
  ];
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="estatisticas-questionario.csv"',
    },
  });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
