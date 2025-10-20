import { HeartProgressOptions } from '../types';
import { ProgressBase } from '../base';
import { createSVGElement } from '../utils';

/**
 * 心形进度条
 */
export class HeartProgress extends ProgressBase<HeartProgressOptions> {
  private svg!: SVGSVGElement;
  private trackPath!: SVGPathElement;
  private progressPath!: SVGPathElement;
  private gradientPath?: SVGPathElement;
  private textElement?: HTMLElement;
  private gradientId?: string;
  private animationId?: number;

  protected getDefaultOptions(): Partial<HeartProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      heartSize: 100,
      fillMode: 'bottom-up',
      beatAnimation: false,
      beatSpeed: 1000,
    };
  }

  protected render(): void {
    // 清空容器
    this.container.innerHTML = '';

    const size = this.config.get('heartSize') ?? 100;

    // 创建SVG
    this.svg = createSVGElement('svg', {
      width: size,
      height: size,
      viewBox: '0 0 100 100',
      class: 'ld-progress-heart',
    }) as SVGSVGElement;

    // 添加自定义类名
    const className = this.config.get('className');
    if (className) {
      this.svg.classList.add(className);
    }

    this.container.appendChild(this.svg);

    // 心形路径
    const heartPath = 'M50,92 C25,75 8,55 8,40 C8,28 16,20 27,20 C35,20 42,24 50,32 C58,24 65,20 73,20 C84,20 92,28 92,40 C92,55 75,75 50,92 Z';

    // 创建渐变定义（如果需要）
    const color = this.config.get('color');
    if (Array.isArray(color) && color.length > 1) {
      this.createGradient(color);
    }

    // 创建轨道
    this.trackPath = createSVGElement('path', {
      d: heartPath,
      fill: this.config.get('trackColor') || '#ffe6e6',
      stroke: '#ffb3b3',
      'stroke-width': '1',
      class: 'ld-progress-heart__track',
    }) as SVGPathElement;
    this.svg.appendChild(this.trackPath);

    // 根据填充模式创建进度显示
    const fillMode = this.config.get('fillMode') ?? 'bottom-up';

    if (fillMode === 'bottom-up') {
      // 底部向上填充模式
      const clipPath = createSVGElement('clipPath', {
        id: `heart-clip-${this.id}`,
      });
      const clipRect = createSVGElement('rect', {
        x: '0',
        y: '100',
        width: '100',
        height: '0',
        class: 'ld-progress-heart__clip-rect',
      });
      clipPath.appendChild(clipRect);
      
      const defs = createSVGElement('defs');
      defs.appendChild(clipPath);
      this.svg.insertBefore(defs, this.trackPath);

      this.progressPath = createSVGElement('path', {
        d: heartPath,
        fill: this.getHeartColor(),
        'clip-path': `url(#heart-clip-${this.id})`,
        class: 'ld-progress-heart__progress',
      }) as SVGPathElement;
    } else if (fillMode === 'center-out') {
      // 中心向外扩展
      this.progressPath = createSVGElement('path', {
        d: heartPath,
        fill: this.getHeartColor(),
        transform: 'translate(50, 50) scale(0) translate(-50, -50)',
        class: 'ld-progress-heart__progress',
      }) as SVGPathElement;
      this.progressPath.style.transformOrigin = 'center';
      this.progressPath.style.transition = 'transform 0.3s';
    } else {
      // pulse 模式
      this.progressPath = createSVGElement('path', {
        d: heartPath,
        fill: this.getHeartColor(),
        opacity: '0',
        class: 'ld-progress-heart__progress',
      }) as SVGPathElement;
    }

    this.svg.appendChild(this.progressPath);

    // 创建文本
    if (this.config.get('showText')) {
      this.textElement = document.createElement('div');
      this.textElement.className = 'ld-progress-heart__text';
      this.textElement.style.position = 'absolute';
      this.textElement.style.top = '50%';
      this.textElement.style.left = '50%';
      this.textElement.style.transform = 'translate(-50%, -50%)';
      this.textElement.style.fontSize = '14px';
      this.textElement.style.fontWeight = 'bold';
      this.textElement.style.color = '#fff';
      this.textElement.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';

      this.container.style.position = 'relative';
      this.container.style.display = 'inline-block';
      this.container.appendChild(this.textElement);
    }

    // 启动心跳动画
    if (this.config.get('beatAnimation')) {
      this.startBeatAnimation();
    }

    // 更新进度
    this.updateProgress(this.currentValue);
  }

  protected createGradient(colors: string[]): void {
    this.gradientId = `heart-gradient-${this.id}`;

    const defs = this.svg.querySelector('defs') || createSVGElement('defs');
    const gradient = createSVGElement('linearGradient', {
      id: this.gradientId,
      x1: '0%',
      y1: '100%',
      x2: '0%',
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
    if (!this.svg.querySelector('defs')) {
      this.svg.insertBefore(defs, this.svg.firstChild);
    }
  }

  protected getHeartColor(): string {
    const color = this.config.get('color');
    if (this.gradientId) {
      return `url(#${this.gradientId})`;
    } else if (Array.isArray(color)) {
      return color[0];
    } else if (typeof color === 'string') {
      return color;
    }
    return '#ff4757';
  }

  protected updateProgress(value: number): void {
    if (!this.progressPath) return;

    const percentage = this.config.getPercentage(value);
    const fillMode = this.config.get('fillMode') ?? 'bottom-up';

    if (fillMode === 'bottom-up') {
      // 更新裁剪矩形
      const clipRect = this.svg.querySelector('.ld-progress-heart__clip-rect');
      if (clipRect) {
        clipRect.setAttribute('y', `${100 - percentage}`);
        clipRect.setAttribute('height', `${percentage}`);
      }
    } else if (fillMode === 'center-out') {
      // 更新缩放
      const scale = percentage / 100;
      this.progressPath.setAttribute(
        'transform',
        `translate(50, 50) scale(${scale}) translate(-50, -50)`
      );
    } else {
      // pulse 模式
      const opacity = percentage / 100;
      this.progressPath.setAttribute('opacity', `${opacity}`);
    }

    // 更新文本
    if (this.textElement) {
      this.textElement.textContent = this.formatText(value);
    }
  }

  /**
   * 启动心跳动画
   */
  private startBeatAnimation(): void {
    this.stopBeatAnimation();

    const beatSpeed = this.config.get('beatSpeed') ?? 1000;
    let scale = 1;
    let growing = true;

    const beat = () => {
      if (growing) {
        scale += 0.02;
        if (scale >= 1.1) {
          growing = false;
        }
      } else {
        scale -= 0.02;
        if (scale <= 1) {
          growing = true;
        }
      }

      this.svg.style.transform = `scale(${scale})`;
      this.svg.style.transformOrigin = 'center';

      this.animationId = requestAnimationFrame(beat);
    };

    beat();
  }

  /**
   * 停止心跳动画
   */
  private stopBeatAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
      this.svg.style.transform = 'scale(1)';
    }
  }

  /**
   * 设置心跳动画
   */
  setBeatAnimation(enabled: boolean): void {
    this.config.set('beatAnimation', enabled);
    if (enabled) {
      this.startBeatAnimation();
    } else {
      this.stopBeatAnimation();
    }
  }

  /**
   * 设置填充模式
   */
  setFillMode(mode: 'bottom-up' | 'center-out' | 'pulse'): void {
    this.config.set('fillMode', mode);
    this.render();
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopBeatAnimation();
    super.destroy();
  }
}


