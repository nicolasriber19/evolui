import { useEffect, useRef, useState } from 'react'
import { Abas } from '../../components/Abas'
import { Botao } from '../../components/Botao'
import { CabecalhoArea } from '../../components/CabecalhoArea'
import { Cartao } from '../../components/Cartao'
import { Folha } from '../../components/Folha'
import { ListaEditavel } from '../../components/ListaEditavel'
import {
  adicionarDesafio,
  adicionarDica,
  apagarDesafio,
  apagarDica,
  apagarTentativa,
  editarDesafio,
  editarDica,
  sortearDesafioDaSemana,
  usarDesafiosSugeridos,
  usarDicasSugeridas,
} from '../../db/acoesFase3'
import { useAgora, useDesafios, useDicas, useSemana, useTentativas, useTodasSemanas } from '../../db/hooks'
import type { Config, Desafio, Semana, Tentativa } from '../../db/tipos'
import { diaCurto, diaLogico, semanaISO } from '../../lib/datas'
import { RegistrarTentativa } from './RegistrarTentativa'

type Aba = 'desafio' | 'dicas' | 'lista'

const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: 'desafio', rotulo: 'Desafio' },
  { valor: 'dicas', rotulo: 'Dicas' },
  { valor: 'lista', rotulo: 'Lista' },
]

const COMO_FOI = ['', 'travei', 'difícil', 'deu', 'bem', 'fluiu']

/** Área Comunicação: um desafio de conversa por semana, o registro das tentativas e as dicas. */
export function Comunicacao({ config }: { config: Config }) {
  const hoje = diaLogico(useAgora(), config.viradaHora)
  const semanaId = semanaISO(hoje)
  const [aba, setAba] = useState<Aba>('desafio')
  const desafios = useDesafios()
  const dicas = useDicas()
  const tentativas = useTentativas()
  const semana = useSemana(semanaId)
  const semanas = useTodasSemanas()

  if (!desafios || !dicas || !tentativas || semana === undefined || !semanas) return null

  return (
    <div className="flex flex-col gap-4">
      <CabecalhoArea area="comunicacao" />
      <Abas abas={ABAS} atual={aba} onMudar={setAba} rotulo="Partes da área Comunicação" />

      {aba === 'desafio' && (
        <DesafioDaSemana
          desafios={desafios}
          semanaId={semanaId}
          hoje={hoje}
          desafio={semana?.desafio}
          tentativas={tentativas}
          semanasAnteriores={semanas.filter((s) => s.id < semanaId && s.desafio).sort((a, b) => b.id.localeCompare(a.id))}
          onCriarLista={() => setAba('lista')}
        />
      )}

      {aba === 'dicas' &&
        (dicas.length === 0 ? (
          <Cartao>
            <p className="text-sm text-tinta-suave">Uma pequena biblioteca de dicas de conversa, para ler antes de sair de casa.</p>
            <Botao variante="primario" className="mt-3 w-full" onClick={() => void usarDicasSugeridas()}>
              Usar as dicas sugeridas
            </Botao>
            <div className="mt-3">
              <ListaEditavel
                itens={[]}
                rotulo="Dica"
                placeholder="Escrever uma dica minha"
                onAdicionar={(t) => void adicionarDica(t)}
                onEditar={(id, t) => void editarDica(id, t)}
                onApagar={(id) => void apagarDica(id)}
              />
            </div>
          </Cartao>
        ) : (
          <Dicas dicas={dicas} />
        ))}

      {aba === 'lista' && (
        <Cartao titulo="Desafios para o sorteio">
          <p className="mb-3 text-sm text-tinta-suave">
            Um por semana sai desta lista. Desafio bom é pequeno e dá para dizer se fez ou não.
          </p>
          {desafios.length === 0 && (
            <Botao variante="primario" className="mb-3 w-full" onClick={() => void usarDesafiosSugeridos()}>
              Usar a lista sugerida
            </Botao>
          )}
          <ListaEditavel
            itens={desafios}
            rotulo="Desafio"
            placeholder="Novo desafio"
            onAdicionar={(t) => void adicionarDesafio(t)}
            onEditar={(id, t) => void editarDesafio(id, t)}
            onApagar={(id) => void apagarDesafio(id)}
          />
        </Cartao>
      )}
    </div>
  )
}

interface PropsDesafio {
  desafios: Desafio[]
  semanaId: string
  hoje: string
  desafio?: { texto: string }
  tentativas: Tentativa[]
  semanasAnteriores: Semana[]
  onCriarLista: () => void
}

