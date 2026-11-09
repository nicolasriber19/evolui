import { ChevronRight, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router'
import { useDadosCompletos } from '../../db/hooksAgregados'
import type { Area, AreaId, Config, DiaISO } from '../../db/tipos'
import { INFO_AREAS } from '../../lib/areas'
import { diaDaSemana, numeroDaSemana, semanaISO, somarDias } from '../../lib/datas'
import { nivel, xpPorArea } from '../../lib/xp'

/**
 * Domingo: chama para a revisão da semana. Segunda: se a semana passada ficou sem revisão
 * (e teve alguma atividade), oferece revisar ela.
 */
export function ChamadaRevisao({ hoje }: { hoje: DiaISO }) {
  const dados = useDadosCompletos()
  if (!dados) return null
  const dia = diaDaSemana(hoje)
  const atual = semanaISO(hoje)
  const anterior = semanaISO(somarDias(hoje, -7))
  const revisada = (id: string) => !!dados.semanas.find((s) => s.id === id)?.revisao?.feitaEm

  let alvo: string | null = null
  let texto = ''
  if (dia === 0 && !revisada(atual)) {
    alvo = atual
    texto = 'Sua semana está pronta para revisar'
  } else if (dia === 1 && !revisada(anterior)) {
    const teveAtividade = dados.checks.some((c) => semanaISO(c.dia) === anterior)
    if (teveAtividade) {
      alvo = anterior
      texto = 'A semana passada ainda não foi revisada'
    }
  }
  if (!alvo) return null

  return (
    <Link
      to={`/revisao/${alvo}`}
      className="entra flex min-h-16 items-center gap-3 rounded-2xl border border-linha-forte bg-cartao-2 px-4 py-3 transition-transform duration-150 ease-saida active:scale-[0.99]"
    >
      <Sparkles className="size-5 shrink-0 text-destaque-texto" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-tinta-suave">Revisão da semana {numeroDaSemana(alvo)}</span>
        <span className="block font-display text-lg leading-snug font-medium tracking-tight">{texto}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-tinta-suave" aria-hidden="true" />
    </Link>
  )
}

/** Quando uma área sobe de nível, a tela Hoje avisa uma vez (o aviso some depois que você vê a Evolução). */
export function AvisoNivel({ config, areas }: { config: Config; areas: Area[] }) {
  const dados = useDadosCompletos()
  if (!dados) return null
  const xp = xpPorArea(dados)
  const vistos = config.niveisVistos ?? {}
  const subiram = areas.filter((a) => a.ativa && nivel(xp[a.id]).nivel > (vistos[a.id as AreaId] ?? 1))
  if (subiram.length === 0) return null
  const [primeira] = subiram

  return (
    <Link
      to="/evolucao"
      className="entra flex min-h-14 items-center gap-3 rounded-2xl border border-linha bg-cartao px-4 py-3 transition-transform duration-150 ease-saida active:scale-[0.99]"
    >
      <TrendingUp className="size-5 shrink-0 text-destaque-texto" aria-hidden="true" />
      <span className="flex-1 text-[15px]">
        {INFO_AREAS[primeira.id].nome} chegou ao nível {nivel(xp[primeira.id]).nivel}
        {subiram.length > 1 && <span className="text-tinta-suave"> e mais {subiram.length - 1}</span>}
      </span>
      <ChevronRight className="size-4 shrink-0 text-tinta-suave" aria-hidden="true" />
    </Link>
  )
}
