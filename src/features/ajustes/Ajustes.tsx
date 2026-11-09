import { ChevronRight, Monitor, Moon, Plus, Smartphone, Sun } from 'lucide-react'
import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { Cartao } from '../../components/Cartao'
import { CLASSE_CAMPO } from '../../components/estilos'
import { Folha } from '../../components/Folha'
import { IconeArea, PontoArea } from '../../components/IconeArea'
import { Interruptor } from '../../components/Interruptor'
import { atualizarConfig, atualizarFrase, ligarArea } from '../../db/acoes'
import { useAgora, useAreas, useHabitos } from '../../db/hooks'
import type { Area, Config, Habito, Tema } from '../../db/tipos'
import { INFO_AREAS, ORDEM_AREAS } from '../../lib/areas'
import { descreverDias, diaLogico } from '../../lib/datas'
import { estaInstalado, instalarApp, useConviteInstalacao } from '../pwa/instalar'
import { EditorHabito } from './EditorHabito'
import { SecaoBackup } from './SecaoBackup'

const TEMAS: { valor: Tema; rotulo: string; Icone: typeof Moon }[] = [
  { valor: 'escuro', rotulo: 'Escuro', Icone: Moon },
  { valor: 'claro', rotulo: 'Claro', Icone: Sun },
  { valor: 'sistema', rotulo: 'Sistema', Icone: Monitor },
]

