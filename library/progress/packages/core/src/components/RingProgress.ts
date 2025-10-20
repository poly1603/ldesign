import { RingProgressOptions } from '../types';
import { ProgressBase } from '../base';
import { createSVGElement } from '../utils';

/**
 * 多环进度条
 */
export class RingProgress extends ProgressBase<RingProgressOptions> {
  private svg!: SVGSVGElement;
  private ringElements: Array<{
    track: SVGCircleElement;
    progress: SVGCircleElement;
    text?: SVGElement;
  }> = [];

  protected getDefaultOptions(): Partial<RingProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      baseRadius: 80,
      ringGap: 15,
      rings: [],
    };
  }

  protected render(): void {
    // 清空容器
    this.container.innerHTML = '';

    const rings = this.config.get('rings') ?? [];
    if (rings.length === 0) {
      console.warn('RingProgress: No rings configured');
      return;
    }

    const baseRadius = this.config.get('baseRadius') ?? 80;
    const ringGap = this.config.get('ringGap') ?? 15;
    const maxStrokeWidth = Math.max(...rings.map(r => r.strokeWidth || 8));

    // 计算SVG尺寸
    const maxRadius = baseRadius + (rings.length - 1) * ringGap;
    const size = (maxRadius + maxStrokeWidth) * 2;

    // 创建SVG
    this.svg = createSVGElement('svg', {
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`,
      class: 'ld-progress-ring',
    }) as SVGSVGElement;

    // 添加自定义类名
    const className = this.config.get('className');
    if (className) {
      this.svg.classList.add(className);
    }

    this.container.appendChild(this.svg);
    this.container.style.position = 'relative';
    this.container.style.display = 'inline-block';

    // 创建各个环
    this.ringElements = [];
    const center = size / 2;

    rings.forEach((ring, index) => {
      const radius = baseRadius + index * ringGap;
      const strokeWidth = ring.strokeWidth || 8;
      const circumference = 2 * Math.PI * radius;

      // 创建轨道
      const track = createSVGElement('circle', {
        cx: center,
        cy: center,
        r: radius,
        fill: 'none',
        stroke: '#e4e7ed',
        'stroke-width': strokeWidth,
        class: 'ld-progress-ring__track',
      }) as SVGCircleElement;

      // 创建进度环
      const progress = createSVGElement('circle', {
        cx: center,
        cy: center,
        r: radius,
        fill: 'none',
        stroke: ring.color || this.getDefaultColor(index),
        'stroke-width': strokeWidth,
        'stroke-linecap': 'round',
        class: 'ld-progress-ring__progress',
      }) as SVGCircleElement;

      progress.style.strokeDasharray = `${circumference}`;
      progress.style.strokeDashoffset = `${circumference}`;
      progress.style.transform = 'rotate(-90deg)';
      progress.style.transformOrigin = 'center';
      progress.style.transition = 'stroke-dashoffset 0.3s';

      this.svg.appendChild(track);
      this.svg.appendChild(progress);

      // 添加标签
      let textElement: SVGElement | undefined;
      if (ring.label) {
        const labelY = center + (index - rings.length / 2 + 0.5) * 20;
        textElement = createSVGElement('text', {
          x: center,
          y: labelY,
          'text-anchor': 'middle',
          fill: '#606266',
          'font-size': '12',
          class: 'ld-progress-ring__label',
        });
        textElement.textContent = ring.label;
        this.svg.appendChild(textElement);
      }

      this.ringElements.push({ track, progress, text: textElement });
    });

    // 添加中心文本
    if (this.config.get('showText')) {
      const centerText = document.createElement('div');
      centerText.className = 'ld-progress-ring__text';
      centerText.style.position = 'absolute';
      centerText.style.top = '50%';
      centerText.style.left = '50%';
      centerText.style.transform = 'translate(-50%, -50%)';
      centerText.style.fontSize = '24px';
      centerText.style.fontWeight = 'bold';
      centerText.style.color = '#303133';
      this.container.appendChild(centerText);
    }

    // 更新进度
    this.updateProgress(this.currentValue);
  }

  protected updateProgress(value: number): void {
    const rings = this.config.get('rings') ?? [];

    rings.forEach((ring, index) => {
      if (!this.ringElements[index]) return;

      const { progress } = this.ringElements[index];
      const radius = parseFloat(progress.getAttribute('r') || '0');
      const circumference = 2 * Math.PI * radius;

      // 计算这个环的进度
      const ringPercentage = this.config.getPercentage(ring.value);
      const offset = circumference - (ringPercentage / 100) * circumference;

      progress.style.strokeDashoffset = `${offset}`;
    });

    // 更新中心文本（显示总体进度）
    const centerText = this.container.querySelector('.ld-progress-ring__text');
    if (centerText) {
      centerText.textContent = this.formatText(value);
    }
  }

  /**
   * 获取默认颜色
   */
  private getDefaultColor(index: number): string {
    const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'];
    return colors[index % colors.length];
  }

  /**
   * 更新某个环的值
   */
  updateRing(index: number, value: number): void {
    const rings = this.config.get('rings') ?? [];
    if (index >= 0 && index < rings.length) {
      rings[index].value = value;
      this.updateProgress(this.currentValue);
    }
  }

  /**
   * 添加环
   */
  addRing(ring: { value: number; color?: string; strokeWidth?: number; label?: string }): void {
    const rings = this.config.get('rings') ?? [];
    rings.push(ring);
    this.config.set('rings', rings);
    this.render();
  }
}


