/**
 * 散点图配置生成器
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series, seriesNames } = parsedData;

    return {
      xAxis: config.xAxis || {
        type: 'value',
        scale: true,
      },
      yAxis: config.yAxis || {
        type: 'value',
        scale: true,
      },
      series: series.map((data, index) => {
        const dataset = config.datasets?.[index] || {};

        // 将数据转换为 [x, y] 格式
        const scatterData = data.map((value, i) => {
          if (Array.isArray(value)) {
            return value;
          }
          return [xData?.[i] || i, value];
        });

        return {
          name: seriesNames[index],
          type: 'scatter',
          data: scatterData,
          symbolSize: dataset.symbolSize || 10,
          label: dataset.label,
          ...dataset,
        };
      }),
    };
  },
};

