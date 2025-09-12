/**
 * 控件管理器
 * 负责管理地图的所有控件（缩放、全屏、比例尺等）
 */

import { Map as OLMap } from 'ol';
import { 
  Zoom, 
  Attribution, 
  ScaleLine, 
  FullScreen, 
  MousePosition, 
  OverviewMap,
  Rotate,
  ZoomSlider,
  ZoomToExtent
} from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import { defaults as defaultControls } from 'ol/control';

import type { 
  ControlConfig, 
  ControlState, 
  ControlOperationOptions, 
  IControlManager,
  ControlType,
  ZoomControlConfig,
  ScaleLineControlConfig,
  MousePositionControlConfig,
  OverviewMapControlConfig,
  FullScreenControlConfig
} from '../types';

/**
 * 控件管理器实现类
 * 提供完整的地图控件管理功能
 */
export class ControlManager implements IControlManager {
  private olMap: OLMap;
  private controls: Map<string, { config: ControlConfig; olControl: any; state: ControlState }> = new Map();

  /**
   * 构造函数
   * @param olMap OpenLayers 地图实例
   */
  constructor(olMap: OLMap) {
    this.olMap = olMap;
    this.initializeDefaultControls();
  }

  /**
   * 初始化默认控件
   * @private
   */
  private initializeDefaultControls(): void {
    // 移除所有默认控件，我们将手动管理
    const controls = this.olMap.getControls();
    controls.clear();
  }

  /**
   * 添加控件
   * @param config 控件配置
   * @returns 控件 ID
   */
  addControl(config: ControlConfig): string {
    try {
      // 检查控件是否已存在
      if (this.controls.has(config.id)) {
        throw new Error(`控件 ${config.id} 已存在`);
      }

      // 创建 OpenLayers 控件
      const olControl = this.createOLControl(config);
      
      // 添加到地图
      this.olMap.addControl(olControl);

      // 创建控件状态
      const state: ControlState = {
        id: config.id,
        visible: config.visible !== false,
        enabled: config.enabled !== false,
        position: config.position || 'top-left'
      };

      // 保存控件信息
      this.controls.set(config.id, {
        config,
        olControl,
        state
      });

      return config.id;
    } catch (error) {
      console.error(`[ControlManager] 添加控件失败:`, error);
      throw error;
    }
  }

  /**
   * 移除控件
   * @param id 控件 ID
   * @returns 是否移除成功
   */
  removeControl(id: string): boolean {
    const controlInfo = this.controls.get(id);
    if (!controlInfo) {
      return false;
    }

    try {
      // 从地图中移除
      this.olMap.removeControl(controlInfo.olControl);
      
      // 从管理器中移除
      this.controls.delete(id);
      
      return true;
    } catch (error) {
      console.error(`[ControlManager] 移除控件失败:`, error);
      return false;
    }
  }

  /**
   * 获取控件配置
   * @param id 控件 ID
   * @returns 控件配置或 null
   */
  getControl(id: string): ControlConfig | null {
    const controlInfo = this.controls.get(id);
    return controlInfo ? { ...controlInfo.config } : null;
  }

  /**
   * 获取所有控件配置
   * @returns 控件配置数组
   */
  getAllControls(): ControlConfig[] {
    return Array.from(this.controls.values()).map(info => ({ ...info.config }));
  }

  /**
   * 显示控件
   * @param id 控件 ID
   * @param options 操作选项
   */
  showControl(id: string, options?: ControlOperationOptions): void {
    const controlInfo = this.controls.get(id);
    if (!controlInfo) {
      return;
    }

    const element = controlInfo.olControl.element;
    if (element) {
      element.style.display = '';
      controlInfo.state.visible = true;
      controlInfo.config.visible = true;
    }
  }

