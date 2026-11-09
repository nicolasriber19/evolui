import 'fake-indexeddb/auto' // um IndexedDB "de mentira" para os testes rodarem fora do navegador
import { beforeEach, describe, expect, it } from 'vitest'
import { db, vivos } from './db'
import { gerarBackup, restaurarBackup, validarBackup } from './backup'
import { concluirOnboarding, marcarHabito, salvarVitorias } from './acoes'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

async function criarDadosDeExemplo() {
  await concluirOnboarding(
    {
      areas: [{ id: 'corpo', ativa: true, frase: 'Sou alguém que treina' }],
      habitos: [{ areaId: 'corpo', nome: 'Treinar', versaoMinima: '10 flexões', dias: [1, 2, 3, 4, 5] }],
      metas: ['Treinar 5 vezes'],
    },
    '2026-11-09',
  )
  const [habito] = await db.habitos.toArray()
  await marcarHabito(habito, '2026-11-09', 'minimo')
  await salvarVitorias('2026-11-09', ['Fui treinar mesmo cansado'])
}

describe('backup', () => {
  it('restaurar devolve exatamente os mesmos dados', async () => {
    await criarDadosDeExemplo()
    // Passa pelo JSON como no arquivo de verdade.
    const arquivo = JSON.parse(JSON.stringify(await gerarBackup()))

    await db.habitos.clear()
    await db.checks.clear()
    await db.dias.clear()

    await restaurarBackup(validarBackup(arquivo))
    const depois = (await gerarBackup()).tabelas
    expect(depois).toEqual(arquivo.tabelas)
  })

  it('desmarcar um hábito só marca o check como apagado', async () => {
    await criarDadosDeExemplo()
    const [habito] = await db.habitos.toArray()
    await marcarHabito(habito, '2026-11-09', null)
    expect(await db.checks.count()).toBe(1)
    expect(vivos(await db.checks.toArray())).toHaveLength(0)
  })

  it('recusa arquivos que não são backup do Evolui', () => {
    expect(() => validarBackup({ qualquer: 'coisa' })).toThrow(/não é um backup/)
    expect(() => validarBackup(null)).toThrow(/não é um backup/)
  })

  it('recusa backup de uma versão mais nova do app', () => {
    expect(() => validarBackup({ app: 'evolui', versaoBanco: 99, tabelas: {} })).toThrow(/versão mais nova/)
  })
})
