import { Dumbbell, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { Cartao } from '../../components/Cartao'
import { Folha } from '../../components/Folha'
import { SugestaoDeVoto } from '../../components/SugestaoDeVoto'
import { comecarTreino, usarModelosSugeridos } from '../../db/acoesCorpo'
import type { DiaISO, ModeloTreino, Serie, Treino } from '../../db/tipos'
import { diasDaSemana } from '../../lib/datas'
import { formatarNumero } from '../../lib/formatar'
import { proximoModelo, volume } from '../../lib/treino'
import { EditorModelos } from './EditorModelos'

interface Props {
  modelos: ModeloTreino[]
  treinos: Treino[]
  series: Serie[]
  nomes: Map<string, string>
  hoje: DiaISO
}

/** Antes de treinar: sugere o próximo modelo da rotação (A, B, C...). */
export function InicioTreino({ modelos, treinos, series, nomes, hoje }: Props) {
  const [editando, setEditando] = useState(false)
  const concluidos = treinos.filter((t) => t.concluidoEm !== undefined)
  const semana = new Set(diasDaSemana(hoje))
  const naSemana = concluidos.filter((t) => semana.has(t.dia)).length
  const deHoje = new Set(concluidos.filter((t) => t.dia === hoje).map((t) => t.id))
  const treinouHoje = deHoje.size > 0
  const seriesHoje = series.filter((s) => deHoje.has(s.treinoId))
  const proximo = proximoModelo(modelos, treinos)

  if (modelos.length === 0) {
    return (
      <Cartao>
        <div className="flex gap-3">
          <Dumbbell className="mt-0.5 size-5 shrink-0 text-tinta-suave" aria-hidden="true" />
          <div>
            <p className="text-[15px] font-medium">Monte seus treinos uma vez só</p>
            <p className="mt-1 text-sm text-tinta-suave">
              Os modelos A, B e C sugeridos são para ganhar massa treinando de segunda a sexta, em rotação. Dá para
              editar tudo depois. Vale mostrar para o professor da academia.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Botao variante="primario" onClick={() => void usarModelosSugeridos()}>
            Usar os modelos A, B e C
          </Botao>
          <Botao onClick={() => void comecarTreino(null, hoje)}>Fazer um treino livre</Botao>
        </div>
      </Cartao>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {treinouHoje && (
        <>
          <p className="entra rounded-2xl border border-linha bg-cartao px-4 py-3 text-sm">Treino de hoje feito: {seriesHoje.length} {seriesHoje.length === 1 ? 'série' : 'séries'} e{' '}
            {formatarNumero(Math.round(volume(seriesHoje)))} kg de volume. Descanso também faz o músculo crescer.</p>
          <SugestaoDeVoto area="corpo" hoje={hoje} />
        </>
      )}

      {proximo && (
        <Cartao titulo={treinouHoje ? 'Próximo treino' : 'Treino de hoje'}>
          <p className="font-display text-2xl leading-tight font-medium tracking-tight">
            Treino {proximo.nome}
            <span className="block text-base font-normal tracking-normal text-tinta-suave">{proximo.titulo}</span>
          </p>
          <ul className="mt-3 text-sm text-tinta-suave">
            {proximo.itens.map((i) => (
              <li key={i.exercicioId} className="flex justify-between gap-3 py-0.5">
                <span>{nomes.get(i.exercicioId) ?? 'Exercício'}</span>
                <span className="shrink-0 tabular-nums">
                  {i.series} × {i.repeticoes}
                </span>
              </li>
            ))}
          </ul>
          <Botao variante="primario" className="mt-4 w-full" onClick={() => void comecarTreino(proximo, hoje)}>
            Começar treino {proximo.nome}
          </Botao>
        </Cartao>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-tinta-suave">Ou:</span>
        {modelos
          .filter((m) => m.id !== proximo?.id)
          .map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => void comecarTreino(m, hoje)}
              className="min-h-11 rounded-xl border border-linha px-3 text-sm text-tinta-suave hover:text-tinta active:scale-[0.97]"
            >
              Treino {m.nome}
            </button>
          ))}
        <button
          type="button"
          onClick={() => void comecarTreino(null, hoje)}
          className="min-h-11 rounded-xl border border-linha px-3 text-sm text-tinta-suave hover:text-tinta active:scale-[0.97]"
        >
          Livre
        </button>
      </div>

      <div className="flex items-center justify-between px-1 pt-1 text-sm text-tinta-suave">
        <span>
          <span className="font-medium text-tinta tabular-nums">{naSemana}</span> {naSemana === 1 ? 'treino' : 'treinos'} esta semana
        </span>
        <button type="button" onClick={() => setEditando(true)} className="-mr-2 flex min-h-11 items-center gap-1.5 px-2 hover:text-tinta">
          <Pencil className="size-3.5" aria-hidden="true" /> Editar modelos
        </button>
      </div>

      <Folha aberta={editando} onFechar={() => setEditando(false)} titulo="Modelos de treino">
        <EditorModelos modelos={modelos} nomes={nomes} />
      </Folha>
    </div>
  )
}
