/**
 * Questionário de Preferências Psicológicas e Profissionais
 * Mapa de pontuação e banco dos 16 resultados.
 *
 * Correção 100% determinística — nenhuma IA participa do cálculo.
 * Conteúdo dos resultados: documento aprovado "Tipos psicológicos —
 * versão revisada e simplificada: de Jung ao MBTI e aos temperamentos
 * de Keirsey" (julho/2026). Não alterar sem aprovação da responsável.
 */

// ─── Perguntas ──────────────────────────────────────────────────────────────
// dim: par de preferências avaliado. Opção "a" pontua a 1ª letra do par,
// opção "b" pontua a 2ª letra (mapa aprovado no gabarito da folha de respostas:
// E/I → 1,5,9,13,17 · S/N → 2,6,10,14,18,21,24 · T/F → 3,7,11,15,19,22,25 ·
// J/P → 4,8,12,16,20,23,26).

export const QUESTIONS = [
  { n: 1, dim: 'EI', text: 'Numa festa, você gosta mais de:',
    a: 'Conversar com muita gente e conhecer novas pessoas',
    b: 'Conversar com poucos, já conhecidos' },
  { n: 2, dim: 'SN', text: 'Você se considera uma pessoa mais:',
    a: 'Realista',
    b: 'Imaginativa' },
  { n: 3, dim: 'TF', text: 'Na maioria das situações, você tende a ser uma pessoa:',
    a: 'Objetiva, que se guia pela cabeça',
    b: 'Que se guia pelo sentimento e coração' },
  { n: 4, dim: 'JP', text: 'Em geral, você é uma pessoa:',
    a: 'Pontual e espera que os outros também o sejam',
    b: 'Tolerante com seus próprios atrasos e com os atrasos dos outros' },
  { n: 5, dim: 'EI', text: 'Numa viagem de ônibus (SP–Santos), você:',
    a: 'Procura conversar com a pessoa desconhecida sentada ao lado',
    b: 'Não vê muito o que conversar com uma pessoa desconhecida' },
  { n: 6, dim: 'SN', text: 'Ao realizar as tarefas comuns (no seu trabalho, em casa), você:',
    a: 'Segue o senso comum e os procedimentos de rotina',
    b: 'Fica procurando um modo novo e diferente de fazê-las' },
  { n: 7, dim: 'TF', text: 'Nas suas decisões e avaliações sobre outras pessoas, pesa mais:',
    a: 'O que é certo ou errado, por muito que compreenda os erros pessoais de cada um',
    b: 'Preservar um clima cordial entre as pessoas, deixando o certo e o errado em segundo lugar' },
  { n: 8, dim: 'JP', text: 'Você é uma pessoa mais:',
    a: 'Organizada e metódica',
    b: 'Improvisadora e não metódica' },
  { n: 9, dim: 'EI', text: 'No seu subgrupo familiar, de trabalho, de amigos etc., você:',
    a: 'Acompanha de perto as novidades',
    b: 'Não se interessa muito em saber das novidades' },
  { n: 10, dim: 'SN', text: 'Você é uma pessoa que se liga mais:',
    a: 'À sua experiência da realidade passada e presente',
    b: 'À sua intuição das possibilidades futuras' },
  { n: 11, dim: 'TF', text: 'Você é mais sensível:',
    a: 'À justiça e coerência com seus princípios',
    b: 'Às condições e circunstâncias pessoais dos outros, deixando a justiça em segundo lugar' },
  { n: 12, dim: 'JP', text: 'Você se sente mais à vontade:',
    a: 'Planejando e esquematizando o que tem que fazer (trabalho, passeio etc.)',
    b: 'Não planejando e não esquematizando o que tem a fazer' },
  { n: 13, dim: 'EI', text: 'Você é uma pessoa que se identifica mais a ser:',
    a: 'Expansiva',
    b: 'Reservada' },
  { n: 14, dim: 'SN', text: 'Você se considera uma pessoa mais:',
    a: 'Ligada à realidade e aos fatos concretos',
    b: 'Mais ligada ao simbolismo e aos significados desses fatos' },
  { n: 15, dim: 'TF', text: 'Você é mais sensível a:',
    a: 'Argumentação lógica e convincente',
    b: 'Algo que toque suas emoções' },
  { n: 16, dim: 'JP', text: 'Você prefere desenvolver tarefas:',
    a: 'Com prazos e procedimentos definidos',
    b: 'Sem prazos nem procedimentos estabelecidos' },
  { n: 17, dim: 'EI', text: 'Numa reunião ou festa onde a maioria das pessoas é desconhecida, você tende mais a:',
    a: 'Ficar bastante tempo, cada vez mais animado',
    b: 'Ficar pouco tempo, sentindo-se deslocado' },
  { n: 18, dim: 'SN', text: 'Você se considera uma pessoa mais:',
    a: 'Prática',
    b: 'Teórica' },
  { n: 19, dim: 'TF', text: 'Ao tratar um assunto com outras pessoas, você se interessa em ser:',
    a: 'Objetivo',
    b: 'Pessoal' },
  { n: 20, dim: 'JP', text: 'Em geral, você se sente melhor em situações:',
    a: 'Estabelecidas e definidas',
    b: 'Abertas, com possibilidades variadas' },
  { n: 21, dim: 'SN', text: 'Deixando de lado leituras e assuntos técnicos, você em geral prefere autores com:',
    a: 'Linguagem direta e literal',
    b: 'Que se comunicam por metáforas e imagens' },
  { n: 22, dim: 'TF', text: 'Você se sente mais à vontade ao emitir:',
    a: 'Juízos lógicos sobre assuntos objetivos',
    b: 'Juízos de valor e de sensibilidade pessoal' },
  { n: 23, dim: 'JP', text: 'Você gosta mais de tarefas ligadas à:',
    a: 'Execução e distribuição',
    b: 'Projeto e criação' },
  { n: 24, dim: 'SN', text: 'Para você, os fatos:',
    a: 'Falam por si mesmos',
    b: 'São vistos como ilustrações de princípios ou ligados a um sistema de pensamento' },
  { n: 25, dim: 'TF', text: 'Tendo que avaliar outra pessoa, você é mais sensível:',
    a: 'Às leis do que às circunstâncias',
    b: 'Às circunstâncias do que às leis' },
  { n: 26, dim: 'JP', text: 'Supondo que a matéria permita e que você a domine, deixando de lado pressões como precisar de nota, você se sente mais à vontade numa prova:',
    a: 'Com questões definidas',
    b: 'Com questões onde você possa desenvolver livremente um assunto' },
];

