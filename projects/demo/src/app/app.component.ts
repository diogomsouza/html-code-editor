import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HtmlCodeEditorComponent } from '@stagyra/html-code-editor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, HtmlCodeEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly content = new FormControl<string>(this.sampleHtml, { nonNullable: true });

  showSourceButton = true;
  sourceLineWrap = true;

  get htmlValue(): string {
    return this.content.value;
  }

  loadSample(): void {
    this.content.setValue(this.sampleHtml);
  }

  clear(): void {
    this.content.setValue('');
  }

  private get sampleHtml(): string {
    return [
      '<h2>Release notes</h2>',
      '<p><strong>Html Code Editor</strong> keeps visual editing and source editing in one Angular form control.</p>',
      '<ul>',
      '  <li>Use toolbar actions to format text, links, spacing, borders and images.</li>',
      '  <li>Toggle source mode to inspect the generated HTML.</li>',
      '  <li>The value below updates through Reactive Forms.</li>',
      '</ul>',
    ].join('\n');
  }
}
