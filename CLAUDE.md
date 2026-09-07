# Regras do projeto (site Ana Mediolaro)

## Estilo de escrita (regra permanente da Ana)

- NUNCA usar travessões ou traços de pontuação (— ou –) em nenhum texto
  voltado ao público: páginas, e-mails, PDFs, legendas, tanto na versão
  desktop quanto na mobile. Substituir por vírgula, dois-pontos, ponto
  final ou ponto mediano (·) em rótulos. Hífen dentro de palavras
  compostas (bem-estar, e-mail) é permitido.
  Ao editar qualquer texto, verificar com `grep '—' index.html` antes de
  finalizar.
- Linguagem acessível e acolhedora, sem tom acadêmico.
- Falar com a pessoa em "você".

## Hero (topo)

- O hero é a sala/lounge da Ana Mediolaro Consultoria (Nine Office Park,
  Jundiaí) ocupando o quadro inteiro, com um véu escuro à esquerda para o
  texto por cima. Título grande em creme, "mudar" em dourado, botão dourado
  (Agendar sessão) e botão fantasma (A ciência por trás), com "Role para
  conhecer" no canto. A faixa de números (2006, 2011, 5.0) segue logo abaixo.
  Classes: `.nhero`, `.nhero-bg`, `.nhero-veil`, `.nhero-in`, `.nhero-hint`,
  `.nbtn-gold`, `.nbtn-ghost`.
- No mobile, o hero mantém a sala de fundo com o texto por cima.
- A antiga foto da Ana recortada no fundo creme foi substituída por esta
  versão (aprovada pela Ana). A foto da Ana aparece agora na seção Sobre,
  no estilo "foto impressa" (polaroid, classe `.polafig`).

## Publicação

- Site publica via merge na branch main (Cloudflare atualiza sozinho).
- Sempre mostrar prévia (print) para a Ana antes de publicar mudanças visuais.

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
