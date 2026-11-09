interface Props {
  rotulo: string
  valor?: number
  onEscolher: (valor: number) => void
  legendas?: [string, string]
}

/** Escolha rápida de 1 a 5 com um toque (energia, humor). */
export function Escala({ rotulo, valor, onEscolher, legendas = ['baixa', 'alta'] }: Props) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-medium text-tinta-suave">{rotulo}</legend>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const ativo = valor === n
          return (
            <button
              key={n}
              type="button"
              aria-pressed={ativo}
              aria-label={`${rotulo} ${n} de 5`}
              onClick={() => onEscolher(n)}
              className={`h-11 flex-1 rounded-xl text-sm tabular-nums transition-[transform,background-color,color] duration-150 ease-saida active:scale-[0.95] ${
                ativo ? 'bg-destaque font-medium text-destaque-tinta' : 'bg-cartao-2 text-tinta-suave'
              }`}
            >
              {n}
            </button>
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-tinta-suave">
        <span>{legendas[0]}</span>
        <span>{legendas[1]}</span>
      </div>
    </fieldset>
  )
}
