import { useState } from 'react'
import { Abas } from '../../components/Abas'
import { CabecalhoArea } from '../../components/CabecalhoArea'
import { useAgora, useExercicios, useModelos, useSeries, useTreinos } from '../../db/hooks'
import type { Config } from '../../db/tipos'
import { diaLogico } from '../../lib/datas'
import { EvolucaoCarga } from './EvolucaoCarga'
import { Historico } from './Historico'
import { InicioTreino } from './InicioTreino'
import { Medidas } from './Medidas'
import { TreinoEmAndamento } from './TreinoEmAndamento'

type Aba = 'treino' | 'historico' | 'evolucao' | 'medidas'

const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: 'treino', rotulo: 'Treino' },
  { valor: 'historico', rotulo: 'Histórico' },
  { valor: 'evolucao', rotulo: 'Evolução' },
  { valor: 'medidas', rotulo: 'Medidas' },
]

/** Área Corpo: registrar treinos, ver o histórico, a evolução da carga e as medidas. */
export function Corpo({ config }: { config: Config }) {
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const [aba, setAba] = useState<Aba>('treino')
  const modelos = useModelos()
  const treinos = useTreinos()
  const series = useSeries()
  const exercicios = useExercicios()

  if (!modelos || !treinos || !series || !exercicios) return null

  const nomes = new Map(exercicios.map((e) => [e.id, e.nome]))
  const emAndamento = treinos.find((t) => t.concluidoEm === undefined)

  return (
    <div className="flex flex-col gap-4">
      <CabecalhoArea area="corpo" />
      <Abas abas={ABAS} atual={aba} onMudar={setAba} rotulo="Partes da área Corpo" />

      {aba === 'treino' &&
        (emAndamento ? (
          <TreinoEmAndamento treino={emAndamento} modelos={modelos} series={series} nomes={nomes} exercicios={exercicios} />
        ) : (
          <InicioTreino modelos={modelos} treinos={treinos} series={series} nomes={nomes} hoje={hoje} />
        ))}
      {aba === 'historico' && <Historico treinos={treinos} series={series} nomes={nomes} />}
      {aba === 'evolucao' && <EvolucaoCarga series={series} nomes={nomes} />}
      {aba === 'medidas' && <Medidas hoje={hoje} />}
    </div>
  )
}
