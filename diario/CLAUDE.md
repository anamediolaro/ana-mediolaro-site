# PROMPT PARA O CLAUDE CODE
# Projeto: Diário das Emoções · Ana Mediolaro
# Cole este arquivo inteiro como primeira mensagem, ou salve como CLAUDE.md na raiz do projeto.

Você vai construir um aplicativo web completo chamado Diário das Emoções. Este documento tem tudo: contexto, funcionalidades, identidade visual, especificação de cada tela, stack e critérios de aceite. Leia o documento inteiro antes de escrever qualquer código. Não invente funcionalidade que não está aqui. Não mude a identidade visual. Em dúvida técnica, proponha em uma frase e espere aprovação.

Se existir na pasta o arquivo `layout-completo-app-diario-das-emocoes-v2.html`, abra no navegador: ele é o mockup aprovado das 14 telas e é a referência visual final. O código do mockup pode ser reaproveitado como base de estilos.

ORDEM DE EXECUÇÃO (não pule etapas):
1. Fluxo do paciente: onboarding, home, check-in em 6 passos, histórico, padrões com calendário
2. Área profissional: login, lista de pacientes, perfil, anotações, tarefas, exportar PDF
3. Recompensas: estrelas, níveis, conquistas, cartão compartilhável
4. Apoio: menu de técnicas sem IA, depois assistente de RPD com IA e protocolo de segurança
Ao final de cada etapa, rode localmente e me mostre antes de seguir.

---

# Diário das Emoções, app para pacientes da Ana Mediolaro

Você vai construir um aplicativo web chamado **Diário das Emoções**. Leia este documento inteiro antes de escrever qualquer código.

---

## 1. Contexto

Sou Ana Mediolaro, psicóloga clínica (CRP 06/85707) e hipnoterapeuta. Atendo profissionais de alta performance: executivos, advogados, médicos, empreendedores. Hoje uso a função "Diário das Emoções" do sistema PsicoManager, mas quero um app próprio, melhor e com a minha identidade.

**Objetivo do app:** o paciente registra emoções e sentimentos entre as sessões, pelo celular, em menos de 1 minuto. Eu acesso uma área profissional e vejo os registros de cada paciente antes da sessão.

---

## 2. O que o PsicoManager faz hoje (referência mínima, não teto)

Cada registro do paciente tem:
- Nível de humor (Muito feliz, Normal, etc) com data e hora
- Sentimentos marcados (ex: ALEGRE, TRANQUILO)
- "Que atividade estava fazendo?" (ex: Trabalho)
- "Quais pensamentos teve?" (texto livre)
- "Qual ação você tomou?" (texto livre)

Os registros aparecem numa linha do tempo vertical com filtro por período. Existe também um módulo de **Tarefas terapêuticas**: eu crio uma tarefa com orientações (ex: "Refletir sobre autoperdão em relação à mãe"), o paciente responde, e eu adiciono anotações minhas em cada tarefa.

Isso é o piso. O app precisa fazer isso e mais.

---

## 3. O que precisa ser melhor que o PsicoManager

1. **Check-in guiado, não formulário.** Uma pergunta por tela, estilo wizard. O paciente não vê um formulário frio, ele conversa com o app.
2. **Pergunta do corpo.** Depois do pensamento, perguntar: "E no corpo, onde você sentiu?" com opções (cabeça, garganta, peito, coração acelerado, estômago, ombros e pescoço, mãos, respiração curta, corpo todo, não percebi nada). Essa pergunta não existe no PsicoManager e é central no meu método (Linguagem do Corpo).
3. **Vocabulário adulto.** Nada de emoji infantil. Emoções como: sobrecarregado(a), culpado(a), impotente, aliviado(a), esperançoso(a), frustrado(a). Rostos minimalistas em SVG line-art para a escala de humor, não emoji amarelo.
4. **Tela de Padrões para o paciente:** emoções mais frequentes, contextos que mais aparecem, onde o corpo mais sente, humor médio. Frase de abertura: "O que se repete tem algo a dizer."
5. **Resumo automático por paciente na minha área:** humor médio, emoções recorrentes, últimos registros, tudo visível em segundos antes da sessão.
6. **Exportação em PDF** dos registros de um paciente por período, para eu anexar ao prontuário.

