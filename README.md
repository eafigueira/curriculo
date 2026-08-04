# Currículo

Site: https://eafigueira.github.io/curriculo/

## Atualizar

Edite `data/database.json` e `data/site.json`, depois:

```bash
npm run build:site
git add data/ docs/
git commit -m "Atualiza curriculo"
git push
```

O `build:site` gera `docs/index.html` e o PDF em `docs/` (precisa do Chrome/Chromium instalado).
