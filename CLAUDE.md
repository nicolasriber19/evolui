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
No app desktop do Claude, os servidores estão no `.claude/launch.json` da pasta mãe: `evolui-dev` (porta 5180)
e `evolui-preview` (porta 4180, build final com PWA).

Armadilhas já encontradas:
- Efeitos do React nunca podem devolver nada além de função: `useEffect(() => window.scrollTo(0, 0))` quebra,
  porque no Chrome novo `scrollTo` devolve uma Promise. Use chaves: `useEffect(() => { window.scrollTo(0, 0) })`.
- O primeiro uso é decidido no App (`config.onboardingFeito`), sem rota nem `<Navigate>`.
- Testes que leem uma tabela inteira devem ordenar por um índice (`orderBy('dia')`): a ordem pelo id (UUID) é aleatória.
- Timer: calcule o tempo com `Date.now()` na hora de desenhar; `useAgora` serve só para redesenhar a cada segundo.
- Verificação visual: o painel do navegador embutido dá prints velhos quando está escondido; use Chrome sem janela
  (playwright-core apontando para o Chrome instalado), com `page.clock` para simular dia e hora.

## Stack

React 19 + Vite 8 + TypeScript 7 + Tailwind CSS 4 + Dexie 4 (IndexedDB) + React Router 8 + date-fns 4
+ lucide-react (ícones) + vite-plugin-pwa (app instalável/offline) + Vitest (testes) + fake-indexeddb (testes do banco).
Fontes guardadas no app via Fontsource: Archivo (títulos/números) e Geist (texto).
Recharts 3 só no gráfico de linha (`components/GraficoLinha.tsx`, carregado com React.lazy). Barras e colunas
simples são HTML/CSS (`components/Graficos.tsx`). Cor de série validada com a skill dataviz: `--grafico`
(#F0B44C no escuro, #B7791F no claro). As telas Corpo, Estudo e Leitura também são carregadas sob demanda.
Gerenciador de pacotes: **npm** (não pnpm). Sem backend e sem login.

## Estrutura

```
src/
  main.tsx, App.tsx       entrada, rotas e barra de abas
  styles/index.css        Tailwind + tokens de cor dos temas (data-tema="escuro" | "claro" no <html>)
  db/                     tipos.ts (formato das tabelas), db.ts (Dexie, versões 1 e 2), acoes.ts (gravações da Fase 1),
                          acoesCorpo.ts, acoesEstudo.ts, acoesLeitura.ts (gravações da Fase 2), acoesFase3.ts,
                          hooks.ts (leituras reativas com useLiveQuery), backup.ts (exportar/importar JSON)
  lib/                    lógica pura e testável: datas.ts (dia lógico), corrente.ts (regra), id.ts, areas.ts,
                          foco.ts (timer), treino.ts (rotação, última vez, evolução), leitura.ts, formatar.ts,
                          fase3.ts (sorteio do desafio, orçamento de lazer, promessas cumpridas)
  data/sugestoes.ts       frases, hábitos e metas prontos do onboarding
  data/treinos.ts         modelos A/B/C sugeridos (ganhar massa, seg a sex) e matérias da faculdade
  data/comunicacao.ts     desafios, dicas de conversa e orçamento de lazer sugeridos
  components/             peças reutilizáveis (Botao, Cartao, Escala, ListaCurta, Folha, DiasSemana...)
  features/<parte>/       uma pasta por parte do app (onboarding, hoje, areas, corpo, estudo, leitura,
                          comunicacao, mente, lazer, evolucao, ajustes, pwa)
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
- **Publicado na Vercel**: https://evolui-gilt.vercel.app (conta `nicolasriber-3803`, projeto `evolui`).
  NÃO trocar esse endereço: os dados do celular ficam presos a ele (IndexedDB é por origem).
  Publicar uma versão nova: `npm test && npm run build` e depois `npx vercel --prod` dentro de `evolui/`.
  A pasta `.vercel/` (ligação com o projeto) fica fora do git. `vercel.json` faz todas as rotas caírem no index.html.
  Se o login expirar: `npx vercel login` mostra um link com código; abrir no Chrome do Nicolas (`start chrome <link>`),
  porque o login do Google não funciona no navegador embutido.
- **Timer de foco** guarda o horário de fim (`estado.fimEm`) no banco; o "motor" (`features/estudo/motorFoco.ts`, no Layout)
  confere a cada segundo e ao voltar ao app; `avancarFase` grava a sessão numa transação (uma vez só).
  Notificação só com o app em segundo plano (via service worker); com o app aberto, bipe + vibração.
- **Treino**: série só existe quando marcada como feita (id fixo `treino:exercício:ordem`), então fechar o app não perde nada.
  A carga sugerida vem da última vez que o exercício foi feito. Modelos sugeridos só são criados se você tocar no botão.
- **SugestaoDeVoto**: depois de registrar treino, foco, leitura ou tentativa de conversa, oferece marcar o hábito pendente da área.
- **Comunicação**: o desafio sorteado fica em `semanas.desafio` (cópia do texto); sorteio evita as últimas 4 semanas;
  depois da primeira tentativa não dá mais para sortear outro. Tentativas guardam como foi (1 a 5), relato e aprendizado.
- **Mente**: gratidão e "fiz bem" ficam no registro do dia (`dias`), junto das vitórias. Promessas cumpridas são
  calculadas (votos + prioridades feitas + metas feitas + tentativas). Num dia com energia ou humor 1 ou 2,
  a tela Hoje mostra uma evidência (a mesma o dia todo).
- **Lazer**: orçamento semanal em minutos por tipo; cada registro diz se foi escolha ou piloto automático.
  Passar do orçamento não pinta nada de vermelho: só diz quanto passou e que segunda recomeça.
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

1. **MVP** (feito e publicado em 08/11/2026): onboarding, Hoje (voto que voa), hábitos + regra,
   Ajustes (hábitos, áreas, tema, horários, backup), Áreas e Evolução simples, PWA offline.
   Verificado com build, Vitest e um Chrome automático (Playwright) passando por onboarding, Hoje, Ajustes,
   backup/restaurar, tema claro e modo offline.
2. **Corpo, Estudo, Leitura** (feito e publicado em 09/11/2026): treino com modelos A/B/C, histórico, gráfico de carga,
   peso e sono; timer de foco com matérias e horas da semana; livros, páginas por dia, notas e trechos.
   Banco na versão 2 (testado que a versão 1 sobe sem perder dados).
3. **Comunicação, Mente, Lazer** (feito e publicado em 09/11/2026): desafio sorteado, tentativas, dicas; diário curto,
   evidências, promessas cumpridas; orçamento de lazer. Banco na versão 3 (testado que a 2 sobe sem perder dados).
4. Revisão semanal, painel de Evolução (Recharts), heatmap, XP e níveis.
5. Polimento, lembretes via arquivo .ics para a agenda, revisão de acessibilidade.

## Como trabalhar com o Nicolas

- Explicar decisões em português simples. No fim de cada fase: o que foi feito, como testar no PC e no celular,
  e 1 ou 2 conceitos de programação explicados de forma simples.
- Modo de aprendizado: Claude escreve quase tudo e deixa 1 ou 2 tarefas pequenas por fase para ele (com dicas), depois revisa.
  Tarefas da Fase 1: personalizar `src/data/sugestoes.ts`; escrever o teste `it.todo` em `src/lib/corrente.test.ts`.
  Tarefa da Fase 2: implementar `formatarMinutos` em `src/lib/formatar.ts` e os testes `it.todo` de `formatar.test.ts`.
  Tarefa da Fase 3: reescrever desafios e dicas em `src/data/comunicacao.ts` com situações da vida dele.
- Um commit por etapa, mensagens claras em português.
