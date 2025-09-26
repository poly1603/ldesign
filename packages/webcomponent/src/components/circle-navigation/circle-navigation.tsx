import { Component, Prop, State, Element, h, Host, Listen } from '@stencil/core';

/**
 * CircleNavigation 圆形导航组件
 * 支持通过 width/height 控制圆的尺寸，默认正上方为第一个元素
 */
@Component({
  tag: 'ldesign-circle-navigation',
  styleUrl: 'circle-navigation.less',
  shadow: false,
})
export class LdesignCircleNavigation {
  @Element() el!: HTMLElement;

  /** 圆形容器宽度（数字按 px 处理，亦可传入如 '20rem' / '240px' / '50%'） */
  @Prop() width: number | string = 240;
  /** 圆形容器高度（不传则等于 width） */
  @Prop() height?: number | string;

  /** 起始角度（度），默认 -90 表示第一个项在正上方；0 表示第一个项在最右侧 */
  @Prop() startAngle: number = -90;
  /** 是否顺时针排布 */
  @Prop() clockwise: boolean = true;
  /** 与圆边缘的内边距（px），用于避免项目贴边 */
  @Prop() padding: number = 8;

  /** ARIA label */
  @Prop() ariaLabel?: string;

  private containerEl?: HTMLElement;
  private ro?: ResizeObserver;
  private raf?: number;
  private items: HTMLElement[] = [];

  @State() _version: number = 0; // 触发重渲染的内部计数器（通常无需）

  disconnectedCallback() {
    if (this.ro) {
      this.ro.disconnect();
      this.ro = undefined;
    }
    if (this.raf != null) cancelAnimationFrame(this.raf);
  }

  componentDidLoad() {
    // 监听尺寸变化
    if (typeof ResizeObserver !== 'undefined' && this.containerEl) {
      this.ro = new ResizeObserver(() => this.schedulePosition());
      this.ro.observe(this.containerEl);
    }
    // 初始定位
    this.schedulePosition();
  }

  @Listen('resize', { target: 'window' })
  handleWindowResize() {
    this.schedulePosition();
  }

  private toCssSize(v?: number | string): string | undefined {
    if (v == null) return undefined;
    if (typeof v === 'number') return `${v}px`;
    const s = String(v).trim();
    if (/^\d+(\.\d+)?$/.test(s)) return `${s}px`;
    return s; // 已包含单位
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const assigned = slot.assignedElements({ flatten: true }) as HTMLElement[];
    this.items = assigned.filter(el => el && el.nodeType === 1) as HTMLElement[];

    // 为每个子元素设置基础定位类
    this.items.forEach(it => {
      it.classList.add('ldesign-circle-navigation__item');
      // 确保初次测量有参考位置
      const style = it.style as CSSStyleDeclaration;
      if (!style.position) style.position = 'absolute';
      style.left = '50%';
      style.top = '50%';
      style.transform = 'translate(-50%, -50%)';
    });

    this.schedulePosition();
  };

  private schedulePosition() {
    if (this.raf != null) cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => this.positionItems());
  }

  private positionItems() {
    const container = this.containerEl || (this.el.querySelector('.ldesign-circle-navigation') as HTMLElement | null);
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!w || !h) return;

    const count = this.items.length;
    if (!count) return;

    const startRad = (this.startAngle * Math.PI) / 180;
    const step = ((Math.PI * 2) / count) * (this.clockwise ? 1 : -1);

    // 以容器最小边作为直径基准
    const halfMin = Math.min(w, h) / 2;

    this.items.forEach((item, i) => {
      // 测量子项尺寸
      const iw = item.offsetWidth || (item.getBoundingClientRect().width || 0);
      const ih = item.offsetHeight || (item.getBoundingClientRect().height || 0);
      const ir = Math.max(iw, ih) / 2;

      const angle = startRad + i * step;
      const radius = Math.max(0, halfMin - this.padding - ir);

      const cx = w / 2;
      const cy = h / 2;

      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      const style = item.style as CSSStyleDeclaration;
      style.left = `${x}px`;
      style.top = `${y}px`;
      style.transform = 'translate(-50%, -50%)';
    });
  }

  private getContainerStyle(): { [k: string]: string } {
    const width = this.toCssSize(this.width);
    const height = this.toCssSize(this.height != null ? this.height : this.width);
    const style: { [k: string]: string } = {};
    if (width) style.width = width;
    if (height) style.height = height;
    return style;
  }

  render() {
    return (
      <Host>
        <nav
          class="ldesign-circle-navigation"
          style={this.getContainerStyle()}
          role="navigation"
          aria-label={this.ariaLabel || 'Circle navigation'}
          ref={el => (this.containerEl = el as HTMLElement)}
        >
          <div class="ldesign-circle-navigation__items">
            <slot onSlotchange={this.handleSlotChange}></slot>
          </div>
          <div class="ldesign-circle-navigation__center">
            <slot name="center"></slot>
          </div>
        </nav>
      </Host>
    );
  }
}
