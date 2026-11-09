import { Bookmark, BookmarkCheck, RefreshCw, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Abas } from '../../components/Abas'
import { Botao } from '../../components/Botao'
import { CabecalhoArea } from '../../components/CabecalhoArea'
import { Cartao } from '../../components/Cartao'
import { CLASSE_CAMPO } from '../../components/estilos'
import { IconeArea } from '../../components/IconeArea'
import { adicionarEvidencia, apagarEvidencia, salvarDiario } from '../../db/acoesFase3'
import {
  useAgora,
  useAreas,
  useChecks,
  useDia,
  useEvidencias,
  useTentativas,
  useTodasSemanas,
  useTodosDias,
} from '../../db/hooks'
import type { AreaId, Config, Dia, DiaISO, Evidencia } from '../../db/tipos'
import { INFO_AREAS } from '../../lib/areas'
import { diaCurto, diaLogico, diasDaSemana } from '../../lib/datas'
import { contarPromessas } from '../../lib/fase3'
import { Vitorias } from '../hoje/Vitorias'

type Aba = 'diario' | 'evidencias'

const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: 'diario', rotulo: 'Diário' },
  { valor: 'evidencias', rotulo: 'Evidências' },
]

/** Área Mente: diário curto, banco de evidências e promessas cumpridas com você mesmo. */
export function Mente({ config }: { config: Config }) {
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const [aba, setAba] = useState<Aba>('diario')
  const checks = useChecks()
  const dias = useTodosDias()
  const semanas = useTodasSemanas()
  const tentativas = useTentativas()
  const evidencias = useEvidencias()
  const dia = useDia(hoje)

  if (!checks || !dias || !semanas || !tentativas || !evidencias || dia === undefined) return null

  const dados = { checks, dias, semanas, tentativas }
  const total = contarPromessas(dados)
  const daSemana = contarPromessas(dados, diasDaSemana(hoje))
  const partes: [number, string, string][] = [
    [total.votos, 'hábito marcado', 'hábitos marcados'],
    [total.prioridades, 'prioridade feita', 'prioridades feitas'],
    [total.metas, 'meta da semana', 'metas da semana'],
    [total.desafios, 'desafio tentado', 'desafios tentados'],
  ]

  const textosGuardados = new Set(evidencias.map((e) => e.texto))

  return (
    <div className="flex flex-col gap-4">
      <CabecalhoArea area="mente" />

      <Cartao titulo="Promessas cumpridas com você mesmo">
        <p className="font-display text-5xl leading-none font-medium tracking-tight tabular-nums">{total.total}</p>
        <p className="mt-2 text-sm text-tinta-suave">
          {total.total === 0 ? (
            'Cada hábito marcado, prioridade feita, meta cumprida e desafio tentado conta aqui.'
          ) : (
            <>
              <span className="font-medium text-destaque-texto tabular-nums">{daSemana.total}</span> esta semana ·{' '}
              {partes
                .filter(([n]) => n > 0)
                .map(([n, um, varios]) => `${n} ${n === 1 ? um : varios}`)
                .join(', ')}
            </>
          )}
        </p>
      </Cartao>

      <Abas abas={ABAS} atual={aba} onMudar={setAba} rotulo="Partes da área Mente" />

      {aba === 'diario' && (
        <>
          <Vitorias key={hoje} salvas={dia?.vitorias ?? []} hoje={hoje} />
          <Cartao titulo="Diário curto">
            <div className="flex flex-col gap-3">
              <CampoDiario
                key={`g-${hoje}`}
                rotulo="Sou grato por"
                dica="Uma coisa boa de hoje, mesmo pequena"
                inicial={dia?.gratidao ?? ''}
                onSalvar={(t) => void salvarDiario(hoje, 'gratidao', t)}
              />
              <CampoDiario
                key={`f-${hoje}`}
                rotulo="Uma coisa que fiz bem"
                dica="Algo que você fez e merece reconhecer"
                inicial={dia?.fizBem ?? ''}
                onSalvar={(t) => void salvarDiario(hoje, 'fizBem', t)}
              />
            </div>
          </Cartao>
          <DiasAnteriores dias={dias} hoje={hoje} guardados={textosGuardados} />
        </>
      )}

      {aba === 'evidencias' && <BancoDeEvidencias evidencias={evidencias} hoje={hoje} />}
    </div>
  )
}

function CampoDiario({ rotulo, dica, inicial, onSalvar }: { rotulo: string; dica: string; inicial: string; onSalvar: (t: string) => void }) {
  const [texto, setTexto] = useState(inicial)
  const espera = useRef<number | undefined>(undefined)
  return (
    <label>
      <span className="mb-1.5 block text-xs font-medium text-tinta-suave">{rotulo}</span>
      <input
        value={texto}
        onChange={(e) => {
          const t = e.target.value
          setTexto(t)
          window.clearTimeout(espera.current)
          espera.current = window.setTimeout(() => onSalvar(t), 500)
        }}
        onBlur={() => {
          window.clearTimeout(espera.current)
          onSalvar(texto)
        }}
        placeholder={dica}
        maxLength={160}
        className={CLASSE_CAMPO}
      />
    </label>
  )
}

