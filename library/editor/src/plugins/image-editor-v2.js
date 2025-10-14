/**
 * Image Editor v2 - Simplified and Functional
 * A complete rewrite of the image editing functionality
 */
export class ImageEditorV2 {
    constructor() {
        this.selectedImage = null;
        this.contextMenu = null;
        this.originalSrc = '';
        this.init();
    }
    init() {
        // Add global styles
        this.injectStyles();
        // Setup event listeners
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this), true);
    }
    injectStyles() {
        if (document.getElementById('image-editor-v2-styles'))
            return;
        const style = document.createElement('style');
        style.id = 'image-editor-v2-styles';
        style.textContent = `
      /* Selected image styles */
      .ie-selected {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      
      /* Context menu styles */
      .ie-context-menu {
        position: fixed;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 4px 0;
        min-width: 200px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft YaHei", "微软雅黑", sans-serif;
        font-size: 14px;
      }
      
      .ie-menu-item {
        padding: 8px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: background-color 0.15s;
      }
      
      .ie-menu-item:hover {
        background-color: #f3f4f6;
      }
      
      .ie-menu-divider {
        height: 1px;
        background-color: #e5e7eb;
        margin: 4px 0;
      }
      
      .ie-submenu {
        position: fixed;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 4px 0;
        min-width: 150px;
        z-index: 10001;
      }
      
      .ie-submenu-arrow {
        margin-left: auto;
        padding-left: 16px;
        color: #9ca3af;
      }
      
      /* Filter styles */
      .ie-filter-none { filter: none !important; }
      .ie-filter-blur { filter: blur(4px) !important; }
      .ie-filter-brightness { filter: brightness(1.2) !important; }
      .ie-filter-contrast { filter: contrast(1.2) !important; }
      .ie-filter-grayscale { filter: grayscale(1) !important; }
      .ie-filter-sepia { filter: sepia(1) !important; }
      .ie-filter-saturate { filter: saturate(1.5) !important; }
      .ie-filter-hue-rotate { filter: hue-rotate(90deg) !important; }
      .ie-filter-invert { filter: invert(1) !important; }
      
      /* Size styles */
      .ie-size-small {
        max-width: 300px !important;
        height: auto !important;
      }
      
      .ie-size-medium {
        max-width: 500px !important;
        height: auto !important;
      }
      
      .ie-size-large {
        max-width: 800px !important;
        height: auto !important;
      }
      
      .ie-size-original {
        max-width: none !important;
        height: auto !important;
      }
      
      /* Alignment styles */
      .ie-align-left {
        display: block !important;
        margin-left: 0 !important;
        margin-right: auto !important;
      }
      
      .ie-align-center {
        display: block !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }
      
      .ie-align-right {
        display: block !important;
        margin-left: auto !important;
        margin-right: 0 !important;
      }
      
      /* Float styles */
      .ie-float-left {
        float: left !important;
        margin-right: 16px !important;
        margin-bottom: 8px !important;
      }
      
      .ie-float-right {
        float: right !important;
        margin-left: 16px !important;
        margin-bottom: 8px !important;
      }
      
      .ie-float-none {
        float: none !important;
      }
    `;
        document.head.appendChild(style);
    }
    handleDocumentClick(e) {
        // Hide context menu on any click
        if (this.contextMenu && !this.contextMenu.contains(e.target)) {
            this.hideContextMenu();
        }
        // Handle image selection
        const target = e.target;
        if (target.tagName === 'IMG') {
            this.selectImage(target);
        }
        else {
            this.deselectImage();
        }
    }
    handleContextMenu(e) {
        const target = e.target;
        if (target.tagName === 'IMG') {
            e.preventDefault();
            e.stopPropagation();
            this.selectImage(target);
            this.showContextMenu(e.clientX, e.clientY);
        }
    }
    selectImage(img) {
        this.deselectImage();
        this.selectedImage = img;
        this.selectedImage.classList.add('ie-selected');
        this.originalSrc = img.src;
        console.log('Image selected:', this.originalSrc);
    }
    deselectImage() {
        if (this.selectedImage) {
            this.selectedImage.classList.remove('ie-selected');
            this.selectedImage = null;
        }
    }
    showContextMenu(x, y) {
        this.hideContextMenu();
        const menu = document.createElement('div');
        menu.className = 'ie-context-menu';
        // Menu structure
        const menuItems = [
            { label: '复制图片', action: () => this.copyImage() },
            { label: '复制链接', action: () => this.copyImageLink() },
            { divider: true },
            {
                label: '调整大小',
                submenu: [
                    { label: '小 (300px)', action: () => this.setSize('small') },
                    { label: '中 (500px)', action: () => this.setSize('medium') },
                    { label: '大 (800px)', action: () => this.setSize('large') },
                    { label: '原始大小', action: () => this.setSize('original') },
                    { divider: true },
                    { label: '自定义大小...', action: () => this.customSize() }
                ]
            },
            {
                label: '对齐方式',
                submenu: [
                    { label: '左对齐', action: () => this.setAlignment('left') },
                    { label: '居中', action: () => this.setAlignment('center') },
                    { label: '右对齐', action: () => this.setAlignment('right') }
                ]
            },
            {
                label: '文字环绕',
                submenu: [
                    { label: '左浮动', action: () => this.setFloat('left') },
                    { label: '右浮动', action: () => this.setFloat('right') },
                    { label: '无浮动', action: () => this.setFloat('none') }
                ]
            },
            {
                label: '滤镜效果',
                submenu: [
                    { label: '无滤镜', action: () => this.setFilter('none') },
                    { divider: true },
                    { label: '模糊', action: () => this.setFilter('blur') },
                    { label: '增亮', action: () => this.setFilter('brightness') },
                    { label: '增强对比度', action: () => this.setFilter('contrast') },
                    { label: '黑白', action: () => this.setFilter('grayscale') },
                    { label: '褐色', action: () => this.setFilter('sepia') },
                    { label: '饱和度', action: () => this.setFilter('saturate') },
                    { label: '色相旋转', action: () => this.setFilter('hue-rotate') },
                    { label: '反色', action: () => this.setFilter('invert') }
                ]
            },
            { divider: true },
            { label: '替换图片...', action: () => this.replaceImage() },
            { label: '添加说明文字...', action: () => this.addCaption() },
            { divider: true },
            { label: '删除图片', action: () => this.deleteImage() }
        ];
        // Build menu
        this.buildMenu(menu, menuItems);
        // Position menu
        document.body.appendChild(menu);
        // Adjust position if menu goes off screen
        const rect = menu.getBoundingClientRect();
        if (x + rect.width > window.innerWidth) {
            x = window.innerWidth - rect.width - 10;
        }
        if (y + rect.height > window.innerHeight) {
            y = window.innerHeight - rect.height - 10;
        }
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        this.contextMenu = menu;
        console.log('Context menu shown at:', x, y);
    }
    buildMenu(container, items) {
        items.forEach(item => {
            if (item.divider) {
                const divider = document.createElement('div');
                divider.className = 'ie-menu-divider';
                container.appendChild(divider);
            }
            else {
                const menuItem = document.createElement('div');
                menuItem.className = 'ie-menu-item';
                const label = document.createElement('span');
                label.textContent = item.label;
                menuItem.appendChild(label);
                if (item.submenu) {
                    const arrow = document.createElement('span');
                    arrow.className = 'ie-submenu-arrow';
                    arrow.textContent = '▶';
                    menuItem.appendChild(arrow);
                    // Handle submenu
                    let submenuEl = null;
                    menuItem.addEventListener('mouseenter', () => {
                        // Remove any existing submenus
                        document.querySelectorAll('.ie-submenu').forEach(el => el.remove());
                        submenuEl = document.createElement('div');
                        submenuEl.className = 'ie-submenu';
                        this.buildMenu(submenuEl, item.submenu);
                        document.body.appendChild(submenuEl);
                        const itemRect = menuItem.getBoundingClientRect();
                        let submenuX = itemRect.right + 4;
                        let submenuY = itemRect.top;
                        // Adjust if submenu goes off screen
                        const submenuRect = submenuEl.getBoundingClientRect();
                        if (submenuX + submenuRect.width > window.innerWidth) {
                            submenuX = itemRect.left - submenuRect.width - 4;
                        }
                        submenuEl.style.left = submenuX + 'px';
                        submenuEl.style.top = submenuY + 'px';
                    });
                    menuItem.addEventListener('mouseleave', (e) => {
                        const related = e.relatedTarget;
                        if (!submenuEl || !submenuEl.contains(related)) {
                            setTimeout(() => {
                                if (submenuEl && !submenuEl.matches(':hover')) {
                                    submenuEl.remove();
                                    submenuEl = null;
                                }
                            }, 100);
                        }
                    });
                }
                else if (item.action) {
                    menuItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        console.log('Menu item clicked:', item.label);
                        item.action();
                        this.hideContextMenu();
                    });
                }
                container.appendChild(menuItem);
            }
        });
    }
    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.remove();
            this.contextMenu = null;
        }
        // Remove any lingering submenus
        document.querySelectorAll('.ie-submenu').forEach(el => el.remove());
    }
    // Action methods
    copyImage() {
        if (!this.selectedImage)
            return;
        // Create a canvas and copy image
        const img = this.selectedImage;
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
                if (blob) {
                    const item = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([item]);
                    console.log('Image copied to clipboard');
                }
            });
        }
    }
    copyImageLink() {
        if (!this.selectedImage)
            return;
        const img = this.selectedImage;
        navigator.clipboard.writeText(img.src);
        console.log('Image link copied:', img.src);
    }
    setSize(size) {
        if (!this.selectedImage)
            return;
        // Remove all size classes
        this.selectedImage.classList.remove('ie-size-small', 'ie-size-medium', 'ie-size-large', 'ie-size-original');
        // Add new size class
        if (size !== 'original') {
            this.selectedImage.classList.add(`ie-size-${size}`);
        }
        console.log('Size set to:', size);
    }
    customSize() {
        if (!this.selectedImage)
            return;
        const width = prompt('输入图片宽度 (像素):', '400');
        if (width) {
            this.selectedImage.style.width = width + 'px';
            this.selectedImage.style.height = 'auto';
            console.log('Custom size set:', width + 'px');
        }
    }
    setAlignment(align) {
        if (!this.selectedImage)
            return;
        // Remove all alignment classes
        this.selectedImage.classList.remove('ie-align-left', 'ie-align-center', 'ie-align-right');
        // Add new alignment class
        this.selectedImage.classList.add(`ie-align-${align}`);
        console.log('Alignment set to:', align);
    }
    setFloat(floatType) {
        if (!this.selectedImage)
            return;
        // Remove all float classes
        this.selectedImage.classList.remove('ie-float-left', 'ie-float-right', 'ie-float-none');
        // Add new float class
        if (floatType !== 'none') {
            this.selectedImage.classList.add(`ie-float-${floatType}`);
        }
        console.log('Float set to:', floatType);
    }
    setFilter(filter) {
        if (!this.selectedImage)
            return;
        // Remove all filter classes
        const filterClasses = [
            'ie-filter-none', 'ie-filter-blur', 'ie-filter-brightness',
            'ie-filter-contrast', 'ie-filter-grayscale', 'ie-filter-sepia',
            'ie-filter-saturate', 'ie-filter-hue-rotate', 'ie-filter-invert'
        ];
        filterClasses.forEach(cls => this.selectedImage.classList.remove(cls));
        // Add new filter class
        this.selectedImage.classList.add(`ie-filter-${filter}`);
        console.log('Filter applied:', filter);
    }
    replaceImage() {
        if (!this.selectedImage)
            return;
        const newSrc = prompt('输入新的图片URL:', this.originalSrc);
        if (newSrc) {
            this.selectedImage.src = newSrc;
            console.log('Image replaced with:', newSrc);
        }
    }
    addCaption() {
        var _a;
        if (!this.selectedImage)
            return;
        const caption = prompt('输入图片说明文字:');
        if (caption) {
            // Check if already wrapped in figure
            let figure = this.selectedImage.closest('figure');
            if (!figure) {
                // Create figure wrapper
                figure = document.createElement('figure');
                figure.style.textAlign = 'center';
                figure.style.margin = '16px auto';
                (_a = this.selectedImage.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(figure, this.selectedImage);
                figure.appendChild(this.selectedImage);
            }
            // Remove existing caption if any
            const existingCaption = figure.querySelector('figcaption');
            if (existingCaption) {
                existingCaption.remove();
            }
            // Add new caption
            const figcaption = document.createElement('figcaption');
            figcaption.textContent = caption;
            figcaption.style.marginTop = '8px';
            figcaption.style.fontSize = '14px';
            figcaption.style.color = '#666';
            figure.appendChild(figcaption);
            console.log('Caption added:', caption);
        }
    }
    deleteImage() {
        if (!this.selectedImage)
            return;
        if (confirm('确定要删除这张图片吗？')) {
            const figure = this.selectedImage.closest('figure');
            if (figure) {
                figure.remove();
            }
            else {
                this.selectedImage.remove();
            }
            console.log('Image deleted');
            this.selectedImage = null;
        }
    }
}
// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ImageEditorV2());
}
else {
    new ImageEditorV2();
}
// Export for use as a module
export default ImageEditorV2;
