// XP e níveis por área. Nada disso é guardado: é calculado a partir do que você já fez,
// então nunca fica desencontrado e uma regra nova vale para todo o histórico.
// Gamificação leve: XP nunca é perdido, não tem ranking e cada nível pede um pouco mais que o anterior.

import type {
  AreaId,
  Check,
  Dia,
  Evidencia,
  Leitura,
  RegistroLazer,
  SessaoEstudo,
  Semana,
  Tentativa,
  Treino,
} from '../db/tipos'

export const XP = {
  habitoCompleto: 10,
  habitoMinimo: 6,
  treino: 20,
  /** 1 XP a cada 2 minutos de estudo. */
  minutosPorXpDeEstudo: 2,
  pagina: 1,
  tentativa: 15,
  evidencia: 5,
  vitoria: 2,
  diario: 3,
  lazerEscolhido: 3,
  revisao: 30,
}

export interface DadosXp {
  checks: Check[]
  treinos: Treino[]
  sessoes: SessaoEstudo[]
  leituras: Leitura[]
  tentativas: Tentativa[]
  evidencias: Evidencia[]
  dias: Dia[]
  lazerRegistros: RegistroLazer[]
  semanas: Semana[]
}

export function xpPorArea(d: DadosXp): Record<AreaId, number> {
  const xp: Record<AreaId, number> = { corpo: 0, estudo: 0, leitura: 0, comunicacao: 0, mente: 0, lazer: 0 }
  for (const c of d.checks) xp[c.areaId] += c.tipo === 'completo' ? XP.habitoCompleto : XP.habitoMinimo
  xp.corpo += d.treinos.filter((t) => t.concluidoEm !== undefined).length * XP.treino
  for (const s of d.sessoes) xp.estudo += Math.floor(s.minutos / XP.minutosPorXpDeEstudo)
  for (const l of d.leituras) xp.leitura += l.paginas * XP.pagina
  xp.comunicacao += d.tentativas.length * XP.tentativa
  xp.mente += d.evidencias.length * XP.evidencia
  for (const dia of d.dias) {
    xp.mente += dia.vitorias.length * XP.vitoria + (dia.gratidao ? XP.diario : 0) + (dia.fizBem ? XP.diario : 0)
  }
  xp.mente += d.semanas.filter((s) => s.revisao?.feitaEm).length * XP.revisao
  xp.lazer += d.lazerRegistros.filter((r) => r.escolhido).length * XP.lazerEscolhido
  return xp
}

export interface Nivel {
  nivel: number
  /** XP ganho dentro do nível atual. */
  xpNoNivel: number
  /** Tamanho do nível atual (quanto XP ele pede ao todo). */
  xpDoNivel: number
  xpParaProximo: number
}

/**
 * O nível n começa em 50 × n × (n − 1) XP:
 * nível 1 = 0, nível 2 = 100, nível 3 = 300, nível 4 = 600, nível 5 = 1000...
 * Cada nível pede 100 XP a mais que o anterior.
 */
export function nivel(xp: number): Nivel {
  let n = 1
  while (50 * (n + 1) * n <= xp) n += 1
  const inicio = 50 * n * (n - 1)
  const proximo = 50 * (n + 1) * n
  return { nivel: n, xpNoNivel: xp - inicio, xpDoNivel: proximo - inicio, xpParaProximo: proximo - xp }
}
