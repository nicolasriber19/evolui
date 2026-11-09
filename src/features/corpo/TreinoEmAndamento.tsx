import { Check, Plus, X } from 'lucide-react'
import { useId, useState } from 'react'
import { Botao } from '../../components/Botao'
import { Cartao } from '../../components/Cartao'
import { CLASSE_CAMPO } from '../../components/estilos'
import {
  adicionarExercicioAoTreino,
  apagarTreino,
  concluirTreino,
  desmarcarSerie,
  marcarSerie,
  removerExercicioDoTreino,
} from '../../db/acoesCorpo'
import { useAgora } from '../../db/hooks'
import type { Exercicio, ItemModelo, ModeloTreino, Serie, Treino } from '../../db/tipos'
import { formatarNumero, lerNumero, numeroParaCampo } from '../../lib/formatar'
import { repeticoesSugeridas, ultimaVez } from '../../lib/treino'

interface Props {
  treino: Treino
  modelos: ModeloTreino[]
  series: Serie[]
  nomes: Map<string, string>
  exercicios: Exercicio[]
}

/** O treino acontecendo agora: cada série marcada é gravada na hora (fechar o app não perde nada). */
export function TreinoEmAndamento({ treino, modelos, series, nomes, exercicios }: Props) {
  const agora = useAgora(30_000)
  const modelo = modelos.find((m) => m.id === treino.modeloId)
  const doTreino = series.filter((s) => s.treinoId === treino.id)
  const [extras, setExtras] = useState<Record<string, number>>({})
  const [novoExercicio, setNovoExercicio] = useState('')
  const [confirmarDescartar, setConfirmarDescartar] = useState(false)
  const [aviso, setAviso] = useState('')
  const idLista = useId()
  const minutos = Math.max(0, Math.round((agora.getTime() - treino.iniciadoEm) / 60_000))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h2 className="font-display text-xl leading-tight font-medium tracking-tight">{treino.titulo}</h2>
        <span className="shrink-0 text-xs text-tinta-suave tabular-nums">{minutos} min</span>
      </div>

      {treino.exercicioIds.length === 0 && (
        <p className="px-1 text-sm text-tinta-suave">Adicione o primeiro exercício logo abaixo.</p>
      )}

      {treino.exercicioIds.map((exercicioId) => (
        <ExercicioDoTreino
          key={exercicioId}
          treino={treino}
          exercicioId={exercicioId}
          nome={nomes.get(exercicioId) ?? 'Exercício'}
          alvo={modelo?.itens.find((i) => i.exercicioId === exercicioId)}
          feitas={doTreino.filter((s) => s.exercicioId === exercicioId)}
          anteriores={ultimaVez(series, exercicioId, treino.id)}
          extra={extras[exercicioId] ?? 0}
          onMaisSerie={() => setExtras((e) => ({ ...e, [exercicioId]: (e[exercicioId] ?? 0) + 1 }))}
          onRemover={() => void removerExercicioDoTreino(treino, exercicioId)}
        />
      ))}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!novoExercicio.trim()) return
          void adicionarExercicioAoTreino(treino, novoExercicio)
          setNovoExercicio('')
        }}
      >
        <input
          value={novoExercicio}
          onChange={(e) => setNovoExercicio(e.target.value)}
          list={idLista}
          placeholder="Adicionar exercício"
          aria-label="Nome do exercício para adicionar"
          maxLength={60}
          className={CLASSE_CAMPO}
        />
        <datalist id={idLista}>
          {exercicios.map((e) => (
            <option key={e.id} value={e.nome} />
          ))}
        </datalist>
        <button
          type="submit"
          aria-label="Adicionar exercício"
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-cartao-2 text-tinta active:scale-[0.94]"
        >
          <Plus className="size-5" aria-hidden="true" />
        </button>
      </form>

      {aviso && (
        <p role="alert" className="px-1 text-sm text-perigo">
          {aviso}
        </p>
      )}

      {confirmarDescartar ? (
        <div role="alertdialog" aria-label="Descartar treino" className="entra rounded-2xl border border-linha bg-cartao p-3">
          <p className="text-sm">Descartar este treino? As séries marcadas nele serão apagadas.</p>
          <div className="mt-3 flex gap-2">
            <Botao className="flex-1" onClick={() => setConfirmarDescartar(false)}>
              Voltar
            </Botao>
            <Botao variante="perigo" className="flex-1" onClick={() => void apagarTreino(treino.id)}>
              Descartar
            </Botao>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1 pt-1">
          <Botao
            variante="primario"
            onClick={() => {
              if (doTreino.length === 0) {
                setAviso('Marque pelo menos uma série feita, ou descarte o treino.')
                return
              }
              void concluirTreino(treino.id)
            }}
          >
            Concluir treino ({doTreino.length} {doTreino.length === 1 ? 'série' : 'séries'})
          </Botao>
          <Botao variante="fantasma" onClick={() => setConfirmarDescartar(true)}>
            Descartar treino
          </Botao>
        </div>
      )}
    </div>
  )
}

