/**
 * Selection 元素样式
 * 使用 LDESIGN 设计系统的 CSS 变量
 */

export default `
:host {
  position: absolute;
  display: block;
  border: 1px solid rgba(255, 255, 255, 0.7);
  background-color: transparent;
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  box-sizing: border-box;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) inset;
}

:host([hidden]) {
  display: none !important;
}

:host([active]) {
  border-color: var(--ldesign-brand-color-active, #491f84);
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.8),
    var(--ldesign-shadow-2, 0 4px 20px rgba(0, 0, 0, 8%));
}

:host([outlined]) {
  border-style: solid;
}

:host([multiple]) {
  border-width: 1px;
}

:host([multiple][active]) {
  border-width: 2px;
  z-index: 10;
}

:host([disabled]) {
  cursor: not-allowed;
  opacity: 0.6;
  pointer-events: none;
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
    border-width: 3px;
  }
  
  :host([active]) {
    border-color: var(--ldesign-brand-color, #722ED1);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 1);
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  :host([active]) {
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      var(--ldesign-shadow-3, 0 8px 30px rgba(0, 0, 0, 12%));
  }
}

/* 动画效果 */
:host {
  transition: 
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

/* 减少动画效果（用户偏好） */
@media (prefers-reduced-motion: reduce) {
  :host {
    transition: none;
  }
}
`;