---

## 4. Fluxo do paciente (mobile-first, é onde ele vai usar)

**Primeiro acesso:**
- Paciente entra por um link único que eu envio pelo WhatsApp (cada paciente tem seu código/link, sem senha complicada)
- Vê boas-vindas curtas e aviso claro: "Seus registros ficam visíveis para você e para a sua psicóloga. Ninguém mais tem acesso." (LGPD, consentimento explícito com um toque)

**Check-in (wizard, 6 passos):**
1. "Como você está se sentindo agora?" Escala de 5 níveis: Muito mal, Mal, Neutro, Bem, Muito bem
2. "Que emoções estão presentes?" Chips multi-seleção em dois grupos:
   - Agradáveis: Calmo(a), Grato(a), Alegre, Confiante, Motivado(a), Orgulhoso(a), Aliviado(a), Esperançoso(a), Amado(a)
   - Desagradáveis: Ansioso(a), Triste, Irritado(a), Frustrado(a), Culpado(a), Envergonhado(a), Sobrecarregado(a), Com medo, Solitário(a), Cansado(a), Impotente
   - Abaixo dos grupos, campo livre: "Não achou a palavra? Escreva a sua." A emoção escrita entra no registro como as outras E vira um chip pessoal daquele paciente nos próximos check-ins, num grupo "Suas palavras". O vocabulário do paciente é dado clínico, preservar exatamente como ele escreveu.
3. "O que você estava fazendo?" Chips (Trabalho, Reunião, Família, Trânsito, Estudos, Exercício, Redes sociais, Descanso, Conversa difícil, Sozinho(a) em casa) + campo livre
4. "O que passou pela sua cabeça?" Texto livre. Dica na tela: "Escreva o pensamento como ele veio, sem corrigir e sem julgar."
5. "E no corpo, onde você sentiu?" Chips do corpo (lista do item 3.2)
6. "O que você fez com isso?" Texto livre. Dica: "A ação que você tomou, ou a que não tomou. As duas contam."

Passos 3 a 6 podem ser pulados. Passos 1 e 2 são obrigatórios. Ao salvar, toast "Registro salvo" e volta para a home.

**Outras telas do paciente:**
- Home: saudação com nome ("Boa tarde, Tomio."), botão grande "Registrar como me sinto", último registro, contagem de registros do dia
- Histórico: linha do tempo agrupada por dia (Hoje, Ontem, data por extenso)
- Padrões: estatísticas descritas no item 3.4
- Tarefas: lista de tarefas que eu criei para ele, com orientações, campo de resposta dele e status (pendente/respondida)

---

## 5. Área profissional (minha)

Acesso separado, com login de verdade (e-mail e senha, só eu). Funções:

- **Lista de pacientes** com: nome, data do último registro, humor médio dos últimos 30 dias, alerta visual se o paciente está há mais de X dias sem registrar
- **Perfil do paciente:** linha do tempo completa, filtro por período, resumo (humor médio, emoções recorrentes, contextos recorrentes, mapa do corpo)
- **Minhas anotações** em qualquer registro (só eu vejo, o paciente não)
- **Tarefas:** criar tarefa com título e orientações para um paciente, ver a resposta dele, anotar
- **Gerar link de convite** para novo paciente (nome + link único gerado)
- **Exportar PDF** dos registros de um paciente por período
- **Arquivar paciente** (sai da lista ativa, dados preservados)

---

## 6. Identidade visual

Este app segue a identidade dos meus projetos terapêuticos, não a do PsicoManager.

