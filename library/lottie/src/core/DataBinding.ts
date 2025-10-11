import type { LottieInstance } from './LottieInstance';

/**
 * 数据绑定配置
 */
export interface DataBindingConfig {
  /** 数据路径 */
  path: string;
  /** 目标图层 */
  target: string;
  /** 属性类型 */
  property: 'text' | 'position' | 'scale' | 'rotation' | 'opacity' | 'color';
  /** 数据转换函数 */
  transform?: (value: any) => any;
  /** 格式化函数 */
  formatter?: (value: any) => string;
}

/**
 * 数据驱动动画系统
 * 根据数据动态更新动画内容
 */
export class DataBinding {
  private animation: LottieInstance;
  private bindings: Map<string, DataBindingConfig> = new Map();
  private data: Record<string, any> = {};
  private watchers: Map<string, Array<(value: any) => void>> = new Map();

  constructor(animation: LottieInstance) {
    this.animation = animation;
  }

  /**
   * 绑定数据到动画属性
   */
  public bind(config: DataBindingConfig): void {
    const key = `${config.target}.${config.property}`;
    this.bindings.set(key, config);

    // 如果数据已存在，立即应用
    const value = this.getValueByPath(config.path);
    if (value !== undefined) {
      this.applyBinding(config, value);
    }
  }

  /**
   * 批量绑定
   */
  public bindMany(configs: DataBindingConfig[]): void {
    configs.forEach((config) => this.bind(config));
  }

  /**
   * 更新数据
   */
  public update(path: string, value: any): void {
    this.setValueByPath(path, value);

    // 触发相关绑定
    this.bindings.forEach((config) => {
      if (config.path === path || path.startsWith(config.path + '.')) {
        const bindValue = this.getValueByPath(config.path);
        this.applyBinding(config, bindValue);
      }
    });

    // 触发监听器
    this.triggerWatchers(path, value);
  }

  /**
   * 批量更新数据
   */
  public updateMany(data: Record<string, any>): void {
    Object.entries(data).forEach(([path, value]) => {
      this.update(path, value);
    });
  }

  /**
   * 设置整个数据对象
   */
  public setData(data: Record<string, any>): void {
    this.data = data;

    // 应用所有绑定
    this.bindings.forEach((config) => {
      const value = this.getValueByPath(config.path);
      if (value !== undefined) {
        this.applyBinding(config, value);
      }
    });
  }

  /**
   * 获取数据
   */
  public getData(): Record<string, any> {
    return { ...this.data };
  }

  /**
   * 获取指定路径的值
   */
  public getValue(path: string): any {
    return this.getValueByPath(path);
  }

