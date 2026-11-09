import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Botao } from '../../components/Botao'
import { Cartao } from '../../components/Cartao'
import { ListaCurta } from '../../components/ListaCurta'
import { marcarHabito, salvarMetas, salvarPrioridades } from '../../db/acoes'
import { useAgora, useAreas, useChecks, useDia, useHabitos, useSemana } from '../../db/hooks'
import type { AreaId, Config, Habito, TipoCheck } from '../../db/tipos'
import { agendadoEm, calcularCorrente } from '../../lib/corrente'
import { diaLogico, diaPorExtenso, diasDaSemana, ehNoite, numeroDoDia, semanaISO } from '../../lib/datas'
import { feitosPorHabito, votosPorDia } from '../../lib/votos'
import { AvisoBackup } from './AvisoBackup'
import { CheckIn } from './CheckIn'
import { HabitoLinha } from './HabitoLinha'
import { Identidade } from './Identidade'
import { Vitorias } from './Vitorias'
import { voarVoto } from './vooDoVoto'

/** A tela principal: o que importa hoje, em menos de 2 minutos. */
export function Hoje({ config }: { config: Config }) {
  const agora = useAgora()
  const hoje = diaLogico(agora, config.viradaHora)
  const semanaId = semanaISO(hoje)

  const areas = useAreas()
  const habitos = useHabitos()
  const checks = useChecks()
  const dia = useDia(hoje)
  const semana = useSemana(semanaId)

  const [areaEscolhida, setAreaEscolhida] = useState<AreaId | null>(null)
  const [recentes, setRecentes] = useState<Set<string>>(() => new Set())
  const [voo, setVoo] = useState<{ de: DOMRect; vez: number } | null>(null)
  const [vitoriasAbertas, setVitoriasAbertas] = useState(false)
  const alvoRef = useRef<HTMLDivElement>(null)

  // Depois que a tela já mostra a frase da área certa, o ponto dourado voa até a régua.
  useLayoutEffect(() => {
    if (voo && alvoRef.current) voarVoto(voo.de, alvoRef.current.getBoundingClientRect())
  }, [voo])

  // Enquanto o banco carrega (uma fração de segundo), não mostra nada.
  if (!areas || !habitos || !checks || dia === undefined || semana === undefined) return null

  const ativas = areas.filter((a) => a.ativa)
  const idsAtivas = new Set(ativas.map((a) => a.id))
  const habitosAtivos = habitos.filter((h) => h.ativo && idsAtivas.has(h.areaId))
  const habitosHoje = habitosAtivos.filter((h) => agendadoEm(h, hoje))
  const feitos = feitosPorHabito(checks)
  const checksHoje = new Map(checks.filter((c) => c.dia === hoje).map((c) => [c.habitoId, c]))
  const feitosHoje = habitosHoje.filter((h) => checksHoje.has(h.id)).length

  // Frase do dia: alterna entre as áreas que têm hábito hoje (ou todas, se nenhuma tiver).
  const candidatas = ativas.filter((a) => habitosHoje.some((h) => h.areaId === a.id))
  const base = candidatas.length > 0 ? candidatas : ativas
  const areaDoDia = base.length > 0 ? base[numeroDoDia(hoje) % base.length] : undefined
  const areaMostrada = ativas.find((a) => a.id === areaEscolhida) ?? areaDoDia
  const diasSemana = diasDaSemana(hoje)

  function trocarIdentidade() {
    if (!areaMostrada) return
    const i = ativas.findIndex((a) => a.id === areaMostrada.id)
    setAreaEscolhida(ativas[(i + 1) % ativas.length].id)
  }

  async function marcar(h: Habito, tipo: TipoCheck | null, origem: HTMLElement) {
    const votoNovo = tipo !== null && !checksHoje.has(h.id)
    const de = origem.getBoundingClientRect()
    await marcarHabito(h, hoje, tipo)
    if (votoNovo) {
      setAreaEscolhida(h.areaId) // a frase mostrada passa a ser a da área que recebeu o voto
      setRecentes((r) => new Set(r).add(`${h.id}:${hoje}`))
      setVoo({ de, vez: Date.now() })
      navigator.vibrate?.(10) // vibração bem curtinha no Android
    }
  }

  const noite = ehNoite(agora, config.vitoriasHora, config.viradaHora)
  const mostrarVitorias = noite || vitoriasAbertas || (dia?.vitorias.length ?? 0) > 0
  const vitorias = mostrarVitorias ? <Vitorias key={hoje} salvas={dia?.vitorias ?? []} hoje={hoje} /> : null
  const checkIn = <CheckIn dia={dia} hoje={hoje} />

  return (
    <div className="flex flex-col gap-3">
      <header>
        <h1 className="text-sm text-tinta-suave first-letter:uppercase">{diaPorExtenso(hoje)}</h1>
      </header>

      {areaMostrada && (
        <Identidade
          area={areaMostrada}
          dias={diasSemana}
          hoje={hoje}
          votos={votosPorDia(checks, areaMostrada.id, diasSemana)}
          recentes={recentes}
          alvoRef={alvoRef}
          onTrocar={ativas.length > 1 ? trocarIdentidade : undefined}
        />
      )}

      <AvisoBackup config={config} hoje={hoje} />

      {/* À noite, as vitórias sobem para o topo. */}
      {noite && vitorias}
      {!noite && checkIn}

      <Cartao
        titulo="Hábitos de hoje"
        acao={
          habitosHoje.length > 0 && (
            <span className="text-xs text-tinta-suave tabular-nums">
              {feitosHoje} de {habitosHoje.length}
            </span>
          )
        }
      >
        {habitosHoje.length > 0 ? (
          <>
            <ul>
              {habitosHoje.map((h) => (
                <HabitoLinha
                  key={h.id}
                  habito={h}
                  check={checksHoje.get(h.id)}
                  resultado={calcularCorrente(h, feitos.get(h.id) ?? new Set(), hoje)}
                  onMarcar={(tipo, origem) => void marcar(h, tipo, origem)}
                />
              ))}
            </ul>
            {feitosHoje === habitosHoje.length && (
              <p className="entra mt-3 text-xs text-destaque-texto">Todos os votos de hoje foram dados.</p>
            )}
          </>
        ) : habitosAtivos.length > 0 ? (
          <p className="text-sm text-tinta-suave">Hoje é folga dos seus hábitos. Descansar também faz parte.</p>
        ) : (
          <p className="text-sm text-tinta-suave">
            Nenhum hábito ativo.{' '}
            <Link to="/ajustes" className="text-destaque-texto underline underline-offset-4">
              Criar um hábito
            </Link>
          </p>
        )}
      </Cartao>

      {noite && checkIn}

      <Cartao titulo="Prioridades de hoje">
        <ListaCurta
          itens={dia?.prioridades ?? []}
          onMudar={(lista) => void salvarPrioridades(hoje, lista)}
          placeholder="O que precisa sair hoje?"
          rotuloCampo="Nova prioridade de hoje"
          mensagemLimite="Três prioridades é o limite. Foco no que importa."
        />
      </Cartao>

      <Cartao titulo="Metas da semana">
        <ListaCurta
          itens={semana?.metas ?? []}
          onMudar={(lista) => void salvarMetas(semanaId, lista)}
          placeholder="Uma meta para esta semana"
          rotuloCampo="Nova meta da semana"
          mensagemLimite="Três metas por semana. No domingo você escolhe as próximas."
        />
      </Cartao>

      {!noite &&
        (vitorias ?? (
          <Botao variante="fantasma" className="self-center" onClick={() => setVitoriasAbertas(true)}>
            Registrar as vitórias de hoje agora
          </Botao>
        ))}
    </div>
  )
}
