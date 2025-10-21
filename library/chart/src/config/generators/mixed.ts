/**
 * 混合图表配置生成器
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series, seriesNames } = parsedData;

    if (!config.datasets || config.datasets.length === 0) {
      throw new Error('混合图表需要指定 datasets 配置，包括每个系列的 type');
    }

    return {
      xAxis: config.xAxis || {
        type: parsedData.isTimeSeries ? 'time' : 'category',
        data: parsedData.isTimeSeries ? undefined : xData,
        boundaryGap: false,
      },
      yAxis: config.yAxis || [
        {
          type: 'value',
          name: '主轴',
          position: 'left',
        },
        {
          type: 'value',
          name: '次轴',
          position: 'right',
        },
      ],
      series: series.map((data, index) => {
        const dataset = config.datasets![index] || {};
        const seriesType = dataset.type || 'line';

        return {
          name: seriesNames[index],
          type: seriesType,
          data: parsedData.isTimeSeries
            ? data.map((value, i) => [xData?.[i], value])
            : data,
          yAxisIndex: dataset.yAxisIndex || 0,
          smooth: dataset.smooth,
          stack: dataset.stack,
          areaStyle: dataset.areaStyle,
          ...dataset,
        };
      }),
    };
  },
};

