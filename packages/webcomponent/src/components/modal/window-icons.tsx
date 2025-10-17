import { h } from '@stencil/core';

/**
 * Windows 风格的窗口控制图标
 */

// 关闭按钮图标 (×)
export const CloseIcon = () => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 12 12" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1.414 0L0 1.414L4.586 6L0 10.586L1.414 12L6 7.414L10.586 12L12 10.586L7.414 6L12 1.414L10.586 0L6 4.586L1.414 0Z" />
  </svg>
);

// 最大化按钮图标 (□)
export const MaximizeIcon = () => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 12 12" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1 1v10h10V1H1zm1 1h8v8H2V2z" />
  </svg>
);

// 还原按钮图标 (Windows 的双窗口图标)
export const RestoreIcon = () => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 12 12" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 1v2H1v8h8V9h2V1H3zM2 4h6v6H2V4zm8-1H4V2h6v6H9V3z" />
  </svg>
);

// 最小化按钮图标 (—)
export const MinimizeIcon = () => (
  <svg 
    width="10" 
    height="10" 
    viewBox="0 0 10 10" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 5h10v1H0z" />
  </svg>
);