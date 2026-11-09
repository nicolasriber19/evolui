import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Abas } from '../../components/Abas'
import { Cartao } from '../../components/Cartao'
import { BarrasHorizontais, ColunasPeriodo } from '../../components/Graficos'
import { IconeArea, PontoArea } from '../../components/IconeArea'
import { MapaDeCalor } from '../../components/MapaDeCalor'
import { marcarNiveisVistos } from '../../db/acoesFase4'
import { useAgora, useAreas } from '../../db/hooks'
import { useDadosCompletos, type DadosCompletos } from '../../db/hooksAgregados'
import type { AreaId, Config, DiaISO } from '../../db/tipos'
import { INFO_AREAS, ORDEM_AREAS } from '../../lib/areas'
import { diaLogico, diasDaSemana, numeroDaSemana, paraData, semanaISO, somarDias } from '../../lib/datas'
import { contarPromessas } from '../../lib/fase3'
import { formatarMinutos } from '../../lib/formatar'
import { mapaDeHabitos } from '../../lib/revisao'
import { nivel, XP, xpPorArea } from '../../lib/xp'

const GraficoLinha = lazy(() => import('../../components/GraficoLinha'))

type Periodo = 'semana' | 'mes'

/** Painel de evolução: níveis por área, a semana ou o mês em gráficos, o calendário dos hábitos e as revisões. */
export function Evolucao({ config }: { config: Config }) {
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const dados = useDadosCompletos()
  const areas = useAreas()
  const [periodo, setPeriodo] = useState<Periodo>('semana')

  const xp = dados ? xpPorArea(dados) : null
  const niveisAgora = xp ? (Object.fromEntries(ORDEM_AREAS.map((a) => [a, nivel(xp[a]).nivel])) as Record<AreaId, number>) : null
  const vistos = config.niveisVistos ?? {}
  const subiram = niveisAgora ? ORDEM_AREAS.filter((a) => niveisAgora[a] > (vistos[a] ?? 1)) : []

  // Depois de mostrar os níveis novos, guarda que você já viu (o destaque some na próxima visita).
  const chaveNiveis = niveisAgora && subiram.length > 0 ? JSON.stringify(niveisAgora) : null
  useEffect(() => {
    if (!chaveNiveis) return
    const t = setTimeout(() => void marcarNiveisVistos(JSON.parse(chaveNiveis)), 4000)
    return () => clearTimeout(t)
  }, [chaveNiveis])

  if (!dados || !areas || !xp) return null

  const ativas = areas.filter((a) => a.ativa)
  const semanaAtual = semanaISO(hoje)
  const revisada = !!dados.semanas.find((s) => s.id === semanaAtual)?.revisao?.feitaEm

  return (
    <div className="flex flex-col gap-4">
      <h1 className="pb-1 font-display text-[1.75rem] leading-tight font-medium tracking-tight">Evolução</h1>

      <Link
        to={`/revisao/${semanaAtual}`}
        className="flex min-h-16 items-center gap-3 rounded-2xl border border-linha bg-cartao px-4 py-3 transition-transform duration-150 ease-saida active:scale-[0.99]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-tinta-suave">Revisão da semana {numeroDaSemana(semanaAtual)}</span>
          <span className="block font-display text-lg leading-snug font-medium tracking-tight">
            {revisada ? 'Semana revisada. Ver de novo' : 'Olhar para a sua semana'}
          </span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-tinta-suave" aria-hidden="true" />
      </Link>

      <Cartao titulo="Níveis">
        <ul className="flex flex-col">
          {ativas.map((a) => {
            const n = nivel(xp[a.id])
            const subiu = subiram.includes(a.id)
            return (
              <li key={a.id} className="border-t border-linha py-3 first:border-t-0 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex items-center gap-2 text-[15px]">
                    <IconeArea area={a.id} className="size-4" />
                    {INFO_AREAS[a.id].nome}
                  </span>
                  <span className={`text-sm tabular-nums ${subiu ? 'font-medium text-destaque-texto' : ''}`}>
                    {subiu ? `Subiu para o nível ${n.nivel}` : `Nível ${n.nivel}`}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-r-[4px] bg-cartao-2" aria-hidden="true">
                  <div className="h-full rounded-r-[4px] bg-grafico" style={{ width: `${(n.xpNoNivel / n.xpDoNivel) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-tinta-suave tabular-nums">
                  {xp[a.id]} XP · faltam {n.xpParaProximo} para o nível {n.nivel + 1}
                </p>
              </li>
            )
          })}
        </ul>
        <details className="mt-3 text-sm text-tinta-suave">
          <summary className="min-h-11 cursor-pointer content-center">Como o XP funciona</summary>
          <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-xs">
            <li>
              Hábito marcado: {XP.habitoCompleto} XP (versão mínima: {XP.habitoMinimo} XP)
            </li>
            <li>Treino concluído: {XP.treino} XP</li>
            <li>Estudo: 1 XP a cada {XP.minutosPorXpDeEstudo} minutos</li>
            <li>Leitura: {XP.pagina} XP por página</li>
            <li>Tentativa do desafio de conversa: {XP.tentativa} XP</li>
            <li>
              Mente: vitória {XP.vitoria} XP, gratidão ou "fiz bem" {XP.diario} XP, evidência {XP.evidencia} XP, revisão da semana{' '}
              {XP.revisao} XP
            </li>
            <li>Lazer registrado como escolha sua: {XP.lazerEscolhido} XP</li>
            <li>XP nunca diminui. Cada nível pede 100 XP a mais que o anterior.</li>
          </ul>
        </details>
      </Cartao>

      <Abas
        abas={[
          { valor: 'semana', rotulo: 'Esta semana' },
          { valor: 'mes', rotulo: 'Últimos 30 dias' },
        ]}
        atual={periodo}
        onMudar={setPeriodo}
        rotulo="Período dos gráficos"
      />
      <Periodo dados={dados} hoje={hoje} periodo={periodo} areasAtivas={ativas.map((a) => a.id)} />

      <Cartao titulo="Calendário dos hábitos (16 semanas)">
        <MapaDeCalor
          colunas={mapaDeHabitos(dados.habitos, dados.checks, hoje, 16)}
          hoje={hoje}
          desde={dados.habitos.reduce((min, h) => (h.inicio < min ? h.inicio : min), hoje)}
        />
      </Cartao>

      <Revisoes dados={dados} />
    </div>
  )
}

function Periodo({ dados, hoje, periodo, areasAtivas }: { dados: DadosCompletos; hoje: DiaISO; periodo: Periodo; areasAtivas: AreaId[] }) {
  const dias: DiaISO[] =
    periodo === 'semana' ? diasDaSemana(hoje) : Array.from({ length: 30 }, (_, i) => somarDias(hoje, i - 29))
  const conjunto = new Set(dias)
  const checks = dados.checks.filter((c) => conjunto.has(c.dia))
  const votosPorDia = dias.map((d) => checks.filter((c) => c.dia === d).length)
  const rotulos =
    periodo === 'semana' ? ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] : dias.map((d) => format(paraData(d), 'dd/MM'))

  const porArea = areasAtivas
    .map((a) => ({ a, votos: checks.filter((c) => c.areaId === a).length }))
    .filter((x) => x.votos > 0)
    .sort((x, y) => y.votos - x.votos)

  const treinos = dados.treinos.filter((t) => t.concluidoEm !== undefined && conjunto.has(t.dia)).length
  const minutos = dados.sessoes.filter((s) => conjunto.has(s.dia)).reduce((s, x) => s + x.minutos, 0)
  const paginas = dados.leituras.filter((l) => conjunto.has(l.dia)).reduce((s, x) => s + x.paginas, 0)
  const tentativas = dados.tentativas.filter((t) => conjunto.has(t.dia)).length
  const lazer = dados.lazerRegistros.filter((r) => conjunto.has(r.dia)).reduce((s, x) => s + x.minutos, 0)
  const promessas = contarPromessas(dados, dias).total
  const numeros: [AreaId | null, string, string][] = (
    [
      ['corpo', String(treinos), treinos === 1 ? 'treino' : 'treinos'],
      ['estudo', formatarMinutos(minutos), 'de estudo'],
      ['leitura', String(paginas), paginas === 1 ? 'página' : 'páginas'],
      ['comunicacao', String(tentativas), tentativas === 1 ? 'conversa desafiada' : 'conversas desafiadas'],
      ['lazer', formatarMinutos(lazer), 'de lazer'],
      ['mente', String(promessas), promessas === 1 ? 'promessa cumprida' : 'promessas cumpridas'],
    ] as [AreaId, string, string][]
  ).filter(([a]) => areasAtivas.includes(a))

  const humores = dias
    .map((d) => ({ d, h: dados.dias.find((x) => x.id === d)?.humor }))
    .filter((x): x is { d: DiaISO; h: number } => x.h !== undefined)

  return (
    <>
      <Cartao titulo="Votos por dia">
        {checks.length === 0 ? (
          <p className="text-sm text-tinta-suave">Nenhum voto neste período ainda. O primeiro aparece aqui.</p>
        ) : (
          <ColunasPeriodo
            valores={votosPorDia}
            rotulos={rotulos}
            formatar={(v) => `${v} ${v === 1 ? 'voto' : 'votos'}`}
            descricao="Votos por dia"
            mostrarRotulo={periodo === 'semana' ? undefined : (i) => (dias.length - 1 - i) % 7 === 0}
          />
        )}
      </Cartao>

      <Cartao titulo="Por área">
        {porArea.length > 0 && (
          <div className="mb-4">
            <BarrasHorizontais
              descricao="Votos por área no período"
              itens={porArea.map(({ a, votos }) => ({ chave: a, rotulo: INFO_AREAS[a].nome, valor: votos, texto: `${votos} ${votos === 1 ? 'voto' : 'votos'}` }))}
            />
          </div>
        )}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-linha pt-3">
          {numeros.map(([a, valor, rotulo]) => (
            <li key={rotulo} className="flex items-start gap-2">
              {a && (
                <span className="mt-1.5">
                  <PontoArea area={a} />
                </span>
              )}
              <span>
                <span className="block font-display text-xl leading-tight font-medium tabular-nums">{valor}</span>{' '}
                <span className="block text-xs text-tinta-suave">{rotulo}</span>
              </span>
            </li>
          ))}
        </ul>
      </Cartao>

      {humores.length >= 2 && (
        <Cartao titulo="Humor de cada dia (1 a 5)">
          <Suspense fallback={<div className="h-52" />}>
            <GraficoLinha
              dados={humores.map((x) => ({ rotulo: format(paraData(x.d), 'dd/MM'), valor: x.h }))}
              unidade="de 5"
              descricao="Humor de cada dia no período"
              marcasFixas={[1, 2, 3, 4, 5]}
            />
          </Suspense>
        </Cartao>
      )}
    </>
  )
}

function Revisoes({ dados }: { dados: DadosCompletos }) {
  const feitas = dados.semanas.filter((s) => s.revisao?.feitaEm).sort((a, b) => b.id.localeCompare(a.id))
  if (feitas.length === 0) return null
  return (
    <Cartao titulo="Revisões anteriores">
      <ul>
        {feitas.slice(0, 12).map((s) => (
          <li key={s.id} className="border-t border-linha first:border-t-0">
            <Link to={`/revisao/${s.id}`} className="flex min-h-14 items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block text-[15px]">Semana {numeroDaSemana(s.id)}</span>
                {s.revisao?.funcionou && <span className="block truncate text-xs text-tinta-suave">Funcionou: {s.revisao.funcionou}</span>}
                {s.revisao?.naoFuncionou && (
                  <span className="block truncate text-xs text-tinta-suave">Não funcionou: {s.revisao.naoFuncionou}</span>
                )}
              </span>
              <ChevronRight className="size-4 shrink-0 text-tinta-suave" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </Cartao>
  )
}
