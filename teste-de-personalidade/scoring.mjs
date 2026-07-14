/**
 * Teste de Personalidade e Escolha Profissional
 * Mapa de pontuação e banco dos 16 resultados.
 *
 * Correção 100% determinística, nenhuma IA participa do cálculo.
 * Conteúdo dos resultados: documento aprovado "Tipos psicológicos:
 * versão revisada e simplificada, de Jung ao MBTI e aos temperamentos
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
  { n: 5, dim: 'EI', text: 'Numa viagem de avião (de SP a RJ), você:',
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
 * @param {Record<number,'a'|'b'>|Array} answers: respostas indexadas pelo nº da pergunta.
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

// ─── Banco dos 16 resultados (conteúdo aprovado, não editar livremente) ────

export const resultDescriptions = {
  ISTP: {
    title: 'Solucionador prático',
    temperament: 'SP · Artesão',
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
    temperament: 'SP · Artesão',
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
    temperament: 'SP · Artesão',
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
    temperament: 'SP · Artesão',
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
    temperament: 'SJ · Guardião',
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
    temperament: 'SJ · Guardião',
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
    temperament: 'SJ · Guardião',
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
    temperament: 'SJ · Guardião',
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
    temperament: 'NT · Racional',
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
    temperament: 'NT · Racional',
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
    temperament: 'NT · Racional',
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
    temperament: 'NT · Racional',
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
    temperament: 'NF · Idealista',
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
    temperament: 'NF · Idealista',
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
    temperament: 'NF · Idealista',
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
    temperament: 'NF · Idealista',
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

// ─── Sobre o teste (explicação em linguagem simples) ────────────────────────
// Adaptação da introdução usada nas devolutivas manuais da clínica
// ("Personalidade e Escolha Profissional, dimensões em Keirsey e Bates").

export const ABOUT_TEST = {
  title: 'Como este resultado é construído',
  paragraphs: [
    'Este teste se inspira nos estudos do psiquiatra Carl Gustav Jung, que observou que as pessoas têm jeitos preferidos de perceber o mundo e de tomar decisões. Mais tarde, Katharine Briggs e Isabel Myers organizaram essas ideias em quatro pares de preferências, e os pesquisadores David Keirsey e Marilyn Bates agruparam as combinações em quatro grandes temperamentos, cada um com um estilo próprio de agir, se comunicar e escolher caminhos.',
    'Cada uma das 26 perguntas do teste olha para um desses quatro pares. Não existe lado certo: os dois polos de cada par são igualmente valiosos, apenas diferentes. Somando suas escolhas, ele identifica de qual lado de cada par você tende a ficar. A combinação das quatro letras forma o seu resultado.',
    'O resultado não é uma sentença: é um retrato das suas preferências neste momento, um ponto de partida para você se conhecer melhor e pensar nas suas escolhas com mais clareza.',
  ],
  dimensions: [
    { pair: 'E / I', name: 'Extroversão ou Introversão', question: 'De onde vem a sua energia?', text: 'Quem tende à Extroversão se recarrega no contato com pessoas e com o movimento do mundo. Quem tende à Introversão se recarrega em momentos mais reservados, de concentração e profundidade.' },
    { pair: 'S / N', name: 'Sensação ou Intuição', question: 'Como você capta as informações?', text: 'Quem tende à Sensação confia nos fatos, nos detalhes e na experiência concreta. Quem tende à Intuição presta mais atenção em possibilidades, significados e no que ainda pode vir a ser.' },
    { pair: 'T / F', name: 'Pensamento ou Sentimento', question: 'Como você decide?', text: 'Quem tende ao Pensamento decide comparando argumentos com lógica e imparcialidade. Quem tende ao Sentimento decide considerando valores, circunstâncias e o impacto nas pessoas.' },
    { pair: 'J / P', name: 'Julgamento ou Percepção', question: 'Como você organiza a vida?', text: 'Quem tende ao Julgamento gosta de definir, planejar e concluir. Quem tende à Percepção prefere manter opções abertas e decidir conforme as coisas acontecem.' },
  ],
};

// ─── Os quatro temperamentos (versão em linguagem simples) ──────────────────
// Adaptação dos textos completos do material "Escolha Profissional"
// (Keirsey e Bates), reescritos sem o tom acadêmico e sem afirmações absolutas.

export const temperamentDescriptions = {
  'SP · Artesão': {
    name: 'SP · Artesão',
    original: 'Realista perceptivo',
    paragraphs: [
      'Para o temperamento Artesão, o grande valor é a liberdade de agir. Pessoas com esse temperamento costumam viver o momento presente com intensidade: fazem as coisas porque sentem o impulso e o prazer de fazer, e não apenas por obrigação ou por um plano distante. Quando uma atividade as envolve de verdade, conseguem se dedicar por horas a fio.',
      'Regras sem propósito, rotinas engessadas e hierarquias rígidas tendem a sufocar esse temperamento. Em compensação, ele é imbatível em situações de crise e de improviso: quando tudo sai do roteiro, é o Artesão que costuma manter a calma e encontrar uma saída prática na hora.',
      'Socialmente, costuma ser bem aceito: otimista, animado, com facilidade para fazer amizades e grande capacidade de "dar a volta por cima" depois de um tropeço. É também muito leal ao seu grupo, da equipe de trabalho à turma de amigos.',
      'No trabalho, o Artesão está mais ligado ao processo do que ao resultado final: o envolvimento com a ação é o que dá sentido. Por isso, tende a se realizar em atividades com movimento, variedade, habilidade prática e algum desafio, e a se desgastar em funções puramente repetitivas e burocráticas.',
    ],
  },
  'SJ · Guardião': {
    name: 'SJ · Guardião',
    original: 'Realista judicativo',
    paragraphs: [
      'A dedicação e a persistência são as marcas do temperamento Guardião. Pessoas com esse temperamento costumam se doar de verdade: às pessoas sob sua responsabilidade e também às tarefas do dia a dia que sustentam a vida de todos, mesmo quando ninguém percebe.',
      'A palavra dada tem grande peso: honrar compromissos, cumprir o que prometeu e ser coerente consigo mesmo são metas constantes. Ser útil e gerar harmonia ao redor é o que dá sentido à caminhada, ainda que, às vezes, o Guardião aceite responsabilidades demais por medo de decepcionar, e sinta o peso disso mais tarde.',
      'Esse temperamento prefere o previsível ao improvisado: gosta de dividir os objetivos em etapas, seguir procedimentos que funcionam e contribuir para que a família, a escola e o trabalho funcionem de forma ordenada e justa. Mudanças são bem-vindas quando acontecem de forma gradual e com bom motivo.',
      'No trabalho, o Guardião é o pilar que dá estabilidade às instituições. Tende a se realizar em atividades de cuidado, organização, ensino, administração e serviço às pessoas, lugares onde continuidade, confiança e responsabilidade são valorizadas.',
    ],
  },
  'NT · Racional': {
    name: 'NT · Racional',
    original: 'Intuitivo racional',
    paragraphs: [
      'O que move o temperamento Racional é o desejo de compreender como as coisas funcionam: a natureza, os sistemas, as pessoas, as ideias. Quem convive com um Racional convive com um espírito de cientista: alguém que quer entender, prever e explicar o mundo.',
      'A competência é seu grande valor: o Racional quer fazer bem-feito e cobra muito de si mesmo. Como raramente acha que já sabe o suficiente, vive estudando, aperfeiçoando e construindo modelos e sistemas. Esse mesmo padrão elevado, porém, pode virar autocrítica dura e medo de falhar. Sem perceber, ele pode esperar dos outros a mesma exigência que impõe a si.',
      'Na comunicação, tende a ser direto e econômico: não gosta de repetir o óbvio e busca precisão nas palavras. Por isso, às vezes é lido como frio ou distante, quando na verdade está apenas concentrado em entender. Aceita bem mudanças e ideias novas, desde que façam sentido.',
      'No trabalho, o Racional se realiza onde há problemas complexos para resolver: ciência, tecnologia, estratégia, planejamento, análise, ensino. O que o desgasta é a rotina sem desafio e as tarefas que não exigem raciocínio. Para ele, aprender é um projeto para a vida inteira.',
    ],
  },
  'NF · Idealista': {
    name: 'NF · Idealista',
    original: 'Intuitivo sensível',
    paragraphs: [
      'Para o temperamento Idealista, a vida é uma busca por sentido, por autenticidade, por se tornar quem realmente se é. Mais do que ter ou fazer, o Idealista quer ser verdadeiro: máscaras, aparências e relações superficiais pesam muito para ele.',
      'É o temperamento mais voltado às pessoas: enxerga o potencial dos outros e sente um chamado para ajudá-los a crescer. Costuma se engajar de corpo e alma em causas que considera importantes, e pode se decepcionar quando percebe que nem todos vivem essa busca com a mesma intensidade.',
      'Vive as emoções com profundidade e busca dar significado a tudo o que acontece. O perfeccionismo é um risco conhecido: como se orienta por uma visão de perfeição, pode ficar insatisfeito até com trabalhos que já estão bons, e se cobrar além da conta.',
      'A linguagem é o seu grande talento: falar, escrever, escutar, criar. No trabalho, o Idealista tende a se realizar onde pode se comunicar e contribuir com o desenvolvimento das pessoas (ensino, psicologia, escrita, arte, orientação, causas sociais) e a murchar em ambientes frios, competitivos ou puramente mecânicos.',
    ],
  },
};

// ─── Perfil detalhado dos 16 resultados ─────────────────────────────────────
// Adaptação dos subtipos do material "Escolha Profissional" (Keirsey e Bates)
// para linguagem simples. O campo keyword mantém o apelido usado nas
// devolutivas manuais da clínica. Os caminhos profissionais são apresentados
// como possibilidades a explorar, nunca como prescrição.

export const profileDetails = {
  ISTP: {
    keyword: 'Temeridade',
    profile: [
      'Você tende a ser uma pessoa de ação: quando algo desperta seu interesse, você mergulha de cabeça, sem precisar de longos preparativos. Situações com emoção, movimento e até um pouco de risco costumam ser atraentes: é ali que você se sente vivo e no controle.',
      'Regras que não fazem sentido e ordens autoritárias tendem a incomodar. Você funciona melhor com liberdade para agir do seu jeito, e costuma tratar todo mundo de igual para igual, o que faz de você uma companhia apreciada.',
      'Realista e observador, você sabe aproveitar as oportunidades do momento como poucos. Gosta de jogos e desafios, e ser reconhecido pelo que faz bem é importante para você. Ferramentas, máquinas e instrumentos costumam ser quase uma extensão do seu corpo: você aprende fazendo, montando, desmontando e testando.',
    ],
    traits: ['Mão na massa e sangue frio', 'Resolve na hora, sem drama', 'Liberdade acima de tudo'],
    careers: 'Áreas que unem técnica, prática e um toque de adrenalina costumam atrair esse perfil: mecânica e mecatrônica, elétrica e energia solar, pilotagem e operação de drones, segurança da informação e infraestrutura de tecnologia, áreas técnicas da saúde (radiologia, instrumentação cirúrgica), esportes, resgate e bombeiros, produção audiovisual técnica. Vale para a primeira profissão e também para uma transição de carreira em qualquer idade.',
  },
  ESTP: {
    keyword: 'Empreendimento',
    profile: [
      'Você tende a ser um empreendedor nato: tem o impulso de transformar e melhorar o ambiente ao seu redor, e dificilmente deixa as coisas como estão. É muito observador: capta detalhes das pessoas e das situações que passam despercebidos para a maioria, inclusive o que não é dito em palavras.',
      'Realista, pragmático e comunicativo, você costuma ser popular e ter facilidade para conquistar as pessoas. Tensões e climas pesados incomodam: você prefere resolver logo e seguir em frente, o que às vezes pode ser lido como pressa em assuntos que pediam mais profundidade.',
      'Seu talento aparece com força nas horas de decisão e de crise: enquanto muitos ainda estão analisando, você já enxergou a oportunidade e está agindo.',
    ],
    traits: ['Enxerga a oportunidade primeiro', 'Convence qualquer um', 'Parado é que não fica'],
    careers: 'Vendas consultivas, empreendedorismo, marketing e growth, corretagem de imóveis e de investimentos, logística e operações, gestão de crises, eventos, esportes e transmissões e conteúdos ao vivo costumam combinar com esse perfil. Em qualquer fase da vida, ambientes dinâmicos, com gente, metas visíveis e retorno rápido rendem muito mais para você do que funções repetitivas atrás de uma mesa.',
  },
  ESFP: {
    keyword: 'Vivacidade',
    profile: [
      'Você tende a ser uma presença que ilumina o ambiente: alegria, otimismo e calor humano costumam chegar junto com você. Generoso, você gosta de gente e faz as coisas pelas pessoas sem ficar calculando o que vai receber em troca.',
      'A solidão pesa para você: é no contato com os outros que sua energia se renova. Por outro lado, situações de exposição negativa ou críticas frias podem machucar mais do que os outros imaginam, e você tende a se afastar delas.',
      'Você tem um talento especial para lidar com pessoas em momentos difíceis: percebe o clima, antevê soluções que ninguém viu e encontra saídas criativas sem se prender ao "sempre foi assim".',
    ],
    traits: ['Alegria que contagia', 'Vive o agora intensamente', 'Gente é a minha energia'],
    careers: 'Criação de conteúdo e redes sociais, eventos e produção cultural, turismo e hotelaria, educação infantil, saúde e bem-estar (enfermagem, fisioterapia, estética), vendas e atendimento, artes cênicas e gastronomia costumam atrair esse perfil. O essencial, em qualquer idade, é estar com pessoas e ver o impacto direto do que você faz.',
  },
  ISFP: {
    keyword: 'Artes',
    profile: [
      'O seu é o perfil do artista: sensibilidade estética, espontaneidade e uma atenção fina ao momento presente. Você tende a demonstrar o que sente mais por gestos e atitudes do que por discursos, e muitas vezes se expressa melhor por um canal indireto: uma imagem, uma música, um trabalho bem-feito, um cuidado silencioso.',
      'Planejar demais e esperar demais desanimam você: seu combustível é o envolvimento com o que está acontecendo agora. Quando algo realmente o arrebata, você se entrega sem reservas ao trabalho, ao esporte, à arte.',
      'Com uma inteligência voltada ao concreto, você percebe as necessidades e as dores dos outros com facilidade, e comemora as vitórias alheias como se fossem suas. Gentileza, gratidão e liberdade são valores centrais. Por ser discreto, você às vezes é mal interpretado por quem não o conhece de perto.',
    ],
    traits: ['Sensível e criativo', 'Demonstra afeto em gestos', 'No meu ritmo, do meu jeito'],
    careers: 'Design (gráfico, de interiores, de produto), fotografia e audiovisual, gastronomia e confeitaria, estética e beleza, medicina veterinária e cuidado animal, paisagismo e meio ambiente, artesanato e trabalhos manuais, fisioterapia e terapias corporais costumam atrair esse perfil: tudo o que permita criar com as mãos e com os sentidos, no seu ritmo e com propósito concreto, em qualquer momento da vida.',
  },
  ISTJ: {
    keyword: 'Dever',
    profile: [
      'Palavra-chave: confiabilidade. Você tende a levar seus compromissos muito a sério e a cumprir o que prometeu com uma constância que poucos têm, mesmo quando ninguém está olhando. Estruturas que funcionam, tradições que fazem sentido e instituições sólidas têm grande valor para você.',
      'Prático e realista, você quer que as coisas funcionem: procedimentos claros, critérios definidos e trabalho bem-feito. Tem paciência com processos, mas pouca paciência com quem trata as responsabilidades com descaso.',
      'Sua dedicação discreta às vezes se torna tão natural que os outros deixam de notá-la, e sua objetividade pode ser confundida com frieza. Na verdade, ela é a sua forma de proteger a qualidade do que entrega.',
    ],
    traits: ['Palavra dada é compromisso', 'Organização e constância', 'Detalhe nenhum escapa'],
    careers: 'Contabilidade e finanças, auditoria e compliance, análise de dados, direito, engenharia, gestão pública e concursos, controle de qualidade e segurança digital costumam se encaixar com esse perfil: áreas em que precisão, responsabilidade e consistência valem ouro, seja no primeiro emprego, seja numa mudança de área.',
  },
  ESTJ: {
    keyword: 'Responsabilidade',
    profile: [
      'Você tende a ser a pessoa que faz as coisas andarem: recebe uma responsabilidade e a transforma em plano, etapas e resultado. Atividades bem definidas, com metas e prazos claros, são o seu território natural, e implantar ordem onde havia bagunça é quase uma vocação.',
      'Realista e direto, você comunica com clareza o que espera e cobra o combinado, de si e dos outros. A pontualidade e o cumprimento das regras têm grande valor para você, e é por isso que costuma ser um pilar de sustentação nos lugares por onde passa.',
      'O ponto de atenção é o outro lado da mesma moeda: na pressa de executar, você pode ter pouca paciência com opiniões diferentes e parecer duro com quem funciona em outro ritmo. Abrir espaço para ouvir antes de decidir costuma multiplicar seus resultados.',
    ],
    traits: ['Chegou, organizou', 'Meta dada é meta batida', 'Direto ao ponto'],
    careers: 'Gestão de projetos e de equipes, administração de empresas e de franquias, operações e logística, engenharia de produção, comércio e e-commerce, gestão escolar e hospitalar, agronegócio e carreiras públicas de gestão costumam combinar com esse perfil: qualquer lugar em que organizar recursos, pessoas e prazos seja o coração do trabalho.',
  },
  ISFJ: {
    keyword: 'Devotamento',
    profile: [
      'Cuidar é o seu jeito de estar no mundo. Você tende a perceber, antes de todo mundo, o que as pessoas ao redor estão precisando, e a agir de forma prática e discreta para que nada falte. Sua realização vem de se dedicar a quem precisa de você.',
      'Com um senso de responsabilidade fora do comum, você prefere métodos que já provaram que funcionam a improvisos arriscados. É leal às pessoas com quem trabalha e cria laços de confiança profundos.',
      'Como não gosta de dar ordens, muitas vezes prefere fazer você mesmo, e aí mora o risco de se sobrecarregar em silêncio. Aprender a pedir ajuda e a mostrar o próprio trabalho é um cuidado que você merece ter consigo.',
    ],
    traits: ['Cuida sem pedir aplauso', 'Lembra do que importa', 'Responsável ao extremo'],
    careers: 'Enfermagem e saúde, pedagogia, educação especial e psicopedagogia, nutrição, terapias, recursos humanos e departamento pessoal, secretariado e apoio executivo, sucesso do cliente e organização de informações costumam atrair esse perfil: atividades de cuidado contínuo, em que atenção aos detalhes e constância mudam a vida de alguém.',
  },
  ESFJ: {
    keyword: 'Interação Social',
    profile: [
      'Você tende a ser uma das pessoas mais sociáveis que existem: é no encontro com os outros que sua energia se renova. Onde você chega, o ambiente fica mais acolhedor: você aproxima as pessoas, concilia diferenças e cria harmonia quase sem perceber.',
      'Prestativo e atento a quem precisa, você leva a sério as regras, os combinados e as tarefas que assumiu, e por isso costuma ser muito querido e valorizado. Assuntos concretos e práticos são o seu forte; análises muito abstratas tendem a cansar.',
      'O carinho e o reconhecimento dos outros são importantes para você, e a indiferença machuca. Vale o cuidado: não deixe que a busca por agradar faça você adiar conversas necessárias ou carregar culpas que não são suas.',
    ],
    traits: ['Une as pessoas ao redor', 'Acolhimento em pessoa', 'Harmonia em primeiro lugar'],
    careers: 'Praticamente tudo o que envolve pessoas combina com esse perfil: recursos humanos, saúde (enfermagem, odontologia, fonoaudiologia), pedagogia e gestão escolar, atendimento e sucesso do cliente, eventos, vendas e varejo, administração e relações públicas. O essencial é servir e conectar pessoas dentro de uma estrutura organizada, em qualquer etapa da carreira.',
  },
  INTJ: {
    keyword: 'Lógica',
    profile: [
      'Você tende a viver num mundo de ideias com aplicação prática: enxerga possibilidades, monta o modelo na cabeça e testa contra a realidade. Confiante e rápido nas decisões, você é, no fundo, um aplicador de teorias: quer ver o conceito funcionando.',
      'Títulos e cargos não impressionam você: o que importa é se a ideia faz sentido. Sua mente funciona como um jogo de xadrez: sempre alerta às consequências de cada movimento, pronta para descartar o que não tem utilidade e abraçar o que tem.',
      'Desafios não abatem você; pelo contrário, viram combustível para criar. Por outro lado, embora sinta profundamente, você raramente mostra as emoções, e isso pode fazer com que pareça indiferente. Quem conquista sua confiança descobre alguém extremamente dedicado.',
    ],
    traits: ['Estrategista nato', 'Visão de longo prazo', 'Lógica vale mais que título'],
    careers: 'Ciência de dados e inteligência artificial, engenharia, arquitetura de software, pesquisa científica, planejamento estratégico, arquitetura e urbanismo, investimentos e gestão de projetos complexos costumam atrair esse perfil: trabalhos em que seja possível construir, melhorar e transformar sistemas, com autonomia e espaço para pensar, em qualquer fase da vida.',
  },
  ENTJ: {
    keyword: 'Comando',
    profile: [
      'Liderar e estruturar é o seu impulso natural: onde você chega, logo enxerga o objetivo maior e começa a organizar pessoas e recursos para alcançá-lo. Você é, por natureza, um construtor de organizações.',
      'Você tolera procedimentos estabelecidos até o momento em que eles se mostram ineficientes. Aí não hesita em mudar, porque o que você valoriza mesmo é a competência e o resultado. Decide com base em dados e raramente se deixa levar pela emoção do momento.',
      'Receber ordens não é o seu forte, e o trabalho tende a ocupar um espaço enorme na sua vida. Vale o cuidado para não deixar o descanso e as relações em segundo plano. Sua habilidade de visualizar metas e comunicá-las com clareza é o que faz equipes inteiras andarem.',
    ],
    traits: ['Liderança natural', 'Transforma ideia em resultado', 'Foco total na meta'],
    careers: 'Posições de liderança e gestão de negócios, empreendedorismo e startups, consultoria estratégica, direito empresarial, gestão de produtos digitais, finanças e investimentos e carreiras públicas de comando costumam atrair esse perfil: lugares com metas grandes, poder de decisão e sistemas para construir ou expandir, do primeiro emprego à virada de carreira.',
  },
  INTP: {
    keyword: 'Precisão',
    profile: [
      'A precisão é a sua marca registrada, no pensamento e nas palavras. Você tende a buscar o entendimento profundo das coisas: como funcionam, por que funcionam, onde está a incoerência que ninguém viu. Contradições em um argumento saltam aos seus olhos.',
      'Com enorme capacidade de concentração, você seleciona o que é relevante e vai fundo. O que aprende, dificilmente esquece. Para você, o mundo existe para ser compreendido, e explicações vagas simplesmente não servem.',
      'Expressar emoções em palavras pode ser difícil, e você tende à reserva, exceto com pessoas próximas. Por isso, às vezes seu valor passa despercebido ou seus méritos acabam creditados a outros. Impaciência com conversas rasas pode soar como arrogância, mas quem o conhece sabe que é sede de profundidade.',
    ],
    traits: ['Mente analítica', 'Enxerga o que ninguém viu', 'Profundidade, sem conversa rasa'],
    careers: 'Pesquisa e ciência, análise e ciência de dados, desenvolvimento de software e inteligência artificial, matemática e estatística, filosofia, escrita técnica e docência costumam atrair esse perfil. Você trabalha melhor com autonomia, sem interrupções, em questões que desafiem seu raciocínio, seja começando a carreira, seja migrando para uma nova área.',
  },
  ENTP: {
    keyword: 'Destreza',
    profile: [
      'Sua mente precisa de exercício constante. Ideias, projetos, pessoas e problemas viram matéria-prima para a sua engenhosidade. Extremamente intuitivo, você enxerga relações e possibilidades onde os outros veem só o óbvio, e seu entusiasmo contagia quem está por perto.',
      '"Impossível" é, para você, um convite. Você reluta em aceitar moldes prontos e questiona a autoridade tradicional, não por rebeldia, mas porque está sempre engendrando um jeito melhor de fazer as coisas.',
      'Para você, uma ideia vale pelo que ela pode virar na prática: o projeto é o meio, a invenção funcionando é o fim. Conversador brilhante, você é capaz de defender uma tese complexa com fascinação. Só fique atento ao risco de começar mais projetos do que consegue terminar.',
    ],
    traits: ['Ideias que não acabam', 'Questiona tudo', 'Impossível soa como convite'],
    careers: 'Inovação e startups, marketing criativo e publicidade, gestão de produtos, consultoria, direito, criação de conteúdo e podcasts, tecnologia e docência dinâmica costumam atrair esse perfil. Muitos o descrevem como um engenheiro das relações humanas: você une pessoas e ideias para fazer o novo acontecer, e rotina é o seu maior inimigo em qualquer idade.',
  },
  INFJ: {
    keyword: 'Intuição',
    profile: [
      'A intuição é a base do seu jeito de ser: você capta emoções, intenções e sentimentos dos outros antes mesmo que eles percebam, e muitas vezes não sabe explicar como chegou lá, só sabe que chegou. Sua empatia conecta passado, presente e futuro num quadro que poucos conseguem ver.',
      'Dedicado ao extremo no que faz, você é atraído por atividades de estudo e profundidade, com uma tendência conhecida ao perfeccionismo: a régua alta que você usa com o mundo é a mesma que usa consigo.',
      'Sensível a conflitos e críticas, você pode se sentir paralisado em ambientes hostis, a ponto de adoecer física e emocionalmente. Proteger seus espaços e suas relações de confiança não é luxo: é necessidade.',
    ],
    traits: ['Percebe o que não foi dito', 'Profundidade e propósito', 'Exigente comigo mesmo'],
    careers: 'Psicologia e terapias, escrita e roteiro, pesquisa de experiência do usuário (UX), orientação educacional e vocacional, medicina e psiquiatria, gestão de projetos sociais e curadoria cultural costumam atrair esse perfil: trabalhos em que sensibilidade e visão de futuro são o instrumento principal, em qualquer momento da vida.',
  },
  ENFJ: {
    keyword: 'Liderança',
    profile: [
      'Você tende a ser um líder carismático: as pessoas naturalmente se aproximam, confiam e seguem. Sem perceber, você assume a responsabilidade pelos sentimentos de quem o procura, e se torna fonte de apoio e sustentação para muita gente.',
      'Com facilidade rara para expressar sentimentos em palavras, você percebe as motivações dos outros com uma exatidão impressionante: sua intuição sobre pessoas raramente erra. A contrapartida: você espera muito das pessoas, e do relacionamento perfeito, e a realidade nem sempre acompanha.',
      'Comunicador nato, mestre da palavra, você dá o seu melhor quando está desenvolvendo pessoas e mobilizando grupos em torno de uma causa que valha a pena.',
    ],
    traits: ['Inspira e mobiliza', 'Lê as pessoas com precisão', 'Vive por boas causas'],
    careers: 'Ensino e formação de pessoas, psicologia, recursos humanos e desenvolvimento de talentos, comunicação e jornalismo, gestão de comunidades e redes sociais, liderança de equipes e de causas sociais costumam atrair esse perfil. O que esvazia sua energia, em qualquer idade, são trabalhos isolados, sem gente e sem propósito humano.',
  },
  ENFP: {
    keyword: 'Influência',
    profile: [
      'Para você, tudo tem um significado. Observador agudo, você percebe as motivações das pessoas e o sentido oculto das situações, e por isso exerce uma influência natural sobre quem está por perto. Autenticidade não é opção para você: é necessidade vital.',
      'Você vive as emoções com intensidade e mergulha de corpo inteiro no processo de criar. Essa entrega cativa as pessoas com facilidade. Em contrapartida, a repetição desbota seu entusiasmo: o novo sempre chama mais do que o já conhecido, e terminar pode ser mais difícil do que começar.',
      'Orgulhoso no bom sentido, independente e otimista, você não gosta de se submeter nem de submeter ninguém, e tem um dom raro para manter as pessoas unidas ao seu redor.',
    ],
    traits: ['Entusiasmo contagiante', 'Autêntico até o fim', 'Especialista em recomeços'],
    careers: 'Marketing e branding, criação de conteúdo e redes sociais, publicidade, jornalismo, ensino, psicologia, produção cultural e eventos, empreendedorismo criativo e turismo costumam atrair esse perfil. Fuja do excesso de rotina: seu talento floresce onde há contato humano, variedade e espaço para criar, em qualquer fase da vida.',
  },
  INFP: {
    keyword: 'Idealismo',
    profile: [
      'Você tende a ser profundamente idealista: capaz de se dedicar de corpo e alma a uma causa em que acredita, sem medir sacrifícios. Sua vida se orienta pelos valores que carrega (honra, dignidade, coerência), mais do que pela lógica fria dos fatos.',
      'Seu mundo interno é rico em imagens e significados: você pensa por metáforas e tem o dom de criar e interpretar símbolos. Paciente com situações complexas, você se enfada com detalhes burocráticos e rotinas vazias.',
      'Você valoriza a harmonia e pode ceder para evitar conflitos, mas quando um valor essencial é ferido, revela uma firmeza que surpreende. O desafio conhecido do seu perfil é conciliar os ideais com a realidade imperfeita, sem se cobrar demais por isso.',
    ],
    traits: ['Guiado por valores', 'Mundo interno gigante', 'Precisa acreditar para fazer'],
    careers: 'Psicologia e terapias, escrita e literatura, educação, tradução e idiomas, artes, projetos sociais e de impacto e criação de conteúdo com propósito costumam atrair esse perfil. Funções puramente competitivas ou repetitivas tendem a esvaziar sua motivação: você precisa acreditar no que faz, e isso não muda com a idade.',
  },
};

export const DISCLAIMER =
  'Este resultado apresenta tendências de preferência com base nas respostas fornecidas. ' +
  'Ele possui finalidade educativa e de autoconhecimento. Não é um diagnóstico, não é o ' +
  'instrumento oficial MBTI, não determina completamente sua personalidade e não deve ser ' +
  'utilizado sozinho para escolher uma profissão. Experiências de vida, interesses, ' +
  'habilidades, valores, contexto familiar e condições atuais também precisam ser considerados.';
