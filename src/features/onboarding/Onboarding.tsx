import { ArrowLeft, Check, Feather, Link2, Plus, ShieldCheck, Vote, X, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Botao } from '../../components/Botao'
import { CamposHabito, problemaNoHabito } from '../../components/CamposHabito'
import { CLASSE_CAMPO } from '../../components/estilos'
import { IconeArea } from '../../components/IconeArea'
import { ListaCurta } from '../../components/ListaCurta'
import { concluirOnboarding, type DadosHabito } from '../../db/acoes'
import type { AreaId, ItemLista } from '../../db/tipos'
import { SUGESTOES, type SugestaoHabito } from '../../data/sugestoes'
import { INFO_AREAS, ORDEM_AREAS } from '../../lib/areas'
import { descreverDias, diaLogico } from '../../lib/datas'
import { novoId } from '../../lib/id'

/** Um hábito ainda sendo montado no onboarding. */
type Rascunho = DadosHabito & { chave: string; sugestao?: string }

const TOTAL_PASSOS = 5
const MAX_POR_AREA = 2

function rascunho(areaId: AreaId, s?: SugestaoHabito): Rascunho {
  return {
    chave: novoId(),
    areaId,
    sugestao: s?.nome,
    nome: s?.nome ?? '',
    versaoMinima: s?.versaoMinima ?? '',
    dias: s ? [...s.dias] : [0, 1, 2, 3, 4, 5, 6],
  }
}

