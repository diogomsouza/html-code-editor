import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HtmlCodeEditorComponent } from '@stagyra/html-code-editor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, HtmlCodeEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild(HtmlCodeEditorComponent) private editor?: HtmlCodeEditorComponent;

  readonly content = new FormControl<string>(this.sampleHtml, { nonNullable: true });

  showSourceButton = true;
  sourceLineWrap = true;

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.editor && !this.editor.showSource) {
        this.editor.toggleSource();
      }
    });
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
      '  <li>Review the generated markup in the source panel while editing.</li>',
      '  <li>Bind it with Reactive Forms and keep the package UI self-contained.</li>',
      '</ul>',
    ].join('\n');
  }
}
