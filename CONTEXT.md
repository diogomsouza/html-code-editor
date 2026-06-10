# HTML Code Editor

Glossario do componente reutilizavel de edicao de HTML para Angular. Este contexto separa o contrato publico do pacote publicavel do uso original dentro do MyStocks.

## Language

**Editor de HTML**:
Componente Angular reutilizavel que permite editar, visualizar e formatar conteudo HTML.
_Avoid_: editor do MyStocks, campo de texto rico

**Pacote Publicavel**:
Biblioteca npm distribuida como `@stagyra/html-code-editor`.
_Avoid_: projeto demo, componente interno do MyStocks

**Seletor Publico**:
Seletor Angular `<stagyra-html-code-editor>` exposto pelo **Pacote Publicavel**.
_Avoid_: app-html-code-editor

**Componente Original**:
Implementacao existente em `X:\MyStocks\MyStocks.Web\Angular\src\app\shared\html-code-editor` usada como fonte da extracao inicial.
_Avoid_: pacote publicavel

**Projeto Demo**:
Aplicacao Angular no mesmo workspace usada para validar e demonstrar o **Editor de HTML**.
_Avoid_: biblioteca npm

**Demo de Validacao**:
Formato do **Projeto Demo** focado em Reactive Forms, inputs publicos e visualizacao do HTML emitido.
_Avoid_: landing page, aplicacao grande

**Repositorio Publico**:
Repositorio GitHub `diogomsouza/html-code-editor` que hospeda o codigo fonte e a demo publicada.
_Avoid_: repositorio do MyStocks, repositorio do AngularMagneticMenu

**Release Inicial**:
Primeira versao publicavel do **Pacote Publicavel**, identificada como `0.1.0` e licenciada como MIT.
_Avoid_: release estavel 1.0

**Entrega GitHub**:
Estado final em que o **Repositorio Publico** recebe o codigo na branch `main` e a **Demo de Validacao** na branch `gh-pages`.
_Avoid_: entrega apenas local

**Pacote Pronto para NPM**:
Estado final em que o **Pacote Publicavel** foi compilado, validado com dry run e empacotado para publicacao manual.
_Avoid_: npm publish automatico

**Icones Embutidos**:
Icones distribuídos dentro do **Pacote Publicavel** para a barra de ferramentas do **Editor de HTML**.
_Avoid_: dependencia obrigatoria de Angular Material Icons

**API Standalone**:
Forma principal de consumo em que o **Editor de HTML** e importado diretamente como componente standalone.
_Avoid_: modulo obrigatorio

**Modulo de Compatibilidade**:
NgModule exportado pelo **Pacote Publicavel** para projetos Angular que ainda organizam imports por modulo.
_Avoid_: API principal exclusiva

**Extracao Completa**:
Primeira versao do **Pacote Publicavel** que preserva as capacidades atuais do **Componente Original**.
_Avoid_: editor simplificado, subconjunto inicial

## Relationships

- O **Componente Original** fornece a base funcional inicial do **Editor de HTML**.
- O **Pacote Publicavel** expoe o **Editor de HTML** atraves do **Seletor Publico**.
- O **Projeto Demo** consome o **Pacote Publicavel** como exemplo de uso.
- A **Demo de Validacao** demonstra o contrato de formulario, `showSourceButton`, `sourceLineWrap` e o HTML resultante.
- O **Repositorio Publico** usa `main` para codigo fonte e `gh-pages` para o **Projeto Demo** publicado.
- A **Release Inicial** define a primeira versao npm do **Pacote Publicavel**.
- A **Entrega GitHub** publica o codigo e a demo, enquanto o **Pacote Pronto para NPM** deixa a publicacao npm como acao manual.
- O **Pacote Publicavel** contem os **Icones Embutidos** usados pelo **Editor de HTML**.
- A **API Standalone** e a forma principal de consumo do **Editor de HTML**.
- O **Modulo de Compatibilidade** existe para consumidores que nao usam imports standalone.
- A **Extracao Completa** preserva editor visual, preview, codigo fonte, formatacao, imagem, emoji e redimensionamento do **Componente Original**.

## Example dialogue

> **Dev:** "Posso usar `app-html-code-editor` na documentacao do npm?"
> **Domain expert:** "Nao. Esse e o seletor do MyStocks; o **Seletor Publico** do pacote sera `<stagyra-html-code-editor>`."

## Flagged ambiguities

- "html-code-editor" pode significar o componente original ou o novo pacote; resolvido: **Componente Original** e **Pacote Publicavel** sao conceitos distintos.
- "icones do Material" nao significa depender de Angular Material; resolvido: os icones equivalentes serao **Icones Embutidos** no pacote.
- "extrair o componente" nao significa criar uma versao reduzida; resolvido: a primeira entrega sera uma **Extracao Completa**.
