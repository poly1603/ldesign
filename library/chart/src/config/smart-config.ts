/**
 * 智能配置生成器
 */

import type { SmartChartConfig, ChartConfig, EChartsOption, ParsedChartData } from '../types';
import { DataParser } from '../utils/data-parser';
import { chartLoader } from '../loader/chart-loader';
import { themeManager } from '../themes/manager';
import { deepMerge, isObject } from '../utils/helpers';

/**
 * 智能配置生成器
 */
export class SmartConfigGenerator {
  private parser = new DataParser();

  /**
   * 生成 ECharts 配置
   */
  async generate(config: SmartChartConfig | ChartConfig): Promise<EChartsOption> {
    const { type, data, echarts: customOption } = config;

    // 1. 解析数据
    const parsedData = this.parser.parse(data);

    // 2. 加载对应的配置生成器
    const generator = await chartLoader.loadGenerator(type);

    // 3. 生成基础配置
    const baseOption = generator.generate(parsedData, config);

    // 4. 应用通用配置
    const configuredOption = this.applyCommonConfig(baseOption, config, parsedData);

    // 5. 应用主题
    const themedOption = this.applyTheme(configuredOption, config);

    // 6. 应用字体大小
    const fontOption = this.applyFontSize(themedOption, config);

    // 7. 合并自定义配置
    const mergeStrategy = (config as ChartConfig).mergeStrategy || 'deep-merge';
    const finalOption = this.mergeCustomConfig(fontOption, customOption, mergeStrategy);

    // 8. 优化配置（性能）
    return this.optimizeConfig(finalOption, config);
  }

  /**
   * 应用通用配置
   */
  private applyCommonConfig(
    option: EChartsOption,
    config: SmartChartConfig,
    parsedData: ParsedChartData
  ): EChartsOption {
    const result = { ...option };

    // 标题
    if (config.title) {
      result.title = typeof config.title === 'string'
        ? { text: config.title, left: 'center' }
        : config.title;
    }

    // 图例
    if (config.legend !== false && parsedData.seriesNames.length > 1) {
      result.legend = config.legend === true || config.legend === undefined
        ? { show: true, top: 'bottom' }
        : config.legend;
    }

    // 提示框
    if (config.tooltip !== false) {
      result.tooltip = config.tooltip === true || config.tooltip === undefined
        ? { trigger: 'axis', axisPointer: { type: 'cross' } }
        : config.tooltip;
    }

    // 网格
    if (config.grid) {
      result.grid = config.grid;
    }

    // 数据缩放
    if (config.dataZoom) {
      result.dataZoom = Array.isArray(config.dataZoom)
        ? config.dataZoom
        : config.dataZoom === true
          ? [{ type: 'inside' }, { type: 'slider' }]
          : [config.dataZoom];
    }

    // 工具箱
    if (config.toolbox) {
      result.toolbox = config.toolbox === true
        ? {
          feature: {
            saveAsImage: {},
            dataZoom: {},
            dataView: { readOnly: false },
            restore: {},
          },
        }
        : config.toolbox;
    }

    // 动画
    if (config.animation === false) {
      result.animation = false;
    } else if (isObject(config.animation)) {
      Object.assign(result, config.animation);
    }

    // 颜色
    if (config.color) {
      if (Array.isArray(config.color)) {
        result.color = config.color;
      } else if (isObject(config.color)) {
        // 处理颜色配置对象
        if ((config.color as any).palette) {
          result.color = (config.color as any).palette;
        }
      }
    }

    return result;
  }

  /**
   * 应用主题
   */
  private applyTheme(option: EChartsOption, config: SmartChartConfig): EChartsOption {
    if (!config.theme) return option;

    if (config.darkMode) {
      return themeManager.applyDarkMode(option, true);
    }

    return themeManager.applyTheme(option, config.theme);
  }

  /**
   * 应用字体大小
   */
  private applyFontSize(option: EChartsOption, config: SmartChartConfig): EChartsOption {
    if (!config.fontSize) return option;

    return themeManager.scaleFontSize(option, config.fontSize);
  }

  /**
   * 合并自定义配置
   */
  private mergeCustomConfig(
    baseOption: EChartsOption,
    customOption?: EChartsOption,
    strategy: 'replace' | 'merge' | 'deep-merge' = 'deep-merge'
  ): EChartsOption {
    if (!customOption) return baseOption;

    switch (strategy) {
      case 'replace':
        return customOption;
      case 'merge':
        return { ...baseOption, ...customOption };
      case 'deep-merge':
        return deepMerge(baseOption, customOption);
      default:
        return baseOption;
    }
  }

  /**
   * 优化配置
   */
  private optimizeConfig(option: EChartsOption, config: SmartChartConfig): EChartsOption {
    const optimized = { ...option };

    // 懒加载模式：禁用动画
    if (config.lazy) {
      optimized.animation = false;
    }

    // 虚拟渲染模式：优化大数据集
    if (config.virtual) {
      // 添加 dataZoom 以支持虚拟渲染
      if (!optimized.dataZoom) {
        optimized.dataZoom = [{ type: 'inside' }];
      }
    }

    // Worker 模式：标记数据需要在 Worker 中处理
    if (config.worker) {
      // 添加元数据标记
      (optimized as any)._useWorker = true;
    }

    return optimized;
  }

  /**
   * 验证配置
   */
  validate(config: SmartChartConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.type) {
      errors.push('图表类型 (type) 是必填项');
    }

    if (!config.data) {
      errors.push('图表数据 (data) 是必填项');
    }

    // 验证数据
    if (config.data) {
      const dataValidation = this.parser.validate(config.data);
      if (!dataValidation.valid) {
        errors.push(...dataValidation.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

