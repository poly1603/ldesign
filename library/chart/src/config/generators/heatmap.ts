/**
 * 热力图配置生成器
 */

import type { ParsedChartData, SmartChartConfig, EChartsOption } from '../../types';

export default {
  generate(parsedData: ParsedChartData, config: SmartChartConfig): EChartsOption {
    const { xData, series } = parsedData;
    const dataset = config.datasets?.[0] || {};

    // 将数据转换为热力图格式 [x, y, value]
    const heatmapData: any[] = [];
    const yLabels = dataset.yLabels || series.map((_, i) => `Y${i + 1}`);

    series.forEach((row, yIndex) => {
      row.forEach((value, xIndex) => {
        heatmapData.push([xIndex, yIndex, value]);
      });
    });

    return {
      xAxis: config.xAxis || {
        type: 'category',
        data: xData,
        splitArea: {
          show: true,
        },
      },
      yAxis: config.yAxis || {
        type: 'category',
        data: yLabels,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: dataset.min || Math.min(...heatmapData.map(d => d[2])),
        max: dataset.max || Math.max(...heatmapData.map(d => d[2])),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%',
        ...(dataset.visualMap || {}),
      },
      series: [
        {
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          ...dataset,
        },
      ],
    };
  },
};

