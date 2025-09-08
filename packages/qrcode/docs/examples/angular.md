# Angular使用示例

## 基础使用

### 模块导入

```typescript
// app.module.ts
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import { QRCodeModule } from '@ldesign/qrcode/angular'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    QRCodeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 组件使用

```typescript
// app.component.ts
import { Component } from '@angular/core'
import { QRCodeResult, QRCodeError } from '@ldesign/qrcode/angular'

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h2>基础二维码</h2>
      <qr-code 
        text="Hello Angular!"
        [size]="200"
        format="canvas">
      </qr-code>
      
      <h2>带下载功能</h2>
      <qr-code 
        [text]="qrText"
        [size]="300"
        format="svg"
        [showDownloadButton]="true"
        downloadButtonText="下载二维码"
        downloadFilename="angular-qrcode"
        (generated)="onGenerated($event)"
        (error)="onError($event)">
      </qr-code>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  qrText = 'https://angular.io'

  onGenerated(result: QRCodeResult) {
    console.log('二维码生成成功:', result)
  }

  onError(error: QRCodeError) {
    console.error('生成失败:', error)
  }
}
```

### 服务使用

```typescript
// qr-service.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { QRCodeService, QRCodeState } from '@ldesign/qrcode/angular'

@Component({
  selector: 'app-qr-service',
  template: `
    <div class="service-example">
      <input 
        [(ngModel)]="inputText" 
        placeholder="输入要生成的文本"
        (keyup.enter)="handleGenerate()"
      />
      
      <div *ngIf="state.loading">生成中...</div>
      <div *ngIf="state.error">错误: {{ state.error.message }}</div>
      <div *ngIf="state.result" #qrContainer></div>
      
      <div class="buttons">
        <button (click)="handleGenerate()" [disabled]="state.loading">
          生成
        </button>
        <button (click)="regenerate()" [disabled]="state.loading">
          重新生成
        </button>
        <button (click)="clearCache()">
          清除缓存
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./qr-service.component.css']
})
export class QRServiceComponent implements OnInit, OnDestroy {
  inputText = 'Hello Angular Service!'
  state: QRCodeState = { result: null, loading: false, error: null }
  
  private subscription?: Subscription

  constructor(private qrCodeService: QRCodeService) {}

  ngOnInit() {
    // 订阅状态变化
    this.subscription = this.qrCodeService.state$.subscribe(state => {
      this.state = state
      
      // 如果有结果，渲染到页面
      if (state.result) {
        this.renderResult(state.result)
      }
    })

    // 初始生成
    this.handleGenerate()
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  handleGenerate() {
    if (this.inputText.trim()) {
      this.qrCodeService.generate(this.inputText, {
        size: 250,
        format: 'canvas',
        color: {
          foreground: '#2563eb',
          background: '#f8fafc'
        }
      }).subscribe({
        next: (result) => {
          console.log('生成成功:', result)
        },
        error: (error) => {
          console.error('生成失败:', error)
        }
      })
    }
  }

  regenerate() {
    this.qrCodeService.regenerate().subscribe()
  }

  clearCache() {
    this.qrCodeService.clearCache()
  }

  private renderResult(result: QRCodeResult) {
    // 这里可以手动渲染结果到指定容器
    // 或者使用组件方式更简单
  }
}
```

## 高级功能

### 响应式二维码组件

```typescript
// responsive-qr.component.ts
import { Component } from '@angular/core'

@Component({
  selector: 'app-responsive-qr',
  template: `
    <div class="qr-container">
      <div class="qr-display">
        <qr-code 
          [text]="dynamicText"
          [size]="qrSize"
          [format]="qrFormat"
          [color]="qrColor"
          [logo]="qrLogo"
          [style]="qrStyle"
          class="responsive-qr">
        </qr-code>
      </div>
      
      <div class="controls">
        <div class="control-group">
          <label>文本内容:</label>
          <textarea 
            [(ngModel)]="dynamicText" 
            rows="3">
          </textarea>
        </div>
        
        <div class="control-group">
          <label>尺寸: {{ qrSize }}px</label>
          <input 
            type="range" 
            [(ngModel)]="qrSize" 
            min="100" 
            max="500" 
            step="10"
          />
        </div>
        
        <div class="control-group">
          <label>格式:</label>
          <select [(ngModel)]="qrFormat">
            <option value="canvas">Canvas</option>
            <option value="svg">SVG</option>
            <option value="image">Image</option>
          </select>
        </div>
        
        <div class="control-group">
          <label>前景色:</label>
          <input type="color" [(ngModel)]="foregroundColor" />
        </div>
        
        <div class="control-group">
          <label>背景色:</label>
          <input type="color" [(ngModel)]="backgroundColor" />
        </div>
        
        <div class="control-group">
          <label>
            <input type="checkbox" [(ngModel)]="enableLogo" />
            启用Logo
          </label>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./responsive-qr.component.css']
})
export class ResponsiveQRComponent {
  dynamicText = 'https://angular.io'
  qrSize = 300
  qrFormat: 'canvas' | 'svg' | 'image' = 'svg'
  foregroundColor = '#000000'
  backgroundColor = '#ffffff'
  enableLogo = false

