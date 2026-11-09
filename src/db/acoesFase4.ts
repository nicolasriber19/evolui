// Gravações da Fase 4: a revisão da semana e os níveis já vistos.

import { atualizarConfig } from './acoes'
import { db } from './db'
import type { AreaId, Semana, SemanaISO } from './tipos'

const agora = () => Date.now()

/** Lê a semana (ou cria uma vazia), aplica a mudança e grava, tudo numa transação. */
async function alterarSemana(id: SemanaISO, mudar: (s: Semana) => Partial<Semana>): Promise<void> {
  await db.transaction('rw', db.semanas, async () => {
    const atual: Semana = (await db.semanas.get(id)) ?? { id, metas: [], criadoEm: agora(), atualizadoEm: agora() }
    await db.semanas.put({ ...atual, ...mudar(atual), atualizadoEm: agora() })
  })
}

/** Salva uma resposta da revisão enquanto você escreve (rascunho). */
export async function salvarRespostaRevisao(semana: SemanaISO, campo: 'funcionou' | 'naoFuncionou', texto: string) {
  await alterarSemana(semana, (s) => ({
    revisao: { funcionou: '', naoFuncionou: '', ...s.revisao, [campo]: texto.trim() },
  }))
}

/** O foco é guardado na semana seguinte, para aparecer na tela Hoje dela. */
export async function definirFoco(proximaSemana: SemanaISO, foco: string) {
  await alterarSemana(proximaSemana, () => ({ foco: foco.trim() || undefined }))
}

export async function concluirRevisao(semana: SemanaISO) {
  await alterarSemana(semana, (s) => ({
    revisao: { funcionou: '', naoFuncionou: '', ...s.revisao, feitaEm: agora() },
  }))
}

export async function marcarNiveisVistos(niveis: Partial<Record<AreaId, number>>) {
  await atualizarConfig({ niveisVistos: niveis })
}
