import { ChevronRight, MessagesSquare, Sprout } from 'lucide-react'
import { Link } from 'react-router'
import { useEvidencias, useTentativas } from '../../db/hooks'
import type { Dia, DiaISO, Semana } from '../../db/tipos'
import { diaCurto, numeroDoDia } from '../../lib/datas'

/**
 * Dia difícil (energia ou humor 1 ou 2): mostra uma das suas evidências, sem sermão.
 * A evidência escolhida é a mesma o dia todo (muda no dia seguinte).
 */
export function EvidenciaDoDiaDificil({ dia, hoje }: { dia: Dia | null; hoje: DiaISO }) {
  const evidencias = useEvidencias()
  const dificil = (dia?.humor !== undefined && dia.humor <= 2) || (dia?.energia !== undefined && dia.energia <= 2)
  if (!dificil || !evidencias || evidencias.length === 0) return null
  const e = evidencias[numeroDoDia(hoje) % evidencias.length]

  return (
    <section aria-label="Uma lembrança para o dia difícil" className="entra rounded-2xl border border-linha bg-cartao p-4">
      <p className="flex items-center gap-1.5 text-xs text-tinta-suave">
        <Sprout className="size-3.5" aria-hidden="true" style={{ color: 'var(--area-mente)' }} />
        Dia pesado. Lembra disso:
      </p>
      <p className="mt-2 font-display text-[1.3rem] leading-snug font-medium tracking-tight">{e.texto}</p>
      <p className="mt-1 text-xs text-tinta-suave">{diaCurto(e.dia)}</p>
      <p className="mt-3 text-sm text-tinta-suave">Hoje, a versão mínima já conta.</p>
    </section>
  )
}

/** O desafio de conversa da semana, numa linha, com atalho para registrar. */
export function DesafioDaSemanaNaHoje({ semana }: { semana: Semana | null }) {
  const tentativas = useTentativas()
  const n = semana?.desafio && tentativas ? tentativas.filter((t) => t.semana === semana.id).length : 0

  return (
    <Link
      to="/areas/comunicacao"
      className="flex min-h-14 items-center gap-3 rounded-2xl border border-linha bg-cartao px-4 py-3 transition-transform duration-150 ease-saida active:scale-[0.99]"
    >
      <MessagesSquare className="size-5 shrink-0" aria-hidden="true" style={{ color: 'var(--area-comunicacao)' }} />
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-tinta-suave">
          Desafio da semana{semana?.desafio ? ` · ${n === 0 ? 'nenhuma tentativa ainda' : `${n} ${n === 1 ? 'tentativa' : 'tentativas'}`}` : ''}
        </span>
        <span className="block text-[15px] leading-snug">{semana?.desafio?.texto ?? 'Sortear o desafio desta semana'}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-tinta-suave" aria-hidden="true" />
    </Link>
  )
}
