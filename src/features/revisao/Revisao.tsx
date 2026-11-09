import { X } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Botao } from '../../components/Botao'
import { CLASSE_CAMPO } from '../../components/estilos'
import { PontoArea } from '../../components/IconeArea'
import { ListaCurta } from '../../components/ListaCurta'
import { salvarMetas } from '../../db/acoes'
import { concluirRevisao, definirFoco, salvarRespostaRevisao } from '../../db/acoesFase4'
import { useAgora, useAreas } from '../../db/hooks'
import { useDadosCompletos } from '../../db/hooksAgregados'
import type { AreaId, Config, ItemLista } from '../../db/tipos'
import { SUGESTOES } from '../../data/sugestoes'
import { INFO_AREAS, ORDEM_AREAS } from '../../lib/areas'
import {
  diaLogico,
  diaPorExtenso,
  intervaloDaSemana,
  numeroDaSemana,
  segundaDaSemana,
  semanaISO,
  somarDias,
} from '../../lib/datas'
import { formatarMinutos } from '../../lib/formatar'
import { humorMedio, resumoDaSemana, type ResumoSemana } from '../../lib/revisao'

const NOMES_DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']

/**
 * "Sua semana": a revisão de domingo, contada como uma história que você rola.
 * Curva de sentimentos: calma, orgulho (o pico: a semana se acende), confiança, equilíbrio,
 * intimidade, reflexão e, no fim, decisão.
 */
export function Revisao({ config }: { config: Config }) {
  const { semana: semanaParam } = useParams()
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const semanaId = semanaParam && /^\d{4}-W\d{2}$/.test(semanaParam) ? semanaParam : semanaISO(hoje)
  const dados = useDadosCompletos()
  const areas = useAreas()
  const navegar = useNavigate()
  const [fechando, setFechando] = useState(false)

  if (!dados || !areas) return null

  const segunda = segundaDaSemana(semanaId)
  const proximaId = semanaISO(somarDias(segunda, 7))
  const resumo = resumoDaSemana(segunda, hoje, dados)
  const semana = dados.semanas.find((s) => s.id === semanaId)
  const proxima = dados.semanas.find((s) => s.id === proximaId)
  const fechada = !!semana?.revisao?.feitaEm
  const numeroProxima = numeroDaSemana(proximaId)

  // Sugestões de metas: as que ficaram por fazer nesta semana e uma de cada área ativa.
  const pendentes = (semana?.metas ?? []).filter((m) => !m.feita).map((m) => m.texto)
  const sugestoesMetas = [...pendentes, ...areas.filter((a) => a.ativa).map((a) => SUGESTOES[a.id].metas[0])]

  return (
    <div className="mx-auto w-full max-w-md px-5">
      <Link
        to="/"
        aria-label="Sair da revisão"
        className="fixed top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-20 grid size-11 place-items-center rounded-full bg-cartao/80 text-tinta-suave hover:text-tinta"
      >
        <X className="size-5" aria-hidden="true" />
      </Link>

      {/* 1. Calma: só texto, nada se mexe. */}
      <section className="flex min-h-[88dvh] flex-col justify-end pb-16">
        <p className="text-sm text-tinta-suave">
          Semana {numeroDaSemana(semanaId)} · {intervaloDaSemana(semanaId)}
        </p>
        <h1 className="mt-3 font-display text-[2.9rem] leading-[1.02] font-medium tracking-[-0.03em]">
          Vamos olhar para a sua semana.
        </h1>
        <p className="mt-4 text-[15px] text-tinta-suave">Leva uns três minutos. Sem nota, sem bronca.</p>
      </section>

      <Pico resumo={resumo} hoje={hoje} />
      <Numeros resumo={resumo} />
      {resumo.lazer && resumo.lazer.orcamento > 0 && <Equilibrio lazer={resumo.lazer} />}
      {resumo.humorPorDia.some((h) => h !== undefined) && <Humor valores={resumo.humorPorDia} />}

      {/* 6. Reflexão */}
      <section className="py-20">
        <h2 className="rv-revela font-display text-[2rem] leading-tight font-medium tracking-tight">Agora, com calma.</h2>
        <div className="mt-8 flex flex-col gap-6">
          <Pergunta
            rotulo="O que funcionou?"
            dica="O que deu certo e vale repetir"
            inicial={semana?.revisao?.funcionou ?? ''}
            onSalvar={(t) => void salvarRespostaRevisao(semanaId, 'funcionou', t)}
            longa
          />
          <Pergunta
            rotulo="O que não funcionou?"
            dica="Sem culpa: o que atrapalhou e o que dá para mudar"
            inicial={semana?.revisao?.naoFuncionou ?? ''}
            onSalvar={(t) => void salvarRespostaRevisao(semanaId, 'naoFuncionou', t)}
            longa
          />
          <Pergunta
            rotulo={`Qual o foco da semana ${numeroProxima}?`}
            dica="Uma frase só, como: não pular treino"
            inicial={proxima?.foco ?? ''}
            onSalvar={(t) => void definirFoco(proximaId, t)}
          />
        </div>
      </section>

      {/* 7. Decisão e fechamento: termina parado, com algo na tela. */}
      {fechada ? (
        <Fechamento
          numero={numeroProxima}
          foco={proxima?.foco}
          metas={proxima?.metas ?? []}
          rolar={fechando}
          onHoje={() => void navegar('/')}
        />
      ) : (
        <section className="pt-10 pb-[max(4rem,env(safe-area-inset-bottom))]">
          <h2 className="rv-revela font-display text-[2rem] leading-tight font-medium tracking-tight">
            3 metas para a semana {numeroProxima}
          </h2>
          <p className="mt-2 text-[15px] text-tinta-suave">Poucas e claras. Elas aparecem na tela Hoje a semana toda.</p>
          <div className="mt-6">
            <ListaCurta
              itens={proxima?.metas ?? []}
              onMudar={(metas) => void salvarMetas(proximaId, metas)}
              placeholder="Uma meta para a próxima semana"
              rotuloCampo="Nova meta da próxima semana"
              mensagemLimite="Três metas. Pronto para fechar a semana."
              sugestoes={sugestoesMetas}
              maxSugestoes={4}
            />
          </div>
          <Botao
            variante="primario"
            className="mt-8 w-full text-[15px]"
            disabled={fechando}
            onClick={async () => {
              setFechando(true)
              await concluirRevisao(semanaId)
            }}
          >
            Fechar a semana
          </Botao>
        </section>
      )}
    </div>
  )
}

