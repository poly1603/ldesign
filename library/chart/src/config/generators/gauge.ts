/**
 * 仪表盘配置生成器
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { series } = parsedData;

    // 仪表盘使用第一个数据点的值
    const value = series[0]?.[0] || 0;
    const dataset = config.datasets?.[0] || {};

    return {
      series: [
        {
          type: 'gauge',
          progress: {
            show: true,
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
          },
          data: [
            {
              value,
              name: dataset.name || '进度',
            },
          ],
          min: dataset.min || 0,
          max: dataset.max || 100,
          ...dataset,
        },
      ],
    };
  },
};

