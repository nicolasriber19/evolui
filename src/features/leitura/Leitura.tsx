import { ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Botao } from '../../components/Botao'
import { CabecalhoArea } from '../../components/CabecalhoArea'
import { Cartao } from '../../components/Cartao'
import { Folha } from '../../components/Folha'
import { ColunasSemana } from '../../components/Graficos'
import { useAgora, useLeituras, useLivros } from '../../db/hooks'
import type { Config, Livro } from '../../db/tipos'
import { diaLogico, diasDaSemana } from '../../lib/datas'
import { paginasPorDia, progresso } from '../../lib/leitura'
import { FormLivro } from './FormLivro'
import { RegistrarLeitura } from './RegistrarLeitura'

const NOMES_DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']

/** Área Leitura: os livros, as páginas da semana e o registro do dia. */
export function Leitura({ config }: { config: Config }) {
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const livros = useLivros()
  const leituras = useLeituras()
  const [adicionando, setAdicionando] = useState<false | 'vazio' | 'sugestao'>(false)
  const [registrando, setRegistrando] = useState<Livro | null>(null)

  if (!livros || !leituras) return null

  const lendo = livros.filter((l) => l.status === 'lendo')
  const quero = livros.filter((l) => l.status === 'quero')
  const lidos = livros.filter((l) => l.status === 'lido').sort((a, b) => (b.terminouEm ?? '').localeCompare(a.terminouEm ?? ''))
  const dias = diasDaSemana(hoje)
  const porDia = paginasPorDia(leituras, dias)
  const totalSemana = porDia.reduce((a, b) => a + b, 0)
  const formatarPaginas = (n: number) => `${n} pág.`

  return (
    <div className="flex flex-col gap-4">
      <CabecalhoArea area="leitura" />

      {livros.length === 0 ? (
        <Cartao>
          <p className="text-[15px] font-medium">Nenhum livro ainda</p>
          <p className="mt-1 text-sm text-tinta-suave">
            Sugestão para começar: “Hábitos Atômicos”, de James Clear. É de lá que vem a ideia de cada hábito ser um voto em
            quem você quer ser.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Botao variante="primario" onClick={() => setAdicionando('sugestao')}>
              Adicionar Hábitos Atômicos
            </Botao>
            <Botao onClick={() => setAdicionando('vazio')}>Adicionar outro livro</Botao>
          </div>
        </Cartao>
      ) : (
        <>
          <Cartao titulo="Esta semana">
            <p className="font-display text-4xl leading-none font-medium tracking-tight tabular-nums">
              {totalSemana} <span className="text-xl">{totalSemana === 1 ? 'página' : 'páginas'}</span>
            </p>
            {totalSemana > 0 && (
              <div className="mt-4">
                <ColunasSemana
                  valores={porDia}
                  rotulos={NOMES_DIAS}
                  indiceHoje={dias.indexOf(hoje)}
                  formatar={formatarPaginas}
                  descricao="Páginas lidas por dia nesta semana"
                />
              </div>
            )}
          </Cartao>

          {lendo.map((l) => (
            <CartaoLendo key={l.id} livro={l} onRegistrar={() => setRegistrando(l)} />
          ))}

          {quero.length > 0 && <ListaLivros titulo="Quero ler" livros={quero} />}
          {lidos.length > 0 && <ListaLivros titulo={`Lidos (${lidos.length})`} livros={lidos} />}

          <Botao onClick={() => setAdicionando('vazio')}>
            <Plus className="size-4" aria-hidden="true" /> Adicionar livro
          </Botao>
        </>
      )}

      <Folha aberta={adicionando !== false} onFechar={() => setAdicionando(false)} titulo="Adicionar livro">
        <FormLivro
          key={String(adicionando)}
          hoje={hoje}
          inicial={adicionando === 'sugestao' ? { titulo: 'Hábitos Atômicos', autor: 'James Clear', status: 'lendo' } : undefined}
          onPronto={() => setAdicionando(false)}
        />
      </Folha>
      <Folha aberta={registrando !== null} onFechar={() => setRegistrando(null)} titulo={registrando?.titulo ?? 'Leitura'}>
        {registrando && <RegistrarLeitura key={registrando.id} livro={registrando} hoje={hoje} onPronto={() => setRegistrando(null)} />}
      </Folha>
    </div>
  )
}

function CartaoLendo({ livro, onRegistrar }: { livro: Livro; onRegistrar: () => void }) {
  const p = progresso(livro)
  return (
    <Cartao>
      <Link to={`/areas/leitura/${livro.id}`} className="flex items-start gap-2">
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-tinta-suave">Lendo</span>
          <span className="mt-0.5 block font-display text-xl leading-tight font-medium tracking-tight">{livro.titulo}</span>
          {livro.autor && <span className="block text-sm text-tinta-suave">{livro.autor}</span>}
        </span>
        <ChevronRight className="mt-5 size-4 shrink-0 text-tinta-suave" aria-hidden="true" />
      </Link>
      <div className="mt-3 h-2 rounded-r-[4px] bg-cartao-2" aria-hidden="true">
        <div className="h-full rounded-r-[4px] bg-grafico" style={{ width: `${p * 100}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-tinta-suave tabular-nums">
        página {livro.paginaAtual} de {livro.totalPaginas} · {Math.round(p * 100)}%
      </p>
      <Botao variante="primario" className="mt-3 w-full" onClick={onRegistrar}>
        Registrar leitura
      </Botao>
    </Cartao>
  )
}

function ListaLivros({ titulo, livros }: { titulo: string; livros: Livro[] }) {
  return (
    <Cartao titulo={titulo}>
      <ul>
        {livros.map((l) => (
          <li key={l.id} className="border-t border-linha first:border-t-0">
            <Link to={`/areas/leitura/${l.id}`} className="flex min-h-12 items-center gap-3 py-2">
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-snug">{l.titulo}</span>
                {l.autor && <span className="block text-xs text-tinta-suave">{l.autor}</span>}
              </span>
              <ChevronRight className="size-4 shrink-0 text-tinta-suave" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </Cartao>
  )
}
