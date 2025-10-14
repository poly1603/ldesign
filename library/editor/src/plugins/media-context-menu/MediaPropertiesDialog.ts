import { Editor } from '../../core/Editor';

/**
 * Media Properties Dialog
 * Advanced properties editor for media elements with live preview
 */
export class MediaPropertiesDialog {
  private editor: Editor;
  private container: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private currentTarget: HTMLElement | null = null;
  private originalStyles: Map<string, string> = new Map();

  constructor(editor: Editor) {
    this.editor = editor;
    this.createDialog();
  }

  private createDialog() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'media-properties-overlay';
    this.overlay.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
    `;

    // Create dialog container
    this.container = document.createElement('div');
    this.container.className = 'media-properties-dialog';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-width: 90%;
      max-height: 80vh;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close(false);
      }
    });
  }

  public open(target: HTMLElement) {
    if (!this.overlay || !this.container) return;

    this.currentTarget = target;
    this.saveOriginalStyles(target);
    
    const tagName = target.tagName.toLowerCase();
    let content = '';

    switch (tagName) {
      case 'img':
        content = this.createImagePropertiesForm(target as HTMLImageElement);
        break;
      case 'video':
        content = this.createVideoPropertiesForm(target as HTMLVideoElement);
        break;
      case 'audio':
        content = this.createAudioPropertiesForm(target as HTMLAudioElement);
        break;
    }

    this.container.innerHTML = content;
    this.overlay.style.display = 'block';
    this.attachEventHandlers();

    console.log('[MediaPropertiesDialog] Opened for', tagName);
  }

  private createImagePropertiesForm(img: HTMLImageElement): string {
    return `
      <div class="dialog-header">
        <h3>图片属性</h3>
        <button class="close-btn" onclick="this.closest('.media-properties-overlay').style.display='none'">✕</button>
      </div>
      <div class="dialog-body">
        <div class="preview-container">
          <img src="${img.src}" alt="${img.alt || ''}" style="max-width: 100%; height: auto;">
        </div>
        
        <div class="properties-form">
          <div class="form-group">
            <label>源地址 (URL)</label>
            <input type="text" id="prop-src" value="${img.src}" />
          </div>
          
          <div class="form-group">
            <label>替代文本 (Alt)</label>
            <input type="text" id="prop-alt" value="${img.alt || ''}" />
          </div>
          
          <div class="form-group">
            <label>标题 (Title)</label>
            <input type="text" id="prop-title" value="${img.title || ''}" />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>宽度</label>
              <input type="text" id="prop-width" value="${img.style.width || 'auto'}" placeholder="例: 300px, 50%, auto" />
            </div>
            <div class="form-group">
              <label>高度</label>
              <input type="text" id="prop-height" value="${img.style.height || 'auto'}" placeholder="例: 200px, auto" />
            </div>
          </div>
          
          <div class="form-group">
            <label>滤镜效果</label>
            <select id="prop-filter">
              <option value="">无</option>
              <option value="grayscale(100%)" ${img.style.filter?.includes('grayscale') ? 'selected' : ''}>黑白</option>
              <option value="sepia(100%)" ${img.style.filter?.includes('sepia') ? 'selected' : ''}>复古</option>
              <option value="blur(3px)" ${img.style.filter?.includes('blur') ? 'selected' : ''}>模糊</option>
              <option value="brightness(1.5)" ${img.style.filter?.includes('brightness') ? 'selected' : ''}>增亮</option>
              <option value="contrast(1.5)" ${img.style.filter?.includes('contrast') ? 'selected' : ''}>高对比度</option>
              <option value="invert(100%)" ${img.style.filter?.includes('invert') ? 'selected' : ''}>反色</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>对齐方式</label>
            <select id="prop-align">
              <option value="">默认</option>
              <option value="left" ${this.getAlignment(img) === 'left' ? 'selected' : ''}>左对齐</option>
              <option value="center" ${this.getAlignment(img) === 'center' ? 'selected' : ''}>居中</option>
              <option value="right" ${this.getAlignment(img) === 'right' ? 'selected' : ''}>右对齐</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>文字环绕</label>
            <select id="prop-float">
              <option value="">无</option>
              <option value="left" ${img.style.float === 'left' ? 'selected' : ''}>左侧环绕</option>
              <option value="right" ${img.style.float === 'right' ? 'selected' : ''}>右侧环绕</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>边框</label>
            <input type="text" id="prop-border" value="${img.style.border || ''}" placeholder="例: 2px solid #999" />
          </div>
          