function DesafioDaSemana({ desafios, semanaId, hoje, desafio, tentativas, semanasAnteriores, onCriarLista }: PropsDesafio) {
  const [registrando, setRegistrando] = useState(false)
  const [embaralhando, setEmbaralhando] = useState<string | null>(null)
  const relogio = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearInterval(relogio.current), [])

  const daSemana = tentativas.filter((t) => t.semana === semanaId).sort((a, b) => b.criadoEm - a.criadoEm)
  const aprendizados = tentativas.filter((t) => t.aprendi).sort((a, b) => b.criadoEm - a.criadoEm)

  /** O sorteio: os textos passam rápido por um instante e param no escolhido. */
  function sortear() {
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduzir || desafios.length < 2) {
      void sortearDesafioDaSemana(semanaId)
      return
    }
    let i = 0
    window.clearInterval(relogio.current)
    relogio.current = window.setInterval(() => {
      i += 1
      setEmbaralhando(desafios[i % desafios.length].texto)
      if (i >= 10) {
        window.clearInterval(relogio.current)
        void sortearDesafioDaSemana(semanaId).then(() => setEmbaralhando(null))
      }
    }, 70)
  }

  if (desafios.length === 0) {
    return (
      <Cartao>
        <p className="text-[15px] font-medium">Um desafio de conversa por semana</p>
        <p className="mt-1 text-sm text-tinta-suave">
          Toda semana o app sorteia um desafio pequeno. Depois de tentar, você registra como foi e o que aprendeu.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Botao variante="primario" onClick={() => void usarDesafiosSugeridos()}>
            Usar a lista sugerida
          </Botao>
          <Botao onClick={onCriarLista}>Escrever a minha lista</Botao>
        </div>
      </Cartao>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Cartao titulo="Desafio da semana">
        {embaralhando || !desafio ? (
          <>
            <p
              aria-live="polite"
              className={`min-h-[4.5rem] font-display text-[1.6rem] leading-[1.1] font-medium tracking-tight ${embaralhando ? 'text-tinta-suave' : ''}`}
            >
              {embaralhando ?? 'Qual vai ser o desafio desta semana?'}
            </p>
            <Botao variante="primario" className="mt-4 w-full" disabled={!!embaralhando} onClick={sortear}>
              Sortear o desafio da semana
            </Botao>
          </>
        ) : (
          <>
            <p key={desafio.texto} className="troca-frase min-h-[4.5rem] font-display text-[1.6rem] leading-[1.1] font-medium tracking-tight">
              {desafio.texto}
            </p>
            <p className="mt-2 text-sm text-tinta-suave">
              Até domingo ·{' '}
              {daSemana.length === 0 ? 'nenhuma tentativa ainda' : `${daSemana.length} ${daSemana.length === 1 ? 'tentativa' : 'tentativas'}`}
            </p>
            <Botao variante="primario" className="mt-4 w-full" onClick={() => setRegistrando(true)}>
              Registrar uma tentativa
            </Botao>
            {daSemana.length === 0 && (
              <Botao variante="fantasma" className="mt-1 w-full" onClick={sortear}>
                Sortear outro
              </Botao>
            )}
          </>
        )}
      </Cartao>

      {daSemana.length > 0 && (
        <Cartao titulo="Tentativas desta semana">
          <ul className="flex flex-col gap-2">
            {daSemana.map((t) => (
              <li key={t.id} className="rounded-xl bg-cartao-2 px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-xs text-tinta-suave">
                  <span>
                    {diaCurto(t.dia)} · {COMO_FOI[t.comoFoi]} ({t.comoFoi} de 5)
                  </span>
                  <button type="button" onClick={() => void apagarTentativa(t.id)} className="-my-2 -mr-2 min-h-11 px-2 hover:text-tinta">
                    Apagar
                  </button>
                </div>
                {t.relato && <p className="mt-1 text-sm whitespace-pre-line">{t.relato}</p>}
                {t.aprendi && <p className="mt-1 text-sm text-tinta-suave">Aprendi: {t.aprendi}</p>}
              </li>
            ))}
          </ul>
        </Cartao>
      )}

      {aprendizados.length > 0 && (
        <Cartao titulo="O que você já aprendeu">
          <ul className="flex flex-col gap-1.5">
            {aprendizados.slice(0, 10).map((t) => (
              <li key={t.id} className="text-sm">
                {t.aprendi} <span className="text-xs text-tinta-suave">({diaCurto(t.dia)})</span>
              </li>
            ))}
          </ul>
        </Cartao>
      )}

      {semanasAnteriores.length > 0 && (
        <Cartao titulo="Semanas anteriores">
          <ul>
            {semanasAnteriores.slice(0, 8).map((s) => {
              const n = tentativas.filter((t) => t.semana === s.id).length
              return (
                <li key={s.id} className="flex justify-between gap-3 border-t border-linha py-2 text-sm first:border-t-0 first:pt-0">
                  <span>{s.desafio!.texto}</span>
                  <span className="shrink-0 text-tinta-suave tabular-nums">
                    {n} {n === 1 ? 'tentativa' : 'tentativas'}
                  </span>
                </li>
              )
            })}
          </ul>
        </Cartao>
      )}

      <Folha aberta={registrando} onFechar={() => setRegistrando(false)} titulo="Como foi?">
        {registrando && desafio && (
          <RegistrarTentativa semana={semanaId} hoje={hoje} desafioTexto={desafio.texto} onPronto={() => setRegistrando(false)} />
        )}
      </Folha>
    </div>
  )
}

/** As dicas para ler (e, tocando em Editar, para mudar). */
function Dicas({ dicas }: { dicas: { id: string; texto: string }[] }) {
  const [editando, setEditando] = useState(false)
  return (
    <Cartao
      titulo="Dicas de conversa"
      acao={
        <button
          type="button"
          onClick={() => setEditando(!editando)}
          className="-my-3 -mr-2 min-h-11 px-2 text-sm font-medium text-destaque-texto"
        >
          {editando ? 'Pronto' : 'Editar'}
        </button>
      }
    >
      {editando ? (
        <ListaEditavel
          itens={dicas}
          rotulo="Dica"
          placeholder="Nova dica"
          onAdicionar={(t) => void adicionarDica(t)}
          onEditar={(id, t) => void editarDica(id, t)}
          onApagar={(id) => void apagarDica(id)}
        />
      ) : (
        <ol className="flex flex-col">
          {dicas.map((d, i) => (
            <li key={d.id} className="flex gap-3 border-t border-linha py-3 first:border-t-0 first:pt-1 last:pb-0">
              <span className="w-5 shrink-0 pt-px font-display text-sm text-tinta-suave tabular-nums">{i + 1}</span>
              <p className="text-[15px] leading-snug">{d.texto}</p>
            </li>
          ))}
        </ol>
      )}
    </Cartao>
  )
}
