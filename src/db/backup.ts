// Exportar e importar backup em JSON.
// JSON é só texto organizado: dá para abrir o arquivo no bloco de notas e ler seus dados.

import { db, VERSAO_BANCO } from './db'
import { atualizarConfig } from './acoes'
import { diaLogico } from '../lib/datas'

export interface ArquivoBackup {
  app: 'evolui'
  versaoBanco: number
  exportadoEm: string
  tabelas: Record<string, unknown[]>
}

export async function gerarBackup(): Promise<ArquivoBackup> {
  const tabelas: Record<string, unknown[]> = {}
  await db.transaction('r', db.tables, async () => {
    for (const tabela of db.tables) tabelas[tabela.name] = await tabela.toArray()
  })
  return { app: 'evolui', versaoBanco: VERSAO_BANCO, exportadoEm: new Date().toISOString(), tabelas }
}

function nomeDoArquivo(): string {
  return `evolui-backup-${diaLogico(new Date(), 0)}.json`
}

async function arquivoDeBackup(): Promise<File> {
  const dados = await gerarBackup()
  return new File([JSON.stringify(dados)], nomeDoArquivo(), { type: 'application/json' })
}

/** Baixa o backup como arquivo (no Android vai para a pasta Downloads). */
export async function baixarBackup(): Promise<void> {
  const arquivo = await arquivoDeBackup()
  const url = URL.createObjectURL(arquivo)
  const link = document.createElement('a')
  link.href = url
  link.download = arquivo.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  await atualizarConfig({ ultimoBackupEm: Date.now() })
}

/** O aparelho deixa compartilhar arquivos JSON (Drive, WhatsApp...)? */
export function podeCompartilhar(): boolean {
  const teste = new File(['{}'], 'teste.json', { type: 'application/json' })
  return typeof navigator.canShare === 'function' && navigator.canShare({ files: [teste] })
}

/** Abre a tela de compartilhar do celular com o arquivo de backup. */
export async function compartilharBackup(): Promise<void> {
  const arquivo = await arquivoDeBackup()
  await navigator.share({ files: [arquivo], title: 'Backup do Evolui' })
  await atualizarConfig({ ultimoBackupEm: Date.now() })
}

/** Confere se o conteúdo é mesmo um backup do Evolui. Lança um erro com mensagem amigável se não for. */
export function validarBackup(conteudo: unknown): ArquivoBackup {
  const c = conteudo as Partial<ArquivoBackup> | null
  if (!c || typeof c !== 'object' || c.app !== 'evolui' || typeof c.tabelas !== 'object' || c.tabelas === null) {
    throw new Error('Esse arquivo não é um backup do Evolui.')
  }
  if (typeof c.versaoBanco !== 'number' || c.versaoBanco > VERSAO_BANCO) {
    throw new Error('Esse backup é de uma versão mais nova do app. Atualize o app antes de restaurar.')
  }
  for (const [nome, linhas] of Object.entries(c.tabelas)) {
    if (!Array.isArray(linhas)) throw new Error(`O backup está com a parte "${nome}" danificada.`)
  }
  return c as ArquivoBackup
}

export async function lerArquivoDeBackup(arquivo: File): Promise<ArquivoBackup> {
  let conteudo: unknown
  try {
    conteudo = JSON.parse(await arquivo.text())
  } catch {
    throw new Error('Não deu para ler esse arquivo. Ele precisa ser o .json gerado pelo Evolui.')
  }
  return validarBackup(conteudo)
}

/**
 * Apaga tudo o que está no aparelho e coloca os dados do backup no lugar.
 * Tudo acontece numa "transação": se algo der errado no meio, nada é alterado.
 * (Quando existir a versão 2 do banco, os backups antigos serão convertidos aqui.)
 */
export async function restaurarBackup(backup: ArquivoBackup): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const tabela of db.tables) {
      await tabela.clear()
      const linhas = backup.tabelas[tabela.name]
      if (Array.isArray(linhas) && linhas.length > 0) await tabela.bulkPut(linhas)
    }
  })
}
