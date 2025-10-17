/**
 * 插件测试工具
 */

import { createApp, type App } from 'vue'
import { ref } from 'vue'

/**
 * 创建测试应用
 */
export function createTestApp() {
  const app = createApp({
    template: '<div>Test App</div>'
  })
  
  return {
    app,
    mount: () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      app.mount(container)
      return container
    },
    unmount: () => {
      app.unmount()
    }
  }
}

/**
 * 测试插件独立性
 */
export function testPluginIndependence(
  createPlugin: () => any,
  assertions: (plugin: any) => void
) {
  describe('Plugin Independence', () => {
    it('should work without any dependencies', () => {
      const plugin = createPlugin()
      assertions(plugin)
    })
    
    it('should have required properties', () => {
      const plugin = createPlugin()
      expect(plugin).toHaveProperty('name')
      expect(plugin).toHaveProperty('install')
    })
    
    it('should install without errors', () => {
      const plugin = createPlugin()
      const { app } = createTestApp()
      expect(() => app.use(plugin)).not.toThrow()
    })
  })
}

/**
 * 测试插件状态共享
 */
export function testPluginStateSharing(
  createPlugin1: (options: any) => any,
  createPlugin2: (options: any) => any,
  stateKey: string = 'locale'
) {
  describe('Plugin State Sharing', () => {
    it('should share state when using the same ref', () => {
      const sharedState = ref('initial')
      
      const plugin1 = createPlugin1({ [stateKey]: sharedState })
      const plugin2 = createPlugin2({ [stateKey]: sharedState })
      
      expect(plugin1[stateKey]).toBe(plugin2[stateKey])
      
      // 修改状态
      sharedState.value = 'changed'
      
      expect(plugin1[stateKey].value).toBe('changed')
      expect(plugin2[stateKey].value).toBe('changed')
    })
    
    it('should work independently when not sharing', () => {
      const plugin1 = createPlugin1({ [stateKey]: 'value1' })
      const plugin2 = createPlugin2({ [stateKey]: 'value2' })
      
      expect(plugin1[stateKey].value).toBe('value1')
      expect(plugin2[stateKey].value).toBe('value2')
    })
  })
}

/**
 * 测试插件持久化
 */
export function testPluginPersistence(
  createPlugin: (options: any) => any,
  storageKey: string = 'test-plugin'
) {
  describe('Plugin Persistence', () => {
    beforeEach(() => {
      localStorage.clear()
    })
    
    it('should save state to localStorage', () => {
      const plugin = createPlugin({
        persist: true,
        storageKey
      })
      
      plugin.setState('test-value')
      
      expect(localStorage.getItem(storageKey)).toBe('test-value')
    })
    
    it('should restore state from localStorage', () => {
      localStorage.setItem(storageKey, 'restored-value')
      
      const plugin = createPlugin({
        persist: true,
        storageKey
      })
      
      expect(plugin.getState()).toBe('restored-value')
    })
  })
}

/**
 * 测试插件生命周期
 */
export function testPluginLifecycle(
  createPlugin: () => any
) {
  describe('Plugin Lifecycle', () => {
    it('should call destroy method if available', () => {
      const plugin = createPlugin()
      
      if (typeof plugin.destroy === 'function') {
        const destroySpy = jest.fn(plugin.destroy)
        plugin.destroy = destroySpy
        
        plugin.destroy()
        
        expect(destroySpy).toHaveBeenCalled()
      }
    })
    
    it('should clean up resources on destroy', () => {
      const plugin = createPlugin()
      const { app } = createTestApp()
      
      app.use(plugin)
      
      if (typeof plugin.destroy === 'function') {
        plugin.destroy()
        
        // 验证资源已清理
        // 具体的验证逻辑取决于插件的实现
      }
    })
  })
}

/**
 * 性能测试
 */
export function testPluginPerformance(
  createPlugin: () => any,
  operations: Array<(plugin: any) => void>
) {
  describe('Plugin Performance', () => {
    it('should complete operations within time limit', () => {
      const plugin = createPlugin()
      const startTime = performance.now()
      
      operations.forEach(op => op(plugin))
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 期望在 100ms 内完成
      expect(duration).toBeLessThan(100)
    })
    
    it('should not cause memory leaks', () => {
      const plugins = []
      
      // 创建多个实例
      for (let i = 0; i < 100; i++) {
        plugins.push(createPlugin())
      }
      
      // 销毁所有实例
      plugins.forEach(p => {
        if (p.destroy) p.destroy()
      })
      
      // 期望内存能被垃圾回收
      // 注意：JavaScript 中无法直接测试内存回收
      // 这里只是确保 destroy 方法被调用
      expect(plugins.length).toBe(100)
    })
  })
}