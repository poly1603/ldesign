import type { LottieInstance } from './LottieInstance';

/**
 * 无障碍配置
 */
export interface AccessibilityConfig {
  /** 是否启用键盘导航 */
  keyboardNavigation?: boolean;
  /** 是否启用屏幕阅读器支持 */
  screenReader?: boolean;
  /** 动画描述 */
  description?: string;
  /** 动画标题 */
  title?: string;
  /** 是否提供跳过动画选项 */
  skipOption?: boolean;
  /** 是否遵循用户的减少动画偏好 */
  respectReducedMotion?: boolean;
  /** 键盘快捷键配置 */
  keyboardShortcuts?: Record<string, () => void>;
  /** ARIA 标签 */
  ariaLabel?: string;
  /** ARIA 角色 */
  role?: string;
}

/**
 * 无障碍管理器
 * 实现屏幕阅读器支持和键盘导航
 */
export class AccessibilityManager {
  private animation: LottieInstance;
  private container: HTMLElement;
  private config: AccessibilityConfig;
  private keyboardListenersBound = false;
  private announceElement: HTMLElement | null = null;
  private controlsContainer: HTMLElement | null = null;
  private respectsReducedMotion = false;

  // 默认键盘快捷键
  private defaultShortcuts: Record<string, () => void> = {
    Space: () => this.togglePlayPause(),
    ArrowRight: () => this.seekForward(),
    ArrowLeft: () => this.seekBackward(),
    Home: () => this.seekToStart(),
    End: () => this.seekToEnd(),
    'KeyR': () => this.restart(),
  };

  constructor(animation: LottieInstance, config: AccessibilityConfig = {}) {
    this.animation = animation;
    this.container = animation.getContainer();
    this.config = {
      keyboardNavigation: true,
      screenReader: true,
      skipOption: true,
      respectReducedMotion: true,
      role: 'img',
      ...config,
    };

    this.init();
  }

  /**
   * 初始化无障碍功能
   */
  private init(): void {
    // 设置 ARIA 属性
    this.setupARIA();

    // 检查用户偏好
    if (this.config.respectReducedMotion) {
      this.checkReducedMotionPreference();
    }

    // 启用键盘导航
    if (this.config.keyboardNavigation) {
      this.enableKeyboardNavigation();
    }

    // 启用屏幕阅读器支持
    if (this.config.screenReader) {
      this.enableScreenReaderSupport();
    }

    // 添加跳过选项
    if (this.config.skipOption) {
      this.addSkipOption();
    }

    // 创建控制面板
    this.createAccessibleControls();
  }

  /**
   * 设置 ARIA 属性
   */
  private setupARIA(): void {
    const { role, ariaLabel, description, title } = this.config;

    // 设置角色
    if (role) {
      this.container.setAttribute('role', role);
    }

    // 设置 label
    if (ariaLabel) {
      this.container.setAttribute('aria-label', ariaLabel);
    } else if (title) {
      this.container.setAttribute('aria-label', title);
    }

    // 设置描述
    if (description) {
      const descId = `lottie-desc-${Math.random().toString(36).substr(2, 9)}`;
      const descElement = document.createElement('div');
      descElement.id = descId;
      descElement.className = 'lottie-description sr-only';
      descElement.textContent = description;
      this.container.appendChild(descElement);
      this.container.setAttribute('aria-describedby', descId);
    }

    // 设置可聚焦
    if (this.config.keyboardNavigation) {
      this.container.setAttribute('tabindex', '0');
    }

    // 设置动画状态
    this.updateARIAState();
  }

  /**
   * 更新 ARIA 状态
   */
  private updateARIAState(): void {
    const isPaused = this.animation.isPaused();
    this.container.setAttribute('aria-live', isPaused ? 'off' : 'polite');
    this.container.setAttribute('aria-busy', isPaused ? 'false' : 'true');
  }

  /**
   * 检查减少动画偏好
   */
  private checkReducedMotionPreference(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionPreference = (e: MediaQueryList | MediaQueryListEvent) => {
      this.respectsReducedMotion = e.matches;

      if (e.matches) {
        // 用户偏好减少动画
        this.animation.pause();
        this.announce('动画已暂停以遵循您的减少动画偏好设置');
      }
    };

    handleMotionPreference(prefersReducedMotion);

    // 监听偏好变化
    prefersReducedMotion.addEventListener('change', handleMotionPreference);
  }

  /**
   * 启用键盘导航
   */
  private enableKeyboardNavigation(): void {
    if (this.keyboardListenersBound) return;

    const shortcuts = {
      ...this.defaultShortcuts,
      ...this.config.keyboardShortcuts,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.code || e.key;
      const handler = shortcuts[key];

      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    this.container.addEventListener('keydown', handleKeyDown);
    this.keyboardListenersBound = true;

    // 添加焦点指示器
    this.container.classList.add('keyboard-navigable');
  }

  /**
   * 启用屏幕阅读器支持
   */
  private enableScreenReaderSupport(): void {
    // 创建实时通知区域
    this.announceElement = document.createElement('div');
    this.announceElement.className = 'lottie-announce sr-only';
    this.announceElement.setAttribute('role', 'status');
    this.announceElement.setAttribute('aria-live', 'polite');
    this.announceElement.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.announceElement);

    // 监听动画事件并通知
    this.animation.addEventListener('play', () => {
      this.announce('动画开始播放');
      this.updateARIAState();
    });

    this.animation.addEventListener('pause', () => {
      this.announce('动画已暂停');
      this.updateARIAState();
    });

    this.animation.addEventListener('complete', () => {
      this.announce('动画播放完成');
      this.updateARIAState();
    });

    this.animation.addEventListener('loopComplete', () => {
      this.announce('动画循环完成');
    });
  }

