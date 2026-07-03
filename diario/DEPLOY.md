# Como colocar o Diário das Emoções no ar (passo a passo para o Gabriel)

Tudo acontece dentro da pasta `diario/` deste repositório. Você vai precisar
do terminal, do Node.js instalado e de acesso à conta Cloudflare da Ana
(a mesma do site). Onde estiver escrito `TERMINAL`, copie e cole o comando.

Importante: rode todos os comandos DENTRO da pasta `diario/`. Se rodar na
raiz do repositório, o comando publica o site institucional, não o app.

---

## Parte 1 · Preparar (uma vez só)

1. Abra o terminal e entre na pasta do app:

   ```
   cd diario
   npm install
   npx wrangler login
   ```

   O `wrangler login` abre o navegador; entre com a conta Cloudflare da Ana.

2. Crie o banco de dados:

   ```
   npx wrangler d1 create diario-das-emocoes
   ```

   A resposta mostra um `database_id` (um código com traços). Copie esse
   código e cole no arquivo `wrangler.jsonc`, no lugar do
   `00000000-0000-0000-0000-000000000000`.

3. Guarde a chave da IA como segredo (a Ana cria a chave em
   console.anthropic.com, menu API Keys):

   ```
   npx wrangler secret put ANTHROPIC_API_KEY
   ```

   Cole a chave quando o terminal pedir. Ela não fica em nenhum arquivo.

4. Crie as chaves das notificações (push). Gere o par uma única vez:

   ```
   npx web-push generate-vapid-keys
   ```

   (se o comando não existir: `npm install -g web-push` e repita).
   Depois guarde as duas como segredo:

   ```
   npx wrangler secret put VAPID_PUBLIC_KEY
   npx wrangler secret put VAPID_PRIVATE_KEY
   npx wrangler secret put VAPID_SUBJECT
   ```

   No VAPID_SUBJECT, cole: `mailto:ana.mediolaro@gmail.com`

---

## Parte 2 · Publicar

Sempre que precisar publicar (primeira vez ou atualização):

```
npm run deploy
```

Esse único comando monta o app, aplica as mudanças de banco e publica.
No final ele mostra o endereço `https://diario-das-emocoes.<conta>.workers.dev`.

Para usar um endereço próprio (ex: `diario.anamediolaro.com`), no painel
Cloudflare: Workers e Pages → diario-das-emocoes → Settings → Domains &
Routes → Add → Custom domain.

---

## Parte 3 · Criar a conta da Ana (uma vez só)

Escolham juntos uma senha forte (10+ caracteres). Depois:

```
node scripts/criar-terapeuta.mjs "Ana Mediolaro" ana.mediolaro@gmail.com "A-SENHA-ESCOLHIDA" > conta.sql
npx wrangler d1 execute DB --remote --file=conta.sql
rm conta.sql
```

A senha vira um código embaralhado (hash) antes de ir para o banco; ela não
fica gravada em lugar nenhum. A área da Ana fica em `/pro` no endereço do app.

---

## Parte 4 · Áudios da Ana (quando os arquivos estiverem prontos)

1. Crie o cofre de arquivos:

   ```
   npx wrangler r2 bucket create diario-audios
   ```

2. No `wrangler.jsonc`, remova as barras de comentário do bloco
   `r2_buckets` (as linhas que começam com `//`).

3. Suba cada arquivo MP3:

   ```
   npx wrangler r2 object put diario-audios/respiracao-ansiedade.mp3 --file=./respiracao-ansiedade.mp3
   ```

4. Cadastre o áudio no banco (título, emoções que o disparam e duração em
   segundos). Exemplo:

   ```
   npx wrangler d1 execute DB --remote --command "INSERT INTO audio (id, titulo, emocoes_associadas, chave_r2, duracao_seg, camada1) VALUES ('aud-respiracao', 'Respiração para ansiedade', '[\"ansios\",\"medo\"]', 'respiracao-ansiedade.mp3', 240, 1)"
   ```

   `camada1 = 1` marca o áudio que aparece no menu "Preciso de apoio agora".

5. Publique de novo: `npm run deploy`

---

## Dia a dia da Ana (sem terminal)

- Convidar paciente: área `/pro`, botão "+ Convidar novo paciente". O link
  aparece uma vez; é só mandar no WhatsApp do paciente.
- Alertas no celular dela: dentro de `/pro`, Configurações, "Ativar alertas
  neste aparelho" (uma vez por aparelho).
- Contato de emergência do protocolo: mesmo lugar, campo de contato.

## Se algo der errado

- `npm run deploy` reclama de login: rode `npx wrangler login` de novo.
- Mudou o banco e deu erro: confira se o `database_id` no `wrangler.jsonc`
  é o do passo 2 da Parte 1.
- O assistente de IA aparece "indisponível": confira o segredo
  `ANTHROPIC_API_KEY` (Parte 1, passo 3) e o crédito da conta Anthropic.
- Notificações não chegam: confira os três segredos VAPID (Parte 1, passo 4)
  e se o paciente ativou os lembretes dentro do app.
