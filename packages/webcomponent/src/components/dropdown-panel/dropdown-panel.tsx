import { Component, Element, Event, EventEmitter, h, Host, Method, Prop, State, Watch } from '@stencil/core';

/**
 * @slot trigger - 触发器内容
 * @slot default - 面板内容
 */
@Component({
  tag: 'l-dropdown-panel',
  styleUrl: 'dropdown-panel.less',
  shadow: false,
})
export class DropdownPanel {
  @Element() el!: HTMLElement;

  /**
   * 面板是否可见
   */
  @Prop({ mutable: true, reflect: true }) visible: boolean = false;

  /**
   * 面板弹出位置，'top' 或 'bottom'，'auto' 自动判断
   */
  @Prop() placement: 'top' | 'bottom' | 'auto' = 'auto';

  /**
   * 遮罩层背景色
   */
  @Prop() maskBackground: string = 'rgba(0, 0, 0, 0.3)';

  /**
   * 面板最大高度
   */
  @Prop() maxHeight: string = '60vh';

  /**
   * 面板与遮罩边缘的安全距离（像素）
   */
  @Prop() safeDistance: number = 16;

  /**
   * 动画持续时间（毫秒）
   */
  @Prop() duration: number = 300;

  /**
   * 动画模式：'scale' 展开动画，'slide' 滑动动画
   */
  @Prop() animationMode: 'scale' | 'slide' = 'scale';

  /**
   * 点击遮罩层是否关闭
   */
  @Prop() maskClosable: boolean = true;

  /**
   * 面板显示/隐藏时触发
   */
  @Event() visibleChange!: EventEmitter<boolean>;

  @State() triggerRect: DOMRect | null = null;
  @State() panelHeight: number = 0;
  @State() actualPlacement: 'top' | 'bottom' = 'bottom';
  @State() isReady: boolean = false;
  @State() disableTransition: boolean = false; // 禁用过渡效果的标志

  private triggerRef?: HTMLDivElement;
  private panelRef?: HTMLDivElement;
  private resizeObserver?: ResizeObserver;
  private previousPlacement: 'top' | 'bottom' = 'bottom';

  componentDidLoad() {
    // 监听窗口大小变化
    this.resizeObserver = new ResizeObserver(() => {
      if (this.visible) {
        this.updateTriggerRect();
        this.calculatePlacement();
      }
    });
    this.resizeObserver.observe(document.body);

    // 监听滚动事件
    window.addEventListener('scroll', this.handleScroll, true);
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    window.removeEventListener('scroll', this.handleScroll, true);
  }

  @Watch('visible')
  onVisibleChange(newValue: boolean) {
    if (newValue) {
      // 打开：先重置isReady，然后更新位置和方向
      this.isReady = false;
      this.updateTriggerRect();
      
      // 计算并更新新的placement，确保在动画开始前就是正确的
      const newPlacement = this.getNewPlacement();
      const placementChanged = this.actualPlacement !== newPlacement;
      
      
      // 如果 placement 改变了，需要先禁用 transition，避免从旧状态到新状态的过渡动画
      if (placementChanged) {
        this.disableTransition = true;
      }
      
      this.actualPlacement = newPlacement;
      this.previousPlacement = newPlacement;
      this.lockBodyScroll();
      
      // 双RAF确保：第一次RAF让Stencil完成DOM渲染和CSS类更新，第二次RAF让浏览器完成初始状态绘制
      requestAnimationFrame(() => {
        // 如果禁用了 transition，在这里重新启用
        if (this.disableTransition) {
          this.disableTransition = false;
        }
        
        requestAnimationFrame(() => {
          
          if (this.visible) {
            this.isReady = true;
            if (this.panelRef) {
              this.panelHeight = this.panelRef.scrollHeight;
              
            } else {
              console.warn('[open] panelRef is null!');
            }
          }
        });
      });
    } else {
      // 关闭：先隐藏动画
      this.isReady = false;
      this.unlockBodyScroll();
      
      // 动画完成后清理 - 不清空triggerRect，保留以便下次打开时有初始渲染条件
      // 注释掉：triggerRect的更新由下次打开时的updateTriggerRect处理
    }
    this.visibleChange.emit(newValue);
  }

