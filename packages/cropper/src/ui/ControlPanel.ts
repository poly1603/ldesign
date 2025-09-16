/**
 * @ldesign/cropper - 控制面板组件
 * 
 * 提供裁剪参数设置和配置选项的界面
 */

import type { CropData, AspectRatio, ImageProcessOptions } from '../types';
import { ASPECT_RATIOS, CSS_CLASSES } from '../constants';

/**
 * 控制面板配置
 */
export interface ControlPanelConfig {
  show: boolean;
  position: 'left' | 'right' | 'top' | 'bottom';
  collapsible: boolean;
  sections: string[];
}

/**
 * 控制面板类
 * 
 * 提供裁剪参数和图像处理选项的控制界面
 */
export class ControlPanel {
  private container: HTMLElement;
  private element: HTMLElement;
  private config: ControlPanelConfig;
  private isCollapsed: boolean = false;
  private sections: Map<string, HTMLElement> = new Map();

  constructor(container: HTMLElement, config: ControlPanelConfig) {
    this.container = container;
    this.config = config;
    this.element = this.createElement();
    
    this.render();
    this.setupEventListeners();
  }

  /**
   * 创建控制面板元素
   */
  private createElement(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = `${CSS_CLASSES.CONTAINER}__control-panel control-panel--${this.config.position}`;
    
    return panel;
  }

  /**
   * 渲染控制面板
   */
  private render(): void {
    this.element.innerHTML = '';
    this.sections.clear();

    // 创建标题栏
    if (this.config.collapsible) {
      const header = this.createHeader();
      this.element.appendChild(header);
    }

    // 创建内容区域
    const content = document.createElement('div');
    content.className = 'control-panel__content';
    
    if (this.isCollapsed) {
      content.style.display = 'none';
    }

    // 创建各个部分
    this.config.sections.forEach(sectionId => {
      const section = this.createSection(sectionId);
      if (section) {
        content.appendChild(section);
        this.sections.set(sectionId, section);
      }
    });

    this.element.appendChild(content);

    if (this.config.show) {
      this.container.appendChild(this.element);
    }
  }

  /**
   * 创建标题栏
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'control-panel__header';

    const title = document.createElement('h3');
    title.textContent = '控制面板';
    title.className = 'control-panel__title';

    const toggleButton = document.createElement('button');
    toggleButton.className = 'control-panel__toggle';
    toggleButton.innerHTML = this.isCollapsed ? '▼' : '▲';
    toggleButton.addEventListener('click', () => this.toggle());

    header.appendChild(title);
    header.appendChild(toggleButton);

    return header;
  }

  /**
   * 创建部分
   */
  private createSection(sectionId: string): HTMLElement | null {
    const section = document.createElement('div');
    section.className = `control-panel__section control-panel__section--${sectionId}`;

    const title = document.createElement('h4');
    title.className = 'control-panel__section-title';

    const content = document.createElement('div');
    content.className = 'control-panel__section-content';

    switch (sectionId) {
      case 'crop':
        title.textContent = '裁剪设置';
        content.appendChild(this.createCropControls());
        break;
      case 'transform':
        title.textContent = '变换设置';
        content.appendChild(this.createTransformControls());
        break;
      case 'image-process':
        title.textContent = '图像处理';
        content.appendChild(this.createImageProcessControls());
        break;
      case 'export':
        title.textContent = '导出设置';
        content.appendChild(this.createExportControls());
        break;
      default:
        return null;
    }

    section.appendChild(title);
    section.appendChild(content);

    return section;
  }

  /**
   * 创建裁剪控制
   */
  private createCropControls(): HTMLElement {
    const container = document.createElement('div');

    // 宽高比选择
    const aspectRatioGroup = this.createFormGroup('宽高比', 'select');
    const aspectRatioSelect = aspectRatioGroup.querySelector('select')!;
    
    Object.entries(ASPECT_RATIOS).forEach(([key, value]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = key === 'FREE' ? '自由' : value;
      aspectRatioSelect.appendChild(option);
    });

    aspectRatioSelect.addEventListener('change', () => {
      this.emitChange('aspectRatio', aspectRatioSelect.value as AspectRatio);
    });

    // 裁剪区域位置和尺寸
    const positionGroup = this.createFormGroup('位置', 'number-group');
    const xInput = this.createNumberInput('X', 0);
    const yInput = this.createNumberInput('Y', 0);
    positionGroup.querySelector('.form-group__content')!.appendChild(xInput);
    positionGroup.querySelector('.form-group__content')!.appendChild(yInput);

    const sizeGroup = this.createFormGroup('尺寸', 'number-group');
    const widthInput = this.createNumberInput('宽度', 100);
    const heightInput = this.createNumberInput('高度', 100);
    sizeGroup.querySelector('.form-group__content')!.appendChild(widthInput);
    sizeGroup.querySelector('.form-group__content')!.appendChild(heightInput);

    container.appendChild(aspectRatioGroup);
    container.appendChild(positionGroup);
    container.appendChild(sizeGroup);

    return container;
  }

