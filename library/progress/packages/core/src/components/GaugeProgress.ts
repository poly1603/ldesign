import { GaugeProgressOptions } from '../types';
import { DashboardProgress } from './DashboardProgress';
import { createSVGElement, degToRad } from '../utils';

/**
 * 高级仪表盘进度条
 */
export class GaugeProgress extends DashboardProgress {
  private numberElements: SVGElement[] = [];

  protected getDefaultOptions(): Partial<GaugeProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      showNumbers: true,
      tickCount: 10,
      showMinorTicks: true,
      minorTickCount: 5,
      needleType: 'arrow',
    };
  }

  protected render(): void {
    // 调用父类渲染
    super.render();

    // 添加数字刻度
    if (this.config.get('showNumbers')) {
      this.renderNumbers();
    }

    // 添加小刻度
    if (this.config.get('showMinorTicks')) {
      this.renderMinorTicks();
    }

    // 更新指针样式
    this.updateNeedleStyle();
  }

  protected renderNumbers(): void {
    const tickCount = this.config.get('tickCount') ?? 10;
    const angleRange = this.config.get('angleRange') ?? 270;
    const startAngle = this.config.get('startAngle') ?? -225;
    const strokeWidth = this.config.get('strokeWidth') ?? 6;
    const center = (this.radius + strokeWidth) * 2 / 2;
    const min = this.config.get('min') ?? 0;
    const max = this.config.get('max') ?? 100;
    const numberFormat = this.config.get('numberFormat');

    // 清除旧数字
    this.numberElements.forEach(el => el.remove());
    this.numberElements = [];

    const numberRadius = this.radius + 20;

    for (let i = 0; i <= tickCount; i++) {
      const angle = startAngle + (angleRange / tickCount) * i;
      const angleRad = degToRad(angle);

      const x = center + numberRadius * Math.cos(angleRad);
      const y = center + numberRadius * Math.sin(angleRad);

      const value = min + (max - min) * (i / tickCount);
      const displayValue = numberFormat ? numberFormat(value) : Math.round(value).toString();

      const text = createSVGElement('text', {
        x,
        y,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        class: 'ld-progress-gauge__number',
        fill: '#606266',
        'font-size': '12',
        'font-weight': 'bold',
      });
      text.textContent = displayValue;

      this.svg.appendChild(text);
      this.numberElements.push(text);
    }
  }

  protected renderMinorTicks(): void {
    const tickCount = this.config.get('tickCount') ?? 10;
    const minorTickCount = this.config.get('minorTickCount') ?? 5;
    const angleRange = this.config.get('angleRange') ?? 270;
    const startAngle = this.config.get('startAngle') ?? -225;
    const strokeWidth = this.config.get('strokeWidth') ?? 6;
    const center = (this.radius + strokeWidth) * 2 / 2;

    const totalSegments = tickCount * minorTickCount;
    const angleStep = angleRange / totalSegments;

    for (let i = 0; i <= totalSegments; i++) {
      // 跳过主刻度位置
      if (i % minorTickCount === 0) continue;

      const angle = startAngle + angleStep * i;
      const angleRad = degToRad(angle);

      const innerRadius = this.radius - strokeWidth / 2 - 2;
      const outerRadius = this.radius - strokeWidth / 2 + 3;

      const x1 = center + innerRadius * Math.cos(angleRad);
      const y1 = center + innerRadius * Math.sin(angleRad);
      const x2 = center + outerRadius * Math.cos(angleRad);
      const y2 = center + outerRadius * Math.sin(angleRad);

      const line = createSVGElement('line', {
        x1,
        y1,
        x2,
        y2,
        stroke: '#c0c4cc',
        'stroke-width': 0.5,
        class: 'ld-progress-gauge__minor-tick',
      });

      this.svg.appendChild(line);
    }
  }

  protected updateNeedleStyle(): void {
    if (!this.pointer) return;

    const needleType = this.config.get('needleType') ?? 'arrow';
    const strokeWidth = this.config.get('strokeWidth') ?? 6;
    const center = (this.radius + strokeWidth) * 2 / 2;
    const pointerLength = this.radius - strokeWidth / 2;

    // 移除旧指针
    const pointerGroup = this.pointer.parentElement;
    if (pointerGroup) {
      pointerGroup.innerHTML = '';
    } else {
      return;
    }

    // 根据类型创建新指针
    switch (needleType) {
      case 'arrow':
        // 箭头型指针
        const arrowPath = createSVGElement('path', {
          d: `M ${center} ${center - pointerLength} 
              L ${center - 4} ${center - 5}
              L ${center} ${center}
              L ${center + 4} ${center - 5} Z`,
          fill: '#f56c6c',
          stroke: '#f56c6c',
          'stroke-width': 1,
        });
        pointerGroup?.appendChild(arrowPath);
        break;

      case 'triangle':
        // 三角形指针
        const trianglePath = createSVGElement('path', {
          d: `M ${center} ${center - pointerLength}
              L ${center - 6} ${center}
              L ${center + 6} ${center} Z`,
          fill: '#f56c6c',
        });
        pointerGroup?.appendChild(trianglePath);
        break;

      case 'line':
      default:
        // 线型指针
        this.pointer = createSVGElement('line', {
          x1: center,
          y1: center,
          x2: center,
          y2: center - pointerLength,
          stroke: '#f56c6c',
          'stroke-width': 3,
          'stroke-linecap': 'round',
        });
        pointerGroup?.appendChild(this.pointer);
        break;
    }

    // 添加中心圆点
    const centerDot = createSVGElement('circle', {
      cx: center,
      cy: center,
      r: 6,
      fill: '#f56c6c',
      stroke: '#fff',
      'stroke-width': 2,
    });
    pointerGroup?.appendChild(centerDot);
  }

  /**
   * 设置指针类型
   */
  setNeedleType(type: 'arrow' | 'line' | 'triangle'): void {
    this.config.set('needleType', type);
    this.updateNeedleStyle();
  }

  /**
   * 设置是否显示数字
   */
  setShowNumbers(show: boolean): void {
    this.config.set('showNumbers', show);
    if (show) {
      this.renderNumbers();
    } else {
      this.numberElements.forEach(el => el.remove());
      this.numberElements = [];
    }
  }
}


