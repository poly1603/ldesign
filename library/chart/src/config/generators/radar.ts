/**
 * 雷达图配置生成器
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series, seriesNames } = parsedData;

    // 雷达图指标
    const indicator = (xData || []).map((name) => ({
      name: String(name),
    }));

    return {
      radar: {
        indicator,
        ...(config as any).radar,
      },
      series: [
        {
          type: 'radar',
          data: series.map((data, index) => ({
            name: seriesNames[index],
            value: data,
            ...(config.datasets?.[index] || {}),
          })),
        },
      ],
    };
  },
};

