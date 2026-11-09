import { useId, useState } from 'react'
import { lerNumero, numeroParaCampo } from '../lib/formatar'

interface Props {
  rotulo: string
  unidade: string
  valor?: number
  onSalvar: (valor: number | undefined) => void
  placeholder?: string
}

/** Campo de número que aceita vírgula ("72,4") e salva quando você sai do campo. */
export function CampoNumero({ rotulo, unidade, valor, onSalvar, placeholder = '0' }: Props) {
  const id = useId()
  const [texto, setTexto] = useState(numeroParaCampo(valor))

  function salvar() {
    const n = lerNumero(texto)
    if (n === valor || (n === null && valor === undefined)) return
    onSalvar(n === null ? undefined : n)
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-tinta-suave">
        {rotulo}
      </label>
      <div className="flex min-h-11 items-center gap-1.5 rounded-xl border border-linha bg-cartao-2 px-3 focus-within:border-linha-forte">
        <input
          id={id}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={salvar}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
          inputMode="decimal"
          enterKeyHint="done"
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent text-base tabular-nums outline-none placeholder:text-tinta-suave"
        />
        <span className="text-sm text-tinta-suave">{unidade}</span>
      </div>
    </div>
  )
}