- **Paleta:** verde profundo #2A3530, sage #5C6B5E, creme #F0EBDF, papel #FAF8F2, dourado #C9A566
- **Fontes:** Lora (títulos e destaques em itálico, palavra-chave do título em dourado), Poppins (corpo e interface, pesos 300 a 600)
- **Estilo:** editorial, calmo, adulto. Bordas arredondadas generosas (14 a 18px), muito respiro, sombras quase imperceptíveis. Nada de azul de software de gestão, nada de mascote, nada de emoji.
- Escala de humor com rostos minimalistas desenhados em SVG (círculo, dois pontos de olho, boca em curva), traço fino
- Textos da interface: frases curtas, tom acolhedor sem ser meloso. Exemplos já aprovados: "Como você está agora? Não existe resposta certa. Existe a sua." / "Emoções contraditórias convivem, isso é normal." / "O corpo fala antes da mente perceber."

**Proibido nos textos:** travessões (usar vírgula, dois pontos, ponto ou parênteses), jargão de autoajuda genérica ("jornada", "desbloquear", "mergulhar fundo").

---

## 6B. Funções baseadas em pesquisa sobre uso real de apps de humor

Pesquisa acadêmica e reviews de usuários mostram padrões claros. Implementar:

1. **Calendário do mês colorido por humor.** Usuários valorizam visualizar os registros em calendário para enxergar tendências. Cada dia recebe a cor do humor médio (escala do sage ao dourado). Vira a primeira coisa da tela Padrões.
2. **Lembrete configurável pelo paciente, máximo 2 por dia.** Lembretes ajudam, mas excesso de notificação causa abandono. O paciente escolhe horário e frequência (nenhum, 1x ou 2x ao dia). Texto do lembrete acolhedor e variado, nunca alarmista, nada de "você não registrou hoje!". Exemplo: "Um minuto para você. Como está agora?"
3. **Botão "Quero falar disso na sessão".** Pesquisas mostram que compartilhar registros com o profissional para orientar a consulta é uma das funções mais valorizadas. O paciente marca um registro com essa flag; na minha área, esses registros aparecem destacados no topo do perfil dele. Chego na sessão sabendo o que ele quer trazer.
4. **Fechar o ciclo com ação.** A maior lacuna apontada na literatura: apps coletam e mostram dados, mas não ajudam a agir. Depois de salvar um registro com humor 1 ou 2, oferecer (nunca impor) um áudio curto meu: respiração, ancoragem, acolhimento. Os áudios vêm do meu canal AtuaMente Alinhada, mapeados por emoção (ansiedade → áudio de respiração; culpa → áudio de autoperdão). Estrutura: tabela de áudios com título, emoções associadas e URL do arquivo.
5. **Retorno sem culpa.** Usuários abandonam apps por pensamento tudo-ou-nada depois de dias sem registrar. Se o paciente voltar após um intervalo, a home mostra: "Você voltou. É isso que importa." Nunca mostrar sequência quebrada, streak perdido ou contagem de dias ausente.
6. **Pergunta opcional de sono no primeiro check-in do dia.** Usuários valorizam registrar sono junto com humor. Uma pergunta só, chips: Dormi bem, Dormi mal, Acordei cansado(a), Insônia. Aparece uma vez por dia, pode pular.
7. **Registro sem vergonha do negativo.** Estudos mostram que usuários evitam registrar humores negativos. Todos os textos do app tratam emoção desagradável como informação, não como falha. Nada de cores de alerta vermelhas em humor baixo, nada de "que pena!".

---

## 6C. Recompensas e gamificação (base: terapia cognitivo comportamental)

Princípio inegociável: recompensar comportamento que o paciente controla (registrar, concluir tarefa), nunca resultado que ele não controla (humor). Humor baixo jamais reduz pontuação ou tira conquista. Nada de ranking ou comparação entre pacientes: em saúde mental, comparação social é contraproducente e expõe quem é paciente, quebrando sigilo.

1. **Estrelas por comportamento:**
   - Registro feito (completo ou parcial, vale igual): 1 estrela
   - Tarefa terapêutica concluída: 5 estrelas
   - Semana com 3 ou mais registros: 3 estrelas de bônus
   - Estrelas nunca expiram e nunca são descontadas