  /**
   * 创建变换控制
   */
  private createTransformControls(): HTMLElement {
    const container = document.createElement('div');

    // 旋转
    const rotationGroup = this.createFormGroup('旋转', 'range');
    const rotationRange = rotationGroup.querySelector('input')!;
    rotationRange.min = '-180';
    rotationRange.max = '180';
    rotationRange.value = '0';
    rotationRange.addEventListener('input', () => {
      this.emitChange('rotation', parseFloat(rotationRange.value));
    });

    // 缩放
    const scaleGroup = this.createFormGroup('缩放', 'range');
    const scaleRange = scaleGroup.querySelector('input')!;
    scaleRange.min = '0.1';
    scaleRange.max = '3';
    scaleRange.step = '0.1';
    scaleRange.value = '1';
    scaleRange.addEventListener('input', () => {
      this.emitChange('scale', parseFloat(scaleRange.value));
    });

    // 翻转
    const flipGroup = this.createFormGroup('翻转', 'checkbox-group');
    const horizontalFlip = this.createCheckbox('水平翻转');
    const verticalFlip = this.createCheckbox('垂直翻转');
    flipGroup.querySelector('.form-group__content')!.appendChild(horizontalFlip);
    flipGroup.querySelector('.form-group__content')!.appendChild(verticalFlip);

    horizontalFlip.addEventListener('change', () => {
      this.emitChange('flipHorizontal', horizontalFlip.checked);
    });

    verticalFlip.addEventListener('change', () => {
      this.emitChange('flipVertical', verticalFlip.checked);
    });

    container.appendChild(rotationGroup);
    container.appendChild(scaleGroup);
    container.appendChild(flipGroup);

    return container;
  }

  /**
   * 创建图像处理控制
   */
  private createImageProcessControls(): HTMLElement {
    const container = document.createElement('div');

    // 亮度
    const brightnessGroup = this.createFormGroup('亮度', 'range');
    const brightnessRange = brightnessGroup.querySelector('input')!;
    brightnessRange.min = '-100';
    brightnessRange.max = '100';
    brightnessRange.value = '0';
    brightnessRange.addEventListener('input', () => {
      this.emitChange('brightness', parseFloat(brightnessRange.value));
    });

    // 对比度
    const contrastGroup = this.createFormGroup('对比度', 'range');
    const contrastRange = contrastGroup.querySelector('input')!;
    contrastRange.min = '-100';
    contrastRange.max = '100';
    contrastRange.value = '0';
    contrastRange.addEventListener('input', () => {
      this.emitChange('contrast', parseFloat(contrastRange.value));
    });

    // 饱和度
    const saturationGroup = this.createFormGroup('饱和度', 'range');
    const saturationRange = saturationGroup.querySelector('input')!;
    saturationRange.min = '-100';
    saturationRange.max = '100';
    saturationRange.value = '0';
    saturationRange.addEventListener('input', () => {
      this.emitChange('saturation', parseFloat(saturationRange.value));
    });

    // 滤镜
    const filterGroup = this.createFormGroup('滤镜', 'select');
    const filterSelect = filterGroup.querySelector('select')!;
    
    const filters = [
      { value: 'none', label: '无' },
      { value: 'grayscale', label: '灰度' },
      { value: 'sepia', label: '棕褐色' },
      { value: 'vintage', label: '复古' },
      { value: 'warm', label: '暖色调' },
      { value: 'cool', label: '冷色调' }
    ];

    filters.forEach(filter => {
      const option = document.createElement('option');
      option.value = filter.value;
      option.textContent = filter.label;
      filterSelect.appendChild(option);
    });

    filterSelect.addEventListener('change', () => {
      this.emitChange('filter', filterSelect.value);
    });

    container.appendChild(brightnessGroup);
    container.appendChild(contrastGroup);
    container.appendChild(saturationGroup);
    container.appendChild(filterGroup);

    return container;
  }

