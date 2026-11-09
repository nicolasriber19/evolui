import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { Cartao } from '../../components/Cartao'
import { Folha } from '../../components/Folha'
import { apagarTreino } from '../../db/acoesCorpo'
import type { Serie, Treino } from '../../db/tipos'
import { diaCurto } from '../../lib/datas'
import { formatarNumero } from '../../lib/formatar'
import { volume } from '../../lib/treino'

interface Props {
  treinos: Treino[]
  series: Serie[]
  nomes: Map<string, string>
}

const duracao = (t: Treino) => (t.concluidoEm ? Math.max(1, Math.round((t.concluidoEm - t.iniciadoEm) / 60_000)) : 0)

/** Lista dos treinos concluídos, do mais recente para o mais antigo. */
export function Historico({ treinos, series, nomes }: Props) {
  const [aberto, setAberto] = useState<Treino | null>(null)
  const [confirmar, setConfirmar] = useState(false)
  const concluidos = treinos.filter((t) => t.concluidoEm !== undefined).sort((a, b) => b.iniciadoEm - a.iniciadoEm)

  if (concluidos.length === 0) {
    return <p className="px-1 text-sm text-tinta-suave">Seus treinos concluídos aparecem aqui, com séries, carga e duração.</p>
  }

  const seriesDe = (t: Treino) => series.filter((s) => s.treinoId === t.id)

  return (
    <>
      <Cartao>
        <ul>
          {concluidos.map((t) => {
            const s = seriesDe(t)
            return (
              <li key={t.id} className="border-t border-linha first:border-t-0">
                <button
                  type="button"
                  onClick={() => {
                    setAberto(t)
                    setConfirmar(false)
                  }}
                  className="flex min-h-14 w-full items-center gap-3 py-2 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] leading-snug">{t.titulo}</span>
                    <span className="block text-xs text-tinta-suave tabular-nums">
                      {diaCurto(t.dia)} · {s.length} {s.length === 1 ? 'série' : 'séries'} · {formatarNumero(Math.round(volume(s)))} kg
                      de volume · {duracao(t)} min
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-tinta-suave" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      </Cartao>

      <Folha aberta={aberto !== null} onFechar={() => setAberto(null)} titulo={aberto?.titulo ?? 'Treino'}>
        {aberto && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-tinta-suave">
              {diaCurto(aberto.dia)} · {duracao(aberto)} min
            </p>
            <ul className="flex flex-col gap-2">
              {aberto.exercicioIds
                .map((id) => ({ id, feitas: seriesDe(aberto).filter((s) => s.exercicioId === id).sort((a, b) => a.ordem - b.ordem) }))
                .filter((e) => e.feitas.length > 0)
                .map((e) => (
                  <li key={e.id} className="rounded-xl bg-cartao-2 px-3 py-2">
                    <p className="text-sm font-medium">{nomes.get(e.id) ?? 'Exercício'}</p>
                    <p className="text-xs text-tinta-suave tabular-nums">
                      {e.feitas.map((s) => `${formatarNumero(s.cargaKg)} kg × ${s.repeticoes}`).join(' · ')}
                    </p>
                  </li>
                ))}
            </ul>
            {confirmar ? (
              <div role="alertdialog" aria-label="Apagar treino" className="flex gap-2">
                <Botao className="flex-1" onClick={() => setConfirmar(false)}>
                  Cancelar
                </Botao>
                <Botao
                  variante="perigo"
                  className="flex-1"
                  onClick={async () => {
                    await apagarTreino(aberto.id)
                    setAberto(null)
                  }}
                >
                  Apagar de vez
                </Botao>
              </div>
            ) : (
              <Botao variante="fantasma" onClick={() => setConfirmar(true)}>
                Apagar este treino
              </Botao>
            )}
          </div>
        )}
      </Folha>
    </>
  )
}
