import Dexie, { type EntityTable } from 'dexie'
import type {
  Area,
  Check,
  Config,
  Dia,
  EstadoFoco,
  Exercicio,
  Habito,
  Leitura,
  Livro,
  Materia,
  Medida,
  ModeloTreino,
  NotaLivro,
  SessaoEstudo,
  Semana,
  Serie,
  Treino,
} from './tipos'

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
  // Fase 2
  exercicios: EntityTable<Exercicio, 'id'>
  modelos: EntityTable<ModeloTreino, 'id'>
  treinos: EntityTable<Treino, 'id'>
  series: EntityTable<Serie, 'id'>
  medidas: EntityTable<Medida, 'id'>
  materias: EntityTable<Materia, 'id'>
  sessoes: EntityTable<SessaoEstudo, 'id'>
  estado: EntityTable<EstadoFoco, 'id'>
  livros: EntityTable<Livro, 'id'>
  leituras: EntityTable<Leitura, 'id'>
  notasLivro: EntityTable<NotaLivro, 'id'>
}

// Cada número de versão descreve as tabelas e os campos que podem ser buscados rápido (índices).
// Para mudar o formato, criamos uma versão nova aqui embaixo, sem apagar as antigas:
// o Dexie leva o banco do celular de uma versão para a outra sozinho, sem perder dados.
db.version(1).stores({
  config: 'id',
  areas: 'id, ordem',
  habitos: 'id, areaId, ordem',
  checks: 'id, habitoId, areaId, dia',
  dias: 'id',
  semanas: 'id',
})

// Versão 2 (Fase 2): treinos, estudo e leitura.
db.version(2).stores({
  exercicios: 'id, nome',
  modelos: 'id, ordem',
  treinos: 'id, dia',
  series: 'id, treinoId, exercicioId, dia',
  medidas: 'id',
  materias: 'id, ordem',
  sessoes: 'id, materiaId, dia',
  estado: 'id',
  livros: 'id, status, ordem',
  leituras: 'id, livroId, dia',
  notasLivro: 'id, livroId',
})

export const VERSAO_BANCO = 2

/** Tira da lista os registros marcados como apagados. */
export function vivos<T extends { apagadoEm?: number }>(lista: T[]): T[] {
  return lista.filter((item) => item.apagadoEm === undefined)
}
