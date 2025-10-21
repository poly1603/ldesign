/**
 * 主题管理器
 */

import type { ThemeConfig, EChartsOption, FontSizeConfig } from '../types';
import { themes, getTheme } from './presets';
import { deepMerge, isObject } from '../utils/helpers';

/**
 * 主题管理器
 */
export class ThemeManager {
  private currentTheme: ThemeConfig | null = null;
  private customThemes = new Map<string, ThemeConfig>();

  /**
   * 注册自定义主题
   */
  registerTheme(name: string, theme: ThemeConfig): void {
    this.customThemes.set(name, theme);
  }

  /**
   * 获取主题
   */
  getTheme(nameOrTheme: string | ThemeConfig): ThemeConfig {
    if (isObject(nameOrTheme)) {
      return nameOrTheme as ThemeConfig;
    }

    // 优先查找自定义主题
    const customTheme = this.customThemes.get(nameOrTheme);
    if (customTheme) {
      return customTheme;
    }

    // 查找预设主题
    const presetTheme = getTheme(nameOrTheme);
    if (presetTheme) {
      return presetTheme;
    }

    // 默认返回亮色主题
    return themes.light;
  }

  /**
   * 应用主题到 ECharts 配置
   */
  applyTheme(option: EChartsOption, theme: string | ThemeConfig): EChartsOption {
    const themeConfig = this.getTheme(theme);
    this.currentTheme = themeConfig;

    return deepMerge(option, this.convertThemeToOption(themeConfig));
  }

  /**
   * 应用暗黑模式
   */
  applyDarkMode(option: EChartsOption, enabled: boolean): EChartsOption {
    const theme = enabled ? themes.dark : themes.light;
    return this.applyTheme(option, theme);
  }

  /**
   * 缩放字体大小
   */
  scaleFontSize(option: EChartsOption, sizeOrConfig: number | FontSizeConfig): EChartsOption {
    if (typeof sizeOrConfig === 'number') {
      // 统一缩放
      return this.scaleUniformFontSize(option, sizeOrConfig);
    } else {
      // 按配置缩放
      return this.scaleCustomFontSize(option, sizeOrConfig);
    }
  }

  /**
   * 统一缩放字体大小
   */
  private scaleUniformFontSize(option: EChartsOption, size: number): EChartsOption {
    const scaled = { ...option };

    // 缩放标题
    if (scaled.title) {
      const title = Array.isArray(scaled.title) ? scaled.title : [scaled.title];
      title.forEach(t => {
        if (t.textStyle) {
          t.textStyle.fontSize = size * 1.5; // 标题放大 1.5 倍
        }
        if (t.subtextStyle) {
          t.subtextStyle.fontSize = size * 1.2; // 副标题放大 1.2 倍
        }
      });
    }

    // 缩放图例
    if (scaled.legend) {
      const legend = Array.isArray(scaled.legend) ? scaled.legend : [scaled.legend];
      legend.forEach(l => {
        if (l.textStyle) {
          l.textStyle.fontSize = size;
        }
      });
    }

    // 缩放坐标轴
    const scaleAxis = (axis: any) => {
      if (axis) {
        const axes = Array.isArray(axis) ? axis : [axis];
        axes.forEach(a => {
          if (a.nameTextStyle) {
            a.nameTextStyle.fontSize = size;
          }
          if (a.axisLabel) {
            a.axisLabel.fontSize = size;
          }
        });
      }
    };

    scaleAxis(scaled.xAxis);
    scaleAxis(scaled.yAxis);

    // 缩放提示框
    if (scaled.tooltip && (scaled.tooltip as any).textStyle) {
      (scaled.tooltip as any).textStyle.fontSize = size;
    }

    return scaled;
  }

  /**
   * 按配置缩放字体大小
   */
  private scaleCustomFontSize(option: EChartsOption, config: FontSizeConfig): EChartsOption {
    const scaled = { ...option };

    // 标题
    if (config.title && scaled.title) {
      const title = Array.isArray(scaled.title) ? scaled.title : [scaled.title];
      title.forEach(t => {
        if (t.textStyle) {
          t.textStyle.fontSize = config.title;
        }
      });
    }

    // 图例
    if (config.legend && scaled.legend) {
      const legend = Array.isArray(scaled.legend) ? scaled.legend : [scaled.legend];
      legend.forEach(l => {
        if (l.textStyle) {
          l.textStyle.fontSize = config.legend;
        }
      });
    }

    // 坐标轴标签
    if (config.axisLabel) {
      const scaleAxisLabel = (axis: any) => {
        if (axis) {
          const axes = Array.isArray(axis) ? axis : [axis];
          axes.forEach(a => {
            if (a.axisLabel) {
              a.axisLabel.fontSize = config.axisLabel;
            }
          });
        }
      };

      scaleAxisLabel(scaled.xAxis);
      scaleAxisLabel(scaled.yAxis);
    }

    // 提示框
    if (config.tooltip && scaled.tooltip && (scaled.tooltip as any).textStyle) {
      (scaled.tooltip as any).textStyle.fontSize = config.tooltip;
    }

    return scaled;
  }

  /**
   * 将主题配置转换为 ECharts 配置
   */
  private convertThemeToOption(theme: ThemeConfig): Partial<EChartsOption> {
    return {
      color: theme.color,
      backgroundColor: theme.backgroundColor,
      textStyle: theme.textStyle,
      title: theme.title,
      legend: {
        textStyle: theme.legend?.textStyle,
      },
      tooltip: theme.tooltip,
    } as any;
  }

  /**
   * 混合多个主题
   */
  mixThemes(...themes: (string | ThemeConfig)[]): ThemeConfig {
    let result = {} as ThemeConfig;

    for (const theme of themes) {
      const themeConfig = this.getTheme(theme);
      result = deepMerge(result, themeConfig);
    }

    return result;
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeConfig | null {
    return this.currentTheme;
  }

  /**
   * 列出所有可用主题
   */
  listThemes(): string[] {
    return [
      ...Object.keys(themes),
      ...Array.from(this.customThemes.keys()),
    ];
  }
}

// 全局主题管理器实例
export const themeManager = new ThemeManager();

