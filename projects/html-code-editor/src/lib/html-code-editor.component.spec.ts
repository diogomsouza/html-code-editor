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
});
