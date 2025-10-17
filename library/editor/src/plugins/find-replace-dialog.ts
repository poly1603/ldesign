import { EditorView, ViewPlugin, Decoration, DecorationSet, ViewUpdate } from '@codemirror/view';
import { StateField, StateEffect, EditorSelection, Range } from '@codemirror/state';
import { SearchCursor } from '@codemirror/search';

// State effects for controlling the dialog
const showDialog = StateEffect.define<boolean>();
const updateQuery = StateEffect.define<string>();
const updateReplaceText = StateEffect.define<string>();
const updateOptions = StateEffect.define<SearchOptions>();

interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
}

// State field to store dialog state
const dialogState = StateField.define({
  create() {
    return {
      shown: false,
      query: '',
      replaceText: '',
      options: { caseSensitive: false, wholeWord: false, regex: false } as SearchOptions
    };
  },
  update(value, tr) {
    for (let effect of tr.effects) {
      if (effect.is(showDialog)) {
        value = { ...value, shown: effect.value };
      } else if (effect.is(updateQuery)) {
        value = { ...value, query: effect.value };
      } else if (effect.is(updateReplaceText)) {
        value = { ...value, replaceText: effect.value };
      } else if (effect.is(updateOptions)) {
        value = { ...value, options: effect.value };
      }
    }
    return value;
  }
});

// Decoration for highlighting matches
const matchHighlight = Decoration.mark({ class: 'cm-find-match' });
const currentMatchHighlight = Decoration.mark({ class: 'cm-find-match-current' });

// State field for match decorations
const matchDecorations = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    
    for (let effect of tr.effects) {
      if (effect.is(updateQuery) || effect.is(updateOptions)) {
        const state = tr.state.field(dialogState);
        decorations = buildDecorations(tr.state, state.query, state.options);
      }
    }
    
    return decorations;
  },
  provide: f => EditorView.decorations.from(f)
});

function buildDecorations(state: any, query: string, options: SearchOptions): DecorationSet {
  if (!query) return Decoration.none;
  
  const decorations: Range<Decoration>[] = [];
  const cursor = getSearchCursor(state, query, options);
  
  while (!cursor.next().done) {
    decorations.push(matchHighlight.range(cursor.value.from, cursor.value.to));
  }
  
  return Decoration.set(decorations);
}

