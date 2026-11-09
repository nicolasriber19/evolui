import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router'
import type { AreaId } from '../db/tipos'
import { useAreas } from '../db/hooks'
import { INFO_AREAS } from '../lib/areas'
import { IconeArea } from './IconeArea'

/** Topo das telas de área: voltar, nome da área e a frase de identidade. */
export function CabecalhoArea({ area }: { area: AreaId }) {
  const areas = useAreas()
  const frase = areas?.find((a) => a.id === area)?.frase
  return (
    <header className="pb-1">
      <Link to="/areas" className="-ml-2 inline-flex min-h-11 items-center gap-0.5 pr-3 text-sm text-tinta-suave hover:text-tinta">
        <ChevronLeft className="size-4" aria-hidden="true" /> Áreas
      </Link>
      <h1 className="flex items-center gap-2 font-display text-[1.75rem] leading-tight font-medium tracking-tight">
        <IconeArea area={area} className="size-6" />
        {INFO_AREAS[area].nome}
      </h1>
      {frase && <p className="mt-1 text-sm text-tinta-suave">{frase}</p>}
    </header>
  )
}
