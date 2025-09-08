/**
 * Angular 高级功能示例组件
 * 展示 @ldesign/qrcode 的高级功能
 */

import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateQRCode, type QRCodeResult, type QRCodeOptions } from '@ldesign/qrcode';

@Component({
  selector: 'app-advanced-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="advanced-example">
      <h2 class="section-title">高级功能示例</h2>
      <p class="section-description">
        展示 &#64;ldesign/qrcode 的高级功能，包括 Logo 嵌入、批量生成、缓存管理和性能监控。
      </p>

      <div class="grid grid-2">
        <!-- Logo 嵌入 -->
        <div class="card">
          <h3 class="card-title">Logo 嵌入</h3>
          
          <div class="form-group">
            <label class="form-label">二维码文本</label>
            <input
              type="text"
              [(ngModel)]="logoQRText"
              class="form-input"
              placeholder="输入二维码内容..."
            />
          </div>

          <div class="form-group">
            <label class="form-label">Logo 图片</label>
            <input
              type="file"
              accept="image/*"
              (change)="handleLogoUpload($event)"
              class="form-input"
            />
            <div *ngIf="logoPreview" class="logo-preview">
              <img [src]="logoPreview" alt="Logo预览" style="max-width: 100px; max-height: 100px;" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Logo 大小</label>
            <input
              type="range"
              min="20"
              max="100"
              [(ngModel)]="logoSize"
              class="form-range"
            />
            <span class="range-value">{{logoSize}}px</span>
          </div>

          <button 
            (click)="generateLogoQRCode()" 
            class="btn btn-primary" 
            [disabled]="!logoQRText.trim() || isLoading">
            生成带Logo的二维码
          </button>

          <div class="qr-preview">
            <div class="qr-container" #logoContainer></div>
          </div>
        </div>

        <!-- 批量生成 -->
        <div class="card">
          <h3 class="card-title">批量生成</h3>
          
          <div class="form-group">
            <label class="form-label">批量文本 (每行一个)</label>
            <textarea
              [(ngModel)]="batchText"
              class="form-input form-textarea"
              placeholder="输入多行文本，每行生成一个二维码..."
              rows="5">
            </textarea>
          </div>

          <div class="form-group">
            <label class="form-label">批量大小</label>
            <input
              type="range"
              min="100"
              max="300"
              [(ngModel)]="batchSize"
              class="form-range"
            />
            <span class="range-value">{{batchSize}}px</span>
          </div>

          <button 
            (click)="generateBatchQRCodes()" 
            class="btn btn-primary" 
            [disabled]="!batchText.trim() || isLoading">
            {{isLoading ? '生成中...' : '批量生成'}}
          </button>

          <div class="batch-results">
            <div class="batch-container" #batchContainer></div>
            <p *ngIf="results.length > 0" class="batch-info">
              成功生成 {{results.length}} 个二维码
            </p>
          </div>
        </div>
      </div>

      <!-- 缓存管理 -->
      <div class="card">
        <h3 class="card-title">缓存管理</h3>
        <div class="cache-actions">
          <button class="btn">查看缓存信息</button>
          <button class="btn">清空缓存</button>
          <button class="btn">测试缓存性能</button>
        </div>
        <p class="cache-info">
          缓存功能可以显著提升相同内容二维码的生成速度，减少重复计算。
        </p>
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

    .logo-preview {
      margin-top: var(--ls-spacing-sm);
      text-align: center;
    }

    .batch-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--ls-spacing-base);
      margin-top: var(--ls-spacing-base);
    }

    .batch-info {
      text-align: center;
      margin-top: var(--ls-spacing-base);
      color: var(--ldesign-text-color-secondary);
    }

    .cache-actions {
      display: flex;
      gap: var(--ls-spacing-sm);
      margin-bottom: var(--ls-spacing-base);
    }

    .cache-info {
      color: var(--ldesign-text-color-secondary);
      font-size: 14px;
    }
  `]
})
export class AdvancedExampleComponent {
  @ViewChild('logoContainer', { static: false }) logoContainer!: ElementRef;
  @ViewChild('batchContainer', { static: false }) batchContainer!: ElementRef;

  logoQRText = 'https://www.ldesign.com';
  logoFile: File | null = null;
  logoPreview: string | null = null;
  logoSize = 50;
  batchText = 'https://www.ldesign.com\nhttps://github.com/ldesign\nmailto:contact@ldesign.com\ntel:+86-138-0013-8000\nLDesign 设计系统';
  batchSize = 150;
  isLoading = false;
  results: QRCodeResult[] = [];

  /**
   * 处理 Logo 文件上传
   */
  handleLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * 生成带 Logo 的二维码
   */
  async generateLogoQRCode(): Promise<void> {
    if (!this.logoQRText.trim()) return;

    this.isLoading = true;
    try {
      const logoOptions = this.logoPreview ? {
        src: this.logoPreview,
        size: this.logoSize
      } : undefined;

      const options: QRCodeOptions = {
        size: 250,
        format: 'canvas',
        errorCorrectionLevel: 'H', // 使用高纠错级别以支持 Logo
        logo: logoOptions
      };

      const result = await generateQRCode(this.logoQRText, options);

      if (this.logoContainer && result.element) {
        this.logoContainer.nativeElement.innerHTML = '';
        this.logoContainer.nativeElement.appendChild(result.element);
      }
    } catch (err) {
      console.error('生成带Logo二维码失败:', err);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 批量生成二维码
   */
  async generateBatchQRCodes(): Promise<void> {
    if (!this.batchText.trim()) return;

    this.isLoading = true;
    this.results = [];

    try {
      const texts = this.batchText.split('\n').filter(text => text.trim());
      const results: QRCodeResult[] = [];

      // 逐个生成二维码
      for (const text of texts) {
        const result = await generateQRCode(text.trim(), {
          size: this.batchSize,
          format: 'canvas',
          errorCorrectionLevel: 'M'
        });
        results.push(result);
      }

      this.results = results;

      // 渲染到容器
      if (this.batchContainer) {
        this.batchContainer.nativeElement.innerHTML = '';
        results.forEach((result, index) => {
          if (result.element) {
            const wrapper = document.createElement('div');
            wrapper.className = 'batch-item';
            wrapper.style.cssText = `
              text-align: center;
              padding: var(--ls-spacing-sm);
              border: 1px solid var(--ldesign-border-level-1-color);
              border-radius: var(--ls-border-radius-base);
            `;
            wrapper.appendChild(result.element);

            const label = document.createElement('p');
            label.textContent = texts[index];
            label.style.cssText = `
              margin-top: var(--ls-spacing-xs);
              font-size: 12px;
              color: var(--ldesign-text-color-secondary);
              word-break: break-all;
            `;
            wrapper.appendChild(label);

            this.batchContainer.nativeElement.appendChild(wrapper);
          }
        });
      }
    } catch (err) {
      console.error('批量生成失败:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