2. **Níveis por acúmulo de estrelas**, com nomes do meu método: Percepção (0 a 24), Consciência (25 a 74), Reprogramação (75 a 149), Expansão (150+). Ao subir de nível, tela de celebração sóbria na identidade do app, com uma frase minha por nível (eu forneço os textos).

3. **Conquistas (medalhas)** por marcos de comportamento: Primeiro registro, Primeira semana com 3 registros, Primeira tarefa respondida, 10 registros, 30 registros, Primeira emoção escrita com as próprias palavras, e a conquista "Você voltou" (retomou depois de 7+ dias parado, recompensa o retorno em vez de punir a ausência). Visual: traço fino, dourado sobre creme, elegante. Nada de estética de joguinho.

4. **Recorde pessoal:** melhor sequência de dias e mês com mais registros, na tela Padrões. A única comparação é do paciente com ele mesmo.

5. **Cartão compartilhável:** ao desbloquear conquista ou nível, o app gera uma imagem 1080x1920 (formato story) na identidade visual do projeto, com texto tipo "30 dias treinando minha saúde mental" e selo "Diário das Emoções · Ana Mediolaro". Zero dado clínico na imagem: sem humor, sem emoções, sem datas de registro. Botão nativo de compartilhar. O paciente decide se divulga. Arquivo nomeado com palavras-chave (ex: treinando-saude-mental-30-dias.jpg).

6. **Na minha área:** vejo estrelas, nível e conquistas de cada paciente no perfil dele, para usar como reforço na sessão.

Acrescentar ao modelo de dados:
- **pontuacao:** paciente_id, estrelas_total, nivel_atual
- **conquista:** id, paciente_id, tipo, desbloqueada_em

---

## 6D. Apoio entre sessões: técnicas guiadas e assistente de TCC (com limites rígidos)

Princípio: IA para técnica estruturada, nunca para crise. Crise é protocolo humano.

**Camada 1, botão "Preciso de apoio agora" (sem IA, prioridade de implementação):**
- Botão visível na home, acima da dobra
- Abre menu fixo de técnicas: Respiração guiada (áudio da Ana, 3 a 5 min), Grounding 5-4-3-2-1 (tela passo a passo), Técnica STOP (Pare, Respire, Observe, Prossiga, tela guiada)
- Tudo determinístico, funciona offline, zero dependência de API
- Ao final de cada técnica, pergunta opcional: "Quer registrar como está agora?" (leva ao check-in)

**Camada 2, assistente de RPD (registro de pensamento disfuncional) com IA:**
- A IA guia o paciente por UM fluxo, e somente um: Situação → Emoção e intensidade → Pensamento automático → Evidências a favor → Evidências contra → Pensamento alternativo → Reavaliar intensidade
- As perguntas socráticas de cada etapa são fixas (a Ana fornece o roteiro); a IA apenas adapta a linguagem à resposta do paciente e pede esclarecimento quando a resposta foge da etapa
- Proibições absolutas no system prompt do assistente: não diagnosticar, não interpretar, não aconselhar fora do fluxo do RPD, não conversar sobre outros assuntos (redirecionar gentilmente ao fluxo), não se apresentar como psicóloga, como Ana ou como profissional de saúde. Ele se apresenta como "assistente do Diário das Emoções"
- Todo RPD concluído é salvo no perfil do paciente e destacado para a Ana revisar antes da sessão
- RPD concluído vale 3 estrelas (comportamento, não resultado)

**Camada de segurança (acima de tudo, inclusive da Camada 2):**
- Detector de risco em duas frentes: lista de palavras-chave + classificação da própria IA a cada turno
- Ao detectar risco: o assistente interrompe imediatamente, sem tentar conduzir ou acolher com conversa, e a tela vira protocolo fixo: CVV 188 (24h, ligação e chat), SAMU 192, e o contato de emergência definido pela Ana no painel
- O evento fica registrado e gera notificação para a Ana
- Falha segura: se a API estiver fora do ar ou a resposta vier malformada, o assistente encerra e mostra a Camada 1

