import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Botao } from '../../components/Botao'

/**
 * O "service worker" é um ajudante que guarda o app no celular para abrir sem internet.
 * Quando sai uma versão nova, ele avisa, e este aviso pergunta se pode atualizar.
 */
export function AvisoAtualizacao() {
  const {
    needRefresh: [temNovaVersao, setTemNovaVersao],
    offlineReady: [prontoOffline, setProntoOffline],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (!prontoOffline) return
    const t = setTimeout(() => setProntoOffline(false), 4000)
    return () => clearTimeout(t)
  }, [prontoOffline, setProntoOffline])

  if (!temNovaVersao && !prontoOffline) return null

  return (
    <div
      role="status"
      className="entra fixed inset-x-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-linha bg-cartao-2 p-3 pl-4 shadow-(--sombra)"
    >
      <p className="flex-1 text-sm">{temNovaVersao ? 'Tem uma versão nova do Evolui.' : 'Pronto para usar sem internet.'}</p>
      {temNovaVersao && (
        <>
          <Botao variante="fantasma" onClick={() => setTemNovaVersao(false)}>
            Depois
          </Botao>
          <Botao variante="primario" onClick={() => updateServiceWorker(true)}>
            Atualizar
          </Botao>
        </>
      )}
    </div>
  )
}
