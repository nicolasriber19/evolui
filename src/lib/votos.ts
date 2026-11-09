import type { AreaId, Check, DiaISO } from '../db/tipos'

/** Agrupa os checks por hábito: para cada hábito, o conjunto de dias cumpridos. */
export function feitosPorHabito(checks: Check[]): Map<string, Set<DiaISO>> {
  const mapa = new Map<string, Set<DiaISO>>()
  for (const c of checks) {
    if (!mapa.has(c.habitoId)) mapa.set(c.habitoId, new Set())
    mapa.get(c.habitoId)!.add(c.dia)
  }
  return mapa
}

/** Os votos de uma área separados por dia (um array por dia, na mesma ordem de `dias`). */
export function votosPorDia(checks: Check[], areaId: AreaId, dias: DiaISO[]): Check[][] {
  return dias.map((dia) => checks.filter((c) => c.areaId === areaId && c.dia === dia))
}
