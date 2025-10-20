import { CustomShapeProgressOptions } from '../types';
import { ProgressBase } from '../base';
import { createSVGElement, setAttributes, parseGradient } from '../utils';

/**
 * 自定义形状进度条
 */
export class CustomShapeProgress extends ProgressBase<CustomShapeProgressOptions> {
  private svg!: SVGSVGElement;
  private trackPath!: SVGPathElement;
  private progressPath!: SVGPathElement;
  private textElement?: HTMLElement;
  private gradientId?: string;
  private pathString: string = '';

  protected getDefaultOptions(): Partial<CustomShapeProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      shapeWidth: 200,
      shapeHeight: 200,
      fillMode: 'solid',
    };
  }

  protected render(): void {
    // 清空容器
    this.container.innerHTML = '';

    // 获取形状路径
    const shapePath = this.config.get('shapePath');
    if (!shapePath) {
      console.error('CustomShapeProgress: shapePath is required');
      return;
    }

    const width = this.config.get('shapeWidth') ?? 200;
    const height = this.config.get('shapeHeight') ?? 200;

    // 生成路径字符串
    if (typeof shapePath === 'function') {
      this.pathString = shapePath(width as number, height as number);
    } else {
      this.pathString = shapePath;
    }

    // 创建SVG
    this.svg = createSVGElement('svg', {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      class: 'ld-progress-custom-shape',
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

    // 创建轨道路径
    this.trackPath = createSVGElement('path', {
      d: this.pathString,
      fill: 'none',
      stroke: this.config.get('trackColor') || '#e4e7ed',
      'stroke-width': this.config.get('strokeWidth') || 6,
      class: 'ld-progress-custom-shape__track',
    }) as SVGPathElement;
    this.svg.appendChild(this.trackPath);

    // 创建进度路径
    this.progressPath = createSVGElement('path', {
      d: this.pathString,
      fill: 'none',
      'stroke-width': this.config.get('strokeWidth') || 6,
      class: 'ld-progress-custom-shape__progress',
    }) as SVGPathElement;

    // 设置颜色
    if (this.gradientId) {
      this.progressPath.setAttribute('stroke', `url(#${this.gradientId})`);
    } else if (typeof color === 'string') {
      this.progressPath.setAttribute('stroke', color);
    } else {
      this.progressPath.setAttribute('stroke', '#409eff');
    }

    // 计算路径总长度
    const pathLength = this.progressPath.getTotalLength();
    this.progressPath.style.strokeDasharray = `${pathLength}`;
    this.progressPath.style.strokeDashoffset = `${pathLength}`;
    this.progressPath.style.transition = 'stroke-dashoffset 0.3s';

    this.svg.appendChild(this.progressPath);

    // 创建文本元素
    if (this.config.get('showText')) {
      this.textElement = document.createElement('div');
      this.textElement.className = 'ld-progress-custom-shape__text';
      this.textElement.style.position = 'absolute';
      this.textElement.style.top = '50%';
      this.textElement.style.left = '50%';
      this.textElement.style.transform = 'translate(-50%, -50%)';
      this.textElement.style.fontSize = '18px';
      this.textElement.style.fontWeight = 'bold';

      this.container.style.position = 'relative';
      this.container.style.display = 'inline-block';
      this.container.appendChild(this.textElement);
    }

    // 更新进度
    this.updateProgress(this.currentValue);
  }

  protected createGradient(colors: string[]): void {
    this.gradientId = `custom-gradient-${this.id}`;

    const defs = createSVGElement('defs') as SVGDefsElement;
    const gradient = createSVGElement('linearGradient', {
      id: this.gradientId,
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '100%',
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
    if (!this.progressPath) return;

    const percentage = this.config.getPercentage(value);
    const pathLength = this.progressPath.getTotalLength();
    const offset = pathLength - (percentage / 100) * pathLength;

    this.progressPath.style.strokeDashoffset = `${offset}`;

    // 更新文本
    if (this.textElement) {
      this.textElement.textContent = this.formatText(value);
    }
  }

  /**
   * 设置自定义路径
   */
  setShapePath(path: string | ((width: number, height: number) => string)): void {
    this.config.set('shapePath', path);
    this.render();
  }
}


