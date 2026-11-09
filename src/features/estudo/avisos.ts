// Avisos do timer: notificação do sistema quando o app está em segundo plano,
// e som + vibração quando você está olhando para ele.

/** Pede permissão de notificação (só pode ser chamado depois de um toque seu). */
export async function pedirPermissaoDeAviso(): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'default') return
  try {
    await Notification.requestPermission()
  } catch {
    // Alguns navegadores não deixam: o timer funciona igual, só sem notificação.
  }
}

function bipe() {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const volume = audio.createGain()
    osc.frequency.value = 880
    volume.gain.setValueAtTime(0.0001, audio.currentTime)
    volume.gain.exponentialRampToValueAtTime(0.2, audio.currentTime + 0.02)
    volume.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.35)
    osc.connect(volume).connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + 0.4)
    osc.onended = () => void audio.close()
  } catch {
    // sem som, tudo bem
  }
}

export async function avisar(titulo: string, texto: string): Promise<void> {
  navigator.vibrate?.([200, 100, 200])
  if (document.visibilityState === 'visible') {
    bipe()
    return
  }
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    // No Android, a notificação precisa sair pelo service worker.
    const registro = await navigator.serviceWorker?.getRegistration()
    if (registro) await registro.showNotification(titulo, { body: texto, icon: '/pwa-192x192.png', tag: 'evolui-foco' })
    else new Notification(titulo, { body: texto, icon: '/pwa-192x192.png' })
  } catch {
    // se falhar, o resultado aparece quando você abrir o app
  }
}
