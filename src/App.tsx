import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { useConfig } from './db/hooks'
import { Ajustes } from './features/ajustes/Ajustes'
import { temaSalvo, useTema } from './features/ajustes/tema'
import { Areas } from './features/areas/Areas'
import { Hoje } from './features/hoje/Hoje'
import { Onboarding } from './features/onboarding/Onboarding'
import { AvisoAtualizacao } from './features/pwa/AvisoAtualizacao'

// As telas das áreas só são baixadas quando você abre cada uma ("carregamento sob demanda").
// Assim a tela Hoje, que você abre todo dia, carrega mais rápido.
const Corpo = lazy(() => import('./features/corpo/Corpo').then((m) => ({ default: m.Corpo })))
const Estudo = lazy(() => import('./features/estudo/Estudo').then((m) => ({ default: m.Estudo })))
const Leitura = lazy(() => import('./features/leitura/Leitura').then((m) => ({ default: m.Leitura })))
const Comunicacao = lazy(() => import('./features/comunicacao/Comunicacao').then((m) => ({ default: m.Comunicacao })))
const Mente = lazy(() => import('./features/mente/Mente').then((m) => ({ default: m.Mente })))
const Lazer = lazy(() => import('./features/lazer/Lazer').then((m) => ({ default: m.Lazer })))
const Revisao = lazy(() => import('./features/revisao/Revisao').then((m) => ({ default: m.Revisao })))
const Evolucao = lazy(() => import('./features/evolucao/Evolucao').then((m) => ({ default: m.Evolucao })))
const LivroDetalhe = lazy(() => import('./features/leitura/LivroDetalhe').then((m) => ({ default: m.LivroDetalhe })))

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
          <Route path="areas/comunicacao" element={<Comunicacao config={config} />} />
          <Route path="areas/mente" element={<Mente config={config} />} />
          <Route path="areas/lazer" element={<Lazer config={config} />} />
          <Route path="evolucao" element={<Evolucao config={config} />} />
          <Route path="ajustes" element={<Ajustes config={config} />} />
        </Route>
        {/* A revisão ocupa a tela toda, sem a barra de abas. */}
        <Route
          path="revisao/:semana?"
          element={
            <Suspense fallback={null}>
              <Revisao config={config} />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AvisoAtualizacao />
    </BrowserRouter>
  )
}
