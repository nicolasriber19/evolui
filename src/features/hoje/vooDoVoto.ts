/**
 * A jogada assinatura do Evolui: quando você marca um hábito, um ponto dourado
 * sai do botão e voa até a régua de votos embaixo da frase de identidade.
 *
 * Usa a Web Animations API (element.animate), que anima só transform e opacity:
 * é o jeito mais leve de animar no celular.
 */
export function voarVoto(de: DOMRect, para: DOMRect): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return // o tracinho só aparece, sem voo

  const TAMANHO = 10
  const inicioX = de.left + de.width / 2 - TAMANHO / 2
  const inicioY = de.top + de.height / 2 - TAMANHO / 2
  const dx = para.left + para.width / 2 - TAMANHO / 2 - inicioX
  const dy = para.bottom - 8 - inicioY

  const ponto = document.createElement('div')
  ponto.setAttribute('aria-hidden', 'true')
  Object.assign(ponto.style, {
    position: 'fixed',
    left: `${inicioX}px`,
    top: `${inicioY}px`,
    width: `${TAMANHO}px`,
    height: `${TAMANHO}px`,
    borderRadius: '999px',
    background: 'var(--destaque)',
    pointerEvents: 'none',
    zIndex: '50',
  })
  document.body.appendChild(ponto)

  const animacao = ponto.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      // ponto do meio deslocado para o lado: o caminho vira uma curva, não uma linha reta
      { transform: `translate(${dx * 0.25 + 28}px, ${dy * 0.55}px) scale(1.25)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.6)`, opacity: 0.85 },
    ],
    { duration: 520, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
  )
  const limpar = () => ponto.remove()
  animacao.onfinish = limpar
  animacao.oncancel = limpar
}