  /**
   * 创建导出控制
   */
  private createExportControls(): HTMLElement {
    const container = document.createElement('div');

    // 格式选择
    const formatGroup = this.createFormGroup('格式', 'select');
    const formatSelect = formatGroup.querySelector('select')!;
    
    const formats = [
      { value: 'png', label: 'PNG' },
      { value: 'jpeg', label: 'JPEG' },
      { value: 'webp', label: 'WebP' }
    ];

    formats.forEach(format => {
      const option = document.createElement('option');
      option.value = format.value;
      option.textContent = format.label;
      formatSelect.appendChild(option);
    });

    // 质量设置
    const qualityGroup = this.createFormGroup('质量', 'range');
    const qualityRange = qualityGroup.querySelector('input')!;
    qualityRange.min = '0.1';
    qualityRange.max = '1';
    qualityRange.step = '0.1';
    qualityRange.value = '0.9';

    // 尺寸设置
    const sizeGroup = this.createFormGroup('输出尺寸', 'number-group');
    const widthInput = this.createNumberInput('宽度', 800);
    const heightInput = this.createNumberInput('高度', 600);
    sizeGroup.querySelector('.form-group__content')!.appendChild(widthInput);
    sizeGroup.querySelector('.form-group__content')!.appendChild(heightInput);

    container.appendChild(formatGroup);
    container.appendChild(qualityGroup);
    container.appendChild(sizeGroup);

    return container;
  }

  /**
   * 创建表单组
   */
  private createFormGroup(label: string, type: string): HTMLElement {
    const group = document.createElement('div');
    group.className = 'form-group';

    const labelElement = document.createElement('label');
    labelElement.className = 'form-group__label';
    labelElement.textContent = label;

    const content = document.createElement('div');
    content.className = 'form-group__content';

    if (type === 'select') {
      const select = document.createElement('select');
      select.className = 'form-control';
      content.appendChild(select);
    } else if (type === 'range') {
      const input = document.createElement('input');
      input.type = 'range';
      input.className = 'form-control';
      content.appendChild(input);
    }

    group.appendChild(labelElement);
    group.appendChild(content);

    return group;
  }

  /**
   * 创建数字输入框
   */
  private createNumberInput(placeholder: string, defaultValue: number): HTMLElement {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-control form-control--small';
    input.placeholder = placeholder;
    input.value = defaultValue.toString();
    return input;
  }

  /**
   * 创建复选框
   */
  private createCheckbox(label: string): HTMLInputElement {
    const container = document.createElement('label');
    container.className = 'checkbox-label';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'checkbox-input';

    const span = document.createElement('span');
    span.textContent = label;

    container.appendChild(input);
    container.appendChild(span);

    return input;
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 这里可以添加其他事件监听器
  }

  /**
   * 切换折叠状态
   */
  private toggle(): void {
    this.isCollapsed = !this.isCollapsed;
    const content = this.element.querySelector('.control-panel__content') as HTMLElement;
    const toggleButton = this.element.querySelector('.control-panel__toggle') as HTMLElement;
    
    if (content) {
      content.style.display = this.isCollapsed ? 'none' : 'block';
    }
    
    if (toggleButton) {
      toggleButton.innerHTML = this.isCollapsed ? '▼' : '▲';
    }
  }

  /**
   * 触发变化事件
   */
  private emitChange(property: string, value: any): void {
    const event = new CustomEvent('controlPanelChange', {
      detail: { property, value }
    });
    this.element.dispatchEvent(event);
  }

  /**
   * 更新控制面板数据
   */
  updateData(cropData: CropData, imageProcessOptions?: ImageProcessOptions): void {
    // 更新裁剪数据
    const aspectRatioSelect = this.element.querySelector('select') as HTMLSelectElement;
    if (aspectRatioSelect) {
      aspectRatioSelect.value = cropData.aspectRatio.toString();
    }

    // 更新变换数据
    const rotationRange = this.element.querySelector('input[type="range"]') as HTMLInputElement;
    if (rotationRange) {
      rotationRange.value = cropData.rotation.toString();
    }

    // 更新图像处理数据
    if (imageProcessOptions) {
      // 这里可以更新图像处理控件的值
    }
  }

  /**
   * 显示控制面板
   */
  show(): void {
    this.config.show = true;
    if (!this.container.contains(this.element)) {
      this.container.appendChild(this.element);
    }
  }

  /**
   * 隐藏控制面板
   */
  hide(): void {
    this.config.show = false;
    if (this.container.contains(this.element)) {
      this.container.removeChild(this.element);
    }
  }

  /**
   * 监听控制面板事件
   */
  on(event: 'controlPanelChange', callback: (detail: { property: string; value: any }) => void): void {
    this.element.addEventListener(event, (e: any) => {
      callback(e.detail);
    });
  }

  /**
   * 销毁控制面板
   */
  destroy(): void {
    if (this.container.contains(this.element)) {
      this.container.removeChild(this.element);
    }
    this.sections.clear();
  }
}
