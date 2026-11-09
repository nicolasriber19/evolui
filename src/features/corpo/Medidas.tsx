import { format } from 'date-fns'
import { lazy, Suspense } from 'react'
import { CampoNumero } from '../../components/CampoNumero'
import { Cartao } from '../../components/Cartao'
import { salvarMedida } from '../../db/acoesCorpo'
import { useMedidas } from '../../db/hooks'
import type { DiaISO } from '../../db/tipos'
import { diaCurto, paraData } from '../../lib/datas'
import { formatarNumero } from '../../lib/formatar'

const GraficoLinha = lazy(() => import('../../components/GraficoLinha'))

/** Peso corporal e horas de sono. Os dois são opcionais. */
export function Medidas({ hoje }: { hoje: DiaISO }) {
  const medidas = useMedidas()
  if (!medidas) return null

  const deHoje = medidas.find((m) => m.id === hoje)
  const pesos = medidas.filter((m) => m.pesoKg !== undefined).slice(-30)
  const recentes = [...medidas].filter((m) => m.pesoKg !== undefined || m.sonoHoras !== undefined).reverse().slice(0, 7)

  return (
    <div className="flex flex-col gap-3">
      <Cartao titulo="Hoje">
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero
            key={`peso-${hoje}-${deHoje?.pesoKg}`}
            rotulo="Peso"
            unidade="kg"
            valor={deHoje?.pesoKg}
            placeholder="72,5"
            onSalvar={(v) => void salvarMedida(hoje, 'pesoKg', v)}
          />
          <CampoNumero
            key={`sono-${hoje}-${deHoje?.sonoHoras}`}
            rotulo="Sono da noite"
            unidade="h"
            valor={deHoje?.sonoHoras}
            placeholder="7,5"
            onSalvar={(v) => void salvarMedida(hoje, 'sonoHoras', v)}
          />
        </div>
        <p className="mt-3 text-xs text-tinta-suave">
          Opcional. Pesar sempre de manhã, antes de comer, deixa a comparação justa.
        </p>
      </Cartao>

      {pesos.length >= 2 && (
        <Cartao titulo="Peso corporal">
          <Suspense fallback={<div className="h-52" />}>
            <GraficoLinha
              dados={pesos.map((m) => ({ rotulo: format(paraData(m.id), 'dd/MM'), valor: m.pesoKg! }))}
              unidade="kg"
              descricao="Peso corporal por dia"
            />
          </Suspense>
        </Cartao>
      )}

      {recentes.length > 0 && (
        <Cartao titulo="Últimos registros">
          <ul>
            {recentes.map((m) => (
              <li key={m.id} className="flex justify-between border-t border-linha py-2 text-sm first:border-t-0 first:pt-0">
                <span className="text-tinta-suave">{diaCurto(m.id)}</span>
                <span className="tabular-nums">
                  {m.pesoKg !== undefined && `${formatarNumero(m.pesoKg)} kg`}
                  {m.pesoKg !== undefined && m.sonoHoras !== undefined && <span className="mx-2 text-tinta-suave">·</span>}
                  {m.sonoHoras !== undefined && `${formatarNumero(m.sonoHoras)} h de sono`}
                </span>
              </li>
            ))}
          </ul>
        </Cartao>
      )}
    </div>
  )
}
