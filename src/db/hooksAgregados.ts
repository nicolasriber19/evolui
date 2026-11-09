// Junta várias leituras do banco num objeto só, para as telas que olham "tudo" de uma vez
// (revisão da semana, painel de Evolução, XP). Enquanto qualquer parte carrega, devolve undefined.

import {
  useChecks,
  useEvidencias,
  useHabitos,
  useLeituras,
  useRegistrosLazer,
  useSessoes,
  useTentativas,
  useTiposLazer,
  useTodasSemanas,
  useTodosDias,
  useTreinos,
} from './hooks'
import type { DadosSemana } from '../lib/revisao'
import type { DadosXp } from '../lib/xp'

export type DadosCompletos = DadosSemana & DadosXp

export function useDadosCompletos(): DadosCompletos | undefined {
  const habitos = useHabitos()
  const checks = useChecks()
  const treinos = useTreinos()
  const sessoes = useSessoes()
  const leituras = useLeituras()
  const tentativas = useTentativas()
  const evidencias = useEvidencias()
  const dias = useTodosDias()
  const semanas = useTodasSemanas()
  const tiposLazer = useTiposLazer()
  const lazerRegistros = useRegistrosLazer()

  if (
    !habitos ||
    !checks ||
    !treinos ||
    !sessoes ||
    !leituras ||
    !tentativas ||
    !evidencias ||
    !dias ||
    !semanas ||
    !tiposLazer ||
    !lazerRegistros
  ) {
    return undefined
  }
  return { habitos, checks, treinos, sessoes, leituras, tentativas, evidencias, dias, semanas, tiposLazer, lazerRegistros }
}
