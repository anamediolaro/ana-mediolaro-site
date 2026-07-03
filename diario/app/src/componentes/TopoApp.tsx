export function TopoApp({ direita }: { direita?: string }) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  return (
    <div className="topo-app">
      <span className="marca">
        Diário das <em>Emoções</em>
      </span>
      <span className="data-mini">{direita ?? hoje}</span>
    </div>
  )
}
