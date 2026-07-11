# Regras do projeto (site Ana Mediolaro)

## Estilo de escrita (regra permanente da Ana)

- NUNCA usar travessões ou traços de pontuação (— ou –) em nenhum texto
  voltado ao público: páginas, e-mails, PDFs, legendas. Substituir por
  vírgula, dois-pontos, ponto final ou ponto mediano (·) em rótulos.
  Hífen dentro de palavras compostas (bem-estar, e-mail) é permitido.
- Linguagem acessível e acolhedora, sem tom acadêmico.
- Falar com a pessoa em "você".

## Teste de Personalidade e Escolha Profissional (/teste-de-personalidade/)

- Correção determinística, sem IA. Mapa de pontuação e conteúdo aprovado
  em `teste-de-personalidade/scoring.mjs`. Instruções em `docs/TESTE-DE-PERSONALIDADE.md`.
- Apelidos dos 16 perfis (Precisão, Comando, Interação Social etc.) vêm
  das devolutivas manuais da clínica e devem ser mantidos.
- Profissões sugeridas devem ser atuais (2026) e valer para todas as
  idades: primeira escolha, transição ou reposicionamento de carreira.
  Sempre como possibilidades, nunca prescrição.
- Instagram da Ana: @anamediolaro.oficial
- O resultado é recurso educativo, nunca diagnóstico. Não usar os termos
  laudo, diagnóstico, parecer ou avaliação psicológica.
- Nome público: "Teste de Personalidade e Escolha Profissional"
  (nunca "questionário de preferências").
- URL antiga /questionario/ redireciona 301 para /teste-de-personalidade/.
- E-mails respondentes ficam no KV (chaves lead:*), exportáveis em
  /admin/emails.csv.
- SEO: manter canonical, OG, JSON-LD da página e sitemap.xml atualizados.
- Rodar `npm test` após alterar conteúdo ou lógica.
