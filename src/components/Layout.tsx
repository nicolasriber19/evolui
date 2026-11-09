import { ChartLine, LayoutGrid, Settings, Sun } from 'lucide-react'
import { Suspense, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import type { Config } from '../db/tipos'
import { useMotorFoco } from '../features/estudo/motorFoco'
import { BarraAtividade } from './BarraAtividade'

const ABAS = [
  { para: '/', rotulo: 'Hoje', Icone: Sun },
  { para: '/areas', rotulo: 'Áreas', Icone: LayoutGrid },
  { para: '/evolucao', rotulo: 'Evolução', Icone: ChartLine },
  { para: '/ajustes', rotulo: 'Ajustes', Icone: Settings },
]

/** Moldura das telas principais: conteúdo no meio e a barra de abas embaixo. */
export function Layout({ config }: { config: Config }) {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0) // chaves de propósito: o efeito não pode devolver nada além de uma função
  }, [pathname])

  // O timer de foco continua contando em qualquer tela.
  useMotorFoco(config)

  return (
    <>
      <main className="mx-auto w-full max-w-md px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(9rem+env(safe-area-inset-bottom))]">
        {/* Suspense: enquanto uma tela "sob demanda" carrega, mostra o fundo vazio por um instante. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <BarraAtividade />
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-linha bg-fundo pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto flex max-w-md">
          {ABAS.map(({ para, rotulo, Icone }) => (
            <li key={para} className="flex-1">
              <NavLink
                to={para}
                end={para === '/'}
                className={({ isActive }) =>
                  `flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] transition-colors duration-150 ${
                    isActive ? 'font-medium text-destaque-texto' : 'text-tinta-suave hover:text-tinta'
                  }`
                }
              >
                <Icone className="size-5" aria-hidden="true" />
                {rotulo}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
