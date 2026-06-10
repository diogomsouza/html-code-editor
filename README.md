# HTML Code Editor

Workspace for `@stagyra/html-code-editor`, an Angular 18+ reusable HTML editor component extracted from MyStocks.

Demo: https://diogomsouza.github.io/html-code-editor/

## Projects

- `projects/html-code-editor`: publishable library package.
- `projects/demo`: visual validation app.

## Commands

```bash
npm install
npm run build:lib
npm run build:demo
npm start
```

The package is prepared for manual npm publication, but this workspace does not run `npm publish` automatically.

## Package

Package name: `@stagyra/html-code-editor`

Initial version: `0.1.0`

License: MIT

Publish after building:

```bash
cd dist/html-code-editor
npm publish --access public
```

See [projects/html-code-editor/README.md](projects/html-code-editor/README.md) for API usage.
