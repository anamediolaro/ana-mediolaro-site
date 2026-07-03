// Cartão compartilhável 1080x1920 (formato story), gerado no aparelho.
// Zero dado clínico: sem humor, sem emoções, sem datas de registro.
// O paciente decide se divulga.

const VERDE = '#2A3530'
const CREME = '#F0EBDF'
const OURO = '#C9A566'

function desenharTextoDestacado(
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  yInicial: number,
  larguraMax: number,
  tamanho: number
) {
  // {trecho} vira itálico dourado; o resto fica creme.
  const tokens: { palavra: string; destaque: boolean }[] = []
  for (const parte of texto.split(/(\{[^}]*\})/)) {
    if (!parte) continue
    const destaque = parte.startsWith('{')
    for (const palavra of parte.replaceAll('{', '').replaceAll('}', '').split(/\s+/)) {
      if (!palavra) continue
      // Pontuação solta (ex: o ponto final depois do destaque) cola na
      // palavra anterior em vez de virar "palavra" própria.
      if (/^[.,;:!?]+$/.test(palavra) && tokens.length > 0) {
        tokens[tokens.length - 1].palavra += palavra
      } else {
        tokens.push({ palavra, destaque })
      }
    }
  }

  const fonte = (destaque: boolean) => `${destaque ? 'italic ' : ''}500 ${tamanho}px Lora`
  ctx.font = fonte(false)
  const espaco = ctx.measureText(' ').width

  const linhas: { palavra: string; destaque: boolean }[][] = [[]]
  let larguraLinha = 0
  for (const token of tokens) {
    ctx.font = fonte(token.destaque)
    const largura = ctx.measureText(token.palavra).width
    const atual = linhas[linhas.length - 1]
    if (atual.length > 0 && larguraLinha + espaco + largura > larguraMax) {
      linhas.push([token])
      larguraLinha = largura
    } else {
      atual.push(token)
      larguraLinha = atual.length === 1 ? largura : larguraLinha + espaco + largura
    }
  }

  let y = yInicial
  for (const linha of linhas) {
    let cursorX = x
    for (const token of linha) {
      ctx.font = fonte(token.destaque)
      ctx.fillStyle = token.destaque ? OURO : CREME
      ctx.fillText(token.palavra, cursorX, y)
      cursorX += ctx.measureText(token.palavra).width + espaco
    }
    y += tamanho * 1.32
  }
  return y
}

export async function gerarCartao(opcoes: {
  texto: string
  paths: string[]
  arquivo: string
}): Promise<{ blob: Blob; arquivo: string }> {
  await document.fonts.load('italic 500 96px Lora')
  await document.fonts.load('500 96px Lora')
  await document.fonts.load('600 36px Poppins')
  await document.fonts.load('300 30px Poppins')

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = VERDE
  ctx.fillRect(0, 0, 1080, 1920)

  // Selo no topo
  ctx.fillStyle = OURO
  ctx.font = '600 34px Poppins'
  const selo = 'D I Á R I O   D A S   E M O Ç Õ E S'
  ctx.fillText(selo, 96, 200)

  // Medalha em traço dourado
  const centroX = 96 + 110
  const centroY = 560
  ctx.strokeStyle = OURO
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(centroX, centroY, 110, 0, Math.PI * 2)
  ctx.stroke()

  ctx.save()
  const escala = 130 / 24
  ctx.translate(centroX - (24 * escala) / 2, centroY - (24 * escala) / 2)
  ctx.scale(escala, escala)
  ctx.lineWidth = 1.5 / 1
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const p of opcoes.paths) {
    ctx.stroke(new Path2D(p))
  }
  ctx.restore()

  // Texto grande
  desenharTextoDestacado(ctx, opcoes.texto, 96, 1250, 888, 96)

  // Rodapé
  ctx.strokeStyle = 'rgba(240,235,223,0.25)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(96, 1700)
  ctx.lineTo(984, 1700)
  ctx.stroke()
  ctx.fillStyle = 'rgba(240,235,223,0.85)'
  ctx.font = '300 32px Poppins'
  ctx.fillText('Diário das Emoções · Ana Mediolaro', 96, 1768)
  ctx.fillText('@anamediolaro.oficial', 96, 1816)

  const blob = await new Promise<Blob>((resolver, rejeitar) =>
    canvas.toBlob((b) => (b ? resolver(b) : rejeitar(new Error('cartao'))), 'image/jpeg', 0.92)
  )
  return { blob, arquivo: opcoes.arquivo }
}

export async function compartilharCartao(cartao: { blob: Blob; arquivo: string }) {
  const file = new File([cartao.blob], cartao.arquivo, { type: 'image/jpeg' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch {
      // usuário cancelou ou o sistema recusou: cai para o download
    }
  }
  const url = URL.createObjectURL(cartao.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = cartao.arquivo
  a.click()
  URL.revokeObjectURL(url)
}
