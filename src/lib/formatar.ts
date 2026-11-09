// Jeitos de escrever números e tempos para mostrar na tela.

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

/** 42.5 vira "42,5". */
export function formatarNumero(n: number): string {
  return numero.format(n)
}

/** Lê um número digitado com vírgula ou ponto: "42,5" vira 42.5. Vazio ou inválido vira null. */
export function lerNumero(texto: string): number | null {
  const limpo = texto.trim().replace(',', '.')
  if (!limpo) return null
  const n = Number(limpo)
  return Number.isFinite(n) ? n : null
}

/** O relógio do timer: 90 segundos viram "01:30". */
export function formatarRelogio(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const min = Math.floor(total / 60)
  const seg = total % 60
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
}

/**
 * TAREFA DO NICOLAS (Fase 2)
 * Hoje essa função só escreve "85 min". Faça ela escrever do jeito que a gente fala:
 *   0   -> "0 min"
 *   45  -> "45 min"
 *   60  -> "1h"
 *   85  -> "1h 25min"
 *   125 -> "2h 05min"   (minutos sempre com 2 dígitos quando tem hora)
 * Dicas: Math.floor(minutos / 60) dá as horas; minutos % 60 dá o resto;
 * String(x).padStart(2, '0') coloca o zero na frente.
 * Os testes estão em formatar.test.ts (troque os it.todo por it e rode npm test).
 */
export function formatarMinutos(minutos: number): string {
  return `${minutos} min`
}

/** Número para colocar dentro de um campo de digitação: 42.5 vira "42,5" (sem separador de milhar). */
export function numeroParaCampo(n: number | undefined): string {
  return n === undefined ? '' : String(n).replace('.', ',')
}
