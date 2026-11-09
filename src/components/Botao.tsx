import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'fantasma' | 'perigo'

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-destaque text-destaque-tinta font-medium',
  secundario: 'bg-cartao-2 text-tinta',
  fantasma: 'text-tinta-suave hover:text-tinta',
  perigo: 'bg-cartao-2 text-perigo',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
}

/** Botão padrão do app: 44px de altura mínima e um leve "afundar" ao tocar. */
export function Botao({ variante = 'secundario', className = '', type = 'button', ...resto }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm transition-transform duration-150 ease-saida active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
      {...resto}
    />
  )
}