**Consentimento e transparência:**
- Termo no primeiro uso do assistente: o paciente sabe que é IA, sabe o que ela faz e o que não faz, sabe que a Ana lê os RPDs
- Aviso permanente e discreto na tela do assistente: "Assistente do app. Não substitui a sua psicóloga."

Acrescentar ao modelo de dados:
- **rpd:** id, paciente_id, situacao, emocao, intensidade_inicial, pensamento_automatico, evidencias_favor, evidencias_contra, pensamento_alternativo, intensidade_final, criado_em
- **evento_risco:** id, paciente_id, timestamp, origem (palavra-chave ou classificador), notificada_terapeuta (bool)

---

## 7. Stack e infraestrutura

Minha infra atual é Cloudflare (já tenho conta e Workers em produção, quem faz deploy é o Gabriel, meu funcionário de marketing). Priorize:

- **Frontend:** app web responsivo mobile-first (React ou similar), instalável como PWA (ícone na tela do celular, funciona como app)
- **Backend + banco:** Cloudflare Workers + D1 (SQLite) ou equivalente dentro do ecossistema Cloudflare Pages/Workers
- **Auth:** paciente entra por token único no link (sem senha); terapeuta com e-mail e senha com hash
- **Dados sensíveis:** isso é dado de saúde. HTTPS obrigatório, token de paciente impossível de adivinhar, nenhum dado em URL de analytics, sem rastreadores de terceiros
- **Offline básico:** se o paciente registrar sem internet, guardar local e sincronizar quando voltar (importante, ele registra no metrô, no elevador)

Se alguma dessas escolhas não fizer sentido tecnicamente, proponha alternativa e explique em uma frase antes de implementar.

---

## 8. Modelo de dados (mínimo)

- **terapeuta:** id, nome, email, senha_hash
- **paciente:** id, nome, token_acesso, criado_em, arquivado (bool)
- **registro:** id, paciente_id, timestamp, nivel (1 a 5), emocoes (lista), emocoes_livres (lista, palavras do paciente), atividades (lista), atividade_texto, pensamento, corpo (lista), acao, sono (opcional), falar_na_sessao (bool)
- **emocao_pessoal:** id, paciente_id, palavra (vocabulário próprio que vira chip)
- **anotacao:** id, registro_id, texto, criado_em (visível só para a terapeuta)
- **tarefa:** id, paciente_id, titulo, orientacoes, resposta_paciente, anotacao_terapeuta, status, criado_em
- **audio:** id, titulo, emocoes_associadas (lista), url_arquivo, duracao
- **lembrete:** paciente_id, frequencia (0, 1 ou 2 por dia), horarios

---

## 9. Critérios de aceite

1. Paciente abre o link no celular, faz um registro completo em menos de 1 minuto e vê o registro no histórico
2. Registro parcial (só passos 1 e 2) salva normalmente
3. Eu entro na área profissional e vejo o registro desse paciente em tempo real, com resumo no topo
4. Consigo criar uma tarefa, o paciente responde, eu anoto
5. Exporto um PDF legível dos registros de um período
6. O app funciona bonito num iPhone e num Android baratinho
7. Nenhum paciente consegue ver dados de outro paciente, nem por URL, nem por token errado

---

## 10. Como trabalhar

- Comece pelo fluxo do paciente (é o coração), depois a área profissional, depois PDF e tarefas
- Me mostre o app rodando localmente antes de configurar deploy
- Commits pequenos com mensagens claras
- No final, escreva um passo a passo de deploy no Cloudflare simples o bastante para o Gabriel executar sozinho

---

# ANEXO: ESPECIFICAÇÃO VISUAL DETALHADA (extraída do layout aprovado)

## Tokens

