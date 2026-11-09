import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface Props {
  aberta: boolean
  onFechar: () => void
  titulo: string
  children: ReactNode
}

/**
 * Janela que sobe de baixo da tela (bottom sheet).
 * Usa o <dialog> do próprio navegador, que já cuida do foco e da tecla Esc.
 */
export function Folha({ aberta, onFechar, titulo, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (aberta && !dialogo.open) dialogo.showModal()
    if (!aberta && dialogo.open) dialogo.close()
  }, [aberta])

  return (
    <dialog
      ref={ref}
      className="folha"
      aria-labelledby={idTitulo}
      onClose={onFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar() // tocou fora: fecha
      }}
    >
      <div className="flex max-h-[92dvh] flex-col">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <h2 id={idTitulo} className="font-display text-lg font-medium tracking-tight">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="-mr-2 grid size-11 place-items-center text-tinta-suave hover:text-tinta"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{aberta && children}</div>
      </div>
    </dialog>
  )
}
