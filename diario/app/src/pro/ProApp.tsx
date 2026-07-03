import { useEffect, useState } from 'react'
import { apiPro } from '../api'
import { LoginPro } from './LoginPro'
import { ListaPacientes } from './ListaPacientes'
import { PerfilPaciente } from './PerfilPaciente'

type Estado =
  | { tela: 'verificando' }
  | { tela: 'login' }
  | { tela: 'lista' }
  | { tela: 'perfil'; pacienteId: string }

export function ProApp() {
  const [estado, setEstado] = useState<Estado>({ tela: 'verificando' })

  useEffect(() => {
    apiPro
      .sessao()
      .then(() => setEstado({ tela: 'lista' }))
      .catch(() => setEstado({ tela: 'login' }))
  }, [])

  if (estado.tela === 'verificando') return <div className="tela pro sem-nav" />
  if (estado.tela === 'login')
    return <LoginPro aoEntrar={() => setEstado({ tela: 'lista' })} />
  if (estado.tela === 'perfil')
    return (
      <PerfilPaciente
        pacienteId={estado.pacienteId}
        aoVoltar={() => setEstado({ tela: 'lista' })}
      />
    )
  return (
    <ListaPacientes
      aoAbrir={(pacienteId) => setEstado({ tela: 'perfil', pacienteId })}
      aoSair={async () => {
        await apiPro.sair().catch(() => {})
        setEstado({ tela: 'login' })
      }}
    />
  )
}
