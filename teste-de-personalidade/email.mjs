/**
 * Modelo do e-mail de resultado do Teste de Personalidade
 * e Escolha Profissional: HTML responsivo + versão em texto puro.
 *
 * O e-mail nunca inclui a sequência das 26 respostas: apenas primeiro nome,
 * código de quatro letras, pontuações por dimensão e o conteúdo aprovado.
 */

import { resultDescriptions, profileDetails, temperamentDescriptions, ABOUT_TEST, DISCLAIMER } from './scoring.mjs';

export const EMAIL_SUBJECT = 'Seu resultado do Teste de Personalidade e Escolha Profissional';

export const DEFAULT_CONTACT_URL =
  'https://wa.me/551128632313?text=Ol%C3%A1%2C%20fiz%20o%20Teste%20de%20Personalidade%20e%20quero%20conversar%20sobre%20orienta%C3%A7%C3%A3o%20profissional.';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function scorePairRow(labelA, a, labelB, b) {
  return `
  <tr>
    <td style="padding:6px 0;font-size:14px;color:#2C2520;">${labelA}: <strong>${a}</strong> ponto${a === 1 ? '' : 's'}</td>
    <td style="padding:6px 0;font-size:14px;color:#2C2520;">${labelB}: <strong>${b}</strong> ponto${b === 1 ? '' : 's'}</td>
  </tr>`;
}

function listHtml(items) {
  return `<ul style="margin:8px 0 0;padding-left:20px;">${items
    .map((i) => `<li style="font-size:14px;line-height:1.7;color:#2C2520;margin-bottom:4px;">${esc(i)}</li>`)
    .join('')}</ul>`;
}

/**
 * Monta assunto, HTML e texto do e-mail de resultado.
 * @param {{firstName:string, code:string, scores:object, completedAt:string, contactUrl?:string}} data
 *   completedAt: data/horário do preenchimento já formatados (ex.: "11/07/2026 às 14h32").
 */
