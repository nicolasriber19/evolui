import { BellRing, CalendarPlus, Download } from 'lucide-react'
import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { Cartao } from '../../components/Cartao'
import { DiasSemana } from '../../components/DiasSemana'
import { Folha } from '../../components/Folha'
import { Interruptor } from '../../components/Interruptor'
import { atualizarConfig } from '../../db/acoes'
import type { Config, DiaISO, Lembrete } from '../../db/tipos'
import { descreverDias } from '../../lib/datas'
import { gerarIcs, lembretesPadrao, linkGoogleAgenda } from '../../lib/lembretes'

/** Lembretes: viram eventos repetidos na agenda do celular, que toca mesmo com o app fechado. */
export function SecaoLembretes({ config, hoje }: { config: Config; hoje: DiaISO }) {
  const [aberta, setAberta] = useState(false)
  const lembretes = config.lembretes ?? lembretesPadrao()
  const ligados = lembretes.filter((l) => l.ativo)

  const mudar = (id: string, mudancas: Partial<Lembrete>) =>
    void atualizarConfig({ lembretes: lembretes.map((l) => (l.id === id ? { ...l, ...mudancas } : l)) })

  function baixarIcs() {
    const arquivo = new Blob([gerarIcs(lembretes, hoje)], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(arquivo)
    const link = document.createElement('a')
    link.href = url
    link.download = 'evolui-lembretes.ics'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  return (
    <Cartao titulo="Lembretes">
      <p className="text-sm text-tinta-suave">
        {ligados.length === 0
          ? 'Avisos de treino, vitórias e revisão, pela agenda do celular.'
          : `${ligados.length} ${ligados.length === 1 ? 'lembrete ligado' : 'lembretes ligados'}.`}
      </p>
      <Botao className="mt-3 w-full" onClick={() => setAberta(true)}>
        <BellRing className="size-4" aria-hidden="true" /> Configurar lembretes
      </Botao>

      <Folha aberta={aberta} onFechar={() => setAberta(false)} titulo="Lembretes">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-tinta-suave">
            Um app de navegador não consegue avisar com o app fechado. A agenda do celular consegue: ligue os lembretes que
            quiser e toque em <span className="text-tinta">Adicionar ao Google Agenda</span> em cada um.
          </p>

          <ul className="flex flex-col gap-3">
            {lembretes.map((l) => (
              <li key={l.id} className={`rounded-xl border p-3 ${l.ativo ? 'border-linha-forte bg-cartao-2/40' : 'border-linha'}`}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 pt-1">
                    <p className="text-[15px] leading-snug first-letter:uppercase">{l.titulo.replace('Evolui: ', '')}</p>
                    <p className="text-xs text-tinta-suave">
                      {l.mensal ? 'primeiro domingo de cada mês' : descreverDias(l.dias)} às {l.hora}
                    </p>
                  </div>
                  <Interruptor ligado={l.ativo} rotulo={`Lembrete: ${l.titulo}`} onMudar={(ativo) => mudar(l.id, { ativo })} />
                </div>
                {l.ativo && (
                  <div className="entra mt-3 flex flex-col gap-2.5">
                    <label className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-tinta-suave">Horário</span>
                      <input
                        type="time"
                        value={l.hora}
                        onChange={(e) => e.target.value && mudar(l.id, { hora: e.target.value })}
                        className="min-h-11 rounded-xl border border-linha bg-cartao-2 px-3 text-base text-tinta tabular-nums"
                      />
                    </label>
                    {!l.mensal && <DiasSemana dias={l.dias} onMudar={(dias) => mudar(l.id, { dias })} />}
                    <a
                      href={linkGoogleAgenda(l, hoje)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-destaque px-4 text-sm font-medium text-destaque-tinta transition-transform duration-150 ease-saida active:scale-[0.97]"
                    >
                      <CalendarPlus className="size-4" aria-hidden="true" /> Adicionar ao Google Agenda
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="border-t border-linha pt-4">
            <Botao className="w-full" disabled={ligados.length === 0} onClick={baixarIcs}>
              <Download className="size-4" aria-hidden="true" /> Baixar todos os ligados (.ics)
            </Botao>
            <p className="mt-2 text-xs text-tinta-suave">
              Para outra agenda, ou para importar todos de uma vez no computador: calendar.google.com, Configurações,
              Importar e exportar. Mudou um horário? Apague o evento antigo na agenda e adicione de novo.
            </p>
          </div>
        </div>
      </Folha>
    </Cartao>
  )
}
