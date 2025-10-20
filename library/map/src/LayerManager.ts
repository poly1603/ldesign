/**
 * LayerManager - 图层管理器
 * 提供图层的增删改查、排序、分组等高级功能
 */

import type { DeckGLLayer } from './types';
import { Logger } from './Logger';

export interface LayerInfo {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  group?: string;
  metadata?: Record<string, any>;
  layer: DeckGLLayer;
}

export interface LayerGroup {
  id: string;
  name: string;
  visible: boolean;
  expanded: boolean;
  layers: string[]; // layer IDs
}

export class LayerManager {
  private layers: Map<string, LayerInfo> = new Map();
  private groups: Map<string, LayerGroup> = new Map();
  private logger = Logger.getInstance();
  private onLayersChange?: () => void;

  constructor(onLayersChange?: () => void) {
    this.onLayersChange = onLayersChange;
  }

  /**
   * 添加图层
   */
  addLayer(layer: DeckGLLayer, options: Partial<LayerInfo> = {}): void {
    const id = layer.id || `layer-${Date.now()}`;
    
    const layerInfo: LayerInfo = {
      id,
      name: options.name || id,
      type: options.type || layer.constructor.name,
      visible: options.visible !== undefined ? options.visible : true,
      opacity: options.opacity !== undefined ? options.opacity : 1,
      zIndex: options.zIndex !== undefined ? options.zIndex : this.layers.size,
      group: options.group,
      metadata: options.metadata || {},
      layer
    };

    this.layers.set(id, layerInfo);
    
    // 添加到分组
    if (layerInfo.group) {
      const group = this.groups.get(layerInfo.group);
      if (group) {
        group.layers.push(id);
      }
    }

    this.logger.debug(`Layer added: ${id}`);
    this.notifyChange();
  }

  /**
   * 移除图层
   */
  removeLayer(layerId: string): boolean {
    const layerInfo = this.layers.get(layerId);
    if (!layerInfo) return false;

    // 从分组中移除
    if (layerInfo.group) {
      const group = this.groups.get(layerInfo.group);
      if (group) {
        group.layers = group.layers.filter(id => id !== layerId);
      }
    }

    this.layers.delete(layerId);
    this.logger.debug(`Layer removed: ${layerId}`);
    this.notifyChange();
    return true;
  }

  /**
   * 获取图层
   */
  getLayer(layerId: string): LayerInfo | undefined {
    return this.layers.get(layerId);
  }

