import { useEffect, useState } from 'react'
import { apiTarefas } from '../api'
import { TopoApp } from '../componentes/TopoApp'

type Tarefa = {
  id: string
  titulo: string
  orientacoes: string | null
  resposta_paciente: string | null
  respondida_em: string | null
  status: string
}

export function Tarefas({
  aoVoltar,
  aoResponder,
}: {
  aoVoltar: () => void
  aoResponder: () => void
}) {
  const [tarefas, setTarefas] = useState<Tarefa[] | null>(null)
  const [respondendo, setRespondendo] = useState<{ id: string; texto: string } | null>(null)

  const carregar = () => {
    apiTarefas
      .listar()
      .then((r: { tarefas: Tarefa[] }) => setTarefas(r.tarefas))
      .catch(() => setTarefas([]))
  }
  useEffect(carregar, [])

  const enviar = async () => {
    if (!respondendo || !respondendo.texto.trim()) return
    await apiTarefas.responder(respondendo.id, respondendo.texto.trim())
    setRespondendo(null)
    carregar()
    aoResponder()
  }

  return (
    <div className="tela sem-nav">
      <TopoApp direita="tarefas" />
      <div className="t-h1">
        Suas <em>tarefas</em>
      </div>
      <p className="t-sub">
        Propostas da sua psicóloga para a semana. Responda no seu tempo, do seu jeito.
      </p>
      {tarefas !== null && tarefas.length === 0 && (
        <p className="t-sub">Nenhuma tarefa por enquanto.</p>
      )}
      {(tarefas ?? []).map((t) => (
        <div key={t.id} className="t-card">
          <div className="linha1">
            <b style={{ fontFamily: 'Lora, serif', fontSize: 15 }}>{t.titulo}</b>
            <span className={`status-tarefa${t.status === 'respondida' ? ' ok' : ''}`}>
              {t.status}
            </span>
          </div>
          {t.orientacoes && (
            <div className="t-campo">
              <b>Orientações</b>
              <p>{t.orientacoes}</p>
            </div>
          )}
          {t.resposta_paciente ? (
            <div className="t-campo">
              <b>Sua resposta</b>
              <p>{t.resposta_paciente}</p>
            </div>
          ) : respondendo?.id === t.id ? (
            <>
              <textarea
                className="t-input"
                placeholder="Escreva aqui..."
                value={respondendo.texto}
                onChange={(e) => setRespondendo({ id: t.id, texto: e.target.value })}
              />
              <div className="linha-acoes" style={{ marginTop: 10 }}>
                <button className="botao-mini ouro" onClick={() => void enviar()}>
                  Enviar resposta
                </button>
                <button className="botao-mini" onClick={() => setRespondendo(null)}>
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <button
              className="botao-mini ouro"
              style={{ marginTop: 8 }}
              onClick={() => setRespondendo({ id: t.id, texto: '' })}
            >
              Responder
            </button>
          )}
        </div>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: 18 }}>
        <button className="t-btn fantasma" onClick={aoVoltar}>
          Voltar para o início
        </button>
      </div>
    </div>
  )
}
