import { BookOpen, Dumbbell, Gamepad2, GraduationCap, MessagesSquare, Sprout, type LucideProps } from 'lucide-react'
import type { AreaId } from '../db/tipos'

const ICONES = {
  corpo: Dumbbell,
  estudo: GraduationCap,
  leitura: BookOpen,
  comunicacao: MessagesSquare,
  mente: Sprout,
  lazer: Gamepad2,
} satisfies Record<AreaId, unknown>

/** O ícone da área, já na cor dela. */
export function IconeArea({ area, ...props }: { area: AreaId } & LucideProps) {
  const Icone = ICONES[area]
  return <Icone aria-hidden="true" style={{ color: `var(--area-${area})` }} {...props} />
}

/** Bolinha colorida da área. */
export function PontoArea({ area }: { area: AreaId }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ background: `var(--area-${area})` }}
    />
  )
}
