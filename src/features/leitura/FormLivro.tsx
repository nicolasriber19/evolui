import { useState } from 'react'
import { Botao } from '../../components/Botao'
import { CLASSE_CAMPO, CLASSE_ROTULO } from '../../components/estilos'
import { adicionarLivro, type DadosLivro } from '../../db/acoesLeitura'
import type { DiaISO, StatusLivro } from '../../db/tipos'
import { lerNumero } from '../../lib/formatar'

export const STATUS: { valor: StatusLivro; rotulo: string }[] = [
  { valor: 'lendo', rotulo: 'Lendo' },
  { valor: 'quero', rotulo: 'Quero ler' },
  { valor: 'lido', rotulo: 'Lido' },
]

/** Formulário para adicionar um livro. */
export function FormLivro({ hoje, inicial, onPronto }: { hoje: DiaISO; inicial?: Partial<DadosLivro>; onPronto: () => void }) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [autor, setAutor] = useState(inicial?.autor ?? '')
  const [paginas, setPaginas] = useState(inicial?.totalPaginas ? String(inicial.totalPaginas) : '')
  const [status, setStatus] = useState<StatusLivro>(inicial?.status ?? 'lendo')
  const [erro, setErro] = useState('')

  async function salvar() {
    const total = Math.round(lerNumero(paginas) ?? 0)
    if (!titulo.trim()) return setErro('Escreva o título do livro.')
    if (total <= 0) return setErro('Coloque o número de páginas (está no fim do livro ou na loja).')
    await adicionarLivro({ titulo: titulo.trim(), autor: autor.trim(), totalPaginas: total, status }, hoje)
    onPronto()
  }

  return (
    <div className="flex flex-col gap-3">
      <label>
        <span className={CLASSE_ROTULO}>Título</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={120} className={CLASSE_CAMPO} />
      </label>
      <div className="grid grid-cols-[1fr_6.5rem] gap-2">
        <label>
          <span className={CLASSE_ROTULO}>Autor (opcional)</span>
          <input value={autor} onChange={(e) => setAutor(e.target.value)} maxLength={80} className={CLASSE_CAMPO} />
        </label>
        <label>
          <span className={CLASSE_ROTULO}>Páginas</span>
          <input value={paginas} onChange={(e) => setPaginas(e.target.value)} inputMode="numeric" placeholder="320" className={CLASSE_CAMPO} />
        </label>
      </div>
      <div className="flex gap-1.5">
        {STATUS.map((s) => (
          <button
            key={s.valor}
            type="button"
            aria-pressed={status === s.valor}
            onClick={() => setStatus(s.valor)}
            className={`min-h-11 flex-1 rounded-xl text-sm transition-colors duration-150 ${
              status === s.valor ? 'bg-cartao-2 text-tinta ring-1 ring-linha-forte' : 'border border-linha text-tinta-suave'
            }`}
          >
            {s.rotulo}
          </button>
        ))}
      </div>
      {erro && (
        <p role="alert" className="text-sm text-perigo">
          {erro}
        </p>
      )}
      <Botao variante="primario" onClick={() => void salvar()}>
        Adicionar livro
      </Botao>
    </div>
  )
}
