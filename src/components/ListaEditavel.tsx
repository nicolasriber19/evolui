import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { CLASSE_CAMPO } from './estilos'

interface Item {
  id: string
  texto: string
}

interface Props {
  itens: Item[]
  onAdicionar: (texto: string) => void
  onEditar: (id: string, texto: string) => void
  onApagar: (id: string) => void
  placeholder: string
  rotulo: string
}

/** Lista de textos que você mesmo edita (desafios, dicas): tocar no texto edita, o X apaga. */
export function ListaEditavel({ itens, onAdicionar, onEditar, onApagar, placeholder, rotulo }: Props) {
  const [novo, setNovo] = useState('')
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1.5">
        {itens.map((item, i) => (
          <li key={item.id} className="flex items-start gap-1">
            <textarea
              key={item.texto}
              defaultValue={item.texto}
              rows={1}
              aria-label={`${rotulo} ${i + 1}`}
              onBlur={(e) => {
                const t = e.target.value.trim()
                if (t && t !== item.texto) onEditar(item.id, t)
                else e.target.value = item.texto
              }}
              maxLength={200}
              className={`${CLASSE_CAMPO} field-sizing-content resize-none py-2.5 text-[15px] leading-snug`}
            />
            <button
              type="button"
              aria-label={`Apagar: ${item.texto}`}
              onClick={() => onApagar(item.id)}
              className="grid size-11 shrink-0 place-items-center text-tinta-suave hover:text-tinta"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!novo.trim()) return
          onAdicionar(novo)
          setNovo('')
        }}
      >
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          placeholder={placeholder}
          aria-label={`Novo item: ${rotulo}`}
          maxLength={200}
          className={CLASSE_CAMPO}
        />
        <button
          type="submit"
          aria-label="Adicionar"
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-cartao-2 text-tinta active:scale-[0.94]"
        >
          <Plus className="size-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
