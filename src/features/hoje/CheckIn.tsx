import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { Cartao } from '../../components/Cartao'
import { Escala } from '../../components/Escala'
import { salvarCheckin } from '../../db/acoes'
import type { Dia, DiaISO } from '../../db/tipos'

/** Energia e humor de 1 a 5. Depois de responder, vira uma linha pequena. */
export function CheckIn({ dia, hoje }: { dia: Dia | null; hoje: DiaISO }) {
  const [editando, setEditando] = useState(false)
  const respondido = dia?.energia !== undefined && dia?.humor !== undefined

  if (respondido && !editando) {
    return (
      <button
        type="button"
        onClick={() => setEditando(true)}
        className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-linha bg-cartao px-4 text-left text-sm transition-transform duration-150 ease-saida active:scale-[0.985]"
      >
        <span className="flex-1 text-tinta-suave">
          Check-in<span className="sr-only"> (toque para mudar)</span>
        </span>
        <span className="tabular-nums">
          Energia <span className="font-medium">{dia.energia}</span>
          <span className="mx-2 text-tinta-suave">·</span>
          Humor <span className="font-medium">{dia.humor}</span>
        </span>
        <Pencil className="size-3.5 text-tinta-suave" aria-hidden="true" />
      </button>
    )
  }

  return (
    <Cartao titulo="Como você está agora?">
      <div className="flex flex-col gap-3">
        <Escala rotulo="Energia" valor={dia?.energia} onEscolher={(n) => salvarCheckin(hoje, 'energia', n)} />
        <Escala rotulo="Humor" valor={dia?.humor} legendas={['ruim', 'ótimo']} onEscolher={(n) => salvarCheckin(hoje, 'humor', n)} />
        {editando && (
          <Botao variante="secundario" onClick={() => setEditando(false)}>
            Pronto
          </Botao>
        )}
      </div>
    </Cartao>
  )
}
