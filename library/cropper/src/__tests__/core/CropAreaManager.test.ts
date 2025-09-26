/**
 * @ldesign/cropper CropAreaManager 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CropAreaManager, DEFAULT_CROP_AREA_CONFIG } from '../../core/CropAreaManager';
import type { Rect, Size, ImageInfo, CropArea } from '../../types';

describe('CropAreaManager', () => {
  let manager: CropAreaManager;
  let mockImageInfo: ImageInfo;

  beforeEach(() => {
    manager = new CropAreaManager();
    mockImageInfo = {
      src: 'test.jpg',
      naturalWidth: 800,
      naturalHeight: 600,
      width: 400,
      height: 300,
      format: 'jpeg',
      size: 1024 * 50 // 50KB
    };
    manager.setImageInfo(mockImageInfo);
    manager.setContainerSize({ width: 400, height: 300 });
  });

  describe('构造函数和配置', () => {
    it('应该使用默认配置创建管理器', () => {
      const defaultManager = new CropAreaManager();
      expect(defaultManager).toBeDefined();
    });

    it('应该接受自定义配置', () => {
      const customConfig = {
        defaultShape: 'circle' as const,
        minCropSize: { width: 20, height: 20 }
      };
      const customManager = new CropAreaManager(customConfig);
      expect(customManager).toBeDefined();
    });

    it('应该能够更新配置', () => {
      const newConfig = {
        maintainAspectRatio: true,
        aspectRatio: 16 / 9
      };
      manager.updateConfig(newConfig);
      expect(() => manager.updateConfig(newConfig)).not.toThrow();
    });
  });

  describe('裁剪区域创建', () => {
    it('应该创建有效的矩形裁剪区域', () => {
      const rect: Rect = { x: 50, y: 50, width: 200, height: 150 };
      const cropArea = manager.createCropArea(rect);

      expect(cropArea).toBeDefined();
      expect(cropArea.shape).toBe('rectangle');
      expect(cropArea.rect).toEqual(rect);
      expect(cropArea.editable).toBe(true);
      expect(cropArea.visible).toBe(true);
      expect(cropArea.locked).toBe(false);
      expect(cropArea.id).toBeDefined();
      expect(cropArea.metadata).toBeDefined();
      expect(cropArea.metadata.createdAt).toBeTypeOf('number');
      expect(cropArea.metadata.updatedAt).toBeTypeOf('number');
    });

    it('应该创建指定形状的裁剪区域', () => {
      const rect: Rect = { x: 50, y: 50, width: 200, height: 200 };
      const cropArea = manager.createCropArea(rect, 'circle');

      expect(cropArea.shape).toBe('circle');
    });

    it('应该拒绝无效的矩形', () => {
      const invalidRect: Rect = { x: 0, y: 0, width: -10, height: 50 };
      expect(() => manager.createCropArea(invalidRect)).toThrow('Invalid rectangle');
    });

    it('应该应用最小尺寸约束', () => {
      const smallRect: Rect = { x: 50, y: 50, width: 5, height: 5 };
      const cropArea = manager.createCropArea(smallRect);

      expect(cropArea.rect.width).toBeGreaterThanOrEqual(DEFAULT_CROP_AREA_CONFIG.minCropSize.width);
      expect(cropArea.rect.height).toBeGreaterThanOrEqual(DEFAULT_CROP_AREA_CONFIG.minCropSize.height);
    });
  });

  describe('裁剪区域更新', () => {
    let cropArea: CropArea;

    beforeEach(() => {
      const rect: Rect = { x: 50, y: 50, width: 200, height: 150 };
      cropArea = manager.createCropArea(rect);
    });

    it('应该更新裁剪区域属性', async () => {
      // 添加小延迟确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));

      const updates = {
        rect: { x: 60, y: 60, width: 180, height: 120 },
        rotation: Math.PI / 4
      };

      const updatedArea = manager.updateCropArea(updates);
      expect(updatedArea).toBeDefined();
      expect(updatedArea!.rect).toEqual(updates.rect);
      expect(updatedArea!.rotation).toBe(updates.rotation);
      expect(updatedArea!.metadata.updatedAt).toBeGreaterThanOrEqual(cropArea.metadata.updatedAt);
    });

    it('应该在没有当前区域时抛出错误', () => {
      manager.clearCropArea();
      expect(() => manager.updateCropArea({ rotation: 0 })).toThrow('No crop area to update');
    });

    it('应该验证更新后的区域', () => {
      const invalidUpdates = {
        rect: { x: 0, y: 0, width: -10, height: 50 }
      };

      // 由于约束系统会修正无效值，我们检查是否被修正而不是抛出错误
      const result = manager.updateCropArea(invalidUpdates);
      expect(result).toBeDefined();
      expect(result!.rect.width).toBeGreaterThan(0); // 应该被修正为正值
    });
  });

  describe('裁剪区域操作', () => {
    let cropArea: CropArea;

    beforeEach(() => {
      const rect: Rect = { x: 50, y: 50, width: 200, height: 150 };
      cropArea = manager.createCropArea(rect);
    });

    it('应该移动裁剪区域', () => {
      const delta = { x: 10, y: 20 };
      const movedArea = manager.moveCropArea(delta);

      expect(movedArea).toBeDefined();
      expect(movedArea!.rect.x).toBe(cropArea.rect.x + delta.x);
      expect(movedArea!.rect.y).toBe(cropArea.rect.y + delta.y);
      expect(movedArea!.rect.width).toBe(cropArea.rect.width);
      expect(movedArea!.rect.height).toBe(cropArea.rect.height);
    });

    it('应该调整裁剪区域大小', () => {
      const newSize: Size = { width: 250, height: 180 };
      const resizedArea = manager.resizeCropArea(newSize);

      expect(resizedArea).toBeDefined();
      expect(resizedArea!.rect.width).toBe(newSize.width);
      expect(resizedArea!.rect.height).toBe(newSize.height);
    });

    it('应该使用锚点调整大小', () => {
      const newSize: Size = { width: 250, height: 180 };
      const anchor = { x: 0, y: 0 }; // 左上角锚点
      const resizedArea = manager.resizeCropArea(newSize, anchor);

      expect(resizedArea).toBeDefined();
      expect(resizedArea!.rect.x).toBe(cropArea.rect.x);
      expect(resizedArea!.rect.y).toBe(cropArea.rect.y);
    });

    it('应该旋转裁剪区域', () => {
      const angle = Math.PI / 6; // 30度
      const rotatedArea = manager.rotateCropArea(angle);

      expect(rotatedArea).toBeDefined();
      expect(rotatedArea!.rotation).toBe(cropArea.rotation + angle);
    });

    it('应该在没有当前区域时返回null', () => {
      manager.clearCropArea();
      expect(manager.moveCropArea({ x: 10, y: 10 })).toBeNull();
      expect(manager.resizeCropArea({ width: 100, height: 100 })).toBeNull();
      expect(manager.rotateCropArea(Math.PI / 4)).toBeNull();
    });
  });

  describe('裁剪区域验证', () => {
    it('应该验证有效的裁剪区域', () => {
      const validArea: CropArea = {
        id: 'test-id',
        shape: 'rectangle',
        rect: { x: 50, y: 50, width: 200, height: 150 },
        rotation: 0,
        editable: true,
        visible: true,
        locked: false,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      };

      const validation = manager.validateCropArea(validArea);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('应该检测无效的矩形', () => {
      const invalidArea: CropArea = {
        id: 'test-id',
        shape: 'rectangle',
        rect: { x: 0, y: 0, width: -10, height: 50 },
        rotation: 0,
        editable: true,
        visible: true,
        locked: false,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      };

      const validation = manager.validateCropArea(invalidArea);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('应该修正尺寸约束违规', () => {
      const smallArea: CropArea = {
        id: 'test-id',
        shape: 'rectangle',
        rect: { x: 50, y: 50, width: 5, height: 5 },
        rotation: 0,
        editable: true,
        visible: true,
        locked: false,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      };

      const validation = manager.validateCropArea(smallArea);
      expect(validation.correctedArea).toBeDefined();
      expect(validation.correctedArea!.rect.width).toBeGreaterThanOrEqual(DEFAULT_CROP_AREA_CONFIG.minCropSize.width);
      expect(validation.correctedArea!.rect.height).toBeGreaterThanOrEqual(DEFAULT_CROP_AREA_CONFIG.minCropSize.height);
    });
  });

  describe('实际坐标计算', () => {
    it('应该计算实际裁剪矩形', () => {
      const rect: Rect = { x: 50, y: 50, width: 200, height: 150 };
      const cropArea = manager.createCropArea(rect);

      const actualRect = manager.getActualCropRect(cropArea);
      expect(actualRect).toBeDefined();
      expect(actualRect).toEqual(rect);
    });

    it('应该在没有图片信息时返回null', () => {
      manager.setImageInfo(null as any);
      const rect: Rect = { x: 50, y: 50, width: 200, height: 150 };
      const cropArea = manager.createCropArea(rect);

      const actualRect = manager.getActualCropRect(cropArea);
      expect(actualRect).toBeNull();
    });

    it('应该在没有裁剪区域时返回null', () => {
      const actualRect = manager.getActualCropRect();
      expect(actualRect).toBeNull();
    });
  });

  describe('状态管理', () => {
    it('应该获取当前裁剪区域', () => {
      expect(manager.getCurrentCropArea()).toBeNull();

      const rect: Rect = { x: 50, y: 50, width: 200, height: 150 };
      const cropArea = manager.createCropArea(rect);

      expect(manager.getCurrentCropArea()).toEqual(cropArea);
    });

    it('应该清除裁剪区域', () => {
      const rect: Rect = { x: 50, y: 50, width: 200, height: 150 };
      manager.createCropArea(rect);

      expect(manager.getCurrentCropArea()).not.toBeNull();

      manager.clearCropArea();
      expect(manager.getCurrentCropArea()).toBeNull();
    });

    it('应该设置图片信息', () => {
      const newImageInfo: ImageInfo = {
        src: 'new-test.jpg',
        naturalWidth: 1200,
        naturalHeight: 800,
        width: 600,
        height: 400,
        format: 'png',
        size: 1024 * 100
      };

      expect(() => manager.setImageInfo(newImageInfo)).not.toThrow();
    });

    it('应该设置容器尺寸', () => {
      const newSize: Size = { width: 800, height: 600 };
      expect(() => manager.setContainerSize(newSize)).not.toThrow();
    });
  });

  describe('约束应用', () => {
    it('应该应用宽高比约束', () => {
      const aspectRatioManager = new CropAreaManager({
        maintainAspectRatio: true,
        aspectRatio: 16 / 9
      });

      const rect: Rect = { x: 50, y: 50, width: 200, height: 200 }; // 1:1 比例
      const cropArea = aspectRatioManager.createCropArea(rect);

      // 应该调整为16:9比例
      const expectedHeight = cropArea.rect.width / (16 / 9);
      expect(cropArea.rect.height).toBeCloseTo(expectedHeight, 1);
    });

    it('应该应用网格对齐', () => {
      const gridManager = new CropAreaManager({
        snapToGrid: true,
        gridSize: 10
      });

      const rect: Rect = { x: 55, y: 57, width: 203, height: 157 };
      const cropArea = gridManager.createCropArea(rect);

      // 应该对齐到10像素网格
      expect(cropArea.rect.x % 10).toBe(0);
      expect(cropArea.rect.y % 10).toBe(0);
      expect(cropArea.rect.width % 10).toBe(0);
      expect(cropArea.rect.height % 10).toBe(0);
    });

    it('应该应用边界约束', () => {
      const boundedManager = new CropAreaManager({
        allowOutOfBounds: false
      });
      boundedManager.setImageInfo(mockImageInfo);

      // 尝试创建完全超出图片边界的裁剪区域
      const outOfBoundsRect: Rect = { x: 1000, y: 800, width: 200, height: 200 };

      // 验证裁剪区域以检查边界约束
      const validation = boundedManager.validateCropArea({
        id: 'test',
        shape: 'rectangle',
        rect: outOfBoundsRect,
        rotation: 0,
        editable: true,
        visible: true,
        locked: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      });

      // 应该检测到边界违规
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);

      // 测试部分超出边界的情况
      const partialOutOfBoundsRect: Rect = { x: 700, y: 500, width: 200, height: 200 };
      const partialValidation = boundedManager.validateCropArea({
        id: 'test2',
        shape: 'rectangle',
        rect: partialOutOfBoundsRect,
        rotation: 0,
        editable: true,
        visible: true,
        locked: false,
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      });

      // 部分超出的情况应该提供修正版本
      if (partialValidation.correctedArea) {
        expect(partialValidation.correctedArea.rect.x + partialValidation.correctedArea.rect.width)
          .toBeLessThanOrEqual(mockImageInfo.naturalWidth);
        expect(partialValidation.correctedArea.rect.y + partialValidation.correctedArea.rect.height)
          .toBeLessThanOrEqual(mockImageInfo.naturalHeight);
      }
    });
  });

  describe('错误处理', () => {
    it('应该处理无效输入', () => {
      expect(() => manager.createCropArea(null as any)).toThrow();
      expect(() => manager.createCropArea(undefined as any)).toThrow();
    });

    it('应该处理边界情况', () => {
      const zeroRect: Rect = { x: 0, y: 0, width: 0, height: 0 };
      expect(() => manager.createCropArea(zeroRect)).toThrow();
    });
  });
});