/** 2. O pico: um trecho alto da página; enquanto ele passa, cada dia se acende. */
function Pico({ resumo, hoje }: { resumo: ResumoSemana; hoje: string }) {
  const max = Math.max(...resumo.votosPorDia, 1)
  const areasComVoto = ORDEM_AREAS.filter((a) => resumo.votosPorArea[a] > 0).sort(
    (a, b) => resumo.votosPorArea[b] - resumo.votosPorArea[a],
  )

  return (
    <section className="rv-palco relative h-[260dvh]" aria-label="Votos de cada dia da semana">
      <div className="sticky top-0 flex h-dvh flex-col justify-center">
        <h2 className="text-center font-display text-[2rem] leading-tight font-medium tracking-tight">Cada dia, um voto</h2>
        <div className="mt-10 grid h-52 grid-cols-7 items-end gap-2.5 border-b border-linha-forte" aria-hidden="true">
          {resumo.votosPorDia.map((v, i) => {
            const futuro = resumo.dias[i] > hoje
            return (
              <div key={i} className="flex h-full flex-col justify-end">
                <div
                  className="rv-dia mx-auto w-full max-w-6 rounded-t-[4px] bg-grafico"
                  style={
                    {
                      height: `${(v / max) * 100}%`,
                      minHeight: v > 0 ? 6 : 0,
                      opacity: futuro ? 0.3 : undefined,
                      '--rv-ini': `${4 + i * 10}%`,
                      '--rv-fim': `${12 + i * 10}%`,
                    } as CSSProperties
                  }
                />
              </div>
            )
          })}
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-2.5 text-center text-[11px] text-tinta-suave" aria-hidden="true">
          {NOMES_DIAS.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
        <p className="sr-only">
          {resumo.votosPorDia.map((v, i) => `${NOMES_DIAS[i]}: ${v}`).join(', ')}
        </p>

        <div className="rv-fim-palco mt-10 text-center">
          <p className="font-display text-6xl leading-none font-medium tracking-tight tabular-nums">{resumo.totalVotos}</p>
          <p className="mt-2 text-[15px] text-tinta-suave">
            {resumo.totalVotos === 1 ? 'voto' : 'votos'} em quem você quer ser
          </p>
          {areasComVoto.length > 0 && (
            <p className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
              {areasComVoto.map((a: AreaId) => (
                <span key={a} className="flex items-center gap-1.5">
                  <PontoArea area={a} /> {INFO_AREAS[a].nome} <span className="text-tinta-suave tabular-nums">{resumo.votosPorArea[a]}</span>
                </span>
              ))}
            </p>
          )}
          {resumo.melhorDia && (
            <p className="mt-4 text-sm text-tinta-suave">
              Seu dia mais forte: {diaPorExtenso(resumo.melhorDia.dia).split(',')[0]}, com {resumo.melhorDia.votos}{' '}
              {resumo.melhorDia.votos === 1 ? 'voto' : 'votos'}.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

/** 3. Confiança: os números reais. Linha com zero não aparece (sem culpa). */
function Numeros({ resumo }: { resumo: ResumoSemana }) {
  const linhas: [ReactNode, string][] = []
  if (resumo.habitos.fracao !== null) {
    linhas.push([
      `${Math.round(resumo.habitos.fracao * 100)}%`,
      `dos hábitos cumpridos (${resumo.habitos.feitos} de ${resumo.habitos.agendados})`,
    ])
  }
  if (resumo.treinos > 0) linhas.push([resumo.treinos, resumo.treinos === 1 ? 'treino' : 'treinos'])
  if (resumo.minutosEstudo > 0) linhas.push([formatarMinutos(resumo.minutosEstudo), 'de estudo'])
  if (resumo.paginas > 0) linhas.push([resumo.paginas, resumo.paginas === 1 ? 'página lida' : 'páginas lidas'])
  if (resumo.tentativas > 0) linhas.push([resumo.tentativas, resumo.tentativas === 1 ? 'conversa desafiada' : 'conversas desafiadas'])
  if (resumo.promessas > 0) linhas.push([resumo.promessas, 'promessas cumpridas com você mesmo'])

  return (
    <section className="py-24">
      <h2 className="rv-revela font-display text-[2rem] leading-tight font-medium tracking-tight">A semana em números</h2>
      {linhas.length === 0 ? (
        <p className="rv-revela mt-6 text-[15px] text-tinta-suave">Semana tranquila. Toda semana conta como recomeço.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-7">
          {linhas.map(([valor, rotulo], i) => (
            <li key={i} className="rv-revela">
              <span className="block font-display text-5xl leading-none font-medium tracking-tight tabular-nums">{valor}</span>{' '}
              <span className="mt-1 block text-[15px] text-tinta-suave">{rotulo}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** 4. Equilíbrio: o lazer, alinhado à direita para a página mudar de ritmo. */
function Equilibrio({ lazer }: { lazer: NonNullable<ResumoSemana['lazer']> }) {
  const fracao = Math.min(1, lazer.usado / lazer.orcamento)
  return (
    <section className="py-20 text-right">
      <h2 className="rv-revela font-display text-[2rem] leading-tight font-medium tracking-tight">Lazer escolhido</h2>
      <p className="rv-revela mt-3 text-[15px] text-tinta-suave tabular-nums">
        {formatarMinutos(lazer.usado)} de {formatarMinutos(lazer.orcamento)} do orçamento
      </p>
      <div className="mt-5 h-3 rounded-r-[4px] bg-cartao-2" aria-hidden="true">
        <div className="rv-barra h-full rounded-r-[4px] bg-grafico" style={{ width: `${fracao * 100}%` }} />
      </div>
      {lazer.escolhido !== null && (
        <p className="rv-revela mt-5 text-[15px]">
          <span className="font-display text-3xl font-medium tabular-nums">{Math.round(lazer.escolhido * 100)}%</span>{' '}
          <span className="block text-tinta-suave">foi escolha sua, e não piloto automático</span>
        </p>
      )}
    </section>
  )
}

/** 5. Intimidade: a linha do humor se desenha enquanto você rola. */
function Humor({ valores }: { valores: (number | undefined)[] }) {
  const L = 320
  const A = 140
  const x = (i: number) => 12 + (i * (L - 24)) / 6
  const y = (v: number) => A - 12 - ((v - 1) * (A - 24)) / 4
  const pontos = valores.map((v, i) => (v === undefined ? null : { x: x(i), y: y(v), v }))
  const caminho = pontos
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')
  const media = humorMedio(valores)

  return (
    <section className="py-20">
      <h2 className="rv-revela font-display text-[2rem] leading-tight font-medium tracking-tight">Como você se sentiu</h2>
      <p className="rv-revela mt-2 text-[15px] text-tinta-suave">
        Humor de cada dia, de 1 a 5{media !== null ? `. Média: ${String(media).replace('.', ',')}` : ''}.
      </p>
      <svg viewBox={`0 0 ${L} ${A + 18}`} className="mt-6 w-full" role="img" aria-label={`Humor por dia: ${valores.map((v, i) => `${NOMES_DIAS[i]} ${v ?? 'sem registro'}`).join(', ')}`}>
        {[1, 3, 5].map((v) => (
          <line key={v} x1="0" x2={L} y1={y(v)} y2={y(v)} stroke="var(--linha)" strokeWidth="1" />
        ))}
        <path d={caminho} pathLength={1} className="rv-linha" fill="none" stroke="var(--grafico)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pontos.map((p, i) =>
          p ? <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--grafico)" stroke="var(--fundo)" strokeWidth="2" /> : null,
        )}
        {NOMES_DIAS.map((n, i) => (
          <text key={n} x={x(i)} y={A + 14} textAnchor="middle" fontSize="10" fill="var(--tinta-suave)">
            {n}
          </text>
        ))}
      </svg>
    </section>
  )
}

function Pergunta({
  rotulo,
  dica,
  inicial,
  onSalvar,
  longa = false,
}: {
  rotulo: string
  dica: string
  inicial: string
  onSalvar: (t: string) => void
  longa?: boolean
}) {
  const [texto, setTexto] = useState(inicial)
  const espera = useRef<number | undefined>(undefined)
  const mudar = (t: string) => {
    setTexto(t)
    window.clearTimeout(espera.current)
    espera.current = window.setTimeout(() => onSalvar(t), 600)
  }
  const sair = () => {
    window.clearTimeout(espera.current)
    onSalvar(texto)
  }
  return (
    <label className="rv-revela block">
      <span className="mb-2 block text-[15px] font-medium">{rotulo}</span>
      {longa ? (
        <textarea value={texto} onChange={(e) => mudar(e.target.value)} onBlur={sair} rows={3} maxLength={1000} placeholder={dica} className={`${CLASSE_CAMPO} py-2.5`} />
      ) : (
        <input value={texto} onChange={(e) => mudar(e.target.value)} onBlur={sair} maxLength={140} placeholder={dica} className={CLASSE_CAMPO} />
      )}
    </label>
  )
}

/** O fim que resolve e fica parado: a próxima semana já desenhada. */
function Fechamento({
  numero,
  foco,
  metas,
  rolar,
  onHoje,
}: {
  numero: number
  foco?: string
  metas: ItemLista[]
  rolar: boolean
  onHoje: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  // Logo depois de fechar a semana, leva a tela até este final.
  useEffect(() => {
    if (rolar) ref.current?.scrollIntoView({ block: 'start' })
  }, [rolar])
  return (
    <section ref={ref} className="flex min-h-dvh flex-col justify-center pb-[max(3rem,env(safe-area-inset-bottom))]">
      <p className="entra text-sm text-tinta-suave">Semana fechada.</p>
      <h2 className="entra mt-3 font-display text-[2.6rem] leading-[1.04] font-medium tracking-[-0.03em]">
        A semana {numero} começa assim.
      </h2>
      {foco && <p className="entra mt-6 font-display text-2xl leading-snug tracking-tight text-destaque-texto">{foco}</p>}
      {metas.length > 0 && (
        <ol className="entra mt-6 flex flex-col gap-3">
          {metas.map((m, i) => (
            <li key={m.id} className="flex gap-3 text-[17px]">
              <span className="font-display text-tinta-suave tabular-nums">{i + 1}</span>
              {m.texto}
            </li>
          ))}
        </ol>
      )}
      <Botao variante="primario" className="entra mt-10 w-full text-[15px]" onClick={onHoje}>
        Ir para Hoje
      </Botao>
    </section>
  )
}
