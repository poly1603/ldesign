import { Component, Prop, State, Event, EventEmitter, Watch, Method, h, Host, Element } from '@stencil/core';
import { Size } from '../../types';
import type { MentionItem, MentionTriggerConfig, MentionEntity, MentionModel, MentionSegment } from '../../types';

/**
 * ldesign-mention 提及组件（contenteditable 版本）
 * - 使用可编辑 div 实现富文本输入，支持在文本中高亮渲染提及 token
 * - 候选浮层定位于光标位置（通过隐藏锚点 + ldesign-popup 定位）
 */
@Component({ tag: 'ldesign-mention', styleUrl: 'mention.less', shadow: false })
export class LdesignMention {
  @Element() el!: HTMLElement;

  private editableEl?: HTMLElement; // contenteditable 容器
  private listEl?: HTMLElement;     // 候选列表 UL
  private anchorEl?: HTMLSpanElement; // 光标锚点（作为 popup 触发器）

  // 触发开始位置（从 @ 字符起），使用 Range 表示
  private triggerCtx: { range: Range; char: string } | null = null;
  private currentTriggerChar: string = '@';

  /** 当前值（受控，文本值，包含渲染后的 @name 文本） */
  @Prop({ mutable: true }) value: string = '';
  /** 默认值（非受控） */
  @Prop() defaultValue?: string;

  /** 占位文本 */
  @Prop() placeholder?: string;
  /** 是否禁用 */
  @Prop() disabled: boolean = false;
  /** 是否只读 */
  @Prop() readonly: boolean = false;
  /** 尺寸（影响样式） */
  @Prop() size: Size = 'medium';

  /** 触发字符（如 @ 或 #），兼容旧属性 */
  @Prop() trigger: string = '@';
  /** 多个触发字符 */
  @Prop() triggers?: string | string[];
  /** 触发符个性化配置（JS 对象或 JSON 字符串） */
  @Prop() triggerConfigs?: string | MentionTriggerConfig[];
  /** 候选项（数组或 JSON 字符串） */
  @Prop() options: string | MentionItem[] = [];
  /** 自定义过滤函数（返回 true 表示保留） */
  @Prop() filterOption?: (input: string, option: MentionItem) => boolean;
  /** 加载中（用于异步搜索） */
  @Prop() loading: boolean = false;
  /** 列表最大高度 */
  @Prop() maxHeight: number = 240;
  /** 自动聚焦 */
  @Prop() autofocus: boolean = false;
  /** 受控模式（为 true 时不在内部修改 value） */
  @Prop() controlled: boolean = false;
  /** 默认 token 外观 */
  @Prop() tokenType: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  /** token 是否默认可关闭 */
  @Prop() closable: boolean = true;
  /** 是否在加载时将文本中的 @xxx/#xxx 解析为标签（仅在未提供 model/valueModel 时生效） */
  @Prop() parseOnInit?: boolean;
  /** 解析策略：label（直接转换）/options（仅命中候选时转换） */
  @Prop() parseStrategy: 'label' | 'options' = 'label';

  /** 是否多行模式。多行模式下允许回车换行，并可按 rows/maxRows 控制显示高度 */
  @Prop() multiline: boolean = false;
  /** 初始可见行数（用于计算最小高度） */
  @Prop() rows: number = 3;
  /** 最大可见行数（超过后出现滚动条）；不设置则不限制 */
  @Prop() maxRows?: number;
  /** 是否允许用户手动拖拽调整高度（vertical） */
  @Prop() resizable: boolean = true;

  /** 浮层挂载到：self|body|closest-popup（透传给 popup） */
  @Prop() appendTo: 'self' | 'body' | 'closest-popup' = 'body';

  /** 搜索事件（每次触发字符后的输入变化都会触发） */
  @Event() ldesignSearch!: EventEmitter<{ value: string; trigger: string }>;
  /** 选择事件（选中候选项时触发） */
  @Event() ldesignSelect!: EventEmitter<{ value: MentionItem; trigger: string }>;
  /** 标签移除事件 */
  @Event() ldesignRemove!: EventEmitter<{ value: string | number; label: string; trigger: string }>;
  /** 内容变化事件（返回纯文本值：等同于 editable.innerText） */
  @Event() ldesignChange!: EventEmitter<string>;
  /** 结构化值变化事件 */
  @Event() ldesignValueChange!: EventEmitter<{ text: string; mentions: MentionEntity[]; model: MentionSegment[] }>;
  /** 获得/失去焦点 */
  @Event() ldesignFocus!: EventEmitter<FocusEvent>;
  @Event() ldesignBlur!: EventEmitter<FocusEvent>;

  @State() parsedOptions: MentionItem[] = [];
  @State() parsedTriggerConfigs: MentionTriggerConfig[] = [];
  @State() open: boolean = false;
  @State() highlightIndex: number = -1;
  @State() searchText: string = '';

  private editableMinH = 0; // px
  private editableMaxH: number | null = null; // px

  /** 结构化初始化（分段） */
  @Prop() model?: string | MentionSegment[];
  /** 结构化初始化（模型） */
  @Prop() valueModel?: string | MentionModel;
  /** 事件/受控值格式（默认 model） */
  @Prop() valueFormat: 'model' | 'segments' | 'text' = 'model';

