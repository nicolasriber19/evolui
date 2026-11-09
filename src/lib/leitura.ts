import type { DiaISO, Leitura, Livro } from '../db/tipos'

/** De 0 a 1: quanto do livro já foi lido. */
export function progresso(l: Pick<Livro, 'paginaAtual' | 'totalPaginas'>): number {
  return l.totalPaginas > 0 ? Math.min(1, l.paginaAtual / l.totalPaginas) : 0
}

/** "Parei na página X": quantas páginas foram lidas e se o livro acabou. */
export function calcularLeitura(l: Pick<Livro, 'paginaAtual' | 'totalPaginas'>, novaPagina: number) {
  const limite = l.totalPaginas > 0 ? l.totalPaginas : Number.POSITIVE_INFINITY
  const ateAPagina = Math.max(0, Math.min(Math.round(novaPagina), limite))
  return {
    paginas: Math.max(0, ateAPagina - l.paginaAtual),
    ateAPagina,
    terminou: l.totalPaginas > 0 && ateAPagina >= l.totalPaginas,
  }
}

/** Páginas lidas em cada dia da lista (mesma ordem). */
export function paginasPorDia(leituras: Leitura[], dias: DiaISO[]): number[] {
  return dias.map((dia) => leituras.filter((l) => l.dia === dia).reduce((soma, l) => soma + l.paginas, 0))
}
