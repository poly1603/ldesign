/**
 * 状态栏组件
 * 展示当前模式、缩放、吸附设置以及实时提示消息
 */

import type { EventEmitter } from '@/types/index.js';
import { SimpleEventEmitter, createElement } from '@/utils/index.js';
import { i18n } from '@/ui/i18n.js';

export interface StatusBarConfig {
  container: HTMLElement;
}

type MessageItem = {
  text: string;
  expiresAt?: number; // 过期时间（毫秒时间戳），sticky 时为 undefined
  sticky?: boolean;
};

export class StatusBar extends SimpleEventEmitter implements EventEmitter {
  private container: HTMLElement;
  private element!: HTMLElement;

  // 指示器元素
  private modeEl!: HTMLElement;
  private zoomEl!: HTMLElement;
  private snapEl!: HTMLElement;
  private selectionEl!: HTMLElement;
  private cursorEl!: HTMLElement;
  private messageEl!: HTMLElement;
  private controlsEl!: HTMLElement;

  // 状态值（便于交互）
  private snapOn = false;
  private snapSize = 10;

  // 消息队列与节流
  private queue: MessageItem[] = [];
  private lastRender = 0;
  private rafId: number | null = null;
  private throttleMs = 150;

  // 控件引用
  private snapSizeBtn: HTMLButtonElement | null = null;

  constructor(config: StatusBarConfig) {
    super();
    this.container = config.container;
    this.createElement();
  }

  private createElement(): void {
    this.element = createElement('div', {
      className: 'flowchart-status-bar',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '0 8px',
        height: '28px',
        backgroundColor: 'var(--ldesign-bg-color-container)',
        borderTop: '1px solid var(--ldesign-border-level-1-color)',
        boxShadow: 'var(--ldesign-shadow-1)',
        userSelect: 'none',
        fontSize: 'var(--ls-font-size-xs)',
        color: 'var(--ldesign-text-color-secondary)'
      }
    });