export function Ajustes({ config }: { config: Config }) {
  const areas = useAreas()
  const habitos = useHabitos()
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const [editando, setEditando] = useState<Habito | 'novo' | null>(null)

  if (!areas || !habitos) return null

  const posicao = (h: Habito) => ORDEM_AREAS.indexOf(h.areaId) * 1000 + h.ordem
  const ordenados = [...habitos].sort((a, b) => Number(b.ativo) - Number(a.ativo) || posicao(a) - posicao(b))
  const ativos = habitos.filter((h) => h.ativo).length

  return (
    <div className="flex flex-col gap-3">
      <h1 className="pb-1 font-display text-[1.75rem] leading-tight font-medium tracking-tight">Ajustes</h1>

      <Cartao titulo="Aparência">
        <div className="grid grid-cols-3 gap-1.5">
          {TEMAS.map(({ valor, rotulo, Icone }) => {
            const ativo = config.tema === valor
            return (
              <button
                key={valor}
                type="button"
                aria-pressed={ativo}
                onClick={() => void atualizarConfig({ tema: valor })}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm transition-[transform,background-color,color] duration-150 ease-saida active:scale-[0.96] ${
                  ativo ? 'bg-destaque font-medium text-destaque-tinta' : 'bg-cartao-2 text-tinta-suave'
                }`}
              >
                <Icone className="size-4" aria-hidden="true" />
                {rotulo}
              </button>
            )
          })}
        </div>
      </Cartao>

      <Cartao
        titulo="Hábitos"
        acao={
          <button
            type="button"
            onClick={() => setEditando('novo')}
            className="-my-3 -mr-2 flex min-h-11 items-center gap-1 px-2 text-sm font-medium text-destaque-texto"
          >
            <Plus className="size-4" aria-hidden="true" /> Novo
          </button>
        }
      >
        {ordenados.length === 0 ? (
          <p className="text-sm text-tinta-suave">Nenhum hábito ainda. Toque em Novo para criar o primeiro.</p>
        ) : (
          <ul>
            {ordenados.map((h) => (
              <li key={h.id} className="border-t border-linha first:border-t-0">
                <button
                  type="button"
                  onClick={() => setEditando(h)}
                  className="flex min-h-14 w-full items-center gap-3 py-2 text-left"
                >
                  <PontoArea area={h.areaId} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[15px] leading-snug ${h.ativo ? '' : 'text-tinta-suave'}`}>
                      {h.nome}
                      {!h.ativo && <span className="ml-2 text-xs">pausado</span>}
                    </span>
                    <span className="block text-xs text-tinta-suave">
                      {descreverDias(h.dias)} · mínimo: {h.versaoMinima}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-tinta-suave" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {ativos > 6 && (
          <p className="mt-3 text-xs text-destaque-texto">
            {ativos} hábitos ativos. Menos hábitos ao mesmo tempo costumam durar mais.
          </p>
        )}
      </Cartao>

      <Cartao titulo="Áreas e frases">
        <ul>
          {areas.map((a) => (
            <li key={a.id} className="border-t border-linha py-2 first:border-t-0 first:pt-0">
              <div className="flex items-center gap-3">
                <IconeArea area={a.id} className="size-5 shrink-0" />
                <span className="flex-1 text-[15px]">{INFO_AREAS[a.id].nome}</span>
                <Interruptor
                  ligado={a.ativa}
                  rotulo={`Área ${INFO_AREAS[a.id].nome}`}
                  onMudar={(ligado) => void ligarArea(a.id, ligado, hoje)}
                />
              </div>
              {a.ativa && <CampoFrase key={a.frase} area={a} />}
            </li>
          ))}
        </ul>
      </Cartao>

      <Cartao titulo="Seu dia">
        <div className="flex flex-col gap-3">
          <Seletor
            rotulo="O dia vira às"
            valor={config.viradaHora}
            opcoes={[0, 1, 2, 3, 4, 5, 6]}
            onMudar={(h) => void atualizarConfig({ viradaHora: h })}
          />
          <Seletor
            rotulo="As vitórias aparecem a partir das"
            valor={config.vitoriasHora}
            opcoes={[16, 17, 18, 19, 20, 21, 22, 23]}
            onMudar={(h) => void atualizarConfig({ vitoriasHora: h })}
          />
        </div>
      </Cartao>

      <SecaoBackup config={config} />
      <SecaoApp />

      <Folha
        aberta={editando !== null}
        onFechar={() => setEditando(null)}
        titulo={editando === 'novo' ? 'Novo hábito' : 'Editar hábito'}
      >
        {editando !== null && (
          <EditorHabito
            key={editando === 'novo' ? 'novo' : editando.id}
            habito={editando === 'novo' ? undefined : editando}
            areas={areas}
            habitos={habitos}
            hoje={hoje}
            onPronto={() => setEditando(null)}
          />
        )}
      </Folha>
    </div>
  )
}

/** Campo da frase de identidade: salva quando você sai do campo. */
function CampoFrase({ area }: { area: Area }) {
  const [texto, setTexto] = useState(area.frase)
  return (
    <input
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={() => {
        const limpo = texto.trim()
        if (limpo && limpo !== area.frase) void atualizarFrase(area.id, limpo)
        else setTexto(area.frase)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
      aria-label={`Frase de identidade da área ${INFO_AREAS[area.id].nome}`}
      enterKeyHint="done"
      maxLength={60}
      className={`${CLASSE_CAMPO} mt-1 mb-1 font-display tracking-tight`}
    />
  )
}

function Seletor({
  rotulo,
  valor,
  opcoes,
  onMudar,
}: {
  rotulo: string
  valor: number
  opcoes: number[]
  onMudar: (h: number) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[15px]">{rotulo}</span>
      <select
        value={valor}
        onChange={(e) => onMudar(Number(e.target.value))}
        className="min-h-11 rounded-xl border border-linha bg-cartao-2 px-3 text-base text-tinta tabular-nums"
      >
        {opcoes.map((h) => (
          <option key={h} value={h}>
            {h}h
          </option>
        ))}
      </select>
    </label>
  )
}

function SecaoApp() {
  const podeInstalar = useConviteInstalacao()
  const instalado = estaInstalado()
  return (
    <Cartao titulo="App">
      {instalado ? (
        <p className="text-sm text-tinta-suave">O Evolui está instalado neste aparelho e funciona sem internet.</p>
      ) : podeInstalar ? (
        <Botao className="w-full" onClick={() => void instalarApp()}>
          <Smartphone className="size-4" aria-hidden="true" /> Instalar o Evolui
        </Botao>
      ) : (
        <p className="text-sm text-tinta-suave">
          Para instalar: no Chrome do celular, abra o menu (três pontinhos) e toque em “Adicionar à tela inicial”.
        </p>
      )}
      <p className="mt-3 text-xs text-tinta-suave">Versão 0.1 (Fase 1)</p>
    </Cartao>
  )
}
