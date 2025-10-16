import { Deck } from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import type { Feature, FeatureCollection } from 'geojson';
import type {
  ViewMode,
  ViewState,
  MapRendererOptions,
  LayerOptions,
  CityMarker,
  CityMarkerOptions,
  TooltipInfo,
  DeckGLLayer,
  ColorScheme,
  ColorMode
} from './types';

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
    this.autoFit = options.autoFit !== false;  // 默认启用自动适配
    
    // 如果启用自动适配，使用智能计算的初始视口
    if (this.autoFit) {
      const autoViewState = this.calculateOptimalViewState(rect.width, rect.height);
      this.viewState = {
        ...autoViewState,
        pitch: this.mode === '3d' ? 45 : 0,
        bearing: 0,
        ...options.viewState
      };
    } else {
      this.viewState = {
        longitude: options.longitude || 113.3,
        latitude: options.latitude || 23.1,
        zoom: options.zoom || 6,
        pitch: this.mode === '3d' ? 45 : 0,
        bearing: 0,
        ...options.viewState
      };
    }

    this.initDeck();
  }

  /**
   * Initialize deck.gl instance
   */
  private initDeck(): void {
    // 确保容器是正确的
    console.log('Init deck with container:', this.container);
    
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || this.container.offsetWidth;
    const height = rect.height || this.container.offsetHeight;
    
    // 使用容器直接初始化
    this.deck = new Deck({
      container: this.container,
      width,
      height,
      initialViewState: this.viewState,
      controller: true,
      layers: this.layers,
      getTooltip: ({ object }: TooltipInfo) => object && {
        html: this.getTooltipHTML(object),
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px'
        }
      },
      onWebGLInitialized: (gl: WebGLRenderingContext) => {
        console.log('WebGL initialized:', gl);
      },
      onLoad: () => {
        console.log('Deck.gl loaded successfully');
      },
      onError: (error: Error) => {
        console.error('Deck.gl error:', error);
      }
    });
    
    console.log('Deck initialized with size:', width, 'x', height);
    console.log('Deck instance:', this.deck);
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
    if (this.autoFit && geoJson.features && geoJson.features.length > 0) {
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

    const layer = new GeoJsonLayer({
      ...defaultOptions,
      ...layerOptions,
      data: geoJson
    } as any);

    this.addLayer(layer);
    
    // 如果启用了显示标签，添加文本层
    if (layerOptions.showLabels !== false) {
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
    const startColor = scheme.startColor || [0, 100, 200, opacity];
    const endColor = scheme.endColor || [200, 100, 0, opacity];
    const featureCount = geoJson.features?.length || 1;
    
    return (feature: any, info?: any) => {
      const index = info?.index || 0;
      const ratio = index / (featureCount - 1);
      
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
        const value = feature.properties?.[dataField];
        if (typeof value === 'number') {
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
      const value = feature.properties?.[dataField];
      if (typeof value !== 'number') {
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
    this.updateLayers();
  }

  /**
   * Clear all layers
   */
  clearLayers(): void {
    this.layers = [];
    this.updateLayers();
    // 触发重绘
    if (this.deck) {
      this.deck.redraw(true);
    }
  }

  /**
   * Update deck.gl layers
   */
  private updateLayers(): void {
    if (this.deck) {
      console.log('Updating deck layers, count:', this.layers.length);
      this.deck.setProps({ layers: this.layers });
      console.log('Deck layers updated');
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
    
    // 计算每个区域的中心点作为文本位置
    const labelData = geoJson.features?.map(feature => {
      const center = this.calculatePolygonCenter(feature);
      const name = this.getFeatureName(feature);
      return {
        position: center,
        text: name,
        feature
      };
    }).filter(item => item.text && item.position) || [];
    
    const textLayer = new TextLayer({
      id: `${options.id || 'geojson-layer'}-labels`,
      data: labelData,
      pickable: labelOptions.pickable !== false,
      getPosition: (d: any) => d.position,
      getText: (d: any) => d.text,
      getSize: labelOptions.getSize || labelOptions.fontSize || 14,
      getAngle: labelOptions.getAngle || 0,
      getTextAnchor: labelOptions.getTextAnchor || 'middle',
      getAlignmentBaseline: labelOptions.getAlignmentBaseline || 'center',
      getColor: labelOptions.getColor || [33, 33, 33, 255],
      fontFamily: labelOptions.fontFamily || '"Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif',
      fontWeight: labelOptions.fontWeight || '600',
      sizeScale: labelOptions.sizeScale || 1,
      sizeMinPixels: labelOptions.sizeMinPixels || 10,
      sizeMaxPixels: labelOptions.sizeMaxPixels || 32,
      billboard: labelOptions.billboard !== false,  // 3D模式下始终面向相机
      characterSet: labelOptions.characterSet || 'auto'
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
   * Add city markers
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
   * Fit view to GeoJSON bounds
   */
  private fitToGeoJson(): void {
    if (!this.geoJsonBounds) return;
    
    const { minLng, maxLng, minLat, maxLat } = this.geoJsonBounds;
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;
    
    // 计算适合的缩放级别
    const lngDiff = maxLng - minLng;
    const latDiff = maxLat - minLat;
    const maxDiff = Math.max(lngDiff, latDiff);
    
    let zoom = 8.8;
    if (maxDiff < 0.5) {
      zoom = 9.5;
    } else if (maxDiff < 1.0) {
      zoom = 9.0;
    } else if (maxDiff < 2.0) {
      zoom = 8.5;
    } else if (maxDiff < 3.0) {
      zoom = 8.0;
    } else {
      zoom = 7.5;
    }
    
    // 考虑容器宽高比
    const rect = this.container.getBoundingClientRect();
    const aspectRatio = rect.width / rect.height;
    if (aspectRatio > 1.5) {
      zoom -= 0.2;
    } else if (aspectRatio < 0.8) {
      zoom += 0.2;
    }
    
    this.setViewState({ longitude: centerLng, latitude: centerLat, zoom });
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
        this.deck.redraw(true);
        
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
}
