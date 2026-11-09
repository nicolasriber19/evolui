import { describe, expect, it } from 'vitest'
import type { Check, Habito } from '../db/tipos'
import { mapaDeHabitos, resumoDaSemana, type DadosSemana } from './revisao'
import { nivel, xpPorArea } from './xp'

const vazio: DadosSemana = {
  habitos: [],
  checks: [],
  treinos: [],
  sessoes: [],
  leituras: [],
  tentativas: [],
  dias: [],
  semanas: [],
  tiposLazer: [],
  lazerRegistros: [],
}

const habito = (id: string, dias: number[], areaId: Habito['areaId'] = 'corpo') =>
  ({ id, areaId, dias, inicio: '2026-11-01', pausas: [], ativo: true }) as unknown as Habito
const check = (habitoId: string, dia: string, tipo: Check['tipo'] = 'completo', areaId: Check['areaId'] = 'corpo') =>
  ({ id: `${habitoId}:${dia}`, habitoId, dia, tipo, areaId }) as Check

describe('níveis', () => {
  it('cada nível pede 100 XP a mais que o anterior', () => {
    expect(nivel(0)).toMatchObject({ nivel: 1, xpParaProximo: 100 })
    expect(nivel(99).nivel).toBe(1)
    expect(nivel(100)).toMatchObject({ nivel: 2, xpNoNivel: 0, xpDoNivel: 200 })
    expect(nivel(300).nivel).toBe(3)
    expect(nivel(650)).toMatchObject({ nivel: 4, xpNoNivel: 50, xpParaProximo: 350 })
  })
})

describe('XP por área', () => {
  it('versão mínima vale menos, mas vale', () => {
    const xp = xpPorArea({
      checks: [check('t', '2026-11-09'), check('t', '2026-11-10', 'minimo')],
      treinos: [{ concluidoEm: 1 }, { concluidoEm: undefined }] as never,
      sessoes: [{ minutos: 25 }] as never,
      leituras: [{ paginas: 12 }] as never,
      tentativas: [{}] as never,
      evidencias: [{}] as never,
      dias: [{ vitorias: ['a', 'b'], gratidao: 'x', prioridades: [] }] as never,
      lazerRegistros: [{ escolhido: true }, { escolhido: false }] as never,
      semanas: [{ revisao: { feitaEm: 1 } }, { revisao: { funcionou: '' } }] as never,
    })
    expect(xp).toEqual({ corpo: 10 + 6 + 20, estudo: 12, leitura: 12, comunicacao: 15, mente: 5 + 4 + 3 + 30, lazer: 3 })
  })
})

describe('resumo da semana', () => {
  it('conta só a semana e só até hoje', () => {
    // seg a sex; semana de 9 a 15/11; hoje = quarta 11
    const dados = {
      ...vazio,
      habitos: [habito('t', [1, 2, 3, 4, 5])],
      checks: [check('t', '2026-11-09'), check('t', '2026-11-11'), check('t', '2026-11-02')],
    }
    const r = resumoDaSemana('2026-11-11', '2026-11-11', dados)
    expect(r.totalVotos).toBe(2)
    expect(r.votosPorDia).toEqual([1, 0, 1, 0, 0, 0, 0])
    expect(r.habitos).toEqual({ feitos: 2, agendados: 3, fracao: 2 / 3 })
    expect(r.melhorDia).toEqual({ dia: '2026-11-09', votos: 1 })
    expect(r.lazer).toBeNull()
  })
})

describe('mapa de calor', () => {
  it('pinta cada dia pela fração de hábitos feitos', () => {
    const habitos = [habito('a', [0, 1, 2, 3, 4, 5, 6]), habito('b', [1])]
    const checks = [check('a', '2026-11-09'), check('b', '2026-11-09'), check('a', '2026-11-10')]
    const mapa = mapaDeHabitos(habitos, checks, '2026-11-11', 2)
    expect(mapa).toHaveLength(2)
    const semanaAtual = mapa[1]
    expect(semanaAtual[0]).toMatchObject({ dia: '2026-11-09', nivel: 4 }) // 2 de 2
    expect(semanaAtual[1]).toMatchObject({ dia: '2026-11-10', nivel: 4 }) // 1 de 1
    expect(semanaAtual[2]).toMatchObject({ dia: '2026-11-11', nivel: 0 }) // hoje, nada feito ainda
    expect(semanaAtual[3].nivel).toBeNull() // futuro
  })
})