  @Watch('options') 
  watchOptions(val: string | MentionItem[], oldVal?: string | MentionItem[]) { 
    
    this.parsedOptions = this.parseOptions(val);
    
    // 如果当前有打开的弹窗，刷新选项列表
    if (this.open && this.triggerCtx) {
      this.openIfNeeded(this.searchText);
    }
  }
  @Watch('triggerConfigs') watchTriggerConfigs(val?: string | MentionTriggerConfig[]) {
    this.parsedTriggerConfigs = this.parseTriggerConfigs(val);
  }
  @Watch('value') watchValue(v?: string) {
    if (this.controlled && this.editableEl && typeof v === 'string') {
      this.setEditableText(v);
    }
  }
  @Watch('model') watchModel(v?: string | MentionSegment[]) {
    if (!this.editableEl) return;
    const seg = this.normalizeSegments(v);
    if (seg) { this.renderFromSegments(seg); this.syncValueFromEditable(); }
  }
  @Watch('valueModel') watchValueModel(v?: string | MentionModel) {
    if (!this.editableEl) return;
    const m = this.normalizeModel(v);
    if (m) { this.renderFromModel(m); this.syncValueFromEditable(); }
  }

  componentWillLoad() {
    this.parsedOptions = this.parseOptions(this.options);
    this.parsedTriggerConfigs = this.parseTriggerConfigs(this.triggerConfigs as any);
    
    // valueFormat 已作为 @Prop，保持默认或外部传值
    if ((this.value == null || this.value === '') && this.defaultValue) this.value = this.defaultValue;
  }

  componentDidLoad() {
    // 初始化 editable 文本
    if (this.editableEl) {
      // 优先按结构化初始化
      const seg = this.normalizeSegments(this.model);
      const mod = this.normalizeModel(this.valueModel);
      if (seg) {
        this.renderFromSegments(seg);
        this.syncValueFromEditable();
      } else if (mod) {
        this.renderFromModel(mod);
        this.syncValueFromEditable();
      } else {
        this.setEditableText(this.value || '');
      }
      // 默认：若初始 value 中包含触发符，则自动解析；显式指定 parseOnInit=false 时不解析
      // 注意：如果已经通过 model/valueModel 进行了结构化渲染，则不应再次触发 parse
      const usedStructured = !!seg || !!mod;
      const autoDetect = !!(this.value && this.containsTrigger(this.value));
      const opt = this.parseOnInit;
      const shouldParse = (opt === true) || (opt === undefined && autoDetect && !usedStructured);
      if (shouldParse) {
        this.parseTextToTokens();
        this.syncValueFromEditable();
        // 若首帧仍未解析（可能由于插入时机/服务端注水），下一帧再尝试一次
        requestAnimationFrame(() => {
          if (this.editableEl && !this.editableEl.querySelector('.ldesign-mention__token') && this.containsTrigger(this.editableEl.innerText || '')) {
            this.parseTextToTokens();
            this.syncValueFromEditable();
          }
        });
      }
    }

    // 计算高度
    this.computeEditableHeights();

    if (this.autofocus) this.editableEl?.focus();

    // 监听原生 beforeinput（Stencil JSX 未内置类型，需要手动监听）
    this.editableEl?.addEventListener('beforeinput', this.onBeforeInput as any);

    // 监听全局 selection 变化，动态更新锚点位置
    document.addEventListener('selectionchange', this.onSelectionChange);
  }

  disconnectedCallback() {
    document.removeEventListener('selectionchange', this.onSelectionChange);
    // 清理 beforeinput 监听
    this.editableEl?.removeEventListener('beforeinput', this.onBeforeInput as any);
  }

  @Watch('rows')
  @Watch('maxRows')
  @Watch('resizable')
  @Watch('multiline')
  protected onLayoutPropsChanged() { this.computeEditableHeights(); }

  private parsePx(v: string | null | undefined) {
    const n = parseFloat(v || '0');
    return isNaN(n) ? 0 : n;
  }

  private computeEditableHeights() {
    const el = this.editableEl; if (!el) return;
    try {
      const cs = window.getComputedStyle(el);
      let lh = parseFloat(cs.lineHeight);
      if (!lh || isNaN(lh)) {
        const fs = parseFloat(cs.fontSize) || 14;
        lh = Math.round(fs * 1.4);
      }
      const padTop = this.parsePx(cs.paddingTop);
      const padBot = this.parsePx(cs.paddingBottom);
      const rows = Math.max(1, Number((this.multiline ? this.rows : 1) || 1));
      const minH = Math.round(lh * rows + padTop + padBot);
      this.editableMinH = minH;
      if (this.multiline && this.maxRows && this.maxRows > 0) {
        const maxH = Math.round(lh * Math.max(rows, this.maxRows) + padTop + padBot);
        this.editableMaxH = maxH;
      } else {
        this.editableMaxH = null;
      }
      // 应用到元素行内样式
      el.style.minHeight = `${this.editableMinH}px`;
      if (this.editableMaxH != null) {
        el.style.maxHeight = `${this.editableMaxH}px`;
        el.style.overflowY = 'auto';
      } else {
        el.style.maxHeight = '';
        el.style.overflowY = '';
      }
      el.style.resize = this.resizable ? 'vertical' : 'none';
    } catch {}
  }

