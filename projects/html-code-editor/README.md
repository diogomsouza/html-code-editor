# @stagyra/html-code-editor

Reusable Angular 18+ HTML editor component with visual editing, source editing and Reactive Forms support.

## Install

```bash
npm install @stagyra/html-code-editor
```

## Standalone Usage

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HtmlCodeEditorComponent } from '@stagyra/html-code-editor';

@Component({
  selector: 'app-editor-page',
  standalone: true,
  imports: [ReactiveFormsModule, HtmlCodeEditorComponent],
  template: `
    <stagyra-html-code-editor
      [formControl]="content"
      [showSourceButton]="true"
      [sourceLineWrap]="true"
    ></stagyra-html-code-editor>
  `,
})
export class EditorPageComponent {
  content = new FormControl('<p>Hello</p>', { nonNullable: true });
}
```

## NgModule Usage

```ts
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HtmlCodeEditorModule } from '@stagyra/html-code-editor';

@NgModule({
  imports: [ReactiveFormsModule, HtmlCodeEditorModule],
})
export class FeatureModule {}
```

## Inputs

- `showSourceButton`: shows or hides the source-code toggle. Defaults to `true`.
- `sourceLineWrap`: wraps lines in source mode. Defaults to `true`.

## Package Notes

The toolbar icons are embedded in the package. Consumers do not need Angular Material, Material Icons fonts or any icon setup.
