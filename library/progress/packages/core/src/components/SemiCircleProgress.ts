import { SemiCircleProgressOptions } from '../types';
import { CircleProgress } from './CircleProgress';
import { createSVGElement, degToRad } from '../utils';

/**
 * 半圆进度条
 */
export class SemiCircleProgress extends CircleProgress {
  private scaleElements: SVGElement[] = [];

  protected getDefaultOptions(): Partial<SemiCircleProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      angleRange: 180,
      showScale: false,
      scaleCount: 10,
      startAngle: -180,
    };
  }

  protected render(): void {
    // 调用父类渲染
    super.render();

    // 调整SVG视图框以适应半圆
    const angleRange = this.config.get('angleRange') ?? 180;
    if (angleRange <= 180) {
      const strokeWidth = this.config.get('strokeWidth') ?? 6;
      const size = (this.radius + strokeWidth) * 2;
      const height = size / 2 + strokeWidth * 2;
      
      this.svg.setAttribute('viewBox', `0 ${size / 2 - strokeWidth} ${size} ${height}`);
      this.svg.setAttribute('height', `${height}`);
    }

    // 更新周长计算
    const angleRad = degToRad(angleRange);
    this.circumference = this.radius * angleRad;
    this.progressCircle.setAttribute('stroke-dasharray', `${this.circumference} ${2 * Math.PI * this.radius}`);

    // 添加刻度
    if (this.config.get('showScale')) {
      this.renderScale();
    }

    // 重新更新进度
    this.updateProgress(this.currentValue);
  }

  protected renderScale(): void {
    const scaleCount = this.config.get('scaleCount') ?? 10;
    const angleRange = this.config.get('angleRange') ?? 180;
    const startAngle = this.config.get('startAngle') ?? -180;
    const strokeWidth = this.config.get('strokeWidth') ?? 6;
    const center = (this.radius + strokeWidth) * 2 / 2;

    // 清除旧刻度
    this.scaleElements.forEach(el => el.remove());
    this.scaleElements = [];

    for (let i = 0; i <= scaleCount; i++) {
      const angle = startAngle + (angleRange / scaleCount) * i;
      const angleRad = degToRad(angle);
      
      const innerRadius = this.radius - strokeWidth / 2 - 5;
      const outerRadius = this.radius - strokeWidth / 2 + 5;

      const x1 = center + innerRadius * Math.cos(angleRad);
      const y1 = center + innerRadius * Math.sin(angleRad);
      const x2 = center + outerRadius * Math.cos(angleRad);
      const y2 = center + outerRadius * Math.sin(angleRad);

      const line = createSVGElement('line', {
        x1,
        y1,
        x2,
        y2,
        stroke: '#909399',
        'stroke-width': 1,
        class: 'ld-progress-semicircle__scale',
      });

      this.svg.appendChild(line);
      this.scaleElements.push(line);
    }
  }

  protected updateProgress(value: number): void {
    const percentage = this.config.getPercentage(value);
    const angleRange = this.config.get('angleRange') ?? 180;
    
    // 计算偏移量
    const progress = (percentage / 100) * (angleRange / 360);
    const offset = this.circumference - progress * this.circumference * (360 / angleRange);
    
    this.progressCircle.setAttribute('stroke-dashoffset', `${offset}`);

    // 更新文本
    if (this.textElement) {
      this.textElement.textContent = this.formatText(value);
      
      // 调整文本位置到底部
      this.textElement.style.top = '80%';
    }
  }

  /**
   * 设置角度范围
   */
  setAngleRange(angleRange: number): void {
    this.config.set('angleRange', angleRange);
    this.render();
  }

  /**
   * 设置是否显示刻度
   */
  setShowScale(showScale: boolean): void {
    this.config.set('showScale', showScale);
    this.render();
  }

  /**
   * 设置刻度数量
   */
  setScaleCount(count: number): void {
    this.config.set('scaleCount', count);
    this.render();
  }
}


