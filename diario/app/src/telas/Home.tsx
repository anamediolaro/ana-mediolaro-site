import type { Eu } from '../App'
import { TopoApp } from '../componentes/TopoApp'
import { CartaoRegistro, type Registro } from '../componentes/CartaoRegistro'
import { saudacao } from '../dados'

export function Home({
  eu,
  aoRegistrar,
  aoPedirApoio,
  aoAbrirTarefas,
}: {
  eu: Eu
  aoRegistrar: () => void
  aoPedirApoio: () => void
  aoAbrirTarefas: () => void
}) {
  const primeiroNome = eu.nome.split(' ')[0]
  const voltou = eu.diasDesdeUltimo !== null && eu.diasDesdeUltimo >= 7

  return (
    <div className="tela">
      <TopoApp />
      <div className="t-h1">
        {saudacao(new Date().getHours())}, <em>{primeiroNome}</em>.
      </div>
      {voltou ? (
        <p className="t-sub">Você voltou. É isso que importa.</p>
      ) : (
        <p className="t-sub">Como você está agora? Não existe resposta certa. Existe a sua.</p>
      )}
      <button className="t-btn" onClick={aoRegistrar}>
        Registrar como me sinto
      </button>
      <button className="t-btn fantasma" onClick={aoPedirApoio}>
        Preciso de apoio agora
      </button>
      {eu.tarefasPendentes > 0 && (
        <button
          className="t-card"
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
          onClick={aoAbrirTarefas}
        >
          <span className="t-nivel">✦ {eu.tarefasPendentes === 1 ? 'Uma tarefa da sua psicóloga' : `${eu.tarefasPendentes} tarefas da sua psicóloga`}</span>
          <span className="t-sub" style={{ display: 'block', marginTop: 4 }}>
            Responda quando fizer sentido. Vale 5 estrelas.
          </span>
        </button>
      )}
      {eu.ultimoRegistro && (
        <>
          <div className="t-label" style={{ marginTop: 26 }}>
            Último registro
          </div>
          <CartaoRegistro registro={eu.ultimoRegistro as unknown as Registro} />
        </>
      )}
      {eu.registrosHoje > 0 && (
        <p className="t-sub" style={{ textAlign: 'center', marginTop: 16 }}>
          {eu.registrosHoje === 1
            ? '1 registro hoje.'
            : `${eu.registrosHoje} registros hoje.`}
        </p>
      )}
    </div>
  )
}
