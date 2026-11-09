// Gravações da área Leitura: livros, páginas lidas e notas.

import { db } from './db'
import type { DiaISO, Livro, NotaLivro, StatusLivro } from './tipos'
import { calcularLeitura } from '../lib/leitura'
import { novoId } from '../lib/id'

const agora = () => Date.now()

export interface DadosLivro {
  titulo: string
  autor: string
  totalPaginas: number
  status: StatusLivro
}

export async function adicionarLivro(dados: DadosLivro, hoje: DiaISO): Promise<string> {
  const id = novoId()
  const ordem = await db.livros.count()
  await db.livros.add({
    id,
    ...dados,
    paginaAtual: dados.status === 'lido' ? dados.totalPaginas : 0,
    comecouEm: dados.status === 'lendo' ? hoje : undefined,
    terminouEm: dados.status === 'lido' ? hoje : undefined,
    ordem,
    criadoEm: agora(),
    atualizadoEm: agora(),
  })
  return id
}

export async function editarLivro(id: string, mudancas: Partial<Pick<Livro, 'titulo' | 'autor' | 'totalPaginas'>>) {
  await db.livros.update(id, { ...mudancas, atualizadoEm: agora() })
}

export async function mudarStatus(livro: Livro, status: StatusLivro, hoje: DiaISO): Promise<void> {
  const mudancas: Partial<Livro> = { status, atualizadoEm: agora() }
  if (status === 'lendo') mudancas.comecouEm = livro.comecouEm ?? hoje
  if (status === 'lido') {
    mudancas.terminouEm = hoje
    mudancas.paginaAtual = livro.totalPaginas
  }
  await db.livros.update(livro.id, mudancas)
}

/** "Parei na página X". Grava as páginas lidas hoje e marca como lido se chegou ao fim. */
export async function registrarLeitura(livro: Livro, novaPagina: number, hoje: DiaISO) {
  const r = calcularLeitura(livro, novaPagina)
  await db.transaction('rw', db.livros, db.leituras, async () => {
    if (r.paginas > 0) {
      await db.leituras.add({
        id: novoId(),
        livroId: livro.id,
        dia: hoje,
        paginas: r.paginas,
        ateAPagina: r.ateAPagina,
        criadoEm: agora(),
        atualizadoEm: agora(),
      })
    }
    await db.livros.update(livro.id, {
      paginaAtual: r.ateAPagina,
      status: r.terminou ? 'lido' : 'lendo',
      comecouEm: livro.comecouEm ?? hoje,
      terminouEm: r.terminou ? hoje : livro.terminouEm,
      atualizadoEm: agora(),
    })
  })
  return r
}

export async function apagarLivro(id: string): Promise<void> {
  await db.livros.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
}

export async function salvarNota(dados: Pick<NotaLivro, 'livroId' | 'tipo' | 'texto' | 'pagina'>): Promise<void> {
  await db.notasLivro.add({ id: novoId(), ...dados, criadoEm: agora(), atualizadoEm: agora() })
}

export async function apagarNota(id: string): Promise<void> {
  await db.notasLivro.update(id, { apagadoEm: agora(), atualizadoEm: agora() })
}
