/**
 * Animation utilities for QR codes
 */

export type AnimationType = 'fade' | 'scale' | 'rotate' | 'scan' | 'reveal' | 'pulse' | 'bounce';
export type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;

export interface AnimationConfig {
 type: AnimationType;
 duration: number;
 delay?: number;
 easing?: EasingFunction;
 loop?: boolean;
 direction?: 'normal' | 'reverse' | 'alternate';
}

/**
 * Apply animation to QR code element
 */
export function applyAnimation(
 element: HTMLElement,
 config: AnimationConfig
): Animation {
 const { type, duration, delay = 0, easing = 'ease', loop = false, direction = 'normal' } = config;

 const keyframes = getAnimationKeyframes(type);

 const options: KeyframeAnimationOptions = {
  duration,
  delay,
  easing,
  iterations: loop ? Infinity : 1,
  direction,
  fill: 'both',
 };

 return element.animate(keyframes, options);
}

/**
 * Get keyframes for animation type
 */
function getAnimationKeyframes(type: AnimationType): Keyframe[] {
 switch (type) {
  case 'fade':
   return [
    { opacity: 0 },
    { opacity: 1 }
   ];

  case 'scale':
   return [
    { transform: 'scale(0)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1 }
   ];

  case 'rotate':
   return [
    { transform: 'rotate(0deg) scale(0)', opacity: 0 },
    { transform: 'rotate(360deg) scale(1)', opacity: 1 }
   ];

  case 'scan':
   return [
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0 0 0)' }
   ];

  case 'reveal':
   return [
    { clipPath: 'inset(0 0 100% 0)' },
    { clipPath: 'inset(0 0 0 0)' }
   ];

  case 'pulse':
   return [
    { transform: 'scale(1)' },
    { transform: 'scale(1.05)' },
    { transform: 'scale(1)' }
   ];

  case 'bounce':
   return [
    { transform: 'translateY(0)' },
    { transform: 'translateY(-20px)' },
    { transform: 'translateY(0)' }
   ];

  default:
   return [{ opacity: 1 }];
 }
}

/**
 * Add CSS animation classes to stylesheet
 */
export function injectAnimationStyles(): void {
 if (document.getElementById('qrcode-animations')) {
  return; // Already injected
 }

 const style = document.createElement('style');
 style.id = 'qrcode-animations';
 style.textContent = `
  @keyframes qrcode-fade-in {
   from { opacity: 0; }
   to { opacity: 1; }
  }

  @keyframes qrcode-fade-out {
   from { opacity: 1; }
   to { opacity: 0; }
  }

  @keyframes qrcode-scale-in {
   from { transform: scale(0); opacity: 0; }
   to { transform: scale(1); opacity: 1; }
  }

  @keyframes qrcode-scale-out {
   from { transform: scale(1); opacity: 1; }
   to { transform: scale(0); opacity: 0; }
  }

  @keyframes qrcode-rotate-in {
   from { transform: rotate(0deg) scale(0); opacity: 0; }
   to { transform: rotate(360deg) scale(1); opacity: 1; }
  }

  @keyframes qrcode-rotate-out {
   from { transform: rotate(0deg) scale(1); opacity: 1; }
   to { transform: rotate(360deg) scale(0); opacity: 0; }
  }

  @keyframes qrcode-scan-in {
   from { clip-path: inset(0 100% 0 0); }
   to { clip-path: inset(0 0 0 0); }
  }

  @keyframes qrcode-reveal-in {
   from { clip-path: inset(0 0 100% 0); }
   to { clip-path: inset(0 0 0 0); }
  }

  @keyframes qrcode-pulse {
   0% { transform: scale(1); }
   50% { transform: scale(1.05); }
   100% { transform: scale(1); }
  }

  @keyframes qrcode-bounce {
   0%, 100% { transform: translateY(0); }
   50% { transform: translateY(-20px); }
  }

  .qrcode-animated {
   animation-fill-mode: both;
  }
 `;

 document.head.appendChild(style);
}

// Auto-inject styles
if (typeof document !== 'undefined') {
 injectAnimationStyles();
}
