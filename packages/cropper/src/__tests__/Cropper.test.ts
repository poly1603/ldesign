/**
 * @ldesign/cropper - 核心裁剪器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Cropper } from '../core/Cropper';
import type { CropperConfig } from '../types';

// Mock DOM APIs
Object.defineProperty(window, 'HTMLCanvasElement', {
  value: class MockCanvas {
    width = 0;
    height = 0;
    
    getContext() {
      return {
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        putImageData: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn()
      };
    }
    
    toDataURL() {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }
});

Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return new (window as any).HTMLCanvasElement();
    }
    return {
      style: {},
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      contains: vi.fn(() => false)
    };
  })
});

describe('Cropper', () => {
  let container: HTMLElement;
  let cropper: Cropper;
  let config: CropperConfig;

  beforeEach(() => {
    // 创建容器元素
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';

    // 默认配置
    config = {
      theme: 'light',
      responsive: true,
      aspectRatio: 'free',
      minCropSize: { width: 50, height: 50 },
      maxCropSize: { width: 2000, height: 2000 },
      cropShape: 'rect',
      showGrid: true,
      gridLines: 3,
      toolbar: {
        show: true,
        position: 'top',
        tools: ['zoom-in', 'zoom-out', 'rotate-left', 'rotate-right', 'reset']
      },
      keyboard: {
        enabled: true,
        shortcuts: {
          'ctrl+z': 'undo',
          'ctrl+y': 'redo',
          'delete': 'clear'
        }
      },
      touch: {
        enabled: true,
        pinchToZoom: true,
        doubleTapToFit: true
      },
      animation: {
        enabled: true,
        duration: 300,
        easing: 'ease-out'
      }
    };
  });

  afterEach(() => {
    if (cropper) {
      cropper.destroy();
    }
  });

  describe('初始化', () => {
    it('应该成功创建裁剪器实例', () => {
      cropper = new Cropper(container, config);
      expect(cropper).toBeInstanceOf(Cropper);
    });

    it('应该抛出错误当容器为空时', () => {
      expect(() => {
        new Cropper(null as any, config);
      }).toThrow('Container element is required');
    });

    it('应该使用默认配置当未提供配置时', () => {
      cropper = new Cropper(container);
      expect(cropper).toBeInstanceOf(Cropper);
    });
  });

  describe('图像加载', () => {
    beforeEach(() => {
      cropper = new Cropper(container, config);
    });

    it('应该能够设置图像URL', async () => {
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      // Mock Image
      const mockImage = {
        naturalWidth: 100,
        naturalHeight: 100,
        addEventListener: vi.fn((event, callback) => {
          if (event === 'load') {
            setTimeout(callback, 0);
          }
        }),
        removeEventListener: vi.fn()
      };

      vi.spyOn(window, 'Image').mockImplementation(() => mockImage as any);

      await expect(cropper.setImageSource(imageUrl)).resolves.not.toThrow();
    });

    it('应该能够设置File对象', async () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        addEventListener: vi.fn((event, callback) => {
          if (event === 'load') {
            setTimeout(() => {
              (mockFileReader as any).result = 'data:image/png;base64,test';
              callback();
            }, 0);
          }
        }),
        removeEventListener: vi.fn()
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      await expect(cropper.setImageSource(file)).resolves.not.toThrow();
    });
  });

  describe('裁剪操作', () => {
    beforeEach(() => {
      cropper = new Cropper(container, config);
    });

    it('应该能够设置裁剪区域', () => {
      const area = { x: 10, y: 10, width: 100, height: 100 };
      
      expect(() => {
        cropper.setCropArea(area);
      }).not.toThrow();
    });

    it('应该能够获取裁剪数据', () => {
      const cropData = cropper.getCropData();
      
      expect(cropData).toBeDefined();
      expect(cropData.area).toBeDefined();
      expect(cropData.aspectRatio).toBeDefined();
    });

    it('应该能够设置宽高比', () => {
      expect(() => {
        cropper.setAspectRatio(16/9);
      }).not.toThrow();

      expect(() => {
        cropper.setAspectRatio('1:1');
      }).not.toThrow();
    });
  });

  describe('变换操作', () => {
    beforeEach(() => {
      cropper = new Cropper(container, config);
    });

    it('应该能够旋转图像', () => {
      expect(() => {
        cropper.rotate(90);
      }).not.toThrow();

      expect(() => {
        cropper.rotate(-45);
      }).not.toThrow();
    });

    it('应该能够缩放图像', () => {
      expect(() => {
        cropper.scale(1.5);
      }).not.toThrow();

      expect(() => {
        cropper.scale(0.8);
      }).not.toThrow();
    });

    it('应该能够翻转图像', () => {
      expect(() => {
        cropper.flip(true, false); // 水平翻转
      }).not.toThrow();

      expect(() => {
        cropper.flip(false, true); // 垂直翻转
      }).not.toThrow();

      expect(() => {
        cropper.flip(true, true); // 同时翻转
      }).not.toThrow();
    });
  });

  describe('导出功能', () => {
    beforeEach(() => {
      cropper = new Cropper(container, config);
    });

    it('应该能够导出为Blob', async () => {
      const result = await cropper.export({ format: 'png', quality: 0.9 });
      
      expect(result).toBeDefined();
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.dataURL).toMatch(/^data:image/);
    });

    it('应该能够导出为不同格式', async () => {
      const pngResult = await cropper.export({ format: 'png' });
      expect(pngResult.dataURL).toMatch(/^data:image\/png/);

      const jpegResult = await cropper.export({ format: 'jpeg' });
      expect(jpegResult.dataURL).toMatch(/^data:image\/jpeg/);
    });

    it('应该能够指定导出尺寸', async () => {
      const result = await cropper.export({ 
        width: 200, 
        height: 150 
      });
      
      expect(result).toBeDefined();
    });
  });

  describe('事件系统', () => {
    beforeEach(() => {
      cropper = new Cropper(container, config);
    });

    it('应该能够监听事件', () => {
      const callback = vi.fn();
      
      expect(() => {
        cropper.on('cropStart', callback);
      }).not.toThrow();
    });

    it('应该能够移除事件监听器', () => {
      const callback = vi.fn();
      
      cropper.on('cropStart', callback);
      
      expect(() => {
        cropper.off('cropStart', callback);
      }).not.toThrow();
    });

    it('应该能够触发事件', () => {
      const callback = vi.fn();
      cropper.on('cropStart', callback);
      
      // 模拟触发事件
      (cropper as any).eventEmitter.emit('cropStart', { type: 'cropStart' });
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('配置更新', () => {
    beforeEach(() => {
      cropper = new Cropper(container, config);
    });

    it('应该能够更新配置', () => {
      const newConfig = {
        theme: 'dark' as const,
        showGrid: false
      };
      
      expect(() => {
        cropper.updateConfig(newConfig);
      }).not.toThrow();
    });
  });

  describe('重置和销毁', () => {
    beforeEach(() => {
      cropper = new Cropper(container, config);
    });

    it('应该能够重置裁剪器', () => {
      expect(() => {
        cropper.reset();
      }).not.toThrow();
    });

    it('应该能够销毁裁剪器', () => {
      expect(() => {
        cropper.destroy();
      }).not.toThrow();
    });
  });
});
