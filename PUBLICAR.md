# Como publicar uma versão nova do Evolui

O Evolui mora em **https://evolui-gilt.vercel.app**. Publicar é mandar a versão nova do código para lá.
O celular percebe sozinho e mostra o aviso **"Tem uma versão nova do Evolui"**.

## O jeito mais simples: git push

O repositório https://github.com/nicolasriber19/evolui está ligado à Vercel. Então publicar é só:

```bash
git add -A
git commit -m "o que mudou"
git push
```

A Vercel percebe o push, roda os testes (`npm test`) e o build nos servidores dela e, se tudo passar, coloca
o site novo no ar em um ou dois minutos. Se algum teste falhar, o site no ar continua o antigo: nada quebra.
Para acompanhar: vercel.com > projeto evolui > Deployments.

## O jeito pelo terminal (um comando)

Abra o terminal na pasta `evolui` e rode:

```bash
npm run publicar
```

Esse comando faz três coisas, nesta ordem, e para no primeiro erro:

1. `npm test`: roda todos os testes. Se algum falhar, nada é publicado. É a sua rede de segurança.
2. `npm run build`: confere os tipos (TypeScript) e gera o site final na pasta `dist/`.
3. `npx vercel --prod`: manda o código para a Vercel, que monta o site nos servidores dela e coloca no ar.

No fim aparece algo como `Production URL: https://evolui-gilt.vercel.app`. Pronto: está no ar.

## Depois de publicar

1. Abra https://evolui-gilt.vercel.app no PC e confira se a mudança está lá.
2. No celular, abra o app. Em alguns segundos aparece **"Tem uma versão nova do Evolui"**: toque em **Atualizar**.
3. Se publicou pelo terminal, faça também o commit e o push, para o GitHub ficar igual ao site.

## Se der errado

- **Um teste falhou:** leia a mensagem. Ela diz qual teste, o que era esperado (`Expected`) e o que veio (`Received`).
  Conserte e rode de novo. Nada foi publicado.
- **Erro de tipo no build:** a mensagem mostra o arquivo e a linha (ex.: `src/lib/formatar.ts(38,3)`). Abra e conserte.
- **"Logged out" ou pedido de login:** rode `npx vercel login`. Ele mostra um link com um código: abra no Chrome,
  entre na conta e aprove. (O login do Google não funciona no navegador embutido do Claude.)
- **Publicou e quebrou algo:** volte para a versão anterior com `npx vercel rollback`, ou no site da Vercel
  (vercel.com > projeto evolui > Deployments > a versão boa > "Promote to Production").

## Regras importantes

- **Nunca troque o endereço** (`evolui-gilt.vercel.app`). Seus dados ficam guardados no celular presos a ele.
- **Faça backup antes de mudanças grandes** no banco de dados (Ajustes > Backup > Baixar).
- Mudou o formato de uma tabela? Crie uma versão nova em `src/db/db.ts` (veja como as versões 2 e 3 foram feitas)
  e escreva um teste que prova que os dados antigos sobem sem se perder (veja `src/db/fase3.test.ts`).
