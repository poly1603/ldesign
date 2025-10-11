import type { LottieInstance } from './LottieInstance';

/**
 * 颜色映射配置
 */
export interface ColorMap {
  [originalColor: string]: string;
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string;
  /** 颜色映射 */
  colors: ColorMap;
  /** 是否自动应用 */
  autoApply?: boolean;
}

/**
 * 颜色替换选项
 */
export interface ColorReplaceOptions {
  /** 目标图层路径 */
  layerPath?: string;
  /** 是否递归应用到子图层 */
  recursive?: boolean;
  /** 色彩空间 */
  colorSpace?: 'rgb' | 'hsl' | 'hsv';
}

/**
 * 主题管理器
 * 支持动态颜色替换和主题切换
 */
export class ThemeManager {
  private animation: LottieInstance;
  private themes: Map<string, ThemeConfig> = new Map();
  private currentTheme: string | null = null;
  private originalColors: Map<string, any> = new Map();
  private animationData: any = null;

  constructor(animation: LottieInstance) {
    this.animation = animation;
    this.animationData = this.getAnimationData();
    this.extractOriginalColors();
  }

  /**
   * 获取动画数据
   */
  private getAnimationData(): any {
    const renderer = (this.animation as any).renderer;
    return renderer?.animationData || null;
  }

  /**
   * 提取原始颜色
   */
  private extractOriginalColors(): void {
    if (!this.animationData) return;

    const extractFromLayer = (layer: any, path: string = '') => {
      const currentPath = path ? `${path}.${layer.nm}` : layer.nm;

      // 提取形状颜色
      if (layer.shapes) {
        layer.shapes.forEach((shape: any, index: number) => {
          if (shape.it) {
            shape.it.forEach((item: any, itemIndex: number) => {
              if (item.c && item.c.k) {
                const colorPath = `${currentPath}.shapes[${index}].it[${itemIndex}]`;
                this.originalColors.set(colorPath, JSON.parse(JSON.stringify(item.c.k)));
              }
            });
          }
        });
      }

      // 递归处理子图层
      if (layer.layers) {
        layer.layers.forEach((subLayer: any) => {
          extractFromLayer(subLayer, currentPath);
        });
      }
    };

    if (this.animationData.layers) {
      this.animationData.layers.forEach((layer: any) => {
        extractFromLayer(layer);
      });
    }
  }

  /**
   * 注册主题
   */
  public registerTheme(theme: ThemeConfig): void {
    this.themes.set(theme.name, theme);

    if (theme.autoApply && !this.currentTheme) {
      this.applyTheme(theme.name);
    }
  }

  /**
   * 批量注册主题
   */
  public registerThemes(themes: ThemeConfig[]): void {
    themes.forEach((theme) => this.registerTheme(theme));
  }

  /**
   * 应用主题
   */
  public applyTheme(themeName: string): void {
    const theme = this.themes.get(themeName);

    if (!theme) {
      console.warn(`[ThemeManager] Theme "${themeName}" not found`);
      return;
    }

    // 应用颜色映射
    Object.entries(theme.colors).forEach(([original, replacement]) => {
      this.replaceColor(original, replacement);
    });

    this.currentTheme = themeName;
    this.refresh();
  }

  /**
   * 切换主题
   */
  public switchTheme(themeName: string): void {
    // 先重置到原始颜色
    this.resetColors();
    // 再应用新主题
    this.applyTheme(themeName);
  }

  /**
   * 替换单个颜色
   */
  public replaceColor(
    originalColor: string,
    newColor: string,
    options?: ColorReplaceOptions
  ): void {
    if (!this.animationData) return;

    const rgbOriginal = this.parseColor(originalColor);
    const rgbNew = this.parseColor(newColor);

    const replaceInLayer = (layer: any) => {
      // 替换形状颜色
      if (layer.shapes) {
        layer.shapes.forEach((shape: any) => {
          if (shape.it) {
            shape.it.forEach((item: any) => {
              if (item.c && item.c.k) {
                if (this.colorsMatch(item.c.k, rgbOriginal)) {
                  item.c.k = rgbNew;
                }
              }
              if (item.s && item.s.k) {
                if (this.colorsMatch(item.s.k, rgbOriginal)) {
                  item.s.k = rgbNew;
                }
              }
            });
          }
        });
      }

      // 递归处理子图层
      if (options?.recursive !== false && layer.layers) {
        layer.layers.forEach((subLayer: any) => {
          replaceInLayer(subLayer);
        });
      }
    };

    if (this.animationData.layers) {
      this.animationData.layers.forEach((layer: any) => {
        replaceInLayer(layer);
      });
    }
  }

  /**
   * 替换多个颜色
   */
  public replaceColors(colorMap: ColorMap, options?: ColorReplaceOptions): void {
    Object.entries(colorMap).forEach(([original, replacement]) => {
      this.replaceColor(original, replacement, options);
    });
    this.refresh();
  }

  /**
   * 根据图层名称替换颜色
   */
  public replaceColorByLayer(layerName: string, newColor: string): void {
    if (!this.animationData) return;

    const rgbNew = this.parseColor(newColor);

    const findAndReplace = (layer: any): boolean => {
      if (layer.nm === layerName) {
        if (layer.shapes) {
          layer.shapes.forEach((shape: any) => {
            if (shape.it) {
              shape.it.forEach((item: any) => {
                if (item.c && item.c.k) {
                  item.c.k = rgbNew;
                }
              });
            }
          });
        }
        return true;
      }

      if (layer.layers) {
        for (const subLayer of layer.layers) {
          if (findAndReplace(subLayer)) {
            return true;
          }
        }
      }

      return false;
    };

    if (this.animationData.layers) {
      for (const layer of this.animationData.layers) {
        if (findAndReplace(layer)) {
          break;
        }
      }
    }

    this.refresh();
  }

