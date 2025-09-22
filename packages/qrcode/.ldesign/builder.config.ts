export default {
  // 生成类型声明文件
  dts: true,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 压缩代码
  minify: true,

  // 输出格式
  formats: ['esm', 'cjs'],

  // 外部依赖
  external: ['vue', 'qrcode', 'jszip'],

  // UMD 格式的全局变量映射
  globals: {
    'vue': 'Vue',
    'qrcode': 'QRCode',
    'jszip': 'JSZip'
  },

  // UMD 格式的库名称
  name: 'LDesignQRCode',

  // 禁用 UMD 构建
  umd: {
    enabled: false
  },

  // external、globals、libraryType、formats、plugins 等配置将由 @ldesign/builder 自动检测和生成
}
