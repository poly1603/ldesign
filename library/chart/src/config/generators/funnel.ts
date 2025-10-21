/**
 * 漏斗图配置生成器
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series } = parsedData;
    const dataset = config.datasets?.[0] || {};

    // 漏斗图数据格式
    const data = (xData || []).map((name, index) => ({
      name: String(name),
      value: series[0]?.[index] || 0,
    }));

    return {
      series: [
        {
          type: 'funnel',
          data,
          sort: dataset.sort || 'descending',
          gap: dataset.gap || 2,
          label: {
            show: true,
            position: 'inside',
            ...(dataset.label || {}),
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid',
            },
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
          emphasis: {
            label: {
              fontSize: 20,
            },
          },
          ...dataset,
        },
      ],
    };
  },
};