  /**
   * 添加跳过动画选项
   */
  private addSkipOption(): void {
    const skipButton = document.createElement('button');
    skipButton.className = 'lottie-skip-button';
    skipButton.textContent = '跳过动画';
    skipButton.setAttribute('aria-label', '跳过动画到最后');
    skipButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      z-index: 1000;
    `;

    skipButton.addEventListener('click', () => {
      this.seekToEnd();
      this.announce('已跳过动画');
    });

    this.container.style.position = 'relative';
    this.container.appendChild(skipButton);
  }

  /**
   * 创建无障碍控制面板
   */
  private createAccessibleControls(): void {
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.className = 'lottie-accessible-controls';
    this.controlsContainer.setAttribute('role', 'group');
    this.controlsContainer.setAttribute('aria-label', '动画控制');
    this.controlsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      margin-top: 10px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
    `;

    // 播放/暂停按钮
    const playPauseBtn = this.createButton('播放/暂停', () => {
      this.togglePlayPause();
    });

    // 重新开始按钮
    const restartBtn = this.createButton('重新开始', () => {
      this.restart();
    });

    // 速度控制
    const speedLabel = document.createElement('label');
    speedLabel.textContent = '速度: ';
    speedLabel.style.cssText = 'display: flex; align-items: center; gap: 5px;';

    const speedSelect = document.createElement('select');
    speedSelect.setAttribute('aria-label', '选择播放速度');
    ['0.5x', '0.75x', '1x', '1.25x', '1.5x', '2x'].forEach((speed) => {
      const option = document.createElement('option');
      option.value = speed.replace('x', '');
      option.textContent = speed;
      option.selected = speed === '1x';
      speedSelect.appendChild(option);
    });

    speedSelect.addEventListener('change', () => {
      const speed = parseFloat(speedSelect.value);
      this.animation.setSpeed(speed);
      this.announce(`播放速度已设置为 ${speed}倍`);
    });

    speedLabel.appendChild(speedSelect);

    this.controlsContainer.appendChild(playPauseBtn);
    this.controlsContainer.appendChild(restartBtn);
    this.controlsContainer.appendChild(speedLabel);

    // 插入到容器后面
    this.container.parentElement?.insertBefore(
      this.controlsContainer,
      this.container.nextSibling
    );
  }

  /**
   * 创建按钮辅助方法
   */
  private createButton(label: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = label;
    button.setAttribute('aria-label', label);
    button.style.cssText = `
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    button.addEventListener('click', onClick);
    button.addEventListener('mouseenter', () => {
      button.style.background = '#0056b3';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = '#007bff';
    });

    return button;
  }

  /**
   * 屏幕阅读器通知
   */
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announceElement) return;

    this.announceElement.setAttribute('aria-live', priority);
    this.announceElement.textContent = message;

    // 清除消息以便后续相同消息也能被朗读
    setTimeout(() => {
      if (this.announceElement) {
        this.announceElement.textContent = '';
      }
    }, 1000);
  }

  /**
   * 切换播放/暂停
   */
  private togglePlayPause(): void {
    if (this.animation.isPaused()) {
      this.animation.play();
    } else {
      this.animation.pause();
    }
  }

  /**
   * 快进
   */
  private seekForward(): void {
    const currentFrame = this.animation.getCurrentFrame();
    const totalFrames = this.animation.getTotalFrames();
    const newFrame = Math.min(currentFrame + totalFrames * 0.1, totalFrames);
    this.animation.goToAndStop(newFrame, true);
    this.announce(`已快进到 ${Math.round((newFrame / totalFrames) * 100)}%`);
  }

  /**
   * 快退
   */
  private seekBackward(): void {
    const currentFrame = this.animation.getCurrentFrame();
    const totalFrames = this.animation.getTotalFrames();
    const newFrame = Math.max(currentFrame - totalFrames * 0.1, 0);
    this.animation.goToAndStop(newFrame, true);
    this.announce(`已快退到 ${Math.round((newFrame / totalFrames) * 100)}%`);
  }

  /**
   * 跳转到开始
   */
  private seekToStart(): void {
    this.animation.goToAndStop(0, true);
    this.announce('已跳转到动画开始');
  }

  /**
   * 跳转到结束
   */
  private seekToEnd(): void {
    const totalFrames = this.animation.getTotalFrames();
    this.animation.goToAndStop(totalFrames, true);
    this.announce('已跳转到动画结束');
  }

  /**
   * 重新开始
   */
  private restart(): void {
    this.animation.stop();
    this.animation.play();
    this.announce('动画已重新开始');
  }

  /**
   * 显示控制面板
   */
  public showControls(): void {
    if (this.controlsContainer) {
      this.controlsContainer.style.display = 'flex';
    }
  }

  /**
   * 隐藏控制面板
   */
  public hideControls(): void {
    if (this.controlsContainer) {
      this.controlsContainer.style.display = 'none';
    }
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.description) {
      this.setupARIA();
    }
  }

  /**
   * 销毁无障碍管理器
   */
  public destroy(): void {
    if (this.announceElement) {
      document.body.removeChild(this.announceElement);
      this.announceElement = null;
    }

    if (this.controlsContainer && this.controlsContainer.parentElement) {
      this.controlsContainer.parentElement.removeChild(this.controlsContainer);
      this.controlsContainer = null;
    }

    this.keyboardListenersBound = false;
  }
}
