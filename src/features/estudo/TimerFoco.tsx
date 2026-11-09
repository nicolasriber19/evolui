import { Settings2 } from 'lucide-react'
import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { CampoNumero } from '../../components/CampoNumero'
import { Folha } from '../../components/Folha'
import { Interruptor } from '../../components/Interruptor'
import { SugestaoDeVoto } from '../../components/SugestaoDeVoto'
import { atualizarConfig } from '../../db/acoes'
import { adicionarMateriasDaFaculdade, continuarFoco, encerrarFoco, iniciarFoco, pausarFoco } from '../../db/acoesEstudo'
import { useAgora } from '../../db/hooks'
import type { Config, DiaISO, EstadoFoco, Materia, SessaoEstudo } from '../../db/tipos'
import { FOCO_PADRAO, minutosFocados, PAUSA_PADRAO, restanteMs } from '../../lib/foco'
import { formatarMinutos, formatarRelogio } from '../../lib/formatar'
import { pedirPermissaoDeAviso } from './avisos'
import { useTelaLigada } from './motorFoco'

interface Props {
  config: Config
  estado: EstadoFoco | null
  materias: Materia[]
  sessoes: SessaoEstudo[]
  hoje: DiaISO
  onIrParaMaterias: () => void
}

const RAIO = 108
const VOLTA = 2 * Math.PI * RAIO

