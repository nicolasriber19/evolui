import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { salvarMetas, novoItem } from './acoes'
import { registrarLazer, salvarDiario, sortearDesafioDaSemana, usarDesafiosSugeridos, usarLazerSugerido } from './acoesFase3'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('Fase 3 no banco', () => {
  it('sorteia o desafio da semana sem apagar as metas', async () => {
    await salvarMetas('2026-W46', [novoItem('Treinar 5 vezes')])
    await usarDesafiosSugeridos()
    await sortearDesafioDaSemana('2026-W46')
    const semana = await db.semanas.get('2026-W46')
    expect(semana?.desafio?.texto).toBeTruthy()
    expect(semana?.metas[0].texto).toBe('Treinar 5 vezes')

    // Sortear de novo troca o desafio
    const antes = semana!.desafio!.texto
    await sortearDesafioDaSemana('2026-W46')
    expect((await db.semanas.get('2026-W46'))?.desafio?.texto).not.toBe(antes)
  })

  it('o diário não apaga as vitórias do dia', async () => {
    await db.dias.put({ id: '2026-11-09', prioridades: [], vitorias: ['Treinei'], criadoEm: 1, atualizadoEm: 1 })
    await salvarDiario('2026-11-09', 'gratidao', 'Almoço com a família')
    const dia = await db.dias.get('2026-11-09')
    expect(dia).toMatchObject({ vitorias: ['Treinei'], gratidao: 'Almoço com a família' })
  })

  it('registra lazer no orçamento sugerido', async () => {
    await usarLazerSugerido()
    const [jogos] = await db.lazerTipos.orderBy('ordem').toArray()
    await registrarLazer(jogos.id, '2026-11-09', 45, true)
    await registrarLazer(jogos.id, '2026-11-09', 0, true) // zero minutos não grava
    expect(await db.lazerRegistros.count()).toBe(1)
  })

  it('passa da versão 2 para a 3 sem perder dados', async () => {
    db.close()
    await Dexie.delete('evolui')
    const antigo = new Dexie('evolui')
    antigo.version(1).stores({ config: 'id', areas: 'id, ordem', habitos: 'id, areaId, ordem', checks: 'id, habitoId, areaId, dia', dias: 'id', semanas: 'id' })
    antigo.version(2).stores({
      exercicios: 'id, nome', modelos: 'id, ordem', treinos: 'id, dia', series: 'id, treinoId, exercicioId, dia', medidas: 'id',
      materias: 'id, ordem', sessoes: 'id, materiaId, dia', estado: 'id', livros: 'id, status, ordem', leituras: 'id, livroId, dia', notasLivro: 'id, livroId',
    })
    await antigo.open()
    await antigo.table('livros').add({ id: 'l1', titulo: 'Hábitos Atômicos', status: 'lendo', ordem: 0 })
    antigo.close()

    await db.open()
    expect(db.verno).toBe(3)
    expect((await db.livros.get('l1'))?.titulo).toBe('Hábitos Atômicos')
    expect(await db.evidencias.count()).toBe(0)
  })
})
