/**
 * 基础元素样式
 * 使用 LDESIGN 设计系统的 CSS 变量
 */

export default `
:host {
  --theme-color: var(--ldesign-brand-color, #722ED1);
  box-sizing: border-box;
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: var(--ls-font-size-sm, 16px);
  line-height: 1.5;
  color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

:host *,
:host *::before,
:host *::after {
  box-sizing: inherit;
}

:host([hidden]) {
  display: none !important;
}

:host([disabled]) {
  pointer-events: none;
  opacity: 0.6;
}

/* 主题色相关样式 */
:host([theme-color]) {
  --theme-color: attr(theme-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  :host {
    font-size: var(--ls-font-size-xs, 14px);
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  :host {
    --theme-color: var(--ldesign-brand-color-active, #491f84);
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  :host {
    color: var(--ldesign-font-white-1, rgba(255, 255, 255, 1));
  }
}
`;
