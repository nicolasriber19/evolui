import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatarNumero } from '../lib/formatar'

export interface PontoGrafico {
  rotulo: string
  valor: number
}

interface Props {
  dados: PontoGrafico[]
  unidade: string
  /** O que o gráfico mostra (vai para a tabela escondida dos leitores de tela). */
  descricao: string
  /** Marcas fixas do eixo (ex.: [1, 2, 3, 4, 5] para humor). Sem isso, são calculadas pelos dados. */
  marcasFixas?: number[]
}

/** Marcas "limpas" no eixo (35, 40, 45...) com uma folga em cima e embaixo dos dados. */
function marcasDoEixo(valores: number[]): number[] {
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const folga = Math.max((max - min) * 0.15, 1)
  const passos = [1, 2, 2.5, 5, 10, 20, 25, 50, 100]
  const passo = passos.find((p) => (max - min + 2 * folga) / p <= 4) ?? 100
  const piso = Math.max(0, Math.floor((min - folga) / passo) * passo)
  const teto = Math.ceil((max + folga) / passo) * passo
  const marcas: number[] = []
  for (let v = piso; v <= teto + passo / 1000; v += passo) marcas.push(Math.round(v * 100) / 100)
  return marcas
}

interface PropsDica {
  active?: boolean
  payload?: readonly { value?: unknown }[]
  label?: unknown
  unidade: string
}

function Dica({ active, payload, label, unidade }: PropsDica) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-linha bg-cartao-2 px-2.5 py-1.5 text-xs shadow-(--sombra)">
      <p className="text-tinta-suave">{String(label ?? '')}</p>
      <p className="font-medium text-tinta tabular-nums">
        {formatarNumero(Number(payload[0].value))} {unidade}
      </p>
    </div>
  )
}

/**
 * Gráfico de linha de uma série só (ex.: carga máxima por treino).
 * Este arquivo carrega a biblioteca Recharts, que é pesada, por isso ele só é baixado
 * quando a tela que usa o gráfico é aberta (veja o React.lazy em quem importa).
 */
export default function GraficoLinha({ dados, unidade, descricao, marcasFixas }: Props) {
  const marcas = marcasFixas ?? marcasDoEixo(dados.map((d) => d.valor))
  return (
    <>
      <div className="h-52 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--linha)" />
            <XAxis
              dataKey="rotulo"
              tickLine={false}
              axisLine={{ stroke: 'var(--linha-forte)' }}
              tick={{ fill: 'var(--tinta-suave)', fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tick={{ fill: 'var(--tinta-suave)', fontSize: 11 }}
              domain={[marcas[0], marcas[marcas.length - 1]]}
              ticks={marcas}
              tickFormatter={(v: number) => formatarNumero(v)}
            />
            <Tooltip cursor={{ stroke: 'var(--linha-forte)', strokeWidth: 1 }} content={(p) => <Dica active={p.active} payload={p.payload} label={p.label} unidade={unidade} />} />
            <Line
              type="linear"
              dataKey="valor"
              stroke="var(--grafico)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={{ r: 4, fill: 'var(--grafico)', stroke: 'var(--cartao)', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: 'var(--grafico)', stroke: 'var(--cartao)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{descricao}</caption>
        <thead>
          <tr>
            <th>Data</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((d, i) => (
            <tr key={i}>
              <td>{d.rotulo}</td>
              <td>
                {formatarNumero(d.valor)} {unidade}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
