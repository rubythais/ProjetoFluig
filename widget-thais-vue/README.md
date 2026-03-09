# Widget Thais - Changelog Vue

Projeto Vue 3 + Vite para o widget de Changelog do Fluig.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build para produção

```bash
npm run build
```

Os arquivos serão gerados em: `../wcm/widget/Widget_thais/src/main/webapp/resources/js/app-vue/`

## Estrutura

- `src/App.vue` - Componente principal com filtros e listagem
- `src/components/changelogItem.vue` - Item individual de changelog
- `src/services/changelogService.js` - Serviço de busca de dados do dataset
