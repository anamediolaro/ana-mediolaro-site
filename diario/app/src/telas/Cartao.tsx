import { useEffect, useState } from 'react'
import { TopoApp } from '../componentes/TopoApp'
import { gerarCartao, compartilharCartao } from '../cartao'

export type PedidoCartao = { texto: string; paths: string[]; arquivo: string }

// Pré-visualização do cartão compartilhável: o paciente vê exatamente a
// imagem que sai do app e decide se compartilha.
export function Cartao({ pedido, aoVoltar }: { pedido: PedidoCartao; aoVoltar: () => void }) {
  const [cartao, setCartao] = useState<{ blob: Blob; arquivo: string } | null>(null)
  const [url, setUrl] = useState('')

  useEffect(() => {
    let ativo = true
    let urlLocal = ''
    gerarCartao(pedido).then((c) => {
      if (!ativo) return
      urlLocal = URL.createObjectURL(c.blob)
      setCartao(c)
      setUrl(urlLocal)
    })
    return () => {
      ativo = false
      if (urlLocal) URL.revokeObjectURL(urlLocal)
    }
  }, [pedido])

  return (
    <div className="tela sem-nav">
      <TopoApp direita="compartilhar" />
      <div className="t-h1">
        Sua <em>conquista</em>
      </div>
      <p className="t-sub">
        A imagem não mostra nenhum registro seu, só a conquista. Você decide se divulga.
      </p>
      {url && (
        <img
          src={url}
          alt="Cartão da conquista"
          style={{
            width: '70%',
            maxWidth: 240,
            margin: '16px auto 0',
            borderRadius: 14,
            border: '1px solid var(--linha)',
            display: 'block',
          }}
        />
      )}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button
          className="t-btn ouro"
          disabled={!cartao}
          onClick={() => cartao && void compartilharCartao(cartao)}
        >
          Compartilhar
        </button>
        <button className="t-btn fantasma" onClick={aoVoltar}>
          Voltar
        </button>
      </div>
    </div>
  )
}
