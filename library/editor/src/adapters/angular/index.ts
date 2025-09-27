/**
 * Angular Adapter for Enhanced Rich Text Editor
 * 
 * Provides Angular components and services for the editor.
 */

import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  Injectable,
  NgModule
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { EnhancedEditor, EditorOptions, Plugin, Delta as IDelta } from '@/types';
import { EnhancedEditor as Editor } from '@/core/editor';
import { Delta } from '@/core/delta';

/**
 * Angular-specific editor options
 */
export interface AngularEditorOptions extends EditorOptions {
  // Angular-specific options can be added here
}

/**
 * Enhanced Rich Text Editor Angular Component
 */
@Component({
  selector: 'enhanced-rich-editor',
  template: `
    <div #container [class]="className" [ngStyle]="style">
      <ng-content></ng-content>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EnhancedRichEditorComponent),
      multi: true
    }
  ]
})
export class EnhancedRichEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  @Input() placeholder = '';
  @Input() readOnly = false;
  @Input() options: AngularEditorOptions = {};
  @Input() plugins: Plugin[] = [];
  @Input() className = '';
  @Input() style: { [key: string]: any } = {};

  @Output() textChange = new EventEmitter<{ delta: IDelta; oldDelta: IDelta; source: string }>();
  @Output() selectionChange = new EventEmitter<{ range: any; oldRange: any; source: string }>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();
  @Output() ready = new EventEmitter<EnhancedEditor>();

  private editor: EnhancedEditor | null = null;
  private onChange: (value: IDelta) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.initializeEditor();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: IDelta): void {
    if (this.editor && value) {
      const currentContents = this.editor.getContents();
      if (!currentContents.isEqual(value)) {
        this.editor.setContents(value, 'silent');
      }
    }
  }

  registerOnChange(fn: (value: IDelta) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editor) {
      this.editor.enable(!isDisabled);
    }
  }

  // Public methods
  getEditor(): EnhancedEditor | null {
    return this.editor;
  }

  focus(): void {
    this.editor?.focus();
  }

  blur(): void {
    this.editor?.blur();
  }

  getContents(): IDelta {
    return this.editor?.getContents() || new Delta();
  }

  setContents(delta: IDelta, source = 'api'): void {
    this.editor?.setContents(delta, source);
  }

  getText(): string {
    return this.editor?.getText() || '';
  }

  getLength(): number {
    return this.editor?.getLength() || 0;
  }

  insertText(index: number, text: string, source = 'api'): void {
    this.editor?.insertText(index, text, source);
  }

  deleteText(index: number, length: number, source = 'api'): void {
    this.editor?.deleteText(index, length, source);
  }

  formatText(index: number, length: number, format: string, value: any, source = 'api'): void {
    this.editor?.formatText(index, length, format, value, source);
  }

  getSelection(): any {
    return this.editor?.getSelection();
  }

  setSelection(range: any, source = 'api'): void {
    this.editor?.setSelection(range, source);
  }

  private initializeEditor(): void {
    if (!this.containerRef?.nativeElement) return;

    this.editor = new Editor(this.containerRef.nativeElement, {
      placeholder: this.placeholder,
      readOnly: this.readOnly,
      ...this.options
    });

    // Install plugins
    this.plugins.forEach(plugin => {
      this.editor!.addPlugin(plugin);
    });

    // Setup event listeners
    this.editor.on('text-change', (delta: IDelta, oldDelta: IDelta, source: string) => {
      this.textChange.emit({ delta, oldDelta, source });
      this.onChange(this.editor!.getContents());
    });

    this.editor.on('selection-change', (range: any, oldRange: any, source: string) => {
      this.selectionChange.emit({ range, oldRange, source });
      this.onTouched();
    });

    this.editor.on('focus', () => {
      this.focus.emit();
    });

    this.editor.on('blur', () => {
      this.blur.emit();
      this.onTouched();
    });

    this.ready.emit(this.editor);
  }
}

/**
 * Enhanced Rich Text Editor Service
 */
@Injectable({
  providedIn: 'root'
})
export class EnhancedRichEditorService {
  /**
   * Create a new editor instance
   */
  createEditor(container: HTMLElement, options?: EditorOptions): EnhancedEditor {
    return new Editor(container, options);
  }

  /**
   * Create a new Delta instance
   */
  createDelta(ops?: any[]): IDelta {
    return new Delta(ops);
  }

  /**
   * Convert HTML to Delta
   */
  htmlToDelta(html: string): IDelta {
    // TODO: Implement HTML to Delta conversion
    return new Delta();
  }

  /**
   * Convert Delta to HTML
   */
  deltaToHtml(delta: IDelta): string {
    // TODO: Implement Delta to HTML conversion
    return '';
  }

  /**
   * Convert Markdown to Delta
   */
  markdownToDelta(markdown: string): IDelta {
    // TODO: Implement Markdown to Delta conversion
    return new Delta();
  }

  /**
   * Convert Delta to Markdown
   */
  deltaToMarkdown(delta: IDelta): string {
    // TODO: Implement Delta to Markdown conversion
    return '';
  }
}

/**
 * Enhanced Rich Text Editor Module
 */
@NgModule({
  declarations: [
    EnhancedRichEditorComponent
  ],
  providers: [
    EnhancedRichEditorService
  ],
  exports: [
    EnhancedRichEditorComponent
  ]
})
export class EnhancedRichEditorModule {}

/**
 * Exports
 */
export { EnhancedRichEditorComponent, EnhancedRichEditorService, EnhancedRichEditorModule };
export type { AngularEditorOptions };

/**
 * Default export
 */
export default EnhancedRichEditorModule;
