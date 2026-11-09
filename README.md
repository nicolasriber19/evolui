# Evolui

App pessoal de crescimento, feito para o celular: o que importa hoje em menos de 2 minutos,
hábitos com versão mínima e a regra "nunca falhar duas vezes", e uma revisão de domingo que mostra a semana.

**No ar:** https://evolui-gilt.vercel.app (instala como app e funciona sem internet)

## O que tem

- **Hoje:** frase de identidade com régua de votos (cada hábito marcado é um voto), check-in de energia e humor,
  hábitos com versão mínima, 3 prioridades, metas da semana e 3 vitórias à noite.
- **Áreas:** Corpo (treinos A/B/C, carga, peso e sono), Estudo (timer de foco por matéria), Leitura (livros, páginas,
  trechos), Comunicação (desafio semanal sorteado), Mente (diário, banco de evidências, promessas cumpridas) e Lazer
  (orçamento semanal, sem culpa).
- **Sua semana:** revisão de domingo contada com rolagem, com perguntas guiadas e as metas da semana seguinte.
- **Evolução:** XP e níveis por área, gráficos, calendário dos hábitos e revisões anteriores.
- **Ajustes:** hábitos, áreas, tema escuro ou claro, lembretes pela agenda do celular e backup em JSON.

## Tecnologia

React 19, Vite 8, TypeScript 7, Tailwind CSS 4, Dexie (IndexedDB, os dados ficam no aparelho), React Router 8,
Recharts, vite-plugin-pwa e Vitest. Sem servidor e sem login.

## Rodar no computador

```bash
npm install
npm run dev
```

Testes: `npm test`. Publicar uma versão nova: veja [PUBLICAR.md](PUBLICAR.md).
Decisões do projeto e estrutura das pastas: [CLAUDE.md](CLAUDE.md).
