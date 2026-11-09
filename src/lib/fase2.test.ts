import { describe, expect, it } from 'vitest'
import type { EstadoFoco, ModeloTreino, Serie, Treino } from '../db/tipos'
import { comecarFoco, comecarPausa, continuar, faseAcabou, minutosFocados, pausar, restanteMs } from './foco'
import { calcularLeitura, progresso } from './leitura'
import { evolucaoCarga, proximoModelo, repeticoesSugeridas, ultimaVez, volume } from './treino'
import { formatarRelogio, lerNumero } from './formatar'

const MIN = 60_000

describe('timer de foco', () => {
  it('conta o tempo pelo horário de fim', () => {
    const e = comecarFoco('python', 25, 0)
    expect(restanteMs(e, 10 * MIN)).toBe(15 * MIN)
    expect(faseAcabou(e, 25 * MIN)).toBe(true)
  })

  it('pausar congela o tempo e continuar retoma de onde parou', () => {
    let e: EstadoFoco = comecarFoco('python', 25, 0)
    e = pausar(e, 10 * MIN)
    expect(restanteMs(e, 60 * MIN)).toBe(15 * MIN) // pausado: o tempo não anda
    e = continuar(e, 60 * MIN)
    expect(restanteMs(e, 70 * MIN)).toBe(5 * MIN)
    expect(minutosFocados(e, 70 * MIN)).toBe(20)
  })

  it('a pausa começa quando o foco acabou, mesmo se o app estava fechado', () => {
    const foco = comecarFoco('python', 25, 0)
    const pausa = comecarPausa(foco, 5, 40 * MIN) // você só voltou 15 min depois
    expect(pausa.fase).toBe('pausa')
    expect(faseAcabou(pausa, 40 * MIN)).toBe(true) // a pausa de 5 min também já passou
  })
})

describe('treino', () => {
  const modelo = (id: string, ordem: number) => ({ id, nome: id, titulo: '', itens: [], ordem }) as unknown as ModeloTreino
  const treino = (modeloId: string, iniciadoEm: number) =>
    ({ id: `t${iniciadoEm}`, modeloId, iniciadoEm, concluidoEm: iniciadoEm + 1 }) as unknown as Treino
  const serie = (treinoId: string, dia: string, ordem: number, cargaKg: number, repeticoes = 10) =>
    ({ id: `${treinoId}${ordem}`, treinoId, exercicioId: 'supino', dia, ordem, cargaKg, repeticoes, criadoEm: 0 }) as Serie

  it('sugere o próximo modelo da rotação', () => {
    const modelos = [modelo('A', 0), modelo('B', 1), modelo('C', 2)]
    expect(proximoModelo(modelos, [])?.id).toBe('A')
    expect(proximoModelo(modelos, [treino('A', 1), treino('B', 2)])?.id).toBe('C')
    expect(proximoModelo(modelos, [treino('C', 3)])?.id).toBe('A')
  })

  it('lembra as séries da última vez e mostra a evolução da carga', () => {
    const series = [serie('t1', '2026-11-02', 0, 40), serie('t1', '2026-11-02', 1, 40), serie('t2', '2026-11-05', 0, 42.5)]
    expect(ultimaVez(series, 'supino').map((s) => s.cargaKg)).toEqual([42.5])
    expect(ultimaVez(series, 'supino', 't2')).toHaveLength(2)
    expect(evolucaoCarga(series, 'supino')).toEqual([
      { dia: '2026-11-02', carga: 40 },
      { dia: '2026-11-05', carga: 42.5 },
    ])
    expect(volume(series)).toBe(40 * 10 + 40 * 10 + 42.5 * 10)
  })

  it('entende repetições escritas como texto', () => {
    expect(repeticoesSugeridas('8-10')).toBe(8)
    expect(repeticoesSugeridas('12')).toBe(12)
    expect(repeticoesSugeridas('até a falha')).toBe(10)
  })
})

describe('leitura', () => {
  it('calcula páginas lidas e quando o livro acaba', () => {
    const livro = { paginaAtual: 100, totalPaginas: 300 }
    expect(calcularLeitura(livro, 120)).toEqual({ paginas: 20, ateAPagina: 120, terminou: false })
    expect(calcularLeitura(livro, 999)).toEqual({ paginas: 200, ateAPagina: 300, terminou: true })
    expect(calcularLeitura(livro, 80).paginas).toBe(0) // voltar a página não conta como leitura
    expect(progresso({ paginaAtual: 75, totalPaginas: 300 })).toBe(0.25)
  })
})

describe('formatar', () => {
  it('lê números com vírgula', () => {
    expect(lerNumero('42,5')).toBe(42.5)
    expect(lerNumero(' 80 ')).toBe(80)
    expect(lerNumero('')).toBeNull()
    expect(lerNumero('abc')).toBeNull()
  })

  it('escreve o relógio do timer', () => {
    expect(formatarRelogio(25 * MIN)).toBe('25:00')
    expect(formatarRelogio(90_000)).toBe('01:30')
    expect(formatarRelogio(500)).toBe('00:01')
  })
})
