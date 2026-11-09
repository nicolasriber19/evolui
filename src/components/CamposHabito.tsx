import { useId } from 'react'
import { DiasSemana } from './DiasSemana'
import { CLASSE_CAMPO, CLASSE_ROTULO } from './estilos'

export interface ValoresHabito {
  nome: string
  versaoMinima: string
  dias: number[]
}

interface Props {
  valores: ValoresHabito
  onMudar: (valores: ValoresHabito) => void
}

/** Os campos de um hábito (nome, versão mínima e dias). Usado no onboarding e nos Ajustes. */
export function CamposHabito({ valores, onMudar }: Props) {
  const id = useId()
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label htmlFor={`${id}-nome`} className={CLASSE_ROTULO}>
          Hábito
        </label>
        <input
          id={`${id}-nome`}
          value={valores.nome}
          onChange={(e) => onMudar({ ...valores, nome: e.target.value })}
          placeholder="Treinar"
          maxLength={60}
          className={CLASSE_CAMPO}
        />
      </div>
      <div>
        <label htmlFor={`${id}-minimo`} className={CLASSE_ROTULO}>
          Versão mínima, para os dias ruins
        </label>
        <input
          id={`${id}-minimo`}
          value={valores.versaoMinima}
          onChange={(e) => onMudar({ ...valores, versaoMinima: e.target.value })}
          placeholder="10 flexões em casa"
          maxLength={60}
          className={CLASSE_CAMPO}
        />
      </div>
      <div>
        <span className={CLASSE_ROTULO}>Dias</span>
        <DiasSemana dias={valores.dias} onMudar={(dias) => onMudar({ ...valores, dias })} />
      </div>
    </div>
  )
}

/** Mensagem de erro (ou vazio) para um hábito incompleto. */
export function problemaNoHabito(v: ValoresHabito): string {
  if (!v.nome.trim()) return 'Todo hábito precisa de um nome.'
  if (!v.versaoMinima.trim()) return 'Todo hábito precisa de uma versão mínima para os dias ruins.'
  if (v.dias.length === 0) return 'Escolha pelo menos um dia da semana.'
  return ''
}