export function buildResultEmail({ firstName, code, scores, completedAt, contactUrl = DEFAULT_CONTACT_URL }) {
  const r = resultDescriptions[code];
  if (!r) throw new Error(`Código de resultado inválido: ${code}`);
  const det = profileDetails[code];
  const temp = temperamentDescriptions[r.temperament];
  const name = esc(firstName);

  const sectionTitle = (t) =>
    `<h3 style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#8B6E3A;margin:26px 0 4px;">${t}</h3>`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${EMAIL_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0EA;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">Seu resultado: ${code} · ${esc(r.title)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EA;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:6px;overflow:hidden;border:1px solid #E2D9CE;">

        <!-- Cabeçalho -->
        <tr><td style="background:#1C1917;padding:28px 32px;text-align:center;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#F5F0EA;">
            <span style="color:#B8975A;">●</span>&nbsp;Ana Mediolaro
          </div>
        </td></tr>

        <!-- Corpo -->
        <tr><td style="padding:32px;">
          <p style="font-size:15px;color:#2C2520;line-height:1.7;margin:0 0 14px;">Olá, <strong>${name}</strong>!</p>
          <p style="font-size:15px;color:#2C2520;line-height:1.7;margin:0 0 22px;">
            Obrigada por responder ao nosso Teste de Personalidade e Escolha Profissional.
          </p>

          <!-- Resultado -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="background:#F5F0EA;border:1px solid #E2D9CE;border-radius:6px;">
            <tr><td style="padding:24px;text-align:center;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7A6E65;">Seu resultado foi</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:44px;color:#B8975A;letter-spacing:8px;margin:8px 0 2px;">${code}</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#2C2520;">${esc(r.title)}${det ? ` <span style="color:#8B6E3A;">· ${esc(det.keyword)}</span>` : ''}</div>
              <div style="font-size:13px;color:#7A6E65;margin-top:8px;">Temperamento: <strong style="color:#8B6E3A;">${esc(r.temperament)}</strong></div>
            </td></tr>
          </table>

          ${sectionTitle(ABOUT_TEST.title)}
          ${ABOUT_TEST.paragraphs.map((p) =>
            `<p style="font-size:14px;line-height:1.7;color:#2C2520;margin:8px 0 0;">${esc(p)}</p>`).join('')}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
            ${ABOUT_TEST.dimensions.map((d) => `
            <tr><td style="padding:10px 14px;background:#F5F0EA;border:1px solid #E2D9CE;border-radius:4px;">
              <div style="font-size:13px;color:#2C2520;"><strong style="color:#8B6E3A;">${esc(d.pair)}</strong> · ${esc(d.name)} · <em style="color:#7A6E65;">${esc(d.question)}</em></div>
              <div style="font-size:13px;line-height:1.65;color:#7A6E65;margin-top:4px;">${esc(d.text)}</div>
            </td></tr>
            <tr><td style="height:8px;line-height:8px;font-size:0;">&nbsp;</td></tr>`).join('')}
          </table>

          ${sectionTitle('Como suas respostas se distribuíram')}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
            ${scorePairRow('Extroversão (E)', scores.E, 'Introversão (I)', scores.I)}
            ${scorePairRow('Sensação (S)', scores.S, 'Intuição (N)', scores.N)}
            ${scorePairRow('Pensamento (T)', scores.T, 'Sentimento (F)', scores.F)}
            ${scorePairRow('Julgamento (J)', scores.J, 'Percepção (P)', scores.P)}
          </table>

          ${sectionTitle('O que esse resultado pode indicar')}
          <p style="font-size:14px;line-height:1.7;color:#2C2520;margin:8px 0 0;">${esc(r.description)}</p>

          ${det ? `${sectionTitle(`Seu perfil em detalhe: ${code} (${esc(det.keyword)})`)}
          ${det.profile.map((p) =>
            `<p style="font-size:14px;line-height:1.7;color:#2C2520;margin:8px 0 0;">${esc(p)}</p>`).join('')}` : ''}

          ${sectionTitle('Tendências que podem aparecer')}
          ${listHtml(r.tendencies)}

          ${sectionTitle('Pontos de atenção')}
          ${listHtml(r.attentionPoints)}

          ${sectionTitle('Ambientes em que você pode funcionar melhor')}
          ${listHtml(r.favorableEnvironments)}

          ${det ? `${sectionTitle('Caminhos profissionais que costumam atrair esse perfil')}
          <p style="font-size:14px;line-height:1.7;color:#2C2520;margin:8px 0 0;">${esc(det.careers)}</p>
          <p style="font-size:12.5px;line-height:1.65;color:#7A6E65;margin:8px 0 0;font-style:italic;">São possibilidades para explorar e conversar, não uma prescrição. Interesses, habilidades e história de vida contam tanto quanto as preferências.</p>` : ''}

          ${temp ? `${sectionTitle(`Seu temperamento em detalhe: ${esc(temp.name)}`)}
          ${temp.paragraphs.map((p) =>
            `<p style="font-size:14px;line-height:1.7;color:#2C2520;margin:8px 0 0;">${esc(p)}</p>`).join('')}` : ''}

          <!-- Aviso -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="background:#FFF;border-left:3px solid #B8975A;margin-top:26px;">
            <tr><td style="padding:14px 16px;background:#F5F0EA;border-radius:0 4px 4px 0;">
              <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#8B6E3A;margin-bottom:6px;">Importante</div>
              <p style="font-size:12.5px;line-height:1.7;color:#7A6E65;margin:0;">${esc(DISCLAIMER)}</p>
              <p style="font-size:12.5px;line-height:1.7;color:#7A6E65;margin:10px 0 0;">
                Para aprofundar essa reflexão em um processo de orientação profissional,
                entre em contato comigo.
              </p>
            </td></tr>
          </table>

          <!-- Botão -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;">
            <tr><td align="center">
              <a href="${esc(contactUrl)}"
                 style="display:inline-block;background:#B8975A;color:#FFFFFF;font-size:13px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:14px 30px;border-radius:3px;">
                Conversar com a nossa equipe
              </a>
            </td></tr>
          </table>

          <p style="font-size:14px;color:#2C2520;line-height:1.7;margin:28px 0 0;">
            Atenciosamente,<br>
            <strong>Ana Mediolaro</strong>
          </p>
        </td></tr>

        <!-- Rodapé -->
        <tr><td style="background:#1C1917;padding:18px 32px;text-align:center;">
          <p style="font-size:11px;color:rgba(245,240,234,.45);line-height:1.6;margin:0;">
            Teste respondido em ${esc(completedAt)}.<br>
            Você recebeu este e-mail porque solicitou o resultado do teste no site anamediolaro.com.br.<br>
            Seu endereço não será usado para outras finalidades sem a sua autorização.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textList = (items) => items.map((i) => `• ${i}`).join('\n');
  const text = `Olá, ${firstName}!

Obrigada por responder ao nosso Teste de Personalidade e Escolha Profissional.

Seu resultado foi:

${code} · ${r.title}${det ? ` (${det.keyword})` : ''}

Temperamento:
${r.temperament}

${ABOUT_TEST.title}:

${ABOUT_TEST.paragraphs.join('\n\n')}

${ABOUT_TEST.dimensions.map((d) => `${d.pair} · ${d.name} · ${d.question}\n${d.text}`).join('\n\n')}

Como suas respostas se distribuíram:

Extroversão: ${scores.E} pontos
Introversão: ${scores.I} pontos

Sensação: ${scores.S} pontos
Intuição: ${scores.N} pontos

Pensamento: ${scores.T} pontos
Sentimento: ${scores.F} pontos

Julgamento: ${scores.J} pontos
Percepção: ${scores.P} pontos

O que esse resultado pode indicar:

${r.description}
${det ? `
Seu perfil em detalhe, ${code} (${det.keyword}):

${det.profile.join('\n\n')}
` : ''}
Tendências que podem aparecer:

${textList(r.tendencies)}

Pontos de atenção:

${textList(r.attentionPoints)}

Ambientes em que você pode funcionar melhor:

${textList(r.favorableEnvironments)}
${det ? `
Caminhos profissionais que costumam atrair esse perfil:

${det.careers}

(São possibilidades para explorar e conversar, não uma prescrição.)
` : ''}${temp ? `
Seu temperamento em detalhe, ${temp.name}:

${temp.paragraphs.join('\n\n')}
` : ''}
Importante:

${DISCLAIMER}

Para aprofundar essa reflexão em um processo de orientação profissional, entre em contato comigo:
${contactUrl}

Atenciosamente,

Ana Mediolaro

Teste respondido em ${completedAt}.`;

  return { subject: EMAIL_SUBJECT, html, text };
}