  // 公共方法：手动设置选项（解决属性监听问题）
  @Method()
  async setOptions(options: MentionItem[]) {
    
    this.options = options;
    this.parsedOptions = this.parseOptions(options);
    // 如果当前有打开的弹窗，刷新选项列表
    if (this.open && this.triggerCtx) {
      this.openIfNeeded(this.searchText);
    }
  }

  private parseOptions(val: string | MentionItem[]): MentionItem[] {
    if (typeof val === 'string') { try { const arr = JSON.parse(val); return Array.isArray(arr) ? arr : []; } catch { return []; } }
    return Array.isArray(val) ? val : [];
  }
  private normalizeSegments(v?: string | MentionSegment[]): MentionSegment[] | null {
    if (!v) return null;
    if (typeof v === 'string') { try { const arr = JSON.parse(v); return Array.isArray(arr) ? arr as MentionSegment[] : null; } catch { return null; } }
    return Array.isArray(v) ? v as MentionSegment[] : null;
  }
  private normalizeModel(v?: string | MentionModel): MentionModel | null {
    if (!v) return null; if (typeof v === 'string') { try { return JSON.parse(v); } catch { return null; } } return v as MentionModel;
  }
  private parseTriggerConfigs(val?: string | MentionTriggerConfig[]): MentionTriggerConfig[] {
    if (!val) return [];
    try {
      const v = typeof val === 'string' ? JSON.parse(val) : val;
      const arr = Array.isArray(v) ? v : [];
      return arr.filter(Boolean) as MentionTriggerConfig[];
    } catch { return []; }
  }

