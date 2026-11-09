import { Dumbbell, Timer } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useAgora, useEstadoFoco, useMaterias, useTreinos } from '../db/hooks'
import { restanteMs } from '../lib/foco'
import { formatarRelogio } from '../lib/formatar'

/**
 * Faixa pequena acima das abas quando tem algo acontecendo (timer de foco ou treino),
 * para você voltar com um toque de qualquer tela.
 */
export function BarraAtividade() {
  const { pathname } = useLocation()
  const estado = useEstadoFoco()
  const materias = useMaterias()
  const treinos = useTreinos()
  useAgora(estado?.rodando ? 1000 : 60_000) // redesenha a cada segundo
  const agora = Date.now()

  const treino = treinos?.find((t) => t.concluidoEm === undefined)
  const mostrarFoco = !!estado && pathname !== '/areas/estudo'
  const mostrarTreino = !!treino && !mostrarFoco && pathname !== '/areas/corpo'
  if (!mostrarFoco && !mostrarTreino) return null

  const classe =
    'entra fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto flex min-h-12 max-w-[calc(28rem-1.5rem)] items-center gap-3 rounded-2xl border border-linha-forte bg-cartao-2 px-4 text-sm shadow-(--sombra)'

  if (mostrarFoco && estado) {
    const nome = materias?.find((m) => m.id === estado.materiaId)?.nome ?? 'Estudo'
    return (
      <Link to="/areas/estudo" className={classe}>
        <Timer className="size-4 text-destaque-texto" aria-hidden="true" />
        <span className="flex-1">{estado.fase === 'pausa' ? 'Pausa' : `Foco em ${nome}`}</span>
        <span className="font-medium tabular-nums">
          {estado.rodando ? formatarRelogio(restanteMs(estado, agora)) : 'pausado'}
        </span>
      </Link>
    )
  }
  return (
    <Link to="/areas/corpo" className={classe}>
      <Dumbbell className="size-4 text-destaque-texto" aria-hidden="true" />
      <span className="flex-1">{treino!.titulo}</span>
      <span className="text-tinta-suave">em andamento</span>
    </Link>
  )
}
