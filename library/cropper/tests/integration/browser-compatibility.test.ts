/**
 * @ldesign/cropper 浏览器兼容性测试
 * 
 * 测试不同浏览器环境下的兼容性
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { Cropper } from '../../src/core/Cropper';

// 浏览器环境模拟
const browserEnvironments = {
  chrome: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    features: {
      canvas: true,
      webgl: true,
      fileAPI: true,
      clipboard: true,
      touch: false,
      webp: true,
      avif: true
    }
  },
  firefox: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    features: {
      canvas: true,
      webgl: true,
      fileAPI: true,
      clipboard: true,
      touch: false,
      webp: true,
      avif: false
    }
  },
  safari: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    features: {
      canvas: true,
      webgl: true,
      fileAPI: true,
      clipboard: false,
      touch: false,
      webp: true,
      avif: false
    }
  },
  edge: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    features: {
      canvas: true,
      webgl: true,
      fileAPI: true,
      clipboard: true,
      touch: false,
      webp: true,
      avif: true
    }
  },
  mobileSafari: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    features: {
      canvas: true,
      webgl: true,
      fileAPI: true,
      clipboard: false,
      touch: true,
      webp: true,
      avif: false
    }
  },
  mobileChrome: {
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    features: {
      canvas: true,
      webgl: true,
      fileAPI: true,
      clipboard: true,
      touch: true,
      webp: true,
      avif: true
    }
  }
};

describe('Browser Compatibility Tests', () => {
  let dom: JSDOM;
  let container: HTMLDivElement;
  let cropper: Cropper;

  function setupBrowserEnvironment(browserName: keyof typeof browserEnvironments) {
    const browser = browserEnvironments[browserName];
    
    // 设置User Agent
    Object.defineProperty(window.navigator, 'userAgent', {
      value: browser.userAgent,
      configurable: true
    });

    // 模拟浏览器特性
    if (!browser.features.clipboard) {
      delete (window.navigator as any).clipboard;
    }

    if (browser.features.touch) {
      // 模拟触摸支持
      Object.defineProperty(window, 'TouchEvent', {
        value: class TouchEvent extends Event {
          touches: any[] = [];
          targetTouches: any[] = [];
          changedTouches: any[] = [];
        },
        configurable: true
      });
    }

    // 模拟图片格式支持
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName: string) {
      const element = originalCreateElement.call(this, tagName);
      
      if (tagName.toLowerCase() === 'canvas') {
        const originalToBlob = element.toBlob;
        element.toBlob = function(callback: any, type?: string) {
          if (type === 'image/webp' && !browser.features.webp) {
            // 降级到PNG
            return originalToBlob.call(this, callback, 'image/png');
          }
          if (type === 'image/avif' && !browser.features.avif) {
            // 降级到JPEG
            return originalToBlob.call(this, callback, 'image/jpeg');
          }
          return originalToBlob.call(this, callback, type);
        };
      }
      
      return element;
    };
  }

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    global.window = dom.window as any;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
    global.Image = dom.window.Image;

    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (cropper) {
      cropper.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Desktop Browsers', () => {
    it('should work in Chrome', () => {
      setupBrowserEnvironment('chrome');
      
      expect(() => {
        cropper = new Cropper(container);
      }).not.toThrow();
      
      expect(cropper).toBeDefined();
      expect(cropper.isSupported()).toBe(true);
    });

    it('should work in Firefox', () => {
      setupBrowserEnvironment('firefox');
      
      expect(() => {
        cropper = new Cropper(container);
      }).not.toThrow();
      
      expect(cropper).toBeDefined();
      expect(cropper.isSupported()).toBe(true);
    });

    it('should work in Safari', () => {
      setupBrowserEnvironment('safari');
      
      expect(() => {
        cropper = new Cropper(container);
      }).not.toThrow();
      
      expect(cropper).toBeDefined();
      expect(cropper.isSupported()).toBe(true);
    });

    it('should work in Edge', () => {
      setupBrowserEnvironment('edge');
      
      expect(() => {
        cropper = new Cropper(container);
      }).not.toThrow();
      
      expect(cropper).toBeDefined();
      expect(cropper.isSupported()).toBe(true);
    });
  });

  describe('Mobile Browsers', () => {
    it('should work in Mobile Safari', () => {
      setupBrowserEnvironment('mobileSafari');
      
      expect(() => {
        cropper = new Cropper(container, {
          enableTouch: true,
          enableGestures: true
        });
      }).not.toThrow();
      
      expect(cropper).toBeDefined();
      expect(cropper.isSupported()).toBe(true);
    });

    it('should work in Mobile Chrome', () => {
      setupBrowserEnvironment('mobileChrome');
      
      expect(() => {
        cropper = new Cropper(container, {
          enableTouch: true,
          enableGestures: true
        });
      }).not.toThrow();
      
      expect(cropper).toBeDefined();
      expect(cropper.isSupported()).toBe(true);
    });
  });

  describe('Feature Detection', () => {
    it('should detect Canvas support', () => {
      setupBrowserEnvironment('chrome');
      cropper = new Cropper(container);
      
      const features = cropper.getSupportedFeatures();
      expect(features.canvas).toBe(true);
    });

    it('should detect WebGL support', () => {
      setupBrowserEnvironment('chrome');
      cropper = new Cropper(container);
      
      const features = cropper.getSupportedFeatures();
      expect(features.webgl).toBe(true);
    });

    it('should detect File API support', () => {
      setupBrowserEnvironment('chrome');
      cropper = new Cropper(container);
      
      const features = cropper.getSupportedFeatures();
      expect(features.fileAPI).toBe(true);
    });

    it('should detect Touch support', () => {
      setupBrowserEnvironment('mobileChrome');
      cropper = new Cropper(container);
      
      const features = cropper.getSupportedFeatures();
      expect(features.touch).toBe(true);
    });

    it('should detect Clipboard API support', () => {
      setupBrowserEnvironment('chrome');
      cropper = new Cropper(container);
      
      const features = cropper.getSupportedFeatures();
      expect(features.clipboard).toBe(true);
    });
  });

  describe('Image Format Support', () => {
    it('should handle WebP support correctly', async () => {
      setupBrowserEnvironment('chrome');
      cropper = new Cropper(container);
      
      const supportedFormats = cropper.getSupportedExportFormats();
      expect(supportedFormats).toContain('image/webp');
    });

    it('should handle AVIF support correctly', async () => {
      setupBrowserEnvironment('chrome');
      cropper = new Cropper(container);
      
      const supportedFormats = cropper.getSupportedExportFormats();
      expect(supportedFormats).toContain('image/avif');
    });

    it('should fallback when format not supported', async () => {
      setupBrowserEnvironment('firefox'); // Firefox不支持AVIF
      cropper = new Cropper(container);
      
      const supportedFormats = cropper.getSupportedExportFormats();
      expect(supportedFormats).not.toContain('image/avif');
      expect(supportedFormats).toContain('image/jpeg');
    });
  });

  describe('Polyfill Requirements', () => {
    it('should work without modern features', () => {
      // 模拟老旧浏览器环境
      const originalRequestAnimationFrame = window.requestAnimationFrame;
      const originalCancelAnimationFrame = window.cancelAnimationFrame;
      
      delete (window as any).requestAnimationFrame;
      delete (window as any).cancelAnimationFrame;
      
      try {
        expect(() => {
          cropper = new Cropper(container);
        }).not.toThrow();
        
        expect(cropper).toBeDefined();
      } finally {
        window.requestAnimationFrame = originalRequestAnimationFrame;
        window.cancelAnimationFrame = originalCancelAnimationFrame;
      }
    });

    it('should provide fallbacks for missing APIs', () => {
      // 模拟缺少Intersection Observer
      const originalIntersectionObserver = window.IntersectionObserver;
      delete (window as any).IntersectionObserver;
      
      try {
        expect(() => {
          cropper = new Cropper(container);
        }).not.toThrow();
      } finally {
        window.IntersectionObserver = originalIntersectionObserver;
      }
    });
  });

  describe('Performance Across Browsers', () => {
    it('should maintain performance in Chrome', async () => {
      setupBrowserEnvironment('chrome');
      cropper = new Cropper(container);
      
      const startTime = performance.now();
      
      // 执行一些操作
      cropper.setCropData({ x: 100, y: 100, width: 200, height: 200, shape: 'rectangle' });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // 50ms内完成
    });

    it('should maintain performance in Firefox', async () => {
      setupBrowserEnvironment('firefox');
      cropper = new Cropper(container);
      
      const startTime = performance.now();
      
      cropper.setCropData({ x: 100, y: 100, width: 200, height: 200, shape: 'rectangle' });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should maintain performance on mobile', async () => {
      setupBrowserEnvironment('mobileChrome');
      cropper = new Cropper(container, {
        enableTouch: true,
        enableGestures: true
      });
      
      const startTime = performance.now();
      
      cropper.setCropData({ x: 50, y: 50, width: 150, height: 150, shape: 'rectangle' });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // 移动端允许更长时间
    });
  });

  describe('Error Handling Across Browsers', () => {
    it('should handle Canvas errors gracefully', () => {
      setupBrowserEnvironment('chrome');
      
      // 模拟Canvas错误
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function() {
        throw new Error('Canvas not supported');
      };
      
      try {
        expect(() => {
          cropper = new Cropper(container);
        }).not.toThrow();
        
        expect(cropper.isSupported()).toBe(false);
      } finally {
        HTMLCanvasElement.prototype.getContext = originalGetContext;
      }
    });

    it('should handle File API errors gracefully', () => {
      setupBrowserEnvironment('safari');
      
      // 模拟File API限制
      const originalFileReader = window.FileReader;
      delete (window as any).FileReader;
      
      try {
        expect(() => {
          cropper = new Cropper(container);
        }).not.toThrow();
        
        const features = cropper.getSupportedFeatures();
        expect(features.fileAPI).toBe(false);
      } finally {
        window.FileReader = originalFileReader;
      }
    });
  });

  describe('Accessibility Across Browsers', () => {
    it('should support keyboard navigation in all browsers', () => {
      const browsers = ['chrome', 'firefox', 'safari', 'edge'] as const;
      
      browsers.forEach(browserName => {
        setupBrowserEnvironment(browserName);
        
        expect(() => {
          cropper = new Cropper(container, {
            enableKeyboard: true,
            accessibility: true
          });
        }).not.toThrow();
        
        expect(cropper.isAccessible()).toBe(true);
        
        if (cropper) {
          cropper.destroy();
        }
      });
    });

    it('should provide proper ARIA attributes', () => {
      setupBrowserEnvironment('chrome');
      cropper = new Cropper(container, {
        accessibility: true
      });
      
      const element = cropper.getElement();
      expect(element.getAttribute('role')).toBe('img');
      expect(element.getAttribute('aria-label')).toBeTruthy();
    });
  });
});
