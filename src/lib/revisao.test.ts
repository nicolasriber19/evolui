import { describe, it } from 'vitest'
// import { expect } from 'vitest'
// import { humorMedio } from './revisao'

// TAREFA DO NICOLAS (Fase 4)
// Quando a função humorMedio (em revisao.ts) estiver pronta, troque cada it.todo por it,
// escreva o expect e tire as barras dos imports lá em cima. Exemplo:
//
//   it('ignora os dias sem check-in', () => {
//     expect(humorMedio([4, undefined, 3, 5])).toBe(4)
//   })

describe('humorMedio', () => {
  it.todo('ignora os dias sem check-in ([4, undefined, 3, 5] -> 4)')
  it.todo('dá meio ponto quando precisa ([3, 4] -> 3.5)')
  it.todo('arredonda para uma casa decimal ([2, 3, 3] -> 2.7)')
  it.todo('sem nenhum dia preenchido devolve null')
})