export function Onboarding() {
  const [passo, setPasso] = useState(0)
  // Já vem com as 4 áreas que você disse que quer melhorar agora.
  const [escolhidas, setEscolhidas] = useState<AreaId[]>(['corpo', 'estudo', 'leitura', 'comunicacao'])
  const [frases, setFrases] = useState(
    () => Object.fromEntries(ORDEM_AREAS.map((a) => [a, SUGESTOES[a].frases[0]])) as Record<AreaId, string>,
  )
  const [habitos, setHabitos] = useState<Rascunho[]>([])
  const [metas, setMetas] = useState<ItemLista[]>([])
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const tituloRef = useRef<HTMLHeadingElement>(null)

  // A cada passo: volta para o topo e leva o foco para o título (ajuda quem usa leitor de tela).
  useEffect(() => {
    window.scrollTo(0, 0)
    tituloRef.current?.focus({ preventScroll: true })
  }, [passo])

  const areas = ORDEM_AREAS.filter((a) => escolhidas.includes(a))
  const habitosValidos = habitos.filter((h) => escolhidas.includes(h.areaId))

  function validar(): string {
    if (passo === 1 && escolhidas.length === 0) return 'Escolha pelo menos uma área.'
    if (passo === 2 && areas.some((a) => !frases[a].trim())) return 'Escreva uma frase para cada área.'
    if (passo === 3) {
      if (habitosValidos.length === 0) return 'Escolha pelo menos um hábito.'
      for (const h of habitosValidos) {
        const problema = problemaNoHabito(h)
        if (problema) return `${h.nome.trim() || 'Um hábito'}: ${problema}`
      }
    }
    return ''
  }

  function avancar() {
    const problema = validar()
    setErro(problema)
    if (problema) return
    // Ao chegar nos hábitos pela primeira vez, já deixa uma sugestão marcada por área.
    if (passo === 2 && habitos.length === 0) {
      setHabitos(areas.map((a) => rascunho(a, SUGESTOES[a].habitos[0])))
    }
    if (passo < TOTAL_PASSOS - 1) setPasso(passo + 1)
    else void concluir()
  }

  function voltar() {
    setErro('')
    setPasso((p) => Math.max(0, p - 1))
  }

  async function concluir() {
    setSalvando(true)
    try {
      // Pede ao navegador para não apagar os dados do app quando faltar espaço.
      await navigator.storage?.persist?.()
    } catch {
      // Se o navegador não deixar, segue normalmente.
    }
    await concluirOnboarding(
      {
        areas: ORDEM_AREAS.map((id) => ({
          id,
          ativa: escolhidas.includes(id),
          frase: frases[id].trim() || SUGESTOES[id].frases[0],
        })),
        habitos: habitosValidos.map((h) => ({
          areaId: h.areaId,
          nome: h.nome.trim(),
          versaoMinima: h.versaoMinima.trim(),
          dias: h.dias,
        })),
        metas: metas.map((m) => m.texto),
      },
      diaLogico(),
    )
    // Não precisa navegar: o App percebe que o onboarding terminou e abre a tela Hoje.
  }

  const rotuloBotao = passo === 0 ? 'Começar' : passo === TOTAL_PASSOS - 1 ? 'Começar a semana' : 'Continuar'

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
      {passo > 0 && (
        <div className="mb-8">
          <p className="sr-only">
            Passo {passo + 1} de {TOTAL_PASSOS}
          </p>
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: TOTAL_PASSOS }, (_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= passo ? 'bg-destaque' : 'bg-cartao-2'}`}
              />
            ))}
          </div>
        </div>
      )}

      <div key={passo} className="entra flex-1 pb-6">
        {passo === 0 && <BoasVindas tituloRef={tituloRef} />}
        {passo === 1 && (
          <PassoAreas
            tituloRef={tituloRef}
            escolhidas={escolhidas}
            onMudar={(lista) => {
              setEscolhidas(lista)
              setErro('')
            }}
          />
        )}
        {passo === 2 && (
          <Passo tituloRef={tituloRef} titulo="Quem você quer ser?" texto="Uma frase por área. Cada hábito marcado vira um voto nela.">
            {areas.map((a) => (
              <div key={a} className="mt-6">
                <label htmlFor={`frase-${a}`} className="flex items-center gap-2 text-xs font-medium text-tinta-suave">
                  <IconeArea area={a} className="size-4" />
                  {INFO_AREAS[a].nome}
                </label>
                <input
                  id={`frase-${a}`}
                  value={frases[a]}
                  onChange={(e) => setFrases({ ...frases, [a]: e.target.value })}
                  maxLength={60}
                  className={`${CLASSE_CAMPO} mt-2 font-display text-lg tracking-tight`}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SUGESTOES[a].frases
                    .filter((f) => f !== frases[a])
                    .map((f) => (
                      <Chip key={f} onClick={() => setFrases({ ...frases, [a]: f })}>
                        {f}
                      </Chip>
                    ))}
                </div>
              </div>
            ))}
          </Passo>
        )}
        {passo === 3 && (
          <PassoHabitos
            tituloRef={tituloRef}
            areas={areas}
            habitos={habitos}
            onMudar={(lista) => {
              setHabitos(lista)
              setErro('')
            }}
          />
        )}
        {passo === 4 && (
          <Passo
            tituloRef={tituloRef}
            titulo="Foco da primeira semana"
            texto="Até 3 metas para esta semana. No domingo você revisa e escolhe as próximas."
          >
            <div className="mt-6">
              <ListaCurta
                itens={metas}
                onMudar={setMetas}
                placeholder="Uma meta para esta semana"
                rotuloCampo="Nova meta da semana"
                mensagemLimite="Três metas. Agora é foco."
                sugestoes={[0, 1, 2].flatMap((i) => areas.map((a) => SUGESTOES[a].metas[i]).filter(Boolean))}
                maxSugestoes={6}
              />
            </div>
            <div className="mt-8 flex gap-3 rounded-2xl border border-linha bg-cartao p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-tinta-suave" aria-hidden="true" />
              <p className="text-sm text-tinta-suave">
                Seus dados ficam só neste aparelho. Em Ajustes você salva um backup quando quiser.
              </p>
            </div>
          </Passo>
        )}
      </div>

      <div className="sticky bottom-0 bg-fundo pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {erro && (
          <p role="alert" className="mb-2 text-sm text-perigo">
            {erro}
          </p>
        )}
        <div className="flex gap-2">
          {passo > 0 && (
            <Botao aria-label="Voltar" onClick={voltar} className="px-3.5">
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Botao>
          )}
          <Botao variante="primario" className="flex-1 text-[15px]" onClick={avancar} disabled={salvando}>
            {rotuloBotao}
          </Botao>
        </div>
      </div>
    </div>
  )
}

type RefTitulo = RefObject<HTMLHeadingElement | null>

function Passo({ tituloRef, titulo, texto, children }: { tituloRef: RefTitulo; titulo: string; texto: string; children: ReactNode }) {
  return (
    <>
      <h1 ref={tituloRef} tabIndex={-1} className="font-display text-[1.9rem] leading-[1.08] font-medium tracking-[-0.02em] outline-none">
        {titulo}
      </h1>
      <p className="mt-2 text-[15px] text-tinta-suave">{texto}</p>
      {children}
    </>
  )
}

function Chip({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-9 rounded-lg border border-linha px-2.5 text-left text-xs text-tinta-suave transition-colors duration-150 hover:text-tinta active:scale-[0.97]"
    >
      {children}
    </button>
  )
}

const PRINCIPIOS: { Icone: LucideIcon; titulo: string; texto: string }[] = [
  { Icone: Vote, titulo: 'Cada check é um voto', texto: 'Todo hábito marcado é um voto em quem você quer ser.' },
  { Icone: Feather, titulo: 'Dia ruim? Versão mínima', texto: 'Todo hábito tem uma versão pequena. Fazer ela também conta.' },
  { Icone: Link2, titulo: 'Nunca falhar duas vezes', texto: 'Falhar um dia é normal. O que importa é voltar no dia seguinte.' },
]

function BoasVindas({ tituloRef }: { tituloRef: RefTitulo }) {
  return (
    <div className="pt-6">
      <img src="/logo.svg" alt="" width={56} height={56} className="size-14 rounded-2xl" />
      <h1 ref={tituloRef} tabIndex={-1} className="mt-8 font-display text-[2.75rem] leading-none font-medium tracking-[-0.03em] outline-none">
        Evolui
      </h1>
      <p className="mt-3 text-lg text-tinta-suave">Seu crescimento, um dia de cada vez.</p>
      <ul className="mt-12 flex flex-col gap-7">
        {PRINCIPIOS.map(({ Icone, titulo, texto }) => (
          <li key={titulo} className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cartao-2 text-destaque-texto">
              <Icone className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium">{titulo}</p>
              <p className="mt-0.5 text-sm text-tinta-suave">{texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PassoAreas({ tituloRef, escolhidas, onMudar }: { tituloRef: RefTitulo; escolhidas: AreaId[]; onMudar: (a: AreaId[]) => void }) {
  const n = escolhidas.length
  const mensagem =
    n === 0
      ? 'Nenhuma área escolhida ainda.'
      : n > 4
        ? `${n} áreas. Muita coisa ao mesmo tempo costuma fazer a gente largar tudo. Que tal começar com menos?`
        : `${n} ${n === 1 ? 'área escolhida' : 'áreas escolhidas'}.`

  return (
    <Passo tituloRef={tituloRef} titulo="Onde você quer crescer agora?" texto="Comece com 3 ou 4. Dá para ligar as outras depois, em Ajustes.">
      <ul className="mt-6 flex flex-col gap-2">
        {ORDEM_AREAS.map((a) => {
          const ativa = escolhidas.includes(a)
          return (
            <li key={a}>
              <button
                type="button"
                aria-pressed={ativa}
                onClick={() => onMudar(ativa ? escolhidas.filter((x) => x !== a) : [...escolhidas, a])}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-[transform,background-color,border-color] duration-150 ease-saida active:scale-[0.985] ${
                  ativa ? 'border-linha-forte bg-cartao' : 'border-linha'
                }`}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cartao-2">
                  <IconeArea area={a} className="size-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-medium">{INFO_AREAS[a].nome}</span>
                  <span className="block text-xs text-tinta-suave">{INFO_AREAS[a].descricao}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-150 ${
                    ativa ? 'border-destaque bg-destaque text-destaque-tinta' : 'border-linha-forte'
                  }`}
                >
                  {ativa && <Check className="size-4" strokeWidth={2.5} />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p aria-live="polite" className="mt-4 text-sm text-tinta-suave">
        {mensagem}
      </p>
    </Passo>
  )
}

function PassoHabitos({
  tituloRef,
  areas,
  habitos,
  onMudar,
}: {
  tituloRef: RefTitulo
  areas: AreaId[]
  habitos: Rascunho[]
  onMudar: (h: Rascunho[]) => void
}) {
  return (
    <Passo tituloRef={tituloRef} titulo="Seus primeiros hábitos" texto="Até 2 por área. A versão mínima é para os dias ruins, e ela também conta.">
      {areas.map((a) => {
        const daArea = habitos.filter((h) => h.areaId === a)
        const cheia = daArea.length >= MAX_POR_AREA
        const livres = SUGESTOES[a].habitos.filter((s) => !daArea.some((h) => h.sugestao === s.nome))
        return (
          <section key={a} className="mt-8">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <IconeArea area={a} className="size-4" />
              {INFO_AREAS[a].nome}
              <span className="ml-auto text-xs font-normal text-tinta-suave tabular-nums">
                {daArea.length} de {MAX_POR_AREA}
              </span>
            </h2>

            {daArea.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {daArea.map((h) => (
                  <li key={h.chave} className="entra relative rounded-2xl border border-linha bg-cartao p-3 pt-2">
                    <button
                      type="button"
                      aria-label={`Remover ${h.nome || 'hábito'}`}
                      onClick={() => onMudar(habitos.filter((x) => x.chave !== h.chave))}
                      className="absolute top-0 right-0 grid size-11 place-items-center text-tinta-suave hover:text-tinta"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                    <CamposHabito
                      valores={h}
                      onMudar={(v) => onMudar(habitos.map((x) => (x.chave === h.chave ? { ...x, ...v } : x)))}
                    />
                  </li>
                ))}
              </ul>
            )}

            {cheia ? (
              <p className="mt-2 text-xs text-tinta-suave">Dois por área é o bastante para começar.</p>
            ) : (
              <div className="mt-2 flex flex-col gap-1.5">
                {livres.map((s) => (
                  <button
                    key={s.nome}
                    type="button"
                    onClick={() => onMudar([...habitos, rascunho(a, s)])}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-linha-forte p-3 text-left transition-transform duration-150 ease-saida active:scale-[0.985]"
                  >
                    <Plus className="size-4 shrink-0 text-tinta-suave" aria-hidden="true" />
                    <span className="flex-1">
                      <span className="block text-sm">{s.nome}</span>
                      <span className="block text-xs text-tinta-suave">
                        {descreverDias(s.dias)} · mínimo: {s.versaoMinima}
                      </span>
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onMudar([...habitos, rascunho(a)])}
                  className="min-h-11 rounded-xl px-3 text-left text-sm text-tinta-suave hover:text-tinta"
                >
                  + Criar o meu
                </button>
              </div>
            )}
          </section>
        )
      })}
    </Passo>
  )
}
