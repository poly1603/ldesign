/**
 * 柱状图配置生成器
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series, seriesNames } = parsedData;

    return {
      xAxis: config.xAxis || {
        type: 'category',
        data: xData,
      },
      yAxis: config.yAxis || {
        type: 'value',
      },
      series: series.map((data, index) => {
        const dataset = config.datasets?.[index] || {};
        return {
          name: seriesNames[index],
          type: 'bar',
          data,
          barMaxWidth: dataset.barMaxWidth || 50,
          barGap: dataset.barGap || '30%',
          stack: dataset.stack,
          label: dataset.label,
          ...dataset,
        };
      }),
    };
  },
};

