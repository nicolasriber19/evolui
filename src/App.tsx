import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { useConfig } from './db/hooks'
import { Ajustes } from './features/ajustes/Ajustes'
import { temaSalvo, useTema } from './features/ajustes/tema'
import { Areas } from './features/areas/Areas'
import { Evolucao } from './features/evolucao/Evolucao'

// As telas das áreas só são baixadas quando você abre cada uma ("carregamento sob demanda").
// Assim a tela Hoje, que você abre todo dia, carrega mais rápido.
const Corpo = lazy(() => import('./features/corpo/Corpo').then((m) => ({ default: m.Corpo })))
const Estudo = lazy(() => import('./features/estudo/Estudo').then((m) => ({ default: m.Estudo })))
const Leitura = lazy(() => import('./features/leitura/Leitura').then((m) => ({ default: m.Leitura })))
const LivroDetalhe = lazy(() => import('./features/leitura/LivroDetalhe').then((m) => ({ default: m.LivroDetalhe })))
import { Hoje } from './features/hoje/Hoje'
import { Onboarding } from './features/onboarding/Onboarding'
import { AvisoAtualizacao } from './features/pwa/AvisoAtualizacao'

export default function App() {
  const config = useConfig()
  useTema(config?.tema ?? temaSalvo())

  // undefined = ainda lendo o banco (dura uma fração de segundo). O fundo já está pintado.
  if (config === undefined) return null

  // Primeiro uso: mostra o passo a passo. Quando ele termina, o banco muda e o app abre a tela Hoje sozinho.
  if (!config?.onboardingFeito) {
    return (
      <>
        <Onboarding />
        <AvisoAtualizacao />
      </>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout config={config} />}>
          <Route index element={<Hoje config={config} />} />
          <Route path="areas" element={<Areas config={config} />} />
          <Route path="areas/corpo" element={<Corpo config={config} />} />
          <Route path="areas/estudo" element={<Estudo config={config} />} />
          <Route path="areas/leitura" element={<Leitura config={config} />} />
          <Route path="areas/leitura/:id" element={<LivroDetalhe config={config} />} />
          <Route path="evolucao" element={<Evolucao config={config} />} />
          <Route path="ajustes" element={<Ajustes config={config} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AvisoAtualizacao />
    </BrowserRouter>
  )
}
