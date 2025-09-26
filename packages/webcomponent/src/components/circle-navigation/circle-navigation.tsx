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
  /** 是否显示圆形轨道 */
  @Prop() showTrack: boolean = true;

  /** 是否启用透视（近大远小）效果 */
  @Prop() perspective: boolean = false;
  /** 视角正前方的角度（度），默认 90° 即底部为“最近” */
  @Prop() frontAngle: number = 90;
  /** 透视缩放范围：最小与最大缩放因子 */
  @Prop() minScale: number = 0.8;
  @Prop() maxScale: number = 1.2;

  private containerEl?: HTMLElement;
  private itemsWrapEl?: HTMLElement;
  private centerWrapEl?: HTMLElement;
  private ro?: ResizeObserver;
  private mo?: MutationObserver;
  private raf?: number;
  private items: HTMLElement[] = [];
  private trackEl?: HTMLElement;

  @State() _version: number = 0; // 触发重渲染的内部计数器（通常无需）

  disconnectedCallback() {
    if (this.ro) {
      this.ro.disconnect();
      this.ro = undefined;
    }
    if (this.mo) {
      this.mo.disconnect();
      this.mo = undefined;
    }
    if (this.raf != null) cancelAnimationFrame(this.raf);
  }

  componentDidLoad() {
    // 监听尺寸变化
    if (typeof ResizeObserver !== 'undefined' && this.containerEl) {
      this.ro = new ResizeObserver(() => this.schedulePosition());
      this.ro.observe(this.containerEl);
    }

    // 迁移用户传入的子节点到内部容器（shadow: false 时 slot 不生效）
    this.mountChildrenIntoWrappers();

    // 监听 Host 子节点变化，自动重新布局
    if (typeof MutationObserver !== 'undefined') {
      this.mo = new MutationObserver(() => this.mountChildrenIntoWrappers());
      this.mo.observe(this.el, { childList: true });
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
    if(/^\d+(\.\d+)?$/.test(s)) return `${s}px`;
    return s; // 已包含单位
  }

  /**
   * 将宿主上的子元素迁移到内部 items/center 容器，便于绝对定位
   */
  private mountChildrenIntoWrappers() {
    if (!this.itemsWrapEl || !this.centerWrapEl) return;

    // 采集需要迁移的外部子元素：排除我们自己渲染的容器
    const externalChildren = Array.from(this.el.children).filter((el) => {
      const cls = el.classList?.value || '';
      if (cls.includes('ldesign-circle-navigation')) return false; // 排除内部 nav 本体
      if (el.tagName.toLowerCase() === 'style') return false;
      return true;
    }) as HTMLElement[];

    // 将中心槽位元素迁移到 center 容器；其余迁移到 items 容器
    externalChildren.forEach((child) => {
      if (child.getAttribute('slot') === 'center') {
        this.centerWrapEl!.appendChild(child);
      } else {
        this.itemsWrapEl!.appendChild(child);
      }
    });

    // 更新 items 列表并施加基础定位样式
    this.items = Array.from(this.itemsWrapEl.children) as HTMLElement[];
    this.items.forEach((it) => {
      it.classList.add('ldesign-circle-navigation__item');
      const style = it.style as CSSStyleDeclaration;
      style.position = 'absolute';
      style.left = '50%';
      style.top = '50%';
      style.transform = 'translate(-50%, -50%)';
    });

    this.schedulePosition();
  }

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

    // 椭圆半径（分别使用宽高的一半）
    const rx = w / 2;
    const ry = h / 2;

    let sumIr = 0;

    // 预先生成每个 item 的角度（支持椭圆“端点优先 + 上下均分”策略）
    const angles: number[] = [];
    const isCircle = Math.abs(rx - ry) < 0.5; // 近似视为圆
    if (isCircle) {
      for (let i = 0; i < count; i++) angles.push(startRad + i * step);
    } else {
      if (count === 1) {
        angles.push(0); // 只有一个时放在右端
      } else {
        // 两端优先：左端 π、右端 0
        angles.push(Math.PI);
        angles.push(0);
        const rest = count - 2;
        if (rest > 0) {
          const topCount = Math.ceil(rest / 2);
          const bottomCount = rest - topCount;
          // 顶部半弧（从 π 到 0，不包含端点）
          for (let k = 1; k <= topCount; k++) {
            const a = Math.PI - (k * Math.PI) / (topCount + 1);
            angles.push(a);
          }
          // 底部半弧（从 0 到 π，不包含端点）
          for (let k = 1; k <= bottomCount; k++) {
            const a = (k * Math.PI) / (bottomCount + 1);
            angles.push(a);
          }
        }
      }
    }

    this.items.forEach((item, i) => {
      // 测量子项尺寸
      const iw = item.offsetWidth || (item.getBoundingClientRect().width || 0);
      const ih = item.offsetHeight || (item.getBoundingClientRect().height || 0);
      const ir = Math.max(iw, ih) / 2;
      sumIr += ir;

      const angle = angles[i] ?? (startRad + i * step);
      // 在椭圆上为避免越界，分别在两个半轴上减去 padding + ir
      const rxi = Math.max(0, rx - this.padding - ir);
      const ryi = Math.max(0, ry - this.padding - ir);

      const cx = w / 2;
      const cy = h / 2;

      const x = cx + rxi * Math.cos(angle);
      const y = cy + ryi * Math.sin(angle);

      // 透视缩放与层级
      let scale = 1;
      let z = 100;
      if (this.perspective) {
        const frontRad = (this.frontAngle * Math.PI) / 180;
        const d = (Math.cos(angle - frontRad) + 1) / 2; // 0..1，越接近 frontAngle 越大
        const minS = Math.max(0, this.minScale);
        const maxS = Math.max(minS, this.maxScale);
        scale = minS + (maxS - minS) * d;
        z = 100 + Math.round(d * 100);
      }

      const style = item.style as CSSStyleDeclaration;
      style.left = `${x}px`;
      style.top = `${y}px`;
      style.transform = `translate(-50%, -50%)${this.perspective ? ` scale(${scale})` : ''}`;
      style.zIndex = String(z);
    });

    // 更新轨道尺寸（使用平均半径估算视觉半径）
    if (this.showTrack && this.trackEl) {
      const avgIr = sumIr / count;
      const trackRx = Math.max(0, rx - this.padding - avgIr);
      const trackRy = Math.max(0, ry - this.padding - avgIr);
      const dw = Math.max(0, trackRx * 2);
      const dh = Math.max(0, trackRy * 2);
      const style = this.trackEl.style as CSSStyleDeclaration;
      style.width = `${dw}px`;
      style.height = `${dh}px`;
      style.left = '50%';
      style.top = '50%';
      style.transform = 'translate(-50%, -50%)';
      style.display = dw > 0 && dh > 0 ? 'block' : 'none';
    } else if (this.trackEl) {
      this.trackEl.style.display = 'none';
    }
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
          aria-label={this.el?.getAttribute('aria-label') || undefined}
          ref={el => (this.containerEl = el as HTMLElement)}
        >
          {this.showTrack ? (
            <div class="ldesign-circle-navigation__track" ref={el => (this.trackEl = el as HTMLElement)}></div>
          ) : null}
          <div class="ldesign-circle-navigation__items" ref={el => (this.itemsWrapEl = el as HTMLElement)}></div>
          <div class="ldesign-circle-navigation__center" ref={el => (this.centerWrapEl = el as HTMLElement)}></div>
        </nav>
      </Host>
    );
  }
}
