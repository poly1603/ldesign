/**
 * Angular 基础二维码生成示例组件
 * 展示 @ldesign/qrcode 的基本使用方法
 */

import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateQRCode, type QRCodeResult, type QRCodeOptions } from '@ldesign/qrcode';

@Component({
  selector: 'app-basic-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="basic-example">
      <h2 class="section-title">基础二维码生成示例</h2>
      <p class="section-description">
        展示 &#64;ldesign/qrcode 的基本使用方法，包括文本输入、格式选择和基本配置。
      </p>

      <div class="grid grid-2">
        <!-- 配置面板 -->
        <div class="card">
          <h3 class="card-title">配置选项</h3>
          
          <div class="form-group">
            <label class="form-label">输入文本或URL</label>
            <textarea
              [(ngModel)]="qrText"
              class="form-input form-textarea"
              placeholder="请输入要生成二维码的文本或URL..."
              rows="3">
            </textarea>
          </div>

          <div class="form-group">
            <label class="form-label">二维码大小</label>
            <input
              type="range"
              min="100"
              max="500"
              step="10"
              [(ngModel)]="qrSize"
              class="form-range"
            />
            <span class="range-value">{{qrSize}}px</span>
          </div>

          <div class="form-group">
            <label class="form-label">输出格式</label>
            <select [(ngModel)]="qrFormat" class="form-input">
              <option value="canvas">Canvas</option>
              <option value="svg">SVG</option>
              <option value="image">Image</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">错误纠正级别</label>
            <select [(ngModel)]="errorLevel" class="form-input">
              <option value="L">L (低) - 约7%</option>
              <option value="M">M (中) - 约15%</option>
              <option value="Q">Q (四分位) - 约25%</option>
              <option value="H">H (高) - 约30%</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">边距</label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              [(ngModel)]="qrMargin"
              class="form-range"
            />
            <span class="range-value">{{qrMargin}}</span>
          </div>

          <div class="form-actions">
            <button 
              (click)="generateQRCodeHandler()" 
              class="btn btn-primary" 
              [disabled]="!qrText.trim() || isLoading">
              {{isLoading ? '生成中...' : '生成二维码'}}
            </button>
            <button 
              (click)="downloadQRCode()" 
              class="btn" 
              [disabled]="!result">
              下载二维码
            </button>
          </div>
        </div>

        <!-- 预览面板 -->
        <div class="card">
          <h3 class="card-title">二维码预览</h3>
          
          <div class="qr-preview">
            <div *ngIf="isLoading" class="loading">
              <div class="loading-spinner"></div>
              <p>正在生成二维码...</p>
            </div>
            
            <div *ngIf="error" class="error">
              <p class="error-message">{{error}}</p>
              <button (click)="generateQRCodeHandler()" class="btn btn-primary">重试</button>
            </div>
            
            <div *ngIf="result && !isLoading && !error" class="qr-result">
              <div class="qr-container" #qrContainer></div>
              <div class="qr-info">
                <p><strong>格式:</strong> {{result.format}}</p>
                <p><strong>尺寸:</strong> {{result.size}}px</p>
                <p><strong>生成时间:</strong> {{formatTime(result.timestamp)}}</p>
                <p><strong>来源:</strong> 实时生成</p>
              </div>
            </div>
            
            <div *ngIf="!result && !isLoading && !error" class="placeholder">
              <div class="placeholder-icon">📱</div>
              <p>请输入文本并点击生成按钮</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速示例 -->
      <div class="card">
        <h3 class="card-title">快速示例</h3>
        <div class="quick-examples">
          <button
            *ngFor="let example of quickExamples"
            (click)="loadExample(example)"
            class="btn example-btn">
            {{example.label}}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-range {
      width: 100%;
      margin-bottom: var(--ls-spacing-xs);
    }

    .range-value {
      font-size: 14px;
      color: var(--ldesign-text-color-secondary);
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: var(--ls-spacing-sm);
      margin-top: var(--ls-spacing-base);
    }

    .qr-info {
      text-align: center;
      font-size: 14px;
      color: var(--ldesign-text-color-secondary);
    }

    .qr-info p {
      margin-bottom: var(--ls-spacing-xs);
    }

    .loading {
      text-align: center;
      color: var(--ldesign-text-color-secondary);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--ldesign-border-level-2-color);
      border-top: 3px solid var(--ldesign-brand-color-6);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto var(--ls-spacing-sm);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      text-align: center;
      color: #e54848;
    }

    .error-message {
      margin-bottom: var(--ls-spacing-base);
      font-weight: 500;
    }

    .quick-examples {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ls-spacing-sm);
    }

    .example-btn {
      flex: 0 0 auto;
    }
  `]
})
export class BasicExampleComponent implements OnInit {
  @ViewChild('qrContainer', { static: false }) qrContainer!: ElementRef;

  // 状态管理
  qrText = 'https://github.com/ldesign/qrcode';
  qrSize = 200;
  qrFormat: 'canvas' | 'svg' | 'image' = 'canvas';
  errorLevel: 'L' | 'M' | 'Q' | 'H' = 'M';
  qrMargin = 1;
  isLoading = false;
  result: QRCodeResult | null = null;
  error: string | null = null;

  // 快速示例数据
  quickExamples = [
    { label: '网站URL', text: 'https://www.ldesign.com', size: 200 },
    { label: '联系方式', text: 'tel:+86-138-0013-8000', size: 180 },
    { label: '邮箱地址', text: 'mailto:contact@ldesign.com', size: 200 },
    { label: '短文本', text: 'Hello LDesign!', size: 150 },
    { label: '长文本', text: '这是一个包含中文字符的长文本示例，用于测试二维码生成器对不同字符集的支持能力。', size: 250 }
  ];

  ngOnInit(): void {
    // 初始生成
    this.generateQRCodeHandler();
  }

  /**
   * 生成二维码
   */
  async generateQRCodeHandler(): Promise<void> {
    if (!this.qrText.trim()) return;

    this.isLoading = true;
    this.error = null;
    this.result = null;

    try {
      const options: QRCodeOptions = {
        size: this.qrSize,
        format: this.qrFormat,
        errorCorrectionLevel: this.errorLevel,
        margin: this.qrMargin
      };

      const qrResult = await generateQRCode(this.qrText, options);
      this.result = qrResult;

      // 渲染二维码到容器
      if (this.qrContainer && qrResult.element) {
        this.qrContainer.nativeElement.innerHTML = '';
        this.qrContainer.nativeElement.appendChild(qrResult.element);
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : '生成二维码失败';
      console.error('二维码生成失败:', err);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 下载二维码
   */
  downloadQRCode(): void {
    if (!this.result) return;

    try {
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.${this.qrFormat === 'svg' ? 'svg' : 'png'}`;

      if (this.qrFormat === 'svg' && this.result.data) {
        const blob = new Blob([this.result.data], { type: 'image/svg+xml' });
        link.href = URL.createObjectURL(blob);
      } else if (this.result.data) {
        link.href = this.result.data;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('下载失败:', err);
    }
  }

  /**
   * 加载快速示例
   */
  loadExample(example: typeof this.quickExamples[0]): void {
    this.qrText = example.text;
    this.qrSize = example.size;
  }

  /**
   * 格式化时间
   */
  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }
}
