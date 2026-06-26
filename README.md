# Gerador de Currículo

Projeto para gerar e publicar o currículo do Emerson Figueira.

## Estrutura

- `data/database.json` — experiências, contatos e projetos
- `data/site.json` — resumo, título e formação acadêmica do site
- `tools/build-site.js` — gera o site estático em `docs/`
- `docs/` — saída publicada no GitHub Pages

## Atualizar o currículo

1. Edite `data/database.json` (e `data/site.json`, se quiser mudar resumo ou formação)
2. Gere o site:

```bash
npm run build:site
```

3. Confira localmente abrindo `docs/index.html` no navegador

## Publicar no GitHub Pages

### Opção automática (recomendada)

1. Faça push do repositório para o GitHub
2. Em **Settings → Pages**, em **Build and deployment**, escolha **GitHub Actions**
3. A cada push na branch `main` (ou `master`), o workflow `.github/workflows/pages.yml` publica o site

URL esperada:

- Repositório `eafigueira.github.io` → `https://eafigueira.github.io`
- Outro repositório (ex.: `gerador-curriculo`) → `https://eafigueira.github.io/gerador-curriculo`

### Opção manual

1. Rode `npm run build:site`
2. Em **Settings → Pages**, selecione a branch `main` e a pasta `/docs`
3. Faça commit da pasta `docs/` e push

## App Next.js (visualização local)

Para a versão interativa usada na geração de PDF:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).
