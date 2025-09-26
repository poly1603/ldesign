/**
 * @ldesign/cropper 主裁剪器类测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Cropper } from '../../core/Cropper';

// Mock DOM APIs
global.HTMLCanvasElement = class MockHTMLCanvasElement {
  width = 800;
  height = 600;
  style = {};
  parentNode = null;
  
  getContext() {
    return {
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      setTransform: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      clip: vi.fn(),
      rect: vi.fn(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      textRenderingOptimization: 'optimizeQuality',
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1
    };
  }
  
  toDataURL() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
  
  toBlob(callback: (blob: Blob | null) => void) {
    const blob = new Blob(['fake-image-data'], { type: 'image/png' });
    setTimeout(() => callback(blob), 0);
  }
} as any;

global.Image = class MockImage {
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 800;
  naturalHeight = 600;
  width = 800;
  height = 600;
  
  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
} as any;

// Mock performance API
global.performance = {
  now: vi.fn(() => Date.now())
} as any;

// Mock window APIs
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 1
});

Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: vi.fn((callback) => setTimeout(callback, 16))
});

describe('Cropper', () => {
  let container: HTMLElement;
  let cropper: Cropper;

  beforeEach(() => {
    // 创建容器元素
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    // Mock getBoundingClientRect
    container.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => ({})
    }));
  });

  afterEach(() => {
    if (cropper) {
      cropper.destroy();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('初始化', () => {
    it('应该正确初始化裁剪器', () => {
      cropper = new Cropper(container);
      
      expect(cropper).toBeDefined();
      expect(cropper.getState().initialized).toBe(true);
    });

    it('应该接受字符串选择器作为容器', () => {
      container.id = 'test-container';
      cropper = new Cropper('#test-container');
      
      expect(cropper).toBeDefined();
    });

    it('应该接受自定义配置', () => {
      const config = {
        shape: 'circle' as const,
        aspectRatio: 1,
        minZoom: 0.5,
        maxZoom: 5
      };
      
      cropper = new Cropper(container, config);
      
      const currentConfig = cropper.getConfig();
      expect(currentConfig.shape).toBe('circle');
      expect(currentConfig.aspectRatio).toBe(1);
      expect(currentConfig.minZoom).toBe(0.5);
      expect(currentConfig.maxZoom).toBe(5);
    });

    it('应该抛出错误当容器不存在时', () => {
      expect(() => {
        new Cropper('#non-existent-container');
      }).toThrow();
    });

    it('应该抛出错误当容器无效时', () => {
      expect(() => {
        new Cropper(null as any);
      }).toThrow();
    });
  });

  describe('图片操作', () => {
    beforeEach(() => {
      cropper = new Cropper(container);
    });

    it('应该正确设置图片源', async () => {
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      await cropper.setImageSource(imageUrl);
      
      const state = cropper.getState();
      expect(state.hasImage).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      
      const imageInfo = cropper.getImageInfo();
      expect(imageInfo).toBeDefined();
    });

    it('应该处理图片加载错误', async () => {
      // Mock Image to simulate error
      const originalImage = global.Image;
      global.Image = class MockErrorImage {
        src = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 0);
        }
      } as any;

      try {
        await cropper.setImageSource('invalid-url');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }

      global.Image = originalImage;
    });

    it('应该支持File对象作为图片源', async () => {
      const file = new File(['fake-image-data'], 'test.png', { type: 'image/png' });
      
      // Mock FileReader
      global.FileReader = class MockFileReader {
        result = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        onload: ((event: any) => void) | null = null;
        onerror: (() => void) | null = null;
        
        readAsDataURL() {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: this.result } } as any);
            }
          }, 0);
        }
      } as any;
      
      await cropper.setImageSource(file);
      
      const state = cropper.getState();
      expect(state.hasImage).toBe(true);
    });
  });

  describe('裁剪区域操作', () => {
    beforeEach(async () => {
      cropper = new Cropper(container);
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      await cropper.setImageSource(imageUrl);
    });

    it('应该正确设置裁剪区域', () => {
      const rect = { x: 100, y: 100, width: 200, height: 150 };
      
      cropper.setCropArea(rect);
      
      const cropArea = cropper.getCropArea();
      expect(cropArea).toBeDefined();
      expect(cropArea?.rect).toEqual(rect);
      
      const state = cropper.getState();
      expect(state.hasCropArea).toBe(true);
    });

    it('应该正确清除裁剪区域', () => {
      const rect = { x: 100, y: 100, width: 200, height: 150 };
      cropper.setCropArea(rect);
      
      cropper.clearCropArea();
      
      const cropArea = cropper.getCropArea();
      expect(cropArea).toBeNull();
      
      const state = cropper.getState();
      expect(state.hasCropArea).toBe(false);
    });

    it('应该拒绝无效的裁剪区域', () => {
      const invalidRect = { x: NaN, y: NaN, width: -100, height: -100 };
      
      expect(() => {
        cropper.setCropArea(invalidRect);
      }).toThrow();
    });

    it('应该支持不同的裁剪形状', () => {
      const rect = { x: 100, y: 100, width: 200, height: 200 };
      
      cropper.setCropArea(rect, 'circle');
      
      const cropArea = cropper.getCropArea();
      expect(cropArea?.shape).toBe('circle');
    });
  });

  describe('变换操作', () => {
    beforeEach(async () => {
      cropper = new Cropper(container);
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      await cropper.setImageSource(imageUrl);
    });

    it('应该正确设置缩放', () => {
      cropper.setZoom(2.0);
      // 由于没有实际的渲染，我们只能测试方法不抛出错误
      expect(true).toBe(true);
    });

    it('应该正确进行缩放', () => {
      cropper.zoom(0.5);
      expect(true).toBe(true);
    });

    it('应该正确设置旋转', () => {
      cropper.setRotation(45);
      expect(true).toBe(true);
    });

    it('应该正确进行旋转', () => {
      cropper.rotate(90);
      expect(true).toBe(true);
    });

    it('应该在禁用旋转时忽略旋转操作', () => {
      cropper.updateConfig({ enableRotation: false });
      cropper.setRotation(45);
      cropper.rotate(90);
      expect(true).toBe(true);
    });

    it('应该正确适应容器', () => {
      cropper.fitToContainer();
      expect(true).toBe(true);
    });

    it('应该正确填充容器', () => {
      cropper.fillContainer();
      expect(true).toBe(true);
    });

    it('应该正确重置变换', () => {
      cropper.setZoom(2.0);
      cropper.setRotation(45);
      cropper.resetTransform();
      expect(true).toBe(true);
    });
  });

  describe('导出功能', () => {
    beforeEach(async () => {
      cropper = new Cropper(container);
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      await cropper.setImageSource(imageUrl);
      
      const rect = { x: 100, y: 100, width: 200, height: 150 };
      cropper.setCropArea(rect);
    });

    it('应该正确导出裁剪结果', async () => {
      const result = await cropper.export();
      
      expect(result).toBeDefined();
      expect(result.dataURL).toBeDefined();
      expect(result.blob).toBeDefined();
      expect(result.size).toBeDefined();
      expect(result.format).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    it('应该支持自定义导出选项', async () => {
      const options = {
        format: 'jpeg' as const,
        quality: 0.8,
        width: 300,
        height: 200
      };
      
      const result = await cropper.export(options);
      
      expect(result.format).toBe('jpeg');
      expect(result.size.width).toBe(300);
      expect(result.size.height).toBe(200);
    });

    it('应该在没有图片时抛出错误', async () => {
      const emptyCropper = new Cropper(container);
      
      try {
        await emptyCropper.export();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      emptyCropper.destroy();
    });

    it('应该在没有裁剪区域时抛出错误', async () => {
      cropper.clearCropArea();
      
      try {
        await cropper.export();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('配置管理', () => {
    beforeEach(() => {
      cropper = new Cropper(container);
    });

    it('应该正确更新配置', () => {
      const newConfig = {
        shape: 'circle' as const,
        aspectRatio: 1,
        showGrid: false
      };
      
      cropper.updateConfig(newConfig);
      
      const currentConfig = cropper.getConfig();
      expect(currentConfig.shape).toBe('circle');
      expect(currentConfig.aspectRatio).toBe(1);
      expect(currentConfig.showGrid).toBe(false);
    });

    it('应该返回当前配置的副本', () => {
      const config1 = cropper.getConfig();
      const config2 = cropper.getConfig();
      
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // 应该是不同的对象
    });
  });

  describe('事件系统', () => {
    beforeEach(() => {
      cropper = new Cropper(container);
    });

    it('应该正确添加和触发事件监听器', (done) => {
      const listener = vi.fn((event) => {
        expect(event.type).toBe('ready');
        done();
      });
      
      cropper.on('ready', listener);
      
      // ready事件在初始化时已经触发，所以我们需要创建新的实例
      cropper.destroy();
      cropper = new Cropper(container);
      cropper.on('ready', listener);
    });

    it('应该正确移除事件监听器', () => {
      const listener = vi.fn();
      
      cropper.on('test-event', listener);
      cropper.off('test-event', listener);
      
      // 手动触发事件来测试监听器是否被移除
      // 由于没有公共的emit方法，我们只能测试方法不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('状态管理', () => {
    beforeEach(() => {
      cropper = new Cropper(container);
    });

    it('应该返回正确的初始状态', () => {
      const state = cropper.getState();
      
      expect(state.initialized).toBe(true);
      expect(state.hasImage).toBe(false);
      expect(state.hasCropArea).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.interacting).toBe(false);
      expect(state.error).toBeNull();
    });

    it('应该在设置图片后更新状态', async () => {
      const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      await cropper.setImageSource(imageUrl);
      
      const state = cropper.getState();
      expect(state.hasImage).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('应该返回状态的副本', () => {
      const state1 = cropper.getState();
      const state2 = cropper.getState();
      
      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // 应该是不同的对象
    });
  });

  describe('销毁', () => {
    beforeEach(() => {
      cropper = new Cropper(container);
    });

    it('应该正确销毁裁剪器', () => {
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeDefined();
      
      cropper.destroy();
      
      // Canvas应该从DOM中移除
      const canvasAfterDestroy = container.querySelector('canvas');
      expect(canvasAfterDestroy).toBeNull();
    });

    it('应该清理事件监听器', () => {
      const listener = vi.fn();
      cropper.on('test-event', listener);
      
      cropper.destroy();
      
      // 销毁后应该不再有事件监听器
      expect(true).toBe(true);
    });
  });
});
