/**
 * 文档编辑模块
 */

import { TextFormat, InsertImageOptions, EditState, SelectionRange } from '../core/types';
import type { WordViewer } from '../core/WordViewer';

export class EditorModule {
  private viewer: WordViewer;
  private isEnabled: boolean = false;
  private isDirty: boolean = false;
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private maxUndoSize: number = 50;

  constructor(viewer: WordViewer) {
    this.viewer = viewer;
  }

  /**
   * 启用编辑模式
   */
  enable(): void {
    if (this.isEnabled) return;

    const container = this.viewer.getContainer();
    const contentElement = container.querySelector('.viewer-content');
    
    if (contentElement) {
      contentElement.setAttribute('contenteditable', 'true');
      contentElement.classList.add('editable');
      
      // 监听内容变化
      contentElement.addEventListener('input', this.handleInput.bind(this));
      contentElement.addEventListener('paste', this.handlePaste.bind(this));
    }

    this.isEnabled = true;
    this.saveState();
  }

  /**
   * 禁用编辑模式
   */
  disable(): void {
    if (!this.isEnabled) return;

    const container = this.viewer.getContainer();
    const contentElement = container.querySelector('.viewer-content');
    
    if (contentElement) {
      contentElement.setAttribute('contenteditable', 'false');
      contentElement.classList.remove('editable');
    }

    this.isEnabled = false;
  }

  /**
   * 处理输入事件
   */
  private handleInput(): void {
    this.isDirty = true;
    this.saveState();
  }

  /**
   * 处理粘贴事件
   */
  private handlePaste(event: Event): void {
    const clipboardEvent = event as ClipboardEvent;
    event.preventDefault();

    const text = clipboardEvent.clipboardData?.getData('text/plain');
    if (text) {
      document.execCommand('insertText', false, text);
    }
  }

  /**
   * 插入文本
   */
  insertText(text: string, position?: number): void {
    this.ensureEnabled();

    if (position !== undefined) {
      // 在指定位置插入
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
      }
    } else {
      // 在光标位置插入
      document.execCommand('insertText', false, text);
    }

    this.isDirty = true;
    this.saveState();
  }

  /**
   * 插入图片
   */
  async insertImage(image: File | Blob, options?: InsertImageOptions): Promise<void> {
    this.ensureEnabled();

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target?.result as string;
      
      if (options?.width) {
        img.width = options.width;
      }
      if (options?.height) {
        img.height = options.height;
      }
      if (options?.alignment) {
        img.style.display = 'block';
        img.style.marginLeft = options.alignment === 'center' ? 'auto' : '0';
        img.style.marginRight = options.alignment === 'center' ? 'auto' : 
                               options.alignment === 'right' ? '0' : 'auto';
      }

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.collapse(false);
      }

      this.isDirty = true;
      this.saveState();
    };

    reader.readAsDataURL(image);
  }

  /**
   * 应用文本格式
   */
  applyFormat(format: TextFormat): void {
    this.ensureEnabled();

    if (format.bold !== undefined) {
      document.execCommand('bold', false);
    }
    if (format.italic !== undefined) {
      document.execCommand('italic', false);
    }
    if (format.underline !== undefined) {
      document.execCommand('underline', false);
    }
    if (format.strikethrough !== undefined) {
      document.execCommand('strikeThrough', false);
    }
    if (format.fontSize) {
      // execCommand 的 fontSize 使用 1-7 的数值
      const size = Math.min(7, Math.max(1, Math.round(format.fontSize / 4)));
      document.execCommand('fontSize', false, size.toString());
    }
    if (format.fontFamily) {
      document.execCommand('fontName', false, format.fontFamily);
    }
    if (format.color) {
      document.execCommand('foreColor', false, format.color);
    }
    if (format.backgroundColor) {
      document.execCommand('backColor', false, format.backgroundColor);
    }
    if (format.alignment) {
      const alignCommands = {
        left: 'justifyLeft',
        center: 'justifyCenter',
        right: 'justifyRight',
        justify: 'justifyFull',
      };
      document.execCommand(alignCommands[format.alignment], false);
    }

    this.isDirty = true;
    this.saveState();
  }

  /**
   * 获取选中文本
   */
  getSelection(): SelectionRange | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    return {
      start: range.startOffset,
      end: range.endOffset,
      text: selection.toString(),
    };
  }

  /**
   * 撤销
   */
  undo(): void {
    this.ensureEnabled();

    if (this.undoStack.length > 1) {
      const currentState = this.undoStack.pop()!;
      this.redoStack.push(currentState);
      const previousState = this.undoStack[this.undoStack.length - 1];
      this.restoreState(previousState);
    }
  }

  /**
   * 重做
   */
  redo(): void {
    this.ensureEnabled();

    if (this.redoStack.length > 0) {
      const state = this.redoStack.pop()!;
      this.undoStack.push(state);
      this.restoreState(state);
    }
  }

  /**
   * 保存状态
   */
  private saveState(): void {
    const container = this.viewer.getContainer();
    const contentElement = container.querySelector('.viewer-content');
    
    if (contentElement) {
      const state = contentElement.innerHTML;
      
      // 避免重复保存相同状态
      if (this.undoStack[this.undoStack.length - 1] !== state) {
        this.undoStack.push(state);
        
        // 限制栈大小
        if (this.undoStack.length > this.maxUndoSize) {
          this.undoStack.shift();
        }
        
        // 清空重做栈
        this.redoStack = [];
      }
    }
  }

  /**
   * 恢复状态
   */
  private restoreState(state: string): void {
    const container = this.viewer.getContainer();
    const contentElement = container.querySelector('.viewer-content');
    
    if (contentElement) {
      contentElement.innerHTML = state;
    }
  }

  /**
   * 获取编辑状态
   */
  getState(): EditState {
    return {
      isEditing: this.isEnabled,
      isDirty: this.isDirty,
      canUndo: this.undoStack.length > 1,
      canRedo: this.redoStack.length > 0,
    };
  }

  /**
   * 确保编辑器已启用
   */
  private ensureEnabled(): void {
    if (!this.isEnabled) {
      throw new Error('编辑器未启用');
    }
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    this.disable();
    this.undoStack = [];
    this.redoStack = [];
    this.isDirty = false;
  }
}


