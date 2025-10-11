import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // Output format config
  output: {
    format: ['esm', 'cjs', 'umd']
  },

  // 鐢熸垚绫诲瀷澹版槑鏂囦欢
  dts: true,

  // 鐢熸垚 source map
  sourcemap: true,

  // 娓呯悊杈撳嚭鐩綍
  clean: true,

  // 涓嶅帇缂╀唬鐮侊紙寮€鍙戦樁娈碉級
  minify: false

  // external銆乬lobals銆乴ibraryType銆乫ormats銆乸lugins 绛夐厤缃皢鐢?@ldesign/builder 鑷姩妫€娴嬪拰鐢熸垚
})

