import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Download, Share2, ShieldCheck, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Botao } from '../../components/Botao'
import { Cartao } from '../../components/Cartao'
import { Folha } from '../../components/Folha'
import {
  baixarBackup,
  compartilharBackup,
  lerArquivoDeBackup,
  podeCompartilhar,
  restaurarBackup,
  type ArquivoBackup,
} from '../../db/backup'
import type { Config } from '../../db/tipos'

const momento = (d: Date) => format(d, "d 'de' MMM 'às' HH:mm", { locale: ptBR })

/** Baixar, compartilhar e restaurar o backup, e proteger o armazenamento. */
export function SecaoBackup({ config }: { config: Config }) {
  const [mensagem, setMensagem] = useState<{ texto: string; erro?: boolean } | null>(null)
  const [pendente, setPendente] = useState<ArquivoBackup | null>(null)
  const [protegido, setProtegido] = useState<boolean | null>(null)
  const [compartilha] = useState(podeCompartilhar)
  const arquivoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    navigator.storage
      ?.persisted?.()
      .then(setProtegido)
      .catch(() => setProtegido(null))
  }, [])

  async function executar(acao: () => Promise<void>, sucesso: string) {
    try {
      await acao()
      setMensagem({ texto: sucesso })
    } catch (e) {
      if ((e as Error).name === 'AbortError') return // fechou a tela de compartilhar
      setMensagem({ texto: (e as Error).message || 'Algo deu errado. Tente de novo.', erro: true })
    }
  }

  async function aoEscolherArquivo(arquivo: File | undefined) {
    if (!arquivo) return
    try {
      setPendente(await lerArquivoDeBackup(arquivo))
      setMensagem(null)
    } catch (e) {
      setMensagem({ texto: (e as Error).message, erro: true })
    }
  }

  return (
    <Cartao titulo="Backup">
      <p className="text-sm text-tinta-suave">
        {config.ultimoBackupEm
          ? `Último backup: ${momento(new Date(config.ultimoBackupEm))}.`
          : 'Você ainda não salvou nenhum backup.'}{' '}
        Seus dados ficam só neste aparelho, e o backup é a sua cópia de segurança.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Botao variante="primario" onClick={() => void executar(baixarBackup, 'Backup salvo na pasta Downloads.')}>
          <Download className="size-4" aria-hidden="true" /> Baixar
        </Botao>
        {compartilha ? (
          <Botao onClick={() => void executar(compartilharBackup, 'Backup compartilhado.')}>
            <Share2 className="size-4" aria-hidden="true" /> Compartilhar
          </Botao>
        ) : (
          <Botao onClick={() => arquivoRef.current?.click()}>
            <Upload className="size-4" aria-hidden="true" /> Restaurar
          </Botao>
        )}
      </div>
      {compartilha && (
        <Botao variante="fantasma" className="mt-1 w-full" onClick={() => arquivoRef.current?.click()}>
          <Upload className="size-4" aria-hidden="true" /> Restaurar de um arquivo
        </Botao>
      )}
      <input
        ref={arquivoRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          void aoEscolherArquivo(e.target.files?.[0])
          e.target.value = '' // deixa escolher o mesmo arquivo de novo
        }}
      />

      {mensagem && (
        <p role="status" className={`mt-3 text-sm ${mensagem.erro ? 'text-perigo' : 'text-tinta-suave'}`}>
          {mensagem.texto}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3 border-t border-linha pt-3">
        <ShieldCheck
          className={`size-5 shrink-0 ${protegido ? 'text-destaque-texto' : 'text-tinta-suave'}`}
          aria-hidden="true"
        />
        <p className="flex-1 text-sm text-tinta-suave">
          {protegido
            ? 'Armazenamento protegido: o navegador não apaga seus dados sozinho.'
            : 'Armazenamento ainda não protegido. Instalar o app costuma liberar.'}
        </p>
        {protegido === false && (
          <Botao
            onClick={async () => {
              const ok = await navigator.storage.persist()
              setProtegido(ok)
              if (!ok) setMensagem({ texto: 'O Chrome ainda não liberou. Instale o app e tente de novo.' })
            }}
          >
            Proteger
          </Botao>
        )}
      </div>

      <Folha aberta={pendente !== null} onFechar={() => setPendente(null)} titulo="Restaurar backup?">
        {pendente && (
          <>
            <p className="text-sm text-tinta-suave">
              Backup de {momento(new Date(pendente.exportadoEm))}. Ele vai substituir todos os dados deste aparelho, e isso
              não dá para desfazer.
            </p>
            <p className="mt-2 text-sm text-tinta-suave">Se quiser garantia, baixe antes um backup do que está aqui agora.</p>
            <div className="mt-5 flex gap-2">
              <Botao className="flex-1" onClick={() => setPendente(null)}>
                Cancelar
              </Botao>
              <Botao
                variante="primario"
                className="flex-1"
                onClick={async () => {
                  await restaurarBackup(pendente)
                  setPendente(null)
                  setMensagem({ texto: 'Backup restaurado.' })
                }}
              >
                Restaurar
              </Botao>
            </div>
          </>
        )}
      </Folha>
    </Cartao>
  )
}
