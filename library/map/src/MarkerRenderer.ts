import { ScatterplotLayer, IconLayer, TextLayer } from '@deck.gl/layers';
import type { DeckGLLayer } from './types';

/**
 * 标记点样式类型
 */
export type MarkerStyle = 'circle' | 'square' | 'triangle' | 'diamond' | 'pin' | 'icon' | 'custom';

/**
 * 标记点动画类型
 */
export type MarkerAnimation = 'none' | 'pulse' | 'bounce' | 'spin' | 'ripple';

/**
 * 标记点基础配置
 */
export interface MarkerOptions {
  id?: string;
  position: [number, number]; // [经度, 纬度]
  style?: MarkerStyle;
  size?: number;
  color?: number[] | ((marker: MarkerOptions) => number[]);
  icon?: string | MarkerIconOptions;
  label?: MarkerLabelOptions;
  animation?: MarkerAnimation;
  animationDuration?: number;
  opacity?: number;
  pickable?: boolean;
  visible?: boolean;
  zIndex?: number;
  data?: any; // 用户自定义数据
  onClick?: (marker: MarkerOptions, event: any) => void;
  onHover?: (marker: MarkerOptions, event: any) => void;
}

/**
 * 图标标记配置
 */
export interface MarkerIconOptions {
  url: string;
  width?: number;
  height?: number;
  anchorX?: number;
  anchorY?: number;
  mask?: boolean;
  maskColor?: number[];
}

/**
 * 标记标签配置
 */
export interface MarkerLabelOptions {
  text: string;
  offset?: [number, number];
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: number[];
  backgroundColor?: number[];
  backgroundPadding?: number[];
  anchor?: 'start' | 'middle' | 'end';
  alignment?: 'top' | 'center' | 'bottom';
  maxWidth?: number;
  visible?: boolean;
}

/**
 * 标记组配置
 */
export interface MarkerGroupOptions {
  id: string;
  markers: MarkerOptions[];
  style?: Partial<MarkerOptions>;
  clustering?: boolean;
  clusterRadius?: number;
  clusterMinPoints?: number;
}

/**
 * 自定义标记渲染器
 */
export type CustomMarkerRenderer = (marker: MarkerOptions) => {
  type: 'svg' | 'html' | 'canvas';
  content: string | HTMLElement | (() => void);
  width: number;
  height: number;
};

/**
 * MarkerRenderer - 标记点渲染器
 * 支持多种标记样式和自定义
 */
export class MarkerRenderer {
  private markers: Map<string, MarkerOptions> = new Map();
  private markerGroups: Map<string, MarkerGroupOptions> = new Map();
  private markerLayers: DeckGLLayer[] = [];
  private customRenderers: Map<MarkerStyle, CustomMarkerRenderer> = new Map();
  private markerIdCounter = 0;
  
  /**
   * 添加单个标记
   */
  addMarker(marker: MarkerOptions): string {
    const markerId = marker.id || `marker-${++this.markerIdCounter}`;
    const markerWithId = { ...marker, id: markerId };
    this.markers.set(markerId, markerWithId);
    this.updateMarkerLayers();
    return markerId;
  }
  
  /**
   * 批量添加标记
   */
  addMarkers(markers: MarkerOptions[]): string[] {
    const markerIds: string[] = [];
    markers.forEach(marker => {
      const id = this.addMarker(marker);
      markerIds.push(id);
    });
    return markerIds;
  }
  
  /**
   * 添加标记组
   */
  addMarkerGroup(group: MarkerGroupOptions): void {
    this.markerGroups.set(group.id, group);
    // 添加组内的所有标记
    group.markers.forEach(marker => {
      const mergedMarker = { ...group.style, ...marker };
      this.addMarker(mergedMarker);
    });
  }
  
