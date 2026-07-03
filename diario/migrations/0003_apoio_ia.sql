-- Etapa 4: assistente de RPD acompanha em qual das 7 etapas a conversa
-- está, para o servidor conduzir o trilho único.

ALTER TABLE rpd ADD COLUMN etapa INTEGER NOT NULL DEFAULT 0;
