// Gravações da área Estudo: matérias, sessões e o timer de foco.

import { db, vivos } from './db'
import type { DiaISO, Materia, TipoMateria } from './tipos'
import { MATERIAS_DA_FACULDADE } from '../data/treinos'
import { diaLogico } from '../lib/datas'
import { comecarFoco, comecarPausa, continuar, faseAcabou, minutosFocados, pausar } from '../lib/foco'
import { novoId } from '../lib/id'

const agora = () => Date.now()

export async function adicionarMateria(nome: string, tipo: TipoMateria): Promise<string> {
  const id = novoId()
  const ordem = await db.materias.count()
  await db.materias.add({ id, nome: nome.trim(), tipo, ativa: true, ordem, criadoEm: agora(), atualizadoEm: agora() })
  return id
}

export async function adicionarMateriasDaFaculdade(): Promise<void> {
  const existentes = vivos(await db.materias.toArray()).map((m) => m.nome.toLowerCase())
  for (const nome of MATERIAS_DA_FACULDADE) {
    if (!existentes.includes(nome.toLowerCase())) await adicionarMateria(nome, 'faculdade')
  }
}

export async function editarMateria(id: string, mudancas: Partial<Pick<Materia, 'nome' | 'tipo' | 'ativa'>>) {
  await db.materias.update(id, { ...mudancas, atualizadoEm: agora() })
}

export async function registrarSessao(
  materiaId: string,
  dia: DiaISO,
  minutos: number,
  origem: 'foco' | 'manual',
  inicio = agora(),
): Promise<void> {
  if (minutos <= 0) return
  await db.sessoes.add({ id: novoId(), materiaId, dia, inicio, minutos, origem, criadoEm: agora(), atualizadoEm: agora() })
}

export async function apagarSessao(id: string): Promise<void> {
  await db.sessoes.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
}

// ---------- Timer de foco ----------

export async function iniciarFoco(materiaId: string, focoMin: number): Promise<void> {
  await db.estado.put(comecarFoco(materiaId, focoMin, agora()))
}

export async function pausarFoco(): Promise<void> {
  const e = await db.estado.get('foco')
  if (e) await db.estado.put(pausar(e, agora()))
}

export async function continuarFoco(): Promise<void> {
  const e = await db.estado.get('foco')
  if (e) await db.estado.put(continuar(e, agora()))
}

/** Para o timer. Se estava em foco e `salvar` for true, grava os minutos já feitos. */
export async function encerrarFoco(salvar: boolean, viradaHora: number): Promise<number> {
  return db.transaction('rw', db.estado, db.sessoes, async () => {
    const e = await db.estado.get('foco')
    if (!e) return 0
    const minutos = minutosFocados(e, agora())
    if (salvar && minutos >= 1) {
      await registrarSessao(e.materiaId, diaLogico(new Date(e.inicioFaseEm), viradaHora), minutos, 'foco', e.inicioFaseEm)
    }
    await db.estado.delete('foco')
    return salvar ? minutos : 0
  })
}

export type ResultadoFase = 'foco-acabou' | 'pausa-acabou' | null

/**
 * Chamado a cada segundo pelo "motor" do timer. Se a fase acabou, grava a sessão e passa para a pausa.
 * Tudo numa transação: mesmo que duas telas chamem ao mesmo tempo, a sessão é gravada uma vez só.
 */
export async function avancarFase(viradaHora: number, pausaMin: number): Promise<ResultadoFase> {
  return db.transaction('rw', db.estado, db.sessoes, async () => {
    const e = await db.estado.get('foco')
    const t = agora()
    if (!e || !faseAcabou(e, t)) return null
    if (e.fase === 'foco') {
      await registrarSessao(e.materiaId, diaLogico(new Date(e.inicioFaseEm), viradaHora), Math.round(e.duracaoMs / 60_000), 'foco', e.inicioFaseEm)
      await db.estado.put(comecarPausa(e, pausaMin, t))
      return 'foco-acabou'
    }
    await db.estado.delete('foco')
    return 'pausa-acabou'
  })
}
