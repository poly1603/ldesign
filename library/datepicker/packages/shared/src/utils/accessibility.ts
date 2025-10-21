/**
 * 可访问性工具函数
 */

/**
 * 生成唯一ID
 */
let idCounter = 0;
export function generateId(prefix = 'ldate'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * 键盘导航键码
 */
export const KeyCode = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * ARIA 角色
 */
export const AriaRole = {
  DIALOG: 'dialog',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  ROW: 'row',
  BUTTON: 'button',
  COMBOBOX: 'combobox',
  LISTBOX: 'listbox',
  OPTION: 'option',
} as const;

/**
 * 创建 ARIA 标签
 */
export function createAriaLabel(type: string, date: Date, locale?: any): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  switch (type) {
    case 'date':
      return `${year}年${month}月${day}日`;
    case 'month':
      return `${year}年${month}月`;
    case 'year':
      return `${year}年`;
    default:
      return '';
  }
}

/**
 * 设置焦点陷阱
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return () => {};
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === KeyCode.TAB) {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * 宣布给屏幕阅读器
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcer = document.createElement('div');
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.position = 'absolute';
  announcer.style.left = '-10000px';
  announcer.style.width = '1px';
  announcer.style.height = '1px';
  announcer.style.overflow = 'hidden';
  
  document.body.appendChild(announcer);
  
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
  
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
}

/**
 * 获取日期的可访问性描述
 */
export function getDateAccessibleName(
  date: Date,
  isSelected: boolean,
  isDisabled: boolean,
  isToday: boolean
): string {
  const parts: string[] = [];
  
  parts.push(createAriaLabel('date', date));
  
  if (isToday) {
    parts.push('今天');
  }
  
  if (isSelected) {
    parts.push('已选中');
  }
  
  if (isDisabled) {
    parts.push('不可选');
  }
  
  return parts.join(', ');
}




