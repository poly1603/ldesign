/**
 * 路由工厂 - 创建不同类型的路由器
 */

import { BaseRouter, RouterConfig } from './BaseRouter';
import { OrthogonalRouter } from './OrthogonalRouter';
import { PolylineRouter } from './PolylineRouter';
import { BezierRouter } from './BezierRouter';

export type RouterType = 'orthogonal' | 'polyline' | 'bezier';

export class RouterFactory {
  private static routers: Map<string, new (config?: RouterConfig) => BaseRouter> = new Map([
    ['orthogonal', OrthogonalRouter],
    ['polyline', PolylineRouter],
    ['bezier', BezierRouter],
  ]);

  /**
   * 创建路由器
   */
  static create(type: RouterType = 'orthogonal', config?: RouterConfig): BaseRouter {
    const RouterClass = this.routers.get(type);
    if (!RouterClass) {
      throw new Error(`Unknown router type: ${type}`);
    }
    return new RouterClass(config);
  }

  /**
   * 注册自定义路由器
   */
  static register(
    type: string,
    RouterClass: new (config?: RouterConfig) => BaseRouter
  ): void {
    this.routers.set(type, RouterClass);
  }

  /**
   * 获取所有可用的路由器类型
   */
  static getAvailableTypes(): string[] {
    return Array.from(this.routers.keys());
  }

  /**
   * 是否已注册某个类型
   */
  static has(type: string): boolean {
    return this.routers.has(type);
  }
}


