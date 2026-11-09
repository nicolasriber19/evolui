const DIAS = [
  { n: 1, curto: 'S', nome: 'segunda' },
  { n: 2, curto: 'T', nome: 'terça' },
  { n: 3, curto: 'Q', nome: 'quarta' },
  { n: 4, curto: 'Q', nome: 'quinta' },
  { n: 5, curto: 'S', nome: 'sexta' },
  { n: 6, curto: 'S', nome: 'sábado' },
  { n: 0, curto: 'D', nome: 'domingo' },
]

interface Props {
  dias: number[]
  onMudar: (dias: number[]) => void
}

/** Escolha dos dias da semana em que um hábito vale. */
export function DiasSemana({ dias, onMudar }: Props) {
  const alternar = (n: number) =>
    onMudar(dias.includes(n) ? dias.filter((d) => d !== n) : [...dias, n].sort((a, b) => a - b))

  return (
    <div className="flex gap-1">
      {DIAS.map((d) => {
        const ativo = dias.includes(d.n)
        return (
          <button
            key={d.n}
            type="button"
            aria-pressed={ativo}
            aria-label={d.nome}
            onClick={() => alternar(d.n)}
            className={`h-10 flex-1 rounded-lg text-xs font-medium transition-[transform,background-color,color] duration-150 ease-saida active:scale-[0.94] ${
              ativo ? 'bg-destaque/15 text-destaque-texto ring-1 ring-destaque/45 ring-inset' : 'bg-cartao-2 text-tinta-suave'
            }`}
          >
            {d.curto}
          </button>
        )
      })}
    </div>
  )
}
