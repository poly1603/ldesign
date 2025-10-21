import { Deck } from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { RippleMarker, createRippleMarker } from './RippleMarker';
import type {
  ViewMode,
  ViewState,
  MapRendererOptions,
  LayerOptions,
  CityMarker,
  CityMarkerOptions,
  DeckGLLayer,
  ColorScheme,
  SelectionMode,
  SelectionStyle,
  Feature,
  FeatureCollection,
  TextLabelOptions
} from './types';
import { MarkerRenderer, type MarkerOptions, type MarkerGroupOptions } from './MarkerRenderer';

/**
 * MapRenderer - A deck.gl based map renderer for GeoJSON data
 * Supports 2D and 3D visualization modes
 */
export class MapRenderer {
  private container: HTMLElement;
  private mode: ViewMode;
  private deck: Deck | null = null;
  private layers: DeckGLLayer[] = [];
  private viewState: ViewState;
  private autoFit: boolean;
  private geoJsonBounds: { minLng: number; maxLng: number; minLat: number; maxLat: number } | null = null;
  private lastZoom: number = 8;
  private layerLabelOptions: Map<string, { labelOptions: TextLabelOptions; colorScheme?: ColorScheme }> = new Map();
  // 保存原始的图层配置（用于选中功能）
  private originalLayerProps: Map<string, any> = new Map();
  
  // 缩放控制配置
  private smoothZoom: boolean;
  private zoomSpeed: number;
  private transitionDuration: number;
  private inertia: boolean;
  
  // 选择控制配置
  private selectionMode: SelectionMode;
  private selectionStyle: SelectionStyle;
  private showTooltip: boolean;
  private selectedFeatures: Set<string> = new Set();  // 存储选中的 feature ID
  private onSelectCallback?: (selectedFeatures: Feature[]) => void;
  
  // MarkerRenderer instance
  private markerRenderer: MarkerRenderer;
  private animationFrameId: number | null = null;
  private rippleMarkers: Map<string, RippleMarker> = new Map();
  
  // 新增功能属性
  private miniMap: HTMLElement | null = null;
  private compass: HTMLElement | null = null;
  private scaleBar: HTMLElement | null = null;
  private coordinateDisplay: HTMLElement | null = null;
  private performanceOverlay: HTMLElement | null = null;
  private drawingMode: 'none' | 'polygon' | 'circle' | 'rectangle' = 'none';
  private currentDrawing: any[] = [];
  private drawings: Map<string, any> = new Map();
  private hoverTimeout: number | null = null;
  private lastInteractionTime: number = Date.now();
  private idleCallback?: () => void;
  
  // 配置选项
  private enableMiniMap: boolean = false;
  private enableCompass: boolean = false;
  private enableScaleBar: boolean = false;
  private enableCoordinates: boolean = false;
  private enablePerformanceOverlay: boolean = false;
  private enableDrawing: boolean = false;
  private enableIdleDetection: boolean = false;
  private idleTimeout: number = 30000; // 30秒

  constructor(container: HTMLElement | string, options: MapRendererOptions = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) as HTMLElement 
      : container;
    
    if (!this.container) {
      throw new Error('Container element not found');
    }
    
    // 确保容器有大小
    const rect = this.container.getBoundingClientRect();
    console.log('Container dimensions:', rect.width, 'x', rect.height);

    this.mode = options.mode || '2d';
    this.autoFit = options.autoFit === true;  // 默认禁用自动适配，只有明确设置true时才启用
    
    // 初始化缩放控制选项
    this.smoothZoom = options.smoothZoom !== false;  // 默认启用
    this.zoomSpeed = options.zoomSpeed || 0.5;  // 默认速度
    this.transitionDuration = options.transitionDuration || 300;  // 默认 300ms
    this.inertia = options.inertia !== false;  // 默认启用
    
    // 初始化选择控制选项
    this.selectionMode = options.selectionMode || 'none';  // 默认不启用选择
    this.showTooltip = options.showTooltip !== undefined ? options.showTooltip : false;  // 默认不显示
    this.onSelectCallback = options.onSelect;
    this.selectionStyle = {
      strokeColor: [255, 215, 0, 255],  // 黑色描边
      strokeWidth: 4,
      fillOpacity: 1.0,
      highlightColor: [255, 215, 0, 100],  // 黄色高亮
      ...options.selectionStyle
    };
    
    // 设置视口状态
    // 如果提供了viewState，使用它；否则根据autoFit决定
    if (options.viewState) {
      this.viewState = {
        longitude: 113.3,
        latitude: 23.1,
        zoom: 6,
        pitch: this.mode === '3d' ? 45 : 0,
        bearing: 0,
        ...options.viewState
      };
    } else if (this.autoFit === true) {
      const autoViewState = this.calculateOptimalViewState(rect.width, rect.height);
      this.viewState = {
        longitude: autoViewState.longitude || 113.3,
        latitude: autoViewState.latitude || 23.1,
        zoom: autoViewState.zoom || 6,
        pitch: this.mode === '3d' ? 45 : 0,
        bearing: 0
      };
    } else {
      // 使用简单的默认值，优先使用传入的经纬度和缩放
      this.viewState = {
        longitude: options.longitude || 113.3,
        latitude: options.latitude || 23.1,
        zoom: options.zoom || 6,
        pitch: this.mode === '3d' ? 45 : 0,
        bearing: 0
      };
    }
    
    // 初始化 lastZoom
    this.lastZoom = this.viewState.zoom || 8;
    
    // 初始化 MarkerRenderer
    this.markerRenderer = new MarkerRenderer();

    this.initDeck();
    