/** Os últimos dias do diário. Uma vitória pode virar evidência com um toque. */
function DiasAnteriores({ dias, hoje, guardados }: { dias: Dia[]; hoje: DiaISO; guardados: Set<string> }) {
  const anteriores = dias
    .filter((d) => d.id < hoje && (d.vitorias.length > 0 || d.gratidao || d.fizBem))
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 7)
  if (anteriores.length === 0) return null

  return (
    <Cartao titulo="Dias anteriores">
      <ul className="flex flex-col">
        {anteriores.map((d) => (
          <li key={d.id} className="border-t border-linha py-3 first:border-t-0 first:pt-0 last:pb-0">
            <p className="text-xs text-tinta-suave">{diaCurto(d.id)}</p>
            <ul className="mt-1">
              {d.vitorias.map((v) => {
                const guardada = guardados.has(v)
                return (
                  <li key={v} className="flex items-center gap-2">
                    <span className="flex-1 text-[15px] leading-snug">{v}</span>
                    <button
                      type="button"
                      disabled={guardada}
                      onClick={() => void adicionarEvidencia(v, d.id)}
                      aria-label={guardada ? `“${v}” já está nas evidências` : `Guardar “${v}” nas evidências`}
                      className="grid size-11 shrink-0 place-items-center text-tinta-suave hover:text-tinta disabled:text-destaque-texto"
                    >
                      {guardada ? <BookmarkCheck className="size-4" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
                    </button>
                  </li>
                )
              })}
            </ul>
            {d.gratidao && <p className="mt-1 text-sm text-tinta-suave">Grato por: {d.gratidao}</p>}
            {d.fizBem && <p className="mt-0.5 text-sm text-tinta-suave">Fiz bem: {d.fizBem}</p>}
          </li>
        ))}
      </ul>
    </Cartao>
  )
}

function BancoDeEvidencias({ evidencias, hoje }: { evidencias: Evidencia[]; hoje: DiaISO }) {
  const areas = useAreas()
  const [texto, setTexto] = useState('')
  const [area, setArea] = useState<AreaId | undefined>()
  const [indice, setIndice] = useState(() => Math.floor(Math.random() * 1000))
  const ordenadas = [...evidencias].sort((a, b) => b.criadoEm - a.criadoEm)
  const sorteada = ordenadas.length > 0 ? ordenadas[indice % ordenadas.length] : undefined

  return (
    <div className="flex flex-col gap-3">
      {sorteada && (
        <Cartao titulo="Para reler num dia difícil">
          <p key={sorteada.id} className="troca-frase font-display text-[1.45rem] leading-snug font-medium tracking-tight">
            {sorteada.texto}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-tinta-suave">
            {sorteada.areaId && <IconeArea area={sorteada.areaId} className="size-3.5" />}
            {diaCurto(sorteada.dia)}
          </p>
          {ordenadas.length > 1 && (
            <Botao variante="fantasma" className="mt-2 -ml-3" onClick={() => setIndice((i) => i + 1 + Math.floor(Math.random() * (ordenadas.length - 1)))}>
              <RefreshCw className="size-4" aria-hidden="true" /> Outra
            </Botao>
          )}
        </Cartao>
      )}

      <Cartao titulo="Guardar uma conquista">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!texto.trim()) return
            void adicionarEvidencia(texto, hoje, area)
            setTexto('')
            setArea(undefined)
          }}
        >
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Terminei meu primeiro livro do ano. Apresentei o trabalho sem travar."
            aria-label="Conquista para guardar"
            className={`${CLASSE_CAMPO} py-2.5`}
          />
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Área da conquista (opcional)">
            {areas
              ?.filter((a) => a.ativa)
              .map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={area === a.id}
                  onClick={() => setArea(area === a.id ? undefined : a.id)}
                  className={`flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs transition-colors duration-150 ${
                    area === a.id ? 'bg-cartao-2 text-tinta ring-1 ring-linha-forte' : 'border border-linha text-tinta-suave'
                  }`}
                >
                  <IconeArea area={a.id} className="size-3.5" />
                  {INFO_AREAS[a.id].nome}
                </button>
              ))}
          </div>
          <Botao type="submit" variante="primario">
            Guardar
          </Botao>
        </form>
        <p className="mt-3 text-xs text-tinta-suave">
          Terminou um livro, bateu um recorde, mandou bem numa conversa? Guarde aqui. Nos dias ruins, a tela Hoje mostra uma delas.
        </p>
      </Cartao>

      {ordenadas.length > 0 && (
        <Cartao titulo={`Suas evidências (${ordenadas.length})`}>
          <ul>
            {ordenadas.map((e) => (
              <li key={e.id} className="flex items-start gap-2 border-t border-linha first:border-t-0">
                <div className="flex-1 py-2.5">
                  <p className="text-[15px] leading-snug">{e.texto}</p>
                  <p className="mt-0.5 text-xs text-tinta-suave">
                    {diaCurto(e.dia)}
                    {e.areaId && ` · ${INFO_AREAS[e.areaId].nome}`}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Apagar: ${e.texto}`}
                  onClick={() => void apagarEvidencia(e.id)}
                  className="-mr-2.5 grid size-11 shrink-0 place-items-center text-tinta-suave hover:text-tinta"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </Cartao>
      )}
    </div>
  )
}
