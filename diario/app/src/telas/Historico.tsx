import { useEffect, useState } from 'react'
import { api } from '../api'
import { TopoApp } from '../componentes/TopoApp'
import { CartaoRegistro, type Registro } from '../componentes/CartaoRegistro'
import { diaLocal } from '../dados'

function tituloDoDia(dia: string): string {
  const hoje = diaLocal()
  const ontem = diaLocal(new Date(Date.now() - 86400000))
  if (dia === hoje) return 'Hoje'
  if (dia === ontem) return 'Ontem'
  const [ano, mes, diaNum] = dia.split('-').map(Number)
  return new Date(ano, mes - 1, diaNum).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  })
}

export function Historico() {
  const [registros, setRegistros] = useState<Registro[] | null>(null)

  useEffect(() => {
    api
      .registros()
      .then((r: { registros: Registro[] }) => setRegistros(r.registros))
      .catch(() => setRegistros([]))
  }, [])

  const alternarSessao = async (id: string, falar: boolean) => {
    setRegistros(
      (atuais) =>
        atuais?.map((r) => (r.id === id ? { ...r, falar_na_sessao: falar ? 1 : 0 } : r)) ?? null
    )
    try {
      await api.marcarSessao(id, falar)
    } catch {
      setRegistros(
        (atuais) =>
          atuais?.map((r) => (r.id === id ? { ...r, falar_na_sessao: falar ? 0 : 1 } : r)) ?? null
      )
    }
  }

  const grupos: { dia: string; itens: Registro[] }[] = []
  for (const registro of registros ?? []) {
    const dia = registro.timestamp.slice(0, 10)
    const grupo = grupos.find((g) => g.dia === dia)
    if (grupo) grupo.itens.push(registro)
    else grupos.push({ dia, itens: [registro] })
  }

  return (
    <div className="tela">
      <TopoApp />
      <div className="t-h1">
        Seu <em>histórico</em>
      </div>
      {registros !== null && registros.length === 0 && (
        <p className="t-sub">
          Seu primeiro registro aparece aqui. Quando quiser, toque em Registrar como me sinto.
        </p>
      )}
      {grupos.map((grupo) => (
        <div key={grupo.dia}>
          <div className="t-dia">{tituloDoDia(grupo.dia)}</div>
          {grupo.itens.map((registro) => (
            <CartaoRegistro
              key={registro.id}
              registro={registro}
              aoAlternarSessao={alternarSessao}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
