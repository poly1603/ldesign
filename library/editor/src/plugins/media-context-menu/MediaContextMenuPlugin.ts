import { Plugin } from '../../types';
import { Editor } from '../../core/Editor';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { MediaPropertiesDialog } from './MediaPropertiesDialog';

/**
 * Media Context Menu Plugin
 * Provides right-click context menus for images, videos, and audio elements
 */
export class MediaContextMenuPlugin implements Plugin {
  name = 'MediaContextMenu';
  editor: Editor | null = null;
  private contextMenu: ContextMenu | null = null;
  private propertiesDialog: MediaPropertiesDialog | null = null;

  install(editor: Editor): void {
    this.editor = editor;
    this.propertiesDialog = new MediaPropertiesDialog(editor);
    this.setupContextMenu();
    this.bindEvents();
    console.log('[MediaContextMenu] Plugin installed');
  }

  private setupContextMenu() {
    if (!this.editor) return;

    this.contextMenu = new ContextMenu({
      items: [],
      className: 'media-context-menu',
      onOpen: (target) => {
        console.log('[MediaContextMenu] Menu opened for:', target.tagName);
      },
      onClose: () => {
        console.log('[MediaContextMenu] Menu closed');
      }
    });
  }

  private bindEvents() {
    if (!this.editor || !this.editor.contentElement) return;

    // Prevent default context menu on media elements
    this.editor.contentElement.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      
      if (this.isMediaElement(target)) {
        e.preventDefault();
        e.stopPropagation();
        
        const items = this.getMenuItemsForElement(target);
        if (this.contextMenu && items.length > 0) {
          this.contextMenu.updateItems(items);
          this.contextMenu.open(e.clientX, e.clientY, target);
        }
      }
    });

    // Add double-click to open properties
    this.editor.contentElement.addEventListener('dblclick', (e) => {
      const target = e.target as HTMLElement;
      if (this.isMediaElement(target)) {
        e.preventDefault();
        this.openProperties(target);
      }
    });
  }

  private isMediaElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'img' || tagName === 'video' || tagName === 'audio';
  }

  private getMenuItemsForElement(element: HTMLElement): ContextMenuItem[] {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case 'img':
        return this.getImageMenuItems(element as HTMLImageElement);
      case 'video':
        return this.getVideoMenuItems(element as HTMLVideoElement);
      case 'audio':
        return this.getAudioMenuItems(element as HTMLAudioElement);
      default:
        return [];
    }
  }

  private getImageMenuItems(img: HTMLImageElement): ContextMenuItem[] {
    return [
      {
        id: 'properties',
        label: '图片属性',
        icon: '⚙️',
        shortcut: 'Alt+Enter',
        action: (target) => this.openProperties(target)
      },
      { separator: true },
      {
        id: 'filters',
        label: '滤镜效果',
        icon: '🎨',
        submenu: [
          {
            id: 'filter-none',
            label: '无滤镜',
            checked: !img.style.filter,
            action: (target) => this.applyFilter(target, '')
          },
          { separator: true },
          {
            id: 'filter-grayscale',
            label: '黑白',
            action: (target) => this.applyFilter(target, 'grayscale(100%)')
          },
          {
            id: 'filter-sepia',
            label: '复古',
            action: (target) => this.applyFilter(target, 'sepia(100%)')
          },
          {
            id: 'filter-blur',
            label: '模糊',
            action: (target) => this.applyFilter(target, 'blur(3px)')
          },
          {
            id: 'filter-brightness',
            label: '增亮',
            action: (target) => this.applyFilter(target, 'brightness(1.5)')
          },
          {
            id: 'filter-contrast',
            label: '高对比度',
            action: (target) => this.applyFilter(target, 'contrast(1.5)')
          },
          {
            id: 'filter-invert',
            label: '反色',
            action: (target) => this.applyFilter(target, 'invert(100%)')
          }
        ]
      },
      {
        id: 'size',
        label: '尺寸',
        icon: '📏',
        submenu: [
          {
            id: 'size-small',
            label: '小 (25%)',
            action: (target) => this.setImageSize(target, '25%')
          },
          {
            id: 'size-medium',
            label: '中 (50%)',
            action: (target) => this.setImageSize(target, '50%')
          },
          {
            id: 'size-large',
            label: '大 (75%)',
            action: (target) => this.setImageSize(target, '75%')
          },
          {
            id: 'size-full',
            label: '原始大小',
            action: (target) => this.setImageSize(target, 'auto')
          },
          { separator: true },
          {
            id: 'size-custom',
            label: '自定义...',
            action: (target) => this.openSizeDialog(target)
          }
        ]
      },
      {
        id: 'align',
        label: '对齐方式',
        icon: '↔️',
        submenu: [
          {
            id: 'align-left',
            label: '左对齐',
            action: (target) => this.setAlignment(target, 'left')
          },
          {
            id: 'align-center',
            label: '居中',
            action: (target) => this.setAlignment(target, 'center')
          },
          {
            id: 'align-right',
            label: '右对齐',
            action: (target) => this.setAlignment(target, 'right')
          }
        ]
      },
      {
        id: 'float',
        label: '文字环绕',
        icon: '📝',
        submenu: [
          {
            id: 'float-none',
            label: '无环绕',
            checked: !img.style.float,
            action: (target) => this.setFloat(target, 'none')
          },
          {
            id: 'float-left',
            label: '左侧环绕',
            action: (target) => this.setFloat(target, 'left')
          },
          {
            id: 'float-right',
            label: '右侧环绕',
            action: (target) => this.setFloat(target, 'right')
          }
        ]
      },
      {
        id: 'border',
        label: '边框',
        icon: '🖼️',
        submenu: [
          {
            id: 'border-none',
            label: '无边框',
            checked: !img.style.border,
            action: (target) => this.setBorder(target, 'none')
          },
          {
            id: 'border-thin',
            label: '细边框',
            action: (target) => this.setBorder(target, '1px solid #ccc')
          },
          {
            id: 'border-medium',
            label: '中等边框',
            action: (target) => this.setBorder(target, '2px solid #999')
          },
          {
            id: 'border-thick',
            label: '粗边框',
            action: (target) => this.setBorder(target, '3px solid #666')
          },
          {
            id: 'border-rounded',
            label: '圆角边框',
            action: (target) => {
              this.setBorder(target, '2px solid #999');
              (target as HTMLElement).style.borderRadius = '8px';
            }
          }
        ]
      },
      {
        id: 'shadow',
        label: '阴影',
        icon: '🌑',
        submenu: [
          {
            id: 'shadow-none',
            label: '无阴影',
            checked: !img.style.boxShadow,
            action: (target) => this.setShadow(target, 'none')
          },
          {
            id: 'shadow-small',
            label: '小阴影',
            action: (target) => this.setShadow(target, '0 2px 4px rgba(0,0,0,0.1)')
          },
          {
            id: 'shadow-medium',
            label: '中等阴影',
            action: (target) => this.setShadow(target, '0 4px 8px rgba(0,0,0,0.15)')
          },
          {
            id: 'shadow-large',
            label: '大阴影',
            action: (target) => this.setShadow(target, '0 8px 16px rgba(0,0,0,0.2)')
          }
        ]
      },
      { separator: true },
      {
        id: 'copy-image',
        label: '复制图片',
        icon: '📋',
        shortcut: 'Ctrl+C',
        action: (target) => this.copyImage(target as HTMLImageElement)
      },
      {
        id: 'save-as',
        label: '另存为...',
        icon: '💾',
        shortcut: 'Ctrl+S',
        action: (target) => this.saveImage(target as HTMLImageElement)
      },
      { separator: true },
      {
        id: 'delete',
        label: '删除',
        icon: '🗑️',
        shortcut: 'Delete',
        action: (target) => this.deleteElement(target)
      }
    ];
  }

  private getVideoMenuItems(video: HTMLVideoElement): ContextMenuItem[] {
    return [
      {
        id: 'properties',
        label: '视频属性',
        icon: '⚙️',
        shortcut: 'Alt+Enter',
        action: (target) => this.openProperties(target)
      },
      { separator: true },
      {
        id: 'playback',
        label: '播放控制',
        icon: '▶️',
        submenu: [
          {
            id: 'play-pause',
            label: video.paused ? '播放' : '暂停',
            action: (target) => this.togglePlayPause(target as HTMLVideoElement)
          },
          {
            id: 'mute',
            label: video.muted ? '取消静音' : '静音',
            action: (target) => this.toggleMute(target as HTMLVideoElement)
          },
          { separator: true },
          {
            id: 'speed-0.5',
            label: '0.5x 速度',
            action: (target) => this.setPlaybackSpeed(target as HTMLVideoElement, 0.5)
          },
          {
            id: 'speed-1',
            label: '正常速度',
            checked: video.playbackRate === 1,
            action: (target) => this.setPlaybackSpeed(target as HTMLVideoElement, 1)
          },
          {
            id: 'speed-1.5',
            label: '1.5x 速度',
            action: (target) => this.setPlaybackSpeed(target as HTMLVideoElement, 1.5)
          },
          {
            id: 'speed-2',
            label: '2x 速度',
            action: (target) => this.setPlaybackSpeed(target as HTMLVideoElement, 2)
          }
        ]
      },
      {
        id: 'size',
        label: '尺寸',
        icon: '📏',
        submenu: [
          {
            id: 'size-small',
            label: '小 (320px)',
            action: (target) => this.setVideoSize(target, 320)
          },
          {
            id: 'size-medium',
            label: '中 (640px)',
            action: (target) => this.setVideoSize(target, 640)
          },
          {
            id: 'size-large',
            label: '大 (960px)',
            action: (target) => this.setVideoSize(target, 960)
          },
          {
            id: 'size-full',
            label: '全宽',
            action: (target) => this.setVideoSize(target, -1)
          }
        ]
      },
      {
        id: 'align',
        label: '对齐方式',
        icon: '↔️',
        submenu: [
          {
            id: 'align-left',
            label: '左对齐',
            action: (target) => this.setAlignment(target, 'left')
          },
          {
            id: 'align-center',
            label: '居中',
            action: (target) => this.setAlignment(target, 'center')
          },
          {
            id: 'align-right',
            label: '右对齐',
            action: (target) => this.setAlignment(target, 'right')
          }
        ]
      },
      { separator: true },
      {
        id: 'loop',
        label: '循环播放',
        checked: video.loop,
        action: (target) => this.toggleLoop(target as HTMLVideoElement)
      },
      {
        id: 'controls',
        label: '显示控件',
        checked: video.controls,
        action: (target) => this.toggleControls(target as HTMLVideoElement)
      },
      { separator: true },
      {
        id: 'delete',
        label: '删除',
        icon: '🗑️',
        shortcut: 'Delete',
        action: (target) => this.deleteElement(target)
      }
    ];
  }

  private getAudioMenuItems(audio: HTMLAudioElement): ContextMenuItem[] {
    return [
      {
        id: 'properties',
        label: '音频属性',
        icon: '⚙️',
        shortcut: 'Alt+Enter',
        action: (target) => this.openProperties(target)
      },
      { separator: true },
      {
        id: 'playback',
        label: '播放控制',
        icon: '🎵',
        submenu: [
          {
            id: 'play-pause',
            label: audio.paused ? '播放' : '暂停',
            action: (target) => this.togglePlayPause(target as HTMLAudioElement)
          },
          {
            id: 'mute',
            label: audio.muted ? '取消静音' : '静音',
            action: (target) => this.toggleMute(target as HTMLAudioElement)
          },
          { separator: true },
          {
            id: 'speed-0.5',
            label: '0.5x 速度',
            action: (target) => this.setPlaybackSpeed(target as HTMLAudioElement, 0.5)
          },
          {
            id: 'speed-1',
            label: '正常速度',
            checked: audio.playbackRate === 1,
            action: (target) => this.setPlaybackSpeed(target as HTMLAudioElement, 1)
          },
          {
            id: 'speed-1.5',
            label: '1.5x 速度',
            action: (target) => this.setPlaybackSpeed(target as HTMLAudioElement, 1.5)
          },
          {
            id: 'speed-2',
            label: '2x 速度',
            action: (target) => this.setPlaybackSpeed(target as HTMLAudioElement, 2)
          }
        ]
      },
      { separator: true },
      {
        id: 'loop',
        label: '循环播放',
        checked: audio.loop,
        action: (target) => this.toggleLoop(target as HTMLAudioElement)
      },
      {
        id: 'controls',
        label: '显示控件',
        checked: audio.controls,
        action: (target) => this.toggleControls(target as HTMLAudioElement)
      },
      { separator: true },
      {
        id: 'delete',
        label: '删除',
        icon: '🗑️',
        shortcut: 'Delete',
        action: (target) => this.deleteElement(target)
      }
    ];
  }

  // Image-specific actions
  private applyFilter(target: HTMLElement, filter: string) {
    target.style.filter = filter;
    this.editor?.emit('input');
    console.log('[MediaContextMenu] Applied filter:', filter);
  }

  private setImageSize(target: HTMLElement, size: string) {
    if (size === 'auto') {
      target.style.width = '';
      target.style.height = '';
    } else {
      target.style.width = size;
      target.style.height = 'auto';
    }
    this.editor?.emit('input');
    console.log('[MediaContextMenu] Set image size:', size);
  }

  private setAlignment(target: HTMLElement, align: string) {
    target.style.display = 'block';
    if (align === 'center') {
      target.style.marginLeft = 'auto';
      target.style.marginRight = 'auto';
    } else if (align === 'left') {
      target.style.marginLeft = '0';
      target.style.marginRight = 'auto';
    } else if (align === 'right') {
      target.style.marginLeft = 'auto';
      target.style.marginRight = '0';
    }
    this.editor?.emit('input');
    console.log('[MediaContextMenu] Set alignment:', align);
  }

  private setFloat(target: HTMLElement, float: string) {
    if (float === 'none') {
      target.style.float = '';
      target.style.margin = '';
    } else {
      target.style.float = float;
      target.style.margin = '10px';
      if (float === 'left') {
        target.style.marginLeft = '0';
      } else {
        target.style.marginRight = '0';
      }
    }
    this.editor?.emit('input');
    console.log('[MediaContextMenu] Set float:', float);
  }

  private setBorder(target: HTMLElement, border: string) {
    target.style.border = border;
    this.editor?.emit('input');
    console.log('[MediaContextMenu] Set border:', border);
  }

  private setShadow(target: HTMLElement, shadow: string) {
    target.style.boxShadow = shadow;
    this.editor?.emit('input');
    console.log('[MediaContextMenu] Set shadow:', shadow);
  }

  private copyImage(img: HTMLImageElement) {
    // Create a canvas to copy the image
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(() => {
            console.log('[MediaContextMenu] Image copied to clipboard');
          });
        }
      });
    }
  }

  private saveImage(img: HTMLImageElement) {
    const link = document.createElement('a');
    link.href = img.src;
    link.download = img.alt || 'image.png';
    link.click();
    console.log('[MediaContextMenu] Image download initiated');
  }

  // Video/Audio-specific actions
  private togglePlayPause(media: HTMLVideoElement | HTMLAudioElement) {
    if (media.paused) {
      media.play();
    } else {
      media.pause();
    }
    console.log('[MediaContextMenu] Toggle play/pause:', !media.paused);
  }

  private toggleMute(media: HTMLVideoElement | HTMLAudioElement) {
    media.muted = !media.muted;
    console.log('[MediaContextMenu] Toggle mute:', media.muted);
  }

  private setPlaybackSpeed(media: HTMLVideoElement | HTMLAudioElement, speed: number) {
    media.playbackRate = speed;
    console.log('[MediaContextMenu] Set playback speed:', speed);
  }

  private setVideoSize(target: HTMLElement, width: number) {
    if (width === -1) {
      target.style.width = '100%';
    } else {
      target.style.width = `${width}px`;
    }
    target.style.height = 'auto';
    this.editor?.emit('input');
    console.log('[MediaContextMenu] Set video size:', width);
  }

  private toggleLoop(media: HTMLVideoElement | HTMLAudioElement) {
    media.loop = !media.loop;
    this.editor?.emit('input');
    console.log('[MediaContextMenu] Toggle loop:', media.loop);
  }

  private toggleControls(media: HTMLVideoElement | HTMLAudioElement) {
    media.controls = !media.controls;
    this.editor?.emit('input');
    console.log('[MediaContextMenu] Toggle controls:', media.controls);
  }

  // Common actions
  private deleteElement(target: HTMLElement) {
    if (confirm('确定要删除这个元素吗？')) {
      target.remove();
      this.editor?.emit('input');
      console.log('[MediaContextMenu] Element deleted');
    }
  }

  private openSizeDialog(target: HTMLElement) {
    const width = prompt('请输入宽度 (例如: 300px, 50%, auto):', target.style.width || 'auto');
    if (width !== null) {
      const height = prompt('请输入高度 (例如: 200px, auto):', target.style.height || 'auto');
      if (height !== null) {
        target.style.width = width;
        target.style.height = height;
        this.editor?.emit('input');
        console.log('[MediaContextMenu] Custom size set:', width, height);
      }
    }
  }

  private openProperties(target: HTMLElement) {
    if (this.propertiesDialog) {
      this.propertiesDialog.open(target);
    }
  }

  destroy(): void {
    if (this.contextMenu) {
      this.contextMenu.destroy();
      this.contextMenu = null;
    }
    if (this.propertiesDialog) {
      this.propertiesDialog.destroy();
      this.propertiesDialog = null;
    }
    console.log('[MediaContextMenu] Plugin destroyed');
  }
}

// Export the plugin
export default MediaContextMenuPlugin;