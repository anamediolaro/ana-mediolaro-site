import { useEffect, useState } from 'react'
import { apiApoio } from '../api'
import { TopoApp } from '../componentes/TopoApp'

function base64UrlParaBytes(texto: string): Uint8Array {
  const preenchido = texto.replaceAll('-', '+').replaceAll('_', '/')
  return Uint8Array.from(atob(preenchido), (c) => c.charCodeAt(0))
}

// Lembretes: no máximo 2 por dia, escolha do paciente. Texto acolhedor,
// nunca alarmista.
export function Lembretes({ aoVoltar }: { aoVoltar: () => void }) {
  const [frequencia, setFrequencia] = useState(0)
  const [horarios, setHorarios] = useState<string[]>([])
  const [chavePublica, setChavePublica] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    apiApoio
      .lembrete()
      .then((r) => {
        setFrequencia(r.frequencia)
        setHorarios(r.horarios)
        setChavePublica(r.chavePublica)
      })
      .catch(() => {})
  }, [])

  const escolher = (n: number) => {
    setFrequencia(n)
    const padrao = ['09:00', '20:00']
    setHorarios(Array.from({ length: n }, (_, i) => horarios[i] ?? padrao[i]))
  }

  const ativarPush = async (): Promise<boolean> => {
    if (!chavePublica || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setAviso(
        'Este aparelho não recebe notificações do app. No iPhone, adicione o app à tela de início primeiro.'
      )
      return false
    }
    const permissao = await Notification.requestPermission()
    if (permissao !== 'granted') {
      setAviso('Sem a permissão de notificação, o lembrete não chega. Você pode mudar isso nos ajustes do aparelho.')
      return false
    }
    const registro = await navigator.serviceWorker.ready
    const inscricao = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlParaBytes(chavePublica) as unknown as BufferSource,
    })
    const json = inscricao.toJSON()
    await apiApoio.inscreverPush({
      endpoint: inscricao.endpoint,
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
    })
    return true
  }

  const salvar = async () => {
    setSalvando(true)
    setAviso('')
    try {
      if (frequencia > 0) {
        const ok = await ativarPush()
        if (!ok && chavePublica) {
          setSalvando(false)
          return
        }
      }
      await apiApoio.salvarLembrete(frequencia, horarios)
      aoVoltar()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="tela sem-nav">
      <TopoApp direita="lembretes" />
      <div className="t-h1">
        Seus <em>lembretes</em>
      </div>
      <p className="t-sub">
        Um toque leve para lembrar do diário. Você escolhe se quer, quando e quantos. Exemplo do
        texto: "Um minuto para você. Como está agora?"
      </p>
      <div className="t-label">Quantos por dia</div>
      <div className="t-chips">
        {[
          { n: 0, rotulo: 'Nenhum' },
          { n: 1, rotulo: '1 por dia' },
          { n: 2, rotulo: '2 por dia' },
        ].map((opcao) => (
          <button
            key={opcao.n}
            className={`t-chip${frequencia === opcao.n ? ' sel' : ''}`}
            onClick={() => escolher(opcao.n)}
          >
            {opcao.rotulo}
          </button>
        ))}
      </div>
      {horarios.map((hora, i) => (
        <div key={i}>
          <div className="t-label">{frequencia === 1 ? 'Horário' : `Horário ${i + 1}`}</div>
          <input
            type="time"
            className="t-input"
            value={hora}
            onChange={(e) =>
              setHorarios(horarios.map((h, j) => (j === i ? e.target.value : h)))
            }
          />
        </div>
      ))}
      {!chavePublica && frequencia > 0 && (
        <div className="t-aviso">
          As notificações deste app ainda não foram ativadas pelo painel. A sua preferência fica
          salva e passa a valer assim que forem.
        </div>
      )}
      {aviso && <div className="t-aviso">{aviso}</div>}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button className="t-btn" disabled={salvando} onClick={() => void salvar()}>
          Salvar
        </button>
        <button className="t-btn fantasma" onClick={aoVoltar}>
          Voltar
        </button>
      </div>
    </div>
  )
}