Cores (CSS variables):
- --verde: #2A3530 (fundo de botão primário, textos, nav ativa)
- --sage: #5C6B5E (textos secundários, barras de gráfico)
- --creme: #F0EBDF (fundo geral do app)
- --papel: #FAF8F2 (fundo dos cards e das telas)
- --ouro: #C9A566 (destaques, palavra em itálico dos títulos, medalhas, flag de sessão)
- --linha: rgba(42,53,48,.14) (bordas)
- Proibido: vermelho de alerta, azul de software, qualquer cor fora da paleta

Fontes (Google Fonts):
- Lora: títulos e destaques. A palavra-chave de cada título vai em itálico dourado (ex: "Seus <em>padrões</em>")
- Poppins: interface e corpo, pesos 300 a 600

Componentes base:
- Botão primário: fundo verde, texto creme, border-radius 16px, padding generoso
- Botão fantasma: sem fundo, borda 1px --linha, texto sage
- Chips de seleção: pílula branca com borda; selecionado vira fundo verde com texto creme
- Chips "Suas palavras" (emoções escritas pelo paciente): borda tracejada dourada, texto dourado
- Cards: fundo branco, borda 1px --linha, border-radius 18px
- Labels de grupo: caixa alta, letter-spacing largo, dourado, 11px
- Navegação inferior fixa com 4 abas: Início, Histórico, Padrões, Estrelas. Aba ativa ganha ponto dourado embaixo
- Rostos da escala de humor: SVG traço fino (círculo, dois pontos de olho, boca em curva). Nunca emoji

## Detalhes por tela (14 telas aprovadas)

1. BOAS-VINDAS: título "Bem-vindo(a) ao seu diário.", campo de nome, botão Começar, aviso LGPD: "Seus registros ficam visíveis para você e para a sua psicóloga, que acompanha o seu processo. Ninguém mais tem acesso."

2. HOME: saudação por horário + primeiro nome ("Boa tarde, Tomio."), subtítulo "Como você está agora? Não existe resposta certa. Existe a sua.", botão primário "Registrar como me sinto", botão fantasma "Preciso de apoio agora" logo abaixo (sempre acima da dobra), card do último registro.

3. CHECK-IN HUMOR (passo 1): barra de progresso de 6 segmentos no topo, pergunta em Lora, 5 rostos SVG com rótulos Muito mal, Mal, Neutro, Bem, Muito bem. Selecionado: círculo vira verde, traço dourado, escala 1.08.

4. CHECK-IN EMOÇÕES (passo 2): grupos Agradáveis e Desagradáveis + grupo "Suas palavras" com chips tracejados dourados + campo "Não achou a palavra? Escreva a sua." Dica: "Emoções contraditórias convivem, isso é normal."

5. CHECK-IN CORPO (passo 5): chips Cabeça, Garganta, Peito, Coração acelerado, Estômago, Ombros e pescoço, Mãos, Respiração curta, Corpo todo, Não percebi nada. Dica: "O corpo fala antes da mente perceber."

6. PÓS-REGISTRO COM HUMOR 1 OU 2: tela "Registrado. Obrigada por se olhar." + oferta de áudio da Ana mapeado pela emoção marcada (ex: ansiedade puxa "Respiração para ansiedade · 4 min"), botão dourado "Ouvir agora" e fantasma "Agora não". Texto pequeno: "Sugestão opcional. Nenhum ponto se perde ao pular."

7. HISTÓRICO: linha do tempo agrupada por dia (Hoje, Ontem, data por extenso). Registro marcado "Quero falar disso na sessão" ganha borda esquerda dourada de 3px e a flag "✦ Quero falar disso na sessão".

