import { useEffect } from 'react'
import { avancarFase } from '../../db/acoesEstudo'
import { useEstadoFoco } from '../../db/hooks'
import type { Config } from '../../db/tipos'
import { PAUSA_PADRAO } from '../../lib/foco'
import { avisar } from './avisos'

/**
 * O "motor" do timer: fica ligado em todas as telas (está no Layout).
 * Enquanto o timer roda, confere a cada segundo se a fase acabou.
 * Ao voltar para o app, confere na hora (o celular pausa o app em segundo plano).
 */
export function useMotorFoco(config: Config) {
  const estado = useEstadoFoco()
  const rodando = estado?.rodando === true
  const { viradaHora, pausaMin = PAUSA_PADRAO } = config

  useEffect(() => {
    if (!rodando) return
    let ativo = true
    const conferir = async () => {
      const resultado = await avancarFase(viradaHora, pausaMin)
      if (!ativo || !resultado) return
      if (resultado === 'foco-acabou') void avisar('Foco concluído', 'Sessão salva. Hora de uma pausa curta.')
      else void avisar('Pausa encerrada', 'Bora para mais um foco?')
    }
    void conferir()
    const relogio = setInterval(() => void conferir(), 1000)
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') void conferir()
    }
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      ativo = false
      clearInterval(relogio)
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [rodando, viradaHora, pausaMin])
}

/** Mantém a tela acesa enquanto `ligado` for true (se o celular permitir). */
export function useTelaLigada(ligado: boolean) {
  useEffect(() => {
    if (!ligado || !('wakeLock' in navigator)) return
    let trava: WakeLockSentinel | null = null
    let ativo = true
    const pedir = async () => {
      try {
        if (document.visibilityState === 'visible') trava = await navigator.wakeLock.request('screen')
        if (!ativo) await trava?.release()
      } catch {
        // bateria fraca ou o navegador não deixou
      }
    }
    void pedir()
    // A trava cai quando o app sai da tela; ao voltar, pedimos de novo.
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') void pedir()
    }
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      ativo = false
      document.removeEventListener('visibilitychange', aoVoltar)
      void trava?.release()
    }
  }, [ligado])
}
