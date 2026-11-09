// Listas sugeridas da área Comunicação e do Lazer. Tudo é editável dentro do app;
// estas listas só entram quando você toca em "Usar a lista sugerida".
//
// TAREFA DO NICOLAS (Fase 3)
// Reescreva os desafios e as dicas com situações da SUA vida: a faculdade à noite,
// a academia, o estágio que você procura, os amigos. Um bom desafio é pequeno,
// dá para fazer numa semana e você sabe dizer se fez ou não.
// Depois rode `npm test` (tem um teste que confere se as listas não estão vazias).

export const DESAFIOS_SUGERIDOS = [
  'Puxe conversa com alguém novo',
  'Faça 3 perguntas abertas numa conversa',
  'Conte uma história em menos de 1 minuto',
  'Lembre e use o nome de alguém',
  'Elogie algo específico que alguém fez',
  'Faça uma pergunta em voz alta na aula',
  'Mande mensagem para um amigo com quem você não fala há tempos',
  'Peça uma recomendação a alguém que você não conhece bem',
  'Antes de responder, resuma o que a pessoa disse',
  'Sustente o olhar enquanto a pessoa fala com você',
]

export const DICAS_SUGERIDAS = [
  'Troque perguntas de sim ou não por "como" e "por quê".',
  'Repita a última palavra da pessoa em tom de pergunta: ela continua falando.',
  'Diga o nome da pessoa uma vez logo no começo, para não esquecer.',
  'Mostre que ouviu: resuma em uma frase o que a pessoa contou.',
  'História boa tem começo, um problema e uma virada. Cabe em um minuto.',
  'Para puxar assunto, comente algo do lugar onde vocês estão.',
  'Elogie uma escolha da pessoa (o que ela fez, disse ou escolheu), não a aparência.',
  'Um silêncio curto é normal. Respire antes de correr para preencher.',
  'Termine a conversa no alto: "Foi bom falar com você, até mais."',
  'Pergunte o que você quer mesmo saber. Interesse de verdade vence frase pronta.',
]

/** Orçamento de lazer sugerido, em minutos por semana. */
export const LAZER_SUGERIDO = [
  { nome: 'Jogos', orcamentoMin: 300 },
  { nome: 'Redes sociais', orcamentoMin: 420 },
  { nome: 'Séries e vídeos', orcamentoMin: 300 },
]
