// Modelos de treino sugeridos para quem quer ganhar massa e treina de segunda a sexta.
// A rotação A, B, C, A, B... faz cada grupo muscular treinar quase 2 vezes por semana.
// São um ponto de partida: vale ajustar com o professor da academia.

export interface ExercicioSugerido {
  nome: string
  series: number
  repeticoes: string
}

export interface ModeloSugerido {
  nome: string
  titulo: string
  itens: ExercicioSugerido[]
}

const ex = (nome: string, series: number, repeticoes: string): ExercicioSugerido => ({ nome, series, repeticoes })

export const MODELOS_SUGERIDOS: ModeloSugerido[] = [
  {
    nome: 'A',
    titulo: 'Peito, ombro e tríceps',
    itens: [
      ex('Supino reto com barra', 4, '8-10'),
      ex('Supino inclinado com halteres', 3, '10'),
      ex('Desenvolvimento com halteres', 3, '10'),
      ex('Elevação lateral', 3, '12'),
      ex('Tríceps na polia', 3, '12'),
      ex('Tríceps francês', 3, '10'),
    ],
  },
  {
    nome: 'B',
    titulo: 'Costas e bíceps',
    itens: [
      ex('Puxada frontal', 4, '10'),
      ex('Remada curvada', 4, '8-10'),
      ex('Remada baixa', 3, '10'),
      ex('Crucifixo inverso', 3, '12'),
      ex('Rosca direta', 3, '10'),
      ex('Rosca martelo', 3, '12'),
    ],
  },
  {
    nome: 'C',
    titulo: 'Pernas e abdômen',
    itens: [
      ex('Agachamento livre', 4, '8-10'),
      ex('Leg press', 4, '10'),
      ex('Cadeira extensora', 3, '12'),
      ex('Mesa flexora', 3, '12'),
      ex('Panturrilha em pé', 4, '15'),
      ex('Abdominal', 3, '15'),
    ],
  },
]

export const MATERIAS_DA_FACULDADE = ['Python', 'HTML', 'CSS']
