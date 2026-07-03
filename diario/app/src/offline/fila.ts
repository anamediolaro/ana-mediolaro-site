// Fila offline: registros feitos sem internet ficam no IndexedDB do
// aparelho e são apagados assim que o servidor confirma. O histórico
// clínico em si nunca é guardado aqui, só o que ainda não subiu.

const BANCO = 'diario-fila'
const LOJA = 'registros'

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolver, rejeitar) => {
    const pedido = indexedDB.open(BANCO, 1)
    pedido.onupgradeneeded = () => {
      pedido.result.createObjectStore(LOJA, { keyPath: 'id' })
    }
    pedido.onsuccess = () => resolver(pedido.result)
    pedido.onerror = () => rejeitar(pedido.error)
  })
}

export async function enfileirar(registro: Record<string, unknown>): Promise<void> {
  const banco = await abrir()
  await new Promise<void>((resolver, rejeitar) => {
    const tx = banco.transaction(LOJA, 'readwrite')
    tx.objectStore(LOJA).put(registro)
    tx.oncomplete = () => resolver()
    tx.onerror = () => rejeitar(tx.error)
  })
}

export async function sincronizarFila(
  enviar: (registro: Record<string, unknown>) => Promise<void>
): Promise<void> {
  const banco = await abrir()
  const pendentes = await new Promise<Record<string, unknown>[]>((resolver, rejeitar) => {
    const pedido = banco.transaction(LOJA).objectStore(LOJA).getAll()
    pedido.onsuccess = () => resolver(pedido.result)
    pedido.onerror = () => rejeitar(pedido.error)
  })
  for (const registro of pendentes) {
    await enviar(registro)
    await new Promise<void>((resolver, rejeitar) => {
      const tx = banco.transaction(LOJA, 'readwrite')
      tx.objectStore(LOJA).delete(registro.id as IDBValidKey)
      tx.oncomplete = () => resolver()
      tx.onerror = () => rejeitar(tx.error)
    })
  }
}