  /**
   * 更新标记
   */
  updateMarker(markerId: string, updates: Partial<MarkerOptions>): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      this.markers.set(markerId, { ...marker, ...updates });
      this.updateMarkerLayers();
    }
  }
  
  /**
   * 删除标记
   */
  removeMarker(markerId: string): void {
    this.markers.delete(markerId);
    this.updateMarkerLayers();
  }
  
  /**
   * 删除标记组
   */
  removeMarkerGroup(groupId: string): void {
    const group = this.markerGroups.get(groupId);
    if (group) {
      // 删除组内所有标记
      group.markers.forEach(marker => {
        if (marker.id) {
          this.removeMarker(marker.id);
        }
      });
      this.markerGroups.delete(groupId);
    }
  }
  
  /**
   * 清空所有标记
   */
  clearMarkers(): void {
    this.markers.clear();
    this.markerGroups.clear();
    this.markerLayers = [];
  }
  
  /**
   * 注册自定义标记渲染器
   */
  registerCustomRenderer(style: string, renderer: CustomMarkerRenderer): void {
    this.customRenderers.set(style as MarkerStyle, renderer);
  }
  
  /**
   * 更新标记图层
   */
  private updateMarkerLayers(): void {
    this.markerLayers = [];
    
    // 按样式分组标记
    const markersByStyle = this.groupMarkersByStyle();
    
    // 为每种样式创建对应的图层
    markersByStyle.forEach((markers, style) => {
      const layer = this.createLayerForStyle(style, markers);
      if (layer) {
        this.markerLayers.push(layer);
      }
    });
    
    // 创建标签图层
    const labelLayer = this.createLabelLayer();
    if (labelLayer) {
      this.markerLayers.push(labelLayer);
    }
  }
  
  /**
   * 按样式分组标记
   */
  private groupMarkersByStyle(): Map<MarkerStyle, MarkerOptions[]> {
    const groups = new Map<MarkerStyle, MarkerOptions[]>();
    
    this.markers.forEach(marker => {
      const style = marker.style || 'circle';
      if (!groups.has(style)) {
        groups.set(style, []);
      }
      groups.get(style)!.push(marker);
    });
    
    return groups;
  }
  
  /**
   * 根据样式创建图层
   */
  private createLayerForStyle(style: MarkerStyle, markers: MarkerOptions[]): DeckGLLayer | null {
    // 过滤可见的标记
    const visibleMarkers = markers.filter(m => m.visible !== false);
    
    if (visibleMarkers.length === 0) {
      return null;
    }
    
    switch (style) {
      case 'circle':
      case 'square':
      case 'triangle':
      case 'diamond':
        return this.createShapeLayer(style, visibleMarkers);
      
      case 'pin':
        return this.createPinLayer(visibleMarkers);
      
      case 'icon':
        return this.createIconLayer(visibleMarkers);
      
      case 'custom':
        return this.createCustomLayer(visibleMarkers);
      
      default:
        return this.createShapeLayer('circle', visibleMarkers);
    }
  }
  
  /**
   * 创建形状图层（圆形、方形、三角形、菱形）
   */
  private createShapeLayer(shape: string, markers: MarkerOptions[]): ScatterplotLayer {
    // 为带动画的标记增加特殊效果
    const animatedMarkers = markers.map(marker => {
      // 为所有标记添加动画相位，用于创建流畅的动画
      return {
        ...marker,
        _animationPhase: Math.random() * Math.PI * 2,
        _pulsePhase: Math.random() * Math.PI * 2,
        _hoverScale: 1.0
      };
    });
    
    return new ScatterplotLayer({
      id: `marker-${shape}-layer`,
      data: animatedMarkers,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 3,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: (d: MarkerOptions) => d.position,
      getRadius: (d: MarkerOptions) => {
        const baseRadius = (d.size || 10) * 1.2; // 增大基础尺寸
        const time = Date.now() / 1000;
        const phase = (d as any)._animationPhase || 0;
        let scale = (d as any)._hoverScale || 1.0;
        
        // 根据不同动画类型应用不同效果
        if (d.animation === 'ripple' && shape === 'circle') {
          scale *= 1 + 0.3 * Math.sin(time * 2 + phase);
        } else if (d.animation === 'pulse') {
          scale *= 1 + 0.2 * Math.sin(time * 3 + phase);
        } else if (d.animation === 'bounce') {
          scale *= 1 + 0.15 * Math.abs(Math.sin(time * 4 + phase));
        } else {
          // 即使没有动画，也添加微妙的呼吸效果
          scale *= 1 + 0.05 * Math.sin(time * 1.5 + phase);
        }
        
        return baseRadius * scale;
      },
      getFillColor: (d: MarkerOptions) => {
        let color = d.color || [255, 0, 0, 200];
        if (typeof d.color === 'function') {
          color = d.color(d);
        }
        
        if (Array.isArray(color)) {
          const time = Date.now() / 1000;
          const phase = (d as any)._animationPhase || 0;
          const hoverScale = (d as any)._hoverScale || 1.0;
          
          // 基础发光效果
          let brightness = 1.0;
          let opacity = (color[3] || 255) / 255;
          
          // 根据不同动画类型调整颜色
          if (d.animation === 'ripple' && shape === 'circle') {
            opacity *= 0.7 + 0.3 * Math.sin(time * 2 + phase);
            brightness = 1.0 + 0.2 * Math.sin(time * 2 + phase);
          } else if (d.animation === 'pulse') {
            opacity *= 0.8 + 0.2 * Math.sin(time * 3 + phase);
            brightness = 1.0 + 0.15 * Math.sin(time * 3 + phase);
          } else {
            // 添加微妙的呼吸光效
            opacity *= 0.9 + 0.1 * Math.sin(time * 1.5 + phase);
          }
          
          // 悬停时增加亮度
          if (hoverScale > 1.0) {
            brightness *= 1.3;
          }
          
          return [
            Math.min(255, color[0] * brightness),
            Math.min(255, color[1] * brightness),
            Math.min(255, color[2] * brightness),
            Math.floor(255 * opacity)
          ];
        }
        return color;
      },
      getLineColor: (d: MarkerOptions) => {
        const time = Date.now() / 1000;
        const phase = (d as any)._animationPhase || 0;
        const hoverScale = (d as any)._hoverScale || 1.0;
        
        // 创建发光边框效果
        let opacity = 1.0;
        if (d.animation === 'ripple' && shape === 'circle') {
          opacity = 0.8 + 0.2 * Math.sin(time * 2 + phase);
        } else if (d.animation) {
          opacity = 0.9 + 0.1 * Math.sin(time * 3 + phase);
        }
        
        // 悬停时边框更亮
        if (hoverScale > 1.0) {
          return [255, 255, 100, Math.floor(255 * opacity)];
        }
        
        return [255, 255, 255, Math.floor(255 * opacity * 0.9)];
      },
      lineWidthScale: 1,
      getLineWidth: (d: MarkerOptions) => {
        const hoverScale = (d as any)._hoverScale || 1.0;
        let width = 2;
        
        // 动画时边框更粗
        if (d.animation === 'ripple' && shape === 'circle') {
          width = 3;
        } else if (d.animation) {
          width = 2.5;
        }
        
        // 悬停时边框加粗
        if (hoverScale > 1.0) {
          width *= 1.5;
        }
        
        return width;
      },
      onClick: (info: any) => {
        const marker = info.object as MarkerOptions;
        if (marker.onClick) {
          // 添加点击动画反馈
          (marker as any)._hoverScale = 1.5;
          setTimeout(() => {
            (marker as any)._hoverScale = 1.0;
          }, 300);
          marker.onClick(marker, info);
        }
      },
      onHover: (info: any) => {
        const marker = info.object as MarkerOptions;
        if (info.picked) {
          // 悬停时放大
          (marker as any)._hoverScale = 1.3;
          document.body.style.cursor = 'pointer';
        } else {
          // 离开时恢复
          (marker as any)._hoverScale = 1.0;
          document.body.style.cursor = 'default';
        }
        if (marker.onHover) {
          marker.onHover(marker, info);
        }
      },
      updateTriggers: {
        getRadius: [shape],
        getFillColor: [markers]
      }
    } as any);
  }
  
  /**
   * 创建图钉图层
   */
  private createPinLayer(markers: MarkerOptions[]): IconLayer {
    // 默认图钉 SVG
    const defaultPinSvg = `
      <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"/>
      </svg>
    `;
    
    const iconMapping = {
      pin: {
        x: 0,
        y: 0,
        width: 24,
        height: 36,
        anchorX: 12,
        anchorY: 36
      }
    };
    
    return new IconLayer({
      id: 'marker-pin-layer',
      data: markers,
      pickable: true,
      iconAtlas: 'data:image/svg+xml;base64,' + btoa(defaultPinSvg),
      iconMapping,
      getIcon: () => 'pin',
      getPosition: (d: MarkerOptions) => d.position,
      getSize: (d: MarkerOptions) => d.size || 24,
      getColor: (d: MarkerOptions) => {
        if (typeof d.color === 'function') {
          return d.color(d);
        }
        return d.color || [255, 0, 0, 255];
      },
      onClick: (info: any) => {
        const marker = info.object as MarkerOptions;
        if (marker.onClick) {
          marker.onClick(marker, info);
        }
      },
      onHover: (info: any) => {
        const marker = info.object as MarkerOptions;
        if (marker.onHover) {
          marker.onHover(marker, info);
        }
      }
    } as any);
  }
  
  /**
   * 创建图标图层
   */
  private createIconLayer(markers: MarkerOptions[]): IconLayer {
    // 准备图标数据
    const iconData = markers.map(marker => {
      const icon = marker.icon;
      if (typeof icon === 'string') {
        return {
          ...marker,
          iconUrl: icon,
          iconWidth: 32,
          iconHeight: 32
        };
      } else if (icon) {
        return {
          ...marker,
          iconUrl: icon.url,
          iconWidth: icon.width || 32,
          iconHeight: icon.height || 32,
          anchorX: icon.anchorX || 16,
          anchorY: icon.anchorY || 16
        };
      }
      return marker;
    });
    
    return new IconLayer({
      id: 'marker-icon-layer',
      data: iconData,
      pickable: true,
      getIcon: (d: any) => ({
        url: d.iconUrl,
        width: d.iconWidth,
        height: d.iconHeight,
        anchorX: d.anchorX,
        anchorY: d.anchorY
      }),
      getPosition: (d: any) => d.position,
      getSize: (d: any) => d.size || 1,
      onClick: (info: any) => {
        const marker = info.object as MarkerOptions;
        if (marker.onClick) {
          marker.onClick(marker, info);
        }
      },
      onHover: (info: any) => {
        const marker = info.object as MarkerOptions;
        if (marker.onHover) {
          marker.onHover(marker, info);
        }
      }
    } as any);
  }
  
  /**
   * 创建自定义图层
   */
  private createCustomLayer(markers: MarkerOptions[]): DeckGLLayer | null {
    // 这里可以扩展支持自定义渲染器
    // 暂时返回默认圆形图层
    return this.createShapeLayer('circle', markers);
  }
  
  /**
   * 创建标签图层
   */
  private createLabelLayer(): TextLayer | null {
    const markersWithLabels = Array.from(this.markers.values())
      .filter(m => m.label && m.label.visible !== false);
    
    if (markersWithLabels.length === 0) {
      return null;
    }
    
    const labelData = markersWithLabels.map(marker => ({
      position: [
        marker.position[0] + (marker.label?.offset?.[0] || 0),
        marker.position[1] + (marker.label?.offset?.[1] || 0)
      ],
      text: marker.label?.text || '',
      marker
    }));
    
    // 构建标签字符集
    const labelChars = labelData.map(d => d.text).join('');
    const uniqueLabelChars = Array.from(new Set(labelChars)).join('');
    
    return new TextLayer({
      id: 'marker-labels-layer',
      data: labelData,
      pickable: false,
      getPosition: (d: any) => d.position,
      getText: (d: any) => d.text,
      getSize: (d: any) => d.marker.label?.fontSize || 12,
      getColor: (d: any) => d.marker.label?.color || [0, 0, 0, 255],
      getTextAnchor: (d: any) => d.marker.label?.anchor || 'middle',
      getAlignmentBaseline: (d: any) => d.marker.label?.alignment || 'center',
      fontFamily: (d: any) => d.marker.label?.fontFamily || 'Arial, sans-serif',
      fontWeight: (d: any) => d.marker.label?.fontWeight || 'normal',
      maxWidth: (d: any) => d.marker.label?.maxWidth || 200,
      getBackgroundColor: (d: any) => d.marker.label?.backgroundColor || [255, 255, 255, 0],  // 使用新的API
      backgroundPadding: (d: any) => d.marker.label?.backgroundPadding || [2, 2],
      characterSet: uniqueLabelChars  // 设置字符集
    } as any);
  }
  
  /**
   * 获取所有标记图层
   */
  getLayers(): DeckGLLayer[] {
    return this.markerLayers;
  }
  
  /**
   * 获取标记
   */
  getMarker(markerId: string): MarkerOptions | undefined {
    return this.markers.get(markerId);
  }
  
  /**
   * 获取所有标记
   */
  getAllMarkers(): MarkerOptions[] {
    return Array.from(this.markers.values());
  }
  
  /**
   * 通过条件查找标记
   */
  findMarkers(predicate: (marker: MarkerOptions) => boolean): MarkerOptions[] {
    return Array.from(this.markers.values()).filter(predicate);
  }
  
  /**
   * 显示/隐藏标记
   */
  setMarkerVisibility(markerId: string, visible: boolean): void {
    this.updateMarker(markerId, { visible });
  }
  
  /**
   * 批量显示/隐藏标记
   */
  setMarkersVisibility(markerIds: string[], visible: boolean): void {
    markerIds.forEach(id => this.setMarkerVisibility(id, visible));
  }
  
  /**
   * 高亮标记
   */
  highlightMarker(markerId: string, highlightColor?: number[]): void {
    const marker = this.markers.get(markerId);
    if (marker) {
      const originalColor = marker.color;
      this.updateMarker(markerId, {
        color: highlightColor || [255, 255, 0, 255],
        data: { ...marker.data, originalColor }
      });
    }
  }
  
  /**
   * 取消高亮
   */
  unhighlightMarker(markerId: string): void {
    const marker = this.markers.get(markerId);
    if (marker && marker.data?.originalColor) {
      this.updateMarker(markerId, {
        color: marker.data.originalColor
      });
    }
  }
  
  /**
   * 设置标记动画
   */
  setMarkerAnimation(markerId: string, animation: MarkerAnimation, duration?: number): void {
    this.updateMarker(markerId, { 
      animation,
      animationDuration: duration || 1000
    });
  }
  
  /**
   * 批量设置标记动画
   */
  setMarkersAnimation(markerIds: string[], animation: MarkerAnimation, duration?: number): void {
    markerIds.forEach(id => this.setMarkerAnimation(id, animation, duration));
  }
}