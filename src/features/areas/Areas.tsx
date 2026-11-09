import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Cartao } from '../../components/Cartao'
import { IconeArea } from '../../components/IconeArea'
import {
  useAgora,
  useAreas,
  useChecks,
  useHabitos,
  useLeituras,
  useLivros,
  useRegistrosLazer,
  useSessoes,
  useTentativas,
  useTiposLazer,
  useTodasSemanas,
  useTodosDias,
  useTreinos,
} from '../../db/hooks'
import { contarPromessas, usoDaSemana } from '../../lib/fase3'
import type { AreaId, Config } from '../../db/tipos'
import { INFO_AREAS } from '../../lib/areas'
import { calcularCorrente } from '../../lib/corrente'
import { diaLogico, diasDaSemana, semanaISO } from '../../lib/datas'
import { feitosPorHabito } from '../../lib/votos'
import { formatarMinutos } from '../../lib/formatar'

/** Áreas que já têm tela própria. */
const COM_TELA: Record<AreaId, string> = {
  corpo: '/areas/corpo',
  estudo: '/areas/estudo',
  leitura: '/areas/leitura',
  comunicacao: '/areas/comunicacao',
  mente: '/areas/mente',
  lazer: '/areas/lazer',
}

/** Cada área ativa: a frase, os votos e como cada hábito está indo. */
export function Areas({ config }: { config: Config }) {
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const areas = useAreas()
  const habitos = useHabitos()
  const checks = useChecks()
  const treinos = useTreinos()
  const sessoes = useSessoes()
  const leituras = useLeituras()
  const livros = useLivros()
  const semanas = useTodasSemanas()
  const tentativas = useTentativas()
  const todosDias = useTodosDias()
  const tiposLazer = useTiposLazer()
  const registrosLazer = useRegistrosLazer()

  if (
    !areas || !habitos || !checks || !treinos || !sessoes || !leituras || !livros ||
    !semanas || !tentativas || !todosDias || !tiposLazer || !registrosLazer
  )
    return null

  const ativas = areas.filter((a) => a.ativa)
  const desligadas = areas.filter((a) => !a.ativa)
  const semana = new Set(diasDaSemana(hoje))
  const feitos = feitosPorHabito(checks)

  // Um número real da semana para cada área com tela própria.
  function resumo(area: AreaId): string | null {
    if (area === 'corpo') {
      const n = treinos!.filter((t) => t.concluidoEm !== undefined && semana.has(t.dia)).length
      return `${n} ${n === 1 ? 'treino' : 'treinos'} esta semana`
    }
    if (area === 'estudo') {
      const min = sessoes!.filter((x) => semana.has(x.dia)).reduce((soma, x) => soma + x.minutos, 0)
      return `${formatarMinutos(min)} de estudo esta semana`
    }
    if (area === 'leitura') {
      const pag = leituras!.filter((l) => semana.has(l.dia)).reduce((soma, l) => soma + l.paginas, 0)
      const lendo = livros!.find((l) => l.status === 'lendo')
      return `${pag} ${pag === 1 ? 'página' : 'páginas'} esta semana${lendo ? ` · lendo ${lendo.titulo}` : ''}`
    }
    if (area === 'comunicacao') {
      const desafio = semanas!.find((s) => s.id === semanaISO(hoje))?.desafio
      if (!desafio) return 'Desafio da semana ainda não sorteado'
      const n = tentativas!.filter((t) => t.semana === semanaISO(hoje)).length
      return `Desafio: ${desafio.texto} · ${n} ${n === 1 ? 'tentativa' : 'tentativas'}`
    }
    if (area === 'mente') {
      const n = contarPromessas({ checks: checks!, dias: todosDias!, semanas: semanas!, tentativas: tentativas! }, [...semana]).total
      return `${n} ${n === 1 ? 'promessa cumprida' : 'promessas cumpridas'} esta semana`
    }
    if (area === 'lazer') {
      const ativos = tiposLazer!.filter((t) => t.ativo)
      if (ativos.length === 0) return 'Orçamento de lazer ainda não definido'
      const usado = usoDaSemana(ativos, registrosLazer!, [...semana]).reduce((s, u) => s + u.usado, 0)
      const total = ativos.reduce((s, t) => s + t.orcamentoMin, 0)
      return `${formatarMinutos(usado)} de ${formatarMinutos(total)} de lazer esta semana`
    }
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="pb-1 font-display text-[1.75rem] leading-tight font-medium tracking-tight">Áreas</h1>

      {ativas.map((area) => {
        const daArea = checks.filter((c) => c.areaId === area.id)
        const votosSemana = daArea.filter((c) => semana.has(c.dia)).length
        const habitosDaArea = habitos.filter((h) => h.areaId === area.id)
        return (
          <Cartao key={area.id}>
            <TopoDaArea para={COM_TELA[area.id]}>
              <p className="flex items-center gap-1.5 text-xs text-tinta-suave">
                <IconeArea area={area.id} className="size-3.5" />
                {INFO_AREAS[area.id].nome}
              </p>
              <p className="mt-1 font-display text-[1.35rem] leading-tight font-medium tracking-tight">{area.frase}</p>
              <p className="mt-2 text-sm text-tinta-suave">
                <span className="font-medium text-destaque-texto tabular-nums">{votosSemana}</span> {votosSemana === 1 ? 'voto' : 'votos'} esta semana ·{' '}
                <span className="text-tinta tabular-nums">{daArea.length}</span> no total
              </p>
              {resumo(area.id) && <p className="mt-0.5 text-sm text-tinta-suave">{resumo(area.id)}</p>}
            </TopoDaArea>

            {habitosDaArea.length > 0 && (
              <ul className="mt-3 border-t border-linha">
                {habitosDaArea.map((h) => {
                  const r = calcularCorrente(h, feitos.get(h.id) ?? new Set(), hoje)
                  return (
                    <li key={h.id} className="border-b border-linha py-2.5 last:border-b-0 last:pb-0">
                      <p className={`text-[15px] ${h.ativo ? '' : 'text-tinta-suave'}`}>
                        {h.nome}
                        {!h.ativo && <span className="ml-2 text-xs">pausado</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-tinta-suave tabular-nums">
                        corrente <span className="text-tinta">{r.corrente}</span> · recorde{' '}
                        <span className="text-tinta">{r.recorde}</span> ·{' '}
                        {r.consistencia === null ? (
                          'consistência aparece depois do primeiro dia'
                        ) : (
                          <>
                            <span className="text-tinta">{Math.round(r.consistencia * 100)}%</span> nas últimas 4 semanas
                          </>
                        )}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </Cartao>
        )
      })}

      {desligadas.length > 0 && (
        <p className="px-1 text-sm text-tinta-suave">
          Desligadas: {desligadas.map((a) => INFO_AREAS[a.id].nome).join(', ')}.{' '}
          <Link to="/ajustes" className="text-destaque-texto underline underline-offset-4">
            Ligar em Ajustes
          </Link>
        </p>
      )}
    </div>
  )
}

/** O topo do cartão vira um link quando a área tem tela própria. */
function TopoDaArea({ para, children }: { para?: string; children: ReactNode }) {
  if (!para) return <div>{children}</div>
  return (
    <Link to={para} className="-m-1 flex items-center gap-2 rounded-xl p-1 transition-transform duration-150 ease-saida active:scale-[0.99]">
      <div className="min-w-0 flex-1">{children}</div>
      <ChevronRight className="size-5 shrink-0 text-tinta-suave" aria-hidden="true" />
    </Link>
  )
}
