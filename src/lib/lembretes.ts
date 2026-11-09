// Lembretes que vão para a agenda do celular.
// Um app de navegador não consegue tocar um aviso com o app fechado de forma confiável,
// mas o app de agenda consegue. Então o Evolui cria eventos repetidos com alarme:
// um por um no Google Agenda (link) ou todos de uma vez num arquivo .ics.

import { format } from 'date-fns'
import type { DiaISO, Lembrete } from '../db/tipos'
import { diaDaSemana, paraData, somarDias } from './datas'

export const ENDERECO_APP = 'https://evolui-gilt.vercel.app'

const AULA = [1, 3, 4, 5] // segunda, quarta, quinta e sexta: faculdade até 22h
const SEM_AULA = [0, 2, 6]

/** Lembretes sugeridos, pensados para a rotina do Nicolas. Todos começam desligados. */
export function lembretesPadrao(): Lembrete[] {
  return [
    { id: 'checkin', titulo: 'Evolui: o que importa hoje', texto: 'Check-in, hábitos e as 3 prioridades. Menos de 2 minutos.', hora: '09:00', dias: [0, 1, 2, 3, 4, 5, 6], ativo: false, caminho: '/' },
    { id: 'treino', titulo: 'Evolui: hora do treino', texto: 'Dia ruim? A versão mínima já conta.', hora: '12:30', dias: [1, 2, 3, 4, 5], ativo: false, caminho: '/areas/corpo' },
    { id: 'vitorias-aula', titulo: 'Evolui: 3 vitórias do dia', texto: 'Saindo da aula: escreva 3 vitórias, uma linha cada.', hora: '22:15', dias: AULA, ativo: false, caminho: '/' },
    { id: 'vitorias', titulo: 'Evolui: 3 vitórias do dia', texto: 'Antes de dormir: 3 vitórias, uma linha cada.', hora: '21:00', dias: SEM_AULA, ativo: false, caminho: '/' },
    { id: 'revisao', titulo: 'Evolui: revisão da semana', texto: 'Três minutos para olhar a semana e escolher as próximas metas.', hora: '19:00', dias: [0], ativo: false, caminho: '/revisao' },
    { id: 'backup', titulo: 'Evolui: salvar o backup', texto: 'Ajustes > Backup > Baixar. Seus dados ficam só no celular.', hora: '19:30', dias: [], mensal: true, ativo: false, caminho: '/ajustes' },
  ]
}

const CODIGOS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

/** A regra de repetição no formato que as agendas entendem (RFC 5545). */
export function regraDeRepeticao(l: Lembrete): string {
  if (l.mensal) return 'RRULE:FREQ=MONTHLY;BYDAY=1SU'
  const dias = [1, 2, 3, 4, 5, 6, 0].filter((d) => l.dias.includes(d)).map((d) => CODIGOS[d])
  return `RRULE:FREQ=WEEKLY;BYDAY=${dias.join(',')}`
}

/** O primeiro dia (a partir de hoje) em que o lembrete acontece. */
export function primeiraData(l: Lembrete, hoje: DiaISO): DiaISO {
  for (let i = 0; i < 40; i += 1) {
    const dia = somarDias(hoje, i)
    const d = paraData(dia)
    if (l.mensal ? d.getDay() === 0 && d.getDate() <= 7 : l.dias.includes(diaDaSemana(dia))) return dia
  }
  return hoje
}

function quando(dia: DiaISO, hora: string, mais = 0): string {
  const [h, m] = hora.split(':').map(Number)
  const d = paraData(dia)
  d.setHours(h, m + mais, 0, 0)
  return format(d, "yyyyMMdd'T'HHmmss")
}

/** Link que abre o Google Agenda com o evento repetido já preenchido. */
export function linkGoogleAgenda(l: Lembrete, hoje: DiaISO): string {
  const dia = primeiraData(l, hoje)
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: l.titulo,
    details: `${l.texto}\n${ENDERECO_APP}${l.caminho}`,
    dates: `${quando(dia, l.hora)}/${quando(dia, l.hora, 10)}`,
    recur: regraDeRepeticao(l),
    ctz: 'America/Sao_Paulo',
  })
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}

/** Texto dentro do .ics precisa escapar vírgula, ponto e vírgula, barra e quebra de linha. */
function escapar(texto: string): string {
  return texto.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Linhas do .ics não podem passar de 75 caracteres: as maiores são "dobradas" com um espaço no começo. */
function dobrar(linha: string): string {
  const partes: string[] = []
  let resto = linha
  while (resto.length > 74) {
    partes.push(resto.slice(0, 74))
    resto = ' ' + resto.slice(74)
  }
  partes.push(resto)
  return partes.join('\r\n')
}

/** Um arquivo .ics com todos os lembretes ligados (eventos repetidos com alarme na hora). */
export function gerarIcs(lembretes: Lembrete[], hoje: DiaISO, agora = new Date()): string {
  const carimbo = format(new Date(agora.getTime() + agora.getTimezoneOffset() * 60_000), "yyyyMMdd'T'HHmmss'Z'")
  const linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Evolui//Lembretes//PT-BR', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Evolui']
  for (const l of lembretes.filter((x) => x.ativo && (x.mensal || x.dias.length > 0))) {
    const dia = primeiraData(l, hoje)
    linhas.push(
      'BEGIN:VEVENT',
      `UID:evolui-${l.id}@evolui-gilt.vercel.app`,
      `DTSTAMP:${carimbo}`,
      `DTSTART;TZID=America/Sao_Paulo:${quando(dia, l.hora)}`,
      'DURATION:PT10M',
      regraDeRepeticao(l),
      `SUMMARY:${escapar(l.titulo)}`,
      `DESCRIPTION:${escapar(`${l.texto}\n${ENDERECO_APP}${l.caminho}`)}`,
      `URL:${ENDERECO_APP}${l.caminho}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapar(l.titulo)}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
    )
  }
  linhas.push('END:VCALENDAR')
  return linhas.map(dobrar).join('\r\n') + '\r\n'
}