  get qrColor() {
    return {
      foreground: this.foregroundColor,
      background: this.backgroundColor
    }
  }

  get qrLogo() {
    return this.enableLogo ? {
      src: '/assets/logo.png',
      size: this.qrSize * 0.2,
      shape: 'circle' as const
    } : undefined
  }

  get qrStyle() {
    return {
      dotStyle: 'rounded' as const,
      cornerStyle: 'circle' as const
    }
  }
}
```

### 批量生成组件

```typescript
// batch-generator.component.ts
import { Component } from '@angular/core'
import { QRCodeService, createQRCodeService } from '@ldesign/qrcode/angular'

interface BatchItem {
  text: string
  result?: any
  loading?: boolean
  error?: string
}

@Component({
  selector: 'app-batch-generator',
  template: `
    <div class="batch-generator">
      <h2>批量二维码生成</h2>
      
      <div class="input-section">
        <textarea 
          [(ngModel)]="textList"
          placeholder="每行一个文本，将生成对应的二维码"
          rows="6">
        </textarea>
        
        <div class="options">
          <label>
            尺寸:
            <input type="number" [(ngModel)]="batchSize" min="100" max="500" />
          </label>
          
          <label>
            格式:
            <select [(ngModel)]="batchFormat">
              <option value="canvas">Canvas</option>
              <option value="svg">SVG</option>
            </select>
          </label>
          
          <button (click)="generateBatch()" [disabled]="generating">
            {{ generating ? '生成中...' : '批量生成' }}
          </button>
        </div>
      </div>
      
      <div class="results" *ngIf="batchResults.length > 0">
        <h3>生成结果 ({{ batchResults.length }}个)</h3>
        <div class="qr-grid">
          <div 
            *ngFor="let item of batchResults; let i = index" 
            class="qr-item">
            <qr-code 
              [text]="item.text"
              [size]="batchSize"
              [format]="batchFormat"
              [showDownloadButton]="true"
              [downloadFilename]="'qrcode-' + (i + 1)">
            </qr-code>
            <p class="qr-text">{{ item.text }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./batch-generator.component.css']
})
export class BatchGeneratorComponent {
  textList = `https://angular.io
https://github.com/angular/angular
https://cli.angular.io
https://material.angular.io`

  batchSize = 150
  batchFormat: 'canvas' | 'svg' = 'svg'
  generating = false
  batchResults: BatchItem[] = []

  async generateBatch() {
    const texts = this.textList
      .split('\n')
      .map(text => text.trim())
      .filter(text => text.length > 0)
    
    if (texts.length === 0) return
    
    this.generating = true
    this.batchResults = []
    
    try {
      // 创建独立的服务实例进行批量生成
      const promises = texts.map(async (text) => {
        const service = createQRCodeService({
          size: this.batchSize,
          format: this.batchFormat
        })
        
        try {
          const result = await service.generate(text).toPromise()
          return { text, result }
        } catch (error) {
          return { text, error: error.message }
        } finally {
          service.ngOnDestroy()
        }
      })
      
      const results = await Promise.all(promises)
      this.batchResults = results
    } catch (error) {
      console.error('批量生成失败:', error)
    } finally {
      this.generating = false
    }
  }
}
```

### 自定义指令

```typescript
// qr-code.directive.ts
import { 
  Directive, 
  Input, 
  ElementRef, 
  OnInit, 
  OnDestroy, 
  OnChanges,
  SimpleChanges 
} from '@angular/core'
import { QRCodeService, createQRCodeService } from '@ldesign/qrcode/angular'

@Directive({
  selector: '[appQrCode]'
})
export class QRCodeDirective implements OnInit, OnDestroy, OnChanges {
  @Input('appQrCode') text: string = ''
  @Input() qrSize: number = 200
  @Input() qrFormat: 'canvas' | 'svg' | 'image' = 'canvas'
  @Input() qrColor: any = { foreground: '#000', background: '#fff' }

  private qrService: QRCodeService

  constructor(private el: ElementRef) {
    this.qrService = createQRCodeService()
  }

  ngOnInit() {
    this.generateQRCode()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['text'] || changes['qrSize'] || changes['qrFormat'] || changes['qrColor']) {
      this.generateQRCode()
    }
  }

  ngOnDestroy() {
    this.qrService.ngOnDestroy()
  }

  private async generateQRCode() {
    if (!this.text.trim()) return

    try {
      this.qrService.generate(this.text, {
        size: this.qrSize,
        format: this.qrFormat,
        color: this.qrColor
      }).subscribe({
        next: (result) => {
          // 清空容器
          this.el.nativeElement.innerHTML = ''
          
          // 添加生成的元素
          if (result.element) {
            this.el.nativeElement.appendChild(result.element)
          }
        },
        error: (error) => {
          console.error('QR Code generation failed:', error)
          this.el.nativeElement.innerHTML = `<p>Error: ${error.message}</p>`
        }
      })
    } catch (error) {
      console.error('QR Code directive error:', error)
    }
  }
}
```

### 使用自定义指令

```typescript
// directive-example.component.ts
import { Component } from '@angular/core'

