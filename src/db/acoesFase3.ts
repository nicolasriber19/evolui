// Gravações da Fase 3: Comunicação (desafios, tentativas, dicas), Mente (diário, evidências) e Lazer.

import { db, vivos } from './db'
import type { AreaId, DiaISO, Semana, SemanaISO, TipoLazer } from './tipos'
import { DESAFIOS_SUGERIDOS, DICAS_SUGERIDAS, LAZER_SUGERIDO } from '../data/comunicacao'
import { sortearDesafio } from '../lib/fase3'
import { novoId } from '../lib/id'

const agora = () => Date.now()

// ---------- Comunicação: lista de desafios ----------

export async function usarDesafiosSugeridos(): Promise<void> {
  const base = await db.desafios.count()
  await db.desafios.bulkAdd(
    DESAFIOS_SUGERIDOS.map((texto, i) => ({ id: novoId(), texto, ordem: base + i, criadoEm: agora(), atualizadoEm: agora() })),
  )
}

export async function adicionarDesafio(texto: string): Promise<void> {
  const ordem = await db.desafios.count()
  await db.desafios.add({ id: novoId(), texto: texto.trim(), ordem, criadoEm: agora(), atualizadoEm: agora() })
}

export async function editarDesafio(id: string, texto: string): Promise<void> {
  await db.desafios.update(id, { texto: texto.trim(), atualizadoEm: agora() })
}

export async function apagarDesafio(id: string): Promise<void> {
  await db.desafios.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
}

/** Sorteia o desafio da semana, evitando os das últimas 4 semanas. */
export async function sortearDesafioDaSemana(semana: SemanaISO): Promise<void> {
  await db.transaction('rw', db.desafios, db.semanas, async () => {
    const lista = vivos(await db.desafios.orderBy('ordem').toArray())
    const anteriores = (await db.semanas.toArray())
      .filter((s) => s.id < semana && s.desafio)
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 4)
      .map((s) => s.desafio!.texto)
    const atual = await db.semanas.get(semana)
    // Ao sortear de novo na mesma semana, evita também o desafio que acabou de sair.
    const evitar = atual?.desafio ? [...anteriores, atual.desafio.texto] : anteriores
    const escolhido = sortearDesafio(lista, evitar)
    if (!escolhido) return
    const semanaNova: Semana = {
      id: semana,
      metas: atual?.metas ?? [],
      criadoEm: atual?.criadoEm ?? agora(),
      ...atual,
      desafio: { desafioId: escolhido.id, texto: escolhido.texto, sorteadoEm: agora() },
      atualizadoEm: agora(),
    }
    await db.semanas.put(semanaNova)
  })
}

export interface DadosTentativa {
  comoFoi: number
  relato: string
  aprendi: string
}

export async function registrarTentativa(semana: SemanaISO, dia: DiaISO, desafioTexto: string, dados: DadosTentativa) {
  await db.tentativas.add({
    id: novoId(),
    semana,
    dia,
    desafioTexto,
    ...dados,
    relato: dados.relato.trim(),
    aprendi: dados.aprendi.trim(),
    criadoEm: agora(),
    atualizadoEm: agora(),
  })
}

export async function apagarTentativa(id: string): Promise<void> {
  await db.tentativas.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
}

// ---------- Comunicação: dicas ----------

export async function usarDicasSugeridas(): Promise<void> {
  const base = await db.dicas.count()
  await db.dicas.bulkAdd(DICAS_SUGERIDAS.map((texto, i) => ({ id: novoId(), texto, ordem: base + i, criadoEm: agora(), atualizadoEm: agora() })))
}

export async function adicionarDica(texto: string): Promise<void> {
  const ordem = await db.dicas.count()
  await db.dicas.add({ id: novoId(), texto: texto.trim(), ordem, criadoEm: agora(), atualizadoEm: agora() })
}

export async function editarDica(id: string, texto: string): Promise<void> {
  await db.dicas.update(id, { texto: texto.trim(), atualizadoEm: agora() })
}

export async function apagarDica(id: string): Promise<void> {
  await db.dicas.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
}

// ---------- Mente ----------

export async function salvarDiario(dia: DiaISO, campo: 'gratidao' | 'fizBem', texto: string): Promise<void> {
  await db.transaction('rw', db.dias, async () => {
    const atual = await db.dias.get(dia)
    await db.dias.put({
      id: dia,
      prioridades: [],
      vitorias: [],
      criadoEm: agora(),
      ...atual,
      [campo]: texto.trim() || undefined,
      atualizadoEm: agora(),
    })
  })
}

export async function adicionarEvidencia(texto: string, dia: DiaISO, areaId?: AreaId): Promise<void> {
  await db.evidencias.add({ id: novoId(), texto: texto.trim(), dia, areaId, criadoEm: agora(), atualizadoEm: agora() })
}

export async function apagarEvidencia(id: string): Promise<void> {
  await db.evidencias.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
}

// ---------- Lazer ----------

export async function usarLazerSugerido(): Promise<void> {
  const base = await db.lazerTipos.count()
  await db.lazerTipos.bulkAdd(
    LAZER_SUGERIDO.map((t, i) => ({ id: novoId(), ...t, ativo: true, ordem: base + i, criadoEm: agora(), atualizadoEm: agora() })),
  )
}

export async function adicionarTipoLazer(nome: string, orcamentoMin: number): Promise<void> {
  const ordem = await db.lazerTipos.count()
  await db.lazerTipos.add({ id: novoId(), nome: nome.trim(), orcamentoMin, ativo: true, ordem, criadoEm: agora(), atualizadoEm: agora() })
}

export async function editarTipoLazer(id: string, mudancas: Partial<Pick<TipoLazer, 'nome' | 'orcamentoMin' | 'ativo'>>) {
  await db.lazerTipos.update(id, { ...mudancas, atualizadoEm: agora() })
}

export async function registrarLazer(tipoId: string, dia: DiaISO, minutos: number, escolhido: boolean): Promise<void> {
  if (minutos <= 0) return
  await db.lazerRegistros.add({ id: novoId(), tipoId, dia, minutos, escolhido, criadoEm: agora(), atualizadoEm: agora() })
}

export async function apagarRegistroLazer(id: string): Promise<void> {
  await db.lazerRegistros.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
}
