/**
 * 饼图配置生成器
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series } = parsedData;

    // 饼图使用第一个系列的数据
    const data = (xData || []).map((name, index) => ({
      name: String(name),
      value: series[0]?.[index] || 0,
    }));

    const dataset = config.datasets?.[0] || {};

    return {
      series: [
        {
          type: 'pie',
          radius: dataset.radius || ['0%', '75%'],
          center: dataset.center || ['50%', '50%'],
          data,
          label: {
            show: true,
            formatter: '{b}: {c} ({d}%)',
            ...(dataset.label || {}),
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          ...dataset,
        },
      ],
    };
  },
};

