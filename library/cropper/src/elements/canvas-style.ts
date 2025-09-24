/**
 * Canvas 元素样式
 * 使用 LDESIGN 设计系统的 CSS 变量
 */

export default `
:host {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--ldesign-bg-color-container, #ffffff);
  border: 1px solid var(--ldesign-border-color, #e5e5e5);
  border-radius: var(--ls-border-radius-base, 6px);
  cursor: crosshair;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 默认禁用棋盘格背景；如需可在模板加 background */
:host([background]) {
  background-color: var(--ldesign-bg-color-container, #ffffff);
}

:host([disabled]) {
  cursor: not-allowed;
  opacity: 0.6;
  pointer-events: none;
}

:host(:focus) {
  outline: 2px solid var(--ldesign-brand-color-focus, var(--ldesign-brand-color-2, #d8c8ee));
  outline-offset: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :host {
    cursor: default;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  :host {
    border-color: var(--ldesign-border-color-focus, var(--ldesign-brand-color, #722ED1));
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  :host {
    background-color: var(--ldesign-gray-color-9, #3b3b3b);
    border-color: var(--ldesign-gray-color-7, #696969);
  }
  
  :host([background]) {
    background-image: 
      linear-gradient(45deg, var(--ldesign-gray-color-7, #696969) 25%, transparent 25%),
      linear-gradient(-45deg, var(--ldesign-gray-color-7, #696969) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--ldesign-gray-color-7, #696969) 75%),
      linear-gradient(-45deg, transparent 75%, var(--ldesign-gray-color-7, #696969) 75%);
  }
}

/* 动画效果 */
:host {
  transition: 
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    opacity 0.3s ease;
}

:host(:hover:not([disabled])) {
  border-color: var(--ldesign-border-color-hover, var(--ldesign-border-level-2-color, #d9d9d9));
  box-shadow: var(--ldesign-shadow-1, 0 1px 10px rgba(0, 0, 0, 5%));
}
`;
