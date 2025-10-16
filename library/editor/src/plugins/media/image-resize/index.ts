import { Plugin } from '../../../core/Plugin';
import { Editor } from '../../../core/Editor';
import './styles.css';

export interface ImageResizeOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  preserveAspectRatio?: boolean;
  showDimensions?: boolean;
}

export class ImageResizePlugin extends Plugin {
  name = 'imageResize';
  config = {
    name: 'imageResize',
    commands: {},
    keys: {}
  };
  private options: ImageResizeOptions;
  private currentImage: HTMLImageElement | null = null;
  private resizeOverlay: HTMLElement | null = null;
  private isResizing = false;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;
  private resizeHandle = '';
  private aspectRatio = 1;
  private dimensionsDisplay: HTMLElement | null = null;

  constructor(options: ImageResizeOptions = {}) {
    super();
    this.options = {
      minWidth: 50,
      minHeight: 50,
      maxWidth: 2000,
      maxHeight: 2000,
      preserveAspectRatio: true,
      showDimensions: true,
      ...options
    };
  }

  install(editor: Editor): void {
    super.install(editor);
    this.editor = editor;
    this.bindEvents();
    console.log('[ImageResizePlugin] Installed with options:', this.options);
  }

  private bindEvents(): void {
    const editorElement = this.editor.contentElement;
    if (!editorElement) return;

    // Click on image to show resize handles
    editorElement.addEventListener('click', this.handleImageClick.bind(this));
    
    // Mouse move for resizing
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    
    // Mouse up to stop resizing
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Key press to cancel resize
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Editor blur to hide overlay
    editorElement.addEventListener('blur', () => {
      setTimeout(() => this.hideResizeOverlay(), 200);
    });

    // Double click to edit properties (already handled by media context menu)
    editorElement.addEventListener('dblclick', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        this.hideResizeOverlay();
      }
    });

    console.log('[ImageResizePlugin] Events bound');
  }

  private handleImageClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    
    // Check if clicked on image
    if (target.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
      this.showResizeOverlay(target as HTMLImageElement);
    } else if (!this.isResizing && !this.isResizeHandle(target)) {
      // Clicked elsewhere, hide overlay
      this.hideResizeOverlay();
    }
  }

  private isResizeHandle(element: HTMLElement): boolean {
    return element.classList.contains('image-resize-handle') || 
           (element.parentElement?.classList.contains('image-resize-overlay') ?? false);
  }

  private showResizeOverlay(img: HTMLImageElement): void {
    console.log('[ImageResizePlugin] Showing resize overlay for image:', img.src);
    
    // Hide existing overlay if any
    this.hideResizeOverlay();
    
    this.currentImage = img;
    
    // Create overlay container
    this.resizeOverlay = document.createElement('div');
    this.resizeOverlay.className = 'image-resize-overlay';
    
    // Position overlay over image
    this.updateOverlayPosition();
    
    // Create resize handles
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    handles.forEach(handle => {
      const handleElement = document.createElement('div');
      handleElement.className = `image-resize-handle handle-${handle}`;
      handleElement.dataset.handle = handle;
      handleElement.addEventListener('mousedown', this.startResize.bind(this));
      this.resizeOverlay.appendChild(handleElement);
    });
    
    // Add dimensions display
    if (this.options.showDimensions) {
      this.dimensionsDisplay = document.createElement('div');
      this.dimensionsDisplay.className = 'image-resize-dimensions';
      this.updateDimensionsDisplay();
      this.resizeOverlay.appendChild(this.dimensionsDisplay);
    }
    
    // Add overlay to editor
    const editorElement = this.editor.contentElement;
    if (editorElement) {
      editorElement.appendChild(this.resizeOverlay);
    }
    
    // Store original aspect ratio
    this.aspectRatio = img.naturalWidth / img.naturalHeight;
  }

  private hideResizeOverlay(): void {
    if (this.resizeOverlay) {
      console.log('[ImageResizePlugin] Hiding resize overlay');
      this.resizeOverlay.remove();
      this.resizeOverlay = null;
      this.currentImage = null;
      this.dimensionsDisplay = null;
    }
  }

  private updateOverlayPosition(): void {
    if (!this.resizeOverlay || !this.currentImage) return;
    
    const editorElement = this.editor.contentElement;
    if (!editorElement) return;
    
    const editorRect = editorElement.getBoundingClientRect();
    const imgRect = this.currentImage.getBoundingClientRect();
    
    this.resizeOverlay.style.left = `${imgRect.left - editorRect.left + editorElement.scrollLeft}px`;
    this.resizeOverlay.style.top = `${imgRect.top - editorRect.top + editorElement.scrollTop}px`;
    this.resizeOverlay.style.width = `${imgRect.width}px`;
    this.resizeOverlay.style.height = `${imgRect.height}px`;
  }

  private updateDimensionsDisplay(): void {
    if (!this.dimensionsDisplay || !this.currentImage) return;
    
    const width = Math.round(this.currentImage.width);
    const height = Math.round(this.currentImage.height);
    this.dimensionsDisplay.textContent = `${width} × ${height}`;
  }

  private startResize(e: MouseEvent): void {
    if (!this.currentImage) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const handle = e.target as HTMLElement;
    this.resizeHandle = handle.dataset.handle || '';
    
    console.log('[ImageResizePlugin] Starting resize with handle:', this.resizeHandle);
    
    this.isResizing = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startWidth = this.currentImage.width;
    this.startHeight = this.currentImage.height;
    
    // Add resizing class for cursor
    document.body.classList.add('image-resizing');
    
    // Prevent text selection while resizing
    e.preventDefault();
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isResizing || !this.currentImage || !this.resizeOverlay) return;
    
    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;
    
    let newWidth = this.startWidth;
    let newHeight = this.startHeight;
    
    // Calculate new dimensions based on handle
    switch (this.resizeHandle) {
      case 'e': // East
        newWidth = this.startWidth + deltaX;
        if (this.options.preserveAspectRatio) {
          newHeight = newWidth / this.aspectRatio;
        }
        break;
        
      case 'w': // West
        newWidth = this.startWidth - deltaX;
        if (this.options.preserveAspectRatio) {
          newHeight = newWidth / this.aspectRatio;
        }
        break;
        
      case 's': // South
        newHeight = this.startHeight + deltaY;
        if (this.options.preserveAspectRatio) {
          newWidth = newHeight * this.aspectRatio;
        }
        break;
        
      case 'n': // North
        newHeight = this.startHeight - deltaY;
        if (this.options.preserveAspectRatio) {
          newWidth = newHeight * this.aspectRatio;
        }
        break;
        
      case 'se': // Southeast
        if (this.options.preserveAspectRatio) {
          // Use the larger delta to maintain aspect ratio
          if (Math.abs(deltaX) > Math.abs(deltaY * this.aspectRatio)) {
            newWidth = this.startWidth + deltaX;
            newHeight = newWidth / this.aspectRatio;
          } else {
            newHeight = this.startHeight + deltaY;
            newWidth = newHeight * this.aspectRatio;
          }
        } else {
          newWidth = this.startWidth + deltaX;
          newHeight = this.startHeight + deltaY;
        }
        break;
        
      case 'sw': // Southwest
        if (this.options.preserveAspectRatio) {
          if (Math.abs(deltaX) > Math.abs(deltaY * this.aspectRatio)) {
            newWidth = this.startWidth - deltaX;
            newHeight = newWidth / this.aspectRatio;
          } else {
            newHeight = this.startHeight + deltaY;
            newWidth = newHeight * this.aspectRatio;
          }
        } else {
          newWidth = this.startWidth - deltaX;
          newHeight = this.startHeight + deltaY;
        }
        break;
        
      case 'ne': // Northeast
        if (this.options.preserveAspectRatio) {
          if (Math.abs(deltaX) > Math.abs(deltaY * this.aspectRatio)) {
            newWidth = this.startWidth + deltaX;
            newHeight = newWidth / this.aspectRatio;
          } else {
            newHeight = this.startHeight - deltaY;
            newWidth = newHeight * this.aspectRatio;
          }
        } else {
          newWidth = this.startWidth + deltaX;
          newHeight = this.startHeight - deltaY;
        }
        break;
        
      case 'nw': // Northwest
        if (this.options.preserveAspectRatio) {
          if (Math.abs(deltaX) > Math.abs(deltaY * this.aspectRatio)) {
            newWidth = this.startWidth - deltaX;
            newHeight = newWidth / this.aspectRatio;
          } else {
            newHeight = this.startHeight - deltaY;
            newWidth = newHeight * this.aspectRatio;
          }
        } else {
          newWidth = this.startWidth - deltaX;
          newHeight = this.startHeight - deltaY;
        }
        break;
    }
    
    // Apply constraints
    newWidth = Math.max(this.options.minWidth!, Math.min(newWidth, this.options.maxWidth!));
    newHeight = Math.max(this.options.minHeight!, Math.min(newHeight, this.options.maxHeight!));
    
    // Apply new dimensions
    this.currentImage.style.width = `${newWidth}px`;
    this.currentImage.style.height = `${newHeight}px`;
      this.currentImage.width = newWidth;
      this.currentImage.height = newHeight;
      
      // 保持图片原有的对齐方式，不自动居�?
      // 如果图片没有明确的对齐样式，默认左对�?
      if (!this.currentImage.style.display && !this.currentImage.style.margin) {
        this.currentImage.style.display = 'inline-block';
        this.currentImage.style.verticalAlign = 'top';
      }
    
    // Update overlay position and dimensions display
    this.updateOverlayPosition();
    this.updateDimensionsDisplay();
    
    // Trigger content change event
    this.editor.emit('change');
  }

  private handleMouseUp(e: MouseEvent): void {
    if (this.isResizing) {
      console.log('[ImageResizePlugin] Resize completed');
      this.isResizing = false;
      document.body.classList.remove('image-resizing');
      
      // Save the final dimensions to the image attributes
      if (this.currentImage) {
        this.currentImage.setAttribute('width', String(this.currentImage.width));
        this.currentImage.setAttribute('height', String(this.currentImage.height));
        
        // Trigger content save
        this.editor.emit('change');
      }
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // ESC key to cancel resize
    if (e.key === 'Escape') {
      if (this.isResizing && this.currentImage) {
        // Restore original dimensions
        this.currentImage.style.width = `${this.startWidth}px`;
        this.currentImage.style.height = `${this.startHeight}px`;
        this.currentImage.width = this.startWidth;
        this.currentImage.height = this.startHeight;
        this.isResizing = false;
        document.body.classList.remove('image-resizing');
      }
      this.hideResizeOverlay();
    }
  }

  destroy(): void {
    this.hideResizeOverlay();
    
    const editorElement = this.editor.contentElement;
    if (editorElement) {
      editorElement.removeEventListener('click', this.handleImageClick.bind(this));
    }
    
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    
    console.log('[ImageResizePlugin] Destroyed');
  }
}

export default ImageResizePlugin
