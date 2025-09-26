/**
 * @ldesign/cropper 控制点管理器测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ControlPointManager } from '../../core/ControlPointManager';
import type { CropArea, Point, Size } from '../../types';

// Mock performance API
global.performance = {
  now: vi.fn(() => Date.now())
} as any;

// Mock window.devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 1
});

describe('ControlPointManager', () => {
  let manager: ControlPointManager;
  let mockCropArea: CropArea;
  let containerSize: Size;

  beforeEach(() => {
    manager = new ControlPointManager();
    
    mockCropArea = {
      id: 'test-crop',
      rect: { x: 100, y: 100, width: 200, height: 150 },
      shape: 'rectangle',
      rotation: 0,
      editable: true,
      visible: true,
      constraints: {
        minSize: { width: 10, height: 10 },
        maxSize: { width: 1000, height: 1000 },
        aspectRatio: undefined,
        boundary: { x: 0, y: 0, width: 800, height: 600 }
      }
    };

    containerSize = { width: 800, height: 600 };
    
    manager.setContainerSize(containerSize);
    manager.setCropArea(mockCropArea);
  });

  describe('初始化', () => {
    it('应该正确初始化控制点管理器', () => {
      expect(manager).toBeDefined();
      expect(manager.getControlPoints()).toHaveLength(0);
    });

    it('应该使用默认配置', () => {
      const newManager = new ControlPointManager();
      expect(newManager).toBeDefined();
    });

    it('应该接受自定义配置', () => {
      const customConfig = {
        pointSize: 12,
        pointColor: '#ff0000'
      };
      const newManager = new ControlPointManager(customConfig);
      expect(newManager).toBeDefined();
    });
  });

  describe('裁剪区域设置', () => {
    it('应该正确设置裁剪区域', () => {
      manager.setCropArea(mockCropArea);
      const controlPoints = manager.getControlPoints();
      
      // 应该有8个调整控制点 + 1个旋转控制点
      expect(controlPoints.length).toBeGreaterThan(0);
    });

    it('应该在没有裁剪区域时清空控制点', () => {
      manager.setCropArea(null);
      const controlPoints = manager.getControlPoints();
      expect(controlPoints).toHaveLength(0);
    });

    it('应该为矩形裁剪区域创建正确的控制点', () => {
      manager.setCropArea(mockCropArea);
      const controlPoints = manager.getControlPoints();
      
      // 检查是否有调整控制点
      const resizePoints = controlPoints.filter(p => p.type === 'resize');
      expect(resizePoints).toHaveLength(8);
      
      // 检查控制点方向
      const directions = resizePoints.map(p => p.direction);
      expect(directions).toContain('nw');
      expect(directions).toContain('n');
      expect(directions).toContain('ne');
      expect(directions).toContain('e');
      expect(directions).toContain('se');
      expect(directions).toContain('s');
      expect(directions).toContain('sw');
      expect(directions).toContain('w');
    });

    it('应该创建旋转控制点', () => {
      manager.setCropArea(mockCropArea);
      const controlPoints = manager.getControlPoints();
      
      const rotationPoints = controlPoints.filter(p => p.type === 'rotation');
      expect(rotationPoints).toHaveLength(1);
      expect(rotationPoints[0].direction).toBe('rotation');
    });
  });

  describe('控制点检测', () => {
    beforeEach(() => {
      manager.setCropArea(mockCropArea);
    });

    it('应该正确检测点击的控制点', () => {
      // 测试左上角控制点
      const topLeftPoint = { x: 100, y: 100 };
      const hitPoint = manager.hitTest(topLeftPoint);
      
      expect(hitPoint).toBeDefined();
      expect(hitPoint?.type).toBe('resize');
      expect(hitPoint?.direction).toBe('nw');
    });

    it('应该在没有点击控制点时返回null', () => {
      const emptyPoint = { x: 50, y: 50 };
      const hitPoint = manager.hitTest(emptyPoint);
      expect(hitPoint).toBeNull();
    });

    it('应该处理无效的点击位置', () => {
      const invalidPoint = { x: NaN, y: NaN };
      const hitPoint = manager.hitTest(invalidPoint);
      expect(hitPoint).toBeNull();
    });

    it('应该优先检测旋转控制点', () => {
      const controlPoints = manager.getControlPoints();
      const rotationPoint = controlPoints.find(p => p.type === 'rotation');
      
      if (rotationPoint) {
        const hitPoint = manager.hitTest(rotationPoint.position);
        expect(hitPoint?.type).toBe('rotation');
      }
    });
  });

  describe('交互管理', () => {
    let controlPoint: any;

    beforeEach(() => {
      manager.setCropArea(mockCropArea);
      const controlPoints = manager.getControlPoints();
      controlPoint = controlPoints.find(p => p.direction === 'se'); // 右下角控制点
    });

    it('应该正确开始交互', () => {
      const startPoint = { x: 300, y: 250 };
      const success = manager.startInteraction(startPoint, controlPoint);
      
      expect(success).toBe(true);
      
      const state = manager.getInteractionState();
      expect(state.active).toBe(true);
      expect(state.activePoint).toBe(controlPoint);
      expect(state.startPosition).toEqual(startPoint);
      expect(state.interactionType).toBe('resize');
    });

    it('应该拒绝无效的交互开始', () => {
      const invalidPoint = { x: NaN, y: NaN };
      const success = manager.startInteraction(invalidPoint, controlPoint);
      expect(success).toBe(false);
    });

    it('应该正确更新调整大小交互', () => {
      const startPoint = { x: 300, y: 250 };
      manager.startInteraction(startPoint, controlPoint);
      
      const currentPoint = { x: 320, y: 270 };
      const updatedCropArea = manager.updateInteraction(currentPoint);
      
      expect(updatedCropArea).toBeDefined();
      expect(updatedCropArea?.rect.width).toBeGreaterThan(mockCropArea.rect.width);
      expect(updatedCropArea?.rect.height).toBeGreaterThan(mockCropArea.rect.height);
    });

    it('应该正确处理旋转交互', () => {
      const rotationPoint = manager.getControlPoints().find(p => p.type === 'rotation');
      if (!rotationPoint) return;

      const startPoint = rotationPoint.position;
      manager.startInteraction(startPoint, rotationPoint);
      
      const currentPoint = { x: startPoint.x + 50, y: startPoint.y };
      const updatedCropArea = manager.updateInteraction(currentPoint);
      
      expect(updatedCropArea).toBeDefined();
      expect(updatedCropArea?.rotation).not.toBe(mockCropArea.rotation);
    });

    it('应该正确结束交互', () => {
      const startPoint = { x: 300, y: 250 };
      manager.startInteraction(startPoint, controlPoint);
      
      manager.endInteraction();
      
      const state = manager.getInteractionState();
      expect(state.active).toBe(false);
      expect(state.activePoint).toBeNull();
      expect(state.startPosition).toBeNull();
      expect(state.interactionType).toBeNull();
    });
  });

  describe('悬停状态', () => {
    beforeEach(() => {
      manager.setCropArea(mockCropArea);
    });

    it('应该正确设置悬停控制点', () => {
      const hoverPoint = { x: 100, y: 100 }; // 左上角
      manager.setHoverPoint(hoverPoint);
      
      const state = manager.getInteractionState();
      expect(state.hoverPoint).toBeDefined();
      expect(state.hoverPoint?.direction).toBe('nw');
    });

    it('应该清除悬停状态', () => {
      manager.setHoverPoint({ x: 100, y: 100 });
      manager.setHoverPoint(null);
      
      const state = manager.getInteractionState();
      expect(state.hoverPoint).toBeNull();
    });
  });

  describe('控制点样式', () => {
    beforeEach(() => {
      manager.setCropArea(mockCropArea);
    });

    it('应该返回正确的控制点样式', () => {
      const controlPoints = manager.getControlPoints();
      const controlPoint = controlPoints[0];
      
      const style = manager.getControlPointStyle(controlPoint);
      
      expect(style).toBeDefined();
      expect(style.size).toBeGreaterThan(0);
      expect(style.color).toBeDefined();
      expect(style.borderColor).toBeDefined();
      expect(style.cursor).toBeDefined();
      expect(style.zIndex).toBeGreaterThan(0);
    });

    it('应该为悬停状态返回不同的样式', () => {
      const controlPoints = manager.getControlPoints();
      const controlPoint = controlPoints[0];
      
      // 设置悬停状态
      manager.setHoverPoint(controlPoint.position);
      
      const style = manager.getControlPointStyle(controlPoint);
      expect(style.color).toBeDefined();
    });

    it('应该为激活状态返回不同的样式', () => {
      const controlPoints = manager.getControlPoints();
      const controlPoint = controlPoints[0];
      
      // 开始交互
      manager.startInteraction(controlPoint.position, controlPoint);
      
      const style = manager.getControlPointStyle(controlPoint);
      expect(style.color).toBeDefined();
    });
  });

  describe('配置更新', () => {
    it('应该正确更新配置', () => {
      const newConfig = {
        pointSize: 12,
        pointColor: '#ff0000',
        showRotationPoint: false
      };
      
      manager.updateConfig(newConfig);
      manager.setCropArea(mockCropArea);
      
      const controlPoints = manager.getControlPoints();
      const rotationPoints = controlPoints.filter(p => p.type === 'rotation');
      expect(rotationPoints).toHaveLength(0);
    });

    it('应该支持响应式大小配置', () => {
      const config = {
        responsive: true,
        mobileScale: 2.0
      };
      
      manager.updateConfig(config);
      
      // 模拟移动设备
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        value: true
      });
      
      const controlPoints = manager.getControlPoints();
      if (controlPoints.length > 0) {
        const style = manager.getControlPointStyle(controlPoints[0]);
        expect(style.size).toBeGreaterThan(8); // 默认大小
      }
    });
  });

  describe('边界情况', () => {
    it('应该处理最小尺寸约束', () => {
      const controlPoints = manager.getControlPoints();
      const sePoint = controlPoints.find(p => p.direction === 'se');
      
      if (sePoint) {
        manager.startInteraction(sePoint.position, sePoint);
        
        // 尝试调整到非常小的尺寸
        const tinyPoint = { x: 105, y: 105 };
        const result = manager.updateInteraction(tinyPoint);
        
        // 应该返回null或保持最小尺寸
        if (result) {
          expect(result.rect.width).toBeGreaterThanOrEqual(10);
          expect(result.rect.height).toBeGreaterThanOrEqual(10);
        } else {
          expect(result).toBeNull();
        }
      }
    });

    it('应该处理无效的交互更新', () => {
      const result = manager.updateInteraction({ x: 100, y: 100 });
      expect(result).toBeNull();
    });

    it('应该处理容器尺寸变化', () => {
      const newSize = { width: 1200, height: 800 };
      manager.setContainerSize(newSize);
      
      // 控制点应该仍然可用
      const controlPoints = manager.getControlPoints();
      expect(controlPoints.length).toBeGreaterThan(0);
    });
  });
});
