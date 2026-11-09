interface Props {
  ligado: boolean
  onMudar: (ligado: boolean) => void
  rotulo: string
}

/** Chave de liga/desliga. */
export function Interruptor({ ligado, onMudar, rotulo }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      onClick={() => onMudar(!ligado)}
      className="grid h-11 w-14 shrink-0 place-items-center"
    >
      <span
        className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${ligado ? 'bg-destaque' : 'bg-cartao-2 ring-1 ring-linha-forte ring-inset'}`}
      >
        <span
          className={`absolute top-1 left-1 size-5 rounded-full shadow-sm transition-transform duration-200 ease-saida ${
            ligado ? 'translate-x-5 bg-destaque-tinta' : 'bg-tinta-suave'
          }`}
        />
      </span>
    </button>
  )
}
