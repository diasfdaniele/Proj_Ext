# Proj_Ext

## Firebase Hosting (importante)

- Este projeto publica a **raiz** do repositório no Firebase Hosting.
- Configuracao atual em `firebase.json`: `"hosting.public": "."`

### Arquivos oficiais de entrada

- Home oficial: `index.html` (na raiz)
- Erro 404 oficial: `404.html` (na raiz)

### Regra para evitar confusao

- Edite sempre os arquivos da raiz para paginas principais.
- Nao mantenha duplicados em `public/index.html` ou `public/404.html`.

### Deploy

```bash
firebase deploy
```
