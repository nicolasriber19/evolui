import type { AreaId } from '../db/tipos'

export interface InfoArea {
  nome: string
  descricao: string
}

/** As 6 áreas do app, na ordem em que aparecem. */
export const ORDEM_AREAS: AreaId[] = ['corpo', 'estudo', 'leitura', 'comunicacao', 'mente', 'lazer']

export const INFO_AREAS: Record<AreaId, InfoArea> = {
  corpo: { nome: 'Corpo', descricao: 'Academia, sono e energia' },
  estudo: { nome: 'Estudo', descricao: 'Faculdade e programação' },
  leitura: { nome: 'Leitura', descricao: 'Livros, um pouco por dia' },
  comunicacao: { nome: 'Comunicação', descricao: 'Conversar melhor, um desafio por semana' },
  mente: { nome: 'Mente', descricao: 'Autoestima e promessas cumpridas' },
  lazer: { nome: 'Lazer', descricao: 'Jogos e redes escolhidos, não no automático' },
}
