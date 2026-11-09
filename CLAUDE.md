# Evolui

App pessoal de crescimento do Nicolas (estudante de Ciência da Computação, iniciante em programação).
Só ele usa, principalmente no celular (Android + Chrome), todos os dias. Tudo em português do Brasil.

## Como rodar

```bash
npm install          # instala as dependências (só na primeira vez)
npm run dev          # abre em http://localhost:5173 (para ver no celular pelo Wi-Fi: npm run dev -- --host)
npm test             # roda os testes da lógica (Vitest)
npm run build        # confere os tipos (tsc) e gera o site final em dist/
npm run preview      # serve o dist/ em http://localhost:4173 (é onde o modo offline/PWA funciona)
npm run icones       # gera os ícones PNG a partir de public/logo.svg
```

Sempre rode `npm test` e `npm run build` sem erros antes de dar uma fase por terminada.

## Stack

React 19 + Vite 8 + TypeScript 7 + Tailwind CSS 4 + Dexie 4 (IndexedDB) + React Router 8 + date-fns 4
+ lucide-react (ícones) + vite-plugin-pwa (app instalável/offline) + Vitest (testes) + fake-indexeddb (testes do banco).
Fontes guardadas no app via Fontsource: Archivo (títulos/números) e Geist (texto). Recharts entra só na Fase 4.
Gerenciador de pacotes: **npm** (não pnpm). Sem backend e sem login.

## Estrutura

```
src/
  main.tsx, App.tsx       entrada, rotas e barra de abas
  styles/index.css        Tailwind + tokens de cor dos temas (data-tema="escuro" | "claro" no <html>)
  db/                     tipos.ts (formato das tabelas), db.ts (Dexie), acoes.ts (gravações),
                          hooks.ts (leituras reativas com useLiveQuery), backup.ts (exportar/importar JSON)
  lib/                    lógica pura e testável: datas.ts (dia lógico), corrente.ts (regra), id.ts, areas.ts
  data/sugestoes.ts       frases, hábitos e metas prontos do onboarding
  components/             peças reutilizáveis (Botao, Cartao, Escala, ListaCurta, Folha, DiasSemana...)
  features/<parte>/       uma pasta por parte do app (onboarding, hoje, areas, evolucao, ajustes, pwa)
```

## Decisões do projeto (não mudar sem conversar)

- **Dia lógico**: o dia vira às 4h (configurável). Datas são guardadas como texto `AAAA-MM-DD` já ajustado
  (`lib/datas.ts > diaLogico`). Semanas vão de segunda a domingo, id ISO `AAAA-Www`.
- **Regra "nunca falhar duas vezes"** (`lib/corrente.ts`): só contam os dias marcados do hábito, fora de pausas
  e a partir do `inicio`. Completo ou mínimo = cumprido. 1 falta = "elo aberto" (corrente continua),
  2 faltas seguidas = corrente recomeça, recorde e consistência de 4 semanas nunca zeram. Hoje só vira falta quando o dia acaba.
- **Votos**: cada check (completo ou mínimo) é um voto na frase de identidade da área do hábito.
  Jogada assinatura: o ponto dourado voa do botão até a régua de votos (respeita "reduzir movimento").
- **Pronto para sincronizar no futuro**: todo registro tem `id` (UUID), `criadoEm`, `atualizadoEm`;
  apagar = preencher `apagadoEm` (nunca apagar de verdade). Leituras filtram com `vivos()`.
  Check tem id determinístico `habitoId:dia`.
- **Dados derivados não são guardados**: XP, corrente, votos e promessas cumpridas são calculados dos registros.
- **Backup** JSON com todas as tabelas + `versaoBanco`. Restaurar substitui tudo (com confirmação).
  O app lembra de fazer backup após 7 dias. Pede `navigator.storage.persist()` para o navegador não apagar os dados.
- **Foco**: no máximo 3 prioridades por dia, 3 metas por semana; sugere 1 ou 2 hábitos por área (aviso leve, sem bloquear).
- **Convive com o "Placar da Vida"** (outro app do Nicolas, para casa/emprego/concursos). Sem importação.
- Publicação planejada na **Vercel** já no fim da Fase 1 (PWA só instala via https e os dados ficam presos ao endereço).
  `vercel.json` já faz todas as rotas caírem no index.html.
- Compatível com Capacitor no futuro (não criar APK agora).

## Design (adaptado da skill scroll-desing)

- Tema escuro azul-noite (padrão) e claro. Tokens em `styles/index.css`: `fundo`, `cartao`, `cartao-2`, `tinta`,
  `tinta-suave`, `destaque` (âmbar #F0B44C), `destaque-tinta`, `destaque-texto`, `linha`, `area-<id>`.
  Use as classes do Tailwind com esses nomes (`bg-cartao`, `text-tinta-suave`...), nunca cores soltas.
- Uma cor de destaque só. Cores de área apenas em bolinhas/ícones/gráficos.
- Cantos: cartões `rounded-2xl`, controles `rounded-xl`. Alvo de toque mínimo 44px (`min-h-11`).
- Movimento: só `transform`/`opacity`, 120 a 260ms, `ease-saida`. Botões afundam (`active:scale-[0.97]`).
  Sempre respeitar `prefers-reduced-motion`.
- Proibido: gradiente em texto, brilho neon, emoji como ícone, travessão (—) em texto do app,
  números inventados (sem dado = estado vazio convidativo).
- Pico emocional planejado: revisão de domingo "Sua semana" (Fase 4), única parte com narrativa de rolagem.

## Fases

1. **MVP** (em andamento): onboarding, Hoje, hábitos + regra, backup, PWA, publicação.
2. Corpo (treinos ABC, carga, peso/sono), Estudo (Pomodoro, matérias Python/HTML/CSS), Leitura.
3. Comunicação (desafio semanal, dicas), Mente (diário, banco de evidências), Lazer (orçamento).
4. Revisão semanal, painel de Evolução (Recharts), heatmap, XP e níveis.
5. Polimento, lembretes via arquivo .ics para a agenda, revisão de acessibilidade.

## Como trabalhar com o Nicolas

- Explicar decisões em português simples. No fim de cada fase: o que foi feito, como testar no PC e no celular,
  e 1 ou 2 conceitos de programação explicados de forma simples.
- Modo de aprendizado: Claude escreve quase tudo e deixa 1 ou 2 tarefas pequenas por fase para ele (com dicas), depois revisa.
  Tarefas da Fase 1: personalizar `src/data/sugestoes.ts`; escrever o teste `it.todo` em `src/lib/corrente.test.ts`.
- Um commit por etapa, mensagens claras em português.