  /**
   * 隐藏控件
   * @param id 控件 ID
   * @param options 操作选项
   */
  hideControl(id: string, options?: ControlOperationOptions): void {
    const controlInfo = this.controls.get(id);
    if (!controlInfo) {
      return;
    }

    const element = controlInfo.olControl.element;
    if (element) {
      element.style.display = 'none';
      controlInfo.state.visible = false;
      controlInfo.config.visible = false;
    }
  }

  /**
   * 启用控件
   * @param id 控件 ID
   * @param options 操作选项
   */
  enableControl(id: string, options?: ControlOperationOptions): void {
    const controlInfo = this.controls.get(id);
    if (!controlInfo) {
      return;
    }

    controlInfo.olControl.setMap(this.olMap);
    controlInfo.state.enabled = true;
    controlInfo.config.enabled = true;
  }

  /**
   * 禁用控件
   * @param id 控件 ID
   * @param options 操作选项
   */
  disableControl(id: string, options?: ControlOperationOptions): void {
    const controlInfo = this.controls.get(id);
    if (!controlInfo) {
      return;
    }

    controlInfo.olControl.setMap(null);
    controlInfo.state.enabled = false;
    controlInfo.config.enabled = false;
  }

  /**
   * 获取控件状态
   * @param id 控件 ID
   * @returns 控件状态或 null
   */
  getControlState(id: string): ControlState | null {
    const controlInfo = this.controls.get(id);
    return controlInfo ? { ...controlInfo.state } : null;
  }

  /**
   * 更新控件配置
   * @param id 控件 ID
   * @param config 部分控件配置
   * @returns 是否更新成功
   */
  updateControl(id: string, config: Partial<ControlConfig>): boolean {
    const controlInfo = this.controls.get(id);
    if (!controlInfo) {
      return false;
    }

    try {
      // 更新配置
      Object.assign(controlInfo.config, config);
      
      // 如果需要重新创建控件
      if (this.needsRecreation(config)) {
        this.removeControl(id);
        this.addControl(controlInfo.config);
      } else {
        // 更新现有控件的属性
        this.updateControlProperties(controlInfo.olControl, config);
      }
      
      return true;
    } catch (error) {
      console.error(`[ControlManager] 更新控件失败:`, error);
      return false;
    }
  }

  /**
   * 清空所有控件
   */
  clearControls(): void {
    for (const [id] of this.controls) {
      this.removeControl(id);
    }
  }

  /**
   * 添加默认控件集合
   */
  addDefaultControls(): void {
    // 缩放控件
    this.addControl({
      id: 'zoom',
      type: ControlType.ZOOM,
      position: 'top-left',
      visible: true,
      enabled: true
    });

    // 比例尺控件
    this.addControl({
      id: 'scaleline',
      type: ControlType.SCALE_LINE,
      position: 'bottom-left',
      visible: true,
      enabled: true
    });

    // 版权信息控件
    this.addControl({
      id: 'attribution',
      type: ControlType.ATTRIBUTION,
      position: 'bottom-right',
      visible: true,
      enabled: true
    });
  }

