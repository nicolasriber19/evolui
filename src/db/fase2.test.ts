import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db, vivos } from './db'
import { avancarFase, iniciarFoco, encerrarFoco } from './acoesEstudo'
import { comecarTreino, marcarSerie, usarModelosSugeridos, desmarcarSerie } from './acoesCorpo'
import { adicionarLivro, registrarLeitura } from './acoesLeitura'

beforeEach(async () => {
  vi.useRealTimers()
  await db.delete()
  await db.open()
})

describe('timer de foco no banco', () => {
  it('quando o foco acaba, grava a sessão uma vez só e começa a pausa', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 9, 10, 0))
    await iniciarFoco('python', 25)
    vi.setSystemTime(new Date(2026, 10, 9, 10, 26))
    // duas chamadas ao mesmo tempo (como se duas telas estivessem abertas)
    const [a, b] = await Promise.all([avancarFase(4, 5), avancarFase(4, 5)])
    expect([a, b].filter((r) => r === 'foco-acabou')).toHaveLength(1)
    const sessoes = await db.sessoes.toArray()
    expect(sessoes).toHaveLength(1)
    expect(sessoes[0]).toMatchObject({ materiaId: 'python', minutos: 25, dia: '2026-11-09' })
    expect((await db.estado.get('foco'))?.fase).toBe('pausa')
  })

  it('encerrar no meio grava só os minutos feitos', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 9, 10, 0))
    await iniciarFoco('html', 25)
    vi.setSystemTime(new Date(2026, 10, 9, 10, 12, 30))
    expect(await encerrarFoco(true, 4)).toBe(12)
    expect((await db.sessoes.toArray())[0].minutos).toBe(12)
    expect(await db.estado.get('foco')).toBeUndefined()
  })
})

describe('treino no banco', () => {
  it('cria os modelos ABC e grava as séries marcadas', async () => {
    await usarModelosSugeridos()
    const modelos = await db.modelos.orderBy('ordem').toArray()
    expect(modelos.map((m) => m.nome)).toEqual(['A', 'B', 'C'])
    expect(await db.exercicios.count()).toBe(18)

    const id = await comecarTreino(modelos[0], '2026-11-09')
    const treino = (await db.treinos.get(id))!
    expect(treino.exercicioIds).toHaveLength(6)
    await marcarSerie(treino, treino.exercicioIds[0], 0, 40, 10)
    await marcarSerie(treino, treino.exercicioIds[0], 1, 40, 9)
    await desmarcarSerie(`${id}:${treino.exercicioIds[0]}:1`)
    expect(vivos(await db.series.toArray())).toHaveLength(1)
  })
})

describe('leitura no banco', () => {
  it('registra páginas e marca como lido no fim', async () => {
    const id = await adicionarLivro({ titulo: 'Hábitos Atômicos', autor: 'James Clear', totalPaginas: 300, status: 'lendo' }, '2026-11-09')
    let livro = (await db.livros.get(id))!
    await registrarLeitura(livro, 30, '2026-11-09')
    livro = (await db.livros.get(id))!
    expect(livro.paginaAtual).toBe(30)
    const r = await registrarLeitura(livro, 300, '2026-11-10')
    expect(r.terminou).toBe(true)
    expect((await db.livros.get(id))?.status).toBe('lido')
    expect((await db.leituras.orderBy('dia').toArray()).map((l) => l.paginas)).toEqual([30, 270])
  })
})

describe('atualização do banco', () => {
  it('passa da versão 1 para a 2 sem perder os dados de quem já usava o app', async () => {
    db.close()
    await Dexie.delete('evolui')
    // Monta um banco exatamente como a versão publicada na Fase 1 deixava no celular.
    const antigo = new Dexie('evolui')
    antigo.version(1).stores({
      config: 'id',
      areas: 'id, ordem',
      habitos: 'id, areaId, ordem',
      checks: 'id, habitoId, areaId, dia',
      dias: 'id',
      semanas: 'id',
    })
    await antigo.open()
    await antigo.table('habitos').add({ id: 'h1', nome: 'Treinar', areaId: 'corpo', ordem: 0 })
    await antigo.table('checks').add({ id: 'h1:2026-11-09', habitoId: 'h1', areaId: 'corpo', dia: '2026-11-09', tipo: 'completo' })
    antigo.close()

    await db.open() // o app novo abre o mesmo banco
    expect(db.verno).toBe(2)
    expect((await db.habitos.get('h1'))?.nome).toBe('Treinar')
    expect(await db.checks.count()).toBe(1)
    expect(await db.livros.count()).toBe(0) // tabelas novas nascem vazias
  })
})