  /**
   * 显示面板
   */
  @Method()
  async show() {
    this.visible = true;
  }

  /**
   * 隐藏面板
   */
  @Method()
  async hide() {
    this.visible = false;
  }

  /**
   * 切换面板显示状态
   */
  @Method()
  async toggle() {
    this.visible = !this.visible;
  }

  private handleScroll = () => {
    if (this.visible) {
      const oldPlacement = this.actualPlacement;
      this.updateTriggerRect();
      
      // 计算新的方向（但不立即应用）
      const newPlacement = this.getNewPlacement();
      
      // 如果方向改变了，需要先隐藏，然后改变方向，再显示
      if (oldPlacement !== newPlacement) {
        
        // 先隐藏面板
        this.isReady = false;
        
        // 等待隐藏动画完成，然后更新方向并重新显示
        requestAnimationFrame(() => {
          // 禁用 transition，避免从旧状态到新状态的过渡动画
          this.disableTransition = true;
          
          // 更新方向
          this.actualPlacement = newPlacement;
          
          // 等待DOM更新，启用 transition，然后显示
          requestAnimationFrame(() => {
            // 重新启用 transition
            this.disableTransition = false;
            
            requestAnimationFrame(() => {
              if (this.visible) {
                this.isReady = true;
              }
            });
          });
        });
      } else {
        // 方向没有改变，直接更新
        this.actualPlacement = newPlacement;
      }
    }
  };

  private updateTriggerRect = () => {
    if (this.triggerRef) {
      this.triggerRect = this.triggerRef.getBoundingClientRect();
    }
  };

  private getNewPlacement = (): 'top' | 'bottom' => {
    if (!this.triggerRect) {
      return 'bottom';
    }

    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - this.triggerRect.bottom - this.safeDistance;
    const spaceAbove = this.triggerRect.top - this.safeDistance;
    
    // 估算面板高度：优先使用实际测量的高度，否则使用maxHeight配置
    let estimatedPanelHeight: number;
    if (this.panelHeight > 0) {
      estimatedPanelHeight = this.panelHeight;
    } else {
      // 从maxHeight配置中估算
      if (this.maxHeight.includes('vh')) {
        estimatedPanelHeight = parseFloat(this.maxHeight) * windowHeight / 100;
      } else {
        estimatedPanelHeight = parseFloat(this.maxHeight);
      }
    }

    // 如果是 auto 模式，根据空间大小和面板高度智能选择
    if (this.placement === 'auto') {
      // 检查上方和下方是否有足够空间完全显示面板
      const canFitBelow = spaceBelow >= estimatedPanelHeight;
      const canFitAbove = spaceAbove >= estimatedPanelHeight;

      if (canFitBelow && canFitAbove) {
        // 两侧都能完全显示，优先选择下方（更符合用户习惯）
        return 'bottom';
      } else if (canFitBelow) {
        // 只有下方能完全显示
        return 'bottom';
      } else if (canFitAbove) {
        // 只有上方能完全显示
        return 'top';
      } else {
        // 两侧都无法完全显示，选择空间更大的一侧
        return spaceAbove > spaceBelow ? 'top' : 'bottom';
      }
    }

    // 手动指定方向，但需要检查空间是否足够，不足时智能切换
    const preferredPlacement = this.placement as 'top' | 'bottom';
    
    if (preferredPlacement === 'bottom') {
      // 想从下方弹出，检查下方空间是否足够
      if (spaceBelow < estimatedPanelHeight && spaceAbove > spaceBelow) {
        // 下方空间不足以显示面板，且上方空间更大，切换到上方
        console.warn(`[l-dropdown-panel] 下方空间不足（需要 ${estimatedPanelHeight}px，可用 ${spaceBelow}px），自动切换为从上方弹出`);
        return 'top';
      } else {
        return 'bottom';
      }
    } else {
      // 想从上方弹出，检查上方空间是否足够
      if (spaceAbove < estimatedPanelHeight && spaceBelow > spaceAbove) {
        // 上方空间不足以显示面板，且下方空间更大，切换到下方
        console.warn(`[l-dropdown-panel] 上方空间不足（需要 ${estimatedPanelHeight}px，可用 ${spaceAbove}px），自动切换为从下方弹出`);
        return 'bottom';
      } else {
        return 'top';
      }
    }
  };

