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
  /** Minutos de foco e de pausa do Pomodoro (padrão 25 e 5). */
  focoMin?: number
  pausaMin?: number
  /** Manter a tela ligada enquanto o timer roda. */
  manterTelaLigada?: boolean
  /** Fase 4: último nível de cada área que você já viu (para avisar quando sobe). */
  niveisVistos?: Partial<Record<AreaId, number>>
  /** Fase 5: lembretes que vão para a agenda do celular. */
  lembretes?: Lembrete[]
}

/** Um lembrete que vira evento repetido na agenda (Google Agenda ou arquivo .ics). */
export interface Lembrete {
  id: string
  titulo: string
  texto: string
  /** 'HH:MM' */
  hora: string
  /** Dias da semana (0 = domingo). Vazio + mensal = primeiro domingo de cada mês. */
  dias: number[]
  mensal?: boolean
  ativo: boolean
  /** Endereço do app que o lembrete abre. */
  caminho: string
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

/** Um registro por dia: check-in, prioridades, vitórias e o diário curto. */
export interface Dia extends Base {
  id: DiaISO
  energia?: number
  humor?: number
  prioridades: ItemLista[]
  vitorias: string[]
  /** Fase 3 (Mente): uma coisa boa pela qual você é grato hoje. */
  gratidao?: string
  /** Fase 3 (Mente): uma coisa que você fez bem hoje. */
  fizBem?: string
}

/** O desafio de conversa sorteado para a semana. */
export interface DesafioDaSemana {
  desafioId: string
  /** Cópia do texto, para o histórico não mudar se você editar a lista depois. */
  texto: string
  sorteadoEm: number
}

/** Um registro por semana: as 3 metas, o desafio de conversa (e, na Fase 4, a revisão). */
/** Respostas da revisão de domingo. */
export interface RevisaoSemana {
  funcionou: string
  naoFuncionou: string
  /** Preenchido quando você fecha a semana no fim da revisão. */
  feitaEm?: number
}

export interface Semana extends Base {
  id: SemanaISO
  metas: ItemLista[]
  desafio?: DesafioDaSemana
  /** Fase 4: o foco desta semana, escolhido na revisão da semana anterior. */
  foco?: string
  /** Fase 4: a revisão desta semana. */
  revisao?: RevisaoSemana
}

// ---------- Fase 2: Corpo ----------

export interface Exercicio extends Base {
  nome: string
}

export interface ItemModelo {
  exercicioId: string
  series: number
  /** Repetições sugeridas, como texto: "8-10", "12", "até a falha". */
  repeticoes: string
}

/** Modelo de treino (A, B, C...) para não digitar tudo de novo. */
export interface ModeloTreino extends Base {
  nome: string
  titulo: string
  itens: ItemModelo[]
  ordem: number
}

/** Um treino feito (ou em andamento, enquanto `concluidoEm` estiver vazio). */
export interface Treino extends Base {
  dia: DiaISO
  modeloId?: string
  titulo: string
  /** Exercícios na ordem em que aparecem na tela. */
  exercicioIds: string[]
  iniciadoEm: number
  concluidoEm?: number
}

/** Uma série feita. Só existe depois que você marca a série como feita. */
export interface Serie extends Base {
  treinoId: string
  exercicioId: string
  dia: DiaISO
  ordem: number
  cargaKg: number
  repeticoes: number
}

/** Peso corporal e sono de um dia (os dois opcionais). */
export interface Medida extends Base {
  id: DiaISO
  pesoKg?: number
  sonoHoras?: number
}

// ---------- Fase 2: Estudo ----------

export type TipoMateria = 'faculdade' | 'programacao' | 'outro'

export interface Materia extends Base {
  nome: string
  tipo: TipoMateria
  ativa: boolean
  ordem: number
}

export interface SessaoEstudo extends Base {
  materiaId: string
  dia: DiaISO
  inicio: number
  minutos: number
  origem: 'foco' | 'manual'
}

/** O timer de foco que está rodando agora (só existe um). */
export interface EstadoFoco extends Base {
  id: 'foco'
  materiaId: string
  fase: 'foco' | 'pausa'
  rodando: boolean
  /** Quando a fase acaba (só enquanto está rodando). */
  fimEm?: number
  /** Quanto falta (usado quando está pausado). */
  restanteMs: number
  duracaoMs: number
  /** Quando esta fase de foco começou, para gravar a sessão no dia certo. */
  inicioFaseEm: number
}

// ---------- Fase 2: Leitura ----------

export type StatusLivro = 'lendo' | 'quero' | 'lido'

export interface Livro extends Base {
  titulo: string
  autor: string
  totalPaginas: number
  paginaAtual: number
  status: StatusLivro
  comecouEm?: DiaISO
  terminouEm?: DiaISO
  ordem: number
}

export interface Leitura extends Base {
  livroId: string
  dia: DiaISO
  paginas: number
  ateAPagina: number
}

export interface NotaLivro extends Base {
  livroId: string
  tipo: 'nota' | 'trecho'
  texto: string
  pagina?: number
}

// ---------- Fase 3: Comunicação ----------

/** Um desafio da lista (editável) de onde sai o sorteio da semana. */
export interface Desafio extends Base {
  texto: string
  ordem: number
}

/** Cada vez que você tentou o desafio da semana. */
export interface Tentativa extends Base {
  semana: SemanaISO
  dia: DiaISO
  desafioTexto: string
  /** 1 = travei, 5 = fluiu. */
  comoFoi: number
  relato: string
  aprendi: string
}

export interface Dica extends Base {
  texto: string
  ordem: number
}

// ---------- Fase 3: Mente ----------

/** Uma conquista guardada para reler nos dias ruins. */
export interface Evidencia extends Base {
  dia: DiaISO
  texto: string
  areaId?: AreaId
}

// ---------- Fase 3: Lazer ----------

export interface TipoLazer extends Base {
  nome: string
  /** Quanto tempo por semana você escolheu gastar com isso. */
  orcamentoMin: number
  ativo: boolean
  ordem: number
}

export interface RegistroLazer extends Base {
  tipoId: string
  dia: DiaISO
  minutos: number
  /** true = você escolheu; false = foi no automático. */
  escolhido: boolean
}
