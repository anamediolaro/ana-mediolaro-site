// Exportação em PDF no navegador da Ana: o Worker só entrega os dados,
// o documento nasce aqui. Identidade do app: Lora, Poppins e a paleta.
import { rotuloHumor } from '../dados'

type RegistroPdf = {
  id: string
  timestamp: string
  nivel: number
  emocoes: string
  emocoes_livres: string
  atividades: string
  atividade_texto: string | null
  pensamento: string | null
  corpo: string
  acao: string | null
  sono: string | null
  falar_na_sessao: number
}

type AnotacaoPdf = { registro_id: string; texto: string }

const VERDE = { r: 42 / 255, g: 53 / 255, b: 48 / 255 }
const SAGE = { r: 92 / 255, g: 107 / 255, b: 94 / 255 }
const OURO = { r: 201 / 255, g: 165 / 255, b: 102 / 255 }

const SONO_ROTULO: Record<string, string> = {
  bem: 'Dormi bem',
  mal: 'Dormi mal',
  cansado: 'Acordei cansado(a)',
  insonia: 'Insônia',
}

const lista = (json: string): string[] => {
  try {
    return JSON.parse(json)
  } catch {
    return []
  }
}

export async function exportarPdf(
  nomePaciente: string,
  de: string,
  ate: string,
  registros: RegistroPdf[],
  anotacoes: AnotacaoPdf[]
) {
  const { PDFDocument, rgb } = await import('pdf-lib')
  const fontkit = (await import('@pdf-lib/fontkit')).default

  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)

  const bytesDe = async (caminho: string) =>
    new Uint8Array(await (await fetch(caminho)).arrayBuffer())
  const lora = await doc.embedFont(await bytesDe('/fontes/pdf-lora-400.ttf'), { subset: true })
  const loraNegrito = await doc.embedFont(await bytesDe('/fontes/pdf-lora-600.ttf'), {
    subset: true,
  })
  const poppins = await doc.embedFont(await bytesDe('/fontes/pdf-poppins-300.ttf'), {
    subset: true,
  })
  const poppinsMedio = await doc.embedFont(await bytesDe('/fontes/pdf-poppins-600.ttf'), {
    subset: true,
  })

  const LARGURA = 595.28
  const ALTURA = 841.89
  const MARGEM = 52
  const LARGURA_UTIL = LARGURA - MARGEM * 2

  let pagina = doc.addPage([LARGURA, ALTURA])
  let y = ALTURA - MARGEM

  const novaPagina = () => {
    pagina = doc.addPage([LARGURA, ALTURA])
    y = ALTURA - MARGEM
  }

  const garantir = (altura: number) => {
    if (y - altura < MARGEM) novaPagina()
  }

  const quebrar = (texto: string, fonte: typeof lora, tamanho: number, largura: number) => {
    const palavras = texto.split(/\s+/)
    const linhas: string[] = []
    let atual = ''
    for (const palavra of palavras) {
      const tentativa = atual ? `${atual} ${palavra}` : palavra
      if (fonte.widthOfTextAtSize(tentativa, tamanho) <= largura) {
        atual = tentativa
      } else {
        if (atual) linhas.push(atual)
        atual = palavra
      }
    }
    if (atual) linhas.push(atual)
    return linhas
  }

  const escrever = (
    texto: string,
    fonte: typeof lora,
    tamanho: number,
    cor: { r: number; g: number; b: number },
    recuo = 0,
    entrelinha = 1.45
  ) => {
    for (const linha of quebrar(texto, fonte, tamanho, LARGURA_UTIL - recuo)) {
      garantir(tamanho * entrelinha)
      pagina.drawText(linha, {
        x: MARGEM + recuo,
        y: y - tamanho,
        size: tamanho,
        font: fonte,
        color: rgb(cor.r, cor.g, cor.b),
      })
      y -= tamanho * entrelinha
    }
  }

  // Cabeçalho
  pagina.drawText('Diário das Emoções', {
    x: MARGEM,
    y: y - 20,
    size: 20,
    font: loraNegrito,
    color: rgb(VERDE.r, VERDE.g, VERDE.b),
  })
  y -= 30
  escrever(`Registros de ${nomePaciente}`, lora, 13, VERDE)
  const formatar = (dia: string) => dia.split('-').reverse().join('/')
  escrever(
    `Período: ${formatar(de)} a ${formatar(ate)} · Gerado em ${new Date().toLocaleDateString('pt-BR')} · Ana Mediolaro · CRP 06/85707`,
    poppins,
    9,
    SAGE
  )
  y -= 8
  pagina.drawLine({
    start: { x: MARGEM, y },
    end: { x: LARGURA - MARGEM, y },
    thickness: 0.75,
    color: rgb(OURO.r, OURO.g, OURO.b),
  })
  y -= 18

  const porRegistro = new Map<string, string[]>()
  for (const a of anotacoes) {
    const atual = porRegistro.get(a.registro_id) ?? []
    atual.push(a.texto)
    porRegistro.set(a.registro_id, atual)
  }

  let diaAtual = ''
  const ordenados = [...registros].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  for (const registro of ordenados) {
    const dia = registro.timestamp.slice(0, 10)
    if (dia !== diaAtual) {
      diaAtual = dia
      garantir(34)
      y -= 8
      escrever(formatar(dia), loraNegrito, 12, VERDE)
      y -= 2
    }

    garantir(24)
    const hora = registro.timestamp.slice(11, 16)
    const flag = registro.falar_na_sessao ? '  ✦ para a sessão' : ''
    pagina.drawText(`${hora} · ${rotuloHumor(registro.nivel)}${flag}`, {
      x: MARGEM,
      y: y - 10.5,
      size: 10.5,
      font: poppinsMedio,
      color: rgb(OURO.r, OURO.g, OURO.b),
    })
    y -= 17

    const emocoes = [...lista(registro.emocoes), ...lista(registro.emocoes_livres)]
    if (emocoes.length) escrever(`Emoções: ${emocoes.join(', ')}`, poppins, 10, VERDE, 10)
    const contextos = [
      ...lista(registro.atividades),
      ...(registro.atividade_texto ? [registro.atividade_texto] : []),
    ]
    if (contextos.length) escrever(`Contexto: ${contextos.join(', ')}`, poppins, 10, VERDE, 10)
    if (registro.pensamento)
      escrever(`Pensamento: ${registro.pensamento}`, poppins, 10, VERDE, 10)
    const corpo = lista(registro.corpo)
    if (corpo.length) escrever(`Corpo: ${corpo.join(', ')}`, poppins, 10, VERDE, 10)
    if (registro.acao) escrever(`Ação: ${registro.acao}`, poppins, 10, VERDE, 10)
    if (registro.sono)
      escrever(`Sono: ${SONO_ROTULO[registro.sono] ?? registro.sono}`, poppins, 10, VERDE, 10)
    for (const texto of porRegistro.get(registro.id) ?? []) {
      escrever(`Minha anotação: ${texto}`, lora, 10, SAGE, 10)
    }
    y -= 8
  }

  if (!ordenados.length) escrever('Nenhum registro no período.', poppins, 10, SAGE)

  // Rodapé com numeração
  const paginas = doc.getPages()
  paginas.forEach((p, indice) => {
    p.drawText(`Diário das Emoções · ${nomePaciente} · página ${indice + 1} de ${paginas.length}`, {
      x: MARGEM,
      y: 28,
      size: 8,
      font: poppins,
      color: rgb(SAGE.r, SAGE.g, SAGE.b),
    })
  })

  const bytes = await doc.save()
  const slug = nomePaciente
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `diario-emocoes-${slug}-${de}-a-${ate}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
