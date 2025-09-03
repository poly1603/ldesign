// svg2ttf模块类型声明文件
declare module 'svg2ttf' {
  interface Svg2TtfOptions {
    copyright?: string
    description?: string
    version?: string
    url?: string
    ts?: number
  }

  interface Svg2TtfResult {
    buffer: Buffer
  }

  function svg2ttf(svgFontString: string, options?: Svg2TtfOptions): Svg2TtfResult

  export = svg2ttf
}
