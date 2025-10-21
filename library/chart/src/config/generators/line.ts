/**
 * 折线图配置生成器
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series, seriesNames } = parsedData;

    return {
      xAxis: config.xAxis || {
        type: parsedData.isTimeSeries ? 'time' : 'category',
        data: parsedData.isTimeSeries ? undefined : xData,
        boundaryGap: false,
      },
      yAxis: config.yAxis || {
        type: 'value',
      },
      series: series.map((data, index) => {
        const dataset = config.datasets?.[index] || {};
        return {
          name: seriesNames[index],
          type: 'line',
          data: parsedData.isTimeSeries
            ? data.map((value, i) => [xData?.[i], value])
            : data,
          smooth: dataset.smooth ?? false,
          symbol: dataset.symbol || 'circle',
          symbolSize: dataset.symbolSize || 6,
          lineStyle: {
            width: 2,
            ...(dataset.lineStyle || {}),
          },
          areaStyle: dataset.areaStyle,
          stack: dataset.stack,
          ...dataset,
        };
      }),
    };
  },
};

