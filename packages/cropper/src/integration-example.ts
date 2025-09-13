/**
 * Complete Integration Example
 * Demonstrates all advanced features working together in the Image Cropper
 */

import { 
  AdvancedExportManager, 
  ExportFormat, 
  CompressionLevel, 
  WatermarkPosition,
  ExportPresets 
} from './export-advanced';

import {
  AnimationManager,
  AnimationPresets,
  TransitionPresets,
  AnimationUtilities,
  globalAnimationManager
} from './animations';

import {
  ThemeManager,
  ThemeMode,
  ColorScheme,
  globalThemeManager
} from './theme-system';

import {
  CloudManager,
  CloudService,
  SocialMediaService,
  createCloudStorageUI
} from './cloud-storage';

// Complete Image Cropper with All Advanced Features
export class AdvancedImageCropper {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;
  
  // Feature managers
  private exportManager: AdvancedExportManager;
  private animationManager: AnimationManager;
  private themeManager: ThemeManager;
  private cloudManager: CloudManager;
  
  // UI elements
  private ui: {
    toolbar: HTMLElement;
    canvas: HTMLElement;
    sidebar: HTMLElement;
    statusBar: HTMLElement;
    modal?: HTMLElement;
  };
  
  // State
  private currentImage: HTMLImageElement | null = null;
  private isDragging = false;
  private history: ImageData[] = [];
  private historyIndex = -1;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    
    // Initialize managers
    this.exportManager = new AdvancedExportManager();
    this.animationManager = globalAnimationManager;
    this.themeManager = globalThemeManager;
    this.cloudManager = new CloudManager();
    
