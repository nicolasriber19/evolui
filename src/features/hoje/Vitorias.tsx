import { useRef, useState } from 'react'
import { Cartao } from '../../components/Cartao'
import { CLASSE_CAMPO } from '../../components/estilos'
import { salvarVitorias } from '../../db/acoes'
import type { DiaISO } from '../../db/tipos'

const DICAS = ['Uma coisa que deu certo hoje', 'Outra vitória, mesmo pequena', 'Mais uma, de qualquer tamanho']

/** As 3 vitórias do dia, uma linha cada. Salva sozinho enquanto você digita. */
export function Vitorias({ salvas, hoje }: { salvas: string[]; hoje: DiaISO }) {
  const [textos, setTextos] = useState(() => [0, 1, 2].map((i) => salvas[i] ?? ''))
  const espera = useRef<number | undefined>(undefined)
  const campos = useRef<(HTMLInputElement | null)[]>([])

  function gravar(lista: string[]) {
    window.clearTimeout(espera.current)
    void salvarVitorias(hoje, lista.map((t) => t.trim()).filter(Boolean))
  }

  function mudar(i: number, valor: string) {
    const novos = textos.map((t, j) => (j === i ? valor : t))
    setTextos(novos)
    // "Debounce": espera você parar de digitar meio segundo antes de gravar.
    window.clearTimeout(espera.current)
    espera.current = window.setTimeout(() => gravar(novos), 500)
  }

  const preenchidas = textos.filter((t) => t.trim()).length

  return (
    <Cartao
      titulo="3 vitórias do dia"
      acao={<span className="text-xs text-tinta-suave tabular-nums">{preenchidas} de 3</span>}
    >
      <div className="flex flex-col gap-2">
        {DICAS.map((dica, i) => (
          <input
            key={dica}
            ref={(el) => {
              campos.current[i] = el
            }}
            value={textos[i]}
            onChange={(e) => mudar(i, e.target.value)}
            onBlur={() => gravar(textos)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (i < 2) campos.current[i + 1]?.focus()
                else e.currentTarget.blur()
              }
            }}
            placeholder={dica}
            aria-label={`Vitória ${i + 1}`}
            enterKeyHint={i < 2 ? 'next' : 'done'}
            maxLength={120}
            className={CLASSE_CAMPO}
          />
        ))}
      </div>
    </Cartao>
  )
}
