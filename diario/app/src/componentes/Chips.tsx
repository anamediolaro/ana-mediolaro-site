export function Chips({
  opcoes,
  selecionadas,
  aoAlternar,
  pessoais = false,
}: {
  opcoes: string[]
  selecionadas: string[]
  aoAlternar: (valor: string) => void
  pessoais?: boolean
}) {
  return (
    <div className="t-chips">
      {opcoes.map((opcao) => {
        const sel = selecionadas.includes(opcao)
        return (
          <button
            key={opcao}
            className={`t-chip${pessoais ? ' pessoal' : ''}${sel ? ' sel' : ''}`}
            onClick={() => aoAlternar(opcao)}
          >
            {opcao}
          </button>
        )
      })}
    </div>
  )
}
