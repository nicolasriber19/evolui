// Todas as LEITURAS do banco que as telas usam.
// useLiveQuery "assiste" o banco: quando um dado muda, a tela se redesenha sozinha.
// Enquanto carrega, o valor é `undefined`. Quando o registro não existe, devolvemos `null`.

import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { db, vivos } from './db'
import type { DiaISO, SemanaISO } from './tipos'

export function useConfig() {
  return useLiveQuery(async () => (await db.config.get('geral')) ?? null)
}

export function useAreas() {
  return useLiveQuery(async () => vivos(await db.areas.orderBy('ordem').toArray()))
}

export function useHabitos() {
  return useLiveQuery(async () => vivos(await db.habitos.orderBy('ordem').toArray()))
}

export function useChecks() {
  return useLiveQuery(async () => vivos(await db.checks.toArray()))
}

export function useDia(dia: DiaISO) {
  return useLiveQuery(async () => (await db.dias.get(dia)) ?? null, [dia])
}

export function useSemana(semana: SemanaISO) {
  return useLiveQuery(async () => (await db.semanas.get(semana)) ?? null, [semana])
}

// ---------- Fase 2 ----------

export function useExercicios() {
  return useLiveQuery(async () => vivos(await db.exercicios.toArray()))
}

export function useModelos() {
  return useLiveQuery(async () => vivos(await db.modelos.orderBy('ordem').toArray()))
}

export function useTreinos() {
  return useLiveQuery(async () => vivos(await db.treinos.orderBy('dia').toArray()))
}

export function useSeries() {
  return useLiveQuery(async () => vivos(await db.series.toArray()))
}

export function useMedidas() {
  return useLiveQuery(async () => vivos(await db.medidas.orderBy('id').toArray()))
}

export function useMaterias() {
  return useLiveQuery(async () => vivos(await db.materias.orderBy('ordem').toArray()))
}

export function useSessoes() {
  return useLiveQuery(async () => vivos(await db.sessoes.orderBy('dia').toArray()))
}

/** O timer de foco atual, ou null se nenhum estiver rodando. */
export function useEstadoFoco() {
  return useLiveQuery(async () => (await db.estado.get('foco')) ?? null)
}

export function useLivros() {
  return useLiveQuery(async () => vivos(await db.livros.orderBy('ordem').toArray()))
}

export function useLeituras() {
  return useLiveQuery(async () => vivos(await db.leituras.orderBy('dia').toArray()))
}

export function useNotasLivro(livroId: string) {
  return useLiveQuery(async () => vivos(await db.notasLivro.where('livroId').equals(livroId).toArray()), [livroId])
}

/**
 * A hora atual, atualizada a cada minuto e sempre que o app volta para a tela.
 * Serve para o dia virar sozinho se o app ficar aberto de madrugada.
 */
export function useAgora(intervaloMs = 60_000): Date {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const atualizar = () => setAgora(new Date())
    const relogio = setInterval(atualizar, intervaloMs)
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') atualizar()
    }
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      clearInterval(relogio)
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [intervaloMs])
  return agora
}
