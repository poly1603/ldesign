/*************************************************
 * Global type augmentation for browser globals.
 * Provide typing for window.Vue used by UMD auto-install.
 *************************************************/

export {}

declare global {
  interface Window {
    Vue?: import('vue').App
  }
}

