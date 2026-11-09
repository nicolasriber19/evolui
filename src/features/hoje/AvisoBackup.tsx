import { HardDriveDownload } from 'lucide-react'
import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { baixarBackup } from '../../db/backup'
import type { Config, DiaISO } from '../../db/tipos'
import { diasEntre } from '../../lib/datas'

const UM_DIA = 86_400_000

/** Lembrete gentil de backup: aparece depois de 7 dias sem salvar (ou 3 dias de uso sem nenhum backup). */
export function AvisoBackup({ config, hoje }: { config: Config; hoje: DiaISO }) {
  const [salvando, setSalvando] = useState(false)
  const [agora] = useState(() => Date.now())

  const diasSemBackup = config.ultimoBackupEm ? Math.floor((agora - config.ultimoBackupEm) / UM_DIA) : null
  const diasDeUso = config.inicioEm ? diasEntre(config.inicioEm, hoje) : 0
  const precisa = diasSemBackup !== null ? diasSemBackup >= 7 : diasDeUso >= 3
  if (!precisa) return null

  const texto =
    diasSemBackup !== null ? `Seu último backup foi há ${diasSemBackup} dias.` : 'Você ainda não salvou nenhum backup.'

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-linha bg-cartao py-2.5 pr-2.5 pl-4">
      <HardDriveDownload className="size-5 shrink-0 text-tinta-suave" aria-hidden="true" />
      <p className="flex-1 text-sm text-tinta-suave">{texto}</p>
      <Botao
        variante="primario"
        disabled={salvando}
        onClick={async () => {
          setSalvando(true)
          try {
            await baixarBackup()
          } finally {
            setSalvando(false)
          }
        }}
      >
        Salvar
      </Botao>
    </div>
  )
}
