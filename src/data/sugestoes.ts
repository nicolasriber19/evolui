import type { AreaId } from '../db/tipos'

// Sugestões que aparecem no primeiro uso (onboarding).
//
// TAREFA DO NICOLAS (Fase 1)
// Deixe essas listas com a sua cara: troque frases, crie hábitos que façam sentido
// na sua rotina e escreva metas que você realmente usaria.
// Regras: todo hábito precisa de uma versão mínima, e `dias` usa 0 = domingo ... 6 = sábado.
// Depois de editar, rode `npm run build` para conferir se não quebrou nada.

export interface SugestaoHabito {
  nome: string
  versaoMinima: string
  dias: number[]
}

export interface SugestoesDaArea {
  frases: string[]
  habitos: SugestaoHabito[]
  metas: string[]
}

const TODO_DIA = [0, 1, 2, 3, 4, 5, 6]
const SEG_A_SEX = [1, 2, 3, 4, 5]
const SEG_A_SAB = [1, 2, 3, 4, 5, 6]

export const SUGESTOES: Record<AreaId, SugestoesDaArea> = {
  corpo: {
    frases: ['Sou alguém que treina', 'Sou alguém que cuida do próprio corpo', 'Sou alguém que não pula treino'],
    habitos: [
      { nome: 'Treinar', versaoMinima: '10 flexões em casa', dias: SEG_A_SEX },
      { nome: 'Comer proteína em todas as refeições', versaoMinima: 'Um lanche com proteína', dias: TODO_DIA },
      { nome: 'Dormir 7 horas ou mais', versaoMinima: 'Largar o celular 30 min antes de dormir', dias: TODO_DIA },
    ],
    metas: ['Treinar 5 vezes', 'Não pular nenhum treino de segunda', 'Dormir antes da meia-noite 4 dias'],
  },
  estudo: {
    frases: ['Sou alguém que estuda todo dia', 'Sou um programador em formação', 'Sou alguém que aprende de verdade'],
    habitos: [
      { nome: 'Um pomodoro de estudo (25 min)', versaoMinima: '5 min revisando a matéria', dias: SEG_A_SAB },
      { nome: 'Praticar Python', versaoMinima: 'Resolver um exercício pequeno', dias: SEG_A_SEX },
      { nome: 'Revisar a aula do dia', versaoMinima: 'Reler o resumo da aula', dias: [1, 3, 4, 5] },
    ],
    metas: ['Estudar 5 pomodoros', 'Terminar a lista de Python', 'Fazer uma página em HTML e CSS'],
  },
  leitura: {
    frases: ['Sou um leitor', 'Sou alguém que lê todo dia'],
    habitos: [
      { nome: 'Ler 10 páginas', versaoMinima: 'Ler 2 páginas', dias: TODO_DIA },
      { nome: 'Ler antes de dormir', versaoMinima: 'Ler 1 página', dias: TODO_DIA },
    ],
    metas: ['Escolher um livro e começar', 'Ler em 5 dias da semana', 'Terminar um capítulo'],
  },
  comunicacao: {
    frases: ['Sou alguém que puxa conversa', 'Sou alguém que escuta e pergunta', 'Sou uma boa companhia para conversar'],
    habitos: [
      { nome: 'Puxar uma conversa', versaoMinima: 'Cumprimentar alguém pelo nome', dias: SEG_A_SEX },
      { nome: 'Fazer 3 perguntas abertas', versaoMinima: 'Fazer 1 pergunta aberta', dias: SEG_A_SEX },
    ],
    metas: ['Puxar conversa com alguém novo', 'Lembrar e usar 3 nomes', 'Contar uma história em menos de 1 minuto'],
  },
  mente: {
    frases: ['Sou alguém que cumpre o que promete a si mesmo', 'Sou alguém que se trata bem'],
    habitos: [
      { nome: 'Escrever as 3 vitórias do dia', versaoMinima: 'Escrever 1 vitória', dias: TODO_DIA },
      { nome: '5 minutos sem tela para pensar', versaoMinima: 'Respirar fundo 10 vezes', dias: TODO_DIA },
    ],
    metas: ['Escrever vitórias em 5 noites', 'Anotar uma coisa que fiz bem por dia'],
  },
  lazer: {
    frases: ['Sou alguém que escolhe o próprio lazer', 'Eu uso o celular, ele não me usa'],
    habitos: [
      { nome: 'Primeira hora do dia sem redes sociais', versaoMinima: '15 min sem redes ao acordar', dias: TODO_DIA },
      { nome: 'Jogar só depois de cumprir o dia', versaoMinima: 'Jogar com hora marcada para parar', dias: TODO_DIA },
    ],
    metas: ['Um dia inteiro sem redes', 'Jogar só depois dos estudos'],
  },
}
