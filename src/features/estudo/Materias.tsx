import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { Cartao } from '../../components/Cartao'
import { CLASSE_CAMPO } from '../../components/estilos'
import { Interruptor } from '../../components/Interruptor'
import { adicionarMateria, adicionarMateriasDaFaculdade, editarMateria } from '../../db/acoesEstudo'
import type { Materia, TipoMateria } from '../../db/tipos'

const TIPOS: { valor: TipoMateria; rotulo: string }[] = [
  { valor: 'faculdade', rotulo: 'Faculdade' },
  { valor: 'programacao', rotulo: 'Programação' },
  { valor: 'outro', rotulo: 'Outro' },
]

/** Lista de matérias: criar, renomear e desligar as que você não estuda mais. */
export function Materias({ materias }: { materias: Materia[] }) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoMateria>('programacao')

  return (
    <div className="flex flex-col gap-3">
      {materias.length > 0 && (
        <Cartao titulo="Suas matérias">
          <ul>
            {materias.map((m) => (
              <li key={m.id} className="flex items-center gap-2 border-t border-linha py-1.5 first:border-t-0 first:pt-0">
                <input
                  key={m.nome}
                  defaultValue={m.nome}
                  aria-label={`Nome da matéria ${m.nome}`}
                  onBlur={(e) => {
                    const novo = e.target.value.trim()
                    if (novo && novo !== m.nome) void editarMateria(m.id, { nome: novo })
                    else e.target.value = m.nome
                  }}
                  maxLength={40}
                  className={`${CLASSE_CAMPO} ${m.ativa ? '' : 'text-tinta-suave'}`}
                />
                <span className="w-20 shrink-0 text-xs text-tinta-suave">{TIPOS.find((t) => t.valor === m.tipo)?.rotulo}</span>
                <Interruptor ligado={m.ativa} rotulo={`Matéria ${m.nome} ativa`} onMudar={(ativa) => void editarMateria(m.id, { ativa })} />
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-tinta-suave">Desligar esconde a matéria do timer, mas o tempo já estudado continua contando.</p>
        </Cartao>
      )}

      <Cartao titulo="Nova matéria">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!nome.trim()) return
            void adicionarMateria(nome, tipo)
            setNome('')
          }}
        >
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="JavaScript, Cálculo, Inglês..."
            aria-label="Nome da nova matéria"
            maxLength={40}
            className={CLASSE_CAMPO}
          />
          <div className="flex gap-1.5">
            {TIPOS.map((t) => (
              <button
                key={t.valor}
                type="button"
                aria-pressed={tipo === t.valor}
                onClick={() => setTipo(t.valor)}
                className={`min-h-11 flex-1 rounded-xl text-sm transition-colors duration-150 ${
                  tipo === t.valor ? 'bg-cartao-2 text-tinta ring-1 ring-linha-forte' : 'border border-linha text-tinta-suave'
                }`}
              >
                {t.rotulo}
              </button>
            ))}
          </div>
          <Botao type="submit" variante="primario">
            Adicionar matéria
          </Botao>
        </form>
        {materias.length === 0 && (
          <Botao variante="fantasma" className="mt-1 w-full" onClick={() => void adicionarMateriasDaFaculdade()}>
            Ou adicionar Python, HTML e CSS
          </Botao>
        )}
      </Cartao>
    </div>
  )
}