    // 启动动画循环
    this.startAnimationLoop();
  }

  /**
   * Initialize deck.gl instance
   */
  private initDeck(): void {
    // 清空容器内容
    this.container.innerHTML = '';
    
    // 确保容器有正确的定位上下文
    const position = window.getComputedStyle(this.container).position;
    if (position === 'static') {
      this.container.style.position = 'relative';
    }
    
    // 确保容器有overflow hidden以防止内容溢出
    this.container.style.overflow = 'hidden';
    
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || this.container.offsetWidth;
    const height = rect.height || this.container.offsetHeight;
    
    if (!width || !height) {
      console.error('Container has no size:', width, height);
      return;
    }
    
    console.log('Initializing deck with container:', this.container);
    console.log('Container size:', width, 'x', height);
    
    try {
      // 创建canvas元素
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.left = '0';
      canvas.style.top = '0';
      this.container.appendChild(canvas);
      
      // 配置 controller，默认禁用滚轮缩放
      const controllerOptions: any = {
        scrollZoom: false,  // 默认禁用滚轮缩放
        touchZoom: true,
        touchRotate: true,
        doubleClickZoom: true,
        keyboard: true,
        inertia: this.inertia ? 300 : 0,  // 惯性时长（毫秒）
        dragPan: true,
        dragRotate: this.mode === '3d',
        transitionDuration: this.smoothZoom ? this.transitionDuration : 0,
        transitionEasing: (t: number) => {
          // 使用 easeOutCubic 缓动函数，更加平滑
          return 1 - Math.pow(1 - t, 3);
        }
      };
      
      this.deck = new Deck({
        canvas: canvas,  // 使用我们创建的canvas
        width: width,
        height: height,
        initialViewState: this.viewState,
        controller: controllerOptions,
        layers: [],
        onResize: ({width, height}) => {
          console.log('Deck resized:', width, height);
        },
        onViewStateChange: ({ viewState }) => {
          this.handleViewStateChange(viewState);
          return viewState;
        },
        getTooltip: this.showTooltip ? ((info: any) => info.object && {
          html: this.getTooltipHTML(info.object),
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px'
          }
        }) : undefined,
        onClick: (info: any) => this.handleClick(info)
      });
      
      console.log('Deck.gl initialized successfully');
      
      // 初始化后设置鼠标事件监听
      this.setupMouseWheelControl();
    } catch (error) {
      console.error('Failed to initialize Deck.gl:', error);
      throw error;
    }
  }

  /**
   * Setup mouse wheel control
   */
  private setupMouseWheelControl(): void {
    // 跟踪鼠标是否在地图图形上
    let isMouseOverMapFeature = false;
    
    // 监听鼠标移动，检测是否在地图特征上
    this.container.addEventListener('mousemove', (event: MouseEvent) => {
      if (!this.deck) return;
      
      // 确保 deck.gl 已经完全初始化
      try {
        // 获取鼠标位置下的对象
        const rect = this.container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 检查坐标是否在有效范围内
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
          return;
        }
        
        // 使用 deck.gl 的 pickObject 方法
        const pickInfo = this.deck.pickObject({ x, y, radius: 1 });
      
      // 检查是否拾取到了地图特征
      const wasOverFeature = isMouseOverMapFeature;
      isMouseOverMapFeature = !!pickInfo && !!pickInfo.object;
      
      // 当鼠标从无特征移到特征上时
      if (!wasOverFeature && isMouseOverMapFeature) {
        // 启用滚轮缩放
        const currentController = (this.deck.props.controller as any) || {};
        this.deck.setProps({
          controller: {
            ...currentController,
            scrollZoom: {
              speed: this.zoomSpeed,
              smooth: this.smoothZoom
            }
          }
        });
        // 修改鼠标样式为抓手
        this.container.style.cursor = 'grab';
      }
      // 当鼠标从特征上移开时
      else if (wasOverFeature && !isMouseOverMapFeature) {
        // 禁用滚轮缩放
        const currentController = (this.deck.props.controller as any) || {};
        this.deck.setProps({
          controller: {
            ...currentController,
            scrollZoom: false
          }
        });
        // 恢复默认鼠标样式
        this.container.style.cursor = 'default';
      }
      } catch (error) {
        // 忽略 pick 错误，可能是 deck.gl 还没有完全初始化
        console.debug('Pick object error (safe to ignore):', error);
      }
    });
    
    // 监听鼠标离开容器
    this.container.addEventListener('mouseleave', () => {
      isMouseOverMapFeature = false;
      // 禁用滚轮缩放
      if (this.deck) {
        const currentController = (this.deck.props.controller as any) || {};
        this.deck.setProps({
          controller: {
            ...currentController,
            scrollZoom: false
          }
        });
      }
      // 恢复默认鼠标样式
      this.container.style.cursor = 'default';
    });
    
    // 阻止滚轮事件冒泡
    this.container.addEventListener('wheel', (event: WheelEvent) => {
      if (isMouseOverMapFeature) {
        // 鼠标在地图特征上，阻止事件冒泡到页面
        event.stopPropagation();
      }
    }, { passive: false });
  }

  /**
   * Handle click event for selection
   */
  private handleClick(info: any): void {
    console.log('handleClick called, selectionMode:', this.selectionMode, 'info:', info);
    
    if (this.selectionMode === 'none' || !info.object) {
      console.log('Selection disabled or no object clicked');
      return;
    }
    
    // 过滤文字层点击，只处理 GeoJSON feature
    const feature = info.object as Feature;
    if (!feature.geometry || !feature.properties) {
      console.log('Not a valid GeoJSON feature, ignoring click');
      return;
    }
    
    const featureId = this.getFeatureId(feature);
    console.log('Feature clicked:', featureId, 'Feature:', feature.properties?.name);
    
    if (this.selectionMode === 'single') {
      // 单选模式：清空其他选中，只选中当前
      if (this.selectedFeatures.has(featureId)) {
        // 如果已经选中，则取消选中
        this.selectedFeatures.clear();
      } else {
        this.selectedFeatures.clear();
        this.selectedFeatures.add(featureId);
      }
    } else if (this.selectionMode === 'multiple') {
      // 多选模式：切换选中状态
      if (this.selectedFeatures.has(featureId)) {
        this.selectedFeatures.delete(featureId);
      } else {
        this.selectedFeatures.add(featureId);
      }
    }
    
    // 重新渲染图层以显示选中效果
    this.updateSelectionLayers();
    
    // 触发回调
    if (this.onSelectCallback) {
      const selectedFeaturesList = this.getSelectedFeaturesList();
      this.onSelectCallback(selectedFeaturesList);
    }
  }
  
  /**
   * Get feature unique ID
   */
  private getFeatureId(feature: Feature): string {
    return feature.properties?.adcode?.toString() || 
           feature.properties?.name || 
           JSON.stringify(feature.geometry.coordinates[0][0]);
  }
  
  /**
   * Get list of selected features
   */
  private getSelectedFeaturesList(): Feature[] {
    const allFeatures: Feature[] = [];
    
    // 遍历所有 GeoJSON 层，收集选中的 features
    this.layers.forEach(layer => {
      if (layer.props.data && (layer.props.data as FeatureCollection).features) {
        const features = (layer.props.data as FeatureCollection).features;
        features.forEach(feature => {
          const id = this.getFeatureId(feature);
          if (this.selectedFeatures.has(id)) {
            allFeatures.push(feature);
          }
        });
      }
    });
    
    return allFeatures;
  }
  
  /**
   * Update layers to show selection effect
   */
  private updateSelectionLayers(): void {
    console.log('updateSelectionLayers called, selected:', Array.from(this.selectedFeatures));
    
    // 先移除旧的选中层
    this.layers = this.layers.filter(layer => layer.id !== 'selection-highlight-layer');
    
    // 重新渲染所有 GeoJSON 层（不再修改颜色，保持原样）
    const geoJsonLayers = this.layers.filter(layer => 
      layer.id && !layer.id.endsWith('-labels') && layer.props.data
    );
    
    console.log('Found geoJsonLayers:', geoJsonLayers.map(l => l.id));
    
    // 如果有选中的区域，创建一个单独的高亮层
    if (this.selectedFeatures.size > 0) {
      geoJsonLayers.forEach(layer => {
        const layerId = layer.id!;
        const geoJsonData = layer.props.data as FeatureCollection;
        
        // 使用保存的原始配置
        if (!this.originalLayerProps.has(layerId)) {
          this.originalLayerProps.set(layerId, { ...layer.props });
        }
        const originalProps = this.originalLayerProps.get(layerId)!;
        
        // 筛选出选中的 features
        const selectedFeatures = geoJsonData.features?.filter(feature => {
          const featureId = this.getFeatureId(feature);
          return this.selectedFeatures.has(featureId);
        }) || [];
        
        if (selectedFeatures.length > 0) {
          // 创建选中的 FeatureCollection
          const selectedGeoJson: FeatureCollection = {
            type: 'FeatureCollection',
            features: selectedFeatures
          };
          
          // 创建高亮层（支持填充颜色）
          const highlightLayer = new GeoJsonLayer({
            id: 'selection-highlight-layer',
            data: selectedGeoJson,
            pickable: true,
            stroked: true,
            filled: !!this.selectionStyle.highlightColor,  // 根据是否设置高亮颜色决定是否填充
            extruded: originalProps.extruded || false,
            wireframe: false,
            lineWidthMinPixels: this.selectionStyle.strokeWidth || 3,
            lineWidthMaxPixels: this.selectionStyle.strokeWidth || 3,
            getLineColor: this.selectionStyle.strokeColor || [255, 0, 0, 255],
            getFillColor: this.selectionStyle.highlightColor || [255, 0, 0, 80],
            getLineWidth: this.selectionStyle.strokeWidth || 3,
            getElevation: originalProps.getElevation || 0,
            elevationScale: originalProps.elevationScale || 1
          } as any);
          
          // 将高亮层插入到所有文本层之前（保证文字在最上面）
          const firstLabelIndex = this.layers.findIndex(l => l.id && l.id.endsWith('-labels'));
          if (firstLabelIndex !== -1) {
            // 如果有文本层，插入到第一个文本层之前
            this.layers.splice(firstLabelIndex, 0, highlightLayer);
          } else {
            // 如果没有文本层，添加到末尾
            this.layers.push(highlightLayer);
          }
          console.log('Added selection highlight layer with', selectedFeatures.length, 'features');
        }
      });
    }
    
    this.updateLayers();
  }
  
  /**
   * Handle view state changes (zoom, pan, etc.)
   */
  private handleViewStateChange(newViewState: any): void {
    const newZoom = newViewState.zoom || 8;
    const zoomDiff = Math.abs(newZoom - this.lastZoom);
    
    // 当 zoom 变化超过 0.3 时，更新文本大小
    if (zoomDiff > 0.3) {
      this.viewState = { ...this.viewState, ...newViewState };
      this.updateTextLayersSize();
      this.lastZoom = newZoom;
    } else {
      this.viewState = { ...this.viewState, ...newViewState };
    }
  }
  
  /**
   * Update all text layers' size based on current zoom
   */
  private updateTextLayersSize(): void {
    // 遍历所有保存的图层配置，重新渲染文本图层
    this.layerLabelOptions.forEach((config, layerId) => {
      const geoJsonLayer = this.layers.find(layer => layer.id === layerId);
      if (geoJsonLayer && geoJsonLayer.props.data) {
        const labelLayerId = `${layerId}-labels`;
        // 移除旧的文本图层
        this.removeLayer(labelLayerId);
        // 重新添加文本图层，使用新的 zoom 级别
        this.addTextLabels(geoJsonLayer.props.data as FeatureCollection, {
          id: layerId,
          colorScheme: config.colorScheme,
          labelOptions: config.labelOptions
        });
      }
    });
    
    // 更新图层
    this.updateLayers();
  }
  
  /**
   * Calculate luminance of an RGB color
   */
  private calculateLuminance(rgb: number[]): number {
    const [r, g, b] = rgb.map(val => {
      const normalized = val / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  
  /**
   * Get contrasting text color (black or white) based on background color
   */
  private getContrastingTextColor(backgroundColor: number[]): number[] {
    const luminance = this.calculateLuminance(backgroundColor);
    // 使用 WCAG 标准：亮度 > 0.5 使用黑色文本，否则使用白色文本
    return luminance > 0.5 ? [33, 33, 33, 255] : [255, 255, 255, 255];
  }
  
  /**
   * Get tooltip HTML content
   */
  private getTooltipHTML(object: Feature): string {
    if (object.properties) {
      const props = object.properties;
      const name = props.name || props.NAME || props.adm1_name || 'Unknown';
      const center = props.center ? `<br/>Center: ${props.center}` : '';
      const adcode = props.adcode ? `<br/>Code: ${props.adcode}` : '';
      
      return `
        <div>
          ${name}
          ${center}
          ${adcode}
        </div>
      `;
    }
    return '';
  }

  /**
   * Load and render GeoJSON data from URL
   */
  async loadGeoJSON(url: string, layerOptions: LayerOptions = {}): Promise<FeatureCollection> {
    try {
      const response = await fetch(url);
      const geoJson = await response.json() as FeatureCollection;
      this.renderGeoJSON(geoJson, layerOptions);
      return geoJson;
    } catch (error) {
      console.error('Failed to load GeoJSON:', error);
      throw error;
    }
  }

  /**
   * Render GeoJSON data directly
   */
  renderGeoJSON(geoJson: FeatureCollection, layerOptions: LayerOptions = {}): void {
    console.log('renderGeoJSON called with:', geoJson, 'features count:', geoJson.features?.length);
    
    // 如果启用自动适配，计算并设置最佳视口
    // 只有在明确设置了autoFit为true时才进行自动适配
    if (this.autoFit === true && geoJson.features && geoJson.features.length > 0) {
      this.calculateGeoJsonBounds(geoJson);
      this.fitToGeoJson();
    }
    
    // 决定使用的颜色方案
    let fillColorFunction: any;
    if (layerOptions.colorScheme) {
      fillColorFunction = this.createColorFunction(layerOptions.colorScheme, geoJson);
    } else if (layerOptions.getFillColor) {
      fillColorFunction = layerOptions.getFillColor;
    } else {
      fillColorFunction = this.getDefaultFillColor.bind(this);
    }
    
    const defaultOptions: LayerOptions = {
      id: layerOptions.id || 'geojson-layer',
      pickable: true,
      stroked: true,
      filled: true,
      extruded: this.mode === '3d',
      wireframe: false,
      lineWidthMinPixels: 2,
      lineWidthMaxPixels: 3,
      getLineColor: layerOptions.getLineColor || [255, 255, 255, 255],
      getFillColor: fillColorFunction,
      getLineWidth: 1,
      getElevation: this.mode === '3d' ? (layerOptions.getElevation || 30000) : 0,
      elevationScale: layerOptions.elevationScale || 1,
      material: {
        ambient: 0.35,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [100, 100, 100]
      },
      transitions: {
        getElevation: {
          duration: 500,
          easing: (t: number) => t
        }
      }
    };

    const finalOptions = {
      ...defaultOptions,
      ...layerOptions,
      data: geoJson
    };
    
    const layer = new GeoJsonLayer(finalOptions as any);
    
    // 保存原始配置（用于选中功能）
    const layerId = layerOptions.id || 'geojson-layer';
    this.originalLayerProps.set(layerId, finalOptions);
    console.log('Saved original props for layer:', layerId);

    this.addLayer(layer);
    
    // 如果启用了显示标签，添加文本层
    if (layerOptions.showLabels !== false) {
      // 保存标签配置，用于动态更新
      const layerId = layerOptions.id || 'geojson-layer';
      this.layerLabelOptions.set(layerId, {
        labelOptions: layerOptions.labelOptions || {},
        colorScheme: layerOptions.colorScheme
      });
      this.addTextLabels(geoJson, layerOptions);
    }
  }

  /**
   * Create color function based on color scheme
   */
  private createColorFunction(scheme: ColorScheme, geoJson: FeatureCollection): (feature: any, info?: any) => number[] {
    const opacity = scheme.opacity !== undefined ? scheme.opacity : 180;
    
    switch (scheme.mode) {
      case 'single':
        // 单色模式
        const singleColor = scheme.color || [100, 150, 250, opacity];
        return () => singleColor;
      
      case 'gradient':
        // 渐变色模式
        return this.createGradientColorFunction(scheme, geoJson, opacity);
      
      case 'category':
        // 分类色模式
        return this.createCategoryColorFunction(scheme, opacity);
      
      case 'data':
        // 数据驱动模式
        return this.createDataDrivenColorFunction(scheme, geoJson, opacity);
      
      case 'custom':
        // 自定义函数模式
        return scheme.customFunction || this.getDefaultFillColor.bind(this);
      
      case 'random':
        // 随机色模式
        return this.createRandomColorFunction(opacity);
      
      default:
        return this.getDefaultFillColor.bind(this);
    }
  }
  
  /**
   * Create gradient color function
   */
  private createGradientColorFunction(scheme: ColorScheme, geoJson: FeatureCollection, opacity: number): (feature: any, info?: any) => number[] {
    const startColor = scheme.startColor || [0, 100, 200];
    const endColor = scheme.endColor || [200, 100, 0];
    const featureCount = geoJson.features?.length || 1;
    
    // 创建一个映射来存储每个feature的索引
    const featureIndexMap = new Map();
    geoJson.features?.forEach((feature, index) => {
      const id = feature.properties?.adcode || feature.properties?.name || index;
      featureIndexMap.set(id, index);
    });
    
    return (feature: any, info?: any) => {
      // 获取feature的索引
      const id = feature.properties?.adcode || feature.properties?.name;
      const index = featureIndexMap.get(id) ?? info?.index ?? 0;
      const ratio = featureCount > 1 ? index / (featureCount - 1) : 0;
      
      return [
        Math.round(startColor[0] + (endColor[0] - startColor[0]) * ratio),
        Math.round(startColor[1] + (endColor[1] - startColor[1]) * ratio),
        Math.round(startColor[2] + (endColor[2] - startColor[2]) * ratio),
        opacity
      ];
    };
  }
  
  /**
   * Create category color function
   */
  private createCategoryColorFunction(scheme: ColorScheme, opacity: number): (feature: any) => number[] {
    const colors = scheme.colors || [
      [255, 87, 34],   // 深橙
      [33, 150, 243],  // 蓝色
      [76, 175, 80],   // 绿色
      [255, 193, 7],   // 琥珀
      [156, 39, 176],  // 紫色
      [0, 188, 212],   // 青色
      [96, 125, 139],  // 蓝灰
      [255, 152, 0],   // 橙色
    ];
    
    const categoryField = scheme.categoryField || 'adcode';
    const categoryMap = new Map<any, number[]>();
    let colorIndex = 0;
    
    return (feature: any) => {
      const categoryValue = feature.properties?.[categoryField];
      
      if (!categoryMap.has(categoryValue)) {
        const color = colors[colorIndex % colors.length];
        categoryMap.set(categoryValue, [...color, opacity]);
        colorIndex++;
      }
      
      return categoryMap.get(categoryValue) || [128, 128, 128, opacity];
    };
  }
  
  /**
   * Create data-driven color function
   */
  private createDataDrivenColorFunction(scheme: ColorScheme, geoJson: FeatureCollection, opacity: number): (feature: any) => number[] {
    const dataField = scheme.dataField || 'value';
    
    // 计算数据范围
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    if (!scheme.dataRange) {
      geoJson.features?.forEach(feature => {
        let value = feature.properties?.[dataField];
        // 如果是字符串，尝试转换为数字
        if (typeof value === 'string') {
          value = parseFloat(value);
        }
        if (typeof value === 'number' && !isNaN(value)) {
          minValue = Math.min(minValue, value);
          maxValue = Math.max(maxValue, value);
        }
      });
    } else {
      [minValue, maxValue] = scheme.dataRange;
    }
    
    // 使用颜色停靠点或默认渐变
    const colorStops = scheme.colorStops || [
      { value: 0, color: [0, 0, 255] },      // 蓝色（低值）
      { value: 0.5, color: [255, 255, 0] },  // 黄色（中值）
      { value: 1, color: [255, 0, 0] }       // 红色（高值）
    ];
    
    return (feature: any) => {
      let value = feature.properties?.[dataField];
      // 如果是字符串，尝试转换为数字
      if (typeof value === 'string') {
        value = parseFloat(value);
      }
      if (typeof value !== 'number' || isNaN(value)) {
        return [128, 128, 128, opacity];  // 默认灰色
      }
      
      // 归一化值
      const normalizedValue = (value - minValue) / (maxValue - minValue);
      
      // 找到对应的颜色区间
      for (let i = 0; i < colorStops.length - 1; i++) {
        const stop1 = colorStops[i];
        const stop2 = colorStops[i + 1];
        
        if (normalizedValue >= stop1.value && normalizedValue <= stop2.value) {
          const localRatio = (normalizedValue - stop1.value) / (stop2.value - stop1.value);
          return [
            Math.round(stop1.color[0] + (stop2.color[0] - stop1.color[0]) * localRatio),
            Math.round(stop1.color[1] + (stop2.color[1] - stop1.color[1]) * localRatio),
            Math.round(stop1.color[2] + (stop2.color[2] - stop1.color[2]) * localRatio),
            opacity
          ];
        }
      }
      
      // 超出范围，使用最近的颜色
      if (normalizedValue < colorStops[0].value) {
        return [...colorStops[0].color, opacity];
      } else {
        return [...colorStops[colorStops.length - 1].color, opacity];
      }
    };
  }
  
  /**
   * Create random color function
   */
  private createRandomColorFunction(opacity: number): (feature: any) => number[] {
    const colorCache = new Map<string, number[]>();
    
    return (feature: any) => {
      const id = feature.properties?.adcode || feature.properties?.name || Math.random();
      
      if (!colorCache.has(id)) {
        colorCache.set(id, [
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          opacity
        ]);
      }
      
      return colorCache.get(id)!;
    };
  }
  
  /**
   * Default fill color function
   */
  private getDefaultFillColor(feature: Feature): number[] {
    // 使用更丰富的颜色方案
    const colors: number[][] = [
      [255, 87, 34, 180],   // 深橙色
      [33, 150, 243, 180],  // 蓝色
      [76, 175, 80, 180],   // 绿色
      [255, 193, 7, 180],   // 琥珀色
      [156, 39, 176, 180],  // 紫色
      [0, 188, 212, 180],   // 青色
      [96, 125, 139, 180],  // 蓝灰色
      [255, 152, 0, 180],   // 橙色
      [63, 81, 181, 180],   // 靓蓝色
      [233, 30, 99, 180],   // 粉红色
      [139, 195, 74, 180],  // 浅绿色
    ];

    const index = feature.properties?.adcode
      ? parseInt(feature.properties.adcode) % colors.length
      : Math.floor(Math.random() * colors.length);

    return colors[index];
  }

  /**
   * Add a layer to the map
   */
  addLayer(layer: DeckGLLayer): void {
    console.log('Adding layer:', layer.id, 'total layers:', this.layers.length + 1);
    this.layers.push(layer);
    this.updateLayers();
  }

  /**
   * Remove a layer by id
   */
  removeLayer(layerId: string): void {
    this.layers = this.layers.filter(layer => layer.id !== layerId);
    // 清理对应的标签配置
    this.layerLabelOptions.delete(layerId);
    this.updateLayers();
  }

  /**
   * Clear all layers
   */
  clearLayers(): void {
    console.log('Clearing all layers...');
    this.layers = [];
    this.layerLabelOptions.clear(); // 清理所有标签配置
    if (this.deck) {
      // 直接设置空层数组
      this.deck.setProps({ layers: [] });
      // 强制重绘
      this.deck.redraw();
    }
    console.log('All layers cleared');
  }

  /**
   * Update deck.gl layers
   */
  private updateLayers(): void {
    if (this.deck) {
      // 获取水波纹图层
      const rippleLayers: any[] = [];
      this.rippleMarkers.forEach(marker => {
        rippleLayers.push(...marker.update());
      });
      
      // 合并地图层和标记层
      const markerLayers = this.markerRenderer.getLayers();
      const allLayers = [...this.layers, ...markerLayers, ...rippleLayers];
      
      // 每次都创建新的层数组确保重绘
      this.deck.setProps({ 
        layers: [...allLayers]
      });
      // 强制立即重绘
      this.deck.redraw();
    } else {
      console.error('Deck not initialized!');
    }
  }

  /**
   * Switch between 2D and 3D mode
   */
  setMode(mode: ViewMode): void {
    this.mode = mode;
    const pitch = mode === '3d' ? 45 : 0;

    this.deck?.setProps({
      initialViewState: {
        ...this.viewState,
        pitch,
        transitionDuration: 1000
      }
    });

    // Re-render layers with new mode
    const currentLayers = [...this.layers];
    this.clearLayers();

    currentLayers.forEach(layer => {
      if (layer.props.data) {
        this.renderGeoJSON(layer.props.data as FeatureCollection, {
          ...layer.props,
          extruded: mode === '3d',
          getElevation: mode === '3d' ? (layer.props.getElevation || 30000) : 0
        } as LayerOptions);
      }
    });
  }

  /**
   * Get current mode
   */
  getMode(): ViewMode {
    return this.mode;
  }

  /**
   * Update view state
   */
  setViewState(viewState: Partial<ViewState>): void {
    this.viewState = { ...this.viewState, ...viewState };
    this.deck?.setProps({
      initialViewState: this.viewState
    });
  }

  /**
   * Fly to specific location
   */
  flyTo(longitude: number, latitude: number, zoom: number = 8): void {
    this.setViewState({
      longitude,
      latitude,
      zoom,
      transitionDuration: 2000
    });
  }

  /**
   * Add text labels for GeoJSON features
   */
  private addTextLabels(geoJson: FeatureCollection, options: LayerOptions = {}): void {
    const labelOptions = options.labelOptions || {};
    
    // 获取当前 zoom 级别用于动态调整文本大小
    const currentZoom = this.viewState.zoom || 8;
    
    // 根据 zoom 计算基础文本大小（zoom 越大，文本越大）
    const baseFontSize = labelOptions.fontSize || 14;
    const zoomFactor = Math.pow(1.15, currentZoom - 8); // 以 zoom=8 为基准，每增加 1 级放大 15%
    const dynamicFontSize = baseFontSize * zoomFactor;
    
    // 获取或创建颜色函数
    let fillColorFunction: any;
    if (options.colorScheme) {
      fillColorFunction = this.createColorFunction(options.colorScheme, geoJson);
    } else if (options.getFillColor) {
      fillColorFunction = options.getFillColor;
    } else {
      fillColorFunction = this.getDefaultFillColor.bind(this);
    }
    
    // 计算每个区域的中心点作为文本位置
    const labelData = geoJson.features?.map((feature, index) => {
      const center = this.calculatePolygonCenter(feature);
      const name = this.getFeatureName(feature);
      
      // 如果颜色设置为 'auto'，计算背景色并选择对比色
      let textColor = labelOptions.getColor;
      if (textColor === 'auto') {
        const bgColor = fillColorFunction(feature, { index });
        textColor = this.getContrastingTextColor(bgColor);
      } else if (!textColor) {
        textColor = [33, 33, 33, 255]; // 默认颜色
      }
      
      return {
        position: center,
        text: name,
        feature,
        color: textColor
      };
    }).filter(item => item.text && item.position) || [];
    
    // 构建中文字符集
    const chineseChars = labelData.map(d => d.text).join('');
    const uniqueChars = Array.from(new Set(chineseChars)).join('');
    
    const textLayer = new TextLayer({
      id: `${options.id || 'geojson-layer'}-labels`,
      data: labelData,
      pickable: labelOptions.pickable !== false,
      getPosition: (d: any) => d.position,
      getText: (d: any) => d.text,
      getSize: labelOptions.getSize || dynamicFontSize,
      getAngle: labelOptions.getAngle || 0,
      getTextAnchor: labelOptions.getTextAnchor || 'middle',
      getAlignmentBaseline: labelOptions.getAlignmentBaseline || 'center',
      getColor: (d: any) => d.color,
      fontFamily: labelOptions.fontFamily || '"Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif',
      fontWeight: labelOptions.fontWeight || '600',
      sizeScale: labelOptions.sizeScale || 1,
      sizeMinPixels: labelOptions.sizeMinPixels || Math.max(8, dynamicFontSize * 0.6),
      sizeMaxPixels: labelOptions.sizeMaxPixels || Math.min(48, dynamicFontSize * 1.8),
      billboard: labelOptions.billboard !== false,  // 3D模式下始终面向相机
      characterSet: labelOptions.characterSet || uniqueChars  // 使用实际的字符集
    } as any);
    
    this.addLayer(textLayer);
  }
  
  /**
   * Calculate the center point of a polygon feature
   */
  private calculatePolygonCenter(feature: Feature): [number, number] | null {
    if (!feature.geometry) return null;
    
    // 优先使用预定义的centroid（质心），因为它更准确
    if (feature.properties) {
      // 优先使用centroid（质心）- 这是区域的真正中心
      if (feature.properties.centroid && Array.isArray(feature.properties.centroid) && feature.properties.centroid.length >= 2) {
        return [feature.properties.centroid[0], feature.properties.centroid[1]];
      }
      // 备用center
      if (feature.properties.center && Array.isArray(feature.properties.center) && feature.properties.center.length >= 2) {
        return [feature.properties.center[0], feature.properties.center[1]];
      }
    }
    
    // 计算几何中心
    let coords: number[][] = [];
    
    if (feature.geometry.type === 'Polygon') {
      coords = (feature.geometry as any).coordinates[0];
    } else if (feature.geometry.type === 'MultiPolygon') {
      // 对于MultiPolygon，使用最大的多边形
      const polygons = (feature.geometry as any).coordinates;
      let maxArea = 0;
      let maxPolygon = polygons[0];
      
      polygons.forEach((polygon: number[][][]) => {
        const area = this.calculatePolygonArea(polygon[0]);
        if (area > maxArea) {
          maxArea = area;
          maxPolygon = polygon;
        }
      });
      
      coords = maxPolygon[0];
    } else if (feature.geometry.type === 'Point') {
      return (feature.geometry as any).coordinates;
    }
    
    if (coords.length === 0) return null;
    
    // 计算质心
    let sumX = 0, sumY = 0;
    let area = 0;
    
    for (let i = 0; i < coords.length - 1; i++) {
      const x0 = coords[i][0];
      const y0 = coords[i][1];
      const x1 = coords[i + 1][0];
      const y1 = coords[i + 1][1];
      const a = x0 * y1 - x1 * y0;
      area += a;
      sumX += (x0 + x1) * a;
      sumY += (y0 + y1) * a;
    }
    
    if (area === 0) {
      // 如果面积为0，返回简单平均值
      const avgX = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
      const avgY = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
      return [avgX, avgY];
    }
    
    area *= 0.5;
    const centerX = sumX / (6.0 * area);
    const centerY = sumY / (6.0 * area);
    
    return [centerX, centerY];
  }
  
  /**
   * Calculate polygon area for finding the largest polygon
   */
  private calculatePolygonArea(coords: number[][]): number {
    let area = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      area += coords[i][0] * coords[i + 1][1] - coords[i + 1][0] * coords[i][1];
    }
    return Math.abs(area / 2);
  }
  
  /**
   * Get feature name from properties
   */
  private getFeatureName(feature: Feature): string {
    if (!feature.properties) return '';
    
    // 尝试不同的属性名称
    const nameFields = ['name', 'NAME', 'adm1_name', 'label', 'LABEL', 'title', 'TITLE'];
    
    for (const field of nameFields) {
      if (feature.properties[field]) {
        return String(feature.properties[field]);
      }
    }
    
    return '';
  }
  
  /**
   * Add city markers (deprecated - use addMarker instead)
   */
  addCityMarkers(cities: CityMarker[], options: CityMarkerOptions = {}): void {
    const layer = new ScatterplotLayer({
      id: options.id || 'city-markers',
      data: cities,
      pickable: options.pickable !== false,
      opacity: options.opacity || 0.8,
      stroked: options.stroked !== false,
      filled: options.filled !== false,
      radiusScale: options.radiusScale || 1,
      radiusMinPixels: options.radiusMinPixels || 3,
      radiusMaxPixels: options.radiusMaxPixels || 100,
      lineWidthMinPixels: options.lineWidthMinPixels || 1,
      getPosition: options.getPosition || ((d: CityMarker) => 
        d.coordinates || [d.longitude!, d.latitude!]),
      getRadius: options.getRadius || ((d: CityMarker) => d.radius || 5000),
      getFillColor: options.getFillColor || ((d: CityMarker) => 
        d.color || [255, 140, 0, 200]),
      getLineColor: options.getLineColor || [255, 255, 255, 200]
    } as any);

    this.addLayer(layer);
  }
  
  /**
   * Add a single marker to the map
   */
  addMarker(marker: MarkerOptions): string {
    const markerId = this.markerRenderer.addMarker(marker);
    this.updateLayers();
    
    // 如果有水波纹动画，启动动画循环
    if (marker.animation === 'ripple') {
      this.startAnimationLoop();
    }
    
    return markerId;
  }
  
  /**
   * 启动动画循环
   */
  private startAnimationLoop(): void {
    if (this.animationFrameId !== null) return;
    
    console.log('MapRenderer: Starting animation loop');
    let frameCount = 0;
    
    const animate = () => {
      frameCount++;
      // 每秒打印一次（假设60fps）
      if (frameCount % 60 === 0) {
        console.log(`MapRenderer: Animation frame ${frameCount}, updating layers...`);
        console.log(`RippleMarkers count: ${this.rippleMarkers.size}`);
      }
      
      this.updateLayers();
      
      // 检查是否有水波纹标记或动画标记
      const hasRippleMarkers = this.rippleMarkers.size > 0;
      const hasAnimatedMarkers = this.markerRenderer.getAllMarkers()
        .some(m => m.animation && m.animation !== 'none');
      
      if (hasRippleMarkers || hasAnimatedMarkers) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        console.log('MapRenderer: Stopping animation loop - no animated markers');
        this.stopAnimationLoop();
      }
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }
  
  /**
   * 停止动画循环
   */
  private stopAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Add multiple markers to the map
   */
  addMarkers(markers: MarkerOptions[]): string[] {
    const markerIds = this.markerRenderer.addMarkers(markers);
    this.updateLayers();
    
    // 检查是否有水波纹动画
    if (markers.some(m => m.animation === 'ripple')) {
      this.startAnimationLoop();
    }
    
    return markerIds;
  }
  
  /**
   * Add a marker group
   */
  addMarkerGroup(group: MarkerGroupOptions): void {
    this.markerRenderer.addMarkerGroup(group);
    this.updateLayers();
  }
  
  /**
   * Update a marker
   */
  updateMarker(markerId: string, updates: Partial<MarkerOptions>): void {
    this.markerRenderer.updateMarker(markerId, updates);
    this.updateLayers();
  }
  
  /**
   * Remove a marker
   */
  removeMarker(markerId: string): void {
    this.markerRenderer.removeMarker(markerId);
    this.updateLayers();
  }
  
  /**
   * Remove a marker group
   */
  removeMarkerGroup(groupId: string): void {
    this.markerRenderer.removeMarkerGroup(groupId);
    this.updateLayers();
  }
  
  /**
   * Clear all markers
   */
  clearMarkers(): void {
    this.stopAnimationLoop();
    this.markerRenderer.clearMarkers();
    this.updateLayers();
  }
  
  /**
   * Get a marker by ID
   */
  getMarker(markerId: string): MarkerOptions | undefined {
    return this.markerRenderer.getMarker(markerId);
  }
  
  /**
   * Get all markers
   */
  getAllMarkers(): MarkerOptions[] {
    return this.markerRenderer.getAllMarkers();
  }
  
  /**
   * Find markers by condition
   */
  findMarkers(predicate: (marker: MarkerOptions) => boolean): MarkerOptions[] {
    return this.markerRenderer.findMarkers(predicate);
  }
  
  /**
   * Set marker visibility
   */
  setMarkerVisibility(markerId: string, visible: boolean): void {
    this.markerRenderer.setMarkerVisibility(markerId, visible);
    this.updateLayers();
  }
  
  /**
   * Highlight a marker
   */
  highlightMarker(markerId: string, highlightColor?: number[]): void {
    this.markerRenderer.highlightMarker(markerId, highlightColor);
    this.updateLayers();
  }
  
  /**
   * Unhighlight a marker
   */
  unhighlightMarker(markerId: string): void {
    this.markerRenderer.unhighlightMarker(markerId);
    this.updateLayers();
  }
  
  /**
   * 添加水波纹标记点
   * @param id 标记ID
   * @param longitude 经度
   * @param latitude 纬度
   * @param color 颜色 [R, G, B]
   * @param options 其他选项
   */
  addRippleMarker(
    id: string,
    longitude: number,
    latitude: number,
    color?: [number, number, number],
    options?: {
      baseRadius?: number;
      rippleCount?: number;
      animationSpeed?: number;
    }
  ): void {
    // 创建水波纹标记
    const rippleMarker = createRippleMarker(id, longitude, latitude, color, options);
    
    // 保存到集合中
    this.rippleMarkers.set(id, rippleMarker);
    
    // 启动动画循环
    if (this.animationFrameId === null) {
      this.startAnimationLoop();
    }
    
    // 立即更新层
    this.updateLayers();
  }
  
  /**
   * 批量添加水波纹标记
   */
  addRippleMarkers(
    markers: Array<{
      id: string;
      longitude: number;
      latitude: number;
      color?: [number, number, number];
      options?: {
        baseRadius?: number;
        rippleCount?: number;
        animationSpeed?: number;
      };
    }>
  ): void {
    markers.forEach(({ id, longitude, latitude, color, options }) => {
      const rippleMarker = createRippleMarker(id, longitude, latitude, color, options);
      this.rippleMarkers.set(id, rippleMarker);
    });
    
    // 启动动画循环
    if (this.animationFrameId === null) {
      this.startAnimationLoop();
    }
    
    // 更新层
    this.updateLayers();
  }
  
  /**
   * 移除水波纹标记
   */
  removeRippleMarker(id: string): void {
    this.rippleMarkers.delete(id);
    this.updateLayers();
    
    // 如果没有水波纹标记了，停止动画循环
    if (this.rippleMarkers.size === 0) {
      const hasAnimatedMarkers = this.markerRenderer.getAllMarkers()
        .some(m => m.animation && m.animation !== 'none');
      
      if (!hasAnimatedMarkers) {
        this.stopAnimationLoop();
      }
    }
  }
  
  /**
   * 清除所有水波纹标记
   */
  clearRippleMarkers(): void {
    this.rippleMarkers.clear();
    this.updateLayers();
    
    // 检查是否还有其他动画标记
    const hasAnimatedMarkers = this.markerRenderer.getAllMarkers()
      .some(m => m.animation && m.animation !== 'none');
    
    if (!hasAnimatedMarkers) {
      this.stopAnimationLoop();
    }
  }

  /**
   * Calculate optimal view state based on container dimensions
   */
  private calculateOptimalViewState(width: number, height: number): Partial<ViewState> {
    const aspectRatio = width / height;
    
    // 广州市的地理中心
    let longitude = 113.28;
    let latitude = 23.13;
    let zoom = 8.8;
    
    // 根据容器尺寸调整缩放级别
    if (width < 800) {
      zoom = 8.2;
    } else if (width < 1200) {
      zoom = 8.5;
    } else if (width < 1600) {
      zoom = 8.8;
    } else {
      zoom = 9.0;
    }
    
    // 根据宽高比进一步调整
    if (aspectRatio > 1.5) {
      zoom -= 0.2;
    } else if (aspectRatio < 0.8) {
      zoom += 0.2;
    }
    
    return { longitude, latitude, zoom };
  }
  
  /**
   * Calculate bounds of GeoJSON data
   */
  private calculateGeoJsonBounds(geoJson: FeatureCollection): void {
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    geoJson.features?.forEach(feature => {
      if (feature.geometry && feature.geometry.type === 'Polygon') {
        const coordinates = (feature.geometry as any).coordinates[0];
        coordinates.forEach((coord: number[]) => {
          minLng = Math.min(minLng, coord[0]);
          maxLng = Math.max(maxLng, coord[0]);
          minLat = Math.min(minLat, coord[1]);
          maxLat = Math.max(maxLat, coord[1]);
        });
      } else if (feature.geometry && feature.geometry.type === 'MultiPolygon') {
        const polygons = (feature.geometry as any).coordinates;
        polygons.forEach((polygon: number[][][]) => {
          polygon[0].forEach((coord: number[]) => {
            minLng = Math.min(minLng, coord[0]);
            maxLng = Math.max(maxLng, coord[0]);
            minLat = Math.min(minLat, coord[1]);
            maxLat = Math.max(maxLat, coord[1]);
          });
        });
      }
    });
    
    this.geoJsonBounds = { minLng, maxLng, minLat, maxLat };
  }
  
  /**
   * Fit view to GeoJSON bounds with proper padding
   */
  private fitToGeoJson(): void {
    if (!this.geoJsonBounds) return;
    
    const { minLng, maxLng, minLat, maxLat } = this.geoJsonBounds;
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;
    
    // 获取容器尺寸
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || this.container.offsetWidth || 800;
    const height = rect.height || this.container.offsetHeight || 600;
    
    // 计算 GeoJSON 边界的实际距离（经度和纬度）
    const lngDiff = maxLng - minLng;
    const latDiff = maxLat - minLat;
    
    // 添加 10% 的 padding 确保地图不被裁剪
    const paddingFactor = 0.1;
    const lngPadding = lngDiff * paddingFactor;
    const latPadding = latDiff * paddingFactor;
    
    const paddedLngDiff = lngDiff + 2 * lngPadding;
    const paddedLatDiff = latDiff + 2 * latPadding;
    
    // 计算容器的宽高比
    const containerAspect = width / height;
    
    // 计算数据的宽高比（考虑纬度压缩）
    // 在中纬度，经度和纬度的实际距离比例约为 cos(latitude)
    const avgLat = (minLat + maxLat) / 2;
    const cosLat = Math.cos((avgLat * Math.PI) / 180);
    const dataAspect = (paddedLngDiff * cosLat) / paddedLatDiff;
    
    // 根据宽高比决定缩放策略
    let zoom: number;
    if (dataAspect > containerAspect) {
      // 数据更宽，基于宽度计算 zoom
      // deck.gl 的 zoom 级别和像素关系：pixels = 512 * 2^zoom * degrees / 360
      zoom = Math.log2((width * 360) / (paddedLngDiff * 512 * cosLat));
    } else {
      // 数据更高，基于高度计算 zoom
      zoom = Math.log2((height * 360) / (paddedLatDiff * 512));
    }
    
    // 不需要额外减小缩放级别
    // zoom = zoom - 0.5;  // 移除额外的缩放调整
    
    // 限制 zoom 的范围，避免过度缩放
    zoom = Math.max(1, Math.min(20, zoom));
    
    console.log('Fitting to GeoJSON:', {
      bounds: this.geoJsonBounds,
      center: [centerLng, centerLat],
      zoom,
      containerSize: { width, height },
      dataSize: { lngDiff, latDiff },
      paddedSize: { paddedLngDiff, paddedLatDiff }
    });
    
    // 直接设置视口，不使用延迟
    this.setViewState({ 
      longitude: centerLng, 
      latitude: centerLat, 
      zoom,
      transitionDuration: 0  // 初始化时不使用动画
    });
  }
  
  /**
   * Resize the map
   */
  resize(): void {
    if (this.deck) {
      const width = this.container.offsetWidth || this.container.clientWidth;
      const height = this.container.offsetHeight || this.container.clientHeight;
      
      // 确保容器有有效尺寸
      if (width > 0 && height > 0) {
        this.deck.setProps({
          width,
          height
        });
        
        // 触发重绘
        this.deck.redraw();
        
        // 如果启用自动适配，重新计算最佳视口
        if (this.autoFit) {
          if (this.geoJsonBounds) {
            this.fitToGeoJson();
          } else {
            const optimalViewState = this.calculateOptimalViewState(width, height);
            this.setViewState(optimalViewState);
          }
        }
      }
    }
  }

  /**
   * Destroy the map renderer
   */
  destroy(): void {
    if (this.deck) {
      this.deck.finalize();
      this.deck = null;
    }
    this.layers = [];
  }

  /**
   * Get deck instance (for advanced usage)
   */
  getDeck(): Deck | null {
    return this.deck;
  }

  /**
   * Get all layers
   */
  getLayers(): DeckGLLayer[] {
    return [...this.layers];
  }
  
  /**
   * Update zoom settings
   */
  setZoomOptions(options: {
    smoothZoom?: boolean;
    zoomSpeed?: number;
    transitionDuration?: number;
    inertia?: boolean;
  }): void {
    if (options.smoothZoom !== undefined) {
      this.smoothZoom = options.smoothZoom;
    }
    if (options.zoomSpeed !== undefined) {
      this.zoomSpeed = options.zoomSpeed;
    }
    if (options.transitionDuration !== undefined) {
      this.transitionDuration = options.transitionDuration;
    }
    if (options.inertia !== undefined) {
      this.inertia = options.inertia;
    }
    
    // 重新配置 controller
    if (this.deck) {
      const controllerOptions: any = {
        scrollZoom: false,  // 默认禁用，由mouseenter/mouseleave控制
        touchZoom: true,
        touchRotate: true,
        doubleClickZoom: true,
        keyboard: true,
        inertia: this.inertia ? 300 : 0,
        dragPan: true,
        dragRotate: this.mode === '3d',
        transitionDuration: this.smoothZoom ? this.transitionDuration : 0,
        transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3)
      };
      
      this.deck.setProps({ controller: controllerOptions });
    }
  }
  
  /**
   * Get current zoom settings
   */
  getZoomOptions(): {
    smoothZoom: boolean;
    zoomSpeed: number;
    transitionDuration: number;
    inertia: boolean;
  } {
    return {
      smoothZoom: this.smoothZoom,
      zoomSpeed: this.zoomSpeed,
      transitionDuration: this.transitionDuration,
      inertia: this.inertia
    };
  }
  
  /**
   * Set selection mode
   */
  setSelectionMode(mode: SelectionMode): void {
    this.selectionMode = mode;
  }
  
  /**
   * Get current selection mode
   */
  getSelectionMode(): SelectionMode {
    return this.selectionMode;
  }
  
  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selectedFeatures.clear();
    this.updateSelectionLayers();
    
    if (this.onSelectCallback) {
      this.onSelectCallback([]);
    }
  }
  
  /**
   * Get selected features
   */
  getSelectedFeatures(): Feature[] {
    return this.getSelectedFeaturesList();
  }
  
  /**
   * Select features by IDs
   */
  selectFeatures(featureIds: string[]): void {
    if (this.selectionMode === 'single' && featureIds.length > 1) {
      console.warn('Selection mode is single, only first feature will be selected');
      this.selectedFeatures.clear();
      this.selectedFeatures.add(featureIds[0]);
    } else {
      if (this.selectionMode === 'single') {
        this.selectedFeatures.clear();
      }
      featureIds.forEach(id => this.selectedFeatures.add(id));
    }
    
    this.updateSelectionLayers();
    
    if (this.onSelectCallback) {
      const selectedFeaturesList = this.getSelectedFeaturesList();
      this.onSelectCallback(selectedFeaturesList);
    }
  }
  
  /**
   * Update selection style
   */
  setSelectionStyle(style: Partial<SelectionStyle>): void {
    this.selectionStyle = {
      ...this.selectionStyle,
      ...style
    };
    this.updateSelectionLayers();
  }
  
  /**
   * Show or hide text labels for a specific layer
   */
  toggleLabels(layerId: string, show: boolean): void {
    const labelLayerId = `${layerId}-labels`;
    
    if (!show) {
      // 隐藏标签
      this.removeLayer(labelLayerId);
    } else {
      // 显示标签（需要重新添加）
      const geoJsonLayer = this.layers.find(layer => layer.id === layerId);
      if (geoJsonLayer && geoJsonLayer.props.data) {
        this.addTextLabels(geoJsonLayer.props.data as FeatureCollection, {
          id: layerId
        });
      }
    }
  }
  
  /**
   * Update label style for a specific layer
   */
  updateLabelStyle(layerId: string, labelOptions: TextLabelOptions): void {
    const labelLayerId = `${layerId}-labels`;
    const labelLayer = this.layers.find(layer => layer.id === labelLayerId);
    
    if (labelLayer) {
      // 移除旧的标签层
      this.removeLayer(labelLayerId);
      
      // 找到对应的GeoJSON层
      const geoJsonLayer = this.layers.find(layer => layer.id === layerId);
      if (geoJsonLayer && geoJsonLayer.props.data) {
        // 添加新的标签层
        this.addTextLabels(geoJsonLayer.props.data as FeatureCollection, {
          id: layerId,
          labelOptions
        });
      }
    }
  }
  
  
  /**
   * Update color scheme for a specific layer
   * This allows changing the color scheme without re-rendering the entire layer
   */
  updateColorScheme(layerId: string, colorScheme: ColorScheme): void {
    console.log(`Updating color scheme for layer ${layerId}...`);
    
    // 找到对应的 GeoJSON 层
    const geoJsonLayer = this.layers.find(layer => layer.id === layerId);
    
    if (!geoJsonLayer || !geoJsonLayer.props.data) {
      console.error(`Layer ${layerId} not found or has no data`);
      return;
    }
    
    // 获取原始数据和配置
    const geoJsonData = geoJsonLayer.props.data as FeatureCollection;
    const originalProps = geoJsonLayer.props;
    
    // 创建新的颜色函数
    const newFillColor = this.createColorFunction(colorScheme, geoJsonData);
    
    // 创建新的 layer（保留所有原有配置，只更新颜色）
    const newLayer = new GeoJsonLayer({
      ...originalProps,
      id: layerId,
      data: geoJsonData,
      getFillColor: newFillColor,
      updateTriggers: {
        getFillColor: Date.now() // 强制更新颜色
      }
    } as any);
    
    // 替换旧层
    const layerIndex = this.layers.findIndex(layer => layer.id === layerId);
    if (layerIndex !== -1) {
      this.layers[layerIndex] = newLayer;
      
      // 更新保存的配色方案
      const savedConfig = this.layerLabelOptions.get(layerId);
      if (savedConfig) {
        savedConfig.colorScheme = colorScheme;
      }
      
      // 同时更新文本标签层（如果存在）
      const labelLayerId = `${layerId}-labels`;
      const labelLayer = this.layers.find(layer => layer.id === labelLayerId);
      if (labelLayer) {
        // 移除旧标签层
        const labelIndex = this.layers.findIndex(layer => layer.id === labelLayerId);
        if (labelIndex !== -1) {
          this.layers.splice(labelIndex, 1);
        }
        // 重新添加标签层，使用新的配色方案
        this.addTextLabels(geoJsonData, {
          id: layerId,
          colorScheme: colorScheme,
          labelOptions: originalProps.labelOptions || { getColor: 'auto' }
        });
      }
      
      this.updateLayers();
      console.log(`Color scheme updated for layer ${layerId}`);
    }
  }
}
