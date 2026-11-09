import { Cartao } from '../../components/Cartao'
import { PontoArea } from '../../components/IconeArea'
import { useAreas, useChecks } from '../../db/hooks'
import type { Config } from '../../db/tipos'
import { INFO_AREAS } from '../../lib/areas'
import { diaCurto } from '../../lib/datas'

/** Por enquanto, os números reais que já existem. Gráficos, calendário e níveis chegam na Fase 4. */
export function Evolucao({ config }: { config: Config }) {
  const checks = useChecks()
  const areas = useAreas()
  if (!checks || !areas) return null

  const porArea = areas
    .map((a) => ({ id: a.id, votos: checks.filter((c) => c.areaId === a.id).length }))
    .filter((a) => a.votos > 0)
    .sort((a, b) => b.votos - a.votos)
  const minimos = checks.filter((c) => c.tipo === 'minimo').length

  return (
    <div className="flex flex-col gap-3">
      <h1 className="pb-1 font-display text-[1.75rem] leading-tight font-medium tracking-tight">Evolução</h1>

      <Cartao>
        {checks.length === 0 ? (
          <p className="text-sm text-tinta-suave">Seu primeiro voto vai aparecer aqui. Marque um hábito na tela Hoje.</p>
        ) : (
          <>
            <p className="font-display text-5xl leading-none font-medium tracking-tight tabular-nums">{checks.length}</p>
            <p className="mt-2 text-sm text-tinta-suave">
              {checks.length === 1 ? 'voto' : 'votos'} em quem você quer ser
              {config.inicioEm ? ` desde ${diaCurto(config.inicioEm)}` : ''}
              {minimos > 0 && `, ${minimos} deles na versão mínima`}.
            </p>
            <ul className="mt-4 border-t border-linha">
              {porArea.map((a) => (
                <li key={a.id} className="flex items-center gap-3 border-b border-linha py-2.5 last:border-b-0 last:pb-0">
                  <PontoArea area={a.id} />
                  <span className="flex-1 text-[15px]">{INFO_AREAS[a.id].nome}</span>
                  <span className="text-sm tabular-nums">{a.votos}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Cartao>

      <p className="px-1 pt-1 text-xs text-tinta-suave">
        Em breve: gráficos da semana e do mês, calendário dos hábitos, XP e níveis por área.
      </p>
    </div>
  )
}
