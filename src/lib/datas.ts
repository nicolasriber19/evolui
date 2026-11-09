import { addDays, differenceInCalendarDays, format, getISOWeek, getISOWeekYear, startOfISOWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DiaISO, SemanaISO } from '../db/tipos'

export const VIRADA_PADRAO = 4

/**
 * O "dia lógico": antes da hora da virada (4h), ainda conta como o dia anterior.
 * Assim, marcar algo à 0h30 vale para o dia que você estava vivendo.
 */
export function diaLogico(agora: Date = new Date(), viradaHora = VIRADA_PADRAO): DiaISO {
  const ajustada = new Date(agora)
  ajustada.setHours(ajustada.getHours() - viradaHora)
  return format(ajustada, 'yyyy-MM-dd')
}

/** Converte 'AAAA-MM-DD' em Date ao meio-dia (meio-dia evita erros de fuso horário). */
export function paraData(dia: DiaISO): Date {
  const [ano, mes, d] = dia.split('-').map(Number)
  return new Date(ano, mes - 1, d, 12)
}

export function somarDias(dia: DiaISO, n: number): DiaISO {
  return format(addDays(paraData(dia), n), 'yyyy-MM-dd')
}

/** Quantos dias de `de` até `ate` (positivo se `ate` vem depois). */
export function diasEntre(de: DiaISO, ate: DiaISO): number {
  return differenceInCalendarDays(paraData(ate), paraData(de))
}

/** 0 = domingo, 1 = segunda ... 6 = sábado (igual ao Date do JavaScript). */
export function diaDaSemana(dia: DiaISO): number {
  return paraData(dia).getDay()
}

export function semanaISO(dia: DiaISO): SemanaISO {
  const d = paraData(dia)
  return `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, '0')}`
}

/** Os 7 dias (segunda a domingo) da semana que contém `dia`. */
export function diasDaSemana(dia: DiaISO): DiaISO[] {
  const segunda = startOfISOWeek(paraData(dia))
  return Array.from({ length: 7 }, (_, i) => format(addDays(segunda, i), 'yyyy-MM-dd'))
}

/** Ex.: 'segunda, 9 de novembro'. */
export function diaPorExtenso(dia: DiaISO): string {
  return format(paraData(dia), "EEEE, d 'de' MMMM", { locale: ptBR }).replace('-feira', '')
}

/** Ex.: '9 de nov.' */
export function diaCurto(dia: DiaISO): string {
  return format(paraData(dia), "d 'de' MMM", { locale: ptBR })
}

/** Um número que cresce 1 por dia. Serve para alternar coisas dia após dia. */
export function numeroDoDia(dia: DiaISO): number {
  return Math.round(paraData(dia).getTime() / 86_400_000)
}

/** É "noite" a partir da hora das vitórias até a virada do dia (ex.: 20h às 4h). */
export function ehNoite(agora: Date, vitoriasHora: number, viradaHora = VIRADA_PADRAO): boolean {
  const h = agora.getHours()
  return h >= vitoriasHora || h < viradaHora
}

const NOMES_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

/** Descreve os dias de um hábito: 'todo dia', 'seg a sex', 'seg, qua, sex'... */
export function descreverDias(dias: number[]): string {
  const set = new Set(dias)
  if (set.size === 7) return 'todo dia'
  if (set.size === 0) return 'nenhum dia'
  if (set.size === 2 && set.has(0) && set.has(6)) return 'fim de semana'
  // Semana começando na segunda: posições 0 (seg) a 6 (dom).
  const ordem = [1, 2, 3, 4, 5, 6, 0]
  const posicoes = ordem.map((d, i) => (set.has(d) ? i : -1)).filter((i) => i >= 0)
  const seguidos = posicoes.every((p, i) => i === 0 || p === posicoes[i - 1] + 1)
  if (seguidos && posicoes.length >= 3) {
    return `${NOMES_CURTOS[ordem[posicoes[0]]]} a ${NOMES_CURTOS[ordem[posicoes[posicoes.length - 1]]]}`
  }
  return posicoes.map((p) => NOMES_CURTOS[ordem[p]]).join(', ')
}

/** A segunda-feira de uma semana ISO: '2026-W46' vira '2026-11-09'. */
export function segundaDaSemana(semana: SemanaISO): DiaISO {
  const [ano, numero] = semana.split('-W').map(Number)
  // O dia 4 de janeiro sempre cai na semana 1 do ano ISO.
  const segundaDaSemana1 = startOfISOWeek(new Date(ano, 0, 4, 12))
  return format(addDays(segundaDaSemana1, (numero - 1) * 7), 'yyyy-MM-dd')
}

/** Ex.: '9 a 15 de nov.' */
export function intervaloDaSemana(semana: SemanaISO): string {
  const seg = segundaDaSemana(semana)
  const dom = somarDias(seg, 6)
  return `${paraData(seg).getDate()} a ${diaCurto(dom)}`
}

/** Só o número da semana: '2026-W46' vira 46. */
export function numeroDaSemana(semana: SemanaISO): number {
  return Number(semana.split('-W')[1])
}
