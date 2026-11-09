import { Settings2, X } from 'lucide-react'
import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { CabecalhoArea } from '../../components/CabecalhoArea'
import { CampoNumero } from '../../components/CampoNumero'
import { Cartao } from '../../components/Cartao'
import { CLASSE_CAMPO } from '../../components/estilos'
import { Folha } from '../../components/Folha'
import { Interruptor } from '../../components/Interruptor'
import {
  adicionarTipoLazer,
  apagarRegistroLazer,
  editarTipoLazer,
  registrarLazer,
  usarLazerSugerido,
} from '../../db/acoesFase3'
import { useAgora, useRegistrosLazer, useTiposLazer } from '../../db/hooks'
import type { Config, DiaISO, TipoLazer } from '../../db/tipos'
import { diaLogico, diasDaSemana } from '../../lib/datas'
import { fracaoEscolhida, usoDaSemana } from '../../lib/fase3'
import { formatarMinutos, lerNumero } from '../../lib/formatar'

/** Área Lazer: um orçamento semanal por tipo. A ideia é escolher o lazer, não cortar tudo. */
export function Lazer({ config }: { config: Config }) {
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const tipos = useTiposLazer()
  const registros = useRegistrosLazer()
  const [registrando, setRegistrando] = useState<TipoLazer | null>(null)
  const [ajustando, setAjustando] = useState(false)

  if (!tipos || !registros) return null

  const ativos = tipos.filter((t) => t.ativo)
  const dias = diasDaSemana(hoje)
  const usos = usoDaSemana(ativos, registros, dias)
  const daSemana = registros.filter((r) => dias.includes(r.dia))
  const escolhido = fracaoEscolhida(daSemana)
  const usadoTotal = usos.reduce((s, u) => s + u.usado, 0)
  const orcamentoTotal = ativos.reduce((s, t) => s + t.orcamentoMin, 0)
  const deHoje = registros.filter((r) => r.dia === hoje).sort((a, b) => b.criadoEm - a.criadoEm)
  const nomeDe = (id: string) => tipos.find((t) => t.id === id)?.nome ?? 'Lazer'

  return (
    <div className="flex flex-col gap-4">
      <CabecalhoArea area="lazer" />

      {tipos.length === 0 ? (
        <Cartao>
          <p className="text-[15px] font-medium">Escolher o lazer, não cortar tudo</p>
          <p className="mt-1 text-sm text-tinta-suave">
            Defina quanto tempo por semana você quer para cada tipo de lazer. Jogar e ver vídeo fazem parte da vida: a ideia é
            que seja escolha sua, e não piloto automático.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Botao variante="primario" onClick={() => void usarLazerSugerido()}>
              Usar: jogos 5h, redes 7h, séries 5h por semana
            </Botao>
            <Botao onClick={() => setAjustando(true)}>Montar o meu</Botao>
          </div>
        </Cartao>
      ) : (
        <>
          <Cartao titulo="Esta semana">
            <p className="font-display text-4xl leading-none font-medium tracking-tight tabular-nums">
              {formatarMinutos(usadoTotal)}{' '}
              <span className="ml-1 text-base font-normal tracking-normal text-tinta-suave">de {formatarMinutos(orcamentoTotal)}</span>
            </p>
            <p className="mt-2 text-sm text-tinta-suave">
              {escolhido === null
                ? 'Registre o lazer com dois toques: quanto tempo e se foi escolha sua.'
                : `${Math.round(escolhido * 100)}% desse tempo foi escolha sua, e não piloto automático.`}
            </p>
          </Cartao>

          <Cartao titulo="Orçamento por tipo">
            <ul className="flex flex-col">
              {usos.map((u) => {
                const fracao = u.tipo.orcamentoMin > 0 ? Math.min(1, u.usado / u.tipo.orcamentoMin) : 0
                return (
                  <li key={u.tipo.id} className="border-t border-linha py-3 first:border-t-0 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px]">{u.tipo.nome}</p>
                        <p className="text-xs text-tinta-suave tabular-nums">
                          {formatarMinutos(u.usado)} de {formatarMinutos(u.tipo.orcamentoMin)} ·{' '}
                          {u.passou > 0 ? `passou ${formatarMinutos(u.passou)}. Tudo bem, segunda recomeça.` : `sobram ${formatarMinutos(u.sobra)}`}
                        </p>
                      </div>
                      <Botao className="shrink-0 px-3" onClick={() => setRegistrando(u.tipo)}>
                        Registrar
                      </Botao>
                    </div>
                    <div className="mt-2 h-2 rounded-r-[4px] bg-cartao-2" aria-hidden="true">
                      <div className="h-full rounded-r-[4px] bg-grafico" style={{ width: `${fracao * 100}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
            <button
              type="button"
              onClick={() => setAjustando(true)}
              className="mt-3 -ml-1 flex min-h-11 items-center gap-1.5 px-1 text-sm text-tinta-suave hover:text-tinta"
            >
              <Settings2 className="size-4" aria-hidden="true" /> Ajustar orçamento
            </button>
          </Cartao>

          {deHoje.length > 0 && (
            <Cartao titulo="Hoje">
              <ul>
                {deHoje.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 border-t border-linha first:border-t-0">
                    <span className="flex-1 py-2 text-sm">
                      {nomeDe(r.tipoId)} <span className="text-tinta-suave">· {r.escolhido ? 'escolhi' : 'no automático'}</span>
                    </span>
                    <span className="text-sm tabular-nums">{formatarMinutos(r.minutos)}</span>
                    <button
                      type="button"
                      aria-label={`Apagar registro de ${nomeDe(r.tipoId)}`}
                      onClick={() => void apagarRegistroLazer(r.id)}
                      className="-mr-2.5 grid size-11 place-items-center text-tinta-suave hover:text-tinta"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </Cartao>
          )}
        </>
      )}

      <Folha aberta={registrando !== null} onFechar={() => setRegistrando(null)} titulo={registrando?.nome ?? 'Lazer'}>
        {registrando && <RegistrarLazer key={registrando.id} tipo={registrando} hoje={hoje} onPronto={() => setRegistrando(null)} />}
      </Folha>
      <Folha aberta={ajustando} onFechar={() => setAjustando(false)} titulo="Orçamento de lazer">
        {ajustando && <AjustarOrcamento tipos={tipos} />}
      </Folha>
    </div>
  )
}

const MINUTOS = [15, 30, 45, 60, 90, 120]

function RegistrarLazer({ tipo, hoje, onPronto }: { tipo: TipoLazer; hoje: DiaISO; onPronto: () => void }) {
  const [minutos, setMinutos] = useState<number | null>(null)
  const [outro, setOutro] = useState('')
  const [escolhido, setEscolhido] = useState(true)
  const [erro, setErro] = useState('')
  const valor = minutos ?? Math.round(lerNumero(outro) ?? 0)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1.5 text-xs font-medium text-tinta-suave">Quanto tempo?</p>
        <div className="grid grid-cols-3 gap-1.5">
          {MINUTOS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={minutos === m}
              onClick={() => {
                setMinutos(m)
                setOutro('')
                setErro('')
              }}
              className={`min-h-11 rounded-xl text-sm tabular-nums transition-colors duration-150 ${
                minutos === m ? 'bg-destaque font-medium text-destaque-tinta' : 'bg-cartao-2 text-tinta'
              }`}
            >
              {formatarMinutos(m)}
            </button>
          ))}
        </div>
        <input
          value={outro}
          onChange={(e) => {
            setOutro(e.target.value)
            setMinutos(null)
            setErro('')
          }}
          inputMode="numeric"
          placeholder="Outro tempo, em minutos"
          aria-label="Outro tempo, em minutos"
          className={`${CLASSE_CAMPO} mt-1.5`}
        />
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-tinta-suave">Foi escolha sua?</p>
        <div className="flex gap-1.5">
          {[
            [true, 'Escolhi'],
            [false, 'No automático'],
          ].map(([v, rotulo]) => (
            <button
              key={String(v)}
              type="button"
              aria-pressed={escolhido === v}
              onClick={() => setEscolhido(v as boolean)}
              className={`min-h-11 flex-1 rounded-xl text-sm transition-colors duration-150 ${
                escolhido === v ? 'bg-cartao-2 text-tinta ring-1 ring-linha-forte' : 'border border-linha text-tinta-suave'
              }`}
            >
              {rotulo as string}
            </button>
          ))}
        </div>
      </div>
      {erro && (
        <p role="alert" className="text-sm text-perigo">
          {erro}
        </p>
      )}
      <Botao
        variante="primario"
        onClick={async () => {
          if (valor <= 0 || valor > 1440) return setErro('Escolha quanto tempo foi.')
          await registrarLazer(tipo.id, hoje, valor, escolhido)
          onPronto()
        }}
      >
        Registrar
      </Botao>
    </div>
  )
}

function AjustarOrcamento({ tipos }: { tipos: TipoLazer[] }) {
  const [nome, setNome] = useState('')
  const [horas, setHoras] = useState('')
  const [erro, setErro] = useState('')

  return (
    <div className="flex flex-col gap-4">
      {tipos.length > 0 && (
        <ul className="flex flex-col gap-3">
          {tipos.map((t) => (
            <li key={t.id} className="rounded-xl border border-linha p-3">
              <div className="flex items-center gap-2">
                <input
                  key={t.nome}
                  defaultValue={t.nome}
                  aria-label={`Nome do lazer ${t.nome}`}
                  onBlur={(e) => {
                    const n = e.target.value.trim()
                    if (n && n !== t.nome) void editarTipoLazer(t.id, { nome: n })
                    else e.target.value = t.nome
                  }}
                  maxLength={40}
                  className={CLASSE_CAMPO}
                />
                <Interruptor ligado={t.ativo} rotulo={`${t.nome} no orçamento`} onMudar={(ativo) => void editarTipoLazer(t.id, { ativo })} />
              </div>
              <div className="mt-2">
                <CampoNumero
                  key={t.orcamentoMin}
                  rotulo="Por semana"
                  unidade="h"
                  valor={Math.round((t.orcamentoMin / 60) * 100) / 100}
                  onSalvar={(v) => {
                    if (v !== undefined && v >= 0) void editarTipoLazer(t.id, { orcamentoMin: Math.round(v * 60) })
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex flex-col gap-2 rounded-xl border border-dashed border-linha-forte p-3"
        onSubmit={(e) => {
          e.preventDefault()
          const h = lerNumero(horas)
          if (!nome.trim()) return setErro('Dê um nome, como Jogos ou YouTube.')
          if (h === null || h < 0) return setErro('Quantas horas por semana?')
          void adicionarTipoLazer(nome, Math.round(h * 60))
          setNome('')
          setHoras('')
          setErro('')
        }}
      >
        <p className="text-xs font-medium text-tinta-suave">Novo tipo de lazer</p>
        <div className="grid grid-cols-[1fr_6rem] gap-2">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="YouTube" aria-label="Nome do novo lazer" maxLength={40} className={CLASSE_CAMPO} />
          <input value={horas} onChange={(e) => setHoras(e.target.value)} inputMode="decimal" placeholder="Horas" aria-label="Horas por semana" className={CLASSE_CAMPO} />
        </div>
        {erro && (
          <p role="alert" className="text-sm text-perigo">
            {erro}
          </p>
        )}
        <Botao type="submit">Adicionar</Botao>
      </form>
      <p className="text-xs text-tinta-suave">Desligar um tipo tira ele do orçamento, mas o tempo já registrado fica guardado.</p>
    </div>
  )
}
