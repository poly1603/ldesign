import { LinearProgressOptions } from '../types';
import { ProgressBase } from '../base';
import { createElement, toPx, parseGradient } from '../utils';

/**
 * 线性进度条
 */
export class LinearProgress extends ProgressBase<LinearProgressOptions> {
  private wrapper!: HTMLElement;
  private track!: HTMLElement;
  private bar!: HTMLElement;
  private bufferBar?: HTMLElement;
  private textElement?: HTMLElement;
  private segmentBars: HTMLElement[] = [];

  protected getDefaultOptions(): Partial<LinearProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      direction: 'horizontal',
      strokeWidth: 6,
      buffer: undefined,
      segments: undefined,
      striped: false,
      active: false,
      indeterminate: false,
    };
  }

  protected render(): void {
    // 清空容器
    this.container.innerHTML = '';

    // 创建包装器
    this.wrapper = createElement('div', 'ld-progress-linear', this.container);
    const direction = this.config.get('direction') ?? 'horizontal';
    this.wrapper.classList.add(`ld-progress-linear--${direction}`);

    // 添加自定义类名
    const className = this.config.get('className');
    if (className) {
      this.wrapper.classList.add(className);
    }

    // 设置尺寸
    const strokeWidth = this.config.get('strokeWidth') ?? 6;
    if (direction === 'horizontal') {
      this.wrapper.style.height = toPx(strokeWidth);
      const width = this.config.get('width');
      if (width) {
        this.wrapper.style.width = toPx(width);
      }
    } else {
      this.wrapper.style.width = toPx(strokeWidth);
      const height = this.config.get('height');
      if (height) {
        this.wrapper.style.height = toPx(height);
      }
    }

    // 创建轨道
    this.track = createElement('div', 'ld-progress-linear__track', this.wrapper);
    const trackColor = this.config.get('trackColor');
    if (trackColor) {
      this.track.style.backgroundColor = trackColor;
    }

    // 创建缓冲条
    const buffer = this.config.get('buffer');
    if (buffer !== undefined) {
      this.bufferBar = createElement('div', 'ld-progress-linear__buffer', this.track);
      this.updateBuffer(buffer);
    }

    // 创建进度条或分段
    const segments = this.config.get('segments');
    if (segments && segments.length > 0) {
      this.renderSegments();
    } else {
      this.bar = createElement('div', 'ld-progress-linear__bar', this.track);
      
      // 设置颜色
      const color = this.config.get('color');
      if (color) {
        this.bar.style.background = parseGradient(color, direction === 'horizontal' ? 'to right' : 'to top');
      }

      // 添加条纹
      if (this.config.get('striped')) {
        this.bar.classList.add('ld-progress-linear__bar--striped');
      }

      // 添加动画
      if (this.config.get('active')) {
        this.bar.classList.add('ld-progress-linear__bar--active');
      }

      // 不确定状态
      if (this.config.get('indeterminate')) {
        this.bar.classList.add('ld-progress-linear__bar--indeterminate');
      }
    }

    // 创建文本
    if (this.config.get('showText')) {
      const textInside = this.config.get('textInside');
      this.textElement = createElement(
        'div',
        'ld-progress-linear__text',
        textInside ? this.bar || this.wrapper : this.container
      );
      if (textInside) {
        this.textElement.classList.add('ld-progress-linear__text--inside');
      }
    }

    // 更新进度
    this.updateProgress(this.currentValue);
  }

  protected renderSegments(): void {
    const segments = this.config.get('segments')!;
    const direction = this.config.get('direction') ?? 'horizontal';
    const gap = this.config.get('gap') ?? 0;

    this.segmentBars = [];
    let accumulatedValue = 0;

    segments.forEach((segment, index) => {
      const segmentBar = createElement('div', 'ld-progress-linear__segment', this.track);
      
      // 设置颜色
      if (segment.color) {
        segmentBar.style.backgroundColor = segment.color;
      }

      // 计算位置和大小
      const percentage = (segment.value / (this.config.get('max') ?? 100)) * 100;
      
      if (direction === 'horizontal') {
        segmentBar.style.left = `${accumulatedValue}%`;
        segmentBar.style.width = `calc(${percentage}% - ${gap}px)`;
      } else {
        segmentBar.style.bottom = `${accumulatedValue}%`;
        segmentBar.style.height = `calc(${percentage}% - ${gap}px)`;
      }

      accumulatedValue += percentage;
      this.segmentBars.push(segmentBar);

      // 添加标签
      if (segment.label) {
        const label = createElement('span', 'ld-progress-linear__segment-label', segmentBar);
        label.textContent = segment.label;
      }
    });
  }

  protected updateProgress(value: number): void {
    const percentage = this.config.getPercentage(value);
    const direction = this.config.get('direction') ?? 'horizontal';

    // 更新进度条
    if (this.bar && !this.config.get('indeterminate')) {
      if (direction === 'horizontal') {
        this.bar.style.width = `${percentage}%`;
      } else {
        this.bar.style.height = `${percentage}%`;
      }
    }

    // 更新文本
    if (this.textElement) {
      this.textElement.textContent = this.formatText(value);
    }
  }

  /**
   * 更新缓冲进度
   */
  updateBuffer(buffer: number): void {
    if (!this.bufferBar) return;

    const percentage = this.config.getPercentage(buffer);
    const direction = this.config.get('direction') ?? 'horizontal';

    if (direction === 'horizontal') {
      this.bufferBar.style.width = `${percentage}%`;
    } else {
      this.bufferBar.style.height = `${percentage}%`;
    }
  }

  /**
   * 设置缓冲值
   */
  setBuffer(buffer: number): void {
    this.config.set('buffer', buffer);
    this.updateBuffer(buffer);
  }

  /**
   * 设置方向
   */
  setDirection(direction: 'horizontal' | 'vertical'): void {
    this.config.set('direction', direction);
    this.render();
  }

  /**
   * 设置条纹
   */
  setStriped(striped: boolean): void {
    this.config.set('striped', striped);
    if (this.bar) {
      this.bar.classList.toggle('ld-progress-linear__bar--striped', striped);
    }
  }

  /**
   * 设置激活动画
   */
  setActive(active: boolean): void {
    this.config.set('active', active);
    if (this.bar) {
      this.bar.classList.toggle('ld-progress-linear__bar--active', active);
    }
  }

  /**
   * 设置不确定状态
   */
  setIndeterminate(indeterminate: boolean): void {
    this.config.set('indeterminate', indeterminate);
    if (this.bar) {
      this.bar.classList.toggle('ld-progress-linear__bar--indeterminate', indeterminate);
    }
  }
}


