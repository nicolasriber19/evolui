// Gráficos simples feitos só com HTML e CSS (sem biblioteca): barras e colunas.
// Seguem as mesmas regras do gráfico de linha: uma cor só, ponta arredondada,
// números em cor de texto (nunca na cor da barra) e uma descrição para leitores de tela.

interface ItemBarra {
  chave: string
  rotulo: string
  valor: number
  /** O valor já escrito para mostrar (ex.: "1h 25min"). */
  texto: string
}

/** Barras deitadas: uma por item, valor escrito na ponta. */
export function BarrasHorizontais({ itens, descricao }: { itens: ItemBarra[]; descricao: string }) {
  const max = Math.max(...itens.map((i) => i.valor), 1)
  return (
    <ul className="flex flex-col gap-3" aria-label={descricao}>
      {itens.map((i) => (
        <li key={i.chave}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span>{i.rotulo}</span>
            <span className="text-tinta-suave tabular-nums">{i.texto}</span>
          </div>
          <div className="h-2.5 rounded-r-[4px] bg-cartao-2" aria-hidden="true">
            <div
              className="h-full rounded-r-[4px] bg-grafico"
              style={{ width: `${Math.max((i.valor / max) * 100, i.valor > 0 ? 2 : 0)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

interface PropsColunas {
  valores: number[]
  rotulos: string[]
  /** Posição da coluna de hoje (fica com o rótulo destacado). */
  indiceHoje: number
  formatar: (valor: number) => string
  descricao: string
}

/** Colunas de pé, uma por dia da semana. Só o valor de hoje aparece escrito; o resto fica no toque. */
export function ColunasSemana({ valores, rotulos, indiceHoje, formatar, descricao }: PropsColunas) {
  const max = Math.max(...valores, 1)
  return (
    <figure>
      <figcaption className="sr-only">
        {descricao}: {valores.map((v, i) => `${rotulos[i]} ${formatar(v)}`).join(', ')}
      </figcaption>
      <div className="grid h-24 grid-cols-7 items-end gap-2 border-b border-linha-forte" aria-hidden="true">
        {valores.map((v, i) => (
          <div key={i} className="flex h-full flex-col justify-end" title={`${rotulos[i]}: ${formatar(v)}`}>
            {i === indiceHoje && v > 0 && <span className="mb-1 text-center text-[11px] text-tinta tabular-nums">{formatar(v)}</span>}
            <div
              className="mx-auto w-full max-w-6 rounded-t-[4px] bg-grafico"
              style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? 3 : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-2 text-center text-[10px] text-tinta-suave" aria-hidden="true">
        {rotulos.map((r, i) => (
          <span key={r + i} className={i === indiceHoje ? 'font-medium text-tinta' : ''}>
            {r}
          </span>
        ))}
      </div>
    </figure>
  )
}
