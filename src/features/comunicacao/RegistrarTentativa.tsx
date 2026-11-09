import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { Escala } from '../../components/Escala'
import { CLASSE_CAMPO, CLASSE_ROTULO } from '../../components/estilos'
import { SugestaoDeVoto } from '../../components/SugestaoDeVoto'
import { registrarTentativa } from '../../db/acoesFase3'
import type { DiaISO, SemanaISO } from '../../db/tipos'

/** Registro rápido depois de tentar o desafio: como foi e o que aprendeu. */
export function RegistrarTentativa({
  semana,
  hoje,
  desafioTexto,
  onPronto,
}: {
  semana: SemanaISO
  hoje: DiaISO
  desafioTexto: string
  onPronto: () => void
}) {
  const [comoFoi, setComoFoi] = useState<number | undefined>()
  const [relato, setRelato] = useState('')
  const [aprendi, setAprendi] = useState('')
  const [erro, setErro] = useState('')
  const [salvo, setSalvo] = useState(false)

  if (salvo) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-display text-2xl leading-tight font-medium tracking-tight">Tentativa registrada.</p>
        <p className="text-sm text-tinta-suave">Tentar já é o treino. Cada conversa deixa a próxima mais leve.</p>
        <SugestaoDeVoto area="comunicacao" hoje={hoje} />
        <Botao onClick={onPronto}>Fechar</Botao>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-tinta-suave">{desafioTexto}</p>
      <Escala rotulo="Como foi?" valor={comoFoi} legendas={['travei', 'fluiu']} onEscolher={(n) => {
          setComoFoi(n)
          setErro('')
        }} />
      <label>
        <span className={CLASSE_ROTULO}>O que aconteceu (opcional)</span>
        <textarea
          value={relato}
          onChange={(e) => setRelato(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Com quem foi, o que você disse, como a pessoa reagiu"
          className={`${CLASSE_CAMPO} py-2.5`}
        />
      </label>
      <label>
        <span className={CLASSE_ROTULO}>O que aprendi (opcional)</span>
        <input
          value={aprendi}
          onChange={(e) => setAprendi(e.target.value)}
          maxLength={200}
          placeholder="Uma frase para lembrar na próxima"
          className={CLASSE_CAMPO}
        />
      </label>
      {erro && (
        <p role="alert" className="text-sm text-perigo">
          {erro}
        </p>
      )}
      <Botao
        variante="primario"
        onClick={async () => {
          if (!comoFoi) return setErro('Escolha de 1 a 5 como foi.')
          await registrarTentativa(semana, hoje, desafioTexto, { comoFoi, relato, aprendi })
          setSalvo(true)
        }}
      >
        Salvar
      </Botao>
    </div>
  )
}
