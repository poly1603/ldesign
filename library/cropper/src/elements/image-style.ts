/**
 * Image 元素样式
 * 使用 LDESIGN 设计系统的 CSS 变量
 */

export default `
:host {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
  max-width: none;
  max-height: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
}

:host img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: var(--ls-border-radius-sm, 3px);
  box-shadow: var(--ldesign-shadow-1, 0 1px 10px rgba(0, 0, 0, 5%));
}

:host([rotatable]) {
  cursor: grab;
  pointer-events: auto;
}

:host([rotatable]:active) {
  cursor: grabbing;
}

:host([scalable]) {
  cursor: zoom-in;
  pointer-events: auto;
}

:host([translatable]) {
  cursor: move;
  pointer-events: auto;
}

:host([skewable]) {
  cursor: crosshair;
  pointer-events: auto;
}

:host([hidden]) {
  display: none !important;
}

/* 加载状态 */
:host([loading]) img {
  opacity: 0.6;
  filter: blur(1px);
}

/* 错误状态 */
:host([error]) img {
  opacity: 0.3;
  filter: grayscale(100%);
}

/* 动画效果 */
:host {
  transition: 
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
}

:host img {
  transition: 
    opacity 0.3s ease,
    filter 0.3s ease,
    box-shadow 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :host([rotatable]),
  :host([scalable]),
  :host([translatable]),
  :host([skewable]) {
    cursor: default;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  :host img {
    box-shadow: 0 0 0 2px var(--ldesign-border-color-focus, var(--ldesign-brand-color, #722ED1));
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  :host img {
    box-shadow: var(--ldesign-shadow-2, 0 4px 20px rgba(0, 0, 0, 8%));
  }
}

/* 减少动画效果（用户偏好） */
@media (prefers-reduced-motion: reduce) {
  :host,
  :host img {
    transition: none;
  }
}
`;
