import type { App } from 'vue'
import type { Engine, RouterAdapter } from '@ldesign/engine'
import type { Router, RouteRecordRaw } from '@ldesign/router'
import { createRouter, createWebHistory } from '@ldesign/router'

/**
 * 简化的 LDesign Router 适配器
 * 只保留基本的路由功能，无复杂特性
 */
export class LDesignRouterAdapter implements RouterAdapter {
  private router: Router
  private engine?: Engine
  private installed = false

  constructor(routes: RouteRecordRaw[] = []) {
    // 创建路由器实例
    this.router = createRouter({
      history: createWebHistory(),
      routes,
    })
  }

  /**
   * 安装到 Engine
   */
  install(engine: Engine): void {
    this.engine = engine

    // 监听 Engine 的 Vue 应用创建事件
    engine.events.on('app:created', (app: App) => {
      this.installToVueApp(app)
    })

    // 如果 Engine 已经有 Vue 应用，立即安装
    const app = engine.getApp()
    if (app && !this.installed) {
      this.installToVueApp(app)
    }

    engine.logger.info('简化的 Router 适配器已安装')
  }

  /**
   * 安装到 Vue 应用
   */
  private installToVueApp(app: App): void {
    if (this.installed) return

    app.use(this.router)
    this.installed = true

    this.engine?.logger.info('Router 已安装到 Vue 应用')
  }

  // RouterAdapter 接口实现 - 只保留基本方法
  async push(path: string): Promise<void> {
    await this.router.push(path)
  }

  async replace(path: string): Promise<void> {
    await this.router.replace(path)
  }

  back(): void {
    this.router.back()
  }

  forward(): void {
    this.router.forward()
  }

  go(delta: number): void {
    this.router.go(delta)
  }

  getCurrentRoute(): any {
    return this.router.currentRoute.value
  }

  // 获取路由器实例
  getRouter(): Router {
    return this.router
  }
}

/**
 * 创建简化的 LDesign Router 适配器
 */
export function createLDesignRouterAdapter(
  routes: RouteRecordRaw[] = []
): LDesignRouterAdapter {
  return new LDesignRouterAdapter(routes)
}
