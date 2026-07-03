import { useEffect, useState } from 'react'
import { apiApoio } from '../api'

// Player dos áudios da Ana: o arquivo vem autenticado pela API e vira
// um blob local, então nenhum token aparece em URL.
export function PlayerAudio({ audioId }: { audioId: string }) {
  const [url, setUrl] = useState('')
  const [falhou, setFalhou] = useState(false)

  useEffect(() => {
    let urlLocal = ''
    apiApoio.baixarAudio(audioId).then((u) => {
      if (u) {
        urlLocal = u
        setUrl(u)
      } else {
        setFalhou(true)
      }
    })
    return () => {
      if (urlLocal) URL.revokeObjectURL(urlLocal)
    }
  }, [audioId])

  if (falhou)
    return (
      <p className="t-sub" style={{ marginTop: 8 }}>
        O áudio não está disponível agora.
      </p>
    )
  if (!url) return <p className="t-sub" style={{ marginTop: 8 }}>Carregando...</p>
  return <audio controls autoPlay src={url} style={{ width: '100%', marginTop: 10 }} />
}
