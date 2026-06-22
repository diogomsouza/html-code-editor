import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlCodeEditorComponent } from './html-code-editor.component';

describe('HtmlCodeEditorComponent', () => {
  let component: HtmlCodeEditorComponent;
  let fixture: ComponentFixture<HtmlCodeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HtmlCodeEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HtmlCodeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prefill the link URL with the selected text', () => {
    const selectedText = 'https://example.com';
    const container = document.createElement('div');
    const textNode = document.createTextNode(selectedText);
    container.appendChild(textNode);
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(textNode);

    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    spyOn<any>(component, 'getPreviewDocument').and.returnValue(document);

    component.toggleLinkPicker(new MouseEvent('click'));

    expect(component.linkUrl).toBe(selectedText);
    expect(component.linkPickerOpen).toBeTrue();

    selection?.removeAllRanges();
    container.remove();
  });
});
