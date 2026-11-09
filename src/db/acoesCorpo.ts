// Gravações da área Corpo: modelos de treino, treinos, séries e medidas.

import { db, vivos } from './db'
import type { DiaISO, ItemModelo, ModeloTreino, Treino } from './tipos'
import { MODELOS_SUGERIDOS } from '../data/treinos'
import { novoId } from '../lib/id'

const agora = () => Date.now()

/** Acha um exercício pelo nome (sem ligar para maiúsculas) ou cria um novo. Devolve o id. */
export async function exercicioPorNome(nome: string): Promise<string> {
  const limpo = nome.trim()
  const todos = vivos(await db.exercicios.toArray())
  const existente = todos.find((e) => e.nome.toLocaleLowerCase('pt-BR') === limpo.toLocaleLowerCase('pt-BR'))
  if (existente) return existente.id
  const id = novoId()
  await db.exercicios.add({ id, nome: limpo, criadoEm: agora(), atualizadoEm: agora() })
  return id
}

export async function usarModelosSugeridos(): Promise<void> {
  await db.transaction('rw', db.exercicios, db.modelos, async () => {
    const jaTem = vivos(await db.modelos.toArray()).length
    for (const [i, m] of MODELOS_SUGERIDOS.entries()) {
      const itens: ItemModelo[] = []
      for (const e of m.itens) {
        itens.push({ exercicioId: await exercicioPorNome(e.nome), series: e.series, repeticoes: e.repeticoes })
      }
      await db.modelos.add({
        id: novoId(),
        nome: m.nome,
        titulo: m.titulo,
        itens,
        ordem: jaTem + i,
        criadoEm: agora(),
        atualizadoEm: agora(),
      })
    }
  })
}

export interface DadosModelo {
  nome: string
  titulo: string
  itens: ItemModelo[]
}

export async function salvarModelo(dados: DadosModelo, id?: string): Promise<void> {
  if (id) {
    await db.modelos.update(id, { ...dados, atualizadoEm: agora() })
    return
  }
  const ordem = await db.modelos.count()
  await db.modelos.add({ id: novoId(), ...dados, ordem, criadoEm: agora(), atualizadoEm: agora() })
}

export async function apagarModelo(id: string): Promise<void> {
  await db.modelos.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
}

// ---------- Treino ----------

export async function comecarTreino(modelo: ModeloTreino | null, hoje: DiaISO): Promise<string> {
  const id = novoId()
  await db.treinos.add({
    id,
    dia: hoje,
    modeloId: modelo?.id,
    titulo: modelo ? `Treino ${modelo.nome}: ${modelo.titulo}` : 'Treino livre',
    exercicioIds: modelo ? modelo.itens.map((i) => i.exercicioId) : [],
    iniciadoEm: agora(),
    criadoEm: agora(),
    atualizadoEm: agora(),
  })
  return id
}

export async function adicionarExercicioAoTreino(treino: Treino, nome: string): Promise<void> {
  const exercicioId = await exercicioPorNome(nome)
  if (treino.exercicioIds.includes(exercicioId)) return
  await db.treinos.update(treino.id, { exercicioIds: [...treino.exercicioIds, exercicioId], atualizadoEm: agora() })
}

export async function removerExercicioDoTreino(treino: Treino, exercicioId: string): Promise<void> {
  await db.transaction('rw', db.treinos, db.series, async () => {
    await db.treinos.update(treino.id, {
      exercicioIds: treino.exercicioIds.filter((id) => id !== exercicioId),
      atualizadoEm: agora(),
    })
    const series = await db.series.where('treinoId').equals(treino.id).toArray()
    for (const s of series) {
      if (s.exercicioId === exercicioId) await db.series.update(s.id, { apagadoEm: agora(), atualizadoEm: agora() })
    }
  })
}

/** Marca uma série como feita. O id fixo (treino:exercício:ordem) permite desmarcar e marcar de novo. */
export async function marcarSerie(treino: Treino, exercicioId: string, ordem: number, cargaKg: number, repeticoes: number) {
  const id = `${treino.id}:${exercicioId}:${ordem}`
  const existente = await db.series.get(id)
  await db.series.put({
    id,
    treinoId: treino.id,
    exercicioId,
    dia: treino.dia,
    ordem,
    cargaKg,
    repeticoes,
    criadoEm: existente?.criadoEm ?? agora(),
    atualizadoEm: agora(),
  })
}

export async function desmarcarSerie(id: string): Promise<void> {
  await db.series.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
}

export async function concluirTreino(id: string): Promise<void> {
  await db.treinos.update(id, { concluidoEm: agora(), atualizadoEm: agora() })
}

/** Apaga um treino (em andamento ou do histórico) e as séries dele. */
export async function apagarTreino(id: string): Promise<void> {
  await db.transaction('rw', db.treinos, db.series, async () => {
    await db.treinos.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
    const series = await db.series.where('treinoId').equals(id).toArray()
    for (const s of series) await db.series.update(s.id, { apagadoEm: agora(), atualizadoEm: agora() })
  })
}

// ---------- Medidas ----------

export async function salvarMedida(dia: DiaISO, campo: 'pesoKg' | 'sonoHoras', valor: number | undefined) {
  await db.transaction('rw', db.medidas, async () => {
    const atual = await db.medidas.get(dia)
    await db.medidas.put({
      id: dia,
      criadoEm: atual?.criadoEm ?? agora(),
      ...atual,
      [campo]: valor,
      atualizadoEm: agora(),
    })
  })
}
