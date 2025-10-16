import { BaseComponent } from '../base/BaseComponent';
import './Popover.css';

export type PopoverPlacement = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'
  | 'auto';

export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual';

export interface PopoverConfig {
  trigger?: HTMLElement;
  content: string | HTMLElement;
  placement?: PopoverPlacement;
  triggerType?: PopoverTrigger;
  delay?: number;
  hideDelay?: number;
  offset?: number;
  arrow?: boolean;
  className?: string;
  interactive?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  maxWidth?: number;
  onShow?: () => void;
  onHide?: () => void;
}

export class Popover extends BaseComponent {
  private config: PopoverConfig;
  private popoverElement: HTMLElement;
  private arrowElement?: HTMLElement;
  private contentContainer: HTMLElement;
  private isVisible: boolean = false;
  private showTimeout?: number;
  private hideTimeout?: number;
  private boundUpdatePosition: () => void;

  constructor(config: PopoverConfig) {
    super();
    this.config = {
      placement: 'auto',
      triggerType: 'click',
      delay: 0,
      hideDelay: 0,
      offset: 8,
      arrow: true,
      interactive: false,
      closeOnClickOutside: true,
      closeOnEscape: true,
      maxWidth: 300,
      ...config
    };
    this.boundUpdatePosition = this.updatePosition.bind(this);
    this.init();
  }

  protected init(): void {
    this.createElements();
    this.bindEvents();
  }

  private createElements(): void {
    // Create popover container
    this.popoverElement = document.createElement('div');
    this.popoverElement.className = `popover ${this.config.className || ''}`;
    this.popoverElement.style.display = 'none';
    this.popoverElement.setAttribute('role', 'tooltip');

    if (this.config.maxWidth) {
      this.popoverElement.style.maxWidth = `${this.config.maxWidth}px`;
    }

    // Create arrow if enabled
    if (this.config.arrow) {
      this.arrowElement = document.createElement('div');
      this.arrowElement.className = 'popover-arrow';
      this.popoverElement.appendChild(this.arrowElement);
    }

    // Create content container
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'popover-content';

    if (typeof this.config.content === 'string') {
      this.contentContainer.innerHTML = this.config.content;
    } else {
      this.contentContainer.appendChild(this.config.content);
    }

    this.popoverElement.appendChild(this.contentContainer);
    document.body.appendChild(this.popoverElement);
  }

  private bindEvents(): void {
    if (!this.config.trigger) return;

    switch (this.config.triggerType) {
      case 'click':
        this.config.trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggle();
        });
        break;

      case 'hover':
        this.config.trigger.addEventListener('mouseenter', () => {
          this.scheduleShow();
        });
        this.config.trigger.addEventListener('mouseleave', () => {
          this.scheduleHide();
        });

        if (this.config.interactive) {
          this.popoverElement.addEventListener('mouseenter', () => {
            this.cancelHide();
          });
          this.popoverElement.addEventListener('mouseleave', () => {
            this.scheduleHide();
          });
        }
        break;

      case 'focus':
        this.config.trigger.addEventListener('focus', () => {
          this.scheduleShow();
        });
        this.config.trigger.addEventListener('blur', () => {
          this.scheduleHide();
        });
        break;

