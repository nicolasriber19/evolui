/**
 * Cria um código único (UUID v4), tipo "3f2b...-...".
 * Com códigos assim, dois aparelhos nunca criam o mesmo id, o que facilita sincronizar no futuro.
 *
 * crypto.randomUUID só existe em endereços seguros (https ou localhost).
 * Abrindo pelo Wi-Fi no celular (http://192.168...), usamos o plano B logo abaixo.
 */
export function novoId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()

  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40 // marca a versão 4
  b[8] = (b[8] & 0x3f) | 0x80 // marca a variante
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
