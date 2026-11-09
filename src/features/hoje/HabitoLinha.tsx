import { Check as IconeCheck } from 'lucide-react'
import { PontoArea } from '../../components/IconeArea'
import type { Check, Habito, TipoCheck } from '../../db/tipos'
import type { ResultadoCorrente } from '../../lib/corrente'

interface Props {
  habito: Habito
  check?: Check
  resultado: ResultadoCorrente
  onMarcar: (tipo: TipoCheck | null, origem: HTMLElement) => void
}

const dias = (n: number) => `${n} ${n === 1 ? 'dia' : 'dias'}`

/** A frase pequena embaixo do hábito: conta a corrente sem culpa. */
function textoDoEstado(habito: Habito, tipo: TipoCheck | undefined, r: ResultadoCorrente) {
  if (tipo === 'completo') {
    return { texto: r.corrente >= 2 ? `corrente de ${dias(r.corrente)}` : 'voto dado, a corrente começou', alerta: false }
  }
  if (tipo === 'minimo') return { texto: 'versão mínima feita, também conta', alerta: false }
  if (r.estado === 'elo-aberto') return { texto: 'Um elo ficou aberto. Hoje você fecha.', alerta: true }
  if (r.estado === 'recomecar') {
    const recorde = r.recorde > 0 ? ` Seu recorde: ${dias(r.recorde)}.` : ''
    return { texto: `Recomeço: um voto hoje já conta.${recorde}`, alerta: false }
  }
  if (r.corrente > 0) return { texto: `corrente de ${dias(r.corrente)} · mínimo: ${habito.versaoMinima}`, alerta: false }
  return { texto: `mínimo: ${habito.versaoMinima}`, alerta: false }
}

export function HabitoLinha({ habito, check, resultado, onMarcar }: Props) {
  const tipo = check?.tipo
  const { texto, alerta } = textoDoEstado(habito, tipo, resultado)

  return (
    <li className="flex items-center gap-3 border-t border-linha py-2.5 first:border-t-0 first:pt-0.5 last:pb-0">
      <button
        type="button"
        aria-pressed={tipo === 'completo'}
        aria-label={tipo === 'completo' ? `Desmarcar ${habito.nome}` : `Marcar ${habito.nome} como feito`}
        onClick={(e) => onMarcar(tipo === 'completo' ? null : 'completo', e.currentTarget)}
        className={`grid size-11 shrink-0 place-items-center rounded-xl border-[1.5px] transition-[transform,background-color,border-color,color] duration-150 ease-saida active:scale-[0.9] ${
          tipo === 'completo'
            ? 'border-destaque bg-destaque text-destaque-tinta'
            : tipo === 'minimo'
              ? 'border-destaque text-destaque-texto'
              : 'border-tinta-suave/60 text-transparent'
        }`}
      >
        <IconeCheck key={tipo ?? 'vazio'} className={'size-5 ' + (tipo ? 'marca-pop' : '')} strokeWidth={2.75} aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[15px] leading-snug">
          <PontoArea area={habito.areaId} />
          <span className="min-w-0">{habito.nome}</span>
        </p>
        <p className={`mt-0.5 text-xs leading-snug ${alerta ? 'text-destaque-texto' : 'text-tinta-suave'}`}>{texto}</p>
      </div>

      {tipo !== 'completo' && (
        <button
          type="button"
          aria-pressed={tipo === 'minimo'}
          aria-label={tipo === 'minimo' ? `Desmarcar versão mínima de ${habito.nome}` : `Fiz a versão mínima: ${habito.versaoMinima}`}
          onClick={(e) => onMarcar(tipo === 'minimo' ? null : 'minimo', e.currentTarget)}
          className={`min-h-11 shrink-0 rounded-xl px-3 text-xs font-medium transition-[transform,background-color,color] duration-150 ease-saida active:scale-[0.95] ${
            tipo === 'minimo' ? 'bg-cartao-2 text-destaque-texto' : 'border border-linha text-tinta-suave hover:text-tinta'
          }`}
        >
          Mínimo
        </button>
      )}
    </li>
  )
}
