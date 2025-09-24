/**
 * 页面滚动锁工具（全局单例）
 * - 同时锁定 html 与 body 的 overflow，彻底隐藏系统滚动条
 * - 通过计数支持多个弹层/抽屉同时打开
 * - 在隐藏滚动条时为 body 增加 padding-right 进行补偿，避免布局抖动
 */

let lockCount = 0;
let originalBodyOverflow: string | null = null;
let originalHtmlOverflow: string | null = null;
let originalBodyPaddingRight: string | null = null;

function getScrollbarWidth(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

export function lockPageScroll(): void {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    const body = document.body;
    const html = document.documentElement as HTMLElement;

    // 记录原始内联样式
    originalBodyOverflow = body.style.overflow || null;
    originalHtmlOverflow = html.style.overflow || null;
    originalBodyPaddingRight = body.style.paddingRight || null;

    // 滚动条补偿
    const scrollbarWidth = getScrollbarWidth();
    if (scrollbarWidth > 0) {
      const computedPadding = parseFloat(window.getComputedStyle(body).paddingRight || '0');
      body.style.paddingRight = `${computedPadding + scrollbarWidth}px`;
    }

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
  }
  lockCount++;
}

export function unlockPageScroll(): void {
  if (typeof document === 'undefined') return;
  if (lockCount > 0) {
    lockCount--;
    if (lockCount === 0) {
      const body = document.body;
      const html = document.documentElement as HTMLElement;
      if (originalBodyOverflow !== null) body.style.overflow = originalBodyOverflow; else body.style.removeProperty('overflow');
      if (originalHtmlOverflow !== null) html.style.overflow = originalHtmlOverflow; else html.style.removeProperty('overflow');
      if (originalBodyPaddingRight !== null) body.style.paddingRight = originalBodyPaddingRight; else body.style.removeProperty('padding-right');
    }
  }
}
