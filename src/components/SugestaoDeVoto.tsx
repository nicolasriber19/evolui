import { Check } from 'lucide-react'
import { marcarHabito } from '../db/acoes'
import { useChecks, useHabitos } from '../db/hooks'
import type { AreaId, DiaISO } from '../db/tipos'
import { agendadoEm } from '../lib/corrente'

/**
 * Depois de registrar algo (treino, estudo, leitura), oferece marcar o hábito
 * da área que ainda está pendente hoje. Um toque e o voto está dado.
 */
export function SugestaoDeVoto({ area, hoje }: { area: AreaId; hoje: DiaISO }) {
  const habitos = useHabitos()
  const checks = useChecks()
  if (!habitos || !checks) return null

  const marcadosHoje = new Set(checks.filter((c) => c.dia === hoje).map((c) => c.habitoId))
  const pendentes = habitos.filter((h) => h.ativo && h.areaId === area && agendadoEm(h, hoje) && !marcadosHoje.has(h.id))
  if (pendentes.length === 0) return null

  return (
    <div className="entra flex flex-col gap-2 rounded-2xl border border-linha bg-cartao-2 p-3">
      <p className="text-xs text-tinta-suave">Isso conta como voto de hoje?</p>
      {pendentes.map((h) => (
        <button
          key={h.id}
          type="button"
          onClick={() => {
            void marcarHabito(h, hoje, 'completo')
            navigator.vibrate?.(10)
          }}
          className="flex min-h-11 items-center gap-3 rounded-xl bg-cartao px-3 text-left text-sm transition-transform duration-150 ease-saida active:scale-[0.98]"
        >
          <span className="grid size-6 place-items-center rounded-lg border-[1.5px] border-tinta-suave/60" aria-hidden="true">
            <Check className="size-4 text-transparent" />
          </span>
          <span className="flex-1">Marcar “{h.nome}”</span>
        </button>
      ))}
    </div>
  )
}
