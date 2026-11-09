import { describe, expect, it } from 'vitest'
import { gerarIcs, lembretesPadrao, linkGoogleAgenda, primeiraData, regraDeRepeticao } from './lembretes'

const padrao = lembretesPadrao()
const treino = { ...padrao.find((l) => l.id === 'treino')!, ativo: true }
const backup = { ...padrao.find((l) => l.id === 'backup')!, ativo: true }

describe('lembretes', () => {
  it('monta a regra de repetição semanal e mensal', () => {
    expect(regraDeRepeticao(treino)).toBe('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR')
    expect(regraDeRepeticao(backup)).toBe('RRULE:FREQ=MONTHLY;BYDAY=1SU')
  })

  it('começa no primeiro dia que vale a partir de hoje', () => {
    expect(primeiraData(treino, '2026-11-14')).toBe('2026-11-16') // sábado -> segunda
    expect(primeiraData(treino, '2026-11-10')).toBe('2026-11-10') // terça vale
    expect(primeiraData(backup, '2026-11-09')).toBe('2026-12-06') // primeiro domingo de dezembro
  })

  it('gera um .ics só com os lembretes ligados, com alarme e texto escapado', () => {
    const ics = gerarIcs([treino, { ...padrao[0], ativo: false }], '2026-11-14', new Date(Date.UTC(2026, 10, 14, 12)))
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
    expect(ics).toContain('DTSTART;TZID=America/Sao_Paulo:20261116T123000')
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR')
    expect(ics).toContain('TRIGGER:PT0M')
    expect(ics).toContain('SUMMARY:Evolui: hora do treino')
    const desdobrado = ics.replace(/\r\n /g, '') // as agendas juntam de volta as linhas dobradas
    expect(desdobrado).toContain('Dia ruim? A versão mínima já conta.\\nhttps://evolui-gilt.vercel.app')
    // nenhuma linha passa de 75 caracteres
    expect(ics.split('\r\n').every((linha) => linha.length <= 75)).toBe(true)
  })

  it('o link do Google Agenda leva a repetição e o fuso de Brasília', () => {
    const url = new URL(linkGoogleAgenda(treino, '2026-11-14'))
    expect(url.hostname).toBe('calendar.google.com')
    expect(url.searchParams.get('recur')).toBe('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR')
    expect(url.searchParams.get('dates')).toBe('20261116T123000/20261116T124000')
    expect(url.searchParams.get('ctz')).toBe('America/Sao_Paulo')
  })
})
