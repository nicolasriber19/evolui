import { format } from 'date-fns'
import { lazy, Suspense, useState } from 'react'
import { Cartao } from '../../components/Cartao'
import type { DiaISO, Serie } from '../../db/tipos'
import { diaCurto, paraData } from '../../lib/datas'
import { formatarNumero } from '../../lib/formatar'
import { evolucaoCarga } from '../../lib/treino'

// "lazy": o código do gráfico (e a biblioteca Recharts) só é baixado quando esta aba abre.
const GraficoLinha = lazy(() => import('../../components/GraficoLinha'))

/** Gráfico da maior carga de cada treino, exercício por exercício. */
export function EvolucaoCarga({ series, nomes }: { series: Serie[]; nomes: Map<string, string> }) {
  const [escolhido, setEscolhido] = useState<string | null>(null)

  // Exercícios com histórico, do usado mais recentemente para o mais antigo.
  const ultimoDia = new Map<string, DiaISO>()
  for (const s of series) {
    if ((ultimoDia.get(s.exercicioId) ?? '') < s.dia) ultimoDia.set(s.exercicioId, s.dia)
  }
  const ids = [...ultimoDia].sort((a, b) => b[1].localeCompare(a[1])).map(([id]) => id)

  if (ids.length === 0) {
    return <p className="px-1 text-sm text-tinta-suave">Registre um treino para ver a evolução da carga de cada exercício.</p>
  }

  const atual = escolhido && ids.includes(escolhido) ? escolhido : ids[0]
  const nome = nomes.get(atual) ?? 'Exercício'
  const pontos = evolucaoCarga(series, atual)
  const recorde = pontos.reduce((a, b) => (b.carga >= a.carga ? b : a))

  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" role="group" aria-label="Escolher exercício">
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === atual}
            onClick={() => setEscolhido(id)}
            className={`min-h-10 shrink-0 rounded-xl px-3 text-sm whitespace-nowrap transition-colors duration-150 ${
              id === atual ? 'bg-cartao-2 text-tinta ring-1 ring-linha-forte' : 'border border-linha text-tinta-suave'
            }`}
          >
            {nomes.get(id) ?? 'Exercício'}
          </button>
        ))}
      </div>

      <Cartao titulo={`Carga máxima por treino: ${nome}`}>
        {pontos.length >= 2 ? (
          <Suspense fallback={<div className="h-52" />}>
            <GraficoLinha
              dados={pontos.map((p) => ({ rotulo: format(paraData(p.dia), 'dd/MM'), valor: p.carga }))}
              unidade="kg"
              descricao={`Carga máxima em ${nome} por dia de treino`}
            />
          </Suspense>
        ) : (
          <p className="py-6 text-center text-sm text-tinta-suave">Faça esse exercício em mais um treino para ver a linha da evolução.</p>
        )}
        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-linha pt-3 text-center">
          <div>
            <dt className="text-[11px] text-tinta-suave">Primeira vez</dt>
            <dd className="text-sm font-medium tabular-nums">{formatarNumero(pontos[0].carga)} kg</dd>
          </div>
          <div>
            <dt className="text-[11px] text-tinta-suave">Recorde</dt>
            <dd className="text-sm font-medium tabular-nums">
              {formatarNumero(recorde.carga)} kg
              <span className="block text-[11px] font-normal text-tinta-suave">{diaCurto(recorde.dia)}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-tinta-suave">Última</dt>
            <dd className="text-sm font-medium tabular-nums">{formatarNumero(pontos[pontos.length - 1].carga)} kg</dd>
          </div>
        </dl>
      </Cartao>
    </div>
  )
}