    const left = createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }
    });

    const right = createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: '1',
        justifyContent: 'flex-end'
      }
    });

    // 中部控件
    this.controlsEl = createElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flex: '0 0 auto'
      }
    });

    const item = (label: string) => createElement('span', {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: 'var(--ldesign-text-color-secondary)'
      }
    },
      createElement('span', { textContent: label, style: { opacity: '0.75' } }),
      createElement('strong', { textContent: '-', style: { fontWeight: '500', color: 'var(--ldesign-text-color-primary)' } })
    );

    // 模式
    this.modeEl = item(i18n.statusBar.labels.mode);
    // 缩放
    this.zoomEl = item(i18n.statusBar.labels.zoom);
    // 吸附
    this.snapEl = item(i18n.statusBar.labels.snap);

    // 选中
    this.selectionEl = item(i18n.statusBar.labels.selection);
    // 坐标
    this.cursorEl = item(i18n.statusBar.labels.cursor);

    // 消息
    this.messageEl = createElement('div', {
      style: {
        minWidth: '120px',
        maxWidth: '50%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'right',
        color: 'var(--ldesign-text-color-secondary)'
      }
    });

    left.appendChild(this.modeEl);
    left.appendChild(this.zoomEl);
    left.appendChild(this.snapEl);
    left.appendChild(this.selectionEl);
    left.appendChild(this.cursorEl);

    // 构建中部控件按钮
    this.buildControls();

    right.appendChild(this.messageEl);

    this.element.appendChild(left);
    this.element.appendChild(this.controlsEl);
    this.element.appendChild(right);
    this.container.appendChild(this.element);

    // 初始化默认值
    this.setMode('选择');
    this.setZoom(1);
    this.setSnap(false, 10);
    this.setSelectionInfo(0, 0);
    this.setCursorPosition({ x: 0, y: 0 }, false);
  }

  // 指示器 API
  setMode(text: string): void {
    const strong = this.modeEl.querySelector('strong');
    if (strong) strong.textContent = text;
  }

  setZoom(scale: number): void {
    const percent = Math.max(0, scale || 0) * 100;
    const text = `${percent % 1 === 0 ? percent.toFixed(0) : percent.toFixed(1)}%`;
    const strong = this.zoomEl.querySelector('strong');
    if (strong) strong.textContent = text;
  }

  setSnap(on: boolean, size?: number): void {
    this.snapOn = !!on;
    if (typeof size === 'number') this.snapSize = size;
    const strong = this.snapEl.querySelector('strong');
    const text = this.snapOn ? (this.snapSize ? `开(${this.snapSize})` : '开') : '关';
    if (strong) strong.textContent = text;
    if (this.snapSizeBtn) this.snapSizeBtn.textContent = String(this.snapSize);
  }

  setSelectionInfo(nodes: number, edges: number): void {
    const strong = this.selectionEl.querySelector('strong');
    if (strong) strong.textContent = `节点 ${Math.max(0, nodes)}，连接 ${Math.max(0, edges)}`;
  }

  setCursorPosition(p: { x: number; y: number }, snapped: boolean = false): void {
    const strong = this.cursorEl.querySelector('strong');
    const fx = snapped ? Math.round(p.x) : Number(p.x).toFixed(1);
    const fy = snapped ? Math.round(p.y) : Number(p.y).toFixed(1);
    if (strong) strong.textContent = `${fx}, ${fy}${snapped ? ' (吸附)' : ''}`;
  }

  // 交互控件构建
  private buildControls(): void {
    const mkBtn = (id: string, label: string, title: string): HTMLButtonElement => {
      const btn = createElement('button', {
        className: `sb-btn sb-${id}`,
        title,
        textContent: label,
        style: {
          padding: '2px 6px',
          border: '1px solid var(--ldesign-border-level-1-color)',
          borderRadius: '4px',
          backgroundColor: 'var(--ldesign-bg-color-component)',
          cursor: 'pointer',
          fontSize: '12px'
        }
      }) as HTMLButtonElement;
      return btn;
    };

    const zoomOut = mkBtn('zoom-out', '−', i18n.statusBar.labels.zoomOut);
    zoomOut.addEventListener('click', () => this.emit('zoom-out'));

    const zoomReset = mkBtn('zoom-reset', '100%', i18n.statusBar.labels.zoomReset);
    zoomReset.addEventListener('click', () => this.emit('zoom-reset'));

    const zoomFit = mkBtn('zoom-fit', i18n.statusBar.labels.zoomFit, i18n.statusBar.labels.zoomFit);
    zoomFit.addEventListener('click', () => this.emit('zoom-fit'));

    const zoomIn = mkBtn('zoom-in', '+', i18n.statusBar.labels.zoomIn);
    zoomIn.addEventListener('click', () => this.emit('zoom-in'));

    // snap 开关：点击“吸附”指示器切换
    this.snapEl.style.cursor = 'pointer';
    this.snapEl.title = i18n.statusBar.labels.toggleSnap;
    this.snapEl.addEventListener('click', () => this.emit('toggle-snap', !this.snapOn));

    // 步长按钮：显示当前步长，点击循环
    this.snapSizeBtn = mkBtn('snap-size', String(this.snapSize), i18n.statusBar.labels.cycleSnap);
    this.snapSizeBtn.addEventListener('click', () => this.emit('cycle-snap-size'));

    this.controlsEl.appendChild(zoomOut);
    this.controlsEl.appendChild(zoomReset);
    this.controlsEl.appendChild(zoomFit);
    this.controlsEl.appendChild(zoomIn);
    this.controlsEl.appendChild(this.snapSizeBtn);
  }

  // 消息 API
  setMessage(text: string, durationMs = 1200, sticky = false): void {
    const now = performance.now();
    const last = this.queue[this.queue.length - 1];
    if (last && last.text === text && !sticky) {
      last.expiresAt = now + durationMs;
      this.requestFlush();
      return;
    }
    this.queue.push({ text, sticky, expiresAt: sticky ? undefined : (now + durationMs) });
    this.requestFlush();
  }

  clearMessage(): void {
    this.queue = [];
    this.requestFlush(true);
  }

  private requestFlush(force = false): void {
    const now = performance.now();
    if (!force && now - this.lastRender < this.throttleMs) return;
    this.lastRender = now;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.flush());
  }

  private flush(): void {
    const now = performance.now();
    this.queue = this.queue.filter(m => m.sticky || (m.expiresAt ?? Infinity) > now);
    const current = this.queue[this.queue.length - 1];
    this.messageEl.textContent = current ? current.text : '';
  }
}

