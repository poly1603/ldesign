import type { Engine, StateAdapter } from '@ldesign/engine'
import type { Pinia } from 'pinia'

/**
 * 创建状态管理适配器
 */
export function createStoreAdapter(pinia: Pinia): StateAdapter {
  return {
    install: (engine: Engine) => {
      // 将Pinia实例注册到引擎状态中
      engine.state.set('pinia', pinia)
      
      // 如果引擎有Vue应用实例，安装Pinia
      if (engine.app) {
        engine.app.use(pinia)
      }
      
      engine.logger.info('Store adapter installed')
    },
    
    // 获取状态
    getState: (key: string) => {
      // 这里可以实现从Pinia store获取状态的逻辑
      const globalState = engine.state.get('global')
      return globalState?.[key]
    },
    
    // 设置状态
    setState: (key: string, value: any) => {
      // 这里可以实现设置Pinia store状态的逻辑
      const globalState = engine.state.get('global')
      if (globalState && typeof globalState[key] !== 'undefined') {
        globalState[key] = value
      }
    },
    
    // 订阅状态变化
    subscribe: (key: string, callback: (value: any) => void) => {
      // 这里可以实现订阅Pinia store状态变化的逻辑
      const globalState = engine.state.get('global')
      if (globalState) {
        // 使用Vue的watch API监听状态变化
        const { watch } = require('vue')
        return watch(
          () => globalState[key],
          callback,
          { deep: true }
        )
      }
      return () => {} // 返回取消订阅函数
    },
    
    // 取消订阅
    unsubscribe: (unsubscribeFn: () => void) => {
      unsubscribeFn()
    }
  }
}
