import { useState } from 'react'
import type { CelulaMapa } from '../lib/revisao'
import { diaCurto } from '../lib/datas'

const COR = ['bg-cartao-2', 'bg-mapa-1', 'bg-mapa-2', 'bg-mapa-3', 'bg-mapa-4']
const NOMES_DIAS = ['seg', '', 'qua', '', 'sex', '', 'dom']

function descrever(c: CelulaMapa): string {
  if (c.agendados === 0) return `${diaCurto(c.dia)}: sem hábito marcado`
  return `${diaCurto(c.dia)}: ${c.feitos} de ${c.agendados} ${c.agendados === 1 ? 'hábito' : 'hábitos'}`
}

/**
 * Calendário dos hábitos: cada quadradinho é um dia, quanto mais forte o âmbar, mais hábitos feitos.
 * Toque num dia para ver os números dele.
 */
export function MapaDeCalor({ colunas, hoje, desde }: { colunas: CelulaMapa[][]; hoje: string; desde: string }) {
  const [escolhida, setEscolhida] = useState<CelulaMapa | null>(null)
  const grade = { gridTemplateColumns: `1.5rem repeat(${colunas.length}, minmax(0, 1fr))` }

  return (
    <div>
      <div className="grid gap-[3px]" style={grade}>
        {/* coluna dos nomes dos dias */}
        <div className="grid grid-rows-7 gap-[3px]" aria-hidden="true">
          {NOMES_DIAS.map((n, i) => (
            <span key={i} className="flex items-center text-[9px] leading-none text-tinta-suave">
              {n}
            </span>
          ))}
        </div>
        {colunas.map((coluna, s) => (
          <div key={s} className="grid grid-rows-7 gap-[3px]">
            {coluna.map((c) => {
              // Dias que ainda não chegaram, ou de antes de você começar, ficam como espaço vazio.
              if (c.dia > hoje || c.dia < desde) return <span key={c.dia} className="aspect-square w-full" />
              return (
                <button
                  key={c.dia}
                  type="button"
                  onClick={() => setEscolhida(c)}
                  aria-label={descrever(c)}
                  title={descrever(c)}
                  className={`aspect-square w-full rounded-[3px] ${
                    c.nivel === null ? 'border border-dashed border-linha-forte' : COR[c.nivel]
                  } ${escolhida?.dia === c.dia ? 'ring-2 ring-tinta ring-offset-1 ring-offset-cartao' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-tinta-suave">
        <span aria-live="polite" className="min-h-4">
          {escolhida ? descrever(escolhida) : 'Toque num dia para ver.'}
        </span>
        <span className="flex items-center gap-1" aria-hidden="true">
          menos
          {COR.map((c) => (
            <span key={c} className={`size-3 rounded-[2px] ${c}`} />
          ))}
          mais
        </span>
      </div>
    </div>
  )
}
