/**
 * @file 交互系统测试
 * @description 测试交互控制系统的基本功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { EventHandler, PointerEventType } from '../src/interaction/event-handler'
import { DragController, DragState } from '../src/interaction/drag-controller'
import { ControlPointsManager, ControlPointType } from '../src/interaction/control-points-manager'
import { GestureRecognizer, GestureType } from '../src/interaction/gesture-recognizer'
import { InteractionController, InteractionMode } from '../src/interaction/interaction-controller'
import { CropShape } from '../src/types'

describe('交互系统', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '400px'
    container.style.height = '300px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('EventHandler', () => {
    let eventHandler: EventHandler

    beforeEach(() => {
      eventHandler = new EventHandler(container)
    })

    afterEach(() => {
      eventHandler.destroy()
    })

    it('应该能够添加和移除事件监听器', () => {
      const callback = vi.fn()
      
      eventHandler.on(PointerEventType.START, callback)
      expect(eventHandler.getActivePointerCount()).toBe(0)
      
      eventHandler.off(PointerEventType.START, callback)
      expect(() => eventHandler.removeAllListeners()).not.toThrow()
    })

    it('应该能够获取指针数据', () => {
      expect(eventHandler.getActivePointerCount()).toBe(0)
      expect(eventHandler.getAllPointerData()).toEqual([])
      expect(eventHandler.getPointerData(0)).toBeUndefined()
    })
  })

  describe('DragController', () => {
    let dragController: DragController

    beforeEach(() => {
      dragController = new DragController(container)
    })

    afterEach(() => {
      dragController.destroy()
    })

    it('应该能够设置拖拽回调', () => {
      const onDragStart = vi.fn()
      const onDragMove = vi.fn()
      const onDragEnd = vi.fn()

      dragController.setOnDragStart(onDragStart)
      dragController.setOnDragMove(onDragMove)
      dragController.setOnDragEnd(onDragEnd)

      expect(dragController.getState()).toBe(DragState.IDLE)
      expect(dragController.isDragging()).toBe(false)
    })

    it('应该能够启用和禁用拖拽', () => {
      dragController.enable()
      expect(dragController.getState()).toBe(DragState.IDLE)

      dragController.disable()
      expect(dragController.getState()).toBe(DragState.IDLE)
    })

    it('应该能够设置拖拽边界和阈值', () => {
      dragController.setBounds({ x: 0, y: 0, width: 400, height: 300 })
      dragController.setThreshold(5)
      
      expect(() => dragController.reset()).not.toThrow()
    })
  })

  describe('ControlPointsManager', () => {
    let controlPointsManager: ControlPointsManager

    beforeEach(() => {
      controlPointsManager = new ControlPointsManager()
    })

    it('应该能够更新控制点', () => {
      const cropArea = {
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        shape: CropShape.RECTANGLE,
        rotation: 0,
        flipX: false,
        flipY: false,
      }

      controlPointsManager.updateControlPoints(cropArea)
      const controlPoints = controlPointsManager.getControlPoints()
      
      expect(controlPoints.length).toBeGreaterThan(0)
      expect(controlPointsManager.getVisibleControlPoints().length).toBeGreaterThan(0)
    })

    it('应该能够进行点击测试', () => {
      const cropArea = {
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        shape: CropShape.RECTANGLE,
        rotation: 0,
        flipX: false,
        flipY: false,
      }

      controlPointsManager.updateControlPoints(cropArea)
      
      // 测试角点
      const hitPoint = controlPointsManager.hitTest({ x: 50, y: 50 })
      expect(hitPoint).toBeTruthy()
      
      // 测试空白区域
      const missPoint = controlPointsManager.hitTest({ x: 0, y: 0 })
      expect(missPoint).toBeNull()
    })

    it('应该能够设置激活控制点', () => {
      const cropArea = {
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        shape: CropShape.RECTANGLE,
        rotation: 0,
        flipX: false,
        flipY: false,
      }

      controlPointsManager.updateControlPoints(cropArea)
      const controlPoints = controlPointsManager.getControlPoints()
      
      if (controlPoints.length > 0) {
        controlPointsManager.setActivePoint(controlPoints[0])
        expect(controlPointsManager.getActivePoint()).toBe(controlPoints[0])
        
        controlPointsManager.setActivePoint(null)
        expect(controlPointsManager.getActivePoint()).toBeNull()
      }
    })

    it('应该能够获取光标样式', () => {
      const cursor = controlPointsManager.getCursor(ControlPointType.TOP_LEFT)
      expect(typeof cursor).toBe('string')
      expect(cursor.length).toBeGreaterThan(0)
    })

    it('应该能够计算调整后的裁剪区域', () => {
      const cropArea = {
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        shape: CropShape.RECTANGLE,
        rotation: 0,
        flipX: false,
        flipY: false,
      }

      controlPointsManager.updateControlPoints(cropArea)
      const controlPoints = controlPointsManager.getControlPoints()
      
      if (controlPoints.length > 0) {
        const resizedArea = controlPointsManager.calculateResizedCropArea(
          controlPoints[0],
          { x: 10, y: 10 },
          cropArea,
          false
        )
        
        expect(resizedArea).toHaveProperty('x')
        expect(resizedArea).toHaveProperty('y')
        expect(resizedArea).toHaveProperty('width')
        expect(resizedArea).toHaveProperty('height')
      }
    })
  })

  describe('GestureRecognizer', () => {
    let gestureRecognizer: GestureRecognizer

    beforeEach(() => {
      gestureRecognizer = new GestureRecognizer(container)
    })

    afterEach(() => {
      gestureRecognizer.destroy()
    })

    it('应该能够添加和移除手势监听器', () => {
      const callback = vi.fn()
      
      gestureRecognizer.on(GestureType.PAN, callback)
      gestureRecognizer.off(GestureType.PAN, callback)
      
      expect(gestureRecognizer.getCurrentGesture()).toBe(GestureType.NONE)
    })

    it('应该能够更新配置', () => {
      gestureRecognizer.updateOptions({
        enablePan: false,
        enablePinch: false,
      })
      
      expect(gestureRecognizer.getCurrentGesture()).toBe(GestureType.NONE)
    })
  })

  describe('InteractionController', () => {
    let interactionController: InteractionController

    beforeEach(() => {
      interactionController = new InteractionController(container)
    })

    afterEach(() => {
      interactionController.destroy()
    })

    it('应该能够添加和移除事件监听器', () => {
      const callback = vi.fn()
      
      interactionController.on('interaction-start' as any, callback)
      interactionController.off('interaction-start' as any, callback)
      
      expect(interactionController.getCurrentMode()).toBe(InteractionMode.NONE)
    })

    it('应该能够更新裁剪区域', () => {
      const cropArea = {
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        shape: CropShape.RECTANGLE,
        rotation: 0,
        flipX: false,
        flipY: false,
      }

      interactionController.updateCropArea(cropArea)
      const controlPoints = interactionController.getControlPoints()
      
      expect(controlPoints.length).toBeGreaterThan(0)
    })

    it('应该能够设置交互模式', () => {
      interactionController.setMode(InteractionMode.MOVE)
      expect(interactionController.getCurrentMode()).toBe(InteractionMode.MOVE)
      
      interactionController.setMode(InteractionMode.RESIZE)
      expect(interactionController.getCurrentMode()).toBe(InteractionMode.RESIZE)
    })

    it('应该能够启用/禁用功能', () => {
      interactionController.setFeatureEnabled('enableMove', false)
      interactionController.setFeatureEnabled('enableResize', false)
      
      expect(() => interactionController.updateOptions({
        enableMove: true,
        enableResize: true,
      })).not.toThrow()
    })
  })

  describe('圆形和椭圆形状', () => {
    let controlPointsManager: ControlPointsManager

    beforeEach(() => {
      controlPointsManager = new ControlPointsManager()
    })

    it('应该能够处理圆形裁剪区域', () => {
      const cropArea = {
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        shape: CropShape.CIRCLE,
        rotation: 0,
        flipX: false,
        flipY: false,
      }

      controlPointsManager.updateControlPoints(cropArea)
      const controlPoints = controlPointsManager.getControlPoints()
      
      expect(controlPoints.length).toBeGreaterThan(0)
    })

    it('应该能够处理椭圆形裁剪区域', () => {
      const cropArea = {
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        shape: CropShape.ELLIPSE,
        rotation: 0,
        flipX: false,
        flipY: false,
      }

      controlPointsManager.updateControlPoints(cropArea)
      const controlPoints = controlPointsManager.getControlPoints()
      
      expect(controlPoints.length).toBeGreaterThan(0)
    })
  })
})
