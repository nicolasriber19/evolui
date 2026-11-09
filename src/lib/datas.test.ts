import { describe, expect, it } from 'vitest'
import { descreverDias, diaLogico, diaPorExtenso, diasDaSemana, ehNoite, semanaISO, somarDias } from './datas'

describe('datas', () => {
  it('antes das 4h ainda é o dia anterior', () => {
    expect(diaLogico(new Date(2026, 10, 9, 3, 59))).toBe('2026-11-08')
    expect(diaLogico(new Date(2026, 10, 9, 4, 0))).toBe('2026-11-09')
    expect(diaLogico(new Date(2026, 10, 9, 23, 30))).toBe('2026-11-09')
  })

  it('a virada pode ser outra hora', () => {
    expect(diaLogico(new Date(2026, 10, 9, 1, 0), 0)).toBe('2026-11-09')
  })

  it('soma dias atravessando o mês', () => {
    expect(somarDias('2026-11-30', 1)).toBe('2026-12-01')
    expect(somarDias('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('calcula a semana ISO (segunda a domingo)', () => {
    expect(semanaISO('2026-11-09')).toBe('2026-W46')
    expect(semanaISO('2026-11-15')).toBe('2026-W46')
    expect(semanaISO('2026-11-16')).toBe('2026-W47')
  })

  it('lista os dias da semana começando na segunda', () => {
    const dias = diasDaSemana('2026-11-11')
    expect(dias[0]).toBe('2026-11-09')
    expect(dias[6]).toBe('2026-11-15')
  })

  it('escreve o dia por extenso em português', () => {
    expect(diaPorExtenso('2026-11-09')).toBe('segunda, 9 de novembro')
  })

  it('sabe quando é noite', () => {
    expect(ehNoite(new Date(2026, 10, 9, 19, 59), 20)).toBe(false)
    expect(ehNoite(new Date(2026, 10, 9, 20, 0), 20)).toBe(true)
    expect(ehNoite(new Date(2026, 10, 10, 1, 0), 20)).toBe(true)
  })

  it('descreve os dias de um hábito', () => {
    expect(descreverDias([0, 1, 2, 3, 4, 5, 6])).toBe('todo dia')
    expect(descreverDias([1, 2, 3, 4, 5])).toBe('seg a sex')
    expect(descreverDias([1, 3, 5])).toBe('seg, qua, sex')
    expect(descreverDias([0, 6])).toBe('fim de semana')
  })
})
