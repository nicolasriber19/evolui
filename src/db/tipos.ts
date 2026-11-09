// Formato de cada "tabela" do banco. O TypeScript usa isso para avisar
// se a gente tentar guardar um campo com nome ou tipo errado.

/** Um dia no formato 'AAAA-MM-DD', já ajustado pela virada das 4h. */
export type DiaISO = string
/** Uma semana no formato ISO 'AAAA-Www' (ex.: '2026-W46'), de segunda a domingo. */
export type SemanaISO = string

export type AreaId = 'corpo' | 'estudo' | 'leitura' | 'comunicacao' | 'mente' | 'lazer'
export type Tema = 'escuro' | 'claro' | 'sistema'
export type TipoCheck = 'completo' | 'minimo'

/** Campos que todo registro tem. Eles preparam o app para sincronizar com a nuvem no futuro. */
export interface Base {
  id: string
  criadoEm: number
  atualizadoEm: number
  /** Preenchido quando o registro é apagado. Nunca apagamos de verdade. */
  apagadoEm?: number
}

export interface Config extends Base {
  id: 'geral'
  tema: Tema
  /** Hora em que o dia vira (padrão 4h). */
  viradaHora: number
  /** A partir dessa hora aparece o bloco "3 vitórias do dia" (padrão 20h). */
  vitoriasHora: number
  onboardingFeito: boolean
  /** Primeiro dia de uso do app. */
  inicioEm?: DiaISO
  ultimoBackupEm?: number
}

export interface Area extends Base {
  id: AreaId
  ativa: boolean
  /** Frase de identidade, ex.: "Sou alguém que treina". */
  frase: string
  ordem: number
}

export interface Pausa {
  /** Primeiro dia pausado. */
  de: DiaISO
  /** Dia em que voltou (não conta como pausado). Vazio = ainda pausado. */
  ate?: DiaISO
}

export interface Habito extends Base {
  areaId: AreaId
  nome: string
  /** Versão para os dias ruins, ex.: "Ler 2 páginas". Marcar ela também conta. */
  versaoMinima: string
  /** Dias da semana em que o hábito vale: 0 = domingo, 1 = segunda ... 6 = sábado. */
  dias: number[]
  /** Dia a partir do qual o hábito passa a contar. */
  inicio: DiaISO
  pausas: Pausa[]
  ativo: boolean
  /** true quando foi pausado porque a área inteira foi desligada (volta sozinho ao religar). */
  pausaDaArea?: boolean
  ordem: number
}

export interface Check extends Base {
  /** Sempre `${habitoId}:${dia}`, assim só existe um check por hábito por dia. */
  id: string
  habitoId: string
  areaId: AreaId
  dia: DiaISO
  tipo: TipoCheck
}

export interface ItemLista {
  id: string
  texto: string
  feita: boolean
}

/** Um registro por dia: check-in, prioridades e vitórias. */
export interface Dia extends Base {
  id: DiaISO
  energia?: number
  humor?: number
  prioridades: ItemLista[]
  vitorias: string[]
}

/** Um registro por semana: as 3 metas (e, na Fase 4, as respostas da revisão). */
export interface Semana extends Base {
  id: SemanaISO
  metas: ItemLista[]
}
