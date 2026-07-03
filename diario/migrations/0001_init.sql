-- Diário das Emoções · schema inicial
-- Migrações são sempre aditivas: o D1 não tem rollback.

CREATE TABLE terapeuta (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  contato_emergencia TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessao_terapeuta (
  token_hash TEXT PRIMARY KEY,
  terapeuta_id TEXT NOT NULL REFERENCES terapeuta(id),
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  expira_em TEXT NOT NULL
);

CREATE TABLE paciente (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  arquivado INTEGER NOT NULL DEFAULT 0,
  consentimento_em TEXT,
  consentimento_ia_em TEXT,
  ultimo_acesso_em TEXT
);

CREATE TABLE registro (
  -- id é um UUID gerado no aparelho: o mesmo registro reenviado pelo
  -- sync offline não duplica. O servidor confere que o id pertence ao
  -- paciente autenticado antes de aceitar.
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES paciente(id),
  timestamp TEXT NOT NULL,
  nivel INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 5),
  emocoes TEXT NOT NULL DEFAULT '[]',
  emocoes_livres TEXT NOT NULL DEFAULT '[]',
  atividades TEXT NOT NULL DEFAULT '[]',
  atividade_texto TEXT,
  pensamento TEXT,
  corpo TEXT NOT NULL DEFAULT '[]',
  acao TEXT,
  sono TEXT,
  falar_na_sessao INTEGER NOT NULL DEFAULT 0,
  flag_resolvida_em TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_registro_paciente ON registro(paciente_id, timestamp);

CREATE TABLE emocao_pessoal (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES paciente(id),
  palavra TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(paciente_id, palavra)
);

-- Visível somente para a terapeuta: nunca entra em resposta de API do paciente.
CREATE TABLE anotacao (
  id TEXT PRIMARY KEY,
  registro_id TEXT NOT NULL REFERENCES registro(id),
  texto TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tarefa (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES paciente(id),
  titulo TEXT NOT NULL,
  orientacoes TEXT,
  resposta_paciente TEXT,
  respondida_em TEXT,
  anotacao_terapeuta TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE audio (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  emocoes_associadas TEXT NOT NULL DEFAULT '[]',
  chave_r2 TEXT NOT NULL,
  duracao_seg INTEGER,
  camada1 INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE lembrete (
  paciente_id TEXT PRIMARY KEY REFERENCES paciente(id),
  frequencia INTEGER NOT NULL DEFAULT 0 CHECK (frequencia IN (0, 1, 2)),
  horarios TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE push_subscription (
  id TEXT PRIMARY KEY,
  paciente_id TEXT REFERENCES paciente(id),
  terapeuta_id TEXT REFERENCES terapeuta(id),
  endpoint TEXT NOT NULL UNIQUE,
  chave_p256dh TEXT NOT NULL,
  chave_auth TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE pontuacao (
  paciente_id TEXT PRIMARY KEY REFERENCES paciente(id),
  estrelas_total INTEGER NOT NULL DEFAULT 0,
  nivel_atual TEXT NOT NULL DEFAULT 'Percepção'
);

-- Trilha auditável de cada estrela. Estrelas nunca expiram nem são
-- descontadas; a restrição UNIQUE garante que um registro reenviado
-- pelo sync não premia duas vezes.
CREATE TABLE evento_estrela (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES paciente(id),
  origem TEXT NOT NULL,
  referencia_id TEXT NOT NULL,
  estrelas INTEGER NOT NULL CHECK (estrelas > 0),
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(paciente_id, origem, referencia_id)
);

CREATE TABLE conquista (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES paciente(id),
  tipo TEXT NOT NULL,
  desbloqueada_em TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(paciente_id, tipo)
);

CREATE TABLE rpd (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES paciente(id),
  situacao TEXT,
  emocao TEXT,
  intensidade_inicial INTEGER,
  pensamento_automatico TEXT,
  evidencias_favor TEXT,
  evidencias_contra TEXT,
  pensamento_alternativo TEXT,
  intensidade_final INTEGER,
  concluido INTEGER NOT NULL DEFAULT 0,
  revisado_em TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE evento_risco (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES paciente(id),
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  origem TEXT NOT NULL,
  notificada_terapeuta INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE mensagem_protocolo (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES paciente(id),
  texto TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  lida INTEGER NOT NULL DEFAULT 0
);