  /**
   * 创建 OpenLayers 控件
   * @param config 控件配置
   * @returns OpenLayers 控件实例
   * @private
   */
  private createOLControl(config: ControlConfig): any {
    const options: any = {
      className: config.className,
      target: config.target
    };

    switch (config.type) {
      case ControlType.ZOOM:
        const zoomConfig = config as ZoomControlConfig;
        return new Zoom({
          ...options,
          zoomInLabel: zoomConfig.zoomInLabel || '+',
          zoomOutLabel: zoomConfig.zoomOutLabel || '-',
          zoomInTipLabel: zoomConfig.zoomInTipLabel || '放大',
          zoomOutTipLabel: zoomConfig.zoomOutTipLabel || '缩小',
          delta: zoomConfig.delta || 1,
          duration: zoomConfig.duration || 250
        });

      case ControlType.ATTRIBUTION:
        return new Attribution({
          ...options,
          collapsible: true,
          collapsed: true
        });

      case ControlType.SCALE_LINE:
        const scaleConfig = config as ScaleLineControlConfig;
        return new ScaleLine({
          ...options,
          units: scaleConfig.units || 'metric',
          bar: scaleConfig.bar !== false,
          steps: scaleConfig.steps || 4,
          text: scaleConfig.text !== false,
          minWidth: scaleConfig.minWidth || 64
        });

      case ControlType.FULL_SCREEN:
        const fullScreenConfig = config as FullScreenControlConfig;
        return new FullScreen({
          ...options,
          label: fullScreenConfig.label || '⛶',
          labelActive: fullScreenConfig.labelActive || '✕',
          tipLabel: fullScreenConfig.tipLabel || '全屏',
          keys: fullScreenConfig.keys !== false,
          source: fullScreenConfig.source
        });

      case ControlType.MOUSE_POSITION:
        const mouseConfig = config as MousePositionControlConfig;
        return new MousePosition({
          ...options,
          coordinateFormat: mouseConfig.coordinateFormat || createStringXY(4),
          projection: mouseConfig.projection || 'EPSG:4326',
          undefinedHTML: mouseConfig.undefinedHTML || '&nbsp;'
        });

      case ControlType.OVERVIEW_MAP:
        const overviewConfig = config as OverviewMapControlConfig;
        return new OverviewMap({
          ...options,
          collapsed: overviewConfig.collapsed !== false,
          collapsible: overviewConfig.collapsible !== false,
          label: overviewConfig.label || '«',
          collapseLabel: overviewConfig.collapseLabel || '»',
          tipLabel: overviewConfig.tipLabel || '鹰眼图'
        });

      case ControlType.ROTATE:
        return new Rotate({
          ...options,
          label: '⇧',
          tipLabel: '重置旋转',
          duration: 250,
          autoHide: true
        });

      case ControlType.ZOOM_SLIDER:
        return new ZoomSlider({
          ...options,
          duration: 200
        });

      case ControlType.ZOOM_TO_EXTENT:
        return new ZoomToExtent({
          ...options,
          label: '⌂',
          tipLabel: '缩放到全图',
          extent: config.extent
        });

      default:
        throw new Error(`不支持的控件类型: ${config.type}`);
    }
  }

  /**
   * 检查是否需要重新创建控件
   * @param config 部分控件配置
   * @returns 是否需要重新创建
   * @private
   */
  private needsRecreation(config: Partial<ControlConfig>): boolean {
    // 如果改变了控件类型或关键配置，需要重新创建
    return !!(config.type || config.target);
  }

  /**
   * 更新控件属性
   * @param olControl OpenLayers 控件
   * @param config 部分控件配置
   * @private
   */
  private updateControlProperties(olControl: any, config: Partial<ControlConfig>): void {
    // 更新可见性
    if (config.visible !== undefined) {
      const element = olControl.element;
      if (element) {
        element.style.display = config.visible ? '' : 'none';
      }
    }

    // 更新启用状态
    if (config.enabled !== undefined) {
      olControl.setMap(config.enabled ? this.olMap : null);
    }

    // 更新样式类
    if (config.className !== undefined) {
      const element = olControl.element;
      if (element) {
        element.className = config.className;
      }
    }
  }

  /**
   * 获取控件统计信息
   * @returns 统计信息
   */
  getStats(): {
    totalControls: number;
    visibleControls: number;
    enabledControls: number;
    controlsByType: Record<string, number>;
  } {
    const stats = {
      totalControls: this.controls.size,
      visibleControls: 0,
      enabledControls: 0,
      controlsByType: {} as Record<string, number>
    };

    for (const controlInfo of this.controls.values()) {
      if (controlInfo.state.visible) {
        stats.visibleControls++;
      }
      if (controlInfo.state.enabled) {
        stats.enabledControls++;
      }

      const type = controlInfo.config.type;
      stats.controlsByType[type] = (stats.controlsByType[type] || 0) + 1;
    }

    return stats;
  }
}