  /**
   * 调整颜色亮度
   */
  public adjustBrightness(factor: number): void {
    if (!this.animationData) return;

    const adjustInLayer = (layer: any) => {
      if (layer.shapes) {
        layer.shapes.forEach((shape: any) => {
          if (shape.it) {
            shape.it.forEach((item: any) => {
              if (item.c && item.c.k && Array.isArray(item.c.k)) {
                item.c.k = item.c.k.map((val: number, idx: number) => {
                  if (idx < 3) {
                    // RGB channels
                    return Math.max(0, Math.min(1, val * factor));
                  }
                  return val; // Alpha channel
                });
              }
            });
          }
        });
      }

      if (layer.layers) {
        layer.layers.forEach((subLayer: any) => {
          adjustInLayer(subLayer);
        });
      }
    };

    if (this.animationData.layers) {
      this.animationData.layers.forEach((layer: any) => {
        adjustInLayer(layer);
      });
    }

    this.refresh();
  }

  /**
   * 调整颜色饱和度
   */
  public adjustSaturation(factor: number): void {
    if (!this.animationData) return;

    const adjustInLayer = (layer: any) => {
      if (layer.shapes) {
        layer.shapes.forEach((shape: any) => {
          if (shape.it) {
            shape.it.forEach((item: any) => {
              if (item.c && item.c.k && Array.isArray(item.c.k)) {
                const [r, g, b, a] = item.c.k;
                const hsl = this.rgbToHsl(r, g, b);
                hsl[1] = Math.max(0, Math.min(1, hsl[1] * factor));
                const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
                item.c.k = [...rgb, a];
              }
            });
          }
        });
      }

      if (layer.layers) {
        layer.layers.forEach((subLayer: any) => {
          adjustInLayer(subLayer);
        });
      }
    };

    if (this.animationData.layers) {
      this.animationData.layers.forEach((layer: any) => {
        adjustInLayer(layer);
      });
    }

    this.refresh();
  }

  /**
   * 应用色调偏移
   */
  public applyHueShift(degrees: number): void {
    if (!this.animationData) return;

    const shiftInLayer = (layer: any) => {
      if (layer.shapes) {
        layer.shapes.forEach((shape: any) => {
          if (shape.it) {
            shape.it.forEach((item: any) => {
              if (item.c && item.c.k && Array.isArray(item.c.k)) {
                const [r, g, b, a] = item.c.k;
                const hsl = this.rgbToHsl(r, g, b);
                hsl[0] = (hsl[0] + degrees / 360) % 1;
                const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
                item.c.k = [...rgb, a];
              }
            });
          }
        });
      }

      if (layer.layers) {
        layer.layers.forEach((subLayer: any) => {
          shiftInLayer(subLayer);
        });
      }
    };

    if (this.animationData.layers) {
      this.animationData.layers.forEach((layer: any) => {
        shiftInLayer(layer);
      });
    }

    this.refresh();
  }

  /**
   * 重置到原始颜色
   */
  public resetColors(): void {
    if (!this.animationData) return;

    // 重新加载动画以恢复原始颜色
    this.animation.destroy();
    // 这里需要重新初始化动画
    this.animationData = this.getAnimationData();
    this.currentTheme = null;
  }

  /**
   * 获取当前主题
   */
  public getCurrentTheme(): string | null {
    return this.currentTheme;
  }

  /**
   * 获取所有主题
   */
  public getAllThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * 获取主题配置
   */
  public getTheme(name: string): ThemeConfig | undefined {
    return this.themes.get(name);
  }

  /**
   * 移除主题
   */
  public removeTheme(name: string): void {
    this.themes.delete(name);
  }

  /**
   * 解析颜色字符串
   */
  private parseColor(color: string): number[] {
    // 处理十六进制颜色
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return [r, g, b, a];
    }

    // 处理 RGB/RGBA
    const rgbMatch = color.match(/rgba?\(([^)]+)\)/);
    if (rgbMatch) {
      const values = rgbMatch[1].split(',').map((v) => parseFloat(v.trim()));
      return [
        values[0] / 255,
        values[1] / 255,
        values[2] / 255,
        values[3] !== undefined ? values[3] : 1,
      ];
    }

    console.warn(`[ThemeManager] Unsupported color format: ${color}`);
    return [0, 0, 0, 1];
  }

  /**
   * 检查两个颜色是否匹配
   */
  private colorsMatch(color1: number[], color2: number[], tolerance: number = 0.01): boolean {
    if (!Array.isArray(color1) || !Array.isArray(color2)) return false;
    if (color1.length !== color2.length) return false;

    for (let i = 0; i < 3; i++) {
      if (Math.abs(color1[i] - color2[i]) > tolerance) {
        return false;
      }
    }

    return true;
  }

  /**
   * RGB 转 HSL
   */
  private rgbToHsl(r: number, g: number, b: number): number[] {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return [h, s, l];
  }

  /**
   * HSL 转 RGB
   */
  private hslToRgb(h: number, s: number, l: number): number[] {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
  }

  /**
   * 刷新动画显示
   */
  private refresh(): void {
    const currentFrame = this.animation.getCurrentFrame();
    this.animation.goToAndStop(currentFrame, true);
  }
}
