import { DashboardProgressOptions } from '../types';
import { SemiCircleProgress } from './SemiCircleProgress';
import { createSVGElement, degToRad, clamp } from '../utils';

/**
 * 仪表盘进度条
 */
export class DashboardProgress extends SemiCircleProgress {
  private pointer?: SVGElement;
  private colorRangeElements: SVGElement[] = [];

  protected getDefaultOptions(): Partial<DashboardProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      showPointer: true,
      colorRanges: undefined,
      warningZones: undefined,
      angleRange: 270,
      startAngle: -225,
      showScale: true,
      scaleCount: 10,
    };
  }

  protected render(): void {
    // 调用父类渲染
    super.render();

    // 渲染颜色范围
    const colorRanges = this.config.get('colorRanges');
    if (colorRanges && colorRanges.length > 0) {
      this.renderColorRanges(colorRanges);
    }

    // 渲染警告区域
    const warningZones = this.config.get('warningZones');
    if (warningZones && warningZones.length > 0) {
      this.renderWarningZones(warningZones);
    }

    // 创建指针
    if (this.config.get('showPointer')) {
      this.renderPointer();
    }

    // 更新进度
    this.updateProgress(this.currentValue);
  }

  protected renderColorRanges(ranges: Array<{ min: number; max: number; color: string }>): void {
    const strokeWidth = this.config.get('strokeWidth') ?? 6;
    const center = (this.radius + strokeWidth) * 2 / 2;
    const angleRange = this.config.get('angleRange') ?? 270;
    const startAngle = this.config.get('startAngle') ?? -225;
    const max = this.config.get('max') ?? 100;

    // 清除旧的颜色范围元素
    this.colorRangeElements.forEach(el => el.remove());
    this.colorRangeElements = [];

    ranges.forEach(range => {
      const startPercent = clamp(range.min / max, 0, 1);
      const endPercent = clamp(range.max / max, 0, 1);
      
      const startDeg = startAngle + angleRange * startPercent;
      const endDeg = startAngle + angleRange * endPercent;
      const sweepAngle = endDeg - startDeg;

      const startRad = degToRad(startDeg);
      const endRad = degToRad(endDeg);

      const innerRadius = this.radius - strokeWidth;
      const outerRadius = this.radius;

      // 创建路径
      const path = createSVGElement('path', {
        fill: range.color,
        opacity: '0.3',
        class: 'ld-progress-dashboard__range',
      });

      const x1 = center + innerRadius * Math.cos(startRad);
      const y1 = center + innerRadius * Math.sin(startRad);
      const x2 = center + outerRadius * Math.cos(startRad);
      const y2 = center + outerRadius * Math.sin(startRad);
      const x3 = center + outerRadius * Math.cos(endRad);
      const y3 = center + outerRadius * Math.sin(endRad);
      const x4 = center + innerRadius * Math.cos(endRad);
      const y4 = center + innerRadius * Math.sin(endRad);

      const largeArc = sweepAngle > 180 ? 1 : 0;

      const d = [
        `M ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}`,
        `L ${x4} ${y4}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}`,
        'Z'
      ].join(' ');

      path.setAttribute('d', d);
      this.svg.insertBefore(path, this.trackCircle);
      this.colorRangeElements.push(path);
    });
  }

  protected renderWarningZones(zones: Array<{ min: number; max: number; color?: string }>): void {
    const defaultColor = '#f56c6c';
    zones.forEach(zone => {
      this.colorRangeElements.push(...this.colorRangeElements);
    });
  }

  protected renderPointer(): void {
    const strokeWidth = this.config.get('strokeWidth') ?? 6;
    const center = (this.radius + strokeWidth) * 2 / 2;
    const pointerLength = this.radius - strokeWidth / 2;

    // 创建指针组
    const pointerGroup = createSVGElement('g', {
      class: 'ld-progress-dashboard__pointer',
    });

    // 创建指针线
    this.pointer = createSVGElement('line', {
      x1: center,
      y1: center,
      x2: center,
      y2: center - pointerLength,
      stroke: '#f56c6c',
      'stroke-width': 2,
      'stroke-linecap': 'round',
    });

    // 创建中心圆点
    const centerDot = createSVGElement('circle', {
      cx: center,
      cy: center,
      r: 4,
      fill: '#f56c6c',
    });

    pointerGroup.appendChild(this.pointer);
    pointerGroup.appendChild(centerDot);
    this.svg.appendChild(pointerGroup);

    // 设置旋转中心
    pointerGroup.style.transformOrigin = `${center}px ${center}px`;
  }

  protected updateProgress(value: number): void {
    // 调用父类更新
    super.updateProgress(value);

    // 更新指针旋转
    if (this.pointer) {
      const percentage = this.config.getPercentage(value);
      const angleRange = this.config.get('angleRange') ?? 270;
      const startAngle = this.config.get('startAngle') ?? -225;
      const angle = startAngle + (angleRange * percentage) / 100;

      const pointerGroup = this.pointer.parentElement;
      if (pointerGroup) {
        pointerGroup.style.transform = `rotate(${angle}deg)`;
      }
    }

    // 根据颜色范围改变进度条颜色
    const colorRanges = this.config.get('colorRanges');
    if (colorRanges && colorRanges.length > 0) {
      const currentRange = colorRanges.find(
        range => value >= range.min && value <= range.max
      );
      if (currentRange && this.progressCircle) {
        this.progressCircle.setAttribute('stroke', currentRange.color);
      }
    }
  }

  /**
   * 设置是否显示指针
   */
  setShowPointer(show: boolean): void {
    this.config.set('showPointer', show);
    this.render();
  }

  /**
   * 设置颜色范围
   */
  setColorRanges(ranges: Array<{ min: number; max: number; color: string }>): void {
    this.config.set('colorRanges', ranges);
    this.render();
  }
}


