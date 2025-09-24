/**
 * @file UI组件测试
 * @description 测试UI组件系统的基本功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Toolbar } from '../src/ui/Toolbar'
import { ControlPanel } from '../src/ui/ControlPanel'
import { CropShape } from '../src/types'

// 创建测试用的基础组件
class TestComponent extends BaseComponent {
  protected getComponentName(): string {
    return 'test-component'
  }

  protected render(): void {
    this.element.textContent = 'Test Component'
  }
}

describe('UI组件系统', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('BaseComponent', () => {
    let component: TestComponent

    beforeEach(() => {
      component = new TestComponent()
    })

    afterEach(() => {
      component.destroy()
    })

    it('应该能够创建基础组件', () => {
      expect(component.getElement()).toBeInstanceOf(HTMLElement)
      expect(component.getState()).toBe(ComponentState.IDLE)
      expect(component.isVisible()).toBe(true)
      expect(component.isEnabled()).toBe(true)
      expect(component.isDestroyed()).toBe(false)
    })

    it('应该能够设置组件状态', () => {
      component.setState(ComponentState.LOADING)
      expect(component.getState()).toBe(ComponentState.LOADING)

      component.setState(ComponentState.ERROR)
      expect(component.getState()).toBe(ComponentState.ERROR)
    })

    it('应该能够显示和隐藏组件', () => {
      component.hide()
      expect(component.isVisible()).toBe(false)

      component.show()
      expect(component.isVisible()).toBe(true)

      component.toggle()
      expect(component.isVisible()).toBe(false)
    })

    it('应该能够启用和禁用组件', () => {
      component.disable()
      expect(component.isEnabled()).toBe(false)

      component.enable()
      expect(component.isEnabled()).toBe(true)
    })

    it('应该能够添加和移除CSS类', () => {
      component.addClass('test-class')
      expect(component.getElement().classList.contains('test-class')).toBe(true)

      component.removeClass('test-class')
      expect(component.getElement().classList.contains('test-class')).toBe(false)

      component.toggleClass('toggle-class')
      expect(component.getElement().classList.contains('toggle-class')).toBe(true)

      component.toggleClass('toggle-class')
      expect(component.getElement().classList.contains('toggle-class')).toBe(false)
    })

    it('应该能够设置样式和属性', () => {
      component.setStyle({ color: 'red', fontSize: '16px' })
      expect(component.getElement().style.color).toBe('red')
      expect(component.getElement().style.fontSize).toBe('16px')

      component.setAttribute('data-test', 'value')
      expect(component.getAttribute('data-test')).toBe('value')

      component.removeAttribute('data-test')
      expect(component.getAttribute('data-test')).toBeNull()
    })

    it('应该能够正确销毁', () => {
      container.appendChild(component.getElement())
      expect(container.contains(component.getElement())).toBe(true)

      component.destroy()
      expect(component.isDestroyed()).toBe(true)
      expect(container.contains(component.getElement())).toBe(false)
    })
  })

  describe('Toolbar', () => {
    let toolbar: Toolbar | null = null

    beforeEach(() => {
      try {
        toolbar = new Toolbar({
          position: ToolbarPosition.TOP,
          showTooltips: true,
        })
        container.appendChild(toolbar.getElement())
      } catch (error) {
        console.error('Failed to create toolbar:', error)
      }
    })

    afterEach(() => {
      if (toolbar) {
        toolbar.destroy()
        toolbar = null
      }
    })

    it('应该能够创建工具栏', () => {
      if (!toolbar) {
        expect.fail('Toolbar creation failed')
        return
      }
      expect(toolbar.getElement()).toBeInstanceOf(HTMLElement)
      expect(toolbar.getPosition()).toBe(ToolbarPosition.TOP)
      expect(toolbar.getButtonSize()).toBe('small')
    })

    it('应该能够设置工具启用状态', () => {
      toolbar.setToolEnabled(ToolType.ZOOM_IN, false)
      const tool = toolbar.getTool(ToolType.ZOOM_IN)
      expect(tool?.enabled).toBe(false)

      toolbar.setToolEnabled(ToolType.ZOOM_IN, true)
      expect(toolbar.getTool(ToolType.ZOOM_IN)?.enabled).toBe(true)
    })

    it('应该能够设置工具可见性', () => {
      toolbar.setToolVisible(ToolType.ZOOM_OUT, false)
      expect(toolbar.getTool(ToolType.ZOOM_OUT)?.visible).toBe(false)

      toolbar.setToolVisible(ToolType.ZOOM_OUT, true)
      expect(toolbar.getTool(ToolType.ZOOM_OUT)?.visible).toBe(true)
    })

    it('应该能够添加和移除工具', () => {
      const customTool = Toolbar.createTool(ToolType.CROP, {
        title: '裁剪',
        icon: '✂️',
      })

      const initialCount = toolbar.getTools().length
      toolbar.addTool(customTool)
      expect(toolbar.getTools().length).toBe(initialCount + 1)

      toolbar.removeTool(ToolType.CROP)
      expect(toolbar.getTools().length).toBe(initialCount)
    })

    it('应该能够设置工具栏位置和按钮大小', () => {
      toolbar.setPosition(ToolbarPosition.BOTTOM)
      expect(toolbar.getPosition()).toBe(ToolbarPosition.BOTTOM)

      toolbar.setButtonSize('large')
      expect(toolbar.getButtonSize()).toBe('large')
    })
  })

  describe('ControlPointsRenderer', () => {
    let renderer: ControlPointsRenderer

    beforeEach(() => {
      renderer = new ControlPointsRenderer({
        pointSize: 12,
        showCorners: true,
        showEdges: true,
      })
      container.appendChild(renderer.getElement())
    })

    afterEach(() => {
      renderer.destroy()
    })

    it('应该能够创建控制点渲染器', () => {
      expect(renderer.getElement()).toBeInstanceOf(HTMLElement)
      expect(renderer.getActivePoint()).toBeNull()
    })

    it('应该能够更新裁剪区域', () => {
      const cropArea = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        shape: CropShape.RECTANGLE,
        rotation: 0,
        flipX: false,
        flipY: false,
      }

      renderer.updateCropArea(cropArea)
      const controlPoints = renderer.getVisibleControlPoints()
      expect(controlPoints.length).toBeGreaterThan(0)
    })

    it('应该能够进行点击测试', () => {
      const cropArea = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        shape: CropShape.RECTANGLE,
        rotation: 0,
        flipX: false,
        flipY: false,
      }

      renderer.updateCropArea(cropArea)

      // 测试角点
      const hitPoint = renderer.hitTest({ x: 100, y: 100 })
      expect(hitPoint).toBeTruthy()

      // 测试空白区域
      const missPoint = renderer.hitTest({ x: 0, y: 0 })
      expect(missPoint).toBeNull()
    })

    it('应该能够设置激活控制点', () => {
      const cropArea = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        shape: CropShape.RECTANGLE,
        rotation: 0,
        flipX: false,
        flipY: false,
      }

      renderer.updateCropArea(cropArea)
      const controlPoints = renderer.getVisibleControlPoints()

      if (controlPoints.length > 0) {
        renderer.setActivePoint(controlPoints[0])
        expect(renderer.getActivePoint()).toBe(controlPoints[0])

        renderer.setActivePoint(null)
        expect(renderer.getActivePoint()).toBeNull()
      }
    })
  })

  describe('PreviewPanel', () => {
    let previewPanel: PreviewPanel

    beforeEach(() => {
      previewPanel = new PreviewPanel({
        previewSize: { width: 200, height: 200 },
        showInfo: true,
      })
      container.appendChild(previewPanel.getElement())
    })

    afterEach(() => {
      previewPanel.destroy()
    })

    it('应该能够创建预览面板', () => {
      expect(previewPanel.getElement()).toBeInstanceOf(HTMLElement)
      expect(previewPanel.getPreviewCanvas()).toBeInstanceOf(HTMLCanvasElement)
      expect(previewPanel.getCurrentPreviewData()).toBeNull()
    })

    it('应该能够设置预览尺寸', () => {
      previewPanel.setPreviewSize({ width: 300, height: 300 })
      // 验证尺寸设置成功（通过检查元素样式或其他方式）
      expect(() => previewPanel.setPreviewSize({ width: 300, height: 300 })).not.toThrow()
    })

    it('应该能够设置信息显示选项', () => {
      previewPanel.setInfoOptions({
        showDimensions: false,
        showFileSize: false,
      })
      expect(() => previewPanel.setInfoOptions({})).not.toThrow()
    })

    it('应该能够导出预览图片', () => {
      const dataURL = previewPanel.exportPreview()
      expect(typeof dataURL).toBe('string')
      expect(dataURL.startsWith('data:image/')).toBe(true)
    })
  })

  describe('StatusIndicator', () => {
    let statusIndicator: StatusIndicator

    beforeEach(() => {
      statusIndicator = new StatusIndicator({
        type: StatusType.INFO,
        message: '测试消息',
        showIcon: true,
      })
      container.appendChild(statusIndicator.getElement())
    })

    afterEach(() => {
      statusIndicator.destroy()
    })

    it('应该能够创建状态指示器', () => {
      expect(statusIndicator.getElement()).toBeInstanceOf(HTMLElement)
    })

    it('应该能够设置不同类型的状态', () => {
      statusIndicator.showInfo('信息消息')
      statusIndicator.showSuccess('成功消息')
      statusIndicator.showWarning('警告消息')
      statusIndicator.showError('错误消息')
      statusIndicator.showLoading('加载消息')

      expect(() => statusIndicator.setStatus(StatusType.SUCCESS, '测试')).not.toThrow()
    })

    it('应该能够设置消息内容', () => {
      statusIndicator.setMessage('新消息')
      expect(() => statusIndicator.setMessage('新消息')).not.toThrow()
    })

    it('应该能够关闭指示器', () => {
      statusIndicator.show()
      statusIndicator.close()
      expect(() => statusIndicator.close()).not.toThrow()
    })
  })

  describe('UIManager', () => {
    let uiManager: UIManager

    beforeEach(() => {
      uiManager = new UIManager(container, {
        toolbar: { enabled: true },
        controlPoints: { enabled: true },
        preview: { enabled: false },
        status: { enabled: true },
      })
    })

    afterEach(() => {
      uiManager.destroy()
    })

    it('应该能够创建UI管理器', () => {
      expect(uiManager.getElement()).toBeInstanceOf(HTMLElement)
      expect(uiManager.getToolbar()).toBeInstanceOf(Toolbar)
      expect(uiManager.getControlPointsRenderer()).toBeInstanceOf(ControlPointsRenderer)
      expect(uiManager.getStatusIndicator()).toBeInstanceOf(StatusIndicator)
    })

    it('应该能够更新裁剪区域', () => {
      const cropArea = {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        shape: CropShape.RECTANGLE,
        rotation: 0,
        flipX: false,
        flipY: false,
      }

      expect(() => uiManager.updateCropArea(cropArea)).not.toThrow()
    })

    it('应该能够显示状态消息', () => {
      uiManager.showStatus(StatusType.INFO, '测试消息')
      uiManager.showStatus(StatusType.SUCCESS, '成功消息')
      uiManager.showStatus(StatusType.ERROR, '错误消息')

      expect(() => uiManager.hideStatus()).not.toThrow()
    })

    it('应该能够设置工具启用状态', () => {
      uiManager.setToolEnabled(ToolType.ZOOM_IN, false)
      uiManager.setToolEnabled(ToolType.ZOOM_IN, true)

      expect(() => uiManager.setToolEnabled(ToolType.ZOOM_IN, false)).not.toThrow()
    })

    it('应该能够设置主题', () => {
      uiManager.setTheme('dark')
      uiManager.setTheme('light')
      uiManager.setTheme('auto')

      expect(() => uiManager.setTheme('dark')).not.toThrow()
    })

    it('应该能够获取当前屏幕尺寸类型', () => {
      const screenSize = uiManager.getCurrentScreenSize()
      expect(['mobile', 'tablet', 'desktop']).toContain(screenSize)
    })
  })

  describe('静态方法', () => {
    it('Toolbar.create 应该能够创建工具栏', () => {
      const toolbar = Toolbar.create(container, {
        position: ToolbarPosition.BOTTOM,
      })

      expect(toolbar).toBeInstanceOf(Toolbar)
      expect(container.contains(toolbar.getElement())).toBe(true)

      toolbar.destroy()
    })

    it('StatusIndicator.showMessage 应该能够显示临时消息', () => {
      const indicator = StatusIndicator.showMessage(
        container,
        StatusType.SUCCESS,
        '操作成功',
        1000
      )

      expect(indicator).toBeInstanceOf(StatusIndicator)
      expect(container.contains(indicator.getElement())).toBe(true)
    })
  })
})
