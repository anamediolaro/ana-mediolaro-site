# Teste de Personalidade e Escolha Profissional

Sistema totalmente automático: a pessoa responde às 26 perguntas do teste, informa o
primeiro nome e o e-mail, marca o consentimento e clica em **"Ver meu
resultado"**. O sistema calcula os pontos, identifica o código de quatro
letras, mostra o resultado na tela e envia o e-mail — sem nenhuma
intervenção da psicóloga ou da administradora do site.

## Onde fica cada coisa

| Arquivo | Função |
| --- | --- |
| `teste-de-personalidade/index.html` | Página do teste (`/teste-de-personalidade/`) |
| `teste-de-personalidade/scoring.mjs` | Perguntas, mapa de pontuação e banco dos 16 resultados |
| `teste-de-personalidade/email.mjs` | Modelo do e-mail (HTML responsivo + texto) |
| `worker.js` | Rota segura `POST /api/enviar-resultado` + painel `/admin` |
| `tests/questionario.test.mjs` | Testes automatizados (`npm test`) |

A correção é **determinística** (nenhuma IA participa) e usa exclusivamente o
mapa aprovado no gabarito: perguntas 1, 5, 9, 13, 17 pontuam E/I; 2, 6, 10,
14, 18, 21, 24 pontuam S/N; 3, 7, 11, 15, 19, 22, 25 pontuam T/F; 4, 8, 12,
16, 20, 23, 26 pontuam J/P. A alternativa **a** soma para a primeira letra do
par e a **b** para a segunda. Como cada par tem número ímpar de perguntas,
não existe empate.

## Configuração do envio de e-mail (uma única vez)

O envio usa o serviço [Resend](https://resend.com) (plano gratuito: 100
e-mails/dia). A chave fica **somente no servidor** — nunca no navegador.

1. Crie uma conta em resend.com e gere uma API Key.
2. Verifique o domínio `anamediolaro.com.br` no painel do Resend
   (Domains → Add Domain → siga as instruções de DNS). Enquanto o domínio
   não estiver verificado, o remetente de teste `onboarding@resend.dev`
   funciona apenas para o e-mail da própria conta.
3. Grave a chave como segredo do Worker:

   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```

4. Ajuste o remetente em `wrangler.jsonc` (variável `MAIL_FROM`), por exemplo:

   ```jsonc
   "MAIL_FROM": "Ana Mediolaro <resultado@anamediolaro.com.br>"
   ```

5. Publique: `npx wrangler deploy`

**Para trocar o endereço remetente depois:** basta editar `MAIL_FROM` no
`wrangler.jsonc` e publicar de novo (o endereço precisa pertencer a um
domínio verificado no Resend).

## Painel administrativo (`/admin`)

Protegido por senha (usuário `admin`). Mostra apenas números agregados:
questionários concluídos, total por tipo, e-mails enviados/falhas, datas dos
últimos preenchimentos e distribuição E/I, S/N, T/F, J/P — e permite exportar
essas estatísticas anônimas em CSV. Respostas individuais **não** são
armazenadas nem exibidas.

1. Defina a senha:

   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   ```

2. Ative o armazenamento das estatísticas (KV):

   ```bash
   npx wrangler kv namespace create STATS
   ```

   Copie o `id` que o comando devolve e descomente o bloco `kv_namespaces`
   no `wrangler.jsonc`, colando o id. Sem o KV, o teste e o e-mail
   continuam funcionando — apenas os contadores ficam desativados.

## Privacidade

- As 26 respostas **não** são enviadas ao servidor nem incluídas no e-mail —
  só o resultado calculado e a pontuação por dimensão.
- As respostas ficam temporariamente no navegador (localStorage) apenas para
  não perder o progresso; expiram em 24 h e são apagadas na conclusão.
- Consentimento para receber o resultado ≠ autorização de marketing. O
  aceite de marketing é uma caixa separada e opcional; só nesse caso o
  e-mail é guardado (chaves `marketing:*` no KV).
- Não é enviada cópia automática para a clínica.
- O e-mail de resultado usa apenas: primeiro nome, código, pontuações,
  conteúdo aprovado e data/horário do preenchimento.

## Banco de e-mails dos respondentes

Com o KV `STATS` configurado, cada conclusão guarda um registro `lead:*`
com primeiro nome, e-mail, resultado, data e se a pessoa aceitou receber
conteúdos (consentimento de marketing separado). Para baixar a lista:
acesse `/admin/emails.csv` (protegido pela mesma senha do painel). A
coluna `aceitou_marketing` indica quem pode entrar em listas de
divulgação; respeite quem marcou "nao".

## SEO

A página do teste já sai pronta para o Google: título e descrição
otimizados, palavras-chave, canonical, Open Graph e Twitter Cards
(compartilhamento bonito no WhatsApp e redes), dados estruturados
JSON-LD (Quiz, BreadcrumbList e FAQPage) e a URL amigável
`/teste-de-personalidade/`. Na raiz do site ficam `sitemap.xml` e
`robots.txt`. Depois de publicar: cadastre o site no Google Search
Console e envie o sitemap para acelerar a indexação.

## Conteúdo dos resultados

As descrições dos 16 tipos em `teste-de-personalidade/scoring.mjs` vêm exclusivamente
do documento aprovado *"Tipos psicológicos — versão revisada e simplificada:
de Jung ao MBTI e aos temperamentos de Keirsey"*. Para ajustar um texto,
edite o objeto `resultDescriptions` (campos `title`, `temperament`,
`description`, `tendencies`, `attentionPoints`, `favorableEnvironments`) e o
aviso `DISCLAIMER`. Os textos da página ficam em `teste-de-personalidade/index.html` e
os do e-mail em `teste-de-personalidade/email.mjs`. Depois de editar, rode `npm test`
para conferir que nada quebrou.

## PDF

O botão **"Salvar em PDF"** na tela de resultado gera o documento
*"Resultado do Teste de Personalidade e Escolha Profissional"*
pelo diálogo de impressão do navegador, com identidade visual da clínica,
contendo: primeiro nome, data, código, título, temperamento, pontuações,
descrição, tendências, pontos de atenção, ambientes favoráveis e o aviso de
uso responsável. (Anexar PDF ao e-mail é possível numa evolução futura;
exigiria geração de PDF no servidor.)

## Proteções implementadas

- Todas as 26 perguntas obrigatórias (a página aponta as que faltam).
- Validação de formato de e-mail no navegador **e** no servidor.
- O servidor reconfere a pontuação e o código antes de enviar (payload
  adulterado é rejeitado).
- Identificador único por conclusão + bloqueio de cliques repetidos: o botão
  mostra "Calculando e enviando seu resultado…", depois "Resultado
  enviado.", e um novo envio só acontece pelo botão "Enviar novamente por
  e-mail" ou ao corrigir o e-mail.
- Campo honeypot invisível contra robôs.
- Falha de envio não apaga o resultado da tela; a pessoa vê a mensagem de
  erro e pode reenviar ou corrigir o e-mail.

## Testes e demonstração

```bash
npm test            # 15 testes: cálculo INTP, e-mail, deduplicação, chaves, etc.
npx wrangler dev    # rodar localmente em http://localhost:8787/teste-de-personalidade/
```

Atalhos de demonstração na página (apenas via URL, invisíveis para o público):

- `/teste-de-personalidade/?exemplo=intp` — preenche o protocolo de exemplo aprovado
  (resultado INTP — Analista conceitual).
- `/teste-de-personalidade/?demo=1` — simula o envio do e-mail sem chamar o servidor
  (útil para ver o fluxo completo antes de configurar o Resend).
