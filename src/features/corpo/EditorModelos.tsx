import { ArrowDown, ArrowUp, ChevronRight, Plus, X } from 'lucide-react'
import { useId, useState } from 'react'
import { Botao } from '../../components/Botao'
import { CLASSE_CAMPO, CLASSE_ROTULO } from '../../components/estilos'
import { apagarModelo, exercicioPorNome, salvarModelo } from '../../db/acoesCorpo'
import type { ModeloTreino } from '../../db/tipos'
import { novoId } from '../../lib/id'

interface Props {
  modelos: ModeloTreino[]
  nomes: Map<string, string>
}

/** Lista de modelos (A, B, C...) e o formulário para editar um deles. */
export function EditorModelos({ modelos, nomes }: Props) {
  const [editando, setEditando] = useState<ModeloTreino | 'novo' | null>(null)

  if (editando !== null) {
    return (
      <FormularioModelo
        key={editando === 'novo' ? 'novo' : editando.id}
        modelo={editando === 'novo' ? undefined : editando}
        nomes={nomes}
        sugestaoNome={String.fromCharCode(65 + modelos.length)}
        onPronto={() => setEditando(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <ul>
        {modelos.map((m) => (
          <li key={m.id} className="border-t border-linha first:border-t-0">
            <button type="button" onClick={() => setEditando(m)} className="flex min-h-14 w-full items-center gap-3 py-2 text-left">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-cartao-2 font-display font-medium">{m.nome}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px]">{m.titulo || `Treino ${m.nome}`}</span>
                <span className="block text-xs text-tinta-suave">{m.itens.length} exercícios</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-tinta-suave" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <Botao onClick={() => setEditando('novo')}>
        <Plus className="size-4" aria-hidden="true" /> Novo modelo
      </Botao>
    </div>
  )
}

interface Linha {
  chave: string
  nome: string
  series: string
  repeticoes: string
}

function FormularioModelo({
  modelo,
  nomes,
  sugestaoNome,
  onPronto,
}: {
  modelo?: ModeloTreino
  nomes: Map<string, string>
  sugestaoNome: string
  onPronto: () => void
}) {
  const idLista = useId()
  const [nome, setNome] = useState(modelo?.nome ?? sugestaoNome)
  const [titulo, setTitulo] = useState(modelo?.titulo ?? '')
  const [linhas, setLinhas] = useState<Linha[]>(
    () =>
      modelo?.itens.map((i) => ({
        chave: novoId(),
        nome: nomes.get(i.exercicioId) ?? '',
        series: String(i.series),
        repeticoes: i.repeticoes,
      })) ?? [{ chave: novoId(), nome: '', series: '3', repeticoes: '10' }],
  )
  const [erro, setErro] = useState('')
  const [confirmarApagar, setConfirmarApagar] = useState(false)

  const mudar = (chave: string, campo: keyof Linha, valor: string) =>
    setLinhas((ls) => ls.map((l) => (l.chave === chave ? { ...l, [campo]: valor } : l)))
  const mover = (i: number, d: -1 | 1) =>
    setLinhas((ls) => {
      const nova = [...ls]
      const j = i + d
      if (j < 0 || j >= nova.length) return ls
      ;[nova[i], nova[j]] = [nova[j], nova[i]]
      return nova
    })

  async function salvar() {
    const validas = linhas.filter((l) => l.nome.trim())
    if (!nome.trim()) return setErro('Dê um nome curto ao modelo, como A ou B.')
    if (validas.length === 0) return setErro('Coloque pelo menos um exercício.')
    const itens = []
    for (const l of validas) {
      itens.push({
        exercicioId: await exercicioPorNome(l.nome),
        series: Math.max(1, Math.round(Number(l.series) || 3)),
        repeticoes: l.repeticoes.trim() || '10',
      })
    }
    await salvarModelo({ nome: nome.trim(), titulo: titulo.trim(), itens }, modelo?.id)
    onPronto()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[5rem_1fr] gap-2">
        <label>
          <span className={CLASSE_ROTULO}>Nome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={4} className={CLASSE_CAMPO} />
        </label>
        <label>
          <span className={CLASSE_ROTULO}>Músculos</span>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Peito, ombro e tríceps"
            maxLength={40}
            className={CLASSE_CAMPO}
          />
        </label>
      </div>

      <div>
        <span className={CLASSE_ROTULO}>Exercícios (séries × repetições)</span>
        <datalist id={idLista}>
          {[...new Set(nomes.values())].map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <ul className="flex flex-col gap-2">
          {linhas.map((l, i) => (
            <li key={l.chave} className="rounded-xl border border-linha p-2">
              <div className="flex gap-1">
                <input
                  value={l.nome}
                  onChange={(e) => mudar(l.chave, 'nome', e.target.value)}
                  list={idLista}
                  placeholder="Supino reto com barra"
                  aria-label={`Exercício ${i + 1}`}
                  maxLength={60}
                  className={CLASSE_CAMPO}
                />
                <button
                  type="button"
                  aria-label={`Tirar exercício ${i + 1}`}
                  onClick={() => setLinhas((ls) => ls.filter((x) => x.chave !== l.chave))}
                  className="grid size-11 shrink-0 place-items-center text-tinta-suave hover:text-tinta"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <input
                  value={l.series}
                  onChange={(e) => mudar(l.chave, 'series', e.target.value)}
                  inputMode="numeric"
                  aria-label={`Séries do exercício ${i + 1}`}
                  className={`${CLASSE_CAMPO} w-16 text-center`}
                />
                <span className="text-tinta-suave" aria-hidden="true">
                  ×
                </span>
                <input
                  value={l.repeticoes}
                  onChange={(e) => mudar(l.chave, 'repeticoes', e.target.value)}
                  aria-label={`Repetições do exercício ${i + 1}`}
                  placeholder="8-10"
                  maxLength={12}
                  className={`${CLASSE_CAMPO} w-24 text-center`}
                />
                <span className="flex-1" />
                <button
                  type="button"
                  aria-label={`Subir exercício ${i + 1}`}
                  onClick={() => mover(i, -1)}
                  className="grid size-11 place-items-center text-tinta-suave hover:text-tinta"
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={`Descer exercício ${i + 1}`}
                  onClick={() => mover(i, 1)}
                  className="grid size-11 place-items-center text-tinta-suave hover:text-tinta"
                >
                  <ArrowDown className="size-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setLinhas((ls) => [...ls, { chave: novoId(), nome: '', series: '3', repeticoes: '10' }])}
          className="mt-1 min-h-11 px-1 text-sm text-tinta-suave hover:text-tinta"
        >
          + Exercício
        </button>
      </div>

      {erro && (
        <p role="alert" className="text-sm text-perigo">
          {erro}
        </p>
      )}
      <div className="flex gap-2">
        <Botao className="flex-1" onClick={onPronto}>
          Voltar
        </Botao>
        <Botao variante="primario" className="flex-1" onClick={() => void salvar()}>
          Salvar modelo
        </Botao>
      </div>
      {modelo &&
        (confirmarApagar ? (
          <Botao
            variante="perigo"
            onClick={async () => {
              await apagarModelo(modelo.id)
              onPronto()
            }}
          >
            Confirmar: apagar o modelo {modelo.nome}
          </Botao>
        ) : (
          <Botao variante="fantasma" onClick={() => setConfirmarApagar(true)}>
            Apagar este modelo
          </Botao>
        ))}
    </div>
  )
}
