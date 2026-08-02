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
e-mails por dia). A chave de acesso fica **somente no servidor**, nunca no
navegador. Dá para configurar tudo pelos painéis do Resend e da Cloudflare,
**sem usar terminal**.

### Parte 1 · Criar a conta e a chave no Resend

1. Acesse [resend.com](https://resend.com) e crie uma conta gratuita.
2. No menu **API Keys**, clique em **Create API Key**, dê um nome
   (ex.: `site ana`) e **copie a chave** que começa com `re_...`. Guarde em
   lugar seguro, pois ela só aparece uma vez.

### Parte 2 · Verificar o domínio (para o e-mail sair no seu nome)

3. No Resend, vá em **Domains → Add Domain** e digite `anamediolaro.com.br`.
4. O Resend vai mostrar alguns registros de DNS. Como o domínio está na
   Cloudflare, copie cada registro para **Cloudflare → seu domínio → DNS →
   Add record** (cole exatamente como aparece).
5. Volte ao Resend e clique em **Verify**. Pode levar de alguns minutos a
   poucas horas.

   Enquanto o domínio não estiver verificado, o remetente de teste
   `onboarding@resend.dev` funciona **apenas para o e-mail da própria conta**
   do Resend (ótimo para testar antes de liberar para o público).

### Parte 3 · Guardar a chave no site (painel da Cloudflare)

6. Cloudflare → **Workers & Pages** → abra o worker
   **`ana-mediolaro-site`** → **Settings** → **Variables and Secrets**.
7. Em **Secrets** (variável criptografada), clique em **Add**:
   - **Name:** `RESEND_API_KEY`
   - **Value:** cole a chave `re_...` da Parte 1
   - Salve. Pronto: a chave fica protegida e continua valendo mesmo quando o
     site é republicado.

### Parte 4 · Definir o remetente (`MAIL_FROM`)

O remetente fica no arquivo `wrangler.jsonc` (variável `MAIL_FROM`), porque
ele é recriado a cada publicação pela `main`. **Só troque para o endereço do
seu domínio depois que a Parte 2 estiver verificada**, senão o Resend recusa
o envio. Exemplo já verificado:

```jsonc
"MAIL_FROM": "Ana Mediolaro <resultado@anamediolaro.com.br>"
```

Depois de editar o `wrangler.jsonc`, faça o merge na `main` (a Cloudflare
republica sozinha). Se preferir, é só me pedir que eu faço essa troca.

### Parte 5 · Testar

8. Faça o teste no site usando **o seu próprio e-mail** e clique em
   **Ver meu resultado**. Confira a caixa de entrada (e a de spam na
   primeira vez). Antes do domínio verificado, teste com o e-mail da conta
   do Resend.

**Alternativa por terminal** (para quem prefere): a chave também pode ser
gravada com `npx wrangler secret put RESEND_API_KEY` e a publicação feita com
`npx wrangler deploy`.

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
pelo diálogo de impressão do navegador, com identidade visual da clínica.

O relatório começa por um cabeçalho enxuto (marca, título e subtítulo) e um
**quadro de identificação da pessoa** com nome, e-mail, data e resultado
(monta-se a partir dos dados informados na etapa final do teste). Em seguida
vêm o banner do resultado e o conteúdo: como o resultado é construído,
distribuição das respostas, o que ele pode indicar, perfil em detalhe,
tendências, pontos de atenção, ambientes favoráveis, caminhos profissionais,
temperamento em detalhe e o aviso de uso responsável.

As seções fluem de forma contínua (sem grandes espaços em branco entre as
páginas) e a seção de compartilhamento no Instagram **não** entra no PDF, por
ser um documento voltado à pessoa. Dica ao imprimir: em "Mais definições",
desligue "Cabeçalhos e rodapés" para tirar a data e o endereço que o
navegador adiciona automaticamente.

Hoje o PDF é salvo pela própria pessoa no navegador. Anexar o PDF
automaticamente ao e-mail é possível numa evolução futura, mas exigiria
geração de PDF no servidor.

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
