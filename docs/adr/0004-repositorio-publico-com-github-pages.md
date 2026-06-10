# Repositorio publico com GitHub Pages

O codigo fonte sera publicado em `diogomsouza/html-code-editor`, com a branch `main` para o workspace Angular e `gh-pages` para a demo estatica. Isso segue o padrao ja usado no AngularMagneticMenu e deixa a demo publica vinculada ao mesmo repositorio do pacote.

## Considered Options

- Criar um repositorio GitHub novo com `main` e `gh-pages`.
- Manter apenas o projeto local sem remoto publicado.

## Consequences

A demo devera ser compilada com base href `/html-code-editor/` antes de publicar em GitHub Pages.