    // Setup UI and features
    this.initializeUI();
    this.setupCloudServices();
    this.bindEvents();
    this.applyInitialTheme();
  }
  
  /**
   * Initialize the complete UI with all features
   */
  private initializeUI(): void {
    this.container.innerHTML = `
      <div class="cropper-container" style="
        display: flex;
        height: 100vh;
        background: var(--color-background-primary);
        color: var(--color-text-primary);
        font-family: var(--font-family-sans);
        transition: background var(--duration-normal) var(--easing-easeOut);
      ">
        <!-- Toolbar -->
        <div class="cropper-toolbar" style="
          width: 60px;
          background: var(--color-surface-secondary);
          border-right: 1px solid var(--color-border-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--spacing-4);
          gap: var(--spacing-3);
        ">
          <button class="tool-btn upload-btn" title="Upload Image">
            📁
          </button>
          <button class="tool-btn crop-btn" title="Crop Tool">
            ✂️
          </button>
          <button class="tool-btn filter-btn" title="Filters">
            🎨
          </button>
          <button class="tool-btn layers-btn" title="Layers">
            📑
          </button>
          <button class="tool-btn text-btn" title="Add Text">
            📝
          </button>
          <button class="tool-btn shapes-btn" title="Add Shapes">
            🔷
          </button>
          
          <div class="divider" style="
            width: 80%;
            height: 1px;
            background: var(--color-border-secondary);
            margin: var(--spacing-2) 0;
          "></div>
          
          <button class="tool-btn undo-btn" title="Undo">
            ↶
          </button>
          <button class="tool-btn redo-btn" title="Redo">
            ↷
          </button>
          
          <div class="divider"></div>
          
          <button class="tool-btn theme-btn" title="Toggle Theme">
            🌓
          </button>
          <button class="tool-btn export-btn" title="Export Options">
            💾
          </button>
          <button class="tool-btn cloud-btn" title="Cloud & Social">
            ☁️
          </button>
        </div>
        
        <!-- Main Content -->
        <div class="cropper-main" style="
          flex: 1;
          display: flex;
          flex-direction: column;
        ">
          <!-- Top Bar -->
          <div class="cropper-topbar" style="
            height: 50px;
            background: var(--color-surface-primary);
            border-bottom: 1px solid var(--color-border-primary);
            display: flex;
            align-items: center;
            padding: 0 var(--spacing-4);
            gap: var(--spacing-4);
          ">
            <h1 style="
              font-size: var(--font-size-lg);
              font-weight: var(--font-weight-semibold);
              margin: 0;
              color: var(--color-text-primary);
            ">Advanced Image Cropper</h1>
            
            <div style="flex: 1;"></div>
            
            <!-- Quick Actions -->
            <button class="quick-btn save-btn">💾 Save</button>
            <button class="quick-btn share-btn">🔗 Share</button>
            <button class="quick-btn batch-btn">📚 Batch</button>
          </div>
          
          <!-- Canvas Area -->
          <div class="cropper-canvas-area" style="
            flex: 1;
            display: flex;
            background: var(--color-background-secondary);
            position: relative;
            overflow: hidden;
          ">
            <!-- Canvas Container -->
            <div class="canvas-container" style="
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: var(--spacing-6);
            ">
              <canvas id="main-canvas" style="
                max-width: 100%;
                max-height: 100%;
                box-shadow: var(--shadow-lg);
                border-radius: var(--border-radius-lg);
                transition: transform var(--duration-normal) var(--easing-easeOut);
              "></canvas>
              
              <!-- Drop Zone Overlay -->
              <div class="drop-zone" style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(59, 130, 246, 0.1);
                border: 2px dashed var(--color-brand-primary);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10;
              ">
                <div style="
                  text-align: center;
                  font-size: var(--font-size-xl);
                  color: var(--color-brand-primary);
                ">
                  📁 Drop your image here
                </div>
              </div>
            </div>
            
            <!-- Right Sidebar -->
            <div class="cropper-sidebar" style="
              width: 300px;
              background: var(--color-surface-primary);
              border-left: 1px solid var(--color-border-primary);
              display: flex;
              flex-direction: column;
              transform: translateX(100%);
              transition: transform var(--duration-normal) var(--easing-easeOut);
            ">
              <!-- Sidebar Content will be dynamically populated -->
            </div>
          </div>
          
          <!-- Status Bar -->
          <div class="cropper-statusbar" style="
            height: 30px;
            background: var(--color-surface-secondary);
            border-top: 1px solid var(--color-border-primary);
            display: flex;
            align-items: center;
            padding: 0 var(--spacing-4);
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
          ">
            <span id="status-text">Ready</span>
            <div style="flex: 1;"></div>
            <span id="image-info"></span>
          </div>
        </div>
      </div>
    `;
    
    // Cache UI elements
    this.ui = {
      toolbar: this.container.querySelector('.cropper-toolbar')!,
      canvas: this.container.querySelector('.canvas-container')!,
      sidebar: this.container.querySelector('.cropper-sidebar')!,
      statusBar: this.container.querySelector('.cropper-statusbar')!
    };
    
    // Move canvas to container
    const canvasContainer = this.container.querySelector('#main-canvas')!;
    canvasContainer.replaceWith(this.canvas);
    this.canvas.id = 'main-canvas';
    this.canvas.style.cssText = canvasContainer.getAttribute('style') || '';
  }
  
  /**
   * Setup cloud services
   */
  private setupCloudServices(): void {
    // Register cloud storage services
    this.cloudManager.registerCloudService(CloudService.GOOGLE_DRIVE, {
      clientId: 'your-google-drive-client-id',
      scope: 'https://www.googleapis.com/auth/drive.file'
    });
    
    this.cloudManager.registerCloudService(CloudService.DROPBOX, {
      appKey: 'your-dropbox-app-key'
    });
    
    // Register social media services
    this.cloudManager.registerSocialService(SocialMediaService.FACEBOOK, {
      appId: 'your-facebook-app-id'
    });
    
    this.cloudManager.registerSocialService(SocialMediaService.TWITTER, {
      consumerKey: 'your-twitter-consumer-key'
    });
  }
  
  /**
   * Bind all event handlers
   */
  private bindEvents(): void {
    // Toolbar button events
    this.bindToolbarEvents();
    
    // Canvas events
    this.bindCanvasEvents();
    
    // File drop events
    this.bindDropEvents();
    
    // Keyboard shortcuts
    this.bindKeyboardEvents();
    
    // Theme change events
    this.themeManager.subscribe((theme) => {
      this.onThemeChange(theme);
    });
    
    // Cloud manager events
    this.cloudManager.on('uploadStart', (event) => {
      this.updateStatus(`Uploading to ${event.service}...`);
    });
    
    this.cloudManager.on('uploadComplete', (event) => {
      this.updateStatus(`Upload complete: ${event.url}`);
      this.showNotification('Upload successful!', 'success');
    });
    
    this.cloudManager.on('uploadError', (event) => {
      this.updateStatus(`Upload failed: ${event.error}`);
      this.showNotification('Upload failed', 'error');
    });
  }
  
  /**
   * Bind toolbar button events
   */
  private bindToolbarEvents(): void {
    // Upload button
    this.ui.toolbar.querySelector('.upload-btn')?.addEventListener('click', () => {
      this.triggerFileUpload();
    });
    
    // Theme toggle button
    this.ui.toolbar.querySelector('.theme-btn')?.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Export button
    this.ui.toolbar.querySelector('.export-btn')?.addEventListener('click', () => {
      this.showExportOptions();
    });
    
    // Cloud button
    this.ui.toolbar.querySelector('.cloud-btn')?.addEventListener('click', () => {
      this.showCloudOptions();
    });
    
    // Filter button
    this.ui.toolbar.querySelector('.filter-btn')?.addEventListener('click', () => {
      this.showFilterOptions();
    });
    
    // Undo/Redo buttons
    this.ui.toolbar.querySelector('.undo-btn')?.addEventListener('click', () => {
      this.undo();
    });
    
    this.ui.toolbar.querySelector('.redo-btn')?.addEventListener('click', () => {
      this.redo();
    });
  }
  
  /**
   * Bind canvas events
   */
  private bindCanvasEvents(): void {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      // Handle crop start, etc.
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        // Handle crop drag, etc.
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }
  
  /**
   * Bind file drop events
   */
  private bindDropEvents(): void {
    const dropZone = this.container.querySelector('.drop-zone')!;
    const canvasArea = this.container.querySelector('.cropper-canvas-area')!;
    
    canvasArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.display = 'flex';
    });
    
    canvasArea.addEventListener('dragleave', (e) => {
      if (!canvasArea.contains(e.relatedTarget as Node)) {
        dropZone.style.display = 'none';
      }
    });
    
    canvasArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.display = 'none';
      
      const files = Array.from(e.dataTransfer?.files || []);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length > 0) {
        this.loadImage(imageFiles[0]);
      }
    });
  }
  
  /**
   * Bind keyboard shortcuts
   */
  private bindKeyboardEvents(): void {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.code) {
          case 'KeyZ':
            e.preventDefault();
            if (e.shiftKey) {
              this.redo();
            } else {
              this.undo();
            }
            break;
          case 'KeyS':
            e.preventDefault();
            this.quickSave();
            break;
          case 'KeyE':
            e.preventDefault();
            this.showExportOptions();
            break;
          case 'KeyT':
            e.preventDefault();
            this.toggleTheme();
            break;
        }
      }
    });
  }
  
  /**
   * Apply initial theme
   */
  private applyInitialTheme(): void {
    // Add smooth transitions to all elements
    const style = document.createElement('style');
    style.textContent = `
      .cropper-container * {
        transition: 
          background-color var(--duration-normal) var(--easing-easeOut),
          color var(--duration-normal) var(--easing-easeOut),
          border-color var(--duration-normal) var(--easing-easeOut),
          box-shadow var(--duration-normal) var(--easing-easeOut);
      }
      
      .tool-btn, .quick-btn {
        background: var(--color-surface-primary);
        border: 1px solid var(--color-border-secondary);
        border-radius: var(--border-radius-md);
        padding: var(--spacing-2) var(--spacing-3);
        cursor: pointer;
        font-size: var(--font-size-sm);
        color: var(--color-text-primary);
        transition: all var(--duration-fast) var(--easing-easeOut);
      }
      
      .tool-btn:hover, .quick-btn:hover {
        background: var(--color-interactive-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
      
      .tool-btn:active, .quick-btn:active {
        transform: translateY(0);
        background: var(--color-interactive-pressed);
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Load and display an image
   */
  async loadImage(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.currentImage = img;
          this.resizeCanvasToImage(img);
          this.drawImage(img);
          this.saveToHistory();
          this.updateImageInfo(img, file);
          
          // Animate image appearance
          this.animationManager.animate(this.canvas, AnimationPresets.zoomIn, () => {
            this.updateStatus('Image loaded successfully');
            resolve();
          });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Resize canvas to fit image
   */
  private resizeCanvasToImage(img: HTMLImageElement): void {
    const maxWidth = 800;
    const maxHeight = 600;
    
    let { width, height } = img;
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    
    if (ratio < 1) {
      width *= ratio;
      height *= ratio;
    }
    
    this.canvas.width = width;
    this.canvas.height = height;
  }
  
  /**
   * Draw image on canvas
   */
  private drawImage(img: HTMLImageElement): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Trigger file upload dialog
   */
  private triggerFileUpload(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.addEventListener('change', async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      
      if (files.length === 1) {
        await this.loadImage(files[0]);
      } else if (files.length > 1) {
        this.showBatchProcessingModal(files);
      }
    });
    
    input.click();
  }
  
  /**
   * Toggle between light and dark theme
   */
  private toggleTheme(): void {
    // Animate theme button
    const themeBtn = this.ui.toolbar.querySelector('.theme-btn')!;
    this.animationManager.animate(themeBtn as HTMLElement, AnimationPresets.pulse);
    
    // Toggle theme
    this.themeManager.toggleTheme();
  }
  
  /**
   * Show export options modal
   */
  private async showExportOptions(): Promise<void> {
    if (!this.currentImage) {
      this.showNotification('Please load an image first', 'warning');
      return;
    }
    
    const modal = this.createModal('Export Options', `
      <div class="export-options" style="padding: var(--spacing-4);">
        <h3 style="margin: 0 0 var(--spacing-4) 0;">Quick Export Presets</h3>
        
        <div class="preset-buttons" style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--spacing-3);
          margin-bottom: var(--spacing-6);
        ">
          <button class="preset-btn" data-preset="WEB_LARGE">🌐 Web Large</button>
          <button class="preset-btn" data-preset="WEB_MEDIUM">📱 Web Medium</button>
          <button class="preset-btn" data-preset="WEB_THUMBNAIL">🖼️ Thumbnail</button>
          <button class="preset-btn" data-preset="INSTAGRAM_SQUARE">📷 Instagram</button>
          <button class="preset-btn" data-preset="FACEBOOK_POST">📘 Facebook</button>
          <button class="preset-btn" data-preset="TWITTER_POST">🐦 Twitter</button>
        </div>
        
        <div class="custom-export" style="
          border-top: 1px solid var(--color-border-secondary);
          padding-top: var(--spacing-4);
        ">
          <h4 style="margin: 0 0 var(--spacing-3) 0;">Custom Export</h4>
          
          <div class="form-row" style="display: flex; gap: var(--spacing-3); margin-bottom: var(--spacing-3);">
            <label style="flex: 1;">
              Format:
              <select id="export-format" style="width: 100%; padding: var(--spacing-2);">
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
                <option value="image/avif">AVIF</option>
              </select>
            </label>
            
            <label style="flex: 1;">
              Quality:
              <input type="range" id="export-quality" min="0" max="1" step="0.1" value="0.9" style="width: 100%;">
            </label>
          </div>
          
          <div class="form-row" style="display: flex; gap: var(--spacing-3); margin-bottom: var(--spacing-3);">
            <label style="flex: 1;">
              Width:
              <input type="number" id="export-width" placeholder="Auto" style="width: 100%; padding: var(--spacing-2);">
            </label>
            
            <label style="flex: 1;">
              Height:
              <input type="number" id="export-height" placeholder="Auto" style="width: 100%; padding: var(--spacing-2);">
            </label>
          </div>
          
          <div class="watermark-options" style="margin-bottom: var(--spacing-4);">
            <label style="display: flex; align-items: center; gap: var(--spacing-2);">
              <input type="checkbox" id="add-watermark">
              Add Watermark
            </label>
            
            <div id="watermark-controls" style="
              margin-top: var(--spacing-3);
              padding: var(--spacing-3);
              background: var(--color-surface-secondary);
              border-radius: var(--border-radius-md);
              display: none;
            ">
              <input type="text" id="watermark-text" placeholder="Enter watermark text" style="
                width: 100%;
                padding: var(--spacing-2);
                margin-bottom: var(--spacing-2);
              ">
              <input type="range" id="watermark-opacity" min="0" max="1" step="0.1" value="0.8" style="width: 100%;">
            </div>
          </div>
          
          <button id="custom-export-btn" class="primary-btn" style="
            width: 100%;
            padding: var(--spacing-3);
            background: var(--color-brand-primary);
            color: white;
            border: none;
            border-radius: var(--border-radius-md);
            cursor: pointer;
          ">Export with Custom Settings</button>
        </div>
      </div>
    `);
    
    this.bindExportEvents(modal);
  }
  
  /**
   * Bind export modal events
   */
  private bindExportEvents(modal: HTMLElement): void {
    // Preset buttons
    modal.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const preset = (e.target as HTMLElement).dataset.preset;
        if (preset) {
          await this.exportWithPreset(preset);
          this.closeModal();
        }
      });
    });
    
    // Watermark checkbox
    const watermarkCheckbox = modal.querySelector('#add-watermark') as HTMLInputElement;
    const watermarkControls = modal.querySelector('#watermark-controls')!;
    
    watermarkCheckbox.addEventListener('change', () => {
      watermarkControls.style.display = watermarkCheckbox.checked ? 'block' : 'none';
    });
    
    // Custom export button
    modal.querySelector('#custom-export-btn')?.addEventListener('click', async () => {
      await this.exportWithCustomSettings(modal);
      this.closeModal();
    });
  }
  
  /**
   * Export with predefined preset
   */
  private async exportWithPreset(presetName: string): Promise<void> {
    const preset = (ExportPresets as any)[presetName];
    if (!preset || !this.currentImage) return;
    
    try {
      this.updateStatus('Exporting...');
      const result = await this.exportManager.exportImage(this.currentImage, preset);
      this.downloadFile(result.blob, result.filename);
      this.showNotification(`Exported as ${result.filename}`, 'success');
    } catch (error) {
      this.showNotification('Export failed', 'error');
      console.error('Export error:', error);
    }
  }
  
  /**
   * Export with custom settings
   */
  private async exportWithCustomSettings(modal: HTMLElement): Promise<void> {
    if (!this.currentImage) return;
    
    const format = (modal.querySelector('#export-format') as HTMLSelectElement).value as ExportFormat;
    const quality = parseFloat((modal.querySelector('#export-quality') as HTMLInputElement).value);
    const width = parseInt((modal.querySelector('#export-width') as HTMLInputElement).value) || undefined;
    const height = parseInt((modal.querySelector('#export-height') as HTMLInputElement).value) || undefined;
    const addWatermark = (modal.querySelector('#add-watermark') as HTMLInputElement).checked;
    
    const options: any = {
      format,
      compression: { level: CompressionLevel.MEDIUM, quality },
      dimensions: width || height ? { width, height } : undefined
    };
    
    if (addWatermark) {
      const text = (modal.querySelector('#watermark-text') as HTMLInputElement).value || 'Watermark';
      const opacity = parseFloat((modal.querySelector('#watermark-opacity') as HTMLInputElement).value);
      
      options.watermark = {
        type: 'text',
        content: text,
        position: WatermarkPosition.BOTTOM_RIGHT,
        opacity,
        scale: 0.1
      };
    }
    
    try {
      this.updateStatus('Exporting with custom settings...');
      const result = await this.exportManager.exportImage(this.currentImage, options);
      this.downloadFile(result.blob, result.filename);
      this.showNotification(`Exported as ${result.filename}`, 'success');
    } catch (error) {
      this.showNotification('Export failed', 'error');
      console.error('Export error:', error);
    }
  }
  
  /**
   * Show cloud and social media options
   */
  private showCloudOptions(): void {
    const cloudUI = createCloudStorageUI(this.cloudManager, {
      theme: 'auto',
      mode: 'modal',
      showHistory: true
    });
    
    cloudUI.show();
  }
  
  /**
   * Show filter options
   */
  private showFilterOptions(): void {
    this.toggleSidebar();
    
    this.ui.sidebar.innerHTML = `
      <div class="sidebar-header" style="
        padding: var(--spacing-4);
        border-bottom: 1px solid var(--color-border-secondary);
      ">
        <h3 style="margin: 0; display: flex; align-items: center; justify-content: space-between;">
          Filters & Effects
          <button class="close-sidebar-btn" style="
            background: none;
            border: none;
            font-size: var(--font-size-lg);
            cursor: pointer;
            color: var(--color-text-secondary);
          ">×</button>
        </h3>
      </div>
      
      <div class="sidebar-content" style="padding: var(--spacing-4);">
        <div class="filter-section">
          <h4>Basic Adjustments</h4>
          
          <label>
            Brightness:
            <input type="range" id="brightness" min="-100" max="100" value="0" style="width: 100%;">
          </label>
          
          <label>
            Contrast:
            <input type="range" id="contrast" min="-100" max="100" value="0" style="width: 100%;">
          </label>
          
          <label>
            Saturation:
            <input type="range" id="saturation" min="-100" max="100" value="0" style="width: 100%;">
          </label>
        </div>
        
        <div class="filter-presets" style="margin-top: var(--spacing-4);">
          <h4>Filter Presets</h4>
          
          <div class="preset-grid" style="
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-2);
          ">
            <button class="filter-preset-btn" data-filter="vintage">🎞️ Vintage</button>
            <button class="filter-preset-btn" data-filter="bw">⚫ B&W</button>
            <button class="filter-preset-btn" data-filter="sepia">🟤 Sepia</button>
            <button class="filter-preset-btn" data-filter="cool">❄️ Cool</button>
            <button class="filter-preset-btn" data-filter="warm">🔥 Warm</button>
            <button class="filter-preset-btn" data-filter="dramatic">⚡ Dramatic</button>
          </div>
        </div>
      </div>
    `;
    
    this.bindFilterEvents();
  }
  
  /**
   * Bind filter events
   */
  private bindFilterEvents(): void {
    const sidebar = this.ui.sidebar;
    
    // Close sidebar
    sidebar.querySelector('.close-sidebar-btn')?.addEventListener('click', () => {
      this.toggleSidebar();
    });
    
    // Filter sliders
    ['brightness', 'contrast', 'saturation'].forEach(filterId => {
      const slider = sidebar.querySelector(`#${filterId}`) as HTMLInputElement;
      slider?.addEventListener('input', () => {
        this.applyFilters();
      });
    });
    
    // Filter presets
    sidebar.querySelectorAll('.filter-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = (e.target as HTMLElement).dataset.filter;
        if (filter) {
          this.applyFilterPreset(filter);
        }
      });
    });
  }
  
  /**
   * Apply current filter settings
   */
  private applyFilters(): void {
    if (!this.currentImage) return;
    
    const brightness = parseInt((this.ui.sidebar.querySelector('#brightness') as HTMLInputElement)?.value || '0');
    const contrast = parseInt((this.ui.sidebar.querySelector('#contrast') as HTMLInputElement)?.value || '0');
    const saturation = parseInt((this.ui.sidebar.querySelector('#saturation') as HTMLInputElement)?.value || '0');
    
    // Apply filters to canvas
    this.drawImage(this.currentImage);
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    // Simple filter application (in production, use WebGL for performance)
    for (let i = 0; i < data.length; i += 4) {
      // Brightness
      data[i] = Math.max(0, Math.min(255, data[i] + brightness * 2.55));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness * 2.55));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness * 2.55));
      
      // Contrast
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      data[i] = Math.max(0, Math.min(255, contrastFactor * (data[i] - 128) + 128));
      data[i + 1] = Math.max(0, Math.min(255, contrastFactor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.max(0, Math.min(255, contrastFactor * (data[i + 2] - 128) + 128));
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }
  
  /**
   * Apply filter preset
   */
  private applyFilterPreset(preset: string): void {
    // Animate filter application
    this.animationManager.animate(this.canvas, {
      ...AnimationPresets.pulse,
      duration: 300
    });
    
    // Apply preset filters
    const filters: { [key: string]: string } = {
      'vintage': 'sepia(0.5) contrast(1.2) brightness(1.1)',
      'bw': 'grayscale(1) contrast(1.1)',
      'sepia': 'sepia(1)',
      'cool': 'hue-rotate(180deg) saturate(1.2)',
      'warm': 'hue-rotate(-30deg) saturate(1.1) brightness(1.05)',
      'dramatic': 'contrast(1.5) brightness(0.9) saturate(1.3)'
    };
    
    if (filters[preset]) {
      this.canvas.style.filter = filters[preset];
    }
  }
  
  /**
   * Toggle sidebar visibility
   */
  private toggleSidebar(): void {
    const sidebar = this.ui.sidebar;
    const isVisible = sidebar.style.transform === 'translateX(0px)' || !sidebar.style.transform.includes('translateX');
    
    this.animationManager.transition(sidebar, TransitionPresets.medium, {
      transform: isVisible ? 'translateX(100%)' : 'translateX(0)'
    });
  }
  
  /**
   * Save current state to history
   */
  private saveToHistory(): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Remove any future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    this.history.push(imageData);
    this.historyIndex = this.history.length - 1;
    
    // Limit history size
    if (this.history.length > 20) {
      this.history.shift();
      this.historyIndex--;
    }
  }
  
  /**
   * Undo last action
   */
  private undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const imageData = this.history[this.historyIndex];
      this.ctx.putImageData(imageData, 0, 0);
      
      // Animate undo
      this.animationManager.animate(this.canvas, {
        ...AnimationPresets.shake,
        duration: 200,
        iterations: 1
      });
      
      this.updateStatus('Undone');
    }
  }
  
  /**
   * Redo last undone action
   */
  private redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const imageData = this.history[this.historyIndex];
      this.ctx.putImageData(imageData, 0, 0);
      
      // Animate redo
      this.animationManager.animate(this.canvas, {
        ...AnimationPresets.wobble,
        duration: 300,
        iterations: 1
      });
      
      this.updateStatus('Redone');
    }
  }
  
  /**
   * Quick save current image
   */
  private async quickSave(): Promise<void> {
    if (!this.currentImage) {
      this.showNotification('No image to save', 'warning');
      return;
    }
    
    try {
      const result = await this.exportManager.exportImage(
        this.currentImage, 
        ExportPresets.WEB_LARGE
      );
      
      this.downloadFile(result.blob, result.filename);
      this.showNotification('Image saved!', 'success');
    } catch (error) {
      this.showNotification('Save failed', 'error');
    }
  }
  
  /**
   * Show batch processing modal
   */
  private showBatchProcessingModal(files: File[]): void {
    const modal = this.createModal(`Batch Process ${files.length} Images`, `
      <div class="batch-options" style="padding: var(--spacing-4);">
        <div class="file-list" style="
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid var(--color-border-secondary);
          border-radius: var(--border-radius-md);
          padding: var(--spacing-3);
          margin-bottom: var(--spacing-4);
        ">
          ${files.map(file => `
            <div class="file-item" style="
              display: flex;
              align-items: center;
              gap: var(--spacing-2);
              padding: var(--spacing-1) 0;
            ">
              <span>📁</span>
              <span>${file.name}</span>
              <span style="margin-left: auto; color: var(--color-text-secondary);">
                ${(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          `).join('')}
        </div>
        
        <div class="batch-settings">
          <h4>Batch Settings</h4>
          
          <label>
            Export Format:
            <select id="batch-format">
              <option value="image/webp">WebP (Recommended)</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
            </select>
          </label>
          
          <label>
            Max Dimensions:
            <select id="batch-size">
              <option value="1920x1080">1920×1080 (Full HD)</option>
              <option value="1200x800">1200×800 (Web Large)</option>
              <option value="800x600">800×600 (Web Medium)</option>
              <option value="400x300">400×300 (Thumbnail)</option>
            </select>
          </label>
          
          <button id="start-batch-btn" class="primary-btn" style="
            width: 100%;
            margin-top: var(--spacing-4);
            padding: var(--spacing-3);
            background: var(--color-brand-primary);
            color: white;
            border: none;
            border-radius: var(--border-radius-md);
            cursor: pointer;
          ">
            Start Batch Processing
          </button>
        </div>
      </div>
    `);
    
    modal.querySelector('#start-batch-btn')?.addEventListener('click', () => {
      this.startBatchProcessing(files, modal);
    });
  }
  
  /**
   * Start batch processing
   */
  private async startBatchProcessing(files: File[], modal: HTMLElement): Promise<void> {
    const format = (modal.querySelector('#batch-format') as HTMLSelectElement).value as ExportFormat;
    const sizeOption = (modal.querySelector('#batch-size') as HTMLSelectElement).value;
    const [maxWidth, maxHeight] = sizeOption.split('x').map(Number);
    
    // Convert files to image sources
    const imageSources: HTMLImageElement[] = [];
    
    for (const file of files) {
      const img = await this.fileToImage(file);
      imageSources.push(img);
    }
    
    const options = {
      format,
      dimensions: { maxWidth, maxHeight, maintainAspectRatio: true },
      compression: { level: CompressionLevel.MEDIUM },
      namePattern: 'processed_{index}',
      timestamp: true
    };
    
    // Show progress
    modal.innerHTML = `
      <div class="batch-progress" style="padding: var(--spacing-4); text-align: center;">
        <h3>Processing Images...</h3>
        <div class="progress-bar" style="
          width: 100%;
          height: 8px;
          background: var(--color-surface-secondary);
          border-radius: var(--border-radius-full);
          margin: var(--spacing-4) 0;
          overflow: hidden;
        ">
          <div id="progress-fill" style="
            height: 100%;
            background: var(--color-brand-primary);
            width: 0%;
            transition: width var(--duration-normal) var(--easing-easeOut);
          "></div>
        </div>
        <div id="progress-text">0 of ${files.length} processed</div>
      </div>
    `;
    
    try {
      const results = await this.exportManager.exportBatch(
        imageSources,
        options,
        (progress) => {
          const progressFill = modal.querySelector('#progress-fill')!;
          const progressText = modal.querySelector('#progress-text')!;
          
          const percentage = (progress.current / progress.total) * 100;
          (progressFill as HTMLElement).style.width = `${percentage}%`;
          progressText.textContent = `${progress.current} of ${progress.total} processed`;
          
          if (progress.status === 'completed') {
            this.updateStatus(`Processed: ${progress.filename}`);
          }
        }
      );
      
      // Download all results
      results.forEach(result => {
        this.downloadFile(result.blob, result.filename);
      });
      
      this.closeModal();
      this.showNotification(`Batch processing complete! ${results.length} images exported.`, 'success');
      
    } catch (error) {
      this.showNotification('Batch processing failed', 'error');
      console.error('Batch processing error:', error);
    }
  }
  
  /**
   * Convert file to image
   */
  private fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Create modal dialog
   */
  private createModal(title: string, content: string): HTMLElement {
    if (this.ui.modal) {
      this.closeModal();
    }
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--color-background-overlay);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity var(--duration-normal) var(--easing-easeOut);
    `;
    
    modal.innerHTML = `
      <div class="modal-content" style="
        background: var(--color-surface-primary);
        border-radius: var(--border-radius-xl);
        box-shadow: var(--shadow-2xl);
        max-width: 90vw;
        max-height: 90vh;
        overflow: auto;
        transform: scale(0.9);
        transition: transform var(--duration-normal) var(--easing-easeOut);
      ">
        <div class="modal-header" style="
          padding: var(--spacing-4);
          border-bottom: 1px solid var(--color-border-secondary);
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <h2 style="margin: 0; color: var(--color-text-primary);">${title}</h2>
          <button class="modal-close" style="
            background: none;
            border: none;
            font-size: var(--font-size-xl);
            cursor: pointer;
            color: var(--color-text-secondary);
            padding: var(--spacing-1);
          ">×</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.ui.modal = modal;
    
    // Animate modal appearance
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      (modal.querySelector('.modal-content') as HTMLElement).style.transform = 'scale(1)';
    });
    
    // Close modal events
    modal.querySelector('.modal-close')?.addEventListener('click', () => {
      this.closeModal();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
    
    return modal;
  }
  
  /**
   * Close modal dialog
   */
  private closeModal(): void {
    if (this.ui.modal) {
      this.animationManager.animate(this.ui.modal, AnimationPresets.fadeOut, () => {
        if (this.ui.modal) {
          document.body.removeChild(this.ui.modal);
          this.ui.modal = undefined;
        }
      });
    }
  }
  
  /**
   * Download file
   */
  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Show notification
   */
  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const notification = document.createElement('div');
    
    const colors = {
      success: 'var(--color-semantic-success)',
      error: 'var(--color-semantic-error)',
      warning: 'var(--color-semantic-warning)',
      info: 'var(--color-semantic-info)'
    };
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: var(--spacing-4);
      right: var(--spacing-4);
      background: var(--color-surface-elevated);
      color: var(--color-text-primary);
      padding: var(--spacing-3) var(--spacing-4);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      border-left: 4px solid ${colors[type]};
      z-index: 2000;
      transform: translateX(100%);
      transition: transform var(--duration-normal) var(--easing-easeOut);
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: var(--spacing-2);">
        <span>${icons[type]}</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  /**
   * Update status bar
   */
  private updateStatus(message: string): void {
    const statusText = this.ui.statusBar.querySelector('#status-text')!;
    statusText.textContent = message;
    
    // Animate status update
    this.animationManager.animate(statusText as HTMLElement, {
      ...AnimationPresets.pulse,
      duration: 200,
      iterations: 1
    });
  }
  
  /**
   * Update image info in status bar
   */
  private updateImageInfo(img: HTMLImageElement, file: File): void {
    const imageInfo = this.ui.statusBar.querySelector('#image-info')!;
    imageInfo.textContent = `${img.naturalWidth}×${img.naturalHeight} | ${(file.size / 1024 / 1024).toFixed(1)} MB | ${file.name}`;
  }
  
  /**
   * Handle theme change
   */
  private onThemeChange(theme: any): void {
    // Animate theme transition
    const elements = this.container.querySelectorAll('*');
    elements.forEach(el => {
      if (el instanceof HTMLElement) {
        this.animationManager.animate(el, {
          ...AnimationPresets.fadeIn,
          duration: 150
        });
      }
    });
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    this.exportManager.dispose();
    this.animationManager.cancelAllAnimations();
    this.themeManager.dispose();
    this.cloudManager.dispose();
    
    if (this.ui.modal) {
      this.closeModal();
    }
  }
}

// Usage example
export function createAdvancedImageCropper(container: HTMLElement): AdvancedImageCropper {
  return new AdvancedImageCropper(container);
}

// Demo initialization
export function initializeDemo(): void {
  const container = document.getElementById('cropper-app');
  if (container) {
    const cropper = createAdvancedImageCropper(container);
    
    // Add some demo content
    console.log('🎨 Advanced Image Cropper initialized with all features:');
    console.log('✅ Advanced Export Options (multiple formats, watermarks, compression)');
    console.log('✅ Smooth Animations & Transitions');
    console.log('✅ Complete Theme System (dark/light mode, custom themes)');
    console.log('✅ Cloud Storage Integration');
    console.log('✅ Batch Processing');
    console.log('✅ Undo/Redo System');
    console.log('✅ Real-time Filters');
    console.log('✅ Drag & Drop Support');
    console.log('✅ Keyboard Shortcuts');
    console.log('✅ Responsive Design');
    
    return cropper;
  }
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDemo);
} else if (typeof window !== 'undefined') {
  initializeDemo();
}
