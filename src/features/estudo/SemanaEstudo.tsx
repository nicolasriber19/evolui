import { X } from 'lucide-react'
import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { Cartao } from '../../components/Cartao'
import { CLASSE_CAMPO } from '../../components/estilos'
import { BarrasHorizontais, ColunasSemana } from '../../components/Graficos'
import { apagarSessao, registrarSessao } from '../../db/acoesEstudo'
import type { DiaISO, Materia, SessaoEstudo } from '../../db/tipos'
import { diasDaSemana } from '../../lib/datas'
import { formatarMinutos, lerNumero } from '../../lib/formatar'

const NOMES_DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']

interface Props {
  materias: Materia[]
  sessoes: SessaoEstudo[]
  hoje: DiaISO
}

/** Horas da semana por matéria e por dia, mais o registro manual (ex.: estudou na aula). */
export function SemanaEstudo({ materias, sessoes, hoje }: Props) {
  const dias = diasDaSemana(hoje)
  const daSemana = sessoes.filter((s) => dias.includes(s.dia))
  const total = daSemana.reduce((soma, s) => soma + s.minutos, 0)
  const nome = (id: string) => materias.find((m) => m.id === id)?.nome ?? 'Matéria apagada'
  const porMateria = materias
    .map((m) => ({ m, minutos: daSemana.filter((s) => s.materiaId === m.id).reduce((soma, s) => soma + s.minutos, 0) }))
    .filter((x) => x.minutos > 0)
    .sort((a, b) => b.minutos - a.minutos)
  const porDia = dias.map((d) => daSemana.filter((s) => s.dia === d).reduce((soma, s) => soma + s.minutos, 0))
  const deHoje = sessoes.filter((s) => s.dia === hoje).sort((a, b) => b.inicio - a.inicio)

  const ativas = materias.filter((m) => m.ativa)
  const [materiaEscolhida, setMateriaId] = useState('')
  const materiaId = ativas.some((m) => m.id === materiaEscolhida) ? materiaEscolhida : (ativas[0]?.id ?? '')
  const [minutos, setMinutos] = useState('')
  const [erro, setErro] = useState('')

  async function registrar() {
    const n = Math.round(lerNumero(minutos) ?? 0)
    if (!materiaId) return setErro('Escolha a matéria.')
    if (n <= 0 || n > 600) return setErro('Escreva os minutos estudados (de 1 a 600).')
    await registrarSessao(materiaId, hoje, n, 'manual')
    setMinutos('')
    setErro('')
  }

  return (
    <div className="flex flex-col gap-3">
      <Cartao titulo="Esta semana">
        <p className="font-display text-4xl leading-none font-medium tracking-tight tabular-nums">{formatarMinutos(total)}</p>
        <p className="mt-1 text-sm text-tinta-suave">de estudo, de segunda a domingo</p>
        {total > 0 && (
          <div className="mt-4">
            <ColunasSemana
              valores={porDia}
              rotulos={NOMES_DIAS}
              indiceHoje={dias.indexOf(hoje)}
              formatar={formatarMinutos}
              descricao="Minutos de estudo por dia nesta semana"
            />
          </div>
        )}
      </Cartao>

      {porMateria.length > 0 && (
        <Cartao titulo="Por matéria">
          <BarrasHorizontais
            descricao="Tempo de estudo por matéria nesta semana"
            itens={porMateria.map(({ m, minutos: min }) => ({ chave: m.id, rotulo: m.nome, valor: min, texto: formatarMinutos(min) }))}
          />
        </Cartao>
      )}

      <Cartao titulo="Registrar tempo estudado">
        <div className="flex flex-col gap-2">
          <select
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            aria-label="Matéria"
            className={CLASSE_CAMPO}
          >
            {ativas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              value={minutos}
              onChange={(e) => setMinutos(e.target.value)}
              inputMode="numeric"
              placeholder="Minutos, ex.: 50"
              aria-label="Minutos estudados"
              className={CLASSE_CAMPO}
            />
            <Botao variante="primario" onClick={() => void registrar()}>
              Registrar
            </Botao>
          </div>
          {erro && (
            <p role="alert" className="text-sm text-perigo">
              {erro}
            </p>
          )}
          <p className="text-xs text-tinta-suave">Para quando você estudou sem o timer, como numa aula ou na biblioteca.</p>
        </div>
      </Cartao>

      {deHoje.length > 0 && (
        <Cartao titulo="Sessões de hoje">
          <ul>
            {deHoje.map((s) => (
              <li key={s.id} className="flex items-center gap-3 border-t border-linha first:border-t-0">
                <span className="flex-1 py-2 text-sm">
                  {nome(s.materiaId)} <span className="text-tinta-suave">· {s.origem === 'foco' ? 'timer' : 'manual'}</span>
                </span>
                <span className="text-sm tabular-nums">{formatarMinutos(s.minutos)}</span>
                <button
                  type="button"
                  aria-label={`Apagar sessão de ${nome(s.materiaId)}`}
                  onClick={() => void apagarSessao(s.id)}
                  className="-mr-2.5 grid size-11 place-items-center text-tinta-suave hover:text-tinta"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </Cartao>
      )}
    </div>
  )
}
