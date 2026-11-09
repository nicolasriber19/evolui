import { useState } from 'react'
import { Abas } from '../../components/Abas'
import { CabecalhoArea } from '../../components/CabecalhoArea'
import { useAgora, useEstadoFoco, useMaterias, useSessoes } from '../../db/hooks'
import type { Config } from '../../db/tipos'
import { diaLogico } from '../../lib/datas'
import { Materias } from './Materias'
import { SemanaEstudo } from './SemanaEstudo'
import { TimerFoco } from './TimerFoco'

type Aba = 'foco' | 'semana' | 'materias'

const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: 'foco', rotulo: 'Foco' },
  { valor: 'semana', rotulo: 'Semana' },
  { valor: 'materias', rotulo: 'Matérias' },
]

/** Área Estudo: timer de foco, tempo por matéria e as matérias. */
export function Estudo({ config }: { config: Config }) {
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const [aba, setAba] = useState<Aba>('foco')
  const materias = useMaterias()
  const sessoes = useSessoes()
  const estado = useEstadoFoco()

  if (!materias || !sessoes || estado === undefined) return null

  return (
    <div className="flex flex-col gap-4">
      <CabecalhoArea area="estudo" />
      <Abas abas={ABAS} atual={aba} onMudar={setAba} rotulo="Partes da área Estudo" />
      {aba === 'foco' && (
        <TimerFoco
          config={config}
          estado={estado}
          materias={materias}
          sessoes={sessoes}
          hoje={hoje}
          onIrParaMaterias={() => setAba('materias')}
        />
      )}
      {aba === 'semana' && <SemanaEstudo materias={materias} sessoes={sessoes} hoje={hoje} />}
      {aba === 'materias' && <Materias materias={materias} />}
    </div>
  )
}