export const TOTAL_QUESTIONS = QUESTIONS.length; // 26

export const DIMENSION_LABELS = {
  E: 'Extroversão', I: 'Introversão',
  S: 'Sensação',    N: 'Intuição',
  T: 'Pensamento',  F: 'Sentimento',
  J: 'Julgamento',  P: 'Percepção',
};

/**
 * Calcula a pontuação a partir das 26 respostas.
 * @param {Record<number,'a'|'b'>|Array} answers — respostas indexadas pelo nº da pergunta.
 * @returns {{E:number,I:number,S:number,N:number,T:number,F:number,J:number,P:number}}
 */
export function computeScores(answers) {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  for (const q of QUESTIONS) {
    const ans = answers[q.n];
    if (ans !== 'a' && ans !== 'b') {
      throw new Error(`Pergunta ${q.n} sem resposta válida.`);
    }
    const letter = ans === 'a' ? q.dim[0] : q.dim[1];
    scores[letter] += 1;
  }
  return scores;
}

/**
 * Monta o código de quatro letras comparando cada par.
 * Cada par tem número ímpar de perguntas (5, 7, 7 e 7), portanto não há empate.
 */
export function typeFromScores(scores) {
  return (
    (scores.E > scores.I ? 'E' : 'I') +
    (scores.S > scores.N ? 'S' : 'N') +
    (scores.T > scores.F ? 'T' : 'F') +
    (scores.J > scores.P ? 'J' : 'P')
  );
}

/** Correção completa: respostas → { scores, code, result }. */
export function correct(answers) {
  const scores = computeScores(answers);
  const code = typeFromScores(scores);
  const result = resultDescriptions[code];
  if (!result) throw new Error(`Código inesperado: ${code}`);
  return { scores, code, result };
}

// ─── Banco dos 16 resultados (conteúdo aprovado — não editar livremente) ────

