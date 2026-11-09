import type { DiaISO, Habito } from '../db/tipos'
import { diaDaSemana, somarDias } from './datas'

/**
 * A regra "nunca falhar duas vezes".
 *
 * - Só contam os dias marcados para o hábito (ex.: academia de segunda a sexta).
 * - Completo ou versão mínima: o dia está cumprido.
 * - 1 falta: o "elo fica aberto". A corrente continua, só não cresce naquele dia.
 * - 2 faltas seguidas: a corrente recomeça do zero. O recorde e a consistência continuam.
 * - Hoje só vira falta quando o dia acaba.
 */

export type EstadoCorrente =
  | 'feito' // hoje é dia do hábito e ele já foi marcado
  | 'em-dia' // nenhuma falta pendente
  | 'elo-aberto' // a última vez ficou sem marcar (1 falta)
  | 'recomecar' // 2 ou mais faltas seguidas
  | 'folga' // hoje não é dia desse hábito e não há falta pendente

export interface ResultadoCorrente {
  estado: EstadoCorrente
  /** Dias cumpridos na corrente atual. */
  corrente: number
  /** Maior corrente que já existiu. */
  recorde: number
  /** Faltas seguidas mais recentes (sem contar hoje). */
  faltasSeguidas: number
  /** De 0 a 1: dias cumpridos / dias marcados nas últimas 4 semanas. null = ainda sem dias para medir. */
  consistencia: number | null
  hojeAgendado: boolean
}

type DadosDoHabito = Pick<Habito, 'dias' | 'inicio' | 'pausas'>

function emPausa(h: DadosDoHabito, dia: DiaISO): boolean {
  // Datas no formato AAAA-MM-DD podem ser comparadas como texto: '2026-11-09' < '2026-11-10'.
  return h.pausas.some((p) => dia >= p.de && (p.ate === undefined || dia < p.ate))
}

/** O hábito "vale" neste dia? */
export function agendadoEm(h: DadosDoHabito, dia: DiaISO): boolean {
  return dia >= h.inicio && h.dias.includes(diaDaSemana(dia)) && !emPausa(h, dia)
}

export function calcularCorrente(
  h: DadosDoHabito,
  feitos: Set<DiaISO>,
  hoje: DiaISO,
  janelaDias = 28,
): ResultadoCorrente {
  let atual = 0
  let recorde = 0
  let faltas = 0
  let agendadosNaJanela = 0
  let feitosNaJanela = 0
  const inicioJanela = somarDias(hoje, -(janelaDias - 1))

  // Anda dia por dia, do início do hábito até hoje.
  for (let dia = h.inicio; dia <= hoje; dia = somarDias(dia, 1)) {
    if (!agendadoEm(h, dia)) continue
    const feito = feitos.has(dia)
    if (dia === hoje && !feito) break // hoje ainda não acabou: não é falta

    if (feito) {
      atual += 1
      faltas = 0
    } else {
      faltas += 1
      if (faltas >= 2) atual = 0 // segunda falta seguida: a corrente recomeça
    }
    recorde = Math.max(recorde, atual)

    if (dia >= inicioJanela) {
      agendadosNaJanela += 1
      if (feito) feitosNaJanela += 1
    }
  }

  const hojeAgendado = agendadoEm(h, hoje)
  let estado: EstadoCorrente
  if (hojeAgendado && feitos.has(hoje)) estado = 'feito'
  else if (faltas >= 2) estado = 'recomecar'
  else if (faltas === 1) estado = 'elo-aberto'
  else if (!hojeAgendado) estado = 'folga'
  else estado = 'em-dia'

  return {
    estado,
    corrente: atual,
    recorde,
    faltasSeguidas: faltas,
    consistencia: agendadosNaJanela > 0 ? feitosNaJanela / agendadosNaJanela : null,
    hojeAgendado,
  }
}
