import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { useConfig } from './db/hooks'
import { Ajustes } from './features/ajustes/Ajustes'
import { temaSalvo, useTema } from './features/ajustes/tema'
import { Areas } from './features/areas/Areas'
import { Evolucao } from './features/evolucao/Evolucao'
import { Hoje } from './features/hoje/Hoje'
import { Onboarding } from './features/onboarding/Onboarding'
import { AvisoAtualizacao } from './features/pwa/AvisoAtualizacao'

export default function App() {
  const config = useConfig()
  useTema(config?.tema ?? temaSalvo())

  // undefined = ainda lendo o banco (dura uma fração de segundo). O fundo já está pintado.
  if (config === undefined) return null

  const pronto = config?.onboardingFeito === true

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/boas-vindas" element={pronto ? <Navigate to="/" replace /> : <Onboarding />} />
        <Route element={pronto ? <Layout /> : <Navigate to="/boas-vindas" replace />}>
          {pronto && (
            <>
              <Route index element={<Hoje config={config} />} />
              <Route path="areas" element={<Areas config={config} />} />
              <Route path="evolucao" element={<Evolucao config={config} />} />
              <Route path="ajustes" element={<Ajustes config={config} />} />
            </>
          )}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AvisoAtualizacao />
    </BrowserRouter>
  )
}
