import { Circle, CircleCheck, Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { ItemLista } from '../db/tipos'
import { novoItem } from '../db/acoes'
import { CLASSE_CAMPO } from './estilos'

interface Props {
  itens: ItemLista[]
  onMudar: (itens: ItemLista[]) => void
  max?: number
  placeholder: string
  rotuloCampo: string
  mensagemLimite: string
  sugestoes?: string[]
}

/** Lista curta com limite (prioridades do dia, metas da semana). Tocar no círculo conclui. */
export function ListaCurta({ itens, onMudar, max = 3, placeholder, rotuloCampo, mensagemLimite, sugestoes = [] }: Props) {
  const [texto, setTexto] = useState('')
  const cheia = itens.length >= max
  const sugestoesLivres = sugestoes.filter((s) => !itens.some((i) => i.texto === s)).slice(0, 3)

  function adicionar(valor: string) {
    const limpo = valor.trim()
    if (!limpo || cheia) return
    onMudar([...itens, novoItem(limpo)])
    setTexto('')
  }

  return (
    <div>
      {itens.length > 0 && (
        <ul className="mb-1">
          {itens.map((item) => (
            <li key={item.id} className="entra flex items-center">
              <button
                type="button"
                aria-pressed={item.feita}
                aria-label={item.feita ? `Desmarcar: ${item.texto}` : `Concluir: ${item.texto}`}
                onClick={() => onMudar(itens.map((i) => (i.id === item.id ? { ...i, feita: !i.feita } : i)))}
                className="-ml-2.5 grid size-11 shrink-0 place-items-center transition-transform duration-150 ease-saida active:scale-[0.9]"
              >
                {item.feita ? (
                  <CircleCheck className="size-5 text-destaque-texto" aria-hidden="true" />
                ) : (
                  <Circle className="size-5 text-tinta-suave" aria-hidden="true" />
                )}
              </button>
              <span
                className={`flex-1 py-2 text-[15px] leading-snug ${item.feita ? 'text-tinta-suave line-through decoration-linha-forte' : ''}`}
              >
                {item.texto}
              </span>
              <button
                type="button"
                aria-label={`Remover: ${item.texto}`}
                onClick={() => onMudar(itens.filter((i) => i.id !== item.id))}
                className="-mr-2.5 grid size-11 shrink-0 place-items-center text-tinta-suave hover:text-tinta"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {cheia ? (
        <p className="text-xs text-tinta-suave">{mensagemLimite}</p>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              adicionar(texto)
            }}
            className="flex gap-2"
          >
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={placeholder}
              aria-label={rotuloCampo}
              enterKeyHint="done"
              maxLength={100}
              className={CLASSE_CAMPO}
            />
            <button
              type="submit"
              aria-label="Adicionar"
              disabled={!texto.trim()}
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-cartao-2 text-tinta transition-transform duration-150 ease-saida active:scale-[0.94] disabled:text-tinta-suave"
            >
              <Plus className="size-5" aria-hidden="true" />
            </button>
          </form>
          {sugestoesLivres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sugestoesLivres.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => adicionar(s)}
                  className="min-h-9 rounded-lg border border-linha px-2.5 text-xs text-tinta-suave transition-colors hover:text-tinta active:scale-[0.97]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
