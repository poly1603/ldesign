import { ImageProgressOptions } from '../types';
import { ProgressBase } from '../base';
import { createElement, toPx } from '../utils';

/**
 * 图片填充进度条
 */
export class ImageProgress extends ProgressBase<ImageProgressOptions> {
  private wrapper!: HTMLElement;
  private imageContainer!: HTMLElement;
  private image!: HTMLImageElement;
  private maskElement?: HTMLElement;
  private textElement?: HTMLElement;
  private imageLoaded: boolean = false;

  protected getDefaultOptions(): Partial<ImageProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      imageWidth: 200,
      imageHeight: 200,
      fillDirection: 'horizontal',
      maskMode: false,
      objectFit: 'cover',
    };
  }

  protected render(): void {
    // 清空容器
    this.container.innerHTML = '';

    // 创建包装器
    this.wrapper = createElement('div', 'ld-progress-image', this.container);
    this.wrapper.style.position = 'relative';
    this.wrapper.style.display = 'inline-block';

    // 设置尺寸
    const width = this.config.get('imageWidth') ?? 200;
    const height = this.config.get('imageHeight') ?? 200;
    this.wrapper.style.width = toPx(width);
    this.wrapper.style.height = toPx(height);
    this.wrapper.style.overflow = 'hidden';

    // 添加自定义类名
    const className = this.config.get('className');
    if (className) {
      this.wrapper.classList.add(className);
    }

    // 创建图片容器
    this.imageContainer = createElement('div', 'ld-progress-image__container', this.wrapper);
    this.imageContainer.style.position = 'relative';
    this.imageContainer.style.width = '100%';
    this.imageContainer.style.height = '100%';

    // 创建图片
    this.image = document.createElement('img');
    this.image.className = 'ld-progress-image__img';
    this.image.style.width = '100%';
    this.image.style.height = '100%';
    this.image.style.objectFit = this.config.get('objectFit') || 'cover';
    
    const imageSrc = this.config.get('imageSrc');
    if (!imageSrc) {
      console.error('ImageProgress: imageSrc is required');
      return;
    }

    this.image.src = imageSrc;
    this.image.onload = () => {
      this.imageLoaded = true;
      this.updateProgress(this.currentValue);
    };
    this.image.onerror = () => {
      console.error('ImageProgress: Failed to load image:', imageSrc);
    };

    this.imageContainer.appendChild(this.image);

    // 创建遮罩层
    if (this.config.get('maskMode')) {
      this.maskElement = createElement('div', 'ld-progress-image__mask', this.wrapper);
      this.maskElement.style.position = 'absolute';
      this.maskElement.style.top = '0';
      this.maskElement.style.left = '0';
      this.maskElement.style.width = '100%';
      this.maskElement.style.height = '100%';
      this.maskElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      this.maskElement.style.transition = 'all 0.3s';
    }

    // 创建文本
    if (this.config.get('showText')) {
      this.textElement = createElement('div', 'ld-progress-image__text', this.wrapper);
      this.textElement.style.position = 'absolute';
      this.textElement.style.top = '50%';
      this.textElement.style.left = '50%';
      this.textElement.style.transform = 'translate(-50%, -50%)';
      this.textElement.style.color = 'white';
      this.textElement.style.fontSize = '24px';
      this.textElement.style.fontWeight = 'bold';
      this.textElement.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
      this.textElement.style.zIndex = '10';
    }

    // 更新进度
    this.updateProgress(this.currentValue);
  }

  protected updateProgress(value: number): void {
    if (!this.imageLoaded) return;

    const percentage = this.config.getPercentage(value);
    const direction = this.config.get('fillDirection') ?? 'horizontal';

    if (this.config.get('maskMode') && this.maskElement) {
      // 遮罩模式：通过改变遮罩的透明度或大小
      const opacity = 1 - percentage / 100;
      this.maskElement.style.opacity = `${opacity}`;
    } else {
      // 裁剪模式：通过 clip-path 裁剪图片
      const clipPath = this.getClipPath(percentage, direction);
      this.imageContainer.style.clipPath = clipPath;
    }

    // 更新文本
    if (this.textElement) {
      this.textElement.textContent = this.formatText(value);
    }
  }

  /**
   * 根据进度和方向生成 clip-path
   */
  private getClipPath(percentage: number, direction: string): string {
    switch (direction) {
      case 'horizontal':
        return `inset(0 ${100 - percentage}% 0 0)`;
      case 'vertical':
        return `inset(${100 - percentage}% 0 0 0)`;
      case 'radial':
        // 径向填充使用 circle
        const radius = percentage / 2;
        return `circle(${radius}% at 50% 50%)`;
      default:
        return `inset(0 ${100 - percentage}% 0 0)`;
    }
  }

  /**
   * 设置图片源
   */
  setImageSrc(src: string): void {
    this.config.set('imageSrc', src);
    this.imageLoaded = false;
    if (this.image) {
      this.image.src = src;
    }
  }

  /**
   * 设置填充方向
   */
  setFillDirection(direction: 'horizontal' | 'vertical' | 'radial'): void {
    this.config.set('fillDirection', direction);
    this.updateProgress(this.currentValue);
  }
}