8. PADRÕES: calendário do mês com dias coloridos pelo humor médio em 5 tons do sage ao dourado (h1 #8a9187, h2 #a8ab98, h3 #c3bda4, h4 #d5bc8a, h5 #C9A566), dia sem registro fica creme. Cards de recorde pessoal (melhor sequência, humor médio do mês) e barras de emoções, contextos e corpo mais frequentes.

9. ESTRELAS: box verde escuro com nível atual em Lora itálico dourado, contagem de estrelas, barra de progresso e "X estrelas para o nível Y". Grade de medalhas 3 colunas, traço fino dourado sobre branco; bloqueadas ficam com opacidade 35%. Medalhas: Primeiro registro, Semana com 3 registros, Você voltou, Primeira palavra sua, 30 registros, Primeira tarefa.

10. CELEBRAÇÃO DE NÍVEL: tela centrada, círculo dourado com estrela, "Você chegou à Consciência." + frase da Ana por nível + botões Continuar e Compartilhar conquista. Sóbria, sem confete.

11. CARTÃO COMPARTILHÁVEL: imagem 1080x1920 gerada pelo app. Fundo verde #2A3530, selo "DIÁRIO DAS EMOÇÕES" em caixa alta dourada no topo, medalha em traço dourado, texto grande em Lora "30 dias treinando minha saúde mental." com destaque em itálico dourado, rodapé "Diário das Emoções · Ana Mediolaro · @anamediolaro.oficial". Zero dado clínico. Nome de arquivo com palavras-chave (treinando-saude-mental-30-dias.jpg).

12. MENU DE APOIO: título "Estou aqui. Vamos um passo de cada vez." + "Não precisa estar em crise para usar." Lista: Respiração guiada (áudio da Ana, 4 min), Grounding 5-4-3-2-1, Técnica STOP, Examinar um pensamento (assistente). No rodapé, bloco discreto: "Se você estiver pensando em se machucar, toque aqui. Tem gente de verdade pronta para te ouvir agora." que abre a tela de protocolo.

13. TÉCNICA GUIADA (ex: grounding): número gigante em Lora dourado (64px+), instrução curta em Lora, subtexto em Poppins light, botão de conclusão do passo ("Toquei nas 4") e "Sair da técnica". Uma instrução por tela.

14. ASSISTENTE DE RPD: formato de conversa. Balões do assistente: brancos com borda, canto inferior esquerdo reto. Balões do paciente: verdes, texto creme. Acima de cada etapa, etiqueta em caixa alta dourada com o nome da etapa (Situação, Emoção, Pensamento automático, Evidências a favor, Evidências contra, Pensamento alternativo, Reavaliação). Rodapé fixo: "Assistente do app. Não substitui a sua psicóloga."

15. PROTOCOLO DE SEGURANÇA: título "Agora é hora de falar com uma pessoa.", cards com número gigante 188 (CVV · telefone e chat, 24 horas, gratuito) e 192 (SAMU), botão primário "Ligar para o CVV agora" (tel:188), botão fantasma "Mensagem para a Dra. Ana" com aviso: "A mensagem fica registrada. O app não é canal de emergência e a resposta pode não ser imediata." Tela calma, mesma paleta, sem vermelho.

ÁREA PROFISSIONAL (desktop e mobile):
- LISTA: pacientes em cards. Quem marcou registro para a sessão sobe para o topo com borda esquerda dourada e a linha "✦ 1 registro para a sessão · RPD novo". Paciente parado há 7+ dias ganha ponto dourado antes do nome e "sem registrar há X dias". Botão "+ Convidar novo paciente" gera link único.
- PERFIL: cabeçalho com nível, estrelas e total de registros. Seção "Para a próxima sessão" com os registros flagados. Cards de RPD concluído mostrando o pensamento examinado e a queda de intensidade (ex: "de 85 para 40"). Anotações da terapeuta em bloco creme com borda tracejada dourada, rótulo "Minha anotação", invisíveis para o paciente. Botão "Exportar PDF do período".

---

# PRIMEIRA MENSAGEM DEPOIS DESTE PROMPT

Depois de ler tudo, responda com: (1) a estrutura de pastas proposta, (2) o schema do banco D1, (3) qualquer decisão técnica que você quer validar. Espere meu ok e comece pela Etapa 1.
