import Dexie, { type EntityTable } from 'dexie'
import type { Area, Check, Config, Dia, Habito, Semana } from './tipos'

/**
 * O banco de dados do app, guardado no próprio aparelho (IndexedDB).
 * O Dexie é uma biblioteca que deixa o IndexedDB fácil de usar.
 */
export const db = new Dexie('evolui') as Dexie & {
  config: EntityTable<Config, 'id'>
  areas: EntityTable<Area, 'id'>
  habitos: EntityTable<Habito, 'id'>
  checks: EntityTable<Check, 'id'>
  dias: EntityTable<Dia, 'id'>
  semanas: EntityTable<Semana, 'id'>
}

// Cada número de versão descreve as tabelas e os campos que podem ser buscados rápido (índices).
// Para mudar o formato no futuro, criamos db.version(2) aqui embaixo, sem apagar a versão 1.
db.version(1).stores({
  config: 'id',
  areas: 'id, ordem',
  habitos: 'id, areaId, ordem',
  checks: 'id, habitoId, areaId, dia',
  dias: 'id',
  semanas: 'id',
})

export const VERSAO_BANCO = 1

/** Tira da lista os registros marcados como apagados. */
export function vivos<T extends { apagadoEm?: number }>(lista: T[]): T[] {
  return lista.filter((item) => item.apagadoEm === undefined)
}