interface PropsExercicio {
  treino: Treino
  exercicioId: string
  nome: string
  alvo?: ItemModelo
  feitas: Serie[]
  anteriores: Serie[]
  extra: number
  onMaisSerie: () => void
  onRemover: () => void
}

function ExercicioDoTreino({ treino, exercicioId, nome, alvo, feitas, anteriores, extra, onMaisSerie, onRemover }: PropsExercicio) {
  const maiorOrdemFeita = feitas.reduce((m, s) => Math.max(m, s.ordem + 1), 0)
  const planejadas = Math.max(alvo?.series ?? 3, maiorOrdemFeita) + extra
  const repsAlvo = repeticoesSugeridas(alvo?.repeticoes ?? '10')

  return (
    <Cartao>
      <div className="-mt-1 flex items-start gap-2">
        <div className="min-w-0 flex-1 pt-1">
          <h3 className="text-[15px] leading-snug font-medium">{nome}</h3>
          <p className="mt-0.5 text-xs text-tinta-suave">
            {anteriores.length > 0
              ? `Última vez: ${anteriores.map((s) => `${formatarNumero(s.cargaKg)}×${s.repeticoes}`).join(' · ')} (kg×rep)`
              : alvo
                ? `Meta: ${alvo.series} séries de ${alvo.repeticoes}. Primeira vez: comece leve.`
                : 'Primeira vez: comece leve.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemover}
          aria-label={`Tirar ${nome} deste treino`}
          className="-mr-2 grid size-11 shrink-0 place-items-center text-tinta-suave hover:text-tinta"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {Array.from({ length: planejadas }, (_, ordem) => (
          <LinhaSerie
            key={ordem}
            treino={treino}
            exercicioId={exercicioId}
            nome={nome}
            ordem={ordem}
            feita={feitas.find((s) => s.ordem === ordem)}
            cargaSugerida={(anteriores[ordem] ?? anteriores[anteriores.length - 1])?.cargaKg}
            repsSugeridas={anteriores[ordem]?.repeticoes ?? repsAlvo}
          />
        ))}
      </ul>
      <button type="button" onClick={onMaisSerie} className="mt-1 min-h-11 px-1 text-sm text-tinta-suave hover:text-tinta">
        + Série
      </button>
    </Cartao>
  )
}

interface PropsLinha {
  treino: Treino
  exercicioId: string
  nome: string
  ordem: number
  feita?: Serie
  cargaSugerida?: number
  repsSugeridas: number
}

function LinhaSerie({ treino, exercicioId, nome, ordem, feita, cargaSugerida, repsSugeridas }: PropsLinha) {
  const [carga, setCarga] = useState(() => numeroParaCampo(feita?.cargaKg ?? cargaSugerida))
  const [reps, setReps] = useState(() => String(feita?.repeticoes ?? repsSugeridas))
  const numero = ordem + 1

  async function alternar() {
    if (feita) {
      await desmarcarSerie(feita.id)
      return
    }
    const r = Math.round(lerNumero(reps) ?? 0)
    if (r <= 0) return
    await marcarSerie(treino, exercicioId, ordem, lerNumero(carga) ?? 0, r)
    navigator.vibrate?.(10)
  }

  const caixa = `flex min-h-11 items-center gap-1 rounded-xl px-2.5 ${feita ? 'bg-transparent ring-1 ring-linha ring-inset' : 'bg-cartao-2'}`

  return (
    <li className="flex items-center gap-2">
      <span className="w-4 shrink-0 text-xs text-tinta-suave tabular-nums">{numero}</span>
      <label className={`${caixa} flex-1`}>
        <input
          value={carga}
          onChange={(e) => setCarga(e.target.value)}
          readOnly={!!feita}
          inputMode="decimal"
          placeholder="0"
          aria-label={`Carga da série ${numero} de ${nome}, em quilos`}
          className="w-full min-w-0 bg-transparent text-base tabular-nums outline-none"
        />
        <span className="text-xs text-tinta-suave">kg</span>
      </label>
      <span className="text-sm text-tinta-suave" aria-hidden="true">
        ×
      </span>
      <label className={`${caixa} w-[5.5rem]`}>
        <input
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          readOnly={!!feita}
          inputMode="numeric"
          aria-label={`Repetições da série ${numero} de ${nome}`}
          className="w-full min-w-0 bg-transparent text-base tabular-nums outline-none"
        />
        <span className="text-xs text-tinta-suave">rep</span>
      </label>
      <button
        type="button"
        onClick={() => void alternar()}
        aria-pressed={!!feita}
        aria-label={feita ? `Desfazer série ${numero} de ${nome}` : `Marcar série ${numero} de ${nome} como feita`}
        className={`grid size-11 shrink-0 place-items-center rounded-xl border-[1.5px] transition-[transform,background-color,border-color,color] duration-150 ease-saida active:scale-[0.9] ${
          feita ? 'border-destaque bg-destaque text-destaque-tinta' : 'border-tinta-suave/60 text-transparent'
        }`}
      >
        <Check className="size-5" strokeWidth={2.75} aria-hidden="true" />
      </button>
    </li>
  )
}
