import type { ReactNode } from 'react'

interface Props {
  titulo?: string
  acao?: ReactNode
  children: ReactNode
  className?: string
}

/** Um bloco da tela, com título pequeno opcional e uma ação no canto. */
export function Cartao({ titulo, acao, children, className = '' }: Props) {
  return (
    <section className={`rounded-2xl border border-linha bg-cartao p-4 shadow-(--sombra) ${className}`}>
      {(titulo || acao) && (
        <div className="mb-2 flex min-h-6 items-center justify-between gap-3">
          {titulo && <h2 className="text-xs font-medium text-tinta-suave">{titulo}</h2>}
          {acao}
        </div>
      )}
      {children}
    </section>
  )
}