export const resultDescriptions = {
  ISTP: {
    title: 'Solucionador prático',
    temperament: 'SP — Artesão',
    letters: 'Introversão, Sensação, Pensamento e Percepção',
    description: 'Tende a observar como as coisas funcionam e a agir de forma prática quando surge um problema. Costuma preferir autonomia, explicações objetivas e liberdade para ajustar o caminho conforme a situação.',
    tendencies: [
      'Analisa problemas concretos com calma e objetividade.',
      'Pode aprender bem testando, desmontando, montando e experimentando.',
      'Geralmente reage com rapidez em imprevistos e crises.',
      'Valoriza eficiência e soluções que funcionam na prática.',
    ],
    attentionPoints: [
      'Pode se desinteressar de rotinas longas ou controles excessivos.',
      'Pode guardar pensamentos e sentimentos, dificultando que os outros entendam o que precisa.',
      'Quando muito estimulado pelo desafio, pode agir antes de considerar todas as consequências.',
      'Pode abandonar uma tarefa depois que o problema principal foi resolvido.',
    ],
    favorableEnvironments: [
      'Autonomia para executar e aperfeiçoar tarefas.',
      'Problemas concretos, técnicos ou operacionais.',
      'Possibilidade de experimentar e ajustar soluções.',
      'Pouca microgestão e regras com finalidade clara.',
    ],
  },
  ESTP: {
    title: 'Agente de ação',
    temperament: 'SP — Artesão',
    letters: 'Extroversão, Sensação, Pensamento e Percepção',
    description: 'Tende a perceber rapidamente o que está acontecendo ao redor e a responder de forma direta. Costuma gostar de movimento, negociação, contato com pessoas e desafios que exigem decisão no presente.',
    tendencies: [
      'Identifica oportunidades e mudanças no ambiente.',
      'Pode ser persuasivo, prático e ágil na tomada de decisão.',
      'Lida bem com situações que exigem improviso.',
      'Costuma trazer energia para grupos e projetos.',
    ],
    attentionPoints: [
      'Pode se entediar com planejamento muito longo ou tarefas repetitivas.',
      'Pode priorizar o resultado imediato e subestimar efeitos futuros.',
      'A franqueza pode soar brusca em situações delicadas.',
      'Pode buscar estímulo e variedade além do necessário.',
    ],
    favorableEnvironments: [
      'Ritmo dinâmico e objetivos visíveis.',
      'Contato com pessoas, negociação ou ação prática.',
      'Liberdade para reagir a situações reais.',
      'Desafios com retorno rápido e espaço para iniciativa.',
    ],
  },
  ISFP: {
    title: 'Sensível e flexível',
    temperament: 'SP — Artesão',
    letters: 'Introversão, Sensação, Sentimento e Percepção',
    description: 'Tende a perceber detalhes do ambiente e a agir de acordo com valores pessoais. Costuma demonstrar cuidado mais por atitudes do que por discursos e pode ter forte sensibilidade estética, corporal ou prática.',
    tendencies: [
      'Observa necessidades concretas que outras pessoas não percebem.',
      'Pode ser gentil, acolhedor e pouco invasivo.',
      'Adapta-se ao momento sem precisar controlar tudo.',
      'Expressa criatividade por imagens, objetos, movimentos ou experiências.',
    ],
    attentionPoints: [
      'Pode evitar conflitos até que o desconforto fique grande.',
      'Pode ter dificuldade para explicar em palavras o que sente ou valoriza.',
      'Prazos muito rígidos e planejamento excessivo podem gerar desgaste.',
      'Pode aceitar mais do que gostaria para preservar a harmonia.',
    ],
    favorableEnvironments: [
      'Ambientes respeitosos, com liberdade e propósito concreto.',
      'Atividades que envolvam cuidado, estética, natureza ou experiência prática.',
      'Espaço para trabalhar no próprio ritmo.',
      'Relações com pouca pressão e comunicação genuína.',
    ],
  },
  ESFP: {
    title: 'Comunicador espontâneo',
    temperament: 'SP — Artesão',
    letters: 'Extroversão, Sensação, Sentimento e Percepção',
    description: 'Tende a se envolver com o presente, com as pessoas e com experiências concretas. Costuma perceber o clima do ambiente e contribuir para que as interações fiquem mais leves, acolhedoras e vivas.',
    tendencies: [
      'Facilita aproximações e participação em grupo.',
      'Demonstra afeto e apoio de maneira prática.',
      'Percebe mudanças de humor e necessidades imediatas.',
      'Pode trazer criatividade, entusiasmo e senso de oportunidade.',
    ],
    attentionPoints: [
      'Pode evitar assuntos desagradáveis ou decisões que só trarão resultado no futuro.',
      'Pode se sentir limitado por excesso de rotina e formalidade.',
      'Críticas frias ou públicas podem ser vividas de forma intensa.',
      'Pode assumir atividades demais por entusiasmo ou desejo de ajudar.',
    ],
    favorableEnvironments: [
      'Contato humano frequente e variedade.',
      'Resultados visíveis e impacto direto nas pessoas.',
      'Liberdade para se comunicar e criar experiências.',
      'Equipes acolhedoras e objetivos concretos.',
    ],
  },
  ISTJ: {
    title: 'Organizador responsável',
    temperament: 'SJ — Guardião',
    letters: 'Introversão, Sensação, Pensamento e Julgamento',
    description: 'Tende a confiar em fatos, experiência e procedimentos que já mostraram funcionar. Costuma levar compromissos a sério e prefere saber com clareza o que precisa ser feito, em que prazo e com qual padrão.',
    tendencies: [
      'É consistente, cuidadoso e atento a detalhes.',
      'Mantém rotinas e processos mesmo quando não recebe reconhecimento.',
      'Pode organizar informações e responsabilidades com precisão.',
      'Valoriza confiabilidade, continuidade e cumprimento de acordos.',
    ],
    attentionPoints: [
      'Mudanças sem explicação ou improvisos constantes podem gerar resistência.',
      'Pode cobrar de si e dos outros um padrão muito alto de responsabilidade.',
      'Pode parecer distante quando está focado na tarefa.',
      'Pode manter um procedimento conhecido mesmo quando uma alternativa nova seria útil.',
    ],
    favorableEnvironments: [
      'Responsabilidades definidas e critérios claros.',
      'Tempo para se preparar e organizar o trabalho.',
      'Ambientes estáveis, confiáveis e coerentes.',
      'Autonomia para executar com qualidade e pouca interrupção.',
    ],
  },
  ESTJ: {
    title: 'Organizador objetivo',
    temperament: 'SJ — Guardião',
    letters: 'Extroversão, Sensação, Pensamento e Julgamento',
    description: 'Tende a organizar pessoas, recursos e tarefas para que o trabalho avance. Costuma valorizar clareza, responsabilidade, regras funcionais e decisões práticas.',
    tendencies: [
      'Transforma planos em etapas e acompanha a execução.',
      'Pode tomar decisões com rapidez quando os critérios estão claros.',
      'Comunica expectativas de forma direta.',
      'Contribui para dar estrutura, ritmo e responsabilidade ao grupo.',
    ],
    attentionPoints: [
      'Pode se tornar impaciente com hesitação, informalidade ou falta de compromisso.',
      'A comunicação objetiva pode parecer dura quando não considera o momento emocional.',
      'Pode tentar aplicar a mesma regra a situações que exigem flexibilidade.',
      'Pode assumir controle demais e ouvir menos do que seria útil.',
    ],
    favorableEnvironments: [
      'Metas, prazos e autoridade bem definidos.',
      'Possibilidade de coordenar recursos ou pessoas.',
      'Resultados mensuráveis e regras com lógica.',
      'Equipes que valorizem responsabilidade e comunicação direta.',
    ],
  },
  ISFJ: {
    title: 'Cuidador discreto',
    temperament: 'SJ — Guardião',
    letters: 'Introversão, Sensação, Sentimento e Julgamento',
    description: 'Tende a cuidar das pessoas por meio de atenção prática, continuidade e responsabilidade. Costuma guardar detalhes importantes e perceber o que precisa ser feito para manter segurança e bem-estar.',
    tendencies: [
      'É leal, cuidadoso e comprometido com quem depende de seu trabalho.',
      'Lembra detalhes de pessoas, rotinas e necessidades.',
      'Pode criar ambientes acolhedores e previsíveis.',
      'Realiza tarefas de apoio com constância e discrição.',
    ],
    attentionPoints: [
      'Pode assumir responsabilidades demais e só perceber o cansaço tarde.',
      'Pode evitar dizer não para não decepcionar.',
      'Mudanças bruscas ou críticas impessoais podem ser difíceis.',
      'Seu trabalho pode ficar invisível quando não comunica o que realizou.',
    ],
    favorableEnvironments: [
      'Ambientes cooperativos, respeitosos e organizados.',
      'Atividades com utilidade concreta para pessoas.',
      'Rotinas estáveis, com espaço para cuidado e qualidade.',
      'Reconhecimento sincero e comunicação cuidadosa.',
    ],
  },
  ESFJ: {
    title: 'Colaborador cuidadoso',
    temperament: 'SJ — Guardião',
    letters: 'Extroversão, Sensação, Sentimento e Julgamento',
    description: 'Tende a buscar colaboração, harmonia e organização nas relações. Costuma perceber necessidades concretas do grupo e agir para que as pessoas se sintam incluídas e apoiadas.',
    tendencies: [
      'Organiza encontros, tarefas e cuidados de maneira prática.',
      'Comunica-se com facilidade e estimula cooperação.',
      'Percebe quem precisa de apoio ou orientação.',
      'Valoriza compromissos, lealdade e convivência respeitosa.',
    ],
    attentionPoints: [
      'Pode depender demais de aprovação ou reconhecimento.',
      'Conflitos, frieza e indiferença podem afetá-lo intensamente.',
      'Pode resistir a mudanças que alterem relações e rotinas conhecidas.',
      'Pode priorizar a harmonia e adiar conversas necessárias.',
    ],
    favorableEnvironments: [
      'Trabalho em equipe e contato frequente com pessoas.',
      'Papéis claros, calendário e responsabilidades definidas.',
      'Atividades de cuidado, coordenação ou atendimento.',
      'Ambientes que valorizem respeito e contribuição coletiva.',
    ],
  },
  INTJ: {
    title: 'Estrategista independente',
    temperament: 'NT — Racional',
    letters: 'Introversão, Intuição, Pensamento e Julgamento',
    description: 'Tende a criar modelos mentais, prever cenários e organizar estratégias de longo prazo. Costuma valorizar autonomia, competência e coerência mais do que tradição ou aparência de autoridade.',
    tendencies: [
      'Conecta informações e identifica padrões de longo prazo.',
      'Planeja sistemas, projetos e melhorias com profundidade.',
      'Aprende de forma independente e mantém foco em objetivos complexos.',
      'Questiona procedimentos que não apresentam lógica ou utilidade.',
    ],
    attentionPoints: [
      'Pode parecer crítico, distante ou impaciente com explicações que considera óbvias.',
      'Pode subestimar a importância de sinais emocionais e relações informais.',
      'Perfeccionismo e excesso de planejamento podem atrasar a execução.',
      'Pode ter dificuldade para aceitar limitações práticas que não se resolvem apenas com lógica.',
    ],
    favorableEnvironments: [
      'Problemas complexos e espaço para estratégia.',
      'Autonomia, concentração e acesso a conhecimento.',
      'Metas de longo prazo e critérios de competência.',
      'Pouca interferência sem propósito e abertura para inovação.',
    ],
  },
  ENTJ: {
    title: 'Estrategista de comando',
    temperament: 'NT — Racional',
    letters: 'Extroversão, Intuição, Pensamento e Julgamento',
    description: 'Tende a enxergar objetivos amplos e organizar pessoas e recursos para alcançá-los. Costuma valorizar eficiência, crescimento, decisões claras e capacidade de transformar ideias em resultados.',
    tendencies: [
      'Define direção e estrutura com rapidez.',
      'Pode liderar mudanças e manter o foco em metas difíceis.',
      'Identifica falhas de sistema e propõe soluções.',
      'Comunica ideias e decisões com segurança.',
    ],
    attentionPoints: [
      'Pode pressionar pessoas no mesmo ritmo que impõe a si.',
      'Pode ouvir pouco quando já acredita ter encontrado a melhor estratégia.',
      'A objetividade pode ser percebida como controle ou insensibilidade.',
      'Pode dedicar energia excessiva ao trabalho e reduzir espaço para descanso e relações.',
    ],
    favorableEnvironments: [
      'Desafios estratégicos e poder de decisão compatível com a responsabilidade.',
      'Ambientes orientados a resultados e melhoria.',
      'Equipes competentes, francas e autônomas.',
      'Projetos em que seja possível construir, reorganizar ou expandir sistemas.',
    ],
  },
  INTP: {
    title: 'Analista conceitual',
    temperament: 'NT — Racional',
    letters: 'Introversão, Intuição, Pensamento e Percepção',
    description: 'Tende a investigar princípios, modelos e explicações. Costuma gostar de entender por que algo funciona, encontrar inconsistências e manter espaço para revisar hipóteses.',
    tendencies: [
      'Analisa ideias com precisão e independência.',
      'Percebe contradições e relações que podem passar despercebidas.',
      'Pode produzir soluções originais para problemas abstratos.',
      'Aprende profundamente quando tem liberdade para explorar.',
    ],
    attentionPoints: [
      'Pode adiar decisões enquanto busca mais informações ou uma explicação melhor.',
      'Pode perder interesse na execução depois que compreendeu o problema.',
      'Pode comunicar conclusões de forma muito resumida ou técnica.',
      'Detalhes administrativos e interrupções frequentes podem gerar desgaste.',
    ],
    favorableEnvironments: [
      'Tempo de concentração e autonomia intelectual.',
      'Questões complexas, pesquisa, análise ou criação de modelos.',
      'Liberdade para questionar e experimentar ideias.',
      'Pouca repetição e avaliação baseada na qualidade do raciocínio.',
    ],
  },
  ENTP: {
    title: 'Explorador de ideias',
    temperament: 'NT — Racional',
    letters: 'Extroversão, Intuição, Pensamento e Percepção',
    description: 'Tende a explorar possibilidades, questionar pressupostos e combinar ideias de maneiras novas. Costuma se sentir estimulado por debates, problemas abertos e projetos que ainda não têm solução definida.',
    tendencies: [
      'Gera alternativas e enxerga oportunidades rapidamente.',
      'Pode comunicar ideias com criatividade e persuasão.',
      'Adapta-se bem a mudanças e desafios intelectuais.',
      'Questiona regras e métodos para encontrar caminhos melhores.',
    ],
    attentionPoints: [
      'Pode iniciar mais projetos do que consegue concluir.',
      'Pode discutir por estímulo intelectual quando o outro precisa de acolhimento.',
      'Rotinas, manutenção e detalhes finais podem perder o interesse.',
      'Pode subestimar o tempo necessário para transformar a ideia em resultado.',
    ],
    favorableEnvironments: [
      'Inovação, experimentação e liberdade para propor.',
      'Contato com pessoas capazes de debater e construir ideias.',
      'Problemas novos, mudança e variedade.',
      'Apoio de processos ou parceiros que ajudem na conclusão e nos detalhes.',
    ],
  },
  INFJ: {
    title: 'Orientador reflexivo',
    temperament: 'NF — Idealista',
    letters: 'Introversão, Intuição, Sentimento e Julgamento',
    description: 'Tende a buscar significado nas experiências e a compreender padrões emocionais e humanos. Costuma unir visão de futuro, valores pessoais e desejo de contribuir para o desenvolvimento das pessoas.',
    tendencies: [
      'Percebe relações entre acontecimentos, emoções e necessidades.',
      'Pode escutar com profundidade e organizar ideias complexas em uma direção.',
      'Mantém compromisso com causas e valores importantes.',
      'Pode comunicar temas humanos com sensibilidade, especialmente por escrita ou conversas profundas.',
    ],
    attentionPoints: [
      'Pode absorver conflitos e críticas de forma intensa.',
      'Pode idealizar pessoas, relações ou projetos e se decepcionar com a realidade.',
      'Perfeccionismo pode aumentar autocobrança e cansaço.',
      'Pode guardar incômodos por muito tempo antes de colocar limites.',
    ],
    favorableEnvironments: [
      'Propósito claro e respeito aos valores.',
      'Tempo para reflexão, preparação e concentração.',
      'Relações de confiança e conversas com profundidade.',
      'Projetos que integrem visão, organização e impacto humano.',
    ],
  },
  ENFJ: {
    title: 'Mobilizador de pessoas',
    temperament: 'NF — Idealista',
    letters: 'Extroversão, Intuição, Sentimento e Julgamento',
    description: 'Tende a perceber potencial nas pessoas e a organizar grupos em torno de uma visão ou causa. Costuma usar comunicação, empatia e estrutura para incentivar participação e desenvolvimento.',
    tendencies: [
      'Comunica valores e objetivos de forma inspiradora.',
      'Percebe o clima do grupo e facilita cooperação.',
      'Pode orientar, ensinar e dar sentido a esforços coletivos.',
      'Assume responsabilidade por relações e resultados humanos.',
    ],
    attentionPoints: [
      'Pode sentir que precisa resolver o problema emocional de todos.',
      'Pode ter dificuldade para dizer não ou decepcionar alguém.',
      'Pode idealizar a colaboração e sofrer com rejeição ou conflito.',
      'Pode direcionar demais as pessoas quando acredita saber o que é melhor para elas.',
    ],
    favorableEnvironments: [
      'Contato humano, propósito e possibilidade de influenciar positivamente.',
      'Projetos estruturados de desenvolvimento, comunicação ou liderança.',
      'Equipes que valorizem colaboração e feedback.',
      'Espaço para criar visão e acompanhar sua realização.',
    ],
  },
  INFP: {
    title: 'Idealista guiado por valores',
    temperament: 'NF — Idealista',
    letters: 'Introversão, Intuição, Sentimento e Percepção',
    description: 'Tende a organizar a vida a partir de valores internos, autenticidade e significado. Costuma imaginar possibilidades para pessoas e situações e pode expressar essas percepções por escrita, arte, escuta ou criação.',
    tendencies: [
      'Demonstra empatia e respeito pela individualidade.',
      'Pode criar narrativas, símbolos e soluções originais.',
      'Defende causas com as quais realmente se identifica.',
      'É aberto a diferentes perspectivas quando elas não ferem valores essenciais.',
    ],
    attentionPoints: [
      'Pode ter dificuldade para transformar ideias e valores em etapas concretas.',
      'Críticas podem ser sentidas como rejeição pessoal.',
      'Pode evitar conflito e acumular frustração.',
      'Rotina, competição e cobrança exclusivamente por produtividade podem reduzir a motivação.',
    ],
    favorableEnvironments: [
      'Propósito, autonomia e possibilidade de expressão pessoal.',
      'Tempo para reflexão e criação.',
      'Ambientes respeitosos, com pouca competição interna.',
      'Projetos que liguem imaginação, valores e benefício humano.',
    ],
  },
  ENFP: {
    title: 'Inspirador criativo',
    temperament: 'NF — Idealista',
    letters: 'Extroversão, Intuição, Sentimento e Percepção',
    description: 'Tende a enxergar possibilidades nas pessoas e nos projetos e a compartilhar entusiasmo. Costuma valorizar autenticidade, liberdade, conexão e experiências que tragam crescimento ou novidade.',
    tendencies: [
      'Cria relações e associações entre ideias com facilidade.',
      'Pode motivar pessoas e abrir novas perspectivas.',
      'Adapta a comunicação ao clima e às necessidades do grupo.',
      'Demonstra criatividade, curiosidade e energia para iniciar mudanças.',
    ],
    attentionPoints: [
      'Pode se comprometer com oportunidades demais.',
      'Pode perder energia quando o trabalho entra em fase repetitiva ou muito detalhada.',
      'Pode interpretar sinais sociais de maneira excessiva quando está ansioso.',
      'Pode precisar de apoio para priorizar, terminar e manter rotinas.',
    ],
    favorableEnvironments: [
      'Variedade, criatividade e contato humano.',
      'Liberdade para explorar e propor novas possibilidades.',
      'Projetos com propósito e impacto nas pessoas.',
      'Estrutura suficiente para ajudar na conclusão sem sufocar a iniciativa.',
    ],
  },
};

export const DISCLAIMER =
  'Este resultado apresenta tendências de preferência com base nas respostas fornecidas. ' +
  'Ele possui finalidade educativa e de autoconhecimento. Não é um diagnóstico, não é o ' +
  'instrumento oficial MBTI, não determina completamente sua personalidade e não deve ser ' +
  'utilizado sozinho para escolher uma profissão. Experiências de vida, interesses, ' +
  'habilidades, valores, contexto familiar e condições atuais também precisam ser considerados.';
