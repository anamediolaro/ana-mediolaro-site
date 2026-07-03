import { useState } from 'react'
import { TopoApp } from '../componentes/TopoApp'

export function LoginPro({ aoEntrar }: { aoEntrar: () => void }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const entrar = async () => {
    setEnviando(true)
    setErro('')
    try {
      const resposta = await fetch('/api/pro/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      if (resposta.status === 429) {
        setErro('Muitas tentativas. Espere 15 minutos e tente de novo.')
      } else if (!resposta.ok) {
        setErro('E-mail ou senha não conferem.')
      } else {
        aoEntrar()
      }
    } catch {
      setErro('Sem conexão agora. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="tela pro sem-nav">
      <TopoApp direita="área profissional" />
      <div style={{ maxWidth: 420, width: '100%', margin: '48px auto 0' }}>
        <div className="t-h1">
          Área <em>profissional</em>
        </div>
        <p className="t-sub">Acesso restrito à psicóloga responsável.</p>
        <label className="t-label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          className="t-input"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="t-label" htmlFor="senha">
          Senha
        </label>
        <input
          id="senha"
          className="t-input"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !enviando && void entrar()}
        />
        {erro && (
          <p className="t-sub" style={{ marginTop: 12 }}>
            {erro}
          </p>
        )}
        <button
          className="t-btn"
          disabled={enviando || !email || !senha}
          onClick={() => void entrar()}
        >
          Entrar
        </button>
      </div>
    </div>
  )
}
