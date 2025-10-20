import { CircleProgressOptions } from '../types';
import { ProgressBase } from '../base';
import { createSVGElement, setAttributes, degToRad, parseGradient } from '../utils';

/**
 * 圆形进度条
 */
export class CircleProgress extends ProgressBase<CircleProgressOptions> {
  protected svg!: SVGSVGElement;
  protected trackCircle!: SVGCircleElement;
  protected progressCircle!: SVGCircleElement;
  protected textElement?: HTMLElement;
  protected gradientId?: string;
  protected radius: number = 50;
  protected circumference: number = 0;

  protected getDefaultOptions(): Partial<CircleProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      radius: 50,
      strokeWidth: 6,
      clockwise: true,
      startAngle: -90,
      lineCap: 'round',
    };
  }

  protected render(): void {
    // 清空容器
    this.container.innerHTML = '';

    // 计算参数
    this.radius = this.config.get('radius') ?? 50;
    const strokeWidth = this.config.get('strokeWidth') ?? 6;
    const size = (this.radius + strokeWidth) * 2;

    // 创建SVG
    this.svg = createSVGElement('svg', {
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`,
      class: 'ld-progress-circle',
    }) as SVGSVGElement;

    // 添加自定义类名
    const className = this.config.get('className');
    if (className) {
      this.svg.classList.add(className);
    }

    this.container.appendChild(this.svg);

    // 创建渐变定义（如果需要）
    const color = this.config.get('color');
    if (Array.isArray(color) && color.length > 1) {
      this.createGradient(color);
    }

    // 创建轨道圆
    const center = size / 2;
    this.trackCircle = createSVGElement('circle', {
      cx: center,
      cy: center,
      r: this.radius,
      fill: 'none',
      stroke: this.config.get('trackColor') || '#e4e7ed',
      'stroke-width': strokeWidth,
      class: 'ld-progress-circle__track',
    }) as SVGCircleElement;
    this.svg.appendChild(this.trackCircle);

    // 创建进度圆
    this.progressCircle = createSVGElement('circle', {
      cx: center,
      cy: center,
      r: this.radius,
      fill: 'none',
      'stroke-width': strokeWidth,
      'stroke-linecap': this.config.get('lineCap') ?? 'round',
      class: 'ld-progress-circle__progress',
    }) as SVGCircleElement;

    // 设置颜色
    if (this.gradientId) {
      this.progressCircle.setAttribute('stroke', `url(#${this.gradientId})`);
    } else if (typeof color === 'string') {
      this.progressCircle.setAttribute('stroke', color);
    }

    // 计算周长
    this.circumference = 2 * Math.PI * this.radius;
    this.progressCircle.setAttribute('stroke-dasharray', `${this.circumference}`);

    // 设置旋转
    const startAngle = this.config.get('startAngle') ?? -90;
    const clockwise = this.config.get('clockwise') ?? true;
    this.progressCircle.style.transform = `rotate(${startAngle}deg)`;
    this.progressCircle.style.transformOrigin = 'center';
    
    if (!clockwise) {
      this.progressCircle.style.transform += ' scaleX(-1)';
    }

    this.svg.appendChild(this.progressCircle);

    // 创建文本元素
    if (this.config.get('showText')) {
      this.textElement = document.createElement('div');
      this.textElement.className = 'ld-progress-circle__text';
      this.textElement.style.position = 'absolute';
      this.textElement.style.top = '50%';
      this.textElement.style.left = '50%';
      this.textElement.style.transform = 'translate(-50%, -50%)';
      
      // 设置容器为相对定位
      this.container.style.position = 'relative';
      this.container.style.display = 'inline-block';
      
      this.container.appendChild(this.textElement);
    }

    // 更新进度
    this.updateProgress(this.currentValue);
  }

  protected createGradient(colors: string[]): void {
    this.gradientId = `gradient-${this.id}`;
    
    const defs = createSVGElement('defs') as SVGDefsElement;
    const gradient = createSVGElement('linearGradient', {
      id: this.gradientId,
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '0%',
    }) as SVGLinearGradientElement;

    colors.forEach((color, index) => {
      const offset = (index / (colors.length - 1)) * 100;
      const stop = createSVGElement('stop', {
        offset: `${offset}%`,
        'stop-color': color,
      });
      gradient.appendChild(stop);
    });

    defs.appendChild(gradient);
    this.svg.insertBefore(defs, this.svg.firstChild);
  }

  protected updateProgress(value: number): void {
    const percentage = this.config.getPercentage(value);
    
    // 更新进度圆
    const offset = this.circumference - (percentage / 100) * this.circumference;
    this.progressCircle.setAttribute('stroke-dashoffset', `${offset}`);

    // 更新文本
    if (this.textElement) {
      this.textElement.textContent = this.formatText(value);
    }
  }

  /**
   * 设置半径
   */
  setRadius(radius: number): void {
    this.config.set('radius', radius);
    this.render();
  }

  /**
   * 设置方向
   */
  setClockwise(clockwise: boolean): void {
    this.config.set('clockwise', clockwise);
    this.render();
  }

  /**
   * 设置起始角度
   */
  setStartAngle(angle: number): void {
    this.config.set('startAngle', angle);
    this.render();
  }

  /**
   * 设置线帽样式
   */
  setLineCap(lineCap: 'round' | 'square' | 'butt'): void {
    this.config.set('lineCap', lineCap);
    if (this.progressCircle) {
      this.progressCircle.setAttribute('stroke-linecap', lineCap);
    }
  }
}


