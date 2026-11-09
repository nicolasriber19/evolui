import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { SugestaoDeVoto } from '../../components/SugestaoDeVoto'
import { registrarLeitura } from '../../db/acoesLeitura'
import type { DiaISO, Livro } from '../../db/tipos'
import { calcularLeitura } from '../../lib/leitura'
import { lerNumero } from '../../lib/formatar'

/** "Em que página você parou?": o jeito mais rápido de registrar a leitura do dia. */
export function RegistrarLeitura({ livro, hoje, onPronto }: { livro: Livro; hoje: DiaISO; onPronto: () => void }) {
  const [pagina, setPagina] = useState(String(livro.paginaAtual))
  const [resultado, setResultado] = useState<{ paginas: number; terminou: boolean } | null>(null)
  const novaPagina = Math.round(lerNumero(pagina) ?? livro.paginaAtual)
  const previa = calcularLeitura(livro, novaPagina)

  if (resultado) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-display text-2xl leading-tight font-medium tracking-tight">
          {resultado.terminou ? 'Livro terminado.' : `+${resultado.paginas} ${resultado.paginas === 1 ? 'página' : 'páginas'} hoje`}
        </p>
        <p className="text-sm text-tinta-suave">
          {resultado.terminou
            ? `Você leu “${livro.titulo}” até o fim. Ele foi para a lista de lidos.`
            : 'Registrado. Amanhã é só abrir de novo e dizer a página.'}
        </p>
        <SugestaoDeVoto area="leitura" hoje={hoje} />
        <Botao onClick={onPronto}>Fechar</Botao>
      </div>
    )
  }

  const somar = (n: number) => setPagina(String(Math.min(Math.max(novaPagina, livro.paginaAtual) + n, livro.totalPaginas)))

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="pagina-parou" className="text-sm text-tinta-suave">
        Em que página você parou? (estava na {livro.paginaAtual})
      </label>
      <input
        id="pagina-parou"
        value={pagina}
        onChange={(e) => setPagina(e.target.value)}
        inputMode="numeric"
        className="min-h-14 w-full rounded-xl border border-linha bg-cartao-2 px-4 text-center font-display text-3xl tabular-nums outline-none focus:border-linha-forte"
      />
      <div className="flex gap-1.5">
        {[5, 10, 20].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => somar(n)}
            className="min-h-11 flex-1 rounded-xl border border-linha text-sm text-tinta-suave hover:text-tinta active:scale-[0.97]"
          >
            +{n}
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-tinta-suave tabular-nums">
        {previa.paginas > 0 ? `${previa.paginas} ${previa.paginas === 1 ? 'página lida' : 'páginas lidas'}` : 'Nenhuma página nova'} de{' '}
        {livro.totalPaginas}
      </p>
      <Botao
        variante="primario"
        onClick={async () => {
          const r = await registrarLeitura(livro, novaPagina, hoje)
          setResultado({ paginas: r.paginas, terminou: r.terminou })
        }}
      >
        Salvar
      </Botao>
    </div>
  )
}