  private parseTriggersInput(val?: string | string[]): string[] {
    if (val == null) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    const s = String(val).trim();
    // JSON 数组
    if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('"') && s.endsWith('"'))) {
      try { const arr = JSON.parse(s); return Array.isArray(arr) ? arr : [s]; } catch { /* fallthrough */ }
    }
    // 逗号分隔
    if (s.includes(',')) return s.split(',').map(x => x.trim()).filter(Boolean);
    // 单个字符或单个触发符
    return [s];
  }
  private getTriggers(): string[] {
    const fromProp = this.parseTriggersInput(this.triggers);
    const t = fromProp.length ? fromProp : [this.trigger];
    return t.filter(ch => typeof ch === 'string' && ch.length > 0);
  }
  private isTriggerChar(ch: string) { return this.getTriggers().includes(ch); }
  private containsTrigger(text: string): boolean { return this.getTriggers().some(ch => (text || '').includes(ch)); }
  private getTriggerConfig(ch: string): MentionTriggerConfig | undefined {
    return this.parsedTriggerConfigs.find(c => c.char === ch);
  }
  private getOptionsFor(ch: string): MentionItem[] {
    const cfg = this.getTriggerConfig(ch);
    if (cfg && Array.isArray(cfg.options) && cfg.options.length) return cfg.options;
    return this.parsedOptions;
  }
  private getTokenTypeFor(ch: string): any {
    const cfg = this.getTriggerConfig(ch);
    return cfg?.tokenType || this.tokenType || 'default';
  }
  private getClosableFor(ch: string): boolean {
    const cfg = this.getTriggerConfig(ch);
    return typeof cfg?.closable === 'boolean' ? cfg!.closable! : this.closable === true;
  }

  // 将 editable 的可见文本同步到 value 并抛出事件
  private syncValueFromEditable() {
    const text = this.editableEl?.innerText || '';
    const { mentions, segments } = this.computeModelFromDom();
    // 结构化事件
    this.ldesignValueChange.emit({ text, mentions, model: segments });
    // 兼容字符串事件
    if (this.controlled) {
      this.ldesignChange.emit(text);
    } else {
      this.value = text;
      this.ldesignChange.emit(this.value);
    }
  }

  private computeModelFromDom(): { mentions: MentionEntity[]; segments: MentionSegment[] } {
    const segs: MentionSegment[] = [];
    const ents: MentionEntity[] = [];
    let pos = 0;
    const root = this.editableEl;
    if (!root) return { mentions: [], segments: [] };
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    function isToken(el: any) { return el && el.classList && el.classList.contains('ldesign-mention__token'); }
    const nodes: Node[] = [];
    let n: Node | null = root.firstChild;
    while (n) { nodes.push(n); n = n.nextSibling; }
    for (const node of nodes) {
      if (node.nodeType === 3) {
        let t = (node as Text).nodeValue || '';
        // 过滤零宽空格，用于确保 caret 可落位
        t = t.replace(/\u200b/g, '');
        if (t) { segs.push({ type: 'text', text: t }); pos += t.length; }
      } else if (isToken(node)) {
        const el = node as HTMLElement;
        const trigger = el.getAttribute('data-trigger') || '@';
        const label = el.getAttribute('data-label') || '';
        const value = (el.getAttribute('data-value') || label) as any;
        segs.push({ type: 'mention', trigger, label, value });
        ents.push({ value, label, trigger, start: pos, length: (trigger + label).length });
        pos += (trigger + label).length;
      } else {
        // 非 token 的其它元素（容错）
        let t = (node as HTMLElement).innerText || '';
        t = t.replace(/\u200b/g, '');
        if (t) { segs.push({ type: 'text', text: t }); pos += t.length; }
      }
    }
    return { mentions: ents, segments: segs };
  }

  private setEditableText(text: string) {
    if (!this.editableEl) return;
    // 使用 textContent 而不是 innerText，确保创建单个文本节点
    // 这样光标位置更容易被正确识别
    this.editableEl.textContent = text;
  }

  private renderFromSegments(segments: MentionSegment[]) {
    if (!this.editableEl) return;
    
    // 清空当前内容
    while (this.editableEl.firstChild) {
      this.editableEl.removeChild(this.editableEl.firstChild);
    }
    
    // 逐个添加段落
    for (let i = 0; i < segments.length; i++) {
      const seg: any = segments[i] as any;
      
      if (seg.type === 'mention') {
        const m = seg as { trigger: string; label: string; value: string | number; extra?: any };
        const token = this.buildTokenNode({ value: m.value, label: m.label, data: m.extra } as any, m.trigger);
        
        // 直接插入 token 节点
        this.editableEl.appendChild(token);
        
        // 检查是否需要在 token 后添加分隔
        // 1. 如果下一段是文本且不以空格开头，添加空格
        // 2. 如果没有下一段（token 是最后一个），也添加空格便于继续输入
        const next = segments[i + 1] as any;
        const needSpace = !next || (next.type === 'text' && !next.text?.startsWith(' '));
        
        if (needSpace) {
          // 插入一个普通空格作为分隔
          const spaceNode = document.createTextNode(' ');
          this.editableEl.appendChild(spaceNode);
        }
      } else if (seg.type === 'text' && seg.text) {
        // 添加文本节点
        const textNode = document.createTextNode(seg.text);
        this.editableEl.appendChild(textNode);
      }
    }
  }

  private renderFromModel(model: MentionModel) {
    const seg: MentionSegment[] = [];
    const sorted = [...model.mentions].sort((a, b) => a.start - b.start);
    let idx = 0;
    for (const m of sorted) {
      const before = model.text.slice(idx, m.start);
      if (before) seg.push({ type: 'text', text: before });
      seg.push({ type: 'mention', trigger: m.trigger, label: m.label, value: m.value, extra: m.extra });
      idx = m.start + m.length;
    }
    const tail = model.text.slice(idx);
    if (tail) seg.push({ type: 'text', text: tail });
    this.renderFromSegments(seg);
  }

  private escapeRegex(ch: string) { return ch.replace(/[\-\/\\^$*+?.()|[\]{}]/g, '\\$&'); }
  private createTokenNodeFromParts(ch: string, label: string): HTMLElement | null {
    const opts = this.getOptionsFor(ch);
    let item = opts.find(o => o.label === label);
    if (!item && this.parseStrategy === 'options') return null;
    if (!item) item = { value: label, label, tagType: this.getTokenTypeFor(ch), closable: this.getClosableFor(ch) } as any;
    return this.buildTokenNode(item as MentionItem, ch);
  }
  private buildTokenNode(it: MentionItem, ch: string): HTMLElement {
    const token = document.createElement('span');
    const type = it.tagType || this.getTokenTypeFor(ch) || 'default';
    const ro = this.disabled || this.readonly;
    const isClosable = ro ? false : (typeof it.closable === 'boolean' ? it.closable : this.getClosableFor(ch)) === true;
    
    // 设置类名和样式
    token.className = `ldesign-mention__token ldesign-mention__token--${type}`;
    if ((it as any).className) token.classList.add((it as any).className);
    if ((it as any).style) token.setAttribute('style', (it as any).style);
    
    // 设置数据属性
    token.setAttribute('data-value', String(it.value));
    token.setAttribute('data-label', it.label);
    token.setAttribute('data-trigger', ch);
    token.setAttribute('data-closable', String(isClosable));
    
    // 关键：确保 token 不可编辑，防止内部内容被修改
    token.setAttribute('contenteditable', 'false');
    // 设置为 inline-block 确保不会与文本节点合并
    token.style.display = 'inline-block';
    token.style.verticalAlign = 'baseline';

    // 创建内部文本节点
    const textSpan = document.createElement('span');
    textSpan.className = 'ldesign-mention__token-text';
    textSpan.textContent = `${ch}${it.label}`;
    token.appendChild(textSpan);

    // 添加关闭按钮（如果可关闭）
    if (isClosable) {
      const close = document.createElement('span');
      close.className = 'ldesign-mention__token-close';
      close.textContent = '×';
      token.appendChild(close);
    }
    
    return token;
  }

  private parseTextToTokens() {
    if (!this.editableEl) return;
    const triggers = this.getTriggers();
    if (!triggers.length) return;

    // 基于“纯文本 -> 分段”的方式重新渲染，避免在 DOM 中就地替换导致的包裹/拼接问题
    const charClass = triggers.map(ch => this.escapeRegex(ch)).join('');
    const re = new RegExp(`([${charClass}])([^\s]+)`, 'g');

    const raw = (this.editableEl.textContent || '').replace(/\u200b/g, '');
    const segs: MentionSegment[] = [];

    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw))) {
      const start = m.index;
      const end = start + m[0].length;
      // 追加前置纯文本
      const before = raw.slice(last, start);
      if (before) segs.push({ type: 'text', text: before } as any);

      const ch = m[1];
      const label = m[2];

      // 邮箱保护：若命中形如 foo@bar.com 的 @，忽略为普通文本
      if (ch === '@') {
        const prev = start > 0 ? raw[start - 1] : '';
        const next = end < raw.length ? raw[end] : '';
        const likelyEmail = /[A-Za-z0-9._-]/.test(prev) && /[A-Za-z0-9]/.test(next);
        if (likelyEmail) {
          segs.push({ type: 'text', text: m[0] } as any);
          last = end;
          continue;
        }
      }

      // 解析策略：options 时，仅当在数据源中命中同名 label 才转换
      if (this.parseStrategy === 'options') {
        const opts = this.getOptionsFor(ch);
        const hit = opts.find(o => o.label === label);
        if (!hit) {
          segs.push({ type: 'text', text: m[0] } as any);
          last = end;
          continue;
        }
        segs.push({ type: 'mention', trigger: ch, label: hit.label, value: hit.value } as any);
      } else {
        // label 策略：直接转换
        segs.push({ type: 'mention', trigger: ch, label, value: label } as any);
      }

      last = end;
    }

    // 追加尾部文本
    const tail = raw.slice(last);
    if (tail) segs.push({ type: 'text', text: tail } as any);

    this.renderFromSegments(segs);
  }

  // ——— Editable 交互 ———
  private onFocus = (e: FocusEvent) => { this.ldesignFocus.emit(e); };
  private onBlur = (e: FocusEvent) => { this.ldesignBlur.emit(e); /* 不立刻关闭，交给 popup outside 处理 */ };

  private isBoundaryChar(ch: string) {
    // 仅将空白视为“硬边界”，以允许中文/标点前直接触发 @
    return /\s/.test(ch);
  }

  // 从当前光标位置向后回溯，查找最近的触发点（不穿越 token）
  private findTriggerFromCaret(): { range: Range; query: string; char: string } | null {
    const root = this.editableEl; if (!root) return null;
    const sel = window.getSelection(); if (!sel || !sel.isCollapsed || sel.rangeCount === 0) return null;
    const caret = sel.getRangeAt(0);
    if (!root.contains(caret.startContainer)) return null;

    let node: Node | null = caret.startContainer;
    let offset: number = caret.startOffset;
    let query = '';

    

    // 创建 walker 以遍历文本节点
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    
    // 如果当前不是文本节点，找到光标位置之前的最后一个文本节点
    if (node.nodeType !== 3) {
      
      
      // 处理特殊情况：光标在元素末尾（常见于初始值设置后）
      if (node === root) {
        // 收集所有文本节点
        const textNodes: Text[] = [];
        walker.currentNode = root;
        let textNode: Node | null;
        while ((textNode = walker.nextNode())) {
          const parent = textNode.parentElement;
          // 跳过 token 内部的文本节点
          if (!parent || !parent.closest('.ldesign-mention__token')) {
            textNodes.push(textNode as Text);
          }
        }
        
        
        
        if (textNodes.length > 0) {
          // 根据 offset 找到对应的文本节点
          if (offset === node.childNodes.length || offset === 0) {
            // 光标在最后或最前
            const lastTextNode = textNodes[textNodes.length - 1];
            if (lastTextNode) {
              node = lastTextNode;
              offset = lastTextNode.textContent?.length || 0;
              
            }
          } else if (offset > 0 && offset <= node.childNodes.length) {
            // 光标在某个子节点位置
            const childBefore = node.childNodes[offset - 1];
            // 如果前面的节点就是文本节点，直接使用
            if (childBefore && childBefore.nodeType === 3) {
              node = childBefore;
              offset = childBefore.textContent?.length || 0;
              
            } else {
              // 查找该位置之前的最后一个文本节点
              for (let i = textNodes.length - 1; i >= 0; i--) {
                const tn = textNodes[i];
                if (childBefore && (childBefore === tn || childBefore.contains(tn))) {
                  node = tn;
                  offset = tn.textContent?.length || 0;
                  
                  break;
                }
              }
            }
          }
        }
      }
      
      // 如果还不是文本节点，无法处理
      if (node.nodeType !== 3) {
        
        return null;
      }
    }
    
    // 现在 node 应该是一个文本节点
    walker.currentNode = node;

    

    let examineNode = node as Text;
    let withinToken = (n: Node | null) => !!(n && (n as HTMLElement).closest && (n as HTMLElement).closest('.ldesign-mention__token'));

    // 累积从多个文本节点的查询字符串
    let accumulatedQuery = '';

    while (examineNode) {
      if (withinToken(examineNode)) {
        
        return null; // 光标前为 token，则不激活
      }
      
      const text = examineNode.nodeValue || '';
      const end = examineNode === node ? offset : text.length;
      
      
      
      for (let i = end - 1; i >= 0; i--) {
        const ch = text[i];
        
        if (this.isTriggerChar(ch)) {
          const prev = i > 0 ? text[i - 1] : '';
          const next = i + 1 < text.length ? text[i + 1] : '';
          let skip = false;
          
          if (ch === '@') {
            // 简单的邮箱保护：字母/数字/._- 紧挨 @ 且后面也为字母数字时，视为邮箱并跳过
            const likelyEmail = /[A-Za-z0-9._-]/.test(prev) && /[A-Za-z0-9]/.test(next);
            if (likelyEmail) {
              
              skip = true;
            }
          }
          
          if (!skip) {
            // 命中触发点，收集从触发符后面的查询字符串
            let query = '';
            if (examineNode === node) {
              // 当前节点内，从触发符后到光标位置
              query = text.slice(i + 1, offset);
            } else {
              // 从触发符后到节点结束
              query = text.slice(i + 1);
            }
            // 加上之前累积的跨节点查询字符串
            query = query + accumulatedQuery;
            
            const r = document.createRange();
            r.setStart(examineNode, i);
            r.setEnd(caret.endContainer, caret.endOffset);
            
            
            return { range: r, query, char: ch };
          }
          // 否则继续向左查找更早的触发字符
          continue;
        }
        
        if (/\s/.test(ch)) {
          // 在找到 @ 前遇到空白，失败
          
          return null;
        }
        
        // 累积查询字符串（从右向左）- 只在不是当前节点的最后位置时累积
        if (examineNode !== node || i < offset - 1) {
          accumulatedQuery = ch + accumulatedQuery;
        }
      }
      
      // 如果这不是起始节点，累积整个节点的文本到查询字符串
      if (examineNode !== node) {
        // 已经在循环中累积了
      }
      
      const prevText = walker.previousNode() as Text | null;
      if (!prevText) {
        
        break;
      }
      
      // 切换到前一个文本节点，累积其所有内容
      examineNode = prevText;
    }
    
    
    return null;
  }

  private openIfNeeded(q: string) {
    const list = this.getFilteredOptions(q);
    this.highlightIndex = list.length ? 0 : -1;
    this.open = !!(this.loading || list.length);
    
  }

  private getFilteredOptions(q: string): MentionItem[] {
    const ch = this.currentTriggerChar || this.getTriggers()[0] || '@';
    const src = this.getOptionsFor(ch);
    
    if (!q) return src.filter(o => !o.disabled);
    const lower = q.toLowerCase();
    return src.filter(o => !o.disabled && (this.filterOption ? this.filterOption(q, o) : (o.label?.toLowerCase().includes(lower) || String(o.value).toLowerCase().includes(lower))));
  }

  private updateAnchorPosition(preferStart = false) {
    if (!this.anchorEl || !this.editableEl) return;
    const sel = window.getSelection(); if (!sel || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0).cloneRange();
    // 对于光标处的空 rect，使用零宽度占位符测量
    let rect = r.getBoundingClientRect();
    if (!rect || (!rect.width && !rect.height)) {
      const span = document.createElement('span');
      span.textContent = '\u200b'; // 零宽字符
      r.insertNode(span);
      rect = span.getBoundingClientRect();
      const parent = span.parentNode as Node;
      span.remove();
      // 恢复光标
      const s = window.getSelection();
      if (s) { s.removeAllRanges(); s.addRange(r); }
    }
    // 将锚点定位到 caret 左下角（或上方由 popup placement 控制）
    this.anchorEl.style.position = 'fixed';
    this.anchorEl.style.left = `${Math.round(rect.left)}px`;
    this.anchorEl.style.top = `${Math.round(rect.bottom)}px`;
    this.anchorEl.style.width = '0px';
    this.anchorEl.style.height = '0px';
    this.anchorEl.style.pointerEvents = 'none';
  }

  private onSelectionChange = () => {
    if (!this.editableEl) return;
    const sel = window.getSelection(); if (!sel || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0);
    if (!this.editableEl.contains(r.startContainer)) return;
    this.updateAnchorPosition();

    // 若当前存在触发状态，检查是否仍然在触发范围后方
    if (this.triggerCtx) {
      try {
        const cmpStart = r.compareBoundaryPoints(Range.START_TO_START, this.triggerCtx.range);
        if (cmpStart < 0 || !sel.isCollapsed) {
          // 光标已移到 @ 前/或非折叠，取消触发
          this.triggerCtx = null;
          this.open = false;
          this.searchText = '';
        } else {
          // 更新查询串
          const temp = document.createRange();
          temp.setStart(this.triggerCtx.range.startContainer, this.triggerCtx.range.startOffset + 1); // 跳过触发符
          temp.setEnd(r.endContainer, r.endOffset);
          const q = temp.toString();
          if (/\s/.test(q)) { this.open = false; } else { this.searchText = q; const ch = this.triggerCtx.char; this.currentTriggerChar = ch; this.ldesignSearch.emit({ value: q, trigger: ch }); this.openIfNeeded(q); }
        }
      } catch {}
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.disabled || this.readonly) return;
    // 候选列表键盘操作
    if (this.open) {
      const items = this.getFilteredOptions(this.searchText);
      if (e.key === 'ArrowDown') { e.preventDefault(); if (items.length) { this.highlightIndex = (this.highlightIndex + 1) % items.length; this.scrollHighlightedIntoView(); } return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) { this.highlightIndex = (this.highlightIndex - 1 + items.length) % items.length; this.scrollHighlightedIntoView(); } return; }
      if (e.key === 'Enter') { e.preventDefault(); if (this.highlightIndex >= 0) this.selectByIndex(this.highlightIndex); return; }
      if (e.key === 'Escape') { e.preventDefault(); this.open = false; this.triggerCtx = null; return; }
    }

    // 单行模式阻止回车换行（Shift+Enter 也阻止）
    if (!this.multiline && e.key === 'Enter') { e.preventDefault(); return; }

    // 删除时的处理
    if (e.key === 'Backspace' && this.editableEl) {
      const sel = window.getSelection(); 
      if (!sel || !sel.isCollapsed || sel.rangeCount === 0) return;
      const r = sel.getRangeAt(0);
      const node = r.startContainer;
      
      // 检查是否正在删除触发符
      if (this.triggerCtx && node.nodeType === 3) {
        const text = node.textContent || '';
        const offset = r.startOffset;
        // 如果光标在触发符后且没有其他字符，删除触发符会关闭弹窗
        if (offset > 0 && this.isTriggerChar(text[offset - 1])) {
          // 延迟检查，让删除操作先执行
          setTimeout(() => {
            const found = this.findTriggerFromCaret();
            if (!found) {
              this.triggerCtx = null;
              this.open = false;
              this.searchText = '';
            }
          }, 0);
        }
      }
      
      // 若前一个兄弟是 token，整体删除
      let prev: Node | null = null;
      if (node.nodeType === 3) {
        if (r.startOffset > 0) return; // 文本内正常退格
        prev = (node.previousSibling || (node.parentElement && node.parentElement.previousSibling));
      } else {
        prev = node.previousSibling;
      }
      if (prev && (prev as HTMLElement).classList && (prev as HTMLElement).classList.contains('ldesign-mention__token')) {
        e.preventDefault();
        if (prev.parentNode) {
          const tokenEl = prev as HTMLElement;
          const value = tokenEl.getAttribute('data-value') || '';
          const label = tokenEl.getAttribute('data-label') || '';
          const trig = tokenEl.getAttribute('data-trigger') || this.currentTriggerChar || this.getTriggers()[0] || '@';
          prev.parentNode.removeChild(prev);
          this.syncValueFromEditable();
          this.ldesignRemove.emit({ value, label, trigger: trig });
        }
        return;
      }
    }
  };

  private onBeforeInput = (e: Event) => {
    if (this.disabled || this.readonly) return;
    const inputEvent = e as InputEvent;
    
    
    // Note: We don't handle trigger detection here anymore - let onInput handle it
    // This avoids timing issues and ensures consistent behavior
  };

  private onInput = () => {
    if (this.disabled || this.readonly) return;
    
    // 同步 value
    this.syncValueFromEditable();

    // 总是检查是否有触发符（从光标向后回溯）
    const found = this.findTriggerFromCaret();
    
    
    
    if (found) {
      // 找到触发符
      const isNewTrigger = !this.triggerCtx || 
                            this.triggerCtx.char !== found.char || 
                            found.range.startContainer !== this.triggerCtx.range.startContainer ||
                            found.range.startOffset !== this.triggerCtx.range.startOffset;
      
      if (isNewTrigger) {
        // 新的触发符或位置变化
        
        this.triggerCtx = { range: found.range, char: found.char };
        this.currentTriggerChar = found.char;
        this.searchText = found.query;
        this.updateAnchorPosition();
        this.ldesignSearch.emit({ value: this.searchText, trigger: found.char });
        this.openIfNeeded(this.searchText);
      } else {
        // 更新查询字符串
        
        this.searchText = found.query;
        this.updateAnchorPosition();
        this.ldesignSearch.emit({ value: this.searchText, trigger: found.char });
        this.openIfNeeded(this.searchText);
      }
    } else {
      // 没有找到触发符
      if (this.triggerCtx) {
        
        this.triggerCtx = null;
        this.currentTriggerChar = '';
        this.open = false;
        this.searchText = '';
      }
    }
  };

  private scrollHighlightedIntoView() {
    const list = this.listEl; if (!list) return;
    const items = Array.from(list.querySelectorAll('.ldesign-mention__item')) as HTMLElement[];
    const target = items[this.highlightIndex];
    if (target) target.scrollIntoView({ block: 'nearest' });
  }

  private applySelection(it: MentionItem) {
    if (!this.editableEl) return;
    const sel = window.getSelection(); if (!sel || sel.rangeCount === 0) return;
    const caret = sel.getRangeAt(0);

    // 使用 triggerCtx.range（含 @）到当前光标的范围，替换为 token + 空格
    const rCtx = this.triggerCtx || this.findTriggerFromCaret();
    const r = rCtx ? rCtx.range.cloneRange() : null;
    if (!r) return;
    r.setEnd(caret.endContainer, caret.endOffset);

    const ch = rCtx?.char || this.currentTriggerChar || this.getTriggers()[0] || '@';

    // 创建 token（复用通用构造，自动适配只读/禁用的 closable）
    const token = this.buildTokenNode(it, ch);
    const space = document.createTextNode('\u200b');

    // 某些浏览器需要更明确的删除范围内容
    try {
      // 获取要替换的文本内容（用于调试）
      const replacedText = r.toString();
      
      
      // 删除范围内容
      r.deleteContents();
      
      // 在某些浏览器中，需要确保collapse到正确位置
      r.collapse(true);
      
      // 插入token和空格
      r.insertNode(space);
      r.insertNode(token);
      
      // 将光标移到空格之后
      const after = document.createRange();
      after.setStartAfter(space);
      after.setEndAfter(space);
      sel.removeAllRanges(); 
      sel.addRange(after);
    } catch (e) {
      console.error('[Mention] Error applying selection:', e);
      // 降级处理：直接在光标处插入
      const fallbackRange = document.createRange();
      fallbackRange.setStart(caret.startContainer, caret.startOffset);
      fallbackRange.setEnd(caret.endContainer, caret.endOffset);
      fallbackRange.insertNode(space);
      fallbackRange.insertNode(token);
    }

    this.triggerCtx = null;
    this.open = false;
    this.searchText = '';

    // 延迟同步，确保DOM更新完成
    setTimeout(() => {
      const m = this.computeModelFromDom();
      this.ldesignSelect.emit({ value: it, trigger: ch, ...(m ? { text: this.editableEl?.innerText || '', mentions: m.mentions } : {}) } as any);
      this.syncValueFromEditable();
    }, 0);
  }

  private selectByIndex(index: number) {
    const items = this.getFilteredOptions(this.searchText);
    const it = items[index];
    if (it) this.applySelection(it);
  }

  private onItemClick = (it: MentionItem, ev?: MouseEvent) => {
    ev?.preventDefault(); ev?.stopPropagation();
    this.applySelection(it);
  };

  private renderEditable() {
    const cls = ['ldesign-mention__editable', `ldesign-mention__editable--${this.size}`];
    if (this.disabled) cls.push('ldesign-mention__editable--disabled');

    return (
      <div
        ref={(el) => (this.editableEl = el as HTMLElement)}
        class={cls.join(' ')}
        contentEditable={!this.disabled && !this.readonly}
        data-placeholder={this.placeholder || ''}
        style={{
          minHeight: this.editableMinH ? `${this.editableMinH}px` : undefined,
          maxHeight: this.editableMaxH != null ? `${this.editableMaxH}px` : undefined,
          overflowY: this.editableMaxH != null ? 'auto' : undefined,
          resize: this.resizable ? 'vertical' : 'none',
        }}
        onFocus={this.onFocus as any}
        onBlur={this.onBlur as any}
        onKeyDown={this.onKeyDown as any}
        onInput={(e: Event) => {
          this.onInput();
        }}
        onClick={this.onEditableClick as any}
      ></div>
    );
  }

  private onEditableClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (this.disabled || this.readonly) return; // 只读/禁用：不允许关闭
    const close = target.closest('.ldesign-mention__token-close') as HTMLElement | null;
    if (close) {
      const token = close.closest('.ldesign-mention__token') as HTMLElement | null;
      if (token && token.parentNode) {
        const value = token.getAttribute('data-value') || '';
        const label = token.getAttribute('data-label') || '';
        const trig = token.getAttribute('data-trigger') || this.currentTriggerChar || this.getTriggers()[0] || '@';
        token.parentNode.removeChild(token);
        this.syncValueFromEditable();
        const m = this.computeModelFromDom();
        this.ldesignRemove.emit({ value, label, trigger: trig, ...(m ? { text: this.editableEl?.innerText || '', mentions: m.mentions } : {}) } as any);
      }
    }
  };

  private renderList() {
    const items = this.getFilteredOptions(this.searchText);
    if (!this.open) return null;
    return (
      <div class="ldesign-mention__panel" style={{ maxHeight: `${this.maxHeight}px` }}>
        <ul class="ldesign-mention__list" ref={(el) => (this.listEl = el as HTMLElement)}>
          {this.loading ? (
            <li class="ldesign-mention__loading"><ldesign-icon name="loader-2" /></li>
          ) : (
            items.length ? (
              items.map((it, i) => (
                <li
                  class={{
                    'ldesign-mention__item': true,
                    'ldesign-mention__item--active': i === this.highlightIndex,
                    'ldesign-mention__item--disabled': !!it.disabled,
                  }}
                  onMouseEnter={() => (this.highlightIndex = i)}
                  onMouseDown={(e) => { e.preventDefault(); /* 防止失去焦点 */ }}
                  onClick={(e) => !it.disabled && this.onItemClick(it, e)}
                >
                  {it.avatar ? (<img class="ldesign-mention__avatar" src={it.avatar} alt={it.label} />) : null}
                  <span class="ldesign-mention__label">{it.label}</span>
                  {it.description ? (<span class="ldesign-mention__desc">{it.description}</span>) : null}
                </li>
              ))
            ) : (
              <li class="ldesign-mention__empty">无匹配结果</li>
            )
          )}
        </ul>
      </div>
    );
  }

  render() {
    const visibleProp = { visible: this.open } as any;
    return (
      <Host class={{ 'ldesign-mention': true, 'ldesign-mention--disabled': this.disabled }}>
        {/* 编辑区 */}
        {this.renderEditable()}

        {/* Popup：以隐藏锚点作为参考元素 */}
        <ldesign-popup
          trigger={'manual' as any}
          placement={'bottom-start' as any}
          interactive={true}
          arrow={false}
          appendTo={this.appendTo as any}
          closeOnOutside={true}
          {...visibleProp}
        >
          {/* 锚点：固定定位到光标位置 */}
          <span slot="trigger" ref={(el) => (this.anchorEl = el as HTMLSpanElement)} class="ldesign-mention__anchor"></span>
          {this.renderList()}
        </ldesign-popup>
      </Host>
    );
  }
}
