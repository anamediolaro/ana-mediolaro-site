/**
 * Testes automatizados do Questionário de Preferências Psicológicas e
 * Profissionais. Rodar com: npm test  (node --test tests/)
 *
 * Usa o protocolo de exemplo aprovado (resultado esperado: INTP).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  QUESTIONS, TOTAL_QUESTIONS, computeScores, typeFromScores, correct,
  resultDescriptions, profileDetails, temperamentDescriptions, ABOUT_TEST,
} from '../questionario/scoring.mjs';
import { buildResultEmail, EMAIL_SUBJECT } from '../questionario/email.mjs';
import { validatePayload, formatDateBR } from '../worker.js';

// Protocolo de exemplo aprovado
const PROTOCOLO = {
  1: 'b', 2: 'b', 3: 'a', 4: 'b', 5: 'b', 6: 'a', 7: 'a', 8: 'a', 9: 'a',
  10: 'a', 11: 'a', 12: 'b', 13: 'b', 14: 'b', 15: 'b', 16: 'b', 17: 'b',
  18: 'b', 19: 'a', 20: 'b', 21: 'a', 22: 'b', 23: 'b', 24: 'b', 25: 'a', 26: 'a',
};

const EXPECTED_SCORES = { E: 1, I: 4, S: 3, N: 4, T: 5, F: 2, J: 2, P: 5 };

test('o questionário tem exatamente 26 perguntas, todas com duas alternativas', () => {
  assert.equal(TOTAL_QUESTIONS, 26);
  assert.equal(QUESTIONS.length, 26);
  const dims = { EI: 0, SN: 0, TF: 0, JP: 0 };
  for (const q of QUESTIONS) {
    assert.ok(q.text && q.a && q.b, `pergunta ${q.n} incompleta`);
    dims[q.dim] += 1;
  }
  // gabarito aprovado: 5 perguntas E/I e 7 para cada um dos demais pares
  assert.deepEqual(dims, { EI: 5, SN: 7, TF: 7, JP: 7 });
});

test('o cálculo do protocolo de exemplo resulta na pontuação esperada', () => {
  assert.deepEqual(computeScores(PROTOCOLO), EXPECTED_SCORES);
});

test('o cálculo do protocolo de exemplo resulta em INTP', () => {
  assert.equal(typeFromScores(EXPECTED_SCORES), 'INTP');
  assert.equal(correct(PROTOCOLO).code, 'INTP');
});

test('a descrição selecionada é a do INTP — Analista conceitual', () => {
  const { result } = correct(PROTOCOLO);
  assert.equal(result, resultDescriptions.INTP);
  assert.equal(result.title, 'Analista conceitual');
  assert.equal(result.temperament, 'NT · Racional');
});

test('o banco de resultados contém os 16 tipos completos', () => {
  const codes = Object.keys(resultDescriptions);
  assert.equal(codes.length, 16);
  for (const [code, r] of Object.entries(resultDescriptions)) {
    assert.match(code, /^[EI][SN][TF][JP]$/, `código inválido: ${code}`);
    assert.ok(r.title && r.temperament && r.description, `${code} incompleto`);
    assert.ok(r.tendencies.length >= 2 && r.attentionPoints.length >= 2 && r.favorableEnvironments.length >= 2);
  }
});

test('cada um dos 16 resultados tem perfil detalhado, apelido e caminhos profissionais', () => {
  assert.equal(Object.keys(profileDetails).length, 16);
  for (const code of Object.keys(resultDescriptions)) {
    const det = profileDetails[code];
    assert.ok(det, `perfil detalhado ausente para ${code}`);
    assert.ok(det.keyword && det.keyword.length >= 4, `${code} sem apelido`);
    assert.ok(det.profile.length >= 3, `${code} com perfil curto demais`);
    assert.ok(det.careers.length > 80, `${code} sem caminhos profissionais`);
  }
  // apelidos das devolutivas manuais preservados
  assert.equal(profileDetails.INTP.keyword, 'Precisão');
  assert.equal(profileDetails.ESFJ.keyword, 'Interação Social');
  assert.equal(profileDetails.ENTJ.keyword, 'Comando');
  assert.equal(profileDetails.ISTP.keyword, 'Temeridade');
});

test('os 4 temperamentos têm descrição completa e cobrem os 16 tipos', () => {
  assert.equal(Object.keys(temperamentDescriptions).length, 4);
  for (const [code, r] of Object.entries(resultDescriptions)) {
    const temp = temperamentDescriptions[r.temperament];
    assert.ok(temp, `temperamento sem descrição para ${code}: ${r.temperament}`);
    assert.ok(temp.paragraphs.length >= 3);
  }
});

test('a explicação do teste existe e cobre os quatro pares de preferências', () => {
  assert.ok(ABOUT_TEST.paragraphs.length >= 2);
  assert.deepEqual(ABOUT_TEST.dimensions.map((d) => d.pair), ['E / I', 'S / N', 'T / F', 'J / P']);
});

test('perguntas sem resposta impedem a correção', () => {
  const incompleto = { ...PROTOCOLO };
  delete incompleto[13];
  assert.throws(() => computeScores(incompleto), /Pergunta 13/);
});

test('o e-mail é montado com os dados corretos', () => {
  const { scores, code } = correct(PROTOCOLO);
  const mail = buildResultEmail({
    firstName: 'Izabela', code, scores, completedAt: '02/07/2026 às 13h14',
  });
  assert.equal(mail.subject, 'Seu resultado do Questionário de Preferências Psicológicas');
  assert.equal(mail.subject, EMAIL_SUBJECT);
  for (const out of [mail.html, mail.text]) {
    assert.ok(out.includes('Izabela'));
    assert.ok(out.includes('INTP'));
    assert.ok(out.includes('Analista conceitual'));
    assert.ok(out.includes('Precisão'), 'apelido do perfil no e-mail');
    assert.ok(out.includes('NT · Racional'));
    assert.ok(out.includes('02/07/2026 às 13h14'));
    assert.ok(out.includes('não é o') || out.includes('Não é um diagnóstico') || out.includes('diagnóstico'));
    // novas seções enriquecidas
    assert.ok(out.includes('Como este resultado é construído'), 'explicação do teste no e-mail');
    assert.ok(out.includes('Seu perfil em detalhe'), 'perfil detalhado no e-mail');
    assert.ok(out.includes('Seu temperamento em detalhe'), 'temperamento no e-mail');
    assert.ok(out.includes('Caminhos profissionais'), 'caminhos profissionais no e-mail');
    assert.ok(out.includes(profileDetails.INTP.profile[0]), 'texto do perfil INTP presente');
    assert.ok(out.includes(temperamentDescriptions['NT · Racional'].paragraphs[0]), 'texto do temperamento NT presente');
  }
  // pontuações de cada dimensão presentes no corpo
  assert.ok(mail.text.includes('Extroversão: 1 pontos') || mail.text.includes('Extroversão: 1 ponto'));
  assert.ok(mail.text.includes('Introversão: 4 pontos'));
  assert.ok(mail.text.includes('Pensamento: 5 pontos'));
  assert.ok(mail.text.includes('Percepção: 5 pontos'));
});

test('as respostas completas não são incluídas no e-mail', () => {
  const { scores, code } = correct(PROTOCOLO);
  const mail = buildResultEmail({ firstName: 'Izabela', code, scores, completedAt: 'hoje' });
  const sequencia = Object.values(PROTOCOLO).join('');
  assert.ok(!mail.html.includes(sequencia));
  assert.ok(!mail.text.includes(sequencia));
  // nenhuma menção a perguntas individuais tipo "Pergunta 7: a"
  assert.ok(!/Pergunta \d+:\s*[ab]/i.test(mail.text));
});

test('nenhum texto voltado ao público contém travessões (regra da Ana)', async () => {
  const DASHES = /[—–]/;
  const banks = { resultDescriptions, profileDetails, temperamentDescriptions, ABOUT_TEST };
  for (const [name, bank] of Object.entries(banks)) {
    assert.ok(!DASHES.test(JSON.stringify(bank)), `travessão encontrado em ${name}`);
  }
  const { scores, code } = correct(PROTOCOLO);
  const mail = buildResultEmail({ firstName: 'Izabela', code, scores, completedAt: 'hoje' });
  assert.ok(!DASHES.test(mail.subject), 'travessão no assunto');
  assert.ok(!DASHES.test(mail.html), 'travessão no HTML do e-mail');
  assert.ok(!DASHES.test(mail.text), 'travessão no texto do e-mail');
  const { readFile } = await import('node:fs/promises');
  const page = await readFile(new URL('../questionario/index.html', import.meta.url), 'utf-8');
  assert.ok(!DASHES.test(page), 'travessão na página do questionário');
});

test('o e-mail e o resultado convidam a marcar o Instagram da Ana', async () => {
  const { scores, code } = correct(PROTOCOLO);
  const mail = buildResultEmail({ firstName: 'Izabela', code, scores, completedAt: 'hoje' });
  for (const out of [mail.html, mail.text]) {
    assert.ok(out.includes('@anamediolaro.oficial'));
    assert.ok(out.includes('Agora é a sua vez'));
  }
  const { readFile } = await import('node:fs/promises');
  const page = await readFile(new URL('../questionario/index.html', import.meta.url), 'utf-8');
  assert.ok(page.includes('instagram.com/anamediolaro.oficial'));
  assert.ok(page.includes('Baixar imagem para os stories'));
});

test('a validação do servidor aceita o protocolo de exemplo', () => {
  const data = validatePayload({
    submissionId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    attempt: 1,
    firstName: 'Izabela',
    email: 'izabela@example.com',
    code: 'INTP',
    scores: EXPECTED_SCORES,
    completedAt: new Date().toISOString(),
  });
  assert.equal(data.error, undefined);
  assert.equal(data.code, 'INTP');
  assert.equal(data.email, 'izabela@example.com');
});

test('a validação do servidor rejeita e-mail inválido, pontuação adulterada e código trocado', () => {
  const base = {
    submissionId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    attempt: 1, firstName: 'Izabela', email: 'izabela@example.com',
    code: 'INTP', scores: EXPECTED_SCORES, completedAt: new Date().toISOString(),
  };
  assert.ok(validatePayload({ ...base, email: 'sem-arroba' }).error);
  assert.ok(validatePayload({ ...base, scores: { ...EXPECTED_SCORES, E: 9 } }).error);
  assert.ok(validatePayload({ ...base, code: 'ENFJ' }).error, 'código que não confere com os pontos');
  assert.ok(validatePayload({ ...base, code: 'XXXX' }).error);
  assert.ok(validatePayload({ ...base, submissionId: 'abc' }).error);
});

test('o campo honeypot faz o servidor ignorar robôs sem revelar nada', () => {
  const data = validatePayload({ website: 'http://spam', firstName: 'x', email: 'a@b.co' });
  assert.equal(data.honeypot, true);
});

test('o destinatário recebe somente um envio por tentativa (deduplicação)', async () => {
  // Simula a rota completa duas vezes com o MESMO submissionId/attempt:
  // o segundo pedido deve responder "duplicate" e só um e-mail deve sair.
  const calls = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    calls.push(JSON.parse(opts.body));
    return new Response('{}', { status: 200 });
  };
  try {
    const { default: worker } = await import('../worker.js');
    const env = { RESEND_API_KEY: 'chave-de-teste', MAIL_FROM: 'Teste <t@example.com>' };
    const ctx = { waitUntil() {} };
    const payload = {
      submissionId: '3f2504e0-4f89-41d3-9a0c-0305e82c3399',
      attempt: 1, firstName: 'Izabela', email: 'izabela@example.com',
      code: 'INTP', scores: EXPECTED_SCORES, completedAt: new Date().toISOString(),
    };
    const req = () => new Request('https://site.test/api/enviar-resultado', {
      method: 'POST', body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
    const r1 = await worker.fetch(req(), env, ctx);
    const r2 = await worker.fetch(req(), env, ctx);
    assert.equal((await r1.json()).status, 'sent');
    assert.equal((await r2.json()).status, 'duplicate');
    assert.equal(calls.length, 1, 'apenas um e-mail deve ser disparado');
    assert.deepEqual(calls[0].to, ['izabela@example.com']);
    assert.equal(calls[0].subject, EMAIL_SUBJECT);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('uma falha de envio não impede a exibição do resultado (contrato da API)', async () => {
  // O servidor responde com erro claro; a página já exibiu o resultado antes
  // do envio e o mantém na tela (comportamento implementado no front-end,
  // que calcula e mostra ANTES de chamar a API).
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('erro', { status: 500 });
  try {
    const { default: worker } = await import('../worker.js');
    const env = { RESEND_API_KEY: 'chave-de-teste' };
    const ctx = { waitUntil() {} };
    const req = new Request('https://site.test/api/enviar-resultado', {
      method: 'POST',
      body: JSON.stringify({
        submissionId: '3f2504e0-4f89-41d3-9a0c-0305e82c3222',
        attempt: 1, firstName: 'Izabela', email: 'izabela@example.com',
        code: 'INTP', scores: EXPECTED_SCORES, completedAt: new Date().toISOString(),
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await worker.fetch(req, env, ctx);
    assert.equal(res.status, 502);
    const body = await res.json();
    assert.equal(body.status, 'error');
    assert.ok(body.message);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('nenhuma chave de acesso fica exposta no navegador', async () => {
  const { readFile, readdir } = await import('node:fs/promises');
  const files = ['questionario/index.html', 'questionario/scoring.mjs', 'questionario/email.mjs'];
  for (const f of files) {
    const content = await readFile(new URL('../' + f, import.meta.url), 'utf-8');
    assert.ok(!/re_[A-Za-z0-9]{8,}/.test(content), `${f} não pode conter chave Resend`);
    assert.ok(!/RESEND_API_KEY\s*[:=]\s*['"]/.test(content), `${f} não pode conter a chave`);
    assert.ok(!content.toLowerCase().includes('api_key ='), f);
  }
  // a chave só é lida de env.* no worker (servidor)
  const worker = await readFile(new URL('../worker.js', import.meta.url), 'utf-8');
  assert.ok(worker.includes('env.RESEND_API_KEY'));
});

test('formatDateBR usa o fuso de São Paulo', () => {
  const s = formatDateBR(new Date('2026-07-02T16:14:00Z')); // 13h14 em SP
  assert.equal(s, '02/07/2026 às 13h14');
});
