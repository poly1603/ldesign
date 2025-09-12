/**
 * 小地图插件入口
 */

export { MiniMapPlugin } from './MiniMapPlugin'
export type { MiniMapConfig, ViewportInfo } from './MiniMapPlugin'

/**
 * 创建小地图插件实例
 * @param lf LogicFlow实例
 * @param container 容器元素
 * @param config 配置选项
 * @returns 小地图插件实例
 */
export function createMiniMap(lf: any, container: HTMLElement, config?: any) {
  return new MiniMapPlugin(lf, container, config)
}