  private calculatePlacement = () => {
    this.actualPlacement = this.getNewPlacement();
  };

  private handleTriggerClick = () => {
    this.toggle();
  };

  private handleMaskClick = (e: MouseEvent) => {
    if (this.maskClosable && e.target === e.currentTarget) {
      this.hide();
    }
  };

  private lockBodyScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }

  private unlockBodyScroll() {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }

  private getPanelStyle() {
    if (!this.triggerRect) return {};

    const windowHeight = window.innerHeight;
    let calculatedMaxHeight: string;

    // 计算实际可用空间：遮罩区域 - 安全距离
    if (this.actualPlacement === 'bottom') {
      // 从下方弹出：遮罩高度 - 底部安全距离
      const maskHeight = windowHeight - this.triggerRect.bottom;
      const availableSpace = maskHeight - this.safeDistance;
      const userMaxHeight = this.maxHeight.includes('vh') 
        ? parseFloat(this.maxHeight) * windowHeight / 100
        : parseFloat(this.maxHeight);
      calculatedMaxHeight = `${Math.min(availableSpace, userMaxHeight)}px`;
    } else {
      // 从上方弹出：遮罩高度 - 顶部安全距离
      const maskHeight = this.triggerRect.top;
      const availableSpace = maskHeight - this.safeDistance;
      const userMaxHeight = this.maxHeight.includes('vh') 
        ? parseFloat(this.maxHeight) * windowHeight / 100
        : parseFloat(this.maxHeight);
      calculatedMaxHeight = `${Math.min(availableSpace, userMaxHeight)}px`;
    }

    const style: any = {
      maxHeight: calculatedMaxHeight,
      // 如果 disableTransition 为 true，则禁用过渡效果
      transition: this.disableTransition ? 'none' : `transform ${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    };

    return style;
  }

  private getMaskStyle() {
    if (!this.triggerRect) return {};

    const style: any = {
      '--mask-bg': this.maskBackground,
      transition: `opacity ${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      // 设置 padding 为安全距离，使面板与遮罩边缘保持距离
    };

    if (this.actualPlacement === 'bottom') {
      // 遮罩显示在触发器下方到底部
      style.top = `${this.triggerRect.bottom}px`;
      style.bottom = '0';
      style.paddingBottom = `${this.safeDistance}px`;
    } else {
      // 遮罩显示在触发器上方到顶部
      style.top = '0';
      style.bottom = `${window.innerHeight - this.triggerRect.top}px`;
      style.paddingTop = `${this.safeDistance}px`;
    }

    return style;
  }

  render() {
    // 打开或关闭动画过程中都需要渲染
    const shouldRender = this.visible || !!this.triggerRect;
    
    const panelClasses = {
      'l-dropdown-panel__panel': true,
      'l-dropdown-panel__panel--visible': this.visible && this.isReady,
      [`l-dropdown-panel__panel--${this.actualPlacement}`]: true,
      [`l-dropdown-panel__panel--animation-${this.animationMode}`]: true,
    };
    
    

    const maskClasses = {
      'l-dropdown-panel__mask': true,
      'l-dropdown-panel__mask--visible': this.visible,
    };

    return (
      <Host class="l-dropdown-panel">
        {/* 触发器 */}
        <div
          class="l-dropdown-panel__trigger"
          ref={el => (this.triggerRef = el)}
          onClick={this.handleTriggerClick}
        >
          <slot name="trigger" />
        </div>

        {/* 遮罩层和面板容器 */}
        {shouldRender && (
          <div class="l-dropdown-panel__overlay">
            {/* 遮罩层容器 */}
            <div
              class={maskClasses}
              style={this.getMaskStyle()}
              onClick={this.handleMaskClick}
            >
              {/* 面板 */}
              <div
                class={panelClasses}
                style={this.getPanelStyle()}
                ref={el => (this.panelRef = el)}
              >
                <div class="l-dropdown-panel__content">
                  <slot />
                </div>
              </div>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
