/**
 * Angular QR Code Module
 * 提供完整的Angular集成支持
 */

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { QRCodeComponent } from './qrcode.component'
import { QRCodeService } from './qrcode.service'

/**
 * QR Code Module for Angular
 * 
 * @example
 * ```typescript
 * // 在AppModule中导入
 * import { QRCodeModule } from '@ldesign/qrcode/angular'
 * 
 * @NgModule({
 *   imports: [
 *     QRCodeModule
 *   ]
 * })
 * export class AppModule { }
 * 
 * // 在组件中使用
 * @Component({
 *   template: `
 *     <qr-code 
 *       text="Hello World"
 *       [size]="200"
 *       format="canvas">
 *     </qr-code>
 *   `
 * })
 * export class MyComponent { }
 * ```
 */
@NgModule({
  declarations: [
    QRCodeComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    QRCodeService
  ],
  exports: [
    QRCodeComponent
  ]
})
export class QRCodeModule { }
