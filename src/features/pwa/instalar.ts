import { useSyncExternalStore } from 'react'

// O Chrome avisa (evento "beforeinstallprompt") quando o app pode ser instalado.
// Guardamos esse convite para mostrar nosso próprio botão "Instalar".

interface ConviteInstalacao extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let convite: ConviteInstalacao | null = null
const ouvintes = new Set<() => void>()
const avisar = () => ouvintes.forEach((f) => f())

/** Chamado uma vez no main.tsx, antes do React, para não perder o evento. */
export function ouvirConviteInstalacao() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    convite = e as ConviteInstalacao
    avisar()
  })
  window.addEventListener('appinstalled', () => {
    convite = null
    avisar()
  })
}

export function useConviteInstalacao(): boolean {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f)
      return () => ouvintes.delete(f)
    },
    () => convite !== null,
  )
}

export async function instalarApp(): Promise<void> {
  if (!convite) return
  await convite.prompt()
  await convite.userChoice
  convite = null
  avisar()
}

export function estaInstalado(): boolean {
  return matchMedia('(display-mode: standalone)').matches
}
