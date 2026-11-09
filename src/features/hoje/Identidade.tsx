import type { RefObject } from 'react'
import { IconeArea } from '../../components/IconeArea'
import type { Area, Check, DiaISO } from '../../db/tipos'
import { INFO_AREAS } from '../../lib/areas'

const NOMES_DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
const MAX_TRACOS = 4

interface Props {
  area: Area
  dias: DiaISO[]
  hoje: DiaISO
  /** Votos da área em cada dia da semana (mesma ordem de `dias`). */
  votos: Check[][]
  /** Ids dos votos dados agora há pouco: o tracinho deles espera o ponto dourado chegar. */
  recentes: Set<string>
  alvoRef: RefObject<HTMLDivElement | null>
  onTrocar?: () => void
}

/** A frase de identidade do dia e a régua de votos da semana. */
export function Identidade({ area, dias, hoje, votos, recentes, alvoRef, onTrocar }: Props) {
  const total = votos.reduce((soma, dia) => soma + dia.length, 0)
  const fraseLonga = area.frase.length > 30

  return (
    <section aria-label="Identidade do dia" className="pb-2">
      <button
        type="button"
        onClick={onTrocar}
        disabled={!onTrocar}
        className="flex min-h-[6.25rem] w-full flex-col justify-end text-left disabled:cursor-default"
      >
        {/* O nome do botão é o próprio texto visível + esta dica escondida (quem usa voz fala o que vê). */}
        {onTrocar && <span className="sr-only">Toque para ver outra identidade:</span>}
        <span key={`r-${area.id}`} className="troca-frase flex items-center gap-1.5 text-xs text-tinta-suave">
          <IconeArea area={area.id} className="size-3.5" />
          {INFO_AREAS[area.id].nome}
        </span>
        {/* O botão tem altura mínima de 2 linhas de frase: trocar de frase não empurra o resto da tela. */}
        <span
          key={area.id}
          className={`troca-frase mt-1.5 block font-display leading-[1.04] font-medium tracking-[-0.025em] ${
            fraseLonga ? 'text-[1.7rem]' : 'text-[2.15rem]'
          }`}
        >
          {area.frase}
        </span>
      </button>

      <div className="mt-4 grid grid-cols-7 gap-1.5" aria-hidden="true">
        {dias.map((dia, i) => {
          const ehHoje = dia === hoje
          return (
            <div
              key={dia}
              ref={ehHoje ? alvoRef : undefined}
              className={`flex h-7 flex-col-reverse gap-0.5 rounded-md p-[3px] ${
                ehHoje ? 'bg-cartao-2 ring-1 ring-linha-forte' : dia > hoje ? 'bg-cartao/50' : 'bg-cartao'
              }`}
            >
              {votos[i].slice(0, MAX_TRACOS).map((c) => (
                <span key={c.id} className={`block h-1 shrink-0 rounded-full bg-destaque ${recentes.has(c.id) ? 'tick-novo' : ''}`} />
              ))}
            </div>
          )
        })}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1.5 text-center text-[10px] text-tinta-suave" aria-hidden="true">
        {NOMES_DIAS.map((nome, i) => (
          <span key={nome} className={dias[i] === hoje ? 'font-medium text-tinta' : ''}>
            {nome}
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm text-tinta-suave" aria-live="polite">
        {total === 0 ? (
          'Marque um hábito e dê o primeiro voto da semana.'
        ) : (
          <>
            <span className="font-medium text-destaque-texto tabular-nums">
              {total} {total === 1 ? 'voto' : 'votos'}
            </span>{' '}
            nessa identidade esta semana
          </>
        )}
      </p>
    </section>
  )
}