          <div class="form-group">
            <label>圆角</label>
            <input type="text" id="prop-border-radius" value="${img.style.borderRadius || ''}" placeholder="例: 8px, 50%" />
          </div>
          
          <div class="form-group">
            <label>阴影</label>
            <input type="text" id="prop-shadow" value="${img.style.boxShadow || ''}" placeholder="例: 0 4px 8px rgba(0,0,0,0.1)" />
          </div>
          
          <div class="form-group">
            <label>外边距</label>
            <input type="text" id="prop-margin" value="${img.style.margin || ''}" placeholder="例: 10px, 10px 20px" />
          </div>
          
          <div class="form-group">
            <label>内边距</label>
            <input type="text" id="prop-padding" value="${img.style.padding || ''}" placeholder="例: 5px, 5px 10px" />
          </div>
          
          <div class="form-group">
            <label>不透明度</label>
            <input type="range" id="prop-opacity" min="0" max="100" value="${(parseFloat(img.style.opacity || '1') * 100)}" />
            <span id="opacity-value">${Math.round(parseFloat(img.style.opacity || '1') * 100)}%</span>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-primary" onclick="window.mediaPropertiesApply()">应用</button>
        <button class="btn btn-secondary" onclick="window.mediaPropertiesCancel()">取消</button>
      </div>
    `;
  }

  private createVideoPropertiesForm(video: HTMLVideoElement): string {
    return `
      <div class="dialog-header">
        <h3>视频属性</h3>
        <button class="close-btn" onclick="this.closest('.media-properties-overlay').style.display='none'">✕</button>
      </div>
      <div class="dialog-body">
        <div class="preview-container">
          <video src="${video.src}" controls style="max-width: 100%; height: auto;"></video>
        </div>
        
        <div class="properties-form">
          <div class="form-group">
            <label>源地址 (URL)</label>
            <input type="text" id="prop-src" value="${video.src}" />
          </div>
          
          <div class="form-group">
            <label>海报图片</label>
            <input type="text" id="prop-poster" value="${video.poster || ''}" placeholder="视频封面图片URL" />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>宽度</label>
              <input type="text" id="prop-width" value="${video.style.width || 'auto'}" placeholder="例: 640px, 100%" />
            </div>
            <div class="form-group">
              <label>高度</label>
              <input type="text" id="prop-height" value="${video.style.height || 'auto'}" placeholder="例: 360px, auto" />
            </div>
          </div>
          
          <div class="form-group">
            <label>预加载</label>
            <select id="prop-preload">
              <option value="none" ${video.preload === 'none' ? 'selected' : ''}>不预加载</option>
              <option value="metadata" ${video.preload === 'metadata' ? 'selected' : ''}>仅元数据</option>
              <option value="auto" ${video.preload === 'auto' ? 'selected' : ''}>自动</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="prop-autoplay" ${video.autoplay ? 'checked' : ''} />
              自动播放
            </label>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="prop-loop" ${video.loop ? 'checked' : ''} />
              循环播放
            </label>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="prop-muted" ${video.muted ? 'checked' : ''} />
              静音
            </label>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="prop-controls" ${video.controls ? 'checked' : ''} />
              显示控件
            </label>
          </div>
          
          <div class="form-group">
            <label>对齐方式</label>
            <select id="prop-align">
              <option value="">默认</option>
              <option value="left" ${this.getAlignment(video) === 'left' ? 'selected' : ''}>左对齐</option>
              <option value="center" ${this.getAlignment(video) === 'center' ? 'selected' : ''}>居中</option>
              <option value="right" ${this.getAlignment(video) === 'right' ? 'selected' : ''}>右对齐</option>
            </select>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-primary" onclick="window.mediaPropertiesApply()">应用</button>
        <button class="btn btn-secondary" onclick="window.mediaPropertiesCancel()">取消</button>
      </div>
    `;
  }

  private createAudioPropertiesForm(audio: HTMLAudioElement): string {
    return `
      <div class="dialog-header">
        <h3>音频属性</h3>
        <button class="close-btn" onclick="this.closest('.media-properties-overlay').style.display='none'">✕</button>
      </div>
      <div class="dialog-body">
        <div class="preview-container">
          <audio src="${audio.src}" controls style="width: 100%;"></audio>
        </div>
        
        <div class="properties-form">
          <div class="form-group">
            <label>源地址 (URL)</label>
            <input type="text" id="prop-src" value="${audio.src}" />
          </div>
          
          <div class="form-group">
            <label>预加载</label>
            <select id="prop-preload">
              <option value="none" ${audio.preload === 'none' ? 'selected' : ''}>不预加载</option>
              <option value="metadata" ${audio.preload === 'metadata' ? 'selected' : ''}>仅元数据</option>
              <option value="auto" ${audio.preload === 'auto' ? 'selected' : ''}>自动</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="prop-autoplay" ${audio.autoplay ? 'checked' : ''} />
              自动播放
            </label>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="prop-loop" ${audio.loop ? 'checked' : ''} />
              循环播放
            </label>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="prop-muted" ${audio.muted ? 'checked' : ''} />
              静音
            </label>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="prop-controls" ${audio.controls ? 'checked' : ''} />
              显示控件
            </label>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-primary" onclick="window.mediaPropertiesApply()">应用</button>
        <button class="btn btn-secondary" onclick="window.mediaPropertiesCancel()">取消</button>
      </div>
    `;
  }

  private attachEventHandlers() {
    // Attach global functions for buttons
    (window as any).mediaPropertiesApply = () => this.apply();
    (window as any).mediaPropertiesCancel = () => this.close(false);

    // Live preview for certain properties
    const opacityInput = document.getElementById('prop-opacity') as HTMLInputElement;
    if (opacityInput) {
      opacityInput.addEventListener('input', (e) => {
        const value = (e.target as HTMLInputElement).value;
        const opacityValue = document.getElementById('opacity-value');
        if (opacityValue) {
          opacityValue.textContent = `${value}%`;
        }
        if (this.currentTarget) {
          this.currentTarget.style.opacity = (parseInt(value) / 100).toString();
        }
      });
    }

    // Live preview for filter
    const filterSelect = document.getElementById('prop-filter') as HTMLSelectElement;
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        if (this.currentTarget) {
          this.currentTarget.style.filter = (e.target as HTMLSelectElement).value;
        }
      });
    }
  }

  private getAlignment(element: HTMLElement): string {
    if (element.style.marginLeft === 'auto' && element.style.marginRight === 'auto') {
      return 'center';
    } else if (element.style.marginLeft === '0' && element.style.marginRight === 'auto') {
      return 'left';
    } else if (element.style.marginLeft === 'auto' && element.style.marginRight === '0') {
      return 'right';
    }
    return '';
  }

  private saveOriginalStyles(element: HTMLElement) {
    this.originalStyles.clear();
    const styles = ['width', 'height', 'filter', 'float', 'margin', 'marginLeft', 'marginRight', 
                   'border', 'borderRadius', 'boxShadow', 'padding', 'opacity', 'display'];
    
    styles.forEach(prop => {
      this.originalStyles.set(prop, element.style[prop as any] || '');
    });
  }

  private apply() {
    if (!this.currentTarget) return;

    const tagName = this.currentTarget.tagName.toLowerCase();

    if (tagName === 'img') {
      this.applyImageProperties(this.currentTarget as HTMLImageElement);
    } else if (tagName === 'video') {
      this.applyVideoProperties(this.currentTarget as HTMLVideoElement);
    } else if (tagName === 'audio') {
      this.applyAudioProperties(this.currentTarget as HTMLAudioElement);
    }

    this.editor.emit('input');
    this.close(true);
  }

  private applyImageProperties(img: HTMLImageElement) {
    const getValue = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';
    
    img.src = getValue('prop-src');
    img.alt = getValue('prop-alt');
    img.title = getValue('prop-title');
    img.style.width = getValue('prop-width');
    img.style.height = getValue('prop-height');
    img.style.filter = getValue('prop-filter');
    img.style.border = getValue('prop-border');
    img.style.borderRadius = getValue('prop-border-radius');
    img.style.boxShadow = getValue('prop-shadow');
    img.style.margin = getValue('prop-margin');
    img.style.padding = getValue('prop-padding');
    
    const opacity = document.getElementById('prop-opacity') as HTMLInputElement;
    if (opacity) {
      img.style.opacity = (parseInt(opacity.value) / 100).toString();
    }
    
    const align = getValue('prop-align');
    if (align === 'center') {
      img.style.display = 'block';
      img.style.marginLeft = 'auto';
      img.style.marginRight = 'auto';
    } else if (align === 'left') {
      img.style.display = 'block';
      img.style.marginLeft = '0';
      img.style.marginRight = 'auto';
    } else if (align === 'right') {
      img.style.display = 'block';
      img.style.marginLeft = 'auto';
      img.style.marginRight = '0';
    }
    
    const float = getValue('prop-float');
    img.style.float = float;
    if (float) {
      img.style.margin = '10px';
      if (float === 'left') img.style.marginLeft = '0';
      if (float === 'right') img.style.marginRight = '0';
    }
  }

  private applyVideoProperties(video: HTMLVideoElement) {
    const getValue = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';
    const getChecked = (id: string) => (document.getElementById(id) as HTMLInputElement)?.checked || false;
    
    video.src = getValue('prop-src');
    video.poster = getValue('prop-poster');
    video.style.width = getValue('prop-width');
    video.style.height = getValue('prop-height');
    video.preload = getValue('prop-preload') as '' | 'none' | 'metadata' | 'auto';
    video.autoplay = getChecked('prop-autoplay');
    video.loop = getChecked('prop-loop');
    video.muted = getChecked('prop-muted');
    video.controls = getChecked('prop-controls');
    
    const align = getValue('prop-align');
    if (align === 'center') {
      video.style.display = 'block';
      video.style.marginLeft = 'auto';
      video.style.marginRight = 'auto';
    } else if (align === 'left') {
      video.style.display = 'block';
      video.style.marginLeft = '0';
      video.style.marginRight = 'auto';
    } else if (align === 'right') {
      video.style.display = 'block';
      video.style.marginLeft = 'auto';
      video.style.marginRight = '0';
    }
  }

  private applyAudioProperties(audio: HTMLAudioElement) {
    const getValue = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || '';
    const getChecked = (id: string) => (document.getElementById(id) as HTMLInputElement)?.checked || false;
    
    audio.src = getValue('prop-src');
    audio.preload = getValue('prop-preload') as '' | 'none' | 'metadata' | 'auto';
    audio.autoplay = getChecked('prop-autoplay');
    audio.loop = getChecked('prop-loop');
    audio.muted = getChecked('prop-muted');
    audio.controls = getChecked('prop-controls');
  }

  private close(save: boolean) {
    if (!save && this.currentTarget && this.originalStyles.size > 0) {
      // Restore original styles if cancelled
      this.originalStyles.forEach((value, key) => {
        (this.currentTarget as any).style[key] = value;
      });
    }

    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    
    this.currentTarget = null;
    this.originalStyles.clear();
    
    // Clean up global functions
    delete (window as any).mediaPropertiesApply;
    delete (window as any).mediaPropertiesCancel;
    
    console.log('[MediaPropertiesDialog] Closed', save ? 'with save' : 'without save');
  }

  public destroy() {
    this.close(false);
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
    this.container = null;
  }
}