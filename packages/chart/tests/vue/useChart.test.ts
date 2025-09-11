/**
 * useChart Composable 测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useChart } from '../../src/vue/composables/useChart'

// Mock Chart 类
vi.mock('../../src/core/Chart', () => ({
  Chart: vi.fn().mockImplementation(() => ({
    updateData: vi.fn(),
    updateConfig: vi.fn(),
    setTheme: vi.fn(),
    resize: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    clear: vi.fn(),
    dispose: vi.fn(),
    exportImage: vi.fn().mockResolvedValue(new Blob()),
    exportPDF: vi.fn().mockResolvedValue(new Blob()),
    exportData: vi.fn().mockResolvedValue(new Blob()),
    on: vi.fn(),
    off: vi.fn()
  }))
}))

describe('useChart', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.style.width = '400px'
    container.style.height = '300px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    // 清理测试容器
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('基础功能', () => {
    it('应该正确初始化', () => {
      const { chartRef, chartInstance, loading, error, ready } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      expect(chartRef.value).toBeNull()
      expect(chartInstance.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(ready.value).toBe(false)
    })

    it('应该在设置容器引用后初始化图表', async () => {
      const { chartRef, chartInstance, ready } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      // 设置容器引用
      chartRef.value = container

      // 等待下一个 tick
      await nextTick()

      expect(chartInstance.value).toBeTruthy()
      expect(ready.value).toBe(true)
    })

    it('应该正确处理加载状态', async () => {
      const { chartRef, loading, showLoading, hideLoading } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      chartRef.value = container
      await nextTick()

      // 显示加载状态
      showLoading('加载中...')
      expect(loading.value).toBe(true)

      // 隐藏加载状态
      hideLoading()
      expect(loading.value).toBe(false)
    })
  })

  describe('数据更新', () => {
    it('应该能够更新数据', async () => {
      const { chartRef, chartInstance, updateData } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      chartRef.value = container
      await nextTick()

      const newData = [{ name: 'B', value: 200 }]
      updateData(newData)

      expect(chartInstance.value?.updateData).toHaveBeenCalledWith(newData)
    })

    it('应该能够更新配置', async () => {
      const { chartRef, chartInstance, updateConfig } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      chartRef.value = container
      await nextTick()

      const newConfig = { title: '新标题' }
      updateConfig(newConfig)

      expect(chartInstance.value?.updateConfig).toHaveBeenCalledWith(newConfig)
    })

    it('应该能够设置主题', async () => {
      const { chartRef, chartInstance, setTheme } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      chartRef.value = container
      await nextTick()

      setTheme('dark')

      expect(chartInstance.value?.setTheme).toHaveBeenCalledWith('dark')
    })
  })

  describe('图表操作', () => {
    it('应该能够调整大小', async () => {
      const { chartRef, chartInstance, resize } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      chartRef.value = container
      await nextTick()

      resize(800, 600)

      expect(chartInstance.value?.resize).toHaveBeenCalledWith({ width: 800, height: 600 })
    })

    it('应该能够清空图表', async () => {
      const { chartRef, chartInstance, clear } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      chartRef.value = container
      await nextTick()

      clear()

      expect(chartInstance.value?.clear).toHaveBeenCalled()
    })

    it('应该能够销毁图表', async () => {
      const { chartRef, chartInstance, dispose } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      chartRef.value = container
      await nextTick()

      dispose()

      expect(chartInstance.value?.dispose).toHaveBeenCalled()
    })
  })

  describe('导出功能', () => {
    it('应该能够导出图片', async () => {
      const { chartRef, exportImage } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      chartRef.value = container
      await nextTick()

      const blob = await exportImage('png')

      expect(blob).toBeInstanceOf(Blob)
    })

    it('应该能够导出 PDF', async () => {
      const { chartRef, exportPDF } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      chartRef.value = container
      await nextTick()

      const blob = await exportPDF()

      expect(blob).toBeInstanceOf(Blob)
    })

    it('应该能够导出数据', async () => {
      const { chartRef, exportData } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      chartRef.value = container
      await nextTick()

      const blob = await exportData('excel')

      expect(blob).toBeInstanceOf(Blob)
    })
  })

  describe('事件处理', () => {
    it('应该能够注册和移除事件监听器', async () => {
      const { chartRef, chartInstance, on, off } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      chartRef.value = container
      await nextTick()

      const handler = vi.fn()

      // 注册事件
      on('click', handler)
      expect(chartInstance.value?.on).toHaveBeenCalledWith('click', handler)

      // 移除事件
      off('click', handler)
      expect(chartInstance.value?.off).toHaveBeenCalledWith('click', handler)
    })
  })

  describe('错误处理', () => {
    it('应该处理初始化错误', async () => {
      const { chartRef, error } = useChart({
        type: 'line',
        data: [{ name: 'A', value: 100 }]
      })

      // 不设置容器引用，应该产生错误
      chartRef.value = null

      await nextTick()

      // 这里应该有错误处理逻辑
      // 具体的错误处理取决于实际实现
    })
  })

  describe('响应式特性', () => {
    it('应该响应数据变化', async () => {
      const data = ref([{ name: 'A', value: 100 }])
      
      const { chartRef, chartInstance } = useChart({
        type: 'line',
        data: data.value
      })

      chartRef.value = container
      await nextTick()

      // 修改数据
      data.value = [{ name: 'B', value: 200 }]
      await nextTick()

      // 应该调用 updateData
      expect(chartInstance.value?.updateData).toHaveBeenCalled()
    })
  })
})
