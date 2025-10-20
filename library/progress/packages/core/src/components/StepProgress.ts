import { StepProgressOptions, Step } from '../types';
import { ProgressBase } from '../base';
import { createElement } from '../utils';

/**
 * 步骤进度条
 */
export class StepProgress extends ProgressBase<StepProgressOptions> {
  private wrapper!: HTMLElement;
  private stepElements: HTMLElement[] = [];
  private lineElements: HTMLElement[] = [];

  protected getDefaultOptions(): Partial<StepProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      steps: [],
      currentStep: 0,
      layout: 'horizontal',
      showDescription: true,
    };
  }

  protected render(): void {
    // 清空容器
    this.container.innerHTML = '';

    // 创建包装器
    const layout = this.config.get('layout') ?? 'horizontal';
    this.wrapper = createElement('div', 'ld-progress-step', this.container);
    this.wrapper.classList.add(`ld-progress-step--${layout}`);

    // 添加自定义类名
    const className = this.config.get('className');
    if (className) {
      this.wrapper.classList.add(className);
    }

    // 渲染步骤
    const steps = this.config.get('steps') ?? [];
    this.stepElements = [];
    this.lineElements = [];

    steps.forEach((step, index) => {
      // 创建步骤项
      const stepItem = createElement('div', 'ld-progress-step__item', this.wrapper);
      
      // 创建步骤头部（图标/数字）
      const stepHead = createElement('div', 'ld-progress-step__head', stepItem);
      const stepIcon = createElement('div', 'ld-progress-step__icon', stepHead);
      
      // 设置图标或数字
      if (step.icon) {
        stepIcon.innerHTML = step.icon;
      } else {
        stepIcon.textContent = `${index + 1}`;
      }

      // 创建步骤主体
      const stepMain = createElement('div', 'ld-progress-step__main', stepItem);
      
      // 标题
      if (step.title) {
        const stepTitle = createElement('div', 'ld-progress-step__title', stepMain);
        stepTitle.textContent = step.title;
      }

      // 描述
      if (step.description && this.config.get('showDescription')) {
        const stepDesc = createElement('div', 'ld-progress-step__description', stepMain);
        stepDesc.textContent = step.description;
      }

      // 设置状态
      const status = step.status || this.getStepStatus(index);
      stepItem.classList.add(`ld-progress-step__item--${status}`);

      this.stepElements.push(stepItem);

      // 创建连接线（除了最后一个步骤）
      if (index < steps.length - 1) {
        const line = createElement('div', 'ld-progress-step__line', stepHead);
        line.classList.add(`ld-progress-step__line--${status}`);
        this.lineElements.push(line);
      }
    });

    // 更新进度
    this.updateProgress(this.currentValue);
  }

  protected updateProgress(value: number): void {
    const steps = this.config.get('steps') ?? [];
    const currentStep = this.config.get('currentStep') ?? 0;

    // 更新步骤状态
    this.stepElements.forEach((stepElement, index) => {
      // 移除所有状态类
      stepElement.classList.remove(
        'ld-progress-step__item--completed',
        'ld-progress-step__item--active',
        'ld-progress-step__item--pending',
        'ld-progress-step__item--error'
      );

      // 添加新状态类
      const step = steps[index];
      const status = step?.status || this.getStepStatus(index);
      stepElement.classList.add(`ld-progress-step__item--${status}`);
    });

    // 更新连接线状态
    this.lineElements.forEach((line, index) => {
      line.classList.remove(
        'ld-progress-step__line--completed',
        'ld-progress-step__line--active',
        'ld-progress-step__line--pending'
      );

      const status = index < currentStep ? 'completed' : 'pending';
      line.classList.add(`ld-progress-step__line--${status}`);
    });
  }

  /**
   * 根据当前步骤获取状态
   */
  private getStepStatus(index: number): Step['status'] {
    const currentStep = this.config.get('currentStep') ?? 0;
    
    if (index < currentStep) {
      return 'completed';
    } else if (index === currentStep) {
      return 'active';
    } else {
      return 'pending';
    }
  }

  /**
   * 设置当前步骤
   */
  setCurrentStep(step: number): void {
    const steps = this.config.get('steps') ?? [];
    const normalizedStep = Math.max(0, Math.min(steps.length - 1, step));
    
    this.config.set('currentStep', normalizedStep);
    this.currentValue = normalizedStep;
    this.updateProgress(normalizedStep);
    this.emit('change', normalizedStep);

    // 检查是否完成
    if (normalizedStep >= steps.length - 1) {
      this.emit('complete');
    }
  }

  /**
   * 下一步
   */
  next(): void {
    const currentStep = this.config.get('currentStep') ?? 0;
    this.setCurrentStep(currentStep + 1);
  }

  /**
   * 上一步
   */
  prev(): void {
    const currentStep = this.config.get('currentStep') ?? 0;
    this.setCurrentStep(currentStep - 1);
  }

  /**
   * 设置步骤状态
   */
  setStepStatus(index: number, status: Step['status']): void {
    const steps = this.config.get('steps') ?? [];
    if (index >= 0 && index < steps.length) {
      steps[index].status = status;
      this.updateProgress(this.currentValue);
    }
  }

  /**
   * 添加步骤
   */
  addStep(step: Step): void {
    const steps = this.config.get('steps') ?? [];
    steps.push(step);
    this.config.set('steps', steps);
    this.render();
  }

  /**
   * 移除步骤
   */
  removeStep(index: number): void {
    const steps = this.config.get('steps') ?? [];
    if (index >= 0 && index < steps.length) {
      steps.splice(index, 1);
      this.config.set('steps', steps);
      this.render();
    }
  }

  /**
   * 设置布局
   */
  setLayout(layout: 'horizontal' | 'vertical'): void {
    this.config.set('layout', layout);
    this.render();
  }
}