  /**
   * 监听数据变化
   */
  public watch(path: string, callback: (value: any) => void): () => void {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, []);
    }

    this.watchers.get(path)!.push(callback);

    // 返回取消监听函数
    return () => {
      const callbacks = this.watchers.get(path);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * 移除绑定
   */
  public unbind(target: string, property: string): void {
    const key = `${target}.${property}`;
    this.bindings.delete(key);
  }

  /**
   * 清除所有绑定
   */
  public clearBindings(): void {
    this.bindings.clear();
  }

  /**
   * 清除所有数据
   */
  public clearData(): void {
    this.data = {};
  }

  /**
   * 应用绑定
   */
  private applyBinding(config: DataBindingConfig, value: any): void {
    let transformedValue = value;

    // 应用转换函数
    if (config.transform) {
      transformedValue = config.transform(value);
    }

    // 根据属性类型应用到动画
    switch (config.property) {
      case 'text':
        this.updateText(config.target, config.formatter ? config.formatter(transformedValue) : String(transformedValue));
        break;
      case 'position':
        this.updatePosition(config.target, transformedValue);
        break;
      case 'scale':
        this.updateScale(config.target, transformedValue);
        break;
      case 'rotation':
        this.updateRotation(config.target, transformedValue);
        break;
      case 'opacity':
        this.updateOpacity(config.target, transformedValue);
        break;
      case 'color':
        this.updateColor(config.target, transformedValue);
        break;
    }
  }

  /**
   * 更新文本图层
   */
  private updateText(layerName: string, text: string): void {
    const animationData = (this.animation as any).renderer?.animationData;
    if (!animationData) return;

    const findAndUpdate = (layer: any): boolean => {
      if (layer.nm === layerName && layer.t) {
        // 文本图层
        if (layer.t.d && layer.t.d.k && layer.t.d.k[0]) {
          layer.t.d.k[0].s.t = text;
          return true;
        }
      }

      if (layer.layers) {
        for (const subLayer of layer.layers) {
          if (findAndUpdate(subLayer)) {
            return true;
          }
        }
      }

      return false;
    };

    if (animationData.layers) {
      for (const layer of animationData.layers) {
        if (findAndUpdate(layer)) {
          break;
        }
      }
    }

    this.refresh();
  }

  /**
   * 更新图层位置
   */
  private updatePosition(layerName: string, position: [number, number]): void {
    const animationData = (this.animation as any).renderer?.animationData;
    if (!animationData) return;

    const findAndUpdate = (layer: any): boolean => {
      if (layer.nm === layerName && layer.ks && layer.ks.p) {
        if (layer.ks.p.k) {
          layer.ks.p.k = position;
          return true;
        }
      }

      if (layer.layers) {
        for (const subLayer of layer.layers) {
          if (findAndUpdate(subLayer)) {
            return true;
          }
        }
      }

      return false;
    };

    if (animationData.layers) {
      for (const layer of animationData.layers) {
        if (findAndUpdate(layer)) {
          break;
        }
      }
    }

    this.refresh();
  }

  /**
   * 更新图层缩放
   */
  private updateScale(layerName: string, scale: number | [number, number]): void {
    const animationData = (this.animation as any).renderer?.animationData;
    if (!animationData) return;

    const scaleArray = typeof scale === 'number' ? [scale * 100, scale * 100] : [scale[0] * 100, scale[1] * 100];

    const findAndUpdate = (layer: any): boolean => {
      if (layer.nm === layerName && layer.ks && layer.ks.s) {
        if (layer.ks.s.k) {
          layer.ks.s.k = scaleArray;
          return true;
        }
      }

      if (layer.layers) {
        for (const subLayer of layer.layers) {
          if (findAndUpdate(subLayer)) {
            return true;
          }
        }
      }

      return false;
    };

    if (animationData.layers) {
      for (const layer of animationData.layers) {
        if (findAndUpdate(layer)) {
          break;
        }
      }
    }

    this.refresh();
  }

  /**
   * 更新图层旋转
   */
  private updateRotation(layerName: string, rotation: number): void {
    const animationData = (this.animation as any).renderer?.animationData;
    if (!animationData) return;

    const findAndUpdate = (layer: any): boolean => {
      if (layer.nm === layerName && layer.ks && layer.ks.r) {
        if (layer.ks.r.k !== undefined) {
          layer.ks.r.k = rotation;
          return true;
        }
      }

      if (layer.layers) {
        for (const subLayer of layer.layers) {
          if (findAndUpdate(subLayer)) {
            return true;
          }
        }
      }

      return false;
    };

    if (animationData.layers) {
      for (const layer of animationData.layers) {
        if (findAndUpdate(layer)) {
          break;
        }
      }
    }

    this.refresh();
  }

  /**
   * 更新图层透明度
   */
  private updateOpacity(layerName: string, opacity: number): void {
    const animationData = (this.animation as any).renderer?.animationData;
    if (!animationData) return;

    const opacityValue = Math.max(0, Math.min(100, opacity * 100));

    const findAndUpdate = (layer: any): boolean => {
      if (layer.nm === layerName && layer.ks && layer.ks.o) {
        if (layer.ks.o.k !== undefined) {
          layer.ks.o.k = opacityValue;
          return true;
        }
      }

      if (layer.layers) {
        for (const subLayer of layer.layers) {
          if (findAndUpdate(subLayer)) {
            return true;
          }
        }
      }

      return false;
    };

    if (animationData.layers) {
      for (const layer of animationData.layers) {
        if (findAndUpdate(layer)) {
          break;
        }
      }
    }

    this.refresh();
  }

  /**
   * 更新图层颜色
   */
  private updateColor(layerName: string, color: [number, number, number, number]): void {
    const animationData = (this.animation as any).renderer?.animationData;
    if (!animationData) return;

    const findAndUpdate = (layer: any): boolean => {
      if (layer.nm === layerName && layer.shapes) {
        layer.shapes.forEach((shape: any) => {
          if (shape.it) {
            shape.it.forEach((item: any) => {
              if (item.c && item.c.k) {
                item.c.k = color;
              }
            });
          }
        });
        return true;
      }

      if (layer.layers) {
        for (const subLayer of layer.layers) {
          if (findAndUpdate(subLayer)) {
            return true;
          }
        }
      }

      return false;
    };

    if (animationData.layers) {
      for (const layer of animationData.layers) {
        if (findAndUpdate(layer)) {
          break;
        }
      }
    }

    this.refresh();
  }

  /**
   * 根据路径获取值
   */
  private getValueByPath(path: string): any {
    const keys = path.split('.');
    let value: any = this.data;

    for (const key of keys) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[key];
    }

    return value;
  }

  /**
   * 根据路径设置值
   */
  private setValueByPath(path: string, value: any): void {
    const keys = path.split('.');
    let obj: any = this.data;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in obj)) {
        obj[key] = {};
      }
      obj = obj[key];
    }

    obj[keys[keys.length - 1]] = value;
  }

  /**
   * 触发监听器
   */
  private triggerWatchers(path: string, value: any): void {
    const callbacks = this.watchers.get(path);
    if (callbacks) {
      callbacks.forEach((callback) => callback(value));
    }

    // 触发父路径的监听器
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      const parentCallbacks = this.watchers.get(parentPath);
      if (parentCallbacks) {
        const parentValue = this.getValueByPath(parentPath);
        parentCallbacks.forEach((callback) => callback(parentValue));
      }
    }
  }

  /**
   * 刷新动画显示
   */
  private refresh(): void {
    const currentFrame = this.animation.getCurrentFrame();
    this.animation.goToAndStop(currentFrame, true);
  }
}
