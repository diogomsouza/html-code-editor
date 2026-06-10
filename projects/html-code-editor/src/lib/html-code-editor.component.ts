import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, forwardRef, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';
import { HtmlCodeEditorIconComponent } from './html-code-editor-icon.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type PopoverName = 'blockFormat' | 'textColor' | 'backgroundColor' | 'spacing' | 'border' | 'link' | 'emoji' | 'alignment';
type PopoverStateKey =
  | 'blockFormatPickerOpen'
  | 'colorPickerOpen'
  | 'backgroundStylePickerOpen'
  | 'spacingStylePickerOpen'
  | 'borderStylePickerOpen'
  | 'linkPickerOpen'
  | 'emojiPickerOpen'
  | 'alignmentPickerOpen';
type RgbColor = { r: number; g: number; b: number };

@Component({
  selector: 'stagyra-html-code-editor',
  standalone: true,
  imports: [CommonModule, HtmlCodeEditorIconComponent],
  templateUrl: './html-code-editor.component.html',
  styleUrls: ['./html-code-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HtmlCodeEditorComponent),
      multi: true,
    },
  ],
})
export class HtmlCodeEditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editorWrapper') editorWrapper: ElementRef<HTMLDivElement>;
  @ViewChild('codeTextarea') codeTextarea: ElementRef<HTMLTextAreaElement>;
  @ViewChild('previewFrame') previewFrame: ElementRef<HTMLIFrameElement>;

  @Input()
  set showSourceButton(value: boolean | string) {
    this._showSourceButton = value !== false && value !== 'false';

    if (!this._showSourceButton) {
      this.showSource = false;
    }
  }

  get showSourceButton(): boolean {
    return this._showSourceButton;
  }

  @Input()
  set sourceLineWrap(value: boolean | string) {
    this._sourceLineWrap = value !== false && value !== 'false';
  }

  get sourceLineWrap(): boolean {
    return this._sourceLineWrap;
  }

  blockFormats = [
    { label: 'Heading 1', value: 'h1', className: 'block-format-heading-1' },
    { label: 'Heading 2', value: 'h2', className: 'block-format-heading-2' },
    { label: 'Heading 3', value: 'h3', className: 'block-format-heading-3' },
    { label: 'Heading 4', value: 'h4', className: 'block-format-heading-4' },
    { label: 'Heading 5', value: 'h5', className: 'block-format-heading-5' },
    { label: 'Heading 6', value: 'h6', className: 'block-format-heading-6' },
    { label: 'Parágrafo', value: 'p', className: 'block-format-paragraph' },
    { label: 'Normal', value: 'normal', className: 'block-format-normal' },
  ];
  fonts: string[] = ['Roboto', 'Arial', 'Verdana', 'Tahoma', 'Georgia', 'Times New Roman', 'Courier New'];
  fontSizes = [
    { label: '10', value: '2' },
    { label: '12', value: '3' },
    { label: '16', value: '4' },
    { label: '20', value: '5' },
    { label: '28', value: '6' },
  ];
  editorWidth: number = 40;
  resizing: boolean = false;
  disabled: boolean = false;
  expanded: boolean = false;
  showSource: boolean = false;
  selectedTextColor: string = '#000000';
  draftTextColor: string = '#000000';
  textColorHexInput: string = '#000000';
  textColorFormat: 'hex' | 'rgb' = 'hex';
  colorPickerOpen: boolean = false;
  backgroundStylePickerOpen: boolean = false;
  spacingStylePickerOpen: boolean = false;
  borderStylePickerOpen: boolean = false;
  linkPickerOpen: boolean = false;
  emojiPickerOpen: boolean = false;
  linkUrl: string = '';
  selectedBackgroundColor: string = '#2e7d32';
  draftBackgroundColor: string = '#2e7d32';
  backgroundColorHexInput: string = '#2e7d32';
  backgroundColorFormat: 'hex' | 'rgb' = 'hex';
  selectedBorderColor: string = '#aaaaaa';
  draftBorderColor: string = '#aaaaaa';
  borderColorHexInput: string = '#aaaaaa';
  borderColorFormat: 'hex' | 'rgb' = 'hex';
  borderWidth: number = 1;
  backgroundPadding: number = 14;
  backgroundBorderRadius: number = 5;
  textMargin: number = 0;
  spacingPreviewTextColor: string = '#17213a';
  spacingPreviewBackgroundColor: string = 'transparent';
  colorHue: number = 0;
  colorSaturation: number = 0;
  colorValue: number = 0;
  backgroundHue: number = 128;
  backgroundSaturation: number = 63;
  backgroundValue: number = 49;
  borderHue: number = 0;
  borderSaturation: number = 0;
  borderValue: number = 0;
  selectedBlockFormat: string = 'normal';
  blockFormatPickerOpen: boolean = false;
  alignmentPickerOpen: boolean = false;
  selectedAlignmentIcon: string = 'format_align_left';
  textColorRgb = {
    r: 0,
    g: 0,
    b: 0,
  };
  backgroundColorRgb = {
    r: 46,
    g: 125,
    b: 50,
  };
  borderColorRgb = {
    r: 170,
    g: 170,
    b: 170,
  };
  emojis: string[] = ['🚨', '🔥', '🚀', '⏰', '🔔', '💰', '⌛', '🎉', '💥', '⚡️', '☄️', '❄️', '🏆', '🎁', '🎯', '💾', '⛔', '⚠️', '☣️', '👈', '👉', '👆', '👇'];

  private colorAreaDragElement: HTMLElement;
  private hueDragElement: HTMLElement;
  private backgroundAreaDragElement: HTMLElement;
  private backgroundHueDragElement: HTMLElement;
  private borderAreaDragElement: HTMLElement;
  private borderHueDragElement: HTMLElement;
  value: string = '';
  codeScrollTop: number = 0;
  codeScrollLeft: number = 0;
  private previewDocumentMode: 'fragment' | 'document' = 'fragment';
  private activePreviewDocument: Document;
  private savedPreviewRange: Range;
  private selectedImage: HTMLImageElement;
  private imageResizeOverlay: HTMLElement;
  private _showSourceButton: boolean = true;
  private _sourceLineWrap: boolean = true;
  private imageResizeState: {
    image: HTMLImageElement;
    startX: number;
    startWidth: number;
  };
  private readonly blockTags = new Set([
    'address',
    'article',
    'aside',
    'blockquote',
    'body',
    'div',
    'dl',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'html',
    'li',
    'main',
    'nav',
    'ol',
    'p',
    'section',
    'style',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'ul',
  ]);
  private readonly voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  private readonly formatBlockTags = new Set(['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']);
  private readonly inlineFormattingTags = new Set(['b', 'code', 'em', 'font', 'i', 'mark', 's', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'u']);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private previewInputListener = () => this.syncFromPreview();
  private previewSelectionListener = () => this.handlePreviewSelectionChange();
  private previewTouchedListener = () => this.touch();
  private previewPasteListener = (event: ClipboardEvent) => this.handlePreviewPaste(event);
  private previewDropListener = (event: DragEvent) => this.handlePreviewDrop(event);
  private previewDragOverListener = (event: DragEvent) => this.handlePreviewDragOver(event);
  private previewKeyDownListener = (event: KeyboardEvent) => this.handlePreviewKeyDown(event);
  private previewPointerDownListener = () => this.closePopovers();
  private previewScrollListener = () => this.positionImageResizeOverlay();
  private imageResizeMoveListener = (event: PointerEvent) => this.resizeSelectedImage(event);
  private imageResizeEndListener = () => this.endImageResize();
  private readonly popoverStateKeys: PopoverStateKey[] = [
    'blockFormatPickerOpen',
    'colorPickerOpen',
    'alignmentPickerOpen',
    'backgroundStylePickerOpen',
    'spacingStylePickerOpen',
    'borderStylePickerOpen',
    'linkPickerOpen',
    'emojiPickerOpen',
  ];
  private readonly popoverStateKeyByName: Record<PopoverName, PopoverStateKey> = {
    blockFormat: 'blockFormatPickerOpen',
    textColor: 'colorPickerOpen',
    backgroundColor: 'backgroundStylePickerOpen',
    spacing: 'spacingStylePickerOpen',
    border: 'borderStylePickerOpen',
    link: 'linkPickerOpen',
    emoji: 'emojiPickerOpen',
    alignment: 'alignmentPickerOpen',
  };
  private previewClickListener = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const image = target && target.tagName.toLowerCase() === 'img' ? (target as HTMLImageElement) : null;

    if (target?.closest('[data-html-editor-ui]')) {
      return;
    }

    if (image) {
      this.selectPreviewImage(image);
      return;
    }

    this.clearSelectedImage();

    if (target && target.closest('a')) {
      event.preventDefault();
    }
  };

  ngAfterViewInit(): void {
    this.updatePreview();
  }

  ngOnDestroy(): void {
    this.removePreviewListeners();
  }

  writeValue(value: string): void {
    this.setValue(value || '', false);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.configurePreviewEditing();
  }

  touch(): void {
    this.onTouched();
  }

  previewLoaded(): void {
    this.configurePreviewEditing();
  }

  executePreviewCommand(command: string, value?: string): void {
    if (this.disabled) {
      return;
    }

    const doc = this.getPreviewDocument();
    if (!doc) {
      return;
    }

    this.restorePreviewSelection(doc);
    this.runPreviewCommand(doc, command, value);
    this.savePreviewSelection();
    this.syncFromPreview();
    this.touch();
  }

  applyBlockFormat(value: string): void {
    this.blockFormatPickerOpen = false;

    if (value === 'normal') {
      this.clearBlockFormat();
      return;
    }

    this.executePreviewCommand('formatBlock', value);
    this.selectedBlockFormat = value;
  }

  getSelectedBlockFormatLabel(): string {
    return this.blockFormats.find((format) => format.value === this.selectedBlockFormat)?.label || 'Normal';
  }

  get codeLineNumbers(): number[] {
    const lineCount = Math.max(1, this.value.split(/\r\n|\r|\n/).length);
    return Array.from({ length: lineCount }, (_, index) => index + 1);
  }

  get highlightedSourceLines(): string[] {
    const lines = (this.value || '').split(/\r\n|\r|\n/);
    let inStyle = false;

    return (lines.length > 0 ? lines : ['']).map((line) => {
      const highlighted = inStyle ? this.highlightCssSource(line) : this.highlightHtmlSource(line);
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes('<style')) {
        inStyle = true;
      }

      if (lowerLine.includes('</style')) {
        inStyle = false;
      }

      return highlighted || '&nbsp;';
    });
  }

  trackLineNumber(_: number, lineNumber: number): number {
    return lineNumber;
  }

  sourceInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.setValue(textarea.value, true);
  }

  sourceScroll(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.codeScrollTop = textarea.scrollTop;
    this.codeScrollLeft = textarea.scrollLeft;
  }

  sourceKeyDown(event: KeyboardEvent): void {
    const textarea = event.target as HTMLTextAreaElement;

    if (event.key === 'Tab') {
      event.preventDefault();
      this.handleSourceTab(textarea, event.shiftKey);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleSourceEnter(textarea);
    }
  }

  toggleBlockFormatPicker(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.savePreviewSelection();
    this.togglePopover('blockFormat');
  }

  applyFont(value: string): void {
    this.executePreviewCommand('fontName', value);
  }

  applyFontSize(value: string): void {
    this.executePreviewCommand('fontSize', value);
  }

  applyStrikethrough(): void {
    this.executePreviewCommand('strikeThrough');
  }

  clearSelectedFormatting(): void {
    if (this.disabled) {
      return;
    }

    const doc = this.getPreviewDocument();
    if (!doc) {
      return;
    }

    this.restorePreviewSelection(doc);

    const selection = doc.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedElements = range.collapsed ? this.getFormattingTargetsAtCursor(doc, range) : this.getElementsIntersectingRange(doc, range);

    if (selectedElements.length === 0) {
      return;
    }

    if (!range.collapsed) {
      this.runPreviewCommand(doc, 'removeFormat');
    }
    this.removeStructuralFormatting(selectedElements);
    selectedElements.filter((element) => element.isConnected).forEach((element) => this.removeVisualAttributes(element));

    this.savePreviewSelection();
    this.syncFromPreview();
    this.touch();
  }

  clearBlockFormat(): void {
    if (this.disabled) {
      return;
    }

    const doc = this.getPreviewDocument();
    if (!doc) {
      return;
    }

    this.restorePreviewSelection(doc);

    const selection = doc.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const blocks = this.getSelectedFormatBlocks(doc, range);

    blocks.forEach((block) => this.unwrapElement(block));
    this.selectedBlockFormat = 'normal';
    this.savePreviewSelection();
    this.syncFromPreview();
    this.touch();
  }

  get textColorAreaBackground(): string {
    return `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${this.colorHue}, 100%, 50%))`;
  }

  get backgroundColorAreaBackground(): string {
    return `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${this.backgroundHue}, 100%, 50%))`;
  }

  get borderColorAreaBackground(): string {
    return `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${this.borderHue}, 100%, 50%))`;
  }

  toggleTextColorPicker(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.savePreviewSelection();
    this.updateTextColorFromSelection();
    this.togglePopover('textColor');
  }

  selectTextColorFromArea(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.colorAreaDragElement = event.currentTarget as HTMLElement;
    if (this.colorAreaDragElement.setPointerCapture) {
      this.colorAreaDragElement.setPointerCapture(event.pointerId);
    }

    this.updateTextColorFromArea(event);
  }

  updateTextColorAreaDrag(event: PointerEvent): void {
    if (!this.colorAreaDragElement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.updateTextColorFromArea(event);
  }

  stopTextColorAreaDrag(): void {
    this.colorAreaDragElement = null;
  }

  startHueDrag(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.hueDragElement = event.currentTarget as HTMLElement;
    if (this.hueDragElement.setPointerCapture) {
      this.hueDragElement.setPointerCapture(event.pointerId);
    }

    this.updateHueFromPointer(event);
  }

  updateHueDrag(event: PointerEvent): void {
    if (!this.hueDragElement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.updateHueFromPointer(event);
  }

  stopHueDrag(): void {
    this.hueDragElement = null;
  }

  private updateTextColorFromArea(event: PointerEvent): void {
    const rect = this.colorAreaDragElement.getBoundingClientRect();
    this.colorSaturation = this.clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    this.colorValue = this.clamp(100 - ((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    this.setDraftColorFromHsv();
  }

  private updateHueFromPointer(event: PointerEvent): void {
    const rect = this.hueDragElement.getBoundingClientRect();
    this.colorHue = this.clamp(((event.clientX - rect.left) / rect.width) * 360, 0, 360);
    this.setDraftColorFromHsv();
  }

  updateHue(value: string): void {
    this.colorHue = this.clamp(parseInt(value, 10), 0, 360);
    this.setDraftColorFromHsv();
  }

  updateTextColorRgb(channel: 'r' | 'g' | 'b', value: string): void {
    this.setTextDraftColor({
      ...this.textColorRgb,
      [channel]: this.clamp(parseInt(value, 10), 0, 255),
    });
  }

  updateTextColorHex(value: string): void {
    this.textColorHexInput = value;

    const hex = this.parseHexInput(value);
    if (!hex) {
      return;
    }

    const rgb = this.hexToRgb(hex);
    this.textColorHexInput = hex;
    this.setTextDraftColor(rgb);
  }

  updateTextColorFormat(value: string): void {
    this.textColorFormat = value === 'rgb' ? 'rgb' : 'hex';
    this.textColorHexInput = this.rgbToHex(this.textColorRgb.r, this.textColorRgb.g, this.textColorRgb.b);
  }

  getTextColorDisplayValue(): string {
    return this.formatColorValue(this.textColorRgb, this.textColorFormat);
  }

  applySelectedTextColor(): void {
    const doc = this.getPreviewDocument();
    if (!doc) {
      return;
    }

    this.restorePreviewSelection(doc);

    const selection = doc.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.getRangeAt(0).collapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const target = this.getOrCreateInlineStyleTarget(doc, range);
    this.selectedTextColor = this.getTextColorDisplayValue();
    this.setInlineStyleProperty(target, 'color', this.selectedTextColor);

    selection.removeAllRanges();
    const newRange = doc.createRange();
    newRange.selectNodeContents(target);
    selection.addRange(newRange);

    this.colorPickerOpen = false;
    this.savePreviewSelection();
    this.syncFromPreview();
    this.touch();
  }

  toggleBackgroundStylePicker(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.savePreviewSelection();
    this.updateBackgroundColorFromSelection();
    this.updateSpacingPreviewFromSelection();
    this.togglePopover('backgroundColor');
  }

  selectBackgroundColorFromArea(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.backgroundAreaDragElement = event.currentTarget as HTMLElement;
    if (this.backgroundAreaDragElement.setPointerCapture) {
      this.backgroundAreaDragElement.setPointerCapture(event.pointerId);
    }

    this.updateBackgroundColorFromArea(event);
  }

  updateBackgroundColorAreaDrag(event: PointerEvent): void {
    if (!this.backgroundAreaDragElement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.updateBackgroundColorFromArea(event);
  }

  stopBackgroundColorAreaDrag(): void {
    this.backgroundAreaDragElement = null;
  }

  startBackgroundHueDrag(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.backgroundHueDragElement = event.currentTarget as HTMLElement;
    if (this.backgroundHueDragElement.setPointerCapture) {
      this.backgroundHueDragElement.setPointerCapture(event.pointerId);
    }

    this.updateBackgroundHueFromPointer(event);
  }

  updateBackgroundHueDrag(event: PointerEvent): void {
    if (!this.backgroundHueDragElement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.updateBackgroundHueFromPointer(event);
  }

  stopBackgroundHueDrag(): void {
    this.backgroundHueDragElement = null;
  }

  private updateBackgroundColorFromArea(event: PointerEvent): void {
    const rect = this.backgroundAreaDragElement.getBoundingClientRect();
    this.backgroundSaturation = this.clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    this.backgroundValue = this.clamp(100 - ((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    this.setDraftBackgroundColorFromHsv();
  }

  private updateBackgroundHueFromPointer(event: PointerEvent): void {
    const rect = this.backgroundHueDragElement.getBoundingClientRect();
    this.backgroundHue = this.clamp(((event.clientX - rect.left) / rect.width) * 360, 0, 360);
    this.setDraftBackgroundColorFromHsv();
  }

  updateBackgroundColorRgb(channel: 'r' | 'g' | 'b', value: string): void {
    this.setBackgroundDraftColor({
      ...this.backgroundColorRgb,
      [channel]: this.clamp(parseInt(value, 10), 0, 255),
    });
  }

  updateBackgroundColorHex(value: string): void {
    this.backgroundColorHexInput = value;

    const hex = this.parseHexInput(value);
    if (!hex) {
      return;
    }

    const rgb = this.hexToRgb(hex);
    this.backgroundColorHexInput = hex;
    this.setBackgroundDraftColor(rgb);
  }

  updateBackgroundColorFormat(value: string): void {
    this.backgroundColorFormat = value === 'rgb' ? 'rgb' : 'hex';
    this.backgroundColorHexInput = this.rgbToHex(this.backgroundColorRgb.r, this.backgroundColorRgb.g, this.backgroundColorRgb.b);
  }

  getBackgroundColorDisplayValue(): string {
    return this.formatColorValue(this.backgroundColorRgb, this.backgroundColorFormat);
  }

  updateBackgroundPadding(value: string): void {
    this.backgroundPadding = this.clamp(parseInt(value, 10), 0, 40);
  }

  updateBackgroundBorderRadius(value: string): void {
    this.backgroundBorderRadius = this.clamp(parseInt(value, 10), 0, 40);
  }

  updateTextMargin(value: string): void {
    this.textMargin = this.clamp(parseInt(value, 10), 0, 80);
  }

  private updateSpacingPreviewFromSelection(): void {
    const doc = this.getPreviewDocument();
    const range = this.getCurrentPreviewRange(doc);
    const span = range ? this.getSelectedStyleSpan(doc, range) : null;

    this.spacingPreviewTextColor = span ? span.style.color || doc.defaultView?.getComputedStyle(span).color || '#17213a' : this.selectedTextColor;
    this.spacingPreviewBackgroundColor = span ? this.getElementBackgroundColor(span) || this.draftBackgroundColor : this.draftBackgroundColor;

    if (!span) {
      this.setDefaultSpacingValues();
      return;
    }

    this.backgroundPadding = span.style.padding ? this.clamp(this.parseCssPixels(span.style.padding), 0, 40) : 14;
    this.backgroundBorderRadius = span.style.borderRadius ? this.clamp(this.parseCssPixels(span.style.borderRadius), 0, 40) : 5;
    this.textMargin = span.style.margin ? this.clamp(this.parseCssPixels(span.style.margin), 0, 80) : 0;

    const backgroundColor = this.normalizeCssColor(this.getElementBackgroundColor(span));
    if (backgroundColor) {
      this.selectedBackgroundColor = backgroundColor;
      this.setDraftBackgroundColorFromHex(backgroundColor);
      this.spacingPreviewBackgroundColor = backgroundColor;
    }
  }

  private updateTextColorFromSelection(): void {
    const doc = this.getPreviewDocument();
    const range = this.getCurrentPreviewRange(doc);
    const span = range ? this.getSelectedStyleSpan(doc, range) : null;
    const selectedColor = this.normalizeCssColor(span?.style.color || '');

    this.selectedTextColor = selectedColor || '#000000';
    this.setDraftColorFromHex(this.selectedTextColor);
  }

  private updateBackgroundColorFromSelection(): void {
    const doc = this.getPreviewDocument();
    const range = this.getCurrentPreviewRange(doc);
    const span = range ? this.getSelectedStyleSpan(doc, range) : null;
    const selectedBackgroundColor = this.normalizeCssColor(span ? this.getElementBackgroundColor(span) : '');

    this.selectedBackgroundColor = selectedBackgroundColor || '#2e7d32';
    this.setDraftBackgroundColorFromHex(this.selectedBackgroundColor);
  }

  private updateBorderStyleFromSelection(): void {
    const doc = this.getPreviewDocument();
    const range = this.getCurrentPreviewRange(doc);
    const target = this.getSelectedBorderTarget(doc, range, false);
    const hasBorder = target ? this.hasElementBorder(target) : false;
    const borderColor = hasBorder ? this.normalizeCssColor(this.getElementBorderColor(target)) : '';
    const borderWidth = hasBorder ? this.getElementBorderWidth(target) : 0;

    this.selectedBorderColor = borderColor || '#aaaaaa';
    this.borderWidth = borderWidth > 0 ? this.clamp(borderWidth, 1, 20) : 1;
    this.setDraftBorderColorFromHex(this.selectedBorderColor);
  }

  private setDefaultSpacingValues(): void {
    this.backgroundPadding = 14;
    this.backgroundBorderRadius = 5;
    this.textMargin = 0;
  }

  applyBackgroundStyle(): void {
    const doc = this.getPreviewDocument();
    if (!doc) {
      return;
    }

    this.restorePreviewSelection(doc);

    const selection = doc.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.getRangeAt(0).collapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const span = this.getOrCreateStyleSpan(doc, range);
    this.selectedBackgroundColor = this.getBackgroundColorDisplayValue();
    this.setInlineStyleProperty(span, 'background-color', this.selectedBackgroundColor);

    selection.removeAllRanges();
    const newRange = doc.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);

    this.backgroundStylePickerOpen = false;
    this.savePreviewSelection();
    this.syncFromPreview();
    this.touch();
  }

  toggleSpacingStylePicker(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.savePreviewSelection();
    this.updateSpacingPreviewFromSelection();
    this.togglePopover('spacing');
  }

  applySpacingStyle(): void {
    const doc = this.getPreviewDocument();
    if (!doc) {
      return;
    }

    this.restorePreviewSelection(doc);

    const selection = doc.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.getRangeAt(0).collapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const span = this.getOrCreateStyleSpan(doc, range);

    this.setInlineStyleProperty(span, 'padding', this.backgroundPadding > 0 ? `${this.backgroundPadding}px` : '');
    this.setInlineStyleProperty(span, 'border-radius', this.backgroundBorderRadius > 0 ? `${this.backgroundBorderRadius}px` : '');

    if (this.textMargin > 0) {
      this.setInlineStyleProperty(span, 'display', 'inline-block');
      this.setInlineStyleProperty(span, 'margin', `${this.textMargin}px`);
    } else {
      this.setInlineStyleProperty(span, 'margin', '');
      if (span.style.display === 'inline-block') {
        this.setInlineStyleProperty(span, 'display', '');
      }
    }

    selection.removeAllRanges();
    const newRange = doc.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);

    this.spacingStylePickerOpen = false;
    this.savePreviewSelection();
    this.syncFromPreview();
    this.touch();
  }

  toggleBorderStylePicker(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.savePreviewSelection();
    this.updateBorderStyleFromSelection();
    this.togglePopover('border');
  }

  selectBorderColorFromArea(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.borderAreaDragElement = event.currentTarget as HTMLElement;
    if (this.borderAreaDragElement.setPointerCapture) {
      this.borderAreaDragElement.setPointerCapture(event.pointerId);
    }

    this.updateBorderColorFromArea(event);
  }

  updateBorderColorAreaDrag(event: PointerEvent): void {
    if (!this.borderAreaDragElement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.updateBorderColorFromArea(event);
  }

  stopBorderColorAreaDrag(): void {
    this.borderAreaDragElement = null;
  }

  startBorderHueDrag(event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.borderHueDragElement = event.currentTarget as HTMLElement;
    if (this.borderHueDragElement.setPointerCapture) {
      this.borderHueDragElement.setPointerCapture(event.pointerId);
    }

    this.updateBorderHueFromPointer(event);
  }

  updateBorderHueDrag(event: PointerEvent): void {
    if (!this.borderHueDragElement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.updateBorderHueFromPointer(event);
  }

  stopBorderHueDrag(): void {
    this.borderHueDragElement = null;
  }

  private updateBorderColorFromArea(event: PointerEvent): void {
    const rect = this.borderAreaDragElement.getBoundingClientRect();
    this.borderSaturation = this.clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    this.borderValue = this.clamp(100 - ((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    this.setDraftBorderColorFromHsv();
  }

  private updateBorderHueFromPointer(event: PointerEvent): void {
    const rect = this.borderHueDragElement.getBoundingClientRect();
    this.borderHue = this.clamp(((event.clientX - rect.left) / rect.width) * 360, 0, 360);
    this.setDraftBorderColorFromHsv();
  }

  updateBorderColorRgb(channel: 'r' | 'g' | 'b', value: string): void {
    this.setBorderDraftColor({
      ...this.borderColorRgb,
      [channel]: this.clamp(parseInt(value, 10), 0, 255),
    });
  }

  updateBorderColorHex(value: string): void {
    this.borderColorHexInput = value;

    const hex = this.parseHexInput(value);
    if (!hex) {
      return;
    }

    const rgb = this.hexToRgb(hex);
    this.borderColorHexInput = hex;
    this.setBorderDraftColor(rgb);
  }

  updateBorderColorFormat(value: string): void {
    this.borderColorFormat = value === 'rgb' ? 'rgb' : 'hex';
    this.borderColorHexInput = this.rgbToHex(this.borderColorRgb.r, this.borderColorRgb.g, this.borderColorRgb.b);
  }

  updateBorderWidth(value: string): void {
    this.borderWidth = this.clamp(parseInt(value, 10), 1, 20);
  }

  getBorderColorDisplayValue(): string {
    return this.formatColorValue(this.borderColorRgb, this.borderColorFormat);
  }

  applyBorderStyle(): void {
    const doc = this.getPreviewDocument();
    if (!doc) {
      return;
    }

    this.restorePreviewSelection(doc);

    const selection = doc.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : this.savedPreviewRange;
    const target = this.getSelectedBorderTarget(doc, range, true);
    if (!target) {
      return;
    }

    this.selectedBorderColor = this.getBorderColorDisplayValue();
    this.setInlineStyleProperty(target, 'border', `${this.borderWidth}px solid ${this.selectedBorderColor}`);

    selection?.removeAllRanges();
    const newRange = doc.createRange();
    newRange.selectNodeContents(target);
    selection?.addRange(newRange);

    this.borderStylePickerOpen = false;
    this.savePreviewSelection();
    this.syncFromPreview();
    this.touch();
  }

  toggleLinkPicker(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    const doc = this.getPreviewDocument();
    this.savePreviewSelection();
    this.linkUrl = this.getSelectedLink(doc)?.getAttribute('href') || '';
    this.togglePopover('link');
  }

  applyLink(): void {
    if (this.disabled) {
      return;
    }

    const url = (this.linkUrl || '').trim();
    if (!url) {
      return;
    }

    const doc = this.getPreviewDocument();
    if (!doc) {
      return;
    }

    this.restorePreviewSelection(doc);

    const selection = doc.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const existingLink = this.getSelectedLink(doc, range);

    if (existingLink) {
      existingLink.setAttribute('href', url);
      existingLink.setAttribute('target', '_blank');
      range.selectNodeContents(existingLink);
    } else if (!range.collapsed) {
      const link = doc.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('target', '_blank');
      link.appendChild(range.extractContents());
      range.insertNode(link);
      range.selectNodeContents(link);
    } else {
      return;
    }

    selection.removeAllRanges();
    selection.addRange(range);

    this.linkPickerOpen = false;
    this.savePreviewSelection();
    this.syncFromPreview();
    this.touch();
  }

  toggleEmojiPicker(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.savePreviewSelection();
    this.togglePopover('emoji');
  }

  insertEmoji(emoji: string): void {
    const doc = this.getPreviewDocument();
    if (!doc || this.disabled) {
      return;
    }

    this.restorePreviewSelection(doc);

    const selection = doc.getSelection();
    if (!selection) {
      return;
    }

    if (selection.rangeCount === 0) {
      const fallbackRange = doc.createRange();
      fallbackRange.selectNodeContents(doc.body);
      fallbackRange.collapse(false);
      selection.addRange(fallbackRange);
    }

    const range = selection.getRangeAt(0);
    const textNode = doc.createTextNode(emoji);
    range.deleteContents();
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    this.emojiPickerOpen = false;
    this.savePreviewSelection();
    this.syncFromPreview();
    this.touch();
  }

  removeLink(): void {
    const doc = this.getPreviewDocument();
    if (!doc || this.disabled) {
      return;
    }

    this.restorePreviewSelection(doc);

    const selection = doc.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const existingLink = this.getSelectedLink(doc, range);

    if (existingLink) {
      const parent = existingLink.parentNode;
      if (!parent) {
        return;
      }

      const fragment = doc.createDocumentFragment();
      while (existingLink.firstChild) {
        fragment.appendChild(existingLink.firstChild);
      }

      const firstChild = fragment.firstChild;
      const lastChild = fragment.lastChild;
      parent.insertBefore(fragment, existingLink);
      parent.removeChild(existingLink);

      if (firstChild && lastChild) {
        range.setStartBefore(firstChild);
        range.setEndAfter(lastChild);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      this.runPreviewCommand(doc, 'unlink');
    }

    this.linkPickerOpen = false;
    this.savePreviewSelection();
    this.syncFromPreview();
    this.touch();
  }

  insertImageFromInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;

    if (file) {
      this.readAndInsertImage(file);
    }

    input.value = '';
  }

  toggleAlignmentPicker(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.savePreviewSelection();
    this.togglePopover('alignment');
  }

  applyAlignment(command: string, icon: string): void {
    this.selectedAlignmentIcon = icon;
    this.alignmentPickerOpen = false;
    this.executePreviewCommand(command);
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;

    this.measureEditor();
  }

  toggleSource(): void {
    this.showSource = !this.showSource;

    this.measureEditor();
  }

  private measureEditor(): void {
    setTimeout(() => {
      this.codeScrollTop = this.codeTextarea?.nativeElement.scrollTop || 0;
    });
  }

  resizeStart(event: PointerEvent): void {
    if (!this.showSource) {
      return;
    }

    event.preventDefault();
    this.resizing = true;

    const target = event.currentTarget as HTMLElement;
    if (target && target.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }
  }

  @HostListener('document:pointermove', ['$event'])
  resizeMove(event: PointerEvent): void {
    if (!this.resizing || !this.editorWrapper) {
      return;
    }

    if (event.buttons === 0) {
      this.resizeEnd();
      return;
    }

    const rect = this.editorWrapper.nativeElement.getBoundingClientRect();
    const width = ((rect.right - event.clientX) / rect.width) * 100;
    this.editorWidth = Math.min(75, Math.max(25, width));
  }

  @HostListener('document:pointerup')
  @HostListener('document:pointercancel')
  @HostListener('window:blur')
  resizeEnd(): void {
    this.resizing = false;
  }

  @HostListener('document:keydown.escape')
  collapseExpanded(): void {
    if (!this.expanded) {
      return;
    }

    this.toggleExpanded();
  }

  @HostListener('document:click')
  closePopovers(): void {
    this.closeAllPopovers();
  }

  @HostListener('window:resize')
  repositionOpenPopover(): void {
    this.positionOpenPopover();
  }

  private closeAllPopovers(): void {
    this.popoverStateKeys.forEach((key) => (this[key] = false));
  }

  private togglePopover(name: PopoverName): void {
    const stateKey = this.popoverStateKeyByName[name];
    const wasOpen = this[stateKey];
    this.closeAllPopovers();
    this[stateKey] = !wasOpen;

    if (!wasOpen) {
      this.schedulePopoverPosition();
    }
  }

  private schedulePopoverPosition(): void {
    window.requestAnimationFrame(() => this.positionOpenPopover());
  }

  private positionOpenPopover(): void {
    const wrapper = this.editorWrapper?.nativeElement;
    if (!wrapper) {
      return;
    }

    const popover = wrapper.querySelector<HTMLElement>(
      '.toolbar-block-format-popover, .toolbar-align-popover, .toolbar-color-popover, .toolbar-background-popover, .toolbar-spacing-popover, .toolbar-border-popover, .toolbar-link-popover, .toolbar-emoji-popover',
    );
    const anchor = popover?.parentElement;
    if (!popover || !anchor) {
      return;
    }

    popover.style.right = 'auto';
    popover.style.left = '0px';

    const wrapperRect = wrapper.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const popoverWidth = popover.offsetWidth;
    const margin = 6;
    const minLeft = wrapperRect.left + margin;
    const maxLeft = wrapperRect.right - popoverWidth - margin;
    const centeredLeft = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;
    const viewportLeft = this.clamp(centeredLeft, minLeft, Math.max(minLeft, maxLeft));

    popover.style.left = `${Math.round(viewportLeft - anchorRect.left)}px`;
  }

  private handleSourceTab(textarea: HTMLTextAreaElement, outdent: boolean): void {
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const indent = '  ';

    if (selectionStart === selectionEnd) {
      if (outdent) {
        const removeStart = value.substring(Math.max(0, selectionStart - indent.length), selectionStart) === indent ? selectionStart - indent.length : selectionStart;
        if (removeStart !== selectionStart) {
          this.replaceSourceText(textarea, removeStart, selectionStart, '', removeStart, removeStart);
        }
        return;
      }

      this.replaceSourceText(textarea, selectionStart, selectionEnd, indent, selectionStart + indent.length, selectionStart + indent.length);
      return;
    }

    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineEnd = value.indexOf('\n', selectionEnd);
    const selectedEnd = lineEnd === -1 ? value.length : lineEnd;
    const selectedText = value.substring(lineStart, selectedEnd);
    const lines = selectedText.split('\n');
    const changedLines = outdent
      ? lines.map((line) => (line.startsWith(indent) ? line.substring(indent.length) : line.startsWith(' ') ? line.substring(1) : line))
      : lines.map((line) => `${indent}${line}`);
    const replacement = changedLines.join('\n');
    const delta = replacement.length - selectedText.length;

    this.replaceSourceText(textarea, lineStart, selectedEnd, replacement, selectionStart + (outdent ? Math.min(0, delta) : indent.length), selectionEnd + delta);
  }

  private handleSourceEnter(textarea: HTMLTextAreaElement): void {
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const currentLine = value.substring(lineStart, selectionStart);
    const indentation = currentLine.match(/^\s*/)?.[0] || '';
    const insert = `\n${indentation}`;
    const cursor = selectionStart + insert.length;

    this.replaceSourceText(textarea, selectionStart, selectionEnd, insert, cursor, cursor);
  }

  private replaceSourceText(textarea: HTMLTextAreaElement, start: number, end: number, replacement: string, selectionStart: number, selectionEnd: number): void {
    const value = textarea.value;
    const nextValue = `${value.substring(0, start)}${replacement}${value.substring(end)}`;

    this.setValue(nextValue, true);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(Math.max(0, selectionStart), Math.max(0, selectionEnd));
      this.codeScrollTop = textarea.scrollTop;
    });
  }

  private highlightHtmlSource(line: string): string {
    let result = '';
    let index = 0;

    while (index < line.length) {
      const tagStart = line.indexOf('<', index);
      if (tagStart === -1) {
        result += this.escapeHtml(line.substring(index));
        break;
      }

      result += this.escapeHtml(line.substring(index, tagStart));

      const tagEnd = line.indexOf('>', tagStart + 1);
      if (tagEnd === -1) {
        result += this.escapeHtml(line.substring(tagStart));
        break;
      }

      result += this.highlightHtmlTag(line.substring(tagStart, tagEnd + 1));
      index = tagEnd + 1;
    }

    return result;
  }

  private highlightHtmlTag(tag: string): string {
    if (tag.startsWith('<!--')) {
      return `<span class="source-token-comment">${this.escapeHtml(tag)}</span>`;
    }

    const match = tag.match(/^<\/?([a-zA-Z][\w:-]*)([\s\S]*?)(\/?)>$/);
    if (!match) {
      return this.escapeHtml(tag);
    }

    const tagOpen = this.escapeHtml(tag.startsWith('</') ? '</' : '<');
    const tagName = this.escapeHtml(match[1]);
    const attributes = this.highlightHtmlAttributes(match[2] || '');
    const tagClose = this.escapeHtml(`${match[3] || ''}>`);

    return `<span class="source-token-tag-bracket">${tagOpen}</span><span class="source-token-tag-name">${tagName}</span>${attributes}<span class="source-token-tag-bracket">${tagClose}</span>`;
  }

  private highlightHtmlAttributes(value: string): string {
    const pieces: string[] = [];
    const attributeRegex = /([^\s=/>]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s/>]+)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = attributeRegex.exec(value)) !== null) {
      pieces.push(this.escapeHtml(value.substring(lastIndex, match.index)));
      pieces.push(this.escapeHtml(match[1]));
      pieces.push(this.escapeHtml(match[2]));
      pieces.push(this.highlightHtmlAttributeValue(match[1], match[3]));
      lastIndex = match.index + match[0].length;
    }

    pieces.push(this.escapeHtml(value.substring(lastIndex)));
    return pieces.join('');
  }

  private highlightHtmlAttributeValue(attributeName: string, value: string): string {
    const quote = value.startsWith('"') || value.startsWith("'") ? value[0] : '';
    const unquotedValue = quote ? value.substring(1, value.length - 1) : value;
    const highlightedValue = attributeName.toLowerCase() === 'style' ? this.highlightInlineCssValue(unquotedValue) : `<span class="source-token-string">${this.escapeHtml(unquotedValue)}</span>`;

    if (!quote) {
      return highlightedValue;
    }

    return `<span class="source-token-string">${this.escapeHtml(quote)}</span>${highlightedValue}<span class="source-token-string">${this.escapeHtml(quote)}</span>`;
  }

  private highlightInlineCssValue(value: string): string {
    const pieces: string[] = [];
    const cssDeclarationRegex = /([a-zA-Z-]+)(\s*:\s*)([^;]+)(;?)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = cssDeclarationRegex.exec(value)) !== null) {
      pieces.push(this.escapeHtml(value.substring(lastIndex, match.index)));
      pieces.push(this.escapeHtml(match[1]));
      pieces.push(this.escapeHtml(match[2]));
      pieces.push(`<span class="source-token-css-value">${this.escapeHtml(match[3])}</span>`);
      pieces.push(this.escapeHtml(match[4]));
      lastIndex = match.index + match[0].length;
    }

    pieces.push(this.escapeHtml(value.substring(lastIndex)));
    return pieces.join('');
  }

  private highlightCssSource(line: string): string {
    let highlighted = this.escapeHtml(line);

    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="source-token-comment">$1</span>');
    highlighted = highlighted.replace(/([a-zA-Z-]+)(\s*:)/g, '<span class="source-token-css-property">$1</span>$2');
    highlighted = highlighted.replace(/(:\s*)([^;{}]+)(;?)/g, '$1<span class="source-token-css-value">$2</span>$3');
    highlighted = highlighted.replace(/([{}])/g, '<span class="source-token-tag-bracket">$1</span>');

    return highlighted;
  }

  private setValue(value: string, emit: boolean, refreshPreview: boolean = true): void {
    this.value = value;

    if (refreshPreview) {
      this.updatePreview();
    }

    if (emit) {
      this.onChange(value);
    }
  }

  private updatePreview(): void {
    if (this.previewFrame) {
      this.removePreviewListeners();
      this.previewDocumentMode = this.isHtmlDocument(this.value) ? 'document' : 'fragment';
      this.previewFrame.nativeElement.srcdoc = this.value || '';
    }
  }

  private configurePreviewEditing(): void {
    this.removePreviewListeners();

    const doc = this.getPreviewDocument();
    if (!doc) {
      return;
    }

    this.activePreviewDocument = doc;
    this.applyPreviewDefaultStyles(doc);
    doc.designMode = this.disabled ? 'off' : 'on';
    this.runPreviewCommand(doc, 'enableObjectResizing', 'true');
    doc.addEventListener('input', this.previewInputListener);
    doc.addEventListener('selectionchange', this.previewSelectionListener);
    doc.addEventListener('keyup', this.previewSelectionListener);
    doc.addEventListener('mouseup', this.previewSelectionListener);
    doc.addEventListener('blur', this.previewTouchedListener, true);
    doc.addEventListener('click', this.previewClickListener, true);
    doc.addEventListener('paste', this.previewPasteListener);
    doc.addEventListener('drop', this.previewDropListener);
    doc.addEventListener('dragover', this.previewDragOverListener);
    doc.addEventListener('keydown', this.previewKeyDownListener);
    doc.addEventListener('pointerdown', this.previewPointerDownListener);
    doc.addEventListener('scroll', this.previewScrollListener, true);
  }

  private removePreviewListeners(): void {
    if (!this.activePreviewDocument) {
      return;
    }

    this.clearSelectedImage();
    this.activePreviewDocument.removeEventListener('input', this.previewInputListener);
    this.activePreviewDocument.removeEventListener('selectionchange', this.previewSelectionListener);
    this.activePreviewDocument.removeEventListener('keyup', this.previewSelectionListener);
    this.activePreviewDocument.removeEventListener('mouseup', this.previewSelectionListener);
    this.activePreviewDocument.removeEventListener('blur', this.previewTouchedListener, true);
    this.activePreviewDocument.removeEventListener('click', this.previewClickListener, true);
    this.activePreviewDocument.removeEventListener('paste', this.previewPasteListener);
    this.activePreviewDocument.removeEventListener('drop', this.previewDropListener);
    this.activePreviewDocument.removeEventListener('dragover', this.previewDragOverListener);
    this.activePreviewDocument.removeEventListener('keydown', this.previewKeyDownListener);
    this.activePreviewDocument.removeEventListener('pointerdown', this.previewPointerDownListener);
    this.activePreviewDocument.removeEventListener('scroll', this.previewScrollListener, true);
    this.activePreviewDocument.removeEventListener('pointermove', this.imageResizeMoveListener);
    this.activePreviewDocument.removeEventListener('pointerup', this.imageResizeEndListener);
    this.activePreviewDocument.removeEventListener('pointercancel', this.imageResizeEndListener);
    this.activePreviewDocument = null;
    this.savedPreviewRange = null;
  }

  private applyPreviewDefaultStyles(doc: Document): void {
    const head = doc.head;
    if (!head) {
      return;
    }

    if (!head.querySelector('[data-html-editor-ui="preview-roboto-font"]')) {
      const fontLink = doc.createElement('link');
      fontLink.setAttribute('data-html-editor-ui', 'preview-roboto-font');
      fontLink.setAttribute('rel', 'stylesheet');
      fontLink.setAttribute('href', 'assets/css/roboto.css');
      head.insertBefore(fontLink, head.firstChild);
    }

    if (!head.querySelector('[data-html-editor-ui="preview-default-style"]')) {
      const defaultStyle = doc.createElement('style');
      defaultStyle.setAttribute('data-html-editor-ui', 'preview-default-style');
      defaultStyle.textContent = `
        html,
        body {
          font-family: 'Roboto', Arial, sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.42;
        }

        p {
          margin: 0 0 2px;
        }
      `;
      head.insertBefore(defaultStyle, head.firstChild?.nextSibling || head.firstChild);
    }
  }

  private runPreviewCommand(doc: Document, command: string, value?: string): boolean {
    try {
      return doc.execCommand(command, false, value);
    } catch {
      return false;
    }
  }

  private syncFromPreview(): void {
    const doc = this.getPreviewDocument();
    if (!doc) {
      return;
    }

    const wrappedDefaultParagraph = this.ensureDefaultParagraphForPlainBody(doc);
    const value = this.serializePreviewDocument(doc);
    this.value = value;

    this.onChange(value);

    if (wrappedDefaultParagraph) {
      this.selectedBlockFormat = 'p';
      this.savePreviewSelection();
    }
  }

  private ensureDefaultParagraphForPlainBody(doc: Document): boolean {
    const body = doc.body;
    if (!body || this.previewDocumentMode !== 'fragment') {
      return false;
    }

    const contentNodes = Array.from(body.childNodes).filter((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent || '').trim().length > 0;
      }

      return node.nodeType === Node.ELEMENT_NODE && !(node as HTMLElement).hasAttribute('data-html-editor-ui');
    });

    if (contentNodes.length === 0 || contentNodes.some((node) => node.nodeType === Node.ELEMENT_NODE && this.blockTags.has((node as HTMLElement).tagName.toLowerCase()))) {
      return false;
    }

    const paragraph = doc.createElement('p');
    body.insertBefore(paragraph, contentNodes[0]);
    contentNodes.forEach((node) => paragraph.appendChild(node));

    Array.from(body.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim().length === 0)
      .forEach((node) => body.removeChild(node));

    return true;
  }

  private serializePreviewDocument(doc: Document): string {
    if (this.previewDocumentMode === 'document' && doc.documentElement) {
      const doctype = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>` : '';
      const html = this.serializeNode(doc.documentElement, 0, false);
      return [doctype, html].filter((line) => line.length > 0).join('\n');
    }

    const nodes: Node[] = [];

    if (doc.head) {
      nodes.push(...Array.from(doc.head.childNodes));
    }

    if (doc.body) {
      nodes.push(...Array.from(doc.body.childNodes));
    }

    return nodes
      .map((node) => this.serializeNode(node, 0, false))
      .filter((line) => line.length > 0)
      .join('\n\n');
  }

  private handlePreviewSelectionChange(): void {
    this.savePreviewSelection();
    this.updateSelectedBlockFormat();
  }

  private savePreviewSelection(): void {
    const doc = this.getPreviewDocument();
    const selection = doc ? doc.getSelection() : null;

    if (selection && selection.rangeCount > 0) {
      this.savedPreviewRange = selection.getRangeAt(0).cloneRange();
    }
  }

  private updateSelectedBlockFormat(): void {
    const doc = this.getPreviewDocument();
    const selection = doc ? doc.getSelection() : null;

    if (!selection || selection.rangeCount === 0) {
      this.selectedBlockFormat = 'normal';
      return;
    }

    const node = selection.anchorNode || selection.getRangeAt(0).commonAncestorContainer;
    const block = this.getClosestFormatBlock(node);
    this.selectedBlockFormat = block ? block.tagName.toLowerCase() : 'normal';
  }

  private handlePreviewPaste(event: ClipboardEvent): void {
    const files = this.getImageFilesFromClipboard(event.clipboardData);
    if (files.length === 0) {
      return;
    }

    event.preventDefault();
    this.savePreviewSelection();
    this.readAndInsertImages(files);
  }

  private handlePreviewDrop(event: DragEvent): void {
    const files = this.getImageFilesFromDataTransfer(event.dataTransfer);
    if (files.length === 0) {
      return;
    }

    event.preventDefault();

    const doc = this.getPreviewDocument();
    const range = doc ? this.getRangeFromPoint(doc, event.clientX, event.clientY) : null;
    if (range) {
      this.savedPreviewRange = range;
    }

    this.readAndInsertImages(files);
  }

  private handlePreviewDragOver(event: DragEvent): void {
    if (this.getImageFilesFromDataTransfer(event.dataTransfer).length === 0) {
      return;
    }

    event.preventDefault();
  }

  private handlePreviewKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Delete' && event.key !== 'Backspace') {
      return;
    }

    if (!this.selectedImage || this.disabled) {
      return;
    }

    const doc = this.getPreviewDocument();
    if (!doc || !doc.body.contains(this.selectedImage)) {
      this.clearSelectedImage();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.removeSelectedImage();
  }

  private restorePreviewSelection(doc: Document): void {
    if (!this.savedPreviewRange) {
      doc.body?.focus();
      return;
    }

    const selection = doc.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(this.savedPreviewRange);
    }
  }

  private getPreviewDocument(): Document {
    try {
      return this.previewFrame ? this.previewFrame.nativeElement.contentDocument || this.previewFrame.nativeElement.contentWindow.document : null;
    } catch {
      return null;
    }
  }

  private getCurrentPreviewRange(doc: Document): Range {
    if (!doc) {
      return null;
    }

    const selection = doc.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }

    return this.savedPreviewRange;
  }

  private getOrCreateStyleSpan(doc: Document, range: Range): HTMLSpanElement {
    const existingSpan = this.getSelectedStyleSpan(doc, range);
    if (existingSpan) {
      return existingSpan;
    }

    const span = doc.createElement('span');
    span.appendChild(range.extractContents());
    range.insertNode(span);
    return span;
  }

  private getOrCreateInlineStyleTarget(doc: Document, range: Range): HTMLElement {
    const link = this.getSelectedLink(doc, range);
    return link || this.getOrCreateStyleSpan(doc, range);
  }

  private getSelectedBorderTarget(doc: Document, range: Range, createInlineTarget: boolean): HTMLElement {
    if (this.selectedImage && doc.body.contains(this.selectedImage)) {
      return this.selectedImage;
    }

    if (!doc || !range) {
      return null;
    }

    const selectedElement = this.getDirectlySelectedElement(range);
    if (selectedElement && selectedElement !== doc.body && selectedElement !== doc.documentElement && !selectedElement.hasAttribute('data-html-editor-ui')) {
      return selectedElement;
    }

    const selection = doc.getSelection();
    const candidates = [selection?.anchorNode, selection?.focusNode, range.commonAncestorContainer].filter((node) => !!node);
    for (const node of candidates) {
      const target = this.getClosestBorderElement(node);
      if (target) {
        return target;
      }
    }

    return createInlineTarget && !range.collapsed ? this.getOrCreateStyleSpan(doc, range) : null;
  }

  private getDirectlySelectedElement(range: Range): HTMLElement {
    const node = range.startContainer.childNodes[range.startOffset];
    return range.startContainer === range.endContainer && range.endOffset === range.startOffset + 1 && node?.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : null;
  }

  private getClosestBorderElement(node: Node): HTMLElement {
    if (!node) {
      return null;
    }

    const element = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    return element?.closest('img,p,div,h1,h2,h3,h4,h5,h6,li,ul,ol,table,tbody,thead,tfoot,tr,td,th,blockquote,section,article,a,span:not([data-html-editor-ui])') as HTMLElement;
  }

  private setInlineStyleProperty(element: HTMLElement, property: string, value: string): void {
    const normalizedProperty = property.toLowerCase();
    const declarations = (element.getAttribute('style') || '')
      .split(';')
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && !item.toLowerCase().startsWith(`${normalizedProperty}:`));

    if (value) {
      declarations.push(`${normalizedProperty}: ${value}`);
    }

    if (declarations.length === 0) {
      element.removeAttribute('style');
      return;
    }

    element.setAttribute('style', `${declarations.join('; ')};`);
  }

  private getSelectedStyleSpan(doc: Document, range: Range): HTMLSpanElement {
    if (!doc || !range) {
      return null;
    }

    const selection = doc.getSelection();
    const candidates = [selection?.anchorNode, selection?.focusNode, range.commonAncestorContainer].filter((node) => !!node);

    for (const node of candidates) {
      const span = this.getClosestStyleSpan(node);
      if (span) {
        return span;
      }
    }

    return this.getElementsIntersectingRange(doc, range).find((element) => element.tagName.toLowerCase() === 'span') as HTMLSpanElement;
  }

  private getClosestStyleSpan(node: Node): HTMLSpanElement {
    if (!node) {
      return null;
    }

    const element = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    return element?.closest('span:not([data-html-editor-ui])') as HTMLSpanElement;
  }

  private getElementBackgroundColor(element: HTMLElement): string {
    const backgroundColor = element.style.backgroundColor || element.ownerDocument.defaultView?.getComputedStyle(element).backgroundColor || '';
    return backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent' ? '' : backgroundColor;
  }

  private getElementBorderColor(element: HTMLElement): string {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    return element.style.borderColor || element.style.borderTopColor || style?.borderTopColor || '';
  }

  private getElementBorderWidth(element: HTMLElement): number {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    return this.parseCssPixels(element.style.borderWidth || element.style.borderTopWidth || style?.borderTopWidth || '');
  }

  private hasElementBorder(element: HTMLElement): boolean {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    const borderStyle = (element.style.borderStyle || element.style.borderTopStyle || style?.borderTopStyle || '').toLowerCase();
    return this.getElementBorderWidth(element) > 0 && borderStyle !== 'none' && borderStyle !== 'hidden';
  }

  private normalizeCssColor(value: string): string {
    if (!value) {
      return '';
    }

    const color = value.trim();
    if (color.startsWith('#')) {
      return this.rgbToHex(this.hexToRgb(color).r, this.hexToRgb(color).g, this.hexToRgb(color).b);
    }

    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!rgbMatch) {
      return '';
    }

    return this.rgbToHex(parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10));
  }

  private parseCssPixels(value: string): number {
    const match = `${value || ''}`.match(/-?\d+(\.\d+)?/);
    return match ? Math.round(parseFloat(match[0])) : 0;
  }

  private readAndInsertImages(files: File[]): void {
    files.reduce((promise, file) => promise.then(() => this.readAndInsertImage(file)), Promise.resolve());
  }

  private readAndInsertImage(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.insertEmbeddedImage(reader.result as string);
        resolve();
      };
      reader.onerror = () => resolve();
      reader.readAsDataURL(file);
    });
  }

  private insertEmbeddedImage(src: string): void {
    const doc = this.getPreviewDocument();
    if (!doc) {
      return;
    }

    this.restorePreviewSelection(doc);

    const selection = doc.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : doc.createRange();

    if (!selection || selection.rangeCount === 0) {
      range.selectNodeContents(doc.body);
      range.collapse(false);
    }

    const image = doc.createElement('img');
    image.src = src;
    image.alt = '';
    image.style.maxWidth = '100%';
    image.style.height = 'auto';

    range.deleteContents();
    range.insertNode(image);
    range.setStartAfter(image);
    range.collapse(true);

    selection?.removeAllRanges();
    selection?.addRange(range);

    this.selectedImage = image;
    this.positionImageResizeOverlay();
    this.savePreviewSelection();
    this.syncFromPreview();
    this.touch();
  }

  private getImageFilesFromClipboard(data: DataTransfer): File[] {
    return this.getImageFiles(data);
  }

  private getImageFilesFromDataTransfer(data: DataTransfer): File[] {
    if (!data) {
      return [];
    }

    return this.getImageFiles(data);
  }

  private getImageFiles(data: DataTransfer): File[] {
    if (!data) {
      return [];
    }

    const filesFromItems = Array.from(data.items || [])
      .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter((file) => !!file);

    return filesFromItems.length > 0 ? filesFromItems : Array.from(data.files || []).filter((file) => file.type.startsWith('image/'));
  }

  private getRangeFromPoint(doc: Document, x: number, y: number): Range {
    const rangeFromPoint = doc.caretRangeFromPoint ? doc.caretRangeFromPoint(x, y) : null;
    if (rangeFromPoint) {
      return rangeFromPoint;
    }

    const documentWithCaretPosition = doc as Document & {
      caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number };
    };
    const positionFromPoint = documentWithCaretPosition.caretPositionFromPoint ? documentWithCaretPosition.caretPositionFromPoint(x, y) : null;
    if (!positionFromPoint) {
      return null;
    }

    const range = doc.createRange();
    range.setStart(positionFromPoint.offsetNode, positionFromPoint.offset);
    range.collapse(true);
    return range;
  }

  private selectPreviewImage(image: HTMLImageElement): void {
    this.selectedImage = image;
    this.positionImageResizeOverlay();
  }

  private clearSelectedImage(): void {
    if (this.imageResizeOverlay?.parentNode) {
      this.imageResizeOverlay.parentNode.removeChild(this.imageResizeOverlay);
    }

    this.imageResizeOverlay = null;
    this.selectedImage = null;
    this.imageResizeState = null;
  }

  private removeSelectedImage(): void {
    const image = this.selectedImage;
    if (!image?.parentNode) {
      this.clearSelectedImage();
      return;
    }

    const doc = this.getPreviewDocument();
    const range = doc?.createRange();
    range?.setStartBefore(image);
    range?.collapse(true);
    image.parentNode.removeChild(image);
    this.clearSelectedImage();

    const selection = doc?.getSelection();
    if (selection && range) {
      selection.removeAllRanges();
      selection.addRange(range);
      this.savePreviewSelection();
    }

    this.syncFromPreview();
    this.touch();
  }

  private positionImageResizeOverlay(): void {
    const doc = this.getPreviewDocument();
    const image = this.selectedImage;
    if (!doc || !image || !doc.body.contains(image)) {
      this.clearSelectedImage();
      return;
    }

    if (!this.imageResizeOverlay) {
      this.imageResizeOverlay = this.createImageResizeOverlay(doc);
      doc.body.appendChild(this.imageResizeOverlay);
    }

    const view = doc.defaultView;
    const rect = image.getBoundingClientRect();
    this.imageResizeOverlay.style.left = `${rect.left + (view?.scrollX || 0)}px`;
    this.imageResizeOverlay.style.top = `${rect.top + (view?.scrollY || 0)}px`;
    this.imageResizeOverlay.style.width = `${rect.width}px`;
    this.imageResizeOverlay.style.height = `${rect.height}px`;
  }

  private createImageResizeOverlay(doc: Document): HTMLElement {
    const overlay = doc.createElement('div');
    overlay.setAttribute('data-html-editor-ui', 'image-resize-overlay');
    overlay.setAttribute('contenteditable', 'false');
    overlay.style.position = 'absolute';
    overlay.style.boxSizing = 'border-box';
    overlay.style.border = '2px solid #1a73e8';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '2147483647';

    const handle = doc.createElement('span');
    handle.setAttribute('data-html-editor-ui', 'image-resize-handle');
    handle.setAttribute('contenteditable', 'false');
    handle.style.position = 'absolute';
    handle.style.right = '-7px';
    handle.style.bottom = '-7px';
    handle.style.width = '12px';
    handle.style.height = '12px';
    handle.style.border = '2px solid #fff';
    handle.style.borderRadius = '50%';
    handle.style.background = '#1a73e8';
    handle.style.boxShadow = '0 0 0 1px #17213a';
    handle.style.cursor = 'nwse-resize';
    handle.style.pointerEvents = 'auto';
    handle.addEventListener('pointerdown', (event) => this.startImageResize(event));
    overlay.appendChild(handle);

    return overlay;
  }

  private startImageResize(event: PointerEvent): void {
    if (!this.selectedImage || this.disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    if (target?.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }

    this.imageResizeState = {
      image: this.selectedImage,
      startX: event.clientX,
      startWidth: this.selectedImage.getBoundingClientRect().width,
    };

    const doc = this.getPreviewDocument();
    doc?.addEventListener('pointermove', this.imageResizeMoveListener);
    doc?.addEventListener('pointerup', this.imageResizeEndListener);
    doc?.addEventListener('pointercancel', this.imageResizeEndListener);
  }

  private resizeSelectedImage(event: PointerEvent): void {
    if (!this.imageResizeState) {
      return;
    }

    event.preventDefault();
    const nextWidth = Math.max(24, Math.round(this.imageResizeState.startWidth + event.clientX - this.imageResizeState.startX));
    this.imageResizeState.image.style.width = `${nextWidth}px`;
    this.imageResizeState.image.style.height = 'auto';
    this.imageResizeState.image.removeAttribute('width');
    this.imageResizeState.image.removeAttribute('height');
    this.positionImageResizeOverlay();
  }

  private endImageResize(): void {
    if (!this.imageResizeState) {
      return;
    }

    const doc = this.getPreviewDocument();
    doc?.removeEventListener('pointermove', this.imageResizeMoveListener);
    doc?.removeEventListener('pointerup', this.imageResizeEndListener);
    doc?.removeEventListener('pointercancel', this.imageResizeEndListener);
    this.imageResizeState = null;
    this.positionImageResizeOverlay();
    this.syncFromPreview();
    this.touch();
  }

  private getSelectedLink(doc: Document, range?: Range): HTMLAnchorElement {
    if (!doc) {
      return null;
    }

    const selection = doc.getSelection();
    const selectedRange = range || (selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null);
    const selectedNode = selection?.anchorNode || selectedRange?.commonAncestorContainer;
    const selectedLink = this.getClosestAnchor(selectedNode);

    if (selectedLink) {
      return selectedLink;
    }

    const ancestorLink = selectedRange ? this.getClosestAnchor(selectedRange.commonAncestorContainer) : null;
    if (ancestorLink) {
      return ancestorLink;
    }

    return selectedRange ? (this.getElementsIntersectingRange(doc, selectedRange).find((element) => element.tagName.toLowerCase() === 'a') as HTMLAnchorElement) : null;
  }

  private getClosestAnchor(node: Node): HTMLAnchorElement {
    if (!node) {
      return null;
    }

    const element = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    return element?.closest('a') as HTMLAnchorElement;
  }

  private getSelectedFormatBlocks(doc: Document, range: Range): HTMLElement[] {
    const blocks = this.getElementsIntersectingRange(doc, range).filter((element) => this.formatBlockTags.has(element.tagName.toLowerCase()));

    if (blocks.length > 0) {
      return blocks;
    }

    const closestBlock = this.getClosestFormatBlock(range.commonAncestorContainer);
    return closestBlock ? [closestBlock] : [];
  }

  private getClosestFormatBlock(node: Node): HTMLElement {
    if (!node) {
      return null;
    }

    const element = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;

    if (!element) {
      return null;
    }

    return element.closest(Array.from(this.formatBlockTags).join(',')) as HTMLElement;
  }

  private unwrapElement(element: HTMLElement): void {
    const parent = element.parentNode;
    if (!parent) {
      return;
    }

    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }

    parent.removeChild(element);
  }

  private removeStructuralFormatting(elements: HTMLElement[]): void {
    const connectedElements = elements.filter((element) => element.isConnected);

    connectedElements.filter((element) => element.tagName.toLowerCase() === 'a').forEach((element) => this.unwrapElement(element));

    connectedElements
      .filter((element) => element.isConnected && this.inlineFormattingTags.has(element.tagName.toLowerCase()))
      .sort((left, right) => this.getNodeDepth(right) - this.getNodeDepth(left))
      .forEach((element) => this.unwrapElement(element));

    connectedElements.filter((element) => element.isConnected && /^h[1-6]$/.test(element.tagName.toLowerCase())).forEach((element) => this.replaceElementWithParagraph(element));

    connectedElements.filter((element) => element.isConnected && element.tagName.toLowerCase() === 'li').forEach((element) => this.replaceElementWithParagraph(element));

    connectedElements
      .filter((element) => element.isConnected && ['ul', 'ol', 'blockquote'].includes(element.tagName.toLowerCase()))
      .sort((left, right) => this.getNodeDepth(right) - this.getNodeDepth(left))
      .forEach((element) => this.unwrapElement(element));
  }

  private getFormattingTargetsAtCursor(doc: Document, range: Range): HTMLElement[] {
    const node = range.commonAncestorContainer;
    const targets = [
      this.getClosestAnchor(node),
      this.getClosestStyleSpan(node),
      this.getClosestFormatBlock(node),
      this.getClosestListItem(node),
      this.getClosestList(node),
      this.getClosestBlockquote(node),
    ].filter((element) => element?.isConnected && element !== doc.body && element !== doc.documentElement);

    return Array.from(new Set(targets));
  }

  private getClosestListItem(node: Node): HTMLElement {
    return this.getClosestElement(node, 'li');
  }

  private getClosestList(node: Node): HTMLElement {
    return this.getClosestElement(node, 'ul,ol');
  }

  private getClosestBlockquote(node: Node): HTMLElement {
    return this.getClosestElement(node, 'blockquote');
  }

  private getClosestElement(node: Node, selector: string): HTMLElement {
    if (!node) {
      return null;
    }

    const element = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    return element?.closest(selector) as HTMLElement;
  }

  private replaceElementWithParagraph(element: HTMLElement): void {
    const parent = element.parentNode;
    if (!parent) {
      return;
    }

    const paragraph = element.ownerDocument.createElement('p');
    while (element.firstChild) {
      paragraph.appendChild(element.firstChild);
    }

    parent.insertBefore(paragraph, element);
    parent.removeChild(element);
  }

  private getNodeDepth(node: Node): number {
    let depth = 0;
    let current = node.parentNode;

    while (current) {
      depth++;
      current = current.parentNode;
    }

    return depth;
  }

  private getElementsIntersectingRange(doc: Document, range: Range): HTMLElement[] {
    const root = doc.body;
    if (!root) {
      return [];
    }

    return Array.from(root.querySelectorAll<HTMLElement>('*')).filter((element) => {
      try {
        return range.intersectsNode(element);
      } catch {
        return false;
      }
    });
  }

  private removeVisualAttributes(element: HTMLElement): void {
    element.removeAttribute('style');
    element.removeAttribute('class');
    element.removeAttribute('align');
    element.removeAttribute('bgcolor');
    element.removeAttribute('color');
    element.removeAttribute('face');
    element.removeAttribute('size');
  }

  private isHtmlDocument(value: string): boolean {
    return /<!doctype|<html[\s>]|<body[\s>]/i.test(value || '');
  }

  private serializeNode(node: Node, indent: number, inline: boolean): string {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      return inline ? this.escapeHtml(text) : `${'  '.repeat(indent)}${this.escapeHtml(text.trim())}`;
    }

    if (node.nodeType === Node.COMMENT_NODE) {
      return `${'  '.repeat(indent)}<!--${node.textContent || ''}-->`;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    if ((node as HTMLElement).hasAttribute('data-html-editor-ui')) {
      return '';
    }

    return this.serializeElement(node as HTMLElement, indent, inline);
  }

  private serializeElement(element: HTMLElement, indent: number, inline: boolean): string {
    const tagName = this.normalizeTagName(element.tagName.toLowerCase());
    const attributes = this.serializeAttributes(element);

    if (tagName === 'style' || tagName === 'script') {
      return this.serializeRawTextElement(element, indent, tagName, attributes);
    }

    if (this.voidTags.has(tagName)) {
      const value = `<${tagName}${attributes}>`;
      return inline ? value : `${'  '.repeat(indent)}${value}`;
    }

    const childNodes = Array.from(element.childNodes);
    const hasBlockChildren = Array.from(element.children).some((child) => this.blockTags.has(child.tagName.toLowerCase()));

    if (!hasBlockChildren) {
      const content = childNodes
        .map((child) => this.serializeInlineNode(child))
        .join('')
        .trim();
      const value = `<${tagName}${attributes}>${content}</${tagName}>`;
      return inline ? value : `${'  '.repeat(indent)}${value}`;
    }

    const children = childNodes.map((child) => this.serializeNode(child, indent + 1, false)).filter((line) => line.trim().length > 0);

    return [`${'  '.repeat(indent)}<${tagName}${attributes}>`, ...children, `${'  '.repeat(indent)}</${tagName}>`].join('\n');
  }

  private serializeInlineNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return this.escapeHtml(node.textContent || '');
    }

    if (node.nodeType === Node.COMMENT_NODE) {
      return `<!--${node.textContent || ''}-->`;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const element = node as HTMLElement;
    if (element.hasAttribute('data-html-editor-ui')) {
      return '';
    }

    const tagName = this.normalizeTagName(element.tagName.toLowerCase());
    const attributes = this.serializeAttributes(element);

    if (this.voidTags.has(tagName)) {
      return `<${tagName}${attributes}>`;
    }

    return `<${tagName}${attributes}>${Array.from(element.childNodes)
      .map((child) => this.serializeInlineNode(child))
      .join('')}</${tagName}>`;
  }

  private serializeRawTextElement(element: HTMLElement, indent: number, tagName: string, attributes: string): string {
    const content = element.textContent || '';
    const formattedContent = tagName === 'style' ? this.formatCss(content, indent + 1) : this.indentRawText(content, indent + 1);
    return [`${'  '.repeat(indent)}<${tagName}${attributes}>`, formattedContent, `${'  '.repeat(indent)}</${tagName}>`].filter((line) => line.length > 0).join('\n');
  }

  private serializeAttributes(element: HTMLElement): string {
    return Array.from(element.attributes)
      .map((attribute) => (attribute.value ? ` ${attribute.name}="${this.escapeAttribute(attribute.value)}"` : ` ${attribute.name}`))
      .join('');
  }

  private normalizeTagName(tagName: string): string {
    return tagName === 'strike' ? 's' : tagName;
  }

  private formatCss(value: string, indent: number): string {
    const lines = (value || '')
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/;\s*/g, ';\n')
      .replace(/\s*}\s*/g, '\n}\n')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    let level = 0;

    return lines
      .map((line) => {
        if (line.startsWith('}')) {
          level = Math.max(level - 1, 0);
        }

        const formattedLine = `${'  '.repeat(indent + level)}${line}`;

        if (line.endsWith('{')) {
          level++;
        }

        return formattedLine;
      })
      .join('\n');
  }

  private indentRawText(value: string, indent: number): string {
    return (value || '')
      .split('\n')
      .map((line) => `${'  '.repeat(indent)}${line.trim()}`)
      .filter((line) => line.trim().length > 0)
      .join('\n');
  }

  private escapeHtml(value: string): string {
    return (value || '')
      .replace(/&/g, '&amp;')
      .replace(/\u00a0/g, '&nbsp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private escapeAttribute(value: string): string {
    return (value || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/\u00a0/g, '&nbsp;');
  }

  private setDraftColorFromHex(value: string): void {
    const rgb = this.parseColorToRgb(value, { r: 0, g: 0, b: 0 });
    this.setTextDraftColor(rgb);
  }

  private setDraftColorFromHsv(): void {
    this.setTextDraftColor(this.hsvToRgb(this.colorHue, this.colorSaturation, this.colorValue), false);
  }

  private setDraftBackgroundColorFromHex(value: string): void {
    const rgb = this.parseColorToRgb(value || this.selectedBackgroundColor, { r: 46, g: 125, b: 50 });
    this.setBackgroundDraftColor(rgb);
  }

  private setDraftBackgroundColorFromHsv(): void {
    this.setBackgroundDraftColor(this.hsvToRgb(this.backgroundHue, this.backgroundSaturation, this.backgroundValue), false);
  }

  private setDraftBorderColorFromHex(value: string): void {
    const rgb = this.parseColorToRgb(value || this.selectedBorderColor, { r: 170, g: 170, b: 170 });
    this.setBorderDraftColor(rgb);
  }

  private setDraftBorderColorFromHsv(): void {
    this.setBorderDraftColor(this.hsvToRgb(this.borderHue, this.borderSaturation, this.borderValue), false);
  }

  private setTextDraftColor(rgb: RgbColor, updatePicker: boolean = true): void {
    this.textColorRgb = rgb;
    this.draftTextColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    this.textColorHexInput = this.draftTextColor;

    if (updatePicker) {
      this.setHsvFromRgb(rgb.r, rgb.g, rgb.b);
    }
  }

  private setBackgroundDraftColor(rgb: RgbColor, updatePicker: boolean = true): void {
    this.backgroundColorRgb = rgb;
    this.draftBackgroundColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    this.backgroundColorHexInput = this.draftBackgroundColor;

    if (updatePicker) {
      const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
      this.backgroundHue = hsv.h;
      this.backgroundSaturation = hsv.s;
      this.backgroundValue = hsv.v;
    }
  }

  private setBorderDraftColor(rgb: RgbColor, updatePicker: boolean = true): void {
    this.borderColorRgb = rgb;
    this.draftBorderColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    this.borderColorHexInput = this.draftBorderColor;

    if (updatePicker) {
      const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
      this.borderHue = hsv.h;
      this.borderSaturation = hsv.s;
      this.borderValue = hsv.v;
    }
  }

  private setHsvFromRgb(r: number, g: number, b: number): void {
    const hsv = this.rgbToHsv(r, g, b);
    this.colorHue = hsv.h;
    this.colorSaturation = hsv.s;
    this.colorValue = hsv.v;
  }

  private rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    let hue = 0;

    if (delta !== 0) {
      if (max === red) {
        hue = 60 * (((green - blue) / delta) % 6);
      } else if (max === green) {
        hue = 60 * ((blue - red) / delta + 2);
      } else {
        hue = 60 * ((red - green) / delta + 4);
      }
    }

    return {
      h: Math.round(hue < 0 ? hue + 360 : hue),
      s: max === 0 ? 0 : Math.round((delta / max) * 100),
      v: Math.round(max * 100),
    };
  }

  private hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
    const saturation = s / 100;
    const value = v / 100;
    const chroma = value * saturation;
    const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
    const match = value - chroma;
    let red = 0;
    let green = 0;
    let blue = 0;

    if (h < 60) {
      red = chroma;
      green = x;
    } else if (h < 120) {
      red = x;
      green = chroma;
    } else if (h < 180) {
      green = chroma;
      blue = x;
    } else if (h < 240) {
      green = x;
      blue = chroma;
    } else if (h < 300) {
      red = x;
      blue = chroma;
    } else {
      red = chroma;
      blue = x;
    }

    return {
      r: Math.round((red + match) * 255),
      g: Math.round((green + match) * 255),
      b: Math.round((blue + match) * 255),
    };
  }

  private hexToRgb(value: string): { r: number; g: number; b: number } {
    const hex = (value || '#222222').replace('#', '');
    const normalizedHex =
      hex.length === 3
        ? hex
            .split('')
            .map((char) => `${char}${char}`)
            .join('')
        : hex.padEnd(6, '0').substring(0, 6);

    return {
      r: parseInt(normalizedHex.substring(0, 2), 16),
      g: parseInt(normalizedHex.substring(2, 4), 16),
      b: parseInt(normalizedHex.substring(4, 6), 16),
    };
  }

  private parseColorToRgb(value: string, fallback: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    const color = (value || '').trim();

    if (color.startsWith('#')) {
      return this.hexToRgb(color);
    }

    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      return {
        r: this.clamp(parseInt(rgbMatch[1], 10), 0, 255),
        g: this.clamp(parseInt(rgbMatch[2], 10), 0, 255),
        b: this.clamp(parseInt(rgbMatch[3], 10), 0, 255),
      };
    }

    return fallback;
  }

  private parseHexInput(value: string): string {
    const hex = (value || '').trim().replace(/^#/, '');

    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      return `#${hex
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
        .toLowerCase()}`;
    }

    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      return `#${hex.toLowerCase()}`;
    }

    return '';
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map((value) => this.clamp(value, 0, 255).toString(16).padStart(2, '0')).join('')}`;
  }

  private formatColorValue(color: { r: number; g: number; b: number }, format: 'hex' | 'rgb'): string {
    return format === 'rgb' ? `rgb(${color.r}, ${color.g}, ${color.b})` : this.rgbToHex(color.r, color.g, color.b);
  }

  private clamp(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) {
      return min;
    }

    return Math.min(max, Math.max(min, value));
  }
}
