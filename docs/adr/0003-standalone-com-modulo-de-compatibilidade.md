# Standalone com modulo de compatibilidade

O componente publico sera exportado como standalone e o pacote tambem fornecera um NgModule de compatibilidade. Essa combinacao segue o padrao moderno do Angular 18 para novos consumidores sem bloquear projetos que ainda dependem de modulos.

## Considered Options

- Exportar apenas um NgModule.
- Exportar componente standalone e NgModule de compatibilidade.

## Consequences

Consumidores poderao importar `HtmlCodeEditorComponent` diretamente ou usar `HtmlCodeEditorModule` em aplicacoes baseadas em modulos.
