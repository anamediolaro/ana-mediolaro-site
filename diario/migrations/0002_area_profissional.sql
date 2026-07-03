-- Área profissional: proteção contra força bruta no login.
-- Uma conta só (a da Ana) atrás de uma chave de e-mail: depois de 5
-- tentativas erradas, a chave bloqueia por 15 minutos.

CREATE TABLE login_tentativa (
  chave TEXT PRIMARY KEY,
  tentativas INTEGER NOT NULL DEFAULT 0,
  primeira_em TEXT NOT NULL DEFAULT (datetime('now')),
  bloqueado_ate TEXT
);
