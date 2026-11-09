import { useEffect } from 'react'
import type { Tema } from '../../db/tipos'

const COR_BARRA = { escuro: '#0A1020', claro: '#F3F5F9' } as const

function resolver(tema: Tema): 'escuro' | 'claro' {
  if (tema !== 'sistema') return tema
  return matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'escuro'
}

/** Troca o tema do app inteiro mudando o atributo data-tema do <html>. */
export function aplicarTema(tema: Tema) {
  const final = resolver(tema)
  document.documentElement.dataset.tema = final
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_BARRA[final])
  try {
    // Cópia rápida para o index.html aplicar o tema antes do app carregar.
    localStorage.setItem('evolui-tema', tema)
  } catch {
    // Sem localStorage (modo anônimo): o tema só demora um instante a mais para aparecer.
  }
}

export function temaSalvo(): Tema {
  try {
    const t = localStorage.getItem('evolui-tema')
    if (t === 'escuro' || t === 'claro' || t === 'sistema') return t
  } catch {
    // ignora
  }
  return 'escuro'
}

/** Aplica o tema e, no modo "sistema", acompanha quando o celular troca de claro para escuro. */
export function useTema(tema: Tema) {
  useEffect(() => {
    aplicarTema(tema)
    if (tema !== 'sistema') return
    const consulta = matchMedia('(prefers-color-scheme: light)')
    const aoMudar = () => aplicarTema('sistema')
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [tema])
}
