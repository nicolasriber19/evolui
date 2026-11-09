import type { DiaISO, ModeloTreino, Serie, Treino } from '../db/tipos'

/** Qual modelo vem agora: o seguinte ao do último treino concluído (A, B, C, A, B...). */
export function proximoModelo(modelos: ModeloTreino[], treinos: Treino[]): ModeloTreino | undefined {
  if (modelos.length === 0) return undefined
  const ordenados = [...modelos].sort((a, b) => a.ordem - b.ordem)
  const ultimo = treinos
    .filter((t) => t.concluidoEm !== undefined && t.modeloId)
    .sort((a, b) => b.iniciadoEm - a.iniciadoEm)[0]
  if (!ultimo) return ordenados[0]
  const i = ordenados.findIndex((m) => m.id === ultimo.modeloId)
  return ordenados[(i + 1) % ordenados.length]
}

/** As séries do último treino em que esse exercício apareceu (para sugerir carga e repetições). */
export function ultimaVez(series: Serie[], exercicioId: string, excetoTreinoId?: string): Serie[] {
  const doExercicio = series.filter((s) => s.exercicioId === exercicioId && s.treinoId !== excetoTreinoId)
  if (doExercicio.length === 0) return []
  const maisRecente = doExercicio.reduce((a, b) => (b.dia > a.dia || (b.dia === a.dia && b.criadoEm > a.criadoEm) ? b : a))
  return doExercicio.filter((s) => s.treinoId === maisRecente.treinoId).sort((a, b) => a.ordem - b.ordem)
}

/** Maior carga de cada dia em que o exercício foi feito, em ordem de data (para o gráfico). */
export function evolucaoCarga(series: Serie[], exercicioId: string): { dia: DiaISO; carga: number }[] {
  const porDia = new Map<DiaISO, number>()
  for (const s of series) {
    if (s.exercicioId === exercicioId) porDia.set(s.dia, Math.max(porDia.get(s.dia) ?? 0, s.cargaKg))
  }
  return [...porDia].sort(([a], [b]) => a.localeCompare(b)).map(([dia, carga]) => ({ dia, carga }))
}

/** Volume = soma de carga × repetições. Um jeito simples de medir o quanto você treinou. */
export function volume(series: Serie[]): number {
  return series.reduce((soma, s) => soma + s.cargaKg * s.repeticoes, 0)
}

/** "8-10" vira 8; "12" vira 12; texto sem número vira 10. */
export function repeticoesSugeridas(texto: string): number {
  const achado = texto.match(/\d+/)
  return achado ? Number(achado[0]) : 10
}
