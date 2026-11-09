import { ChevronLeft, Quote, StickyNote, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Botao } from '../../components/Botao'
import { CampoNumero } from '../../components/CampoNumero'
import { Cartao } from '../../components/Cartao'
import { CLASSE_CAMPO, CLASSE_ROTULO } from '../../components/estilos'
import { Folha } from '../../components/Folha'
import { apagarLivro, apagarNota, editarLivro, mudarStatus, salvarNota } from '../../db/acoesLeitura'
import { useAgora, useLeituras, useLivros, useNotasLivro } from '../../db/hooks'
import type { Config, Livro, NotaLivro } from '../../db/tipos'
import { diaCurto, diaLogico } from '../../lib/datas'
import { lerNumero } from '../../lib/formatar'
import { progresso } from '../../lib/leitura'
import { STATUS } from './FormLivro'
import { RegistrarLeitura } from './RegistrarLeitura'

/** Um livro: progresso, status, histórico de leitura, notas e trechos marcantes. */
export function LivroDetalhe({ config }: { config: Config }) {
  const { id = '' } = useParams()
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const livros = useLivros()
  const leituras = useLeituras()
  const notas = useNotasLivro(id)
  const navegar = useNavigate()
  const [registrando, setRegistrando] = useState(false)
  const [confirmarApagar, setConfirmarApagar] = useState(false)

  if (!livros || !leituras || !notas) return null
  const livro = livros.find((l) => l.id === id)
  if (!livro) {
    return (
      <div className="flex flex-col gap-3">
        <Voltar />
        <p className="text-sm text-tinta-suave">Esse livro não existe mais.</p>
      </div>
    )
  }

  const historico = leituras.filter((l) => l.livroId === id).sort((a, b) => b.dia.localeCompare(a.dia) || b.criadoEm - a.criadoEm)
  const p = progresso(livro)

  return (
    <div className="flex flex-col gap-4">
      <header>
        <Voltar />
        <h1 className="font-display text-[1.75rem] leading-tight font-medium tracking-tight">{livro.titulo}</h1>
        {livro.autor && <p className="mt-0.5 text-sm text-tinta-suave">{livro.autor}</p>}
      </header>

      <Cartao>
        <div className="h-2 rounded-r-[4px] bg-cartao-2" aria-hidden="true">
          <div className="h-full rounded-r-[4px] bg-grafico" style={{ width: `${p * 100}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-tinta-suave tabular-nums">
          página {livro.paginaAtual} de {livro.totalPaginas} · {Math.round(p * 100)}%
          {livro.terminouEm && livro.status === 'lido' && ` · terminado em ${diaCurto(livro.terminouEm)}`}
        </p>
        <div className="mt-3 flex gap-1.5" role="group" aria-label="Status do livro">
          {STATUS.map((s) => (
            <button
              key={s.valor}
              type="button"
              aria-pressed={livro.status === s.valor}
              onClick={() => void mudarStatus(livro, s.valor, hoje)}
              className={`min-h-11 flex-1 rounded-xl text-sm transition-colors duration-150 ${
                livro.status === s.valor ? 'bg-cartao-2 text-tinta ring-1 ring-linha-forte' : 'border border-linha text-tinta-suave'
              }`}
            >
              {s.rotulo}
            </button>
          ))}
        </div>
        {livro.status !== 'lido' && (
          <Botao variante="primario" className="mt-3 w-full" onClick={() => setRegistrando(true)}>
            Registrar leitura
          </Botao>
        )}
      </Cartao>

      <Notas livro={livro} notas={notas} />

      {historico.length > 0 && (
        <Cartao titulo="Leituras">
          <ul>
            {historico.slice(0, 20).map((l) => (
              <li key={l.id} className="flex justify-between border-t border-linha py-2 text-sm first:border-t-0 first:pt-0">
                <span className="text-tinta-suave">{diaCurto(l.dia)}</span>
                <span className="tabular-nums">
                  {l.paginas} {l.paginas === 1 ? 'página' : 'páginas'} <span className="text-tinta-suave">· até a {l.ateAPagina}</span>
                </span>
              </li>
            ))}
          </ul>
        </Cartao>
      )}

      <Cartao titulo="Dados do livro">
        <div className="flex flex-col gap-3">
          <label>
            <span className={CLASSE_ROTULO}>Título</span>
            <input
              key={livro.titulo}
              defaultValue={livro.titulo}
              onBlur={(e) => {
                const t = e.target.value.trim()
                if (t && t !== livro.titulo) void editarLivro(livro.id, { titulo: t })
              }}
              maxLength={120}
              className={CLASSE_CAMPO}
            />
          </label>
          <div className="grid grid-cols-[1fr_7rem] gap-2">
            <label>
              <span className={CLASSE_ROTULO}>Autor</span>
              <input
                key={livro.autor}
                defaultValue={livro.autor}
                onBlur={(e) => {
                  const a = e.target.value.trim()
                  if (a !== livro.autor) void editarLivro(livro.id, { autor: a })
                }}
                maxLength={80}
                className={CLASSE_CAMPO}
              />
            </label>
            <CampoNumero
              key={livro.totalPaginas}
              rotulo="Páginas"
              unidade="pág."
              valor={livro.totalPaginas}
              onSalvar={(v) => {
                if (v && v >= 1) void editarLivro(livro.id, { totalPaginas: Math.round(v) })
              }}
            />
          </div>
          {confirmarApagar ? (
            <div className="flex gap-2">
              <Botao className="flex-1" onClick={() => setConfirmarApagar(false)}>
                Cancelar
              </Botao>
              <Botao
                variante="perigo"
                className="flex-1"
                onClick={async () => {
                  await apagarLivro(livro.id)
                  void navegar('/areas/leitura')
                }}
              >
                Apagar de vez
              </Botao>
            </div>
          ) : (
            <Botao variante="fantasma" onClick={() => setConfirmarApagar(true)}>
              Apagar este livro
            </Botao>
          )}
        </div>
      </Cartao>

      <Folha aberta={registrando} onFechar={() => setRegistrando(false)} titulo={livro.titulo}>
        {registrando && <RegistrarLeitura livro={livro} hoje={hoje} onPronto={() => setRegistrando(false)} />}
      </Folha>
    </div>
  )
}

function Voltar() {
  return (
    <Link to="/areas/leitura" className="-ml-2 inline-flex min-h-11 items-center gap-0.5 pr-3 text-sm text-tinta-suave hover:text-tinta">
      <ChevronLeft className="size-4" aria-hidden="true" /> Leitura
    </Link>
  )
}

function Notas({ livro, notas }: { livro: Livro; notas: NotaLivro[] }) {
  const [tipo, setTipo] = useState<NotaLivro['tipo']>('trecho')
  const [texto, setTexto] = useState('')
  const [pagina, setPagina] = useState('')
  const ordenadas = [...notas].sort((a, b) => b.criadoEm - a.criadoEm)

  return (
    <Cartao titulo="Notas e trechos marcantes">
      {ordenadas.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {ordenadas.map((n) => (
            <li key={n.id} className="entra flex gap-2 rounded-xl bg-cartao-2 py-2 pl-3">
              {n.tipo === 'trecho' ? (
                <Quote className="mt-0.5 size-4 shrink-0 text-tinta-suave" aria-label="Trecho" />
              ) : (
                <StickyNote className="mt-0.5 size-4 shrink-0 text-tinta-suave" aria-label="Nota" />
              )}
              <p className={`flex-1 text-sm whitespace-pre-line ${n.tipo === 'trecho' ? 'font-display tracking-tight' : ''}`}>
                {n.texto}
                {n.pagina !== undefined && <span className="mt-1 block text-xs text-tinta-suave">página {n.pagina}</span>}
              </p>
              <button
                type="button"
                aria-label="Apagar esta nota"
                onClick={() => void apagarNota(n.id)}
                className="grid size-11 shrink-0 place-items-center text-tinta-suave hover:text-tinta"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!texto.trim()) return
          const p = lerNumero(pagina)
          void salvarNota({ livroId: livro.id, tipo, texto: texto.trim(), pagina: p === null ? undefined : Math.round(p) })
          setTexto('')
          setPagina('')
        }}
      >
        <div className="flex gap-1.5">
          {(['trecho', 'nota'] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tipo === t}
              onClick={() => setTipo(t)}
              className={`min-h-10 flex-1 rounded-xl text-sm transition-colors duration-150 ${
                tipo === t ? 'bg-cartao-2 text-tinta ring-1 ring-linha-forte' : 'border border-linha text-tinta-suave'
              }`}
            >
              {t === 'trecho' ? 'Trecho do livro' : 'Minha nota'}
            </button>
          ))}
        </div>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder={tipo === 'trecho' ? 'Copie a frase que marcou você' : 'O que você pensou ou aprendeu'}
          aria-label={tipo === 'trecho' ? 'Trecho do livro' : 'Sua nota'}
          maxLength={1000}
          className={`${CLASSE_CAMPO} py-2.5`}
        />
        <div className="flex gap-2">
          <input
            value={pagina}
            onChange={(e) => setPagina(e.target.value)}
            inputMode="numeric"
            placeholder="Página (opcional)"
            aria-label="Página da nota"
            className={CLASSE_CAMPO}
          />
          <Botao type="submit" variante="primario" className="shrink-0">
            Guardar
          </Botao>
        </div>
      </form>
    </Cartao>
  )
}
