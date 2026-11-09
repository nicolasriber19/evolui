// Todas as GRAVAÇÕES no banco passam por aqui.
// As telas nunca mexem no Dexie direto para escrever: chamam estas funções.
// Assim, se um dia o app sincronizar com a nuvem, só este arquivo precisa mudar.

import { db } from './db'
import type { Area, AreaId, Config, Dia, DiaISO, Habito, ItemLista, SemanaISO, TipoCheck } from './tipos'
import { novoId } from '../lib/id'
import { semanaISO } from '../lib/datas'

const agora = () => Date.now()

export function configPadrao(): Config {
  return {
    id: 'geral',
    tema: 'escuro',
    viradaHora: 4,
    vitoriasHora: 20,
    onboardingFeito: false,
    criadoEm: agora(),
    atualizadoEm: agora(),
  }
}

export async function atualizarConfig(mudancas: Partial<Omit<Config, 'id'>>): Promise<void> {
  await db.transaction('rw', db.config, async () => {
    const atual = (await db.config.get('geral')) ?? configPadrao()
    await db.config.put({ ...atual, ...mudancas, atualizadoEm: agora() })
  })
}

// ---------- Hábitos ----------

export interface DadosHabito {
  areaId: AreaId
  nome: string
  versaoMinima: string
  dias: number[]
}

/** Marca (completo ou mínimo) ou desmarca (null) um hábito num dia. */
export async function marcarHabito(h: Habito, dia: DiaISO, tipo: TipoCheck | null): Promise<void> {
  const id = `${h.id}:${dia}`
  if (tipo === null) {
    await db.checks.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
    return
  }
  const existente = await db.checks.get(id)
  // put = "grava por cima". Sem o campo apagadoEm, o check volta a valer.
  await db.checks.put({
    id,
    habitoId: h.id,
    areaId: h.areaId,
    dia,
    tipo,
    criadoEm: existente?.criadoEm ?? agora(),
    atualizadoEm: agora(),
  })
}

export async function criarHabito(dados: DadosHabito, hoje: DiaISO): Promise<string> {
  const id = novoId()
  const ordem = await db.habitos.count()
  await db.habitos.add({
    id,
    ...dados,
    inicio: hoje,
    pausas: [],
    ativo: true,
    ordem,
    criadoEm: agora(),
    atualizadoEm: agora(),
  })
  return id
}

export async function editarHabito(id: string, dados: Partial<DadosHabito>): Promise<void> {
  await db.habitos.update(id, { ...dados, atualizadoEm: agora() })
}

export async function pausarHabito(h: Habito, hoje: DiaISO): Promise<void> {
  await db.habitos.update(h.id, { ativo: false, pausas: [...h.pausas, { de: hoje }], atualizadoEm: agora() })
}

export async function retomarHabito(h: Habito, hoje: DiaISO): Promise<void> {
  const pausas = h.pausas
    .map((p) => (p.ate === undefined ? { ...p, ate: hoje } : p))
    .filter((p) => p.de !== p.ate) // pausou e voltou no mesmo dia: não houve pausa
  await db.habitos.update(h.id, { ativo: true, pausas, atualizadoEm: agora() })
}

export async function apagarHabito(id: string): Promise<void> {
  await db.habitos.update(id, { ativo: false, apagadoEm: agora(), atualizadoEm: agora() })
}

// ---------- Áreas ----------

export async function atualizarArea(id: AreaId, mudancas: Partial<Pick<Area, 'ativa' | 'frase'>>): Promise<void> {
  await db.areas.update(id, { ...mudancas, atualizadoEm: agora() })
}

// ---------- Dia (check-in, prioridades, vitórias) ----------

function diaVazio(id: DiaISO): Dia {
  return { id, prioridades: [], vitorias: [], criadoEm: agora(), atualizadoEm: agora() }
}

async function alterarDia(dia: DiaISO, mudancas: Partial<Omit<Dia, 'id'>>): Promise<void> {
  await db.transaction('rw', db.dias, async () => {
    const atual = (await db.dias.get(dia)) ?? diaVazio(dia)
    await db.dias.put({ ...atual, ...mudancas, atualizadoEm: agora() })
  })
}

export const salvarCheckin = (dia: DiaISO, campo: 'energia' | 'humor', valor: number) =>
  alterarDia(dia, { [campo]: valor })

export const salvarPrioridades = (dia: DiaISO, prioridades: ItemLista[]) => alterarDia(dia, { prioridades })

export const salvarVitorias = (dia: DiaISO, vitorias: string[]) => alterarDia(dia, { vitorias })

// ---------- Semana ----------

export async function salvarMetas(semana: SemanaISO, metas: ItemLista[]): Promise<void> {
  await db.transaction('rw', db.semanas, async () => {
    const atual = await db.semanas.get(semana)
    await db.semanas.put({
      id: semana,
      criadoEm: atual?.criadoEm ?? agora(),
      ...atual,
      metas,
      atualizadoEm: agora(),
    })
  })
}

export function novoItem(texto: string): ItemLista {
  return { id: novoId(), texto, feita: false }
}

// ---------- Primeiro uso ----------

export interface DadosOnboarding {
  areas: { id: AreaId; ativa: boolean; frase: string }[]
  habitos: DadosHabito[]
  metas: string[]
}

export async function concluirOnboarding(dados: DadosOnboarding, hoje: DiaISO): Promise<void> {
  const t = agora()
  await db.transaction('rw', [db.config, db.areas, db.habitos, db.semanas], async () => {
    await db.areas.bulkPut(dados.areas.map((a, ordem) => ({ ...a, ordem, criadoEm: t, atualizadoEm: t })))
    await db.habitos.bulkAdd(
      dados.habitos.map((h, ordem) => ({
        id: novoId(),
        ...h,
        inicio: hoje,
        pausas: [],
        ativo: true,
        ordem,
        criadoEm: t,
        atualizadoEm: t,
      })),
    )
    if (dados.metas.length > 0) {
      await db.semanas.put({ id: semanaISO(hoje), metas: dados.metas.map(novoItem), criadoEm: t, atualizadoEm: t })
    }
    const atual = (await db.config.get('geral')) ?? configPadrao()
    await db.config.put({ ...atual, onboardingFeito: true, inicioEm: hoje, atualizadoEm: t })
  })
}
