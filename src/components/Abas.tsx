interface Props<T extends string> {
  abas: { valor: T; rotulo: string }[]
  atual: T
  onMudar: (valor: T) => void
  rotulo: string
}

/** Abas dentro de uma tela (ex.: Treino, Histórico, Evolução). */
export function Abas<T extends string>({ abas, atual, onMudar, rotulo }: Props<T>) {
  return (
    <div role="tablist" aria-label={rotulo} className="flex gap-1 rounded-xl bg-cartao p-1 ring-1 ring-linha ring-inset">
      {abas.map((a) => {
        const ativa = a.valor === atual
        return (
          <button
            key={a.valor}
            type="button"
            role="tab"
            aria-selected={ativa}
            onClick={() => onMudar(a.valor)}
            className={`min-h-10 flex-1 rounded-lg px-2 text-[13px] transition-[background-color,color] duration-150 ${
              ativa ? 'bg-cartao-2 font-medium text-tinta' : 'text-tinta-suave hover:text-tinta'
            }`}
          >
            {a.rotulo}
          </button>
        )
      })}
    </div>
  )
}
