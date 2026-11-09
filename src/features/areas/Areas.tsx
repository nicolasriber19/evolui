import { Link } from 'react-router'
import { Cartao } from '../../components/Cartao'
import { IconeArea } from '../../components/IconeArea'
import { useAgora, useAreas, useChecks, useHabitos } from '../../db/hooks'
import type { Config } from '../../db/tipos'
import { INFO_AREAS } from '../../lib/areas'
import { calcularCorrente } from '../../lib/corrente'
import { diaLogico, diasDaSemana } from '../../lib/datas'
import { feitosPorHabito } from '../../lib/votos'

/** Cada área ativa: a frase, os votos e como cada hábito está indo. */
export function Areas({ config }: { config: Config }) {
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const areas = useAreas()
  const habitos = useHabitos()
  const checks = useChecks()

  if (!areas || !habitos || !checks) return null

  const ativas = areas.filter((a) => a.ativa)
  const desligadas = areas.filter((a) => !a.ativa)
  const semana = new Set(diasDaSemana(hoje))
  const feitos = feitosPorHabito(checks)

  return (
    <div className="flex flex-col gap-3">
      <h1 className="pb-1 font-display text-[1.75rem] leading-tight font-medium tracking-tight">Áreas</h1>

      {ativas.map((area) => {
        const daArea = checks.filter((c) => c.areaId === area.id)
        const votosSemana = daArea.filter((c) => semana.has(c.dia)).length
        const habitosDaArea = habitos.filter((h) => h.areaId === area.id)
        return (
          <Cartao key={area.id}>
            <p className="flex items-center gap-1.5 text-xs text-tinta-suave">
              <IconeArea area={area.id} className="size-3.5" />
              {INFO_AREAS[area.id].nome}
            </p>
            <p className="mt-1 font-display text-[1.35rem] leading-tight font-medium tracking-tight">{area.frase}</p>
            <p className="mt-2 text-sm text-tinta-suave">
              <span className="font-medium text-destaque-texto tabular-nums">{votosSemana}</span> esta semana ·{' '}
              <span className="text-tinta tabular-nums">{daArea.length}</span> {daArea.length === 1 ? 'voto' : 'votos'} no total
            </p>

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
      <p className="px-1 pt-2 text-xs text-tinta-suave">Em breve aqui: registro de treino, timer de foco e seus livros.</p>
    </div>
  )
}
