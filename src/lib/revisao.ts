// O resumo automático da semana (para a revisão de domingo) e o mapa de calor dos hábitos.

import type {
  AreaId,
  Check,
  Dia,
  DiaISO,
  Habito,
  Leitura,
  RegistroLazer,
  SessaoEstudo,
  Semana,
  Tentativa,
  TipoLazer,
  Treino,
} from '../db/tipos'
import { agendadoEm } from './corrente'
import { diasDaSemana, semanaISO, somarDias } from './datas'
import { contarPromessas, fracaoEscolhida, usoDaSemana } from './fase3'

export interface DadosSemana {
  habitos: Habito[]
  checks: Check[]
  treinos: Treino[]
  sessoes: SessaoEstudo[]
  leituras: Leitura[]
  tentativas: Tentativa[]
  dias: Dia[]
  semanas: Semana[]
  tiposLazer: TipoLazer[]
  lazerRegistros: RegistroLazer[]
}

export interface ResumoSemana {
  /** Os 7 dias da semana (segunda a domingo). */
  dias: DiaISO[]
  votosPorDia: number[]
  votosPorArea: Record<AreaId, number>
  totalVotos: number
  /** Dias de hábito cumpridos / dias de hábito marcados (só até hoje). */
  habitos: { feitos: number; agendados: number; fracao: number | null }
  treinos: number
  minutosEstudo: number
  paginas: number
  tentativas: number
  lazer: { usado: number; orcamento: number; escolhido: number | null } | null
  humorPorDia: (number | undefined)[]
  energiaPorDia: (number | undefined)[]
  melhorDia: { dia: DiaISO; votos: number } | null
  promessas: number
}

/** Tudo o que aconteceu na semana que contém `diaDaSemana`, contando só até `hoje`. */
export function resumoDaSemana(diaDaSemana: DiaISO, hoje: DiaISO, d: DadosSemana): ResumoSemana {
  const dias = diasDaSemana(diaDaSemana)
  const naSemana = new Set(dias)
  const checksSemana = d.checks.filter((c) => naSemana.has(c.dia))
  const votosPorDia = dias.map((dia) => checksSemana.filter((c) => c.dia === dia).length)
  const votosPorArea: Record<AreaId, number> = { corpo: 0, estudo: 0, leitura: 0, comunicacao: 0, mente: 0, lazer: 0 }
  for (const c of checksSemana) votosPorArea[c.areaId] += 1

  const feitosChave = new Set(checksSemana.map((c) => `${c.habitoId}:${c.dia}`))
  let agendados = 0
  let feitos = 0
  for (const dia of dias.filter((x) => x <= hoje)) {
    for (const h of d.habitos) {
      if (!agendadoEm(h, dia)) continue
      agendados += 1
      if (feitosChave.has(`${h.id}:${dia}`)) feitos += 1
    }
  }

  const ativosLazer = d.tiposLazer.filter((t) => t.ativo)
  const registrosSemana = d.lazerRegistros.filter((r) => naSemana.has(r.dia))
  const lazer =
    ativosLazer.length > 0
      ? {
          usado: usoDaSemana(ativosLazer, d.lazerRegistros, dias).reduce((s, u) => s + u.usado, 0),
          orcamento: ativosLazer.reduce((s, t) => s + t.orcamentoMin, 0),
          escolhido: fracaoEscolhida(registrosSemana),
        }
      : null

  const diaDe = (dia: DiaISO) => d.dias.find((x) => x.id === dia)
  const maxVotos = Math.max(...votosPorDia)
  const melhor = maxVotos > 0 ? votosPorDia.indexOf(maxVotos) : -1

  return {
    dias,
    votosPorDia,
    votosPorArea,
    totalVotos: checksSemana.length,
    habitos: { feitos, agendados, fracao: agendados > 0 ? feitos / agendados : null },
    treinos: d.treinos.filter((t) => t.concluidoEm !== undefined && naSemana.has(t.dia)).length,
    minutosEstudo: d.sessoes.filter((s) => naSemana.has(s.dia)).reduce((soma, s) => soma + s.minutos, 0),
    paginas: d.leituras.filter((l) => naSemana.has(l.dia)).reduce((soma, l) => soma + l.paginas, 0),
    tentativas: d.tentativas.filter((t) => t.semana === semanaISO(diaDaSemana)).length,
    lazer,
    humorPorDia: dias.map((dia) => diaDe(dia)?.humor),
    energiaPorDia: dias.map((dia) => diaDe(dia)?.energia),
    melhorDia: melhor >= 0 ? { dia: dias[melhor], votos: maxVotos } : null,
    promessas: contarPromessas({ checks: d.checks, dias: d.dias, semanas: d.semanas, tentativas: d.tentativas }, dias).total,
  }
}

/**
 * TAREFA DO NICOLAS (Fase 4)
 * Recebe o humor de cada dia da semana (de 1 a 5, ou undefined nos dias sem check-in)
 * e devolve a média, com uma casa decimal. Sem nenhum dia preenchido, devolve null.
 *   [4, undefined, 3, 5, undefined, undefined, undefined] -> 4
 *   [3, 4] -> 3.5
 *   [2, 3, 3] -> 2.7   (8 / 3 = 2,666... arredonda para 2,7)
 *   [undefined, undefined] -> null
 * Dicas: filtre os undefined com .filter((v) => v !== undefined); some com .reduce;
 * para arredondar a uma casa: Math.round(valor * 10) / 10.
 * Os testes estão em revisao.test.ts (troque os it.todo por it). Enquanto devolver null,
 * a revisão de domingo mostra a linha do humor, mas não mostra a média.
 */
export function humorMedio(valores: (number | undefined)[]): number | null {
  void valores
  return null
}

// ---------- Mapa de calor dos hábitos ----------

export interface CelulaMapa {
  dia: DiaISO
  agendados: number
  feitos: number
  /** 0 a 4 = quanto dos hábitos do dia foi feito; null = dia sem hábito marcado ou no futuro. */
  nivel: 0 | 1 | 2 | 3 | 4 | null
}

/** As últimas `semanas` semanas, uma coluna por semana (segunda a domingo). */
export function mapaDeHabitos(habitos: Habito[], checks: Check[], hoje: DiaISO, semanas = 16): CelulaMapa[][] {
  const feitos = new Set(checks.map((c) => `${c.habitoId}:${c.dia}`))
  const primeiraSegunda = somarDias(diasDaSemana(hoje)[0], -7 * (semanas - 1))
  const colunas: CelulaMapa[][] = []
  for (let s = 0; s < semanas; s += 1) {
    const coluna: CelulaMapa[] = []
    for (let i = 0; i < 7; i += 1) {
      const dia = somarDias(primeiraSegunda, s * 7 + i)
      if (dia > hoje) {
        coluna.push({ dia, agendados: 0, feitos: 0, nivel: null })
        continue
      }
      const doDia = habitos.filter((h) => agendadoEm(h, dia))
      const feitosDia = doDia.filter((h) => feitos.has(`${h.id}:${dia}`)).length
      const fracao = doDia.length > 0 ? feitosDia / doDia.length : 0
      const nivel = doDia.length === 0 ? null : fracao === 0 ? 0 : fracao < 0.34 ? 1 : fracao < 0.67 ? 2 : fracao < 1 ? 3 : 4
      coluna.push({ dia, agendados: doDia.length, feitos: feitosDia, nivel })
    }
    colunas.push(coluna)
  }
  return colunas
}