function getSearchCursor(state: any, query: string, options: SearchOptions) {
  let searchQuery = query;
  
  if (options.regex) {
    try {
      searchQuery = query;
    } catch (e) {
      return new SearchCursor(state.doc, '', 0);
    }
  } else {
    searchQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  if (options.wholeWord) {
    searchQuery = `\\b${searchQuery}\\b`;
  }
  
  const flags = options.caseSensitive ? 'g' : 'gi';
  
  try {
    return new SearchCursor(state.doc, searchQuery, 0, undefined, flags.includes('i') ? undefined : x => x);
  } catch (e) {
    return new SearchCursor(state.doc, '', 0);
  }
}

// Dialog UI Plugin
const findReplacePlugin = ViewPlugin.fromClass(class {
  dialog: HTMLElement | null = null;
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  dialogStartX = 0;
  dialogStartY = 0;
  
  findInput: HTMLInputElement | null = null;
  replaceInput: HTMLInputElement | null = null;
  matchCount: HTMLSpanElement | null = null;
  
  constructor(public view: EditorView) {
    this.createDialog();
  }
  
  createDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'cm-find-replace-dialog';
    dialog.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      width: 400px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 16px;
      z-index: 1000;
      display: none;
      font-family: system-ui, -apple-system, sans-serif;
      cursor: move;
      user-select: none;
    `;
    
    dialog.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 14px; font-weight: 600; cursor: move;">查找和替换</h3>
        <button class="cm-dialog-close" style="border: none; background: none; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: #666;">&times;</button>
      </div>
      
      <div style="margin-bottom: 12px;">
        <input type="text" class="cm-find-input" placeholder="查找..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
        <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
          <label style="display: flex; align-items: center; gap: 4px; font-size: 12px; cursor: pointer;">
            <input type="checkbox" class="cm-case-sensitive" style="cursor: pointer;">
            <span>区分大小写</span>
          </label>
          <label style="display: flex; align-items: center; gap: 4px; font-size: 12px; cursor: pointer;">
            <input type="checkbox" class="cm-whole-word" style="cursor: pointer;">
            <span>全字匹配</span>
          </label>
          <label style="display: flex; align-items: center; gap: 4px; font-size: 12px; cursor: pointer;">
            <input type="checkbox" class="cm-regex" style="cursor: pointer;">
            <span>正则表达式</span>
          </label>
        </div>
      </div>
      
      <div style="margin-bottom: 12px;">
        <input type="text" class="cm-replace-input" placeholder="替换为..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
      </div>
      
      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        <button class="cm-find-next" style="flex: 1; padding: 8px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 4px; cursor: pointer; font-size: 13px;">下一个</button>
        <button class="cm-find-prev" style="flex: 1; padding: 8px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 4px; cursor: pointer; font-size: 13px;">上一个</button>
      </div>
      
      <div style="display: flex; gap: 8px;">
        <button class="cm-replace-one" style="flex: 1; padding: 8px; border: 1px solid #1890ff; background: #1890ff; color: white; border-radius: 4px; cursor: pointer; font-size: 13px;">替换</button>
        <button class="cm-replace-all" style="flex: 1; padding: 8px; border: 1px solid #52c41a; background: #52c41a; color: white; border-radius: 4px; cursor: pointer; font-size: 13px;">全部替换</button>
      </div>
      
      <div style="margin-top: 12px; font-size: 12px; color: #666; text-align: center;">
        <span class="cm-match-count">未找到匹配项</span>
      </div>
    `;
    
    this.dialog = dialog;
    this.findInput = dialog.querySelector('.cm-find-input');
    this.replaceInput = dialog.querySelector('.cm-replace-input');
    this.matchCount = dialog.querySelector('.cm-match-count');
    
    // Close button
    dialog.querySelector('.cm-dialog-close')?.addEventListener('click', () => {
      this.hideDialog();
    });
    
    // Find input - real-time search
    this.findInput?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      this.view.dispatch({
        effects: updateQuery.of(query)
      });
      this.updateMatchCount();
    });
    
    // Replace input
    this.replaceInput?.addEventListener('input', (e) => {
      const text = (e.target as HTMLInputElement).value;
      this.view.dispatch({
        effects: updateReplaceText.of(text)
      });
    });
    
    // Options checkboxes
    const updateOptionsFromUI = () => {
      const caseSensitive = dialog.querySelector<HTMLInputElement>('.cm-case-sensitive')?.checked || false;
      const wholeWord = dialog.querySelector<HTMLInputElement>('.cm-whole-word')?.checked || false;
      const regex = dialog.querySelector<HTMLInputElement>('.cm-regex')?.checked || false;
      
      this.view.dispatch({
        effects: updateOptions.of({ caseSensitive, wholeWord, regex })
      });
      this.updateMatchCount();
    };
    
    dialog.querySelector('.cm-case-sensitive')?.addEventListener('change', updateOptionsFromUI);
    dialog.querySelector('.cm-whole-word')?.addEventListener('change', updateOptionsFromUI);
    dialog.querySelector('.cm-regex')?.addEventListener('change', updateOptionsFromUI);
    
    // Navigation buttons
    dialog.querySelector('.cm-find-next')?.addEventListener('click', () => this.findNext());
    dialog.querySelector('.cm-find-prev')?.addEventListener('click', () => this.findPrev());
    
    // Replace buttons
    dialog.querySelector('.cm-replace-one')?.addEventListener('click', () => this.replaceOne());
    dialog.querySelector('.cm-replace-all')?.addEventListener('click', () => this.replaceAll());
    
    // Dragging functionality
    const header = dialog.querySelector('h3');
    header?.addEventListener('mousedown', (e) => this.startDrag(e));
    dialog.addEventListener('mousedown', (e) => {
      if (e.target === dialog) {
        this.startDrag(e);
      }
    });
    
    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.stopDrag());
    
    // Keyboard shortcuts
    this.findInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          this.findPrev();
        } else {
          this.findNext();
        }
        e.preventDefault();
      } else if (e.key === 'Escape') {
        this.hideDialog();
        e.preventDefault();
      }
    });
    
    document.body.appendChild(dialog);
  }
  
  startDrag(e: MouseEvent) {
    if (!this.dialog) return;
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    
    const rect = this.dialog.getBoundingClientRect();
    this.dialogStartX = rect.left;
    this.dialogStartY = rect.top;
    
    this.dialog.style.cursor = 'grabbing';
    e.preventDefault();
  }
  
  onDrag(e: MouseEvent) {
    if (!this.isDragging || !this.dialog) return;
    
    const deltaX = e.clientX - this.dragStartX;
    const deltaY = e.clientY - this.dragStartY;
    
    this.dialog.style.left = `${this.dialogStartX + deltaX}px`;
    this.dialog.style.top = `${this.dialogStartY + deltaY}px`;
    this.dialog.style.right = 'auto';
  }
  
  stopDrag() {
    if (this.isDragging && this.dialog) {
      this.isDragging = false;
      this.dialog.style.cursor = 'move';
    }
  }
  
  showDialog() {
    if (this.dialog) {
      this.dialog.style.display = 'block';
      this.findInput?.focus();
      this.findInput?.select();
      this.updateMatchCount();
    }
  }
  
  hideDialog() {
    if (this.dialog) {
      this.dialog.style.display = 'none';
    }
    this.view.dispatch({
      effects: [showDialog.of(false), updateQuery.of('')]
    });
    this.view.focus();
  }
  
  updateMatchCount() {
    if (!this.matchCount || !this.findInput) return;
    
    const state = this.view.state.field(dialogState);
    const query = state.query;
    
    if (!query) {
      this.matchCount.textContent = '未找到匹配项';
      return;
    }
    
    const cursor = getSearchCursor(this.view.state, query, state.options);
    let count = 0;
    
    while (!cursor.next().done) {
      count++;
    }
    
    this.matchCount.textContent = count > 0 ? `找到 ${count} 个匹配项` : '未找到匹配项';
  }
  
  findNext() {
    const state = this.view.state.field(dialogState);
    if (!state.query) return;
    
    const cursor = getSearchCursor(this.view.state, state.query, state.options);
    const from = this.view.state.selection.main.to;
    
    cursor.next();
    while (!cursor.next().done) {
      if (cursor.value.from >= from) {
        this.view.dispatch({
          selection: EditorSelection.single(cursor.value.from, cursor.value.to),
          scrollIntoView: true
        });
        return;
      }
    }
    
    // Wrap around to beginning
    const newCursor = getSearchCursor(this.view.state, state.query, state.options);
    if (!newCursor.next().done) {
      this.view.dispatch({
        selection: EditorSelection.single(newCursor.value.from, newCursor.value.to),
        scrollIntoView: true
      });
    }
  }
  
  findPrev() {
    const state = this.view.state.field(dialogState);
    if (!state.query) return;
    
    const cursor = getSearchCursor(this.view.state, state.query, state.options);
    const from = this.view.state.selection.main.from;
    
    let lastMatch: { from: number, to: number } | null = null;
    let beforeMatch: { from: number, to: number } | null = null;
    
    while (!cursor.next().done) {
      if (cursor.value.from < from) {
        beforeMatch = { from: cursor.value.from, to: cursor.value.to };
      }
      lastMatch = { from: cursor.value.from, to: cursor.value.to };
    }
    
    const target = beforeMatch || lastMatch;
    if (target) {
      this.view.dispatch({
        selection: EditorSelection.single(target.from, target.to),
        scrollIntoView: true
      });
    }
  }
  
  replaceOne() {
    const state = this.view.state.field(dialogState);
    if (!state.query) return;
    
    const selection = this.view.state.selection.main;
    const selectedText = this.view.state.sliceDoc(selection.from, selection.to);
    
    // Check if current selection matches the search
    const cursor = getSearchCursor(this.view.state, state.query, state.options);
    let matches = false;
    
    while (!cursor.next().done) {
      if (cursor.value.from === selection.from && cursor.value.to === selection.to) {
        matches = true;
        break;
      }
    }
    
    if (matches) {
      this.view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: state.replaceText },
        selection: EditorSelection.cursor(selection.from + state.replaceText.length)
      });
      
      // Move to next match
      setTimeout(() => this.findNext(), 10);
    } else {
      // If no match selected, find next
      this.findNext();
    }
    
    this.updateMatchCount();
  }
  
  replaceAll() {
    const state = this.view.state.field(dialogState);
    if (!state.query) return;
    
    const cursor = getSearchCursor(this.view.state, state.query, state.options);
    const changes: any[] = [];
    
    while (!cursor.next().done) {
      changes.push({
        from: cursor.value.from,
        to: cursor.value.to,
        insert: state.replaceText
      });
    }
    
    if (changes.length > 0) {
      this.view.dispatch({ changes });
      this.matchCount!.textContent = `已替换 ${changes.length} 处`;
    }
  }
  
  update(update: ViewUpdate) {
    const state = update.state.field(dialogState);
    
    if (state.shown && this.dialog?.style.display === 'none') {
      this.showDialog();
    } else if (!state.shown && this.dialog?.style.display === 'block') {
      this.hideDialog();
    }
  }
  
  destroy() {
    this.dialog?.remove();
  }
});

// Export function to open dialog
export function openFindReplaceDialog(view: EditorView) {
  view.dispatch({
    effects: showDialog.of(true)
  });
}

// Export the extension
export function findReplaceDialogExtension() {
  return [
    dialogState,
    matchDecorations,
    findReplacePlugin,
    EditorView.baseTheme({
      '.cm-find-match': {
        backgroundColor: '#ffeb3b',
        outline: '1px solid #fbc02d'
      },
      '.cm-find-match-current': {
        backgroundColor: '#ff9800',
        outline: '1px solid #f57c00'
      }
    })
  ];
}
