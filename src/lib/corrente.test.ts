import { describe, expect, it } from 'vitest'
import { calcularCorrente } from './corrente'

// Calendário de referência: 2 de novembro de 2026 é uma segunda-feira.
// seg 02 | ter 03 | qua 04 | qui 05 | sex 06 | sáb 07 | dom 08 | seg 09
const TODO_DIA = [0, 1, 2, 3, 4, 5, 6]

function habito(dias = TODO_DIA, inicio = '2026-11-02', pausas: { de: string; ate?: string }[] = []) {
  return { dias, inicio, pausas }
}

describe('calcularCorrente', () => {
  it('conta os dias cumpridos em sequência', () => {
    const feitos = new Set(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'])
    const r = calcularCorrente(habito(), feitos, '2026-11-06')
    expect(r.corrente).toBe(4)
    expect(r.estado).toBe('em-dia')
    expect(r.faltasSeguidas).toBe(0)
  })

  it('hoje ainda pendente não é falta', () => {
    const r = calcularCorrente(habito(), new Set(), '2026-11-02')
    expect(r.estado).toBe('em-dia')
    expect(r.faltasSeguidas).toBe(0)
    expect(r.consistencia).toBeNull()
  })

  it('marcar hoje deixa o estado como feito', () => {
    const r = calcularCorrente(habito(), new Set(['2026-11-02']), '2026-11-02')
    expect(r.estado).toBe('feito')
    expect(r.corrente).toBe(1)
  })

  it('uma falta deixa o elo aberto, mas a corrente continua', () => {
    const feitos = new Set(['2026-11-02', '2026-11-03'])
    const r = calcularCorrente(habito(), feitos, '2026-11-05') // faltou dia 04
    expect(r.estado).toBe('elo-aberto')
    expect(r.corrente).toBe(2)

    // Voltando no dia seguinte, a corrente segue crescendo.
    feitos.add('2026-11-05')
    feitos.add('2026-11-06')
    const depois = calcularCorrente(habito(), feitos, '2026-11-07')
    expect(depois.estado).toBe('em-dia')
    expect(depois.corrente).toBe(4)
  })

  it('duas faltas seguidas recomeçam a corrente, mas o recorde fica', () => {
    const feitos = new Set(['2026-11-02', '2026-11-03', '2026-11-04']) // faltou 05 e 06
    const r = calcularCorrente(habito(), feitos, '2026-11-07')
    expect(r.estado).toBe('recomecar')
    expect(r.corrente).toBe(0)
    expect(r.recorde).toBe(3)

    feitos.add('2026-11-07')
    const voltou = calcularCorrente(habito(), feitos, '2026-11-07')
    expect(voltou.estado).toBe('feito')
    expect(voltou.corrente).toBe(1)
    expect(voltou.recorde).toBe(3)
  })

  it('dias de pausa não contam como falta', () => {
    const pausado = habito(TODO_DIA, '2026-11-02', [{ de: '2026-11-04', ate: '2026-11-07' }])
    const feitos = new Set(['2026-11-02', '2026-11-03', '2026-11-07'])
    const r = calcularCorrente(pausado, feitos, '2026-11-08')
    expect(r.corrente).toBe(3)
    expect(r.estado).toBe('em-dia')
  })

  it('dias antes do início do hábito não contam', () => {
    const r = calcularCorrente(habito(TODO_DIA, '2026-11-05'), new Set(['2026-11-05']), '2026-11-06')
    expect(r.corrente).toBe(1)
    expect(r.faltasSeguidas).toBe(0)
  })

  it('mede a consistência das últimas 4 semanas', () => {
    // 9 dias já passados (02 a 10), 7 cumpridos, nunca duas faltas seguidas.
    const feitos = new Set(['2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-09', '2026-11-10'])
    const r = calcularCorrente(habito(), feitos, '2026-11-11')
    expect(r.consistencia).toBeCloseTo(7 / 9)
    expect(r.corrente).toBe(7)
  })

  // TAREFA DO NICOLAS (Fase 1)
  // Escreva este teste: um hábito de segunda a sexta ([1, 2, 3, 4, 5]),
  // cumprido de segunda (02) a sexta (06), olhando na segunda seguinte (09).
  // Sábado e domingo não podem contar como falta: a corrente tem que ser 5 e o estado 'em-dia'.
  // Dica: copie o primeiro teste e troque `habito()` por `habito([1, 2, 3, 4, 5])`.
  // Depois troque `it.todo` por `it` e rode `npm test`.
  it.todo('sábado e domingo não contam como falta para um hábito de segunda a sexta')
})
