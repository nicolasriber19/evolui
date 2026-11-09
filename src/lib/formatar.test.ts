import { describe, it } from 'vitest'
// import { expect } from 'vitest'
// import { formatarMinutos } from './formatar'

// TAREFA DO NICOLAS (Fase 2)
// Quando terminar a função formatarMinutos (em formatar.ts), troque cada `it.todo` por `it`
// e escreva a conferência dentro. Exemplo do primeiro:
//
//   it('menos de uma hora mostra só os minutos', () => {
//     expect(formatarMinutos(45)).toBe('45 min')
//   })
//
// Lembre de tirar as barras (//) dos imports lá em cima.

describe('formatarMinutos', () => {
  it.todo('menos de uma hora mostra só os minutos (45 -> "45 min")')
  it.todo('zero mostra "0 min"')
  it.todo('hora cheia mostra só a hora (60 -> "1h")')
  it.todo('hora e minutos (85 -> "1h 25min")')
  it.todo('minutos com dois dígitos quando tem hora (125 -> "2h 05min")')
})