/** O timer de foco (Pomodoro): escolha a matéria, foque, descanse. */
export function TimerFoco({ config, estado, materias, sessoes, hoje, onIrParaMaterias }: Props) {
  // useAgora só faz a tela se redesenhar a cada segundo; o horário usado é sempre o exato deste instante.
  useAgora(estado?.rodando ? 1000 : 60_000)
  const agora = Date.now()
  const ativas = materias.filter((m) => m.ativa)
  const [escolhida, setEscolhida] = useState<string | null>(null)
  const [ajustando, setAjustando] = useState(false)
  const focoMin = config.focoMin ?? FOCO_PADRAO
  const pausaMin = config.pausaMin ?? PAUSA_PADRAO
  useTelaLigada(!!estado?.rodando && config.manterTelaLigada === true)

  if (ativas.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-linha bg-cartao p-4">
        <p className="text-[15px] font-medium">Primeiro, suas matérias</p>
        <p className="text-sm text-tinta-suave">O tempo de estudo é guardado por matéria, para você ver onde está investindo as horas.</p>
        <Botao variante="primario" onClick={() => void adicionarMateriasDaFaculdade()}>
          Adicionar Python, HTML e CSS
        </Botao>
        <Botao onClick={onIrParaMaterias}>Criar outra matéria</Botao>
      </div>
    )
  }

  const materiaId = estado?.materiaId ?? (escolhida && ativas.some((m) => m.id === escolhida) ? escolhida : ativas[0].id)
  const nomeMateria = materias.find((m) => m.id === materiaId)?.nome ?? 'Estudo'
  const total = estado ? estado.duracaoMs : focoMin * 60_000
  const restante = Math.min(total, estado ? restanteMs(estado, agora) : total)
  const fracao = total > 0 ? 1 - restante / total : 0
  const emPausa = estado?.fase === 'pausa'
  const minutosHoje = sessoes.filter((s) => s.dia === hoje).reduce((soma, s) => soma + s.minutos, 0)
  const feitosAgora = estado ? minutosFocados(estado, agora) : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" role="group" aria-label="Matéria do foco">
        {ativas.map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={!!estado}
            aria-pressed={m.id === materiaId}
            onClick={() => setEscolhida(m.id)}
            className={`min-h-10 shrink-0 rounded-xl px-3.5 text-sm whitespace-nowrap transition-colors duration-150 disabled:cursor-default ${
              m.id === materiaId ? 'bg-cartao-2 text-tinta ring-1 ring-linha-forte' : 'border border-linha text-tinta-suave disabled:opacity-50'
            }`}
          >
            {m.nome}
          </button>
        ))}
      </div>

      <div className="relative mx-auto grid size-64 place-items-center">
        <svg viewBox="0 0 240 240" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="120" cy="120" r={RAIO} fill="none" stroke="var(--cartao-2)" strokeWidth="8" />
          <circle
            cx="120"
            cy="120"
            r={RAIO}
            fill="none"
            stroke={emPausa ? 'var(--tinta-suave)' : 'var(--grafico)'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={VOLTA}
            strokeDashoffset={VOLTA * (1 - fracao)}
            className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-1000 motion-safe:ease-linear"
          />
        </svg>
        <div className="text-center" role="timer" aria-live="off">
          <p className="text-xs text-tinta-suave">{emPausa ? 'Pausa' : estado ? `Foco em ${nomeMateria}` : nomeMateria}</p>
          <p className="font-display text-[3.75rem] leading-none font-medium tracking-tight tabular-nums">{formatarRelogio(restante)}</p>
          <p className="mt-1 text-xs text-tinta-suave">{estado && !estado.rodando ? 'pausado' : `${focoMin} min de foco · ${pausaMin} de pausa`}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {!estado && (
          <Botao
            variante="primario"
            className="text-[15px]"
            onClick={async () => {
              await iniciarFoco(materiaId, focoMin)
              void pedirPermissaoDeAviso() // depois de começar: o timer não espera você responder
            }}
          >
            Começar foco
          </Botao>
        )}
        {estado && (
          <div className="flex gap-2">
            {estado.rodando ? (
              <Botao className="flex-1" onClick={() => void pausarFoco()}>
                Pausar
              </Botao>
            ) : (
              <Botao variante="primario" className="flex-1" onClick={() => void continuarFoco()}>
                Continuar
              </Botao>
            )}
            <Botao className="flex-1" onClick={() => void encerrarFoco(!emPausa, config.viradaHora)}>
              {emPausa ? 'Pular pausa' : feitosAgora >= 1 ? `Encerrar e salvar ${feitosAgora} min` : 'Encerrar'}
            </Botao>
          </div>
        )}
      </div>

      {emPausa && <SugestaoDeVoto area="estudo" hoje={hoje} />}

      <div className="flex items-center justify-between px-1 text-sm text-tinta-suave">
        <span>
          Hoje: <span className="font-medium text-tinta tabular-nums">{formatarMinutos(minutosHoje)}</span> de estudo
        </span>
        <button type="button" onClick={() => setAjustando(true)} className="-mr-2 flex min-h-11 items-center gap-1.5 px-2 hover:text-tinta">
          <Settings2 className="size-4" aria-hidden="true" /> Ajustar
        </button>
      </div>

      <Folha aberta={ajustando} onFechar={() => setAjustando(false)} titulo="Ajustar o timer">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <CampoNumero
              rotulo="Foco"
              unidade="min"
              valor={focoMin}
              onSalvar={(v) => void atualizarConfig({ focoMin: v && v >= 1 ? Math.round(v) : FOCO_PADRAO })}
            />
            <CampoNumero
              rotulo="Pausa"
              unidade="min"
              valor={pausaMin}
              onSalvar={(v) => void atualizarConfig({ pausaMin: v && v >= 1 ? Math.round(v) : PAUSA_PADRAO })}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[15px]">Manter a tela ligada</p>
              <p className="text-xs text-tinta-suave">Enquanto o timer roda. Gasta um pouco mais de bateria.</p>
            </div>
            <Interruptor
              ligado={config.manterTelaLigada === true}
              rotulo="Manter a tela ligada"
              onMudar={(ligado) => void atualizarConfig({ manterTelaLigada: ligado })}
            />
          </div>
          <p className="text-xs text-tinta-suave">
            Com o app fechado, o celular pode atrasar o aviso de fim. O tempo fica certo de qualquer jeito: a sessão é salva
            assim que você voltar.
          </p>
          <Botao onClick={() => setAjustando(false)}>Pronto</Botao>
        </div>
      </Folha>
    </div>
  )
}
