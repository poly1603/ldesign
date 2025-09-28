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

  /** 椭圆半弧内的间距策略：'arc' 按弧长均分，'angle' 按角度均分（更“均匀”的视觉效果） */
  @Prop() ellipseSpacing: 'arc' | 'angle' = 'angle';
  /** 椭圆端点轴：auto 根据宽高选择；x 左右为端点；y 上下为端点 */
  @Prop() ellipseAxis: 'auto' | 'x' | 'y' = 'auto';

  /** 3D 透视：Z 轴偏移幅度（px）。>0 则开启 translateZ；与 perspectiveDistance 联动 */
  @Prop() zDepth: number = 0;
  /** 3D 透视距离（px，对应 CSS perspective），zDepth>0 时生效 */
  @Prop() perspectiveDistance: number = 600;
  /** 3D 透视原点（CSS perspective-origin），如 '50% 50%' 'center 80%' */
  @Prop() perspectiveOrigin?: string;

  /** 是否启用拖动旋转 */
  @Prop() enableDrag: boolean = true;
  /** 是否启用触摸手势旋转 */
  @Prop() touchRotate: boolean = true;
  /** 旋转灵敏度（度/像素） */
  @Prop() rotateSensitivity: number = 0.5;
  /** 是否启用惯性/动量效果 */
  @Prop() momentum: boolean = true;
  /** 惯性摩擦系数（0-1，越小惯性越大） */
  @Prop() friction: number = 0.95;
  /** 是否启用吸附点 */
  @Prop() snapPoints: boolean = false;
  /** 吸附角度间隔（度） */
  @Prop() snapAngle: number = 45;
  /** 吸附阈值（度，在此范围内会自动吸附） */
  @Prop() snapThreshold: number = 15;
  /** 最小旋转速度（度/帧，低于此速度停止旋转） */
  @Prop() minVelocity: number = 0.1;

  private containerEl?: HTMLElement;
  private itemsWrapEl?: HTMLElement;
  private centerWrapEl?: HTMLElement;
  private ro?: ResizeObserver;
  private mo?: MutationObserver;
  private raf?: number;
  private items: HTMLElement[] = [];
  private trackEl?: HTMLElement;

  @State() _version: number = 0; // 触发重渲染的内部计数器（通常无需）
  @State() rotationAngle: number = 0; // 当前旋转角度
  @State() isDragging: boolean = false; // 是否正在拖动

  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private dragStartAngle: number = 0;
  private centerX: number = 0;
  private centerY: number = 0;
  private velocity: number = 0;
  private lastAngle: number = 0;
  private lastTime: number = 0;
  private animationFrame?: number;
  private velocityHistory: { angle: number; time: number }[] = []

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
    if (this.animationFrame != null) cancelAnimationFrame(this.animationFrame);
    this.removeGlobalListeners();
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

    // 添加拖动事件监听
    if (this.enableDrag && this.containerEl) {
      this.containerEl.addEventListener('mousedown', this.handleMouseDown);
    }
    if (this.touchRotate && this.containerEl) {
      this.containerEl.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    }
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

  // Mouse event handlers
  private handleMouseDown = (e: MouseEvent) => {
    if (!this.enableDrag || !this.containerEl) return;
    e.preventDefault();
    
    const rect = this.containerEl.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
    
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragStartAngle = this.rotationAngle;
    this.isDragging = true;
    this.velocity = 0;
    this.velocityHistory = [];
    
    // Stop any ongoing momentum animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = undefined;
    }
    
    // Add global listeners for drag and release
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;
    e.preventDefault();
    
    const currentAngle = this.calculateAngle(e.clientX, e.clientY);
    const startAngle = this.calculateAngle(this.dragStartX, this.dragStartY);
    const deltaAngle = (currentAngle - startAngle) * this.rotateSensitivity;
    
    this.rotationAngle = this.dragStartAngle + deltaAngle;
    
    // Track velocity for momentum
    const now = Date.now();
    this.velocityHistory.push({ angle: this.rotationAngle, time: now });
    
    // Keep only recent history (last 100ms)
    this.velocityHistory = this.velocityHistory.filter(h => now - h.time < 100);
    
    this.schedulePosition();
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (!this.isDragging) return;
    e.preventDefault();
    
    this.isDragging = false;
    this.removeGlobalListeners();
    
    // Calculate final velocity from recent movement history
    if (this.momentum && this.velocityHistory.length > 1) {
      const recent = this.velocityHistory.slice(-5);
      if (recent.length >= 2) {
        const first = recent[0];
        const last = recent[recent.length - 1];
        const timeDelta = last.time - first.time;
        if (timeDelta > 0) {
          this.velocity = (last.angle - first.angle) / timeDelta * 16.67; // Convert to degrees per frame (60fps)
          this.startMomentumAnimation();
        }
      }
    } else if (this.snapPoints) {
      this.snapToNearestPoint();
    }
  };

  // Touch event handlers
  private handleTouchStart = (e: TouchEvent) => {
    if (!this.touchRotate || !this.containerEl || e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = this.containerEl.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
    
    this.dragStartX = touch.clientX;
    this.dragStartY = touch.clientY;
    this.dragStartAngle = this.rotationAngle;
    this.isDragging = true;
    this.velocity = 0;
    this.velocityHistory = [];
    
    // Stop any ongoing momentum animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = undefined;
    }
    
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd);
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (!this.isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const currentAngle = this.calculateAngle(touch.clientX, touch.clientY);
    const startAngle = this.calculateAngle(this.dragStartX, this.dragStartY);
    const deltaAngle = (currentAngle - startAngle) * this.rotateSensitivity;
    
    this.rotationAngle = this.dragStartAngle + deltaAngle;
    
    // Track velocity for momentum
    const now = Date.now();
    this.velocityHistory.push({ angle: this.rotationAngle, time: now });
    
    // Keep only recent history (last 100ms)
    this.velocityHistory = this.velocityHistory.filter(h => now - h.time < 100);
    
    this.schedulePosition();
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (!this.isDragging) return;
    e.preventDefault();
    
    this.isDragging = false;
    this.removeGlobalListeners();
    
    // Calculate final velocity from recent movement history
    if (this.momentum && this.velocityHistory.length > 1) {
      const recent = this.velocityHistory.slice(-5);
      if (recent.length >= 2) {
        const first = recent[0];
        const last = recent[recent.length - 1];
        const timeDelta = last.time - first.time;
        if (timeDelta > 0) {
          this.velocity = (last.angle - first.angle) / timeDelta * 16.67; // Convert to degrees per frame (60fps)
          this.startMomentumAnimation();
        }
      }
    } else if (this.snapPoints) {
      this.snapToNearestPoint();
    }
  };

  // Helper methods
  private calculateAngle(x: number, y: number): number {
    const dx = x - this.centerX;
    const dy = y - this.centerY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

  private removeGlobalListeners() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
  }

  // Momentum/Inertia animation
  private startMomentumAnimation() {
    const animate = () => {
      if (Math.abs(this.velocity) < this.minVelocity) {
        // Velocity is too small, stop animation
        this.velocity = 0;
        if (this.snapPoints) {
          this.snapToNearestPoint();
        }
        return;
      }
      
      // Apply friction to velocity
      this.velocity *= this.friction;
      
      // Update rotation angle
      this.rotationAngle += this.velocity;
      this.schedulePosition();
      
      // Continue animation
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  // Snap to nearest point
  private snapToNearestPoint() {
    if (!this.snapPoints) return;
    
    const normalizedAngle = this.rotationAngle % 360;
    const snapInterval = this.snapAngle;
    const nearestSnap = Math.round(normalizedAngle / snapInterval) * snapInterval;
    const delta = nearestSnap - normalizedAngle;
    
    // Only snap if within threshold
    if (Math.abs(delta) <= this.snapThreshold) {
      this.animateToAngle(this.rotationAngle + delta);
    }
  }

  private animateToAngle(targetAngle: number) {
    const startAngle = this.rotationAngle;
    const delta = targetAngle - startAngle;
    const duration = 200; // ms
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      this.rotationAngle = startAngle + delta * eased;
      this.schedulePosition();
      
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };
    
    this.animationFrame = requestAnimationFrame(animate);
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

    // 先测量一次，得到平均半径，用于计算“等弧长”角度
    const radii: number[] = [];
    this.items.forEach((item) => {
      const iw = item.offsetWidth || (item.getBoundingClientRect().width || 0);
      const ih = item.offsetHeight || (item.getBoundingClientRect().height || 0);
      radii.push(Math.max(iw, ih) / 2);
    });
    sumIr = radii.reduce((a, b) => a + b, 0);
    const avgIr = sumIr / Math.max(1, count);

    const rx0 = Math.max(0, rx - this.padding - avgIr);
    const ry0 = Math.max(0, ry - this.padding - avgIr);

    function wrapPI(a: number): number {
      while (a <= -Math.PI) a += 2 * Math.PI;
      while (a > Math.PI) a -= 2 * Math.PI;
      return a;
    }
    function positiveDelta(aStart: number, aEnd: number): number {
      // 以 [-π, π] 表示，返回从 aStart 逆时针到 aEnd 的正角度 [0, 2π)
      let d = wrapPI(aEnd) - wrapPI(aStart);
      if (d < 0) d += 2 * Math.PI;
      return d;
    }
    function sampleAnglesAngle(aStart: number, aEnd: number, n: number): number[] {
      if (n <= 0) return [];
      const d = positiveDelta(aStart, aEnd);
      const out: number[] = [];
      for (let k = 1; k <= n; k++) {
        const t = aStart + (d * k) / (n + 1);
        out.push(wrapPI(t));
      }
      return out;
    }
    function uniformAnglesOnArc(aStart: number, aEnd: number, n: number): number[] {
      if (n <= 0) return [];
      const S = 720; // 采样精度
      const d = positiveDelta(aStart, aEnd);
      const ts: number[] = [];
      const xs: number[] = [];
      const ys: number[] = [];
      for (let i = 0; i <= S; i++) {
        const t = aStart + (d * i) / S;
        const tw = wrapPI(t);
        ts.push(tw);
        xs.push(rx0 * Math.cos(tw));
        ys.push(ry0 * Math.sin(tw));
      }
      const cum: number[] = [0];
      for (let i = 1; i <= S; i++) {
        const dx = xs[i] - xs[i - 1];
        const dy = ys[i] - ys[i - 1];
        cum[i] = cum[i - 1] + Math.hypot(dx, dy);
      }
      const total = cum[S];
      const result: number[] = [];
      for (let k = 1; k <= n; k++) {
        const target = (total * k) / (n + 1);
        // 二分查找目标段
        let lo = 0, hi = S;
        while (lo < hi) {
          const mid = Math.floor((lo + hi) / 2);
          if (cum[mid] < target) lo = mid + 1; else hi = mid;
        }
        const i1 = Math.max(1, lo);
        const i0 = i1 - 1;
        const seg = cum[i1] - cum[i0] || 1;
        const ratio = (target - cum[i0]) / seg;
        const tw = ts[i0] + (ts[i1] - ts[i0]) * ratio;
        result.push(wrapPI(tw));
      }
      return result;
    }

    // 预先生成每个 item 的角度（支持椭圆“端点优先 + 两段均分”策略；正圆则等角度分布）
    const angles: number[] = [];
    const isCircle = Math.abs(rx - ry) < 0.5; // 近似视为圆
    if (isCircle) {
      for (let i = 0; i < count; i++) angles.push(startRad + i * step);
    } else {
      if (count === 1) {
        angles.push(0); // 只有一个时放在右端
      } else {
        // 端点轴
        let axis = this.ellipseAxis;
        if (axis === 'auto') axis = rx >= ry ? 'x' : 'y';
        const endA = axis === 'x' ? Math.PI : -Math.PI / 2; // 左端或上端
        const endB = axis === 'x' ? 0 : Math.PI / 2;        // 右端或下端

        angles.push(endA);
        angles.push(endB);

        const rest = count - 2;
        if (rest > 0) {
          const arc1Count = Math.ceil(rest / 2);
          const arc2Count = rest - arc1Count;

          const sampler = this.ellipseSpacing === 'arc' ? uniformAnglesOnArc : sampleAnglesAngle;
          // 弧1：从 endA 逆时针到 endB
          const arc1 = sampler(endA, endB, arc1Count);
          // 弧2：从 endB 逆时针到 endA（补弧）
          const arc2 = sampler(endB, endA, arc2Count);
          angles.push(...arc1, ...arc2);
        }
      }
    }

    this.items.forEach((item, i) => {
      // 测量子项尺寸
      const iw = item.offsetWidth || (item.getBoundingClientRect().width || 0);
      const ih = item.offsetHeight || (item.getBoundingClientRect().height || 0);
      const ir = Math.max(iw, ih) / 2;

      // Apply rotation to the angle
      const baseAngle = angles[i] ?? (startRad + i * step);
      const angle = baseAngle + (this.rotationAngle * Math.PI / 180);
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
      const zT = this.zDepth > 0 ? ((Math.cos(angle - (this.frontAngle * Math.PI) / 180) + 1) / 2 * 2 - 1) * this.zDepth : 0; // 映射到 [-zDepth, zDepth]
      const parts = [`translate(-50%, -50%)`];
      if (this.zDepth > 0) parts.push(`translateZ(${zT.toFixed(2)}px)`);
      if (this.perspective) parts.push(`scale(${scale})`);
      style.transform = parts.join(' ');
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
    if (this.zDepth > 0) {
      style['perspective'] = `${this.perspectiveDistance}px`;
      if (this.perspectiveOrigin) style['perspective-origin'] = this.perspectiveOrigin;
    }
    return style;
  }

  render() {
    const classes = {
      'ldesign-circle-navigation': true,
      'draggable': this.enableDrag || this.touchRotate,
      'dragging': this.isDragging
    };
    
    return (
      <Host>
        <nav
          class={classes}
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
