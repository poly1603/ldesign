/**
 * 图表类型相关的详细定义
 */

/**
 * 图表类型映射到 ECharts 图表类型
 */
export const ChartTypeMap = {
  line: 'LineChart',
  bar: 'BarChart',
  pie: 'PieChart',
  scatter: 'ScatterChart',
  radar: 'RadarChart',
  effectScatter: 'EffectScatterChart',
  candlestick: 'CandlestickChart',
  boxplot: 'BoxplotChart',
  heatmap: 'HeatmapChart',
  parallel: 'ParallelChart',
  gauge: 'GaugeChart',
  funnel: 'FunnelChart',
  sankey: 'SankeyChart',
  graph: 'GraphChart',
  tree: 'TreeChart',
  treemap: 'TreemapChart',
  sunburst: 'SunburstChart',
  map: 'MapChart',
  lines: 'LinesChart',
  pictorialBar: 'PictorialBarChart',
  themeRiver: 'ThemeRiverChart',
  custom: 'CustomChart',
} as const;

/**
 * 需要的 ECharts 组件映射
 */
export const RequiredComponents = {
  common: ['grid', 'tooltip', 'legend', 'title'],
  line: ['grid', 'tooltip', 'legend', 'title', 'markLine', 'markPoint'],
  bar: ['grid', 'tooltip', 'legend', 'title', 'markLine', 'markPoint'],
  pie: ['tooltip', 'legend', 'title'],
  scatter: ['grid', 'tooltip', 'legend', 'title', 'visualMap'],
  radar: ['tooltip', 'legend', 'title', 'radar'],
  candlestick: ['grid', 'tooltip', 'legend', 'title', 'dataZoom'],
  heatmap: ['grid', 'tooltip', 'visualMap', 'calendar'],
  // 更多类型...
} as const;

/**
 * 图表类型分类
 */
export const ChartCategories = {
  cartesian: ['line', 'bar', 'scatter', 'effectScatter', 'candlestick', 'boxplot'],
  polar: ['pie', 'radar'],
  geographic: ['map', 'lines'],
  tree: ['tree', 'treemap', 'sunburst'],
  graph: ['graph', 'sankey'],
  single: ['gauge', 'funnel'],
} as const;

/**
 * 判断图表类型是否支持坐标轴
 */
export function hasAxis(type: string): boolean {
  return ChartCategories.cartesian.includes(type as any);
}

/**
 * 判断图表类型是否支持多系列
 */
export function supportsMultiSeries(type: string): boolean {
  return ['line', 'bar', 'scatter', 'radar', 'candlestick'].includes(type);
}

/**
 * 获取图表类型的默认配置
 */
export function getChartDefaults(type: string): Record<string, any> {
  const defaults: Record<string, any> = {
    line: {
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
    },
    bar: {
      barMaxWidth: 50,
      barGap: '30%',
    },
    pie: {
      radius: ['0%', '75%'],
      center: ['50%', '50%'],
      label: {
        show: true,
      },
    },
    scatter: {
      symbolSize: 10,
    },
    // 更多默认配置...
  };

  return defaults[type] || {};
}

