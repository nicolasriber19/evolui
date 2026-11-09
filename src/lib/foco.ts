import type { EstadoFoco } from '../db/tipos'

// O timer de foco (Pomodoro) é guardado como "quando a fase acaba", e não como
// "quantos segundos faltam". Assim ele continua certo mesmo se você fechar o app:
// ao voltar, basta comparar o horário de agora com o horário de fim.

export const FOCO_PADRAO = 25
export const PAUSA_PADRAO = 5
const MINUTO = 60_000

export function restanteMs(e: EstadoFoco, agora: number): number {
  return e.rodando && e.fimEm !== undefined ? Math.max(0, e.fimEm - agora) : e.restanteMs
}

export function faseAcabou(e: EstadoFoco, agora: number): boolean {
  return e.rodando && e.fimEm !== undefined && agora >= e.fimEm
}

export function comecarFoco(materiaId: string, focoMin: number, agora: number): EstadoFoco {
  const duracaoMs = focoMin * MINUTO
  return {
    id: 'foco',
    materiaId,
    fase: 'foco',
    rodando: true,
    fimEm: agora + duracaoMs,
    restanteMs: duracaoMs,
    duracaoMs,
    inicioFaseEm: agora,
    criadoEm: agora,
    atualizadoEm: agora,
  }
}

export function pausar(e: EstadoFoco, agora: number): EstadoFoco {
  if (!e.rodando) return e
  return { ...e, rodando: false, restanteMs: restanteMs(e, agora), fimEm: undefined, atualizadoEm: agora }
}

export function continuar(e: EstadoFoco, agora: number): EstadoFoco {
  if (e.rodando) return e
  return { ...e, rodando: true, fimEm: agora + e.restanteMs, atualizadoEm: agora }
}

/** A pausa começa no instante em que o foco acabou (mesmo que você só tenha voltado ao app depois). */
export function comecarPausa(e: EstadoFoco, pausaMin: number, agora: number): EstadoFoco {
  const inicio = e.fimEm ?? agora
  const duracaoMs = pausaMin * MINUTO
  return {
    ...e,
    fase: 'pausa',
    rodando: true,
    fimEm: inicio + duracaoMs,
    restanteMs: duracaoMs,
    duracaoMs,
    inicioFaseEm: inicio,
    atualizadoEm: agora,
  }
}

/** Minutos inteiros de foco já cumpridos nesta fase. */
export function minutosFocados(e: EstadoFoco, agora: number): number {
  if (e.fase !== 'foco') return 0
  return Math.floor((e.duracaoMs - restanteMs(e, agora)) / MINUTO)
}