      case 'manual':
        // No automatic triggers
        break;
    }

    // Close on outside click
    if (this.config.closeOnClickOutside) {
      document.addEventListener('click', (e) => {
        if (this.isVisible && 
            !this.popoverElement.contains(e.target as Node) &&
            (!this.config.trigger || !this.config.trigger.contains(e.target as Node))) {
          this.hide();
        }
      });
    }

    // Close on escape
    if (this.config.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (this.isVisible && e.key === 'Escape') {
          this.hide();
        }
      });
    }

    // Update position on scroll and resize
    window.addEventListener('scroll', this.boundUpdatePosition, true);
    window.addEventListener('resize', this.boundUpdatePosition);
  }

  private scheduleShow(): void {
    this.cancelHide();
    if (this.config.delay! > 0) {
      this.showTimeout = window.setTimeout(() => {
        this.show();
      }, this.config.delay);
    } else {
      this.show();
    }
  }

  private scheduleHide(): void {
    this.cancelShow();
    if (this.config.hideDelay! > 0) {
      this.hideTimeout = window.setTimeout(() => {
        this.hide();
      }, this.config.hideDelay);
    } else {
      this.hide();
    }
  }

  private cancelShow(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
  }

  private cancelHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
  }

  public show(triggerElement?: HTMLElement): void {
    if (this.isVisible) return;

    // Update trigger if provided
    if (triggerElement) {
      this.config.trigger = triggerElement;
    }

    this.popoverElement.style.display = 'block';
    this.updatePosition();
    this.isVisible = true;

    // Force reflow to ensure initial state is applied
    void this.popoverElement.offsetHeight;

    // Animate in on next frame
    requestAnimationFrame(() => {
      this.popoverElement.classList.add('popover-visible');
    });

    if (this.config.onShow) {
      this.config.onShow();
    }
  }

  public hide(): void {
    if (!this.isVisible) return;

    // Remove visible class to trigger close animation
    this.popoverElement.classList.remove('popover-visible');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      if (!this.isVisible) { // Check if still hidden
        this.popoverElement.style.display = 'none';
      }
    }, 250); // Updated to match CSS animation duration

    this.isVisible = false;

    if (this.config.onHide) {
      this.config.onHide();
    }
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public getElement(): HTMLElement | null {
    return this.popoverElement;
  }

  private updatePosition(): void {
    if (!this.config.trigger) return;

    const triggerRect = this.config.trigger.getBoundingClientRect();
    const popoverRect = this.popoverElement.getBoundingClientRect();
    
    let placement = this.config.placement!;
    
    // Auto-calculate best placement
    if (placement === 'auto') {
      placement = this.calculateBestPlacement(triggerRect, popoverRect);
    }

    const position = this.calculatePosition(placement, triggerRect, popoverRect);
    
    this.popoverElement.style.position = 'fixed';
    this.popoverElement.style.top = `${position.top}px`;
    this.popoverElement.style.left = `${position.left}px`;
    
    // Position arrow
    if (this.arrowElement) {
      this.positionArrow(placement, triggerRect, popoverRect, position);
    }

    // Add placement class
    this.popoverElement.className = `popover popover-${placement} ${this.config.className || ''}`;
    if (this.isVisible) {
      this.popoverElement.classList.add('popover-visible');
    }
  }

  private calculateBestPlacement(
    triggerRect: DOMRect,
    popoverRect: DOMRect
  ): PopoverPlacement {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const offset = this.config.offset!;
    
    // Calculate available space in each direction
    const spaceTop = triggerRect.top;
    const spaceBottom = viewport.height - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewport.width - triggerRect.right;

    // Determine best placement based on available space
    if (spaceBottom >= popoverRect.height + offset) {
      return 'bottom';
    } else if (spaceTop >= popoverRect.height + offset) {
      return 'top';
    } else if (spaceRight >= popoverRect.width + offset) {
      return 'right';
    } else if (spaceLeft >= popoverRect.width + offset) {
      return 'left';
    }

    // Default to bottom if no ideal space
    return 'bottom';
  }

  private calculatePosition(
    placement: PopoverPlacement,
    triggerRect: DOMRect,
    popoverRect: DOMRect
  ): { top: number; left: number } {
    const offset = this.config.offset!;
    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - popoverRect.height - offset;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;

      case 'top-start':
        top = triggerRect.top - popoverRect.height - offset;
        left = triggerRect.left;
        break;

      case 'top-end':
        top = triggerRect.top - popoverRect.height - offset;
        left = triggerRect.right - popoverRect.width;
        break;

      case 'bottom':
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;

      case 'bottom-start':
        top = triggerRect.bottom + offset;
        left = triggerRect.left;
        break;

      case 'bottom-end':
        top = triggerRect.bottom + offset;
        left = triggerRect.right - popoverRect.width;
        break;

      case 'left':
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.left - popoverRect.width - offset;
        break;

      case 'left-start':
        top = triggerRect.top;
        left = triggerRect.left - popoverRect.width - offset;
        break;

      case 'left-end':
        top = triggerRect.bottom - popoverRect.height;
        left = triggerRect.left - popoverRect.width - offset;
        break;

      case 'right':
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.right + offset;
        break;

      case 'right-start':
        top = triggerRect.top;
        left = triggerRect.right + offset;
        break;

      case 'right-end':
        top = triggerRect.bottom - popoverRect.height;
        left = triggerRect.right + offset;
        break;
    }

    // Keep within viewport bounds
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    top = Math.max(4, Math.min(top, viewport.height - popoverRect.height - 4));
    left = Math.max(4, Math.min(left, viewport.width - popoverRect.width - 4));

    return { top, left };
  }

  private positionArrow(
    placement: PopoverPlacement,
    triggerRect: DOMRect,
    popoverRect: DOMRect,
    position: { top: number; left: number }
  ): void {
    if (!this.arrowElement) return;

    // Reset arrow styles
    this.arrowElement.style.top = '';
    this.arrowElement.style.left = '';
    this.arrowElement.style.right = '';
    this.arrowElement.style.bottom = '';

    const arrowSize = 8;
    
    if (placement.startsWith('top')) {
      this.arrowElement.style.bottom = `-${arrowSize}px`;
      this.arrowElement.style.left = `${triggerRect.left + triggerRect.width / 2 - position.left}px`;
    } else if (placement.startsWith('bottom')) {
      this.arrowElement.style.top = `-${arrowSize}px`;
      this.arrowElement.style.left = `${triggerRect.left + triggerRect.width / 2 - position.left}px`;
    } else if (placement.startsWith('left')) {
      this.arrowElement.style.right = `-${arrowSize}px`;
      this.arrowElement.style.top = `${triggerRect.top + triggerRect.height / 2 - position.top}px`;
    } else if (placement.startsWith('right')) {
      this.arrowElement.style.left = `-${arrowSize}px`;
      this.arrowElement.style.top = `${triggerRect.top + triggerRect.height / 2 - position.top}px`;
    }
  }

  public setContent(content: string | HTMLElement): void {
    this.contentContainer.innerHTML = '';
    
    if (typeof content === 'string') {
      this.contentContainer.innerHTML = content;
    } else {
      this.contentContainer.appendChild(content);
    }

    if (this.isVisible) {
      this.updatePosition();
    }
  }

  public setTrigger(trigger: HTMLElement): void {
    this.config.trigger = trigger;
    // Re-bind events would be needed here for a complete implementation
  }

  public isShown(): boolean {
    return this.isVisible;
  }

  public destroy(): void {
    this.hide();
    this.cancelShow();
    this.cancelHide();

    window.removeEventListener('scroll', this.boundUpdatePosition, true);
    window.removeEventListener('resize', this.boundUpdatePosition);

    if (this.popoverElement && this.popoverElement.parentNode) {
      this.popoverElement.parentNode.removeChild(this.popoverElement);
    }

    this.config = null as any;
    this.popoverElement = null as any;
  }
}