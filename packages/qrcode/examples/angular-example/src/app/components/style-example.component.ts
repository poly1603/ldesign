/**
 * Angular 样式定制示例
 * 展示 @ldesign/qrcode 的样式定制功能
 */

import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateQRCode, type QRCodeResult, type SimpleQRCodeOptions } from '@ldesign/qrcode';

interface PresetStyle {
  name: string;
  style: {
    foregroundColor: string;
    backgroundColor: string;
  };
}

@Component({
  selector: 'app-style-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="example-container">
      <div class="example-header">
        <h2 class="example-title">样式定制示例</h2>
        <p class="example-description">自定义二维码的颜色、大小和边距</p>
      </div>

      <div class="example-content">
        <!-- 控制面板 -->
        <div class="control-panel">
          <div class="control-group">
            <label class="control-label">二维码内容</label>
            <input
              type="text"
              class="control-input"
              [(ngModel)]="qrText"
              placeholder="请输入要生成二维码的内容"
            />
          </div>

          <div class="control-row">
            <div class="control-group">
              <label class="control-label">尺寸: {{qrSize}}px</label>
              <input
                type="range"
                class="control-slider"
                [(ngModel)]="qrSize"
                min="150"
                max="400"
                step="10"
              />
            </div>

            <div class="control-group">
              <label class="control-label">边距: {{margin}}px</label>
              <input
                type="range"
                class="control-slider"
                [(ngModel)]="margin"
                min="0"
                max="20"
                step="1"
              />
            </div>
          </div>

          <div class="control-row">
            <div class="control-group">
              <label class="control-label">前景色</label>
              <div class="color-input-group">
                <input
                  type="color"
                  class="color-picker"
                  [(ngModel)]="foregroundColor"
                />
                <input
                  type="text"
                  class="color-text"
                  [(ngModel)]="foregroundColor"
                />
              </div>
            </div>

            <div class="control-group">
              <label class="control-label">背景色</label>
              <div class="color-input-group">
                <input
                  type="color"
                  class="color-picker"
                  [(ngModel)]="backgroundColor"
                />
                <input
                  type="text"
                  class="color-text"
                  [(ngModel)]="backgroundColor"
                />
              </div>
            </div>
          </div>

          <div class="control-group">
            <label class="control-label">预设样式</label>
            <div class="preset-styles">
              <button
                *ngFor="let preset of presetStyles"
                class="preset-button"
                (click)="applyPresetStyle(preset)"
              >
                {{preset.name}}
              </button>
            </div>
          </div>

          <div class="control-actions">
            <button
              class="generate-button"
              [disabled]="isLoading"
              (click)="generateQRCodeHandler()"
            >
              {{isLoading ? '生成中...' : '生成二维码'}}
            </button>
          </div>
        </div>

        <!-- 结果展示 -->
        <div class="result-panel">
          <div class="qr-container" #qrContainer></div>
          <div class="preset-container" #presetContainer></div>
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
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--ls-spacing-xl);
      align-items: start;
    }

    .control-panel {
      background: var(--ldesign-bg-color-container);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-lg);
      padding: var(--ls-spacing-lg);
    }

    .control-group {
      margin-bottom: var(--ls-spacing-base);
    }

    .control-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--ls-spacing-base);
    }

    .control-label {
      display: block;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-spacing-xs);
      font-size: 14px;
    }

    .control-input {
      width: 100%;
      padding: var(--ls-spacing-sm);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-base);
      font-size: 14px;
      transition: border-color 0.2s ease;
    }

    .control-input:focus {
      outline: none;
      border-color: var(--ldesign-brand-color);
      box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
    }

    .control-slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: var(--ldesign-gray-color-2);
      outline: none;
      -webkit-appearance: none;
    }

    .control-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--ldesign-brand-color);
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .color-input-group {
      display: flex;
      gap: var(--ls-spacing-xs);
    }

    .color-picker {
      width: 40px;
      height: 40px;
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-base);
      cursor: pointer;
      background: none;
    }

    .color-text {
      flex: 1;
      padding: var(--ls-spacing-sm);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-base);
      font-size: 14px;
      font-family: monospace;
    }

    .preset-styles {
      display: flex;
      gap: var(--ls-spacing-xs);
      flex-wrap: wrap;
    }

    .preset-button {
      padding: var(--ls-spacing-xs) var(--ls-spacing-sm);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-component);
      color: var(--ldesign-text-color-primary);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .preset-button:hover {
      background: var(--ldesign-brand-color-1);
      border-color: var(--ldesign-brand-color);
      color: var(--ldesign-brand-color);
    }

    .control-actions {
      margin-top: var(--ls-spacing-lg);
      padding-top: var(--ls-spacing-lg);
      border-top: 1px solid var(--ldesign-border-level-1-color);
    }

    .generate-button {
      width: 100%;
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

    .result-panel {
      background: var(--ldesign-bg-color-container);
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: var(--ls-border-radius-lg);
      padding: var(--ls-spacing-lg);
      text-align: center;
    }

    .qr-container {
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--ls-spacing-base);
    }

    .preset-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--ls-spacing-base);
    }

    @media (max-width: 768px) {
      .example-content {
        grid-template-columns: 1fr;
      }

      .control-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StyleExampleComponent {
  @ViewChild('qrContainer', { static: true }) qrContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('presetContainer', { static: true }) presetContainer!: ElementRef<HTMLDivElement>;

  qrText = 'https://www.ldesign.com/style-demo';
  qrSize = 250;
  foregroundColor = '#722ED1';
  backgroundColor = '#ffffff';
  margin = 4;
  isLoading = false;

  // 预设样式
  presetStyles: PresetStyle[] = [
    {
      name: '经典',
      style: {
        foregroundColor: '#000000',
        backgroundColor: '#ffffff'
      }
    },
    {
      name: '现代',
      style: {
        foregroundColor: '#722ED1',
        backgroundColor: '#f1ecf9'
      }
    },
    {
      name: '渐变',
      style: {
        foregroundColor: '#722ED1',
        backgroundColor: '#ffffff'
      }
    },
    {
      name: '优雅',
      style: {
        foregroundColor: '#35165f',
        backgroundColor: '#f8f8f8'
      }
    }
  ];

  ngOnInit() {
    this.generateQRCodeHandler();
  }

  async generateQRCodeHandler() {
    if (!this.qrText.trim()) return;

    this.isLoading = true;

    try {
      const options: SimpleQRCodeOptions = {
        size: this.qrSize,
        format: 'canvas',
        errorCorrectionLevel: 'M',
        margin: this.margin,
        foregroundColor: this.foregroundColor,
        backgroundColor: this.backgroundColor
      };

      const result = await generateQRCode(this.qrText, options);

      // 渲染主要二维码（包含回退）
      if (this.qrContainer.nativeElement) {
        const host = this.qrContainer.nativeElement;
        host.innerHTML = '';
        if (result.element) {
          host.appendChild(result.element);
        } else if ((result as any).svg) {
          host.innerHTML = (result as any).svg;
        } else if ((result as any).dataURL) {
          const img = new Image();
          img.src = (result as any).dataURL;
          img.width = this.qrSize;
          img.height = this.qrSize;
          host.appendChild(img);
        }
      }

      // 生成预设样式示例
      await this.generatePresetExamples();

    } catch (error) {
      console.error('生成二维码失败:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async generatePresetExamples() {
    if (!this.presetContainer.nativeElement) return;

    this.presetContainer.nativeElement.innerHTML = '';

    for (const preset of this.presetStyles) {
      try {
        const options: SimpleQRCodeOptions = {
          size: 120,
          format: 'canvas',
          errorCorrectionLevel: 'M',
          margin: 2,
          foregroundColor: preset.style.foregroundColor,
          backgroundColor: preset.style.backgroundColor
        };

        const result = await generateQRCode(this.qrText, options);

        if (result) {
          const presetItem = document.createElement('div');
          presetItem.className = 'preset-item';
          presetItem.innerHTML = `
            <div class="preset-qr"></div>
            <div class="preset-name">${preset.name}</div>
          `;

          const qrDiv = presetItem.querySelector('.preset-qr') as HTMLDivElement;
          if (qrDiv) {
            qrDiv.innerHTML = '';
            if (result.element) {
              qrDiv.appendChild(result.element);
            } else if ((result as any).svg) {
              qrDiv.innerHTML = (result as any).svg;
            } else if ((result as any).dataURL) {
              const img = new Image();
              img.src = (result as any).dataURL;
              img.width = 120;
              img.height = 120;
              qrDiv.appendChild(img);
            }
          }

          this.presetContainer.nativeElement.appendChild(presetItem);
        }
      } catch (error) {
        console.error(`生成预设样式 ${preset.name} 失败:`, error);
      }
    }
  }

  applyPresetStyle(preset: PresetStyle) {
    this.foregroundColor = preset.style.foregroundColor;
    this.backgroundColor = preset.style.backgroundColor;
    this.generateQRCodeHandler();
  }
}
