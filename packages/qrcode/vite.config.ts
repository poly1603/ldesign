import { createPackageViteConfig } from '@ldesign/builder'

export default createPackageViteConfig({
  enableCSS: false, // qrcode包不需要CSS处理
  external: ['vue', 'qrcode'],
  globals: {
    vue: 'Vue',
    qrcode: 'QRCode',
  }
})
