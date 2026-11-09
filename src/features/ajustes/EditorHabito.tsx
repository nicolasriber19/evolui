import { Pause, Play, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { CamposHabito, problemaNoHabito, type ValoresHabito } from '../../components/CamposHabito'
import { CLASSE_ROTULO } from '../../components/estilos'
import { IconeArea } from '../../components/IconeArea'
import { apagarHabito, criarHabito, editarHabito, pausarHabito, retomarHabito } from '../../db/acoes'
import type { Area, AreaId, DiaISO, Habito } from '../../db/tipos'
import { INFO_AREAS } from '../../lib/areas'

interface Props {
  habito?: Habito
  areas: Area[]
  habitos: Habito[]
  hoje: DiaISO
  onPronto: () => void
}

/** Criar ou editar um hábito (abre dentro de uma Folha). */
export function EditorHabito({ habito, areas, habitos, hoje, onPronto }: Props) {
  const opcoes = areas.filter((a) => a.ativa || a.id === habito?.areaId)
  const [valores, setValores] = useState<ValoresHabito>(() =>
    habito
      ? { nome: habito.nome, versaoMinima: habito.versaoMinima, dias: habito.dias }
      : { nome: '', versaoMinima: '', dias: [0, 1, 2, 3, 4, 5, 6] },
  )
  const [areaId, setAreaId] = useState<AreaId>(habito?.areaId ?? opcoes[0]?.id ?? 'corpo')
  const [erro, setErro] = useState('')
  const [confirmarApagar, setConfirmarApagar] = useState(false)

  // Aviso leve (não bloqueia): poucos hábitos de cada vez é o que faz durar.
  const outrosAtivos = habitos.filter((h) => h.ativo && h.id !== habito?.id)
  const naArea = outrosAtivos.filter((h) => h.areaId === areaId).length
  const aviso =
    naArea >= 2
      ? 'Essa área já tem 2 hábitos ativos. Poucos de cada vez ajuda a não largar.'
      : outrosAtivos.length >= 6
        ? `Você já tem ${outrosAtivos.length} hábitos ativos. Que tal pausar um antes?`
        : ''

  async function salvar() {
    const problema = problemaNoHabito(valores)
    setErro(problema)
    if (problema) return
    const dados = { areaId, nome: valores.nome.trim(), versaoMinima: valores.versaoMinima.trim(), dias: valores.dias }
    if (habito) await editarHabito(habito.id, dados)
    else await criarHabito(dados, hoje)
    onPronto()
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className={CLASSE_ROTULO}>Área</span>
        <div className="flex flex-wrap gap-1.5">
          {opcoes.map((a) => {
            const escolhida = a.id === areaId
            return (
              <button
                key={a.id}
                type="button"
                aria-pressed={escolhida}
                onClick={() => setAreaId(a.id)}
                className={`flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm transition-colors duration-150 ${
                  escolhida ? 'bg-cartao-2 text-tinta ring-1 ring-linha-forte' : 'border border-linha text-tinta-suave'
                }`}
              >
                <IconeArea area={a.id} className="size-4 shrink-0" />
                {INFO_AREAS[a.id].nome}
              </button>
            )
          })}
        </div>
      </div>

      <CamposHabito
        valores={valores}
        onMudar={(v) => {
          setValores(v)
          setErro('')
        }}
      />

      {aviso && <p className="text-xs text-destaque-texto">{aviso}</p>}
      {erro && (
        <p role="alert" className="text-sm text-perigo">
          {erro}
        </p>
      )}

      <Botao variante="primario" onClick={() => void salvar()}>
        {habito ? 'Salvar' : 'Criar hábito'}
      </Botao>

      {habito && !confirmarApagar && (
        <div className="flex gap-2 border-t border-linha pt-4">
          {habito.ativo ? (
            <Botao
              className="flex-1"
              onClick={async () => {
                await pausarHabito(habito, hoje)
                onPronto()
              }}
            >
              <Pause className="size-4" aria-hidden="true" /> Pausar
            </Botao>
          ) : (
            <Botao
              className="flex-1"
              onClick={async () => {
                await retomarHabito(habito, hoje)
                onPronto()
              }}
            >
              <Play className="size-4" aria-hidden="true" /> Retomar
            </Botao>
          )}
          <Botao variante="perigo" className="flex-1" onClick={() => setConfirmarApagar(true)}>
            <Trash2 className="size-4" aria-hidden="true" /> Apagar
          </Botao>
        </div>
      )}

      {habito && confirmarApagar && (
        <div role="alertdialog" aria-label="Confirmar apagar hábito" className="entra rounded-xl border border-linha p-3">
          <p className="text-sm">Apagar “{habito.nome}”? Os votos que você já deu continuam valendo.</p>
          <div className="mt-3 flex gap-2">
            <Botao className="flex-1" onClick={() => setConfirmarApagar(false)}>
              Cancelar
            </Botao>
            <Botao
              variante="perigo"
              className="flex-1"
              onClick={async () => {
                await apagarHabito(habito.id)
                onPronto()
              }}
            >
              Apagar
            </Botao>
          </div>
        </div>
      )}
    </div>
  )
}
