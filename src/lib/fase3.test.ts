import { describe, expect, it } from 'vitest'
import type { Check, Desafio, Dia, RegistroLazer, Semana, Tentativa, TipoLazer } from '../db/tipos'
import { DESAFIOS_SUGERIDOS, DICAS_SUGERIDAS } from '../data/comunicacao'
import { contarPromessas, fracaoEscolhida, sortearDesafio, usoDaSemana } from './fase3'

const desafio = (texto: string) => ({ id: texto, texto }) as Desafio

describe('sorteio do desafio', () => {
  const lista = [desafio('A'), desafio('B'), desafio('C')]

  it('evita os desafios das últimas semanas', () => {
    expect(sortearDesafio(lista, ['A', 'B'], 0.99)?.texto).toBe('C')
    expect(sortearDesafio(lista, ['A'], 0)?.texto).toBe('B')
  })

  it('se todos já saíram, sorteia entre todos', () => {
    expect(sortearDesafio(lista, ['A', 'B', 'C'], 0)?.texto).toBe('A')
  })

  it('lista vazia não sorteia nada', () => {
    expect(sortearDesafio([], [], 0.5)).toBeUndefined()
  })

  it('as listas sugeridas não estão vazias', () => {
    expect(DESAFIOS_SUGERIDOS.length).toBeGreaterThan(3)
    expect(DICAS_SUGERIDAS.length).toBeGreaterThan(3)
  })
})

describe('orçamento de lazer', () => {
  const tipo = { id: 'jogos', nome: 'Jogos', orcamentoMin: 300 } as TipoLazer
  const reg = (dia: string, minutos: number, escolhido = true) => ({ tipoId: 'jogos', dia, minutos, escolhido }) as RegistroLazer

  it('soma só os dias da semana e mostra quanto sobra ou passou', () => {
    const semana = ['2026-11-09', '2026-11-10']
    const [uso] = usoDaSemana([tipo], [reg('2026-11-09', 120), reg('2026-11-10', 60), reg('2026-11-02', 500)], semana)
    expect(uso).toMatchObject({ usado: 180, sobra: 120, passou: 0 })
    const [estourou] = usoDaSemana([tipo], [reg('2026-11-09', 330)], semana)
    expect(estourou).toMatchObject({ sobra: 0, passou: 30 })
  })

  it('calcula quanto do lazer foi escolhido', () => {
    expect(fracaoEscolhida([reg('d', 60, true), reg('d', 20, false)])).toBe(0.75)
    expect(fracaoEscolhida([])).toBeNull()
  })
})

describe('promessas cumpridas', () => {
  const dados = {
    checks: [{ dia: '2026-11-09' }, { dia: '2026-11-10' }, { dia: '2026-11-01' }] as Check[],
    dias: [
      { id: '2026-11-09', prioridades: [{ feita: true }, { feita: false }], vitorias: [] },
      { id: '2026-11-01', prioridades: [{ feita: true }], vitorias: [] },
    ] as unknown as Dia[],
    semanas: [
      { id: '2026-W46', metas: [{ feita: true }, { feita: true }, { feita: false }] },
      { id: '2026-W44', metas: [{ feita: true }] },
    ] as unknown as Semana[],
    tentativas: [{ dia: '2026-11-11' }] as Tentativa[],
  }

  it('conta tudo o que você cumpriu', () => {
    expect(contarPromessas(dados)).toEqual({ total: 9, votos: 3, prioridades: 2, metas: 3, desafios: 1 })
  })

  it('conta só a semana pedida', () => {
    const semana = ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15']
    expect(contarPromessas(dados, semana)).toEqual({ total: 6, votos: 2, prioridades: 1, metas: 2, desafios: 1 })
  })
})