@Component({
  selector: 'app-directive-example',
  template: `
    <div class="directive-examples">
      <h2>指令方式使用</h2>
      
      <div class="example">
        <h3>基础使用</h3>
        <div appQrCode="Hello Directive!"></div>
      </div>
      
      <div class="example">
        <h3>动态内容</h3>
        <input [(ngModel)]="dynamicText" placeholder="输入文本" />
        <div 
          appQrCode="{{ dynamicText }}"
          [qrSize]="250"
          qrFormat="svg"
          [qrColor]="{ foreground: '#2563eb', background: '#f8fafc' }">
        </div>
      </div>
      
      <div class="example">
        <h3>多个二维码</h3>
        <div 
          *ngFor="let item of qrItems; let i = index"
          appQrCode="{{ item.text }}"
          [qrSize]="item.size"
          [qrFormat]="item.format"
          class="qr-item">
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./directive-example.component.css']
})
export class DirectiveExampleComponent {
  dynamicText = 'Dynamic QR Code'
  
  qrItems = [
    { text: 'Item 1', size: 150, format: 'canvas' as const },
    { text: 'Item 2', size: 200, format: 'svg' as const },
    { text: 'Item 3', size: 180, format: 'canvas' as const }
  ]
}
```

### 管道使用

```typescript
// qr-code.pipe.ts
import { Pipe, PipeTransform } from '@angular/core'
import { Observable } from 'rxjs'
import { QRCodeResult } from '@ldesign/qrcode/angular'
import { generateQRCode } from '@ldesign/qrcode'

@Pipe({
  name: 'qrCode',
  pure: false
})
export class QRCodePipe implements PipeTransform {
  private cache = new Map<string, QRCodeResult>()

  transform(text: string, options: any = {}): Observable<QRCodeResult> {
    const cacheKey = JSON.stringify({ text, options })
    
    if (this.cache.has(cacheKey)) {
      return new Observable(observer => {
        observer.next(this.cache.get(cacheKey)!)
        observer.complete()
      })
    }

    return new Observable(observer => {
      generateQRCode(text, options)
        .then(result => {
          this.cache.set(cacheKey, result)
          observer.next(result)
          observer.complete()
        })
        .catch(error => {
          observer.error(error)
        })
    })
  }
}
```

### 使用管道

```typescript
// pipe-example.component.ts
import { Component } from '@angular/core'

@Component({
  selector: 'app-pipe-example',
  template: `
    <div class="pipe-examples">
      <h2>管道方式使用</h2>
      
      <div class="example">
        <input [(ngModel)]="pipeText" placeholder="输入文本" />
        
        <div *ngIf="pipeText | qrCode:{ size: 200, format: 'svg' } | async as qrResult">
          <div [innerHTML]="qrResult.data"></div>
        </div>
      </div>
    </div>
  `
})
export class PipeExampleComponent {
  pipeText = 'Hello Pipe!'
}
```