  /**
   * 获取所有图层
   */
  getAllLayers(): LayerInfo[] {
    return Array.from(this.layers.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  /**
   * 获取可见图层
   */
  getVisibleLayers(): DeckGLLayer[] {
    return this.getAllLayers()
      .filter(info => info.visible)
      .map(info => {
        // 应用opacity
        const layer = info.layer;
        if (info.opacity < 1) {
          return layer.clone({ opacity: info.opacity });
        }
        return layer;
      });
  }

  /**
   * 设置图层可见性
   */
  setLayerVisibility(layerId: string, visible: boolean): void {
    const layerInfo = this.layers.get(layerId);
    if (layerInfo) {
      layerInfo.visible = visible;
      this.logger.debug(`Layer visibility changed: ${layerId} = ${visible}`);
      this.notifyChange();
    }
  }

  /**
   * 切换图层可见性
   */
  toggleLayerVisibility(layerId: string): void {
    const layerInfo = this.layers.get(layerId);
    if (layerInfo) {
      layerInfo.visible = !layerInfo.visible;
      this.notifyChange();
    }
  }

  /**
   * 设置图层透明度
   */
  setLayerOpacity(layerId: string, opacity: number): void {
    const layerInfo = this.layers.get(layerId);
    if (layerInfo) {
      layerInfo.opacity = Math.max(0, Math.min(1, opacity));
      this.notifyChange();
    }
  }

  /**
   * 设置图层层级
   */
  setLayerZIndex(layerId: string, zIndex: number): void {
    const layerInfo = this.layers.get(layerId);
    if (layerInfo) {
      layerInfo.zIndex = zIndex;
      this.notifyChange();
    }
  }

  /**
   * 将图层移到顶部
   */
  bringLayerToFront(layerId: string): void {
    const layerInfo = this.layers.get(layerId);
    if (!layerInfo) return;

    const maxZIndex = Math.max(...Array.from(this.layers.values()).map(l => l.zIndex), 0);
    layerInfo.zIndex = maxZIndex + 1;
    this.notifyChange();
  }

  /**
   * 将图层移到底部
   */
  sendLayerToBack(layerId: string): void {
    const layerInfo = this.layers.get(layerId);
    if (!layerInfo) return;

    const minZIndex = Math.min(...Array.from(this.layers.values()).map(l => l.zIndex), 0);
    layerInfo.zIndex = minZIndex - 1;
    this.notifyChange();
  }

  /**
   * 创建分组
   */
  createGroup(id: string, name: string): void {
    if (this.groups.has(id)) {
      this.logger.warn(`Group already exists: ${id}`);
      return;
    }

    const group: LayerGroup = {
      id,
      name,
      visible: true,
      expanded: true,
      layers: []
    };

    this.groups.set(id, group);
    this.logger.debug(`Group created: ${id}`);
  }

  /**
   * 移除分组
   */
  removeGroup(groupId: string): void {
    const group = this.groups.get(groupId);
    if (!group) return;

    // 移除分组中的所有图层
    group.layers.forEach(layerId => {
      const layerInfo = this.layers.get(layerId);
      if (layerInfo) {
        layerInfo.group = undefined;
      }
    });

    this.groups.delete(groupId);
    this.logger.debug(`Group removed: ${groupId}`);
    this.notifyChange();
  }

  /**
   * 将图层添加到分组
   */
  addLayerToGroup(layerId: string, groupId: string): void {
    const layerInfo = this.layers.get(layerId);
    const group = this.groups.get(groupId);

    if (!layerInfo || !group) return;

    // 从旧分组移除
    if (layerInfo.group) {
      const oldGroup = this.groups.get(layerInfo.group);
      if (oldGroup) {
        oldGroup.layers = oldGroup.layers.filter(id => id !== layerId);
      }
    }

    // 添加到新分组
    layerInfo.group = groupId;
    if (!group.layers.includes(layerId)) {
      group.layers.push(layerId);
    }

    this.notifyChange();
  }

  /**
   * 设置分组可见性
   */
  setGroupVisibility(groupId: string, visible: boolean): void {
    const group = this.groups.get(groupId);
    if (!group) return;

    group.visible = visible;
    group.layers.forEach(layerId => {
      const layerInfo = this.layers.get(layerId);
      if (layerInfo) {
        layerInfo.visible = visible;
      }
    });

    this.notifyChange();
  }

  /**
   * 获取所有分组
   */
  getAllGroups(): LayerGroup[] {
    return Array.from(this.groups.values());
  }

  /**
   * 获取分组
   */
  getGroup(groupId: string): LayerGroup | undefined {
    return this.groups.get(groupId);
  }

  /**
   * 获取分组中的图层
   */
  getLayersInGroup(groupId: string): LayerInfo[] {
    const group = this.groups.get(groupId);
    if (!group) return [];

    return group.layers
      .map(id => this.layers.get(id))
      .filter(Boolean) as LayerInfo[];
  }

  /**
   * 清空所有图层
   */
  clearLayers(): void {
    this.layers.clear();
    this.groups.forEach(group => group.layers = []);
    this.logger.debug('All layers cleared');
    this.notifyChange();
  }

  /**
   * 清空所有分组
   */
  clearGroups(): void {
    this.groups.clear();
    this.layers.forEach(layerInfo => layerInfo.group = undefined);
    this.logger.debug('All groups cleared');
    this.notifyChange();
  }

  /**
   * 根据条件筛选图层
   */
  filterLayers(predicate: (layerInfo: LayerInfo) => boolean): LayerInfo[] {
    return this.getAllLayers().filter(predicate);
  }

  /**
   * 根据类型获取图层
   */
  getLayersByType(type: string): LayerInfo[] {
    return this.filterLayers(info => info.type === type);
  }

  /**
   * 根据分组获取图层
   */
  getLayersByGroup(groupId: string): LayerInfo[] {
    return this.filterLayers(info => info.group === groupId);
  }

  /**
   * 获取图层数量
   */
  getLayerCount(): number {
    return this.layers.size;
  }

  /**
   * 获取可见图层数量
   */
  getVisibleLayerCount(): number {
    return Array.from(this.layers.values()).filter(info => info.visible).length;
  }

  /**
   * 更新图层元数据
   */
  updateLayerMetadata(layerId: string, metadata: Record<string, any>): void {
    const layerInfo = this.layers.get(layerId);
    if (layerInfo) {
      layerInfo.metadata = { ...layerInfo.metadata, ...metadata };
      this.notifyChange();
    }
  }

  /**
   * 获取图层元数据
   */
  getLayerMetadata(layerId: string): Record<string, any> | undefined {
    return this.layers.get(layerId)?.metadata;
  }

  /**
   * 批量更新图层
   */
  batchUpdate(updates: Array<{ layerId: string; updates: Partial<LayerInfo> }>): void {
    updates.forEach(({ layerId, updates }) => {
      const layerInfo = this.layers.get(layerId);
      if (layerInfo) {
        Object.assign(layerInfo, updates);
      }
    });
    this.notifyChange();
  }

  /**
   * 导出配置
   */
  exportConfig(): {
    layers: Array<Omit<LayerInfo, 'layer'>>;
    groups: LayerGroup[];
  } {
    const layers = this.getAllLayers().map(({ layer, ...info }) => info);
    const groups = this.getAllGroups();
    return { layers, groups };
  }

  /**
   * 导入配置
   */
  importConfig(config: {
    layers: Array<Omit<LayerInfo, 'layer'>>;
    groups: LayerGroup[];
  }): void {
    // 清空现有配置
    this.clearLayers();
    this.clearGroups();

    // 导入分组
    config.groups.forEach(group => {
      this.groups.set(group.id, { ...group });
    });

    this.notifyChange();
  }

  /**
   * 通知变化
   */
  private notifyChange(): void {
    this.onLayersChange?.();
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearLayers();
    this.clearGroups();
  }
}


