/**
 * K线图配置生成器
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series } = parsedData;
    const dataset = config.datasets?.[0] || {};

    // K线图数据格式: [open, close, lowest, highest]
    const candlestickData = series[0] || [];

    return {
      xAxis: config.xAxis || {
        type: 'category',
        data: xData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
      yAxis: config.yAxis || {
        scale: true,
        splitArea: {
          show: true,
        },
      },
      dataZoom: config.dataZoom !== false ? [
        {
          type: 'inside',
          start: 50,
          end: 100,
        },
        {
          show: true,
          type: 'slider',
          top: '90%',
          start: 50,
          end: 100,
        },
      ] : undefined,
      series: [
        {
          type: 'candlestick',
          data: candlestickData,
          itemStyle: {
            color: dataset.upColor || '#ec0000',
            color0: dataset.downColor || '#00da3c',
            borderColor: dataset.upBorderColor || '#8A0000',
            borderColor0: dataset.downBorderColor || '#008F28',
          },
          ...dataset,
        },
      ],
    };
  },
};

