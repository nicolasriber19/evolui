// Regras puras da Fase 3 (sem tela e sem banco): fáceis de testar.

import type { Check, Desafio, Dia, DiaISO, RegistroLazer, Semana, Tentativa, TipoLazer } from '../db/tipos'
import { semanaISO } from './datas'

// ---------- Comunicação ----------

/**
 * Sorteia o desafio da semana, evitando os textos que saíram nas últimas semanas.
 * `aleatorio` é um número de 0 a 1 (nos testes a gente passa um valor fixo).
 */
export function sortearDesafio(lista: Desafio[], evitar: string[], aleatorio = Math.random()): Desafio | undefined {
  if (lista.length === 0) return undefined
  const novos = lista.filter((d) => !evitar.includes(d.texto))
  const opcoes = novos.length > 0 ? novos : lista
  return opcoes[Math.min(opcoes.length - 1, Math.floor(aleatorio * opcoes.length))]
}

// ---------- Lazer ----------

export interface UsoLazer {
  tipo: TipoLazer
  usado: number
  /** Quanto ainda cabe no orçamento (0 se já passou). */
  sobra: number
  /** Quanto passou do orçamento (0 se não passou). */
  passou: number
}

export function usoDaSemana(tipos: TipoLazer[], registros: RegistroLazer[], dias: DiaISO[]): UsoLazer[] {
  const semana = new Set(dias)
  return tipos.map((tipo) => {
    const usado = registros.filter((r) => r.tipoId === tipo.id && semana.has(r.dia)).reduce((s, r) => s + r.minutos, 0)
    return {
      tipo,
      usado,
      sobra: Math.max(0, tipo.orcamentoMin - usado),
      passou: Math.max(0, usado - tipo.orcamentoMin),
    }
  })
}

/** De 0 a 1: quanto do tempo de lazer foi escolhido (e não no automático). null = nada registrado. */
export function fracaoEscolhida(registros: RegistroLazer[]): number | null {
  const total = registros.reduce((s, r) => s + r.minutos, 0)
  if (total === 0) return null
  return registros.filter((r) => r.escolhido).reduce((s, r) => s + r.minutos, 0) / total
}

// ---------- Mente: promessas cumpridas ----------

export interface Promessas {
  total: number
  votos: number
  prioridades: number
  metas: number
  desafios: number
}

/**
 * "Promessas cumpridas com você mesmo" não é guardado: é contado a partir do que você já fez.
 * Cada hábito marcado, prioridade concluída, meta da semana cumprida e desafio de conversa tentado conta 1.
 * Se `dias` vier, conta só esses dias (ex.: a semana atual).
 */
export function contarPromessas(
  dados: { checks: Check[]; dias: Dia[]; semanas: Semana[]; tentativas: Tentativa[] },
  dias?: DiaISO[],
): Promessas {
  const dentro = (dia: DiaISO) => !dias || dias.includes(dia)
  // Metas são da semana: contam as semanas que tocam algum dos dias pedidos.
  const semanasDentro = dias ? new Set(dias.map(semanaISO)) : null
  const votos = dados.checks.filter((c) => dentro(c.dia)).length
  const prioridades = dados.dias
    .filter((d) => dentro(d.id))
    .reduce((soma, d) => soma + d.prioridades.filter((p) => p.feita).length, 0)
  const metas = dados.semanas
    .filter((s) => !semanasDentro || semanasDentro.has(s.id))
    .reduce((soma, s) => soma + s.metas.filter((m) => m.feita).length, 0)
  const desafios = dados.tentativas.filter((t) => dentro(t.dia)).length
  return { total: votos + prioridades + metas + desafios, votos, prioridades, metas, desafios }
}
