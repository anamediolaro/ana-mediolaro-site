import { useState } from 'react'

export function BoasVindas({
  nome,
  aoComecar,
}: {
  nome: string
  aoComecar: (nome: string) => Promise<void>
}) {
  const [valor, setValor] = useState(nome)
  const [salvando, setSalvando] = useState(false)

  return (
    <div className="tela sem-nav">
      <div style={{ marginTop: 48 }}>
        <div className="t-h1">
          Bem-vindo(a) ao seu <em>diário</em>.
        </div>
        <p className="t-sub">
          Um espaço seu, para registrar como você se sente entre as sessões. Leva menos de um
          minuto.
        </p>
        <label className="t-label" htmlFor="nome">
          Como você quer ser chamado(a)?
        </label>
        <input
          id="nome"
          className="t-input"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Seu nome"
        />
        <button
          className="t-btn"
          disabled={salvando || !valor.trim()}
          onClick={async () => {
            setSalvando(true)
            try {
              await aoComecar(valor.trim())
            } finally {
              setSalvando(false)
            }
          }}
        >
          Começar
        </button>
        <div className="t-aviso">
          Seus registros ficam visíveis para você e para a sua psicóloga, que acompanha o seu
          processo. Ninguém mais tem acesso. Ao tocar em Começar, você concorda com isso.
        </div>
      </div>
    </div>
  )
}
