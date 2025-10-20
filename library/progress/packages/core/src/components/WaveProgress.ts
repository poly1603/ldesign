import { WaveProgressOptions } from '../types';
import { ProgressBase } from '../base';
import { createElement, createSVGElement, toPx } from '../utils';

/**
 * 水波纹进度条
 */
export class WaveProgress extends ProgressBase<WaveProgressOptions> {
  private wrapper!: HTMLElement;
  private canvas?: HTMLCanvasElement;
  private svg?: SVGSVGElement;
  private ctx?: CanvasRenderingContext2D;
  private textElement?: HTMLElement;
  private animationId?: number;
  private waveOffset: number = 0;

  protected getDefaultOptions(): Partial<WaveProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      width: 200,
      height: 200,
      waveHeight: 10,
      waveCount: 2,
      waveSpeed: 0.05,
      renderMode: 'canvas',
    };
  }

  protected render(): void {
    // 清空容器
    this.container.innerHTML = '';

    // 创建包装器
    this.wrapper = createElement('div', 'ld-progress-wave', this.container);
    this.wrapper.style.position = 'relative';
    this.wrapper.style.display = 'inline-block';

    // 添加自定义类名
    const className = this.config.get('className');
    if (className) {
      this.wrapper.classList.add(className);
    }

    // 设置尺寸
    const width = this.config.get('width') ?? 200;
    const height = this.config.get('height') ?? 200;
    this.wrapper.style.width = toPx(width);
    this.wrapper.style.height = toPx(height);
    this.wrapper.style.borderRadius = '50%';
    this.wrapper.style.overflow = 'hidden';
    this.wrapper.style.backgroundColor = this.config.get('trackColor') || '#e4e7ed';

    // 根据渲染模式创建元素
    const renderMode = this.config.get('renderMode') ?? 'canvas';
    if (renderMode === 'canvas') {
      this.renderCanvas();
    } else {
      this.renderSVG();
    }

    // 创建文本
    if (this.config.get('showText')) {
      this.textElement = createElement('div', 'ld-progress-wave__text', this.wrapper);
      this.textElement.style.position = 'absolute';
      this.textElement.style.top = '50%';
      this.textElement.style.left = '50%';
      this.textElement.style.transform = 'translate(-50%, -50%)';
      this.textElement.style.zIndex = '10';
      this.textElement.style.fontWeight = 'bold';
    }

    // 更新进度
    this.updateProgress(this.currentValue);

    // 开始动画
    if (this.config.get('animated')) {
      this.startWaveAnimation();
    }
  }

  protected renderCanvas(): void {
    const width = this.config.get('width') ?? 200;
    const height = this.config.get('height') ?? 200;

    this.canvas = createElement('canvas', 'ld-progress-wave__canvas', this.wrapper) as HTMLCanvasElement;
    this.canvas.width = typeof width === 'number' ? width : parseInt(width);
    this.canvas.height = typeof height === 'number' ? height : parseInt(height);
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';

    this.ctx = this.canvas.getContext('2d')!;
  }

  protected renderSVG(): void {
    const width = this.config.get('width') ?? 200;
    const height = this.config.get('height') ?? 200;

    this.svg = createSVGElement('svg', {
      width: typeof width === 'number' ? width : parseInt(width),
      height: typeof height === 'number' ? height : parseInt(height),
      class: 'ld-progress-wave__svg',
    }) as SVGSVGElement;

    this.svg.style.position = 'absolute';
    this.svg.style.top = '0';
    this.svg.style.left = '0';

    this.wrapper.appendChild(this.svg);
  }

  protected updateProgress(value: number): void {
    const percentage = this.config.getPercentage(value);

    // 更新文本
    if (this.textElement) {
      this.textElement.textContent = this.formatText(value);
    }

    // 如果不是动画模式，立即绘制
    if (!this.config.get('animated')) {
      this.drawWave(percentage);
    }
  }

  /**
   * 开始波浪动画
   */
  private startWaveAnimation(): void {
    this.stopWaveAnimation();

    const animate = () => {
      const percentage = this.config.getPercentage(this.currentValue);
      this.drawWave(percentage);
      
      // 更新偏移量
      const waveSpeed = this.config.get('waveSpeed') ?? 0.05;
      this.waveOffset += waveSpeed;
      
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * 停止波浪动画
   */
  private stopWaveAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  /**
   * 绘制波浪
   */
  private drawWave(percentage: number): void {
    const renderMode = this.config.get('renderMode') ?? 'canvas';
    
    if (renderMode === 'canvas' && this.ctx && this.canvas) {
      this.drawCanvasWave(percentage);
    } else if (renderMode === 'svg' && this.svg) {
      this.drawSVGWave(percentage);
    }
  }

  /**
   * Canvas 绘制波浪
   */
  private drawCanvasWave(percentage: number): void {
    if (!this.ctx || !this.canvas) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const waveHeight = this.config.get('waveHeight') ?? 10;
    const waveCount = this.config.get('waveCount') ?? 2;

    // 清除画布
    this.ctx.clearRect(0, 0, width, height);

    // 计算水位高度
    const waterLevel = height - (height * percentage) / 100;

    // 绘制波浪
    this.ctx.beginPath();
    this.ctx.moveTo(0, waterLevel);

    for (let x = 0; x <= width; x++) {
      const y =
        waterLevel +
        Math.sin((x / width) * Math.PI * waveCount + this.waveOffset) * waveHeight;
      this.ctx.lineTo(x, y);
    }

    this.ctx.lineTo(width, height);
    this.ctx.lineTo(0, height);
    this.ctx.closePath();

    // 填充颜色
    const color = this.config.get('color');
    const fillColor = Array.isArray(color) ? color[0] : color || '#409eff';
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
  }

  /**
   * SVG 绘制波浪
   */
  private drawSVGWave(percentage: number): void {
    if (!this.svg) return;

    const width = typeof this.config.get('width') === 'number' 
      ? this.config.get('width') as number 
      : parseInt(this.config.get('width') as string);
    const height = typeof this.config.get('height') === 'number' 
      ? this.config.get('height') as number 
      : parseInt(this.config.get('height') as string);
    const waveHeight = this.config.get('waveHeight') ?? 10;
    const waveCount = this.config.get('waveCount') ?? 2;

    // 清除旧路径
    this.svg.innerHTML = '';

    // 计算水位高度
    const waterLevel = height - (height * percentage) / 100;

    // 创建路径
    let pathData = `M 0 ${waterLevel}`;

    for (let x = 0; x <= width; x++) {
      const y =
        waterLevel +
        Math.sin((x / width) * Math.PI * waveCount + this.waveOffset) * waveHeight;
      pathData += ` L ${x} ${y}`;
    }

    pathData += ` L ${width} ${height} L 0 ${height} Z`;

    // 创建路径元素
    const path = createSVGElement('path', {
      d: pathData,
      class: 'ld-progress-wave__path',
    });

    // 设置颜色
    const color = this.config.get('color');
    const fillColor = Array.isArray(color) ? color[0] : color || '#409eff';
    path.setAttribute('fill', fillColor);

    this.svg.appendChild(path);
  }

  /**
   * 设置波浪高度
   */
  setWaveHeight(height: number): void {
    this.config.set('waveHeight', height);
  }

  /**
   * 设置波浪数量
   */
  setWaveCount(count: number): void {
    this.config.set('waveCount', count);
  }

  /**
   * 设置波浪速度
   */
  setWaveSpeed(speed: number): void {
    this.config.set('waveSpeed', speed);
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopWaveAnimation();
    super.destroy();
  }
}


