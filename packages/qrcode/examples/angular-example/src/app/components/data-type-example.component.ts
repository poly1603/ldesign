/**
 * Angular 数据类型示例
 * 展示 @ldesign/qrcode 支持的各种数据类型
 */

import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateQRCode, type QRCodeResult, type SimpleQRCodeOptions } from '@ldesign/qrcode';

interface DataType {
  id: string;
  label: string;
  icon: string;
  defaultData: string;
  description: string;
}

@Component({
  selector: 'app-data-type-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="example-container">
      <div class="example-header">
        <h2 class="example-title">数据类型示例</h2>
        <p class="example-description">支持多种数据类型的二维码生成</p>
      </div>

      <div class="example-content">
        <!-- 数据类型选择 -->
        <div class="type-selector">
          <div class="type-grid">
            <button
              *ngFor="let type of dataTypes"
              class="type-card"
              [class.active]="selectedType === type.id"
              (click)="selectDataType(type)"
            >
              <div class="type-icon">{{type.icon}}</div>
              <div class="type-label">{{type.label}}</div>
              <div class="type-description">{{type.description}}</div>
            </button>
          </div>
        </div>

        <!-- 数据输入和结果 -->
        <div class="input-result-panel">
          <!-- 数据输入 -->
          <div class="input-panel">
            <div class="input-header">
              <h3 class="input-title">
                <span class="input-icon">{{getCurrentType()?.icon}}</span>
                {{getCurrentType()?.label || '请选择数据类型'}}
              </h3>
            </div>

            <div class="input-content" *ngIf="selectedType">
              <label class="input-label">数据内容</label>
              <textarea
                class="input-textarea"
                [(ngModel)]="currentData"
                [placeholder]="'请输入' + getCurrentType()?.label + '数据'"
                rows="8"
              ></textarea>

              <div class="input-actions">
                <button
                  class="generate-button"
                  [disabled]="isLoading || !currentData.trim()"
                  (click)="generateQRCodeHandler()"
                >
                  {{isLoading ? '生成中...' : '生成二维码'}}
                </button>

                <button
                  class="reset-button"
                  (click)="resetToDefault()"
                  [disabled]="!selectedType"
                >
                  重置为默认
                </button>
              </div>
            </div>

            <div class="empty-state" *ngIf="!selectedType">
              <div class="empty-icon">📱</div>
              <div class="empty-text">请选择一种数据类型开始生成二维码</div>
            </div>
          </div>

          <!-- 结果展示 -->
          <div class="result-panel">
            <div class="result-header">
              <h3 class="result-title">生成结果</h3>
            </div>

            <div class="qr-container" #qrContainer>
              <div class="qr-placeholder" *ngIf="!hasQRCode">
                <div class="placeholder-icon">🔲</div>
                <div class="placeholder-text">二维码将在这里显示</div>
              </div>
            </div>

            <div class="result-info" *ngIf="result">
              <div class="info-item">
                <span class="info-label">数据长度:</span>
                <span class="info-value">{{currentData.length}} 字符</span>
              </div>
              <div class="info-item">
                <span class="info-label">生成时间:</span>
                <span class="info-value">{{result.timestamp}}</span>
              </div>
              <div class="info-item">
                <span class="info-label">格式:</span>
                <span class="info-value">{{result.format}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--ls-spacing-base);
    }

    .example-header {
      text-align: center;
      margin-bottom: var(--ls-spacing-xl);
    }

    .example-title {
      font-size: var(--ls-font-size-h3);
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-spacing-sm);
    }

    .example-description {
      color: var(--ldesign-text-color-secondary);
      font-size: var(--ls-font-size-base);
    }

    .example-content {
      display: flex;
      flex-direction: column;
      gap: var(--ls-spacing-xl);
    }

    .type-selector {
      background: var(--ldesign-bg-color-container);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-lg);
      padding: var(--ls-spacing-lg);
    }

    .type-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--ls-spacing-base);
    }

    .type-card {
      padding: var(--ls-spacing-base);
      border: 2px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-component);
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .type-card:hover {
      border-color: var(--ldesign-brand-color-hover);
      background: var(--ldesign-brand-color-1);
    }

    .type-card.active {
      border-color: var(--ldesign-brand-color);
      background: var(--ldesign-brand-color-1);
      box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
    }

    .type-icon {
      font-size: 2rem;
      margin-bottom: var(--ls-spacing-xs);
    }

    .type-label {
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-spacing-xs);
    }

    .type-description {
      font-size: 13px;
      color: var(--ldesign-text-color-secondary);
    }

    .input-result-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--ls-spacing-xl);
      align-items: start;
    }

    .input-panel {
      background: var(--ldesign-bg-color-container);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-lg);
      padding: var(--ls-spacing-lg);
    }

    .input-header {
      margin-bottom: var(--ls-spacing-base);
      padding-bottom: var(--ls-spacing-base);
      border-bottom: 1px solid var(--ldesign-border-level-1-color);
    }

    .input-title {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-primary);
      margin: 0;
    }

    .input-icon {
      font-size: 1.2rem;
    }

    .input-label {
      display: block;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-spacing-xs);
      font-size: 14px;
    }

    .input-textarea {
      width: 100%;
      padding: var(--ls-spacing-sm);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-base);
      font-size: 14px;
      font-family: monospace;
      resize: vertical;
      min-height: 120px;
      transition: border-color 0.2s ease;
    }

    .input-textarea:focus {
      outline: none;
      border-color: var(--ldesign-brand-color);
      box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
    }

    .input-actions {
      display: flex;
      gap: var(--ls-spacing-sm);
      margin-top: var(--ls-spacing-base);
    }

    .generate-button {
      flex: 1;
      padding: var(--ls-spacing-sm) var(--ls-spacing-base);
      background: var(--ldesign-brand-color);
      color: white;
      border: none;
      border-radius: var(--ls-border-radius-base);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .generate-button:hover:not(:disabled) {
      background: var(--ldesign-brand-color-hover);
    }

    .generate-button:disabled {
      background: var(--ldesign-brand-color-disabled);
      cursor: not-allowed;
    }

    .reset-button {
      padding: var(--ls-spacing-sm) var(--ls-spacing-base);
      background: transparent;
      color: var(--ldesign-text-color-secondary);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-base);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .reset-button:hover:not(:disabled) {
      background: var(--ldesign-bg-color-component-hover);
      border-color: var(--ldesign-border-level-2-color);
    }

    .reset-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .empty-state {
      text-align: center;
      padding: var(--ls-spacing-xl) 0;
      color: var(--ldesign-text-color-placeholder);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: var(--ls-spacing-base);
    }

    .empty-text {
      font-size: var(--ls-font-size-base);
    }

    .result-panel {
      background: var(--ldesign-bg-color-container);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-lg);
      padding: var(--ls-spacing-lg);
    }

    .result-header {
      margin-bottom: var(--ls-spacing-base);
      padding-bottom: var(--ls-spacing-base);
      border-bottom: 1px solid var(--ldesign-border-level-1-color);
    }

    .result-title {
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-primary);
      margin: 0;
    }

    .qr-container {
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--ls-spacing-base);
    }

    .qr-placeholder {
      text-align: center;
      color: var(--ldesign-text-color-placeholder);
    }

    .placeholder-icon {
      font-size: 4rem;
      margin-bottom: var(--ls-spacing-base);
    }

    .placeholder-text {
      font-size: var(--ls-font-size-base);
    }

    .result-info {
      background: var(--ldesign-bg-color-component);
      border-radius: var(--ls-border-radius-base);
      padding: var(--ls-spacing-base);
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--ls-spacing-xs) 0;
      border-bottom: 1px solid var(--ldesign-border-level-1-color);
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-label {
      font-weight: 600;
      color: var(--ldesign-text-color-secondary);
      font-size: 13px;
    }

    .info-value {
      color: var(--ldesign-text-color-primary);
      font-size: 13px;
      font-family: monospace;
    }

    @media (max-width: 768px) {
      .type-grid {
        grid-template-columns: 1fr;
      }

      .input-result-panel {
        grid-template-columns: 1fr;
      }

      .input-actions {
        flex-direction: column;
      }
    }
  `]
})
export class DataTypeExampleComponent {
  @ViewChild('qrContainer', { static: true }) qrContainer!: ElementRef<HTMLDivElement>;

  selectedType = '';
  currentData = '';
  isLoading = false;
  hasQRCode = false;
  result: QRCodeResult | null = null;

  // 数据类型配置
  dataTypes: DataType[] = [
    {
      id: 'url',
      label: 'URL链接',
      icon: '🌐',
      defaultData: 'https://www.ldesign.com',
      description: '网站链接、在线资源等'
    },
    {
      id: 'wifi',
      label: 'WiFi网络',
      icon: '📶',
      defaultData: 'WIFI:T:WPA;S:LDesign-Office;P:password123;H:false;',
      description: 'WiFi连接信息'
    },
    {
      id: 'contact',
      label: '联系人',
      icon: '👤',
      defaultData: 'BEGIN:VCARD\nVERSION:3.0\nFN:LDesign Team\nORG:LDesign\nTEL:+86-138-0013-8000\nEMAIL:contact@ldesign.com\nURL:https://www.ldesign.com\nEND:VCARD',
      description: '联系人名片信息'
    },
    {
      id: 'email',
      label: '邮件',
      icon: '📧',
      defaultData: 'mailto:contact@ldesign.com?subject=Hello&body=Hi there!',
      description: '邮件地址和内容'
    },
    {
      id: 'sms',
      label: '短信',
      icon: '💬',
      defaultData: 'sms:+86-138-0013-8000?body=Hello from LDesign!',
      description: '短信号码和内容'
    },
    {
      id: 'phone',
      label: '电话',
      icon: '📞',
      defaultData: 'tel:+86-138-0013-8000',
      description: '电话号码'
    },
    {
      id: 'location',
      label: '地理位置',
      icon: '📍',
      defaultData: 'geo:39.9042,116.4074?q=北京天安门',
      description: '地理坐标和位置'
    },
    {
      id: 'text',
      label: '纯文本',
      icon: '📝',
      defaultData: 'Hello, this is a QR code generated by @ldesign/qrcode!',
      description: '任意文本内容'
    }
  ];

  selectDataType(type: DataType) {
    this.selectedType = type.id;
    this.currentData = type.defaultData;
    this.generateQRCodeHandler();
  }

  getCurrentType(): DataType | undefined {
    return this.dataTypes.find(type => type.id === this.selectedType);
  }

  resetToDefault() {
    const currentType = this.getCurrentType();
    if (currentType) {
      this.currentData = currentType.defaultData;
      this.generateQRCodeHandler();
    }
  }

  async generateQRCodeHandler() {
    if (!this.currentData.trim()) return;

    this.isLoading = true;

    try {
      const options: SimpleQRCodeOptions = {
        size: 250,
        format: 'canvas',
        errorCorrectionLevel: 'M',
        margin: 4
      };

      this.result = await generateQRCode(this.currentData, options);

      // 渲染二维码（包含回退）
      if (this.qrContainer.nativeElement) {
        const host = this.qrContainer.nativeElement;
        host.innerHTML = '';
        if (this.result.element) {
          host.appendChild(this.result.element);
          this.hasQRCode = true;
        } else if ((this.result as any).svg) {
          host.innerHTML = (this.result as any).svg;
          this.hasQRCode = true;
        } else if ((this.result as any).dataURL) {
          const img = new Image();
          img.src = (this.result as any).dataURL;
          img.width = 250;
          img.height = 250;
          host.appendChild(img);
          this.hasQRCode = true;
        } else {
          this.hasQRCode = false;
        }
      }

    } catch (error) {
      console.error('生成二维码失败:', error);
      this.hasQRCode = false;
    } finally {
      this.isLoading = false;
    }
  }
}
