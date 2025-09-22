import { UIPlugin } from '../core/UIPlugin';
import { IPlugin, PluginConfig } from '../types/plugins';
import { Playlist, PlaylistItem, PlayMode } from './Playlist';

/**
 * 播放列表控制配置接口
 */
export interface PlaylistControlConfig extends PluginConfig {
    /** 是否显示播放列表面板 */
    showPlaylistPanel?: boolean;
    /** 是否显示播放模式控制 */
    showPlayModeControl?: boolean;
    /** 是否显示自动播放控制 */
    showAutoAdvanceControl?: boolean;
    /** 是否显示播放历史 */
    showPlayHistory?: boolean;
    /** 播放列表面板位置 */
    panelPosition?: 'right' | 'bottom' | 'overlay';
    /** 播放列表面板宽度 */
    panelWidth?: string;
    /** 播放列表面板高度 */
    panelHeight?: string;
    /** 是否可拖拽排序 */
    enableDragSort?: boolean;
}

/**
 * 播放列表控制插件
 * 提供播放列表的UI控制界面
 */
export class PlaylistControl extends UIPlugin implements IPlugin {
    public readonly type = 'playlist-control';
    
    private playlistPlugin: Playlist | null = null;
    private showPlaylistPanel: boolean = true;
    private showPlayModeControl: boolean = true;
    private showAutoAdvanceControl: boolean = true;
    private showPlayHistory: boolean = false;
    private panelPosition: 'right' | 'bottom' | 'overlay' = 'right';
    private panelWidth: string = '300px';
    private panelHeight: string = '400px';
    private enableDragSort: boolean = true;
    
    private controlsContainer: HTMLElement | null = null;
    private playlistPanel: HTMLElement | null = null;
    private playlistToggle: HTMLElement | null = null;
    private playModeButton: HTMLElement | null = null;
    private autoAdvanceToggle: HTMLElement | null = null;
    private playlistItems: HTMLElement | null = null;
    private draggedItem: HTMLElement | null = null;
    private draggedIndex: number = -1;

    constructor(config: PlaylistControlConfig = {}) {
        super(config);
        
        this.showPlaylistPanel = config.showPlaylistPanel !== false;
        this.showPlayModeControl = config.showPlayModeControl !== false;
        this.showAutoAdvanceControl = config.showAutoAdvanceControl !== false;
        this.showPlayHistory = config.showPlayHistory || false;
        this.panelPosition = config.panelPosition || 'right';
        this.panelWidth = config.panelWidth || '300px';
        this.panelHeight = config.panelHeight || '400px';
        this.enableDragSort = config.enableDragSort !== false;
    }

    /**
     * 插件初始化
     */
    public async init(): Promise<void> {
        await super.init();
        
        if (!this.player) {
            throw new Error('Player instance is required');
        }

        // 获取播放列表插件实例
        this.playlistPlugin = this.player.getPlugin('playlist') as Playlist;
        if (!this.playlistPlugin) {
            throw new Error('Playlist plugin is required');
        }

        this.createUI();
        this.bindEvents();
        this.updateUI();
    }

    /**
     * 创建UI元素
     */
    private createUI(): void {
        if (!this.container) return;

        // 创建控制按钮容器
        this.controlsContainer = this.createElement('div', {
            className: 'ldesign-playlist-controls',
            innerHTML: `
                ${this.showPlaylistPanel ? '<button class="ldesign-playlist-toggle" title="播放列表">📋</button>' : ''}
                ${this.showPlayModeControl ? '<button class="ldesign-play-mode" title="播放模式">🔄</button>' : ''}
                ${this.showAutoAdvanceControl ? '<button class="ldesign-auto-advance" title="自动播放">⏭️</button>' : ''}
            `
        });

        // 获取按钮元素
        this.playlistToggle = this.controlsContainer.querySelector('.ldesign-playlist-toggle');
        this.playModeButton = this.controlsContainer.querySelector('.ldesign-play-mode');
        this.autoAdvanceToggle = this.controlsContainer.querySelector('.ldesign-auto-advance');

        // 创建播放列表面板
        if (this.showPlaylistPanel) {
            this.createPlaylistPanel();
        }

        // 添加到控制栏
        const controlBar = this.container.querySelector('.ldesign-control-bar');
        if (controlBar) {
            controlBar.appendChild(this.controlsContainer);
        } else {
            this.container.appendChild(this.controlsContainer);
        }
    }

    /**
     * 创建播放列表面板
     */
    private createPlaylistPanel(): void {
        if (!this.container) return;

        this.playlistPanel = this.createElement('div', {
            className: `ldesign-playlist-panel ldesign-playlist-panel-${this.panelPosition}`,
            style: `
                width: ${this.panelWidth};
                height: ${this.panelHeight};
                display: none;
            `,
            innerHTML: `
                <div class="ldesign-playlist-header">
                    <h3>播放列表</h3>
                    <button class="ldesign-playlist-close">✕</button>
                </div>
                <div class="ldesign-playlist-content">
                    <div class="ldesign-playlist-stats">
                        <span class="ldesign-playlist-count">0 个项目</span>
                        <span class="ldesign-playlist-duration">总时长: 00:00</span>
                    </div>
                    <div class="ldesign-playlist-items"></div>
                </div>
                <div class="ldesign-playlist-footer">
                    <button class="ldesign-playlist-clear">清空列表</button>
                    ${this.showPlayHistory ? '<button class="ldesign-playlist-history">播放历史</button>' : ''}
                </div>
            `
        });

        this.playlistItems = this.playlistPanel.querySelector('.ldesign-playlist-items');
        this.container.appendChild(this.playlistPanel);
    }

    /**
     * 绑定事件监听器
     */
    private bindEvents(): void {
        if (!this.playlistPlugin) return;

        // 播放列表切换按钮
        if (this.playlistToggle) {
            this.playlistToggle.addEventListener('click', () => {
                this.togglePlaylistPanel();
            });
        }

        // 播放模式按钮
        if (this.playModeButton) {
            this.playModeButton.addEventListener('click', () => {
                this.cyclePlayMode();
            });
        }

        // 自动播放切换按钮
        if (this.autoAdvanceToggle) {
            this.autoAdvanceToggle.addEventListener('click', () => {
                this.toggleAutoAdvance();
            });
        }

        // 播放列表面板事件
        if (this.playlistPanel) {
            // 关闭按钮
            const closeButton = this.playlistPanel.querySelector('.ldesign-playlist-close');
            closeButton?.addEventListener('click', () => {
                this.hidePlaylistPanel();
            });

            // 清空列表按钮
            const clearButton = this.playlistPanel.querySelector('.ldesign-playlist-clear');
            clearButton?.addEventListener('click', () => {
                this.clearPlaylist();
            });

            // 播放历史按钮
            const historyButton = this.playlistPanel.querySelector('.ldesign-playlist-history');
            historyButton?.addEventListener('click', () => {
                this.showPlayHistory();
            });
        }

        // 监听播放列表插件事件
        this.playlistPlugin.on('playlist:add', () => this.updatePlaylistItems());
        this.playlistPlugin.on('playlist:remove', () => this.updatePlaylistItems());
        this.playlistPlugin.on('playlist:clear', () => this.updatePlaylistItems());
        this.playlistPlugin.on('playlist:item-change', () => this.updateCurrentItem());
        this.playlistPlugin.on('playlist:mode-change', () => this.updatePlayModeButton());
        this.playlistPlugin.on('playlist:auto-advance-change', () => this.updateAutoAdvanceButton());
    }

    /**
     * 切换播放列表面板显示
     */
    private togglePlaylistPanel(): void {
        if (!this.playlistPanel) return;

        const isVisible = this.playlistPanel.style.display !== 'none';
        if (isVisible) {
            this.hidePlaylistPanel();
        } else {
            this.showPlaylistPanel();
        }
    }

    /**
     * 显示播放列表面板
     */
    private showPlaylistPanel(): void {
        if (!this.playlistPanel) return;

        this.playlistPanel.style.display = 'block';
        this.updatePlaylistItems();
        
        // 添加激活状态
        if (this.playlistToggle) {
            this.playlistToggle.classList.add('active');
        }
    }

    /**
     * 隐藏播放列表面板
     */
    private hidePlaylistPanel(): void {
        if (!this.playlistPanel) return;

        this.playlistPanel.style.display = 'none';
        
        // 移除激活状态
        if (this.playlistToggle) {
            this.playlistToggle.classList.remove('active');
        }
    }

    /**
     * 循环切换播放模式
     */
    private cyclePlayMode(): void {
        if (!this.playlistPlugin) return;

        const modes = [PlayMode.SEQUENCE, PlayMode.REPEAT_ALL, PlayMode.SHUFFLE, PlayMode.REPEAT_ONE];
        const currentMode = this.playlistPlugin.getPlayMode();
        const currentIndex = modes.indexOf(currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        
        this.playlistPlugin.setPlayMode(modes[nextIndex]);
    }

    /**
     * 切换自动播放
     */
    private toggleAutoAdvance(): void {
        if (!this.playlistPlugin) return;

        const isEnabled = this.playlistPlugin.isAutoAdvanceEnabled();
        this.playlistPlugin.setAutoAdvance(!isEnabled);
    }

    /**
     * 更新播放列表项目
     */
    private updatePlaylistItems(): void {
        if (!this.playlistItems || !this.playlistPlugin) return;

        const items = this.playlistPlugin.getItems();
        const currentIndex = this.playlistPlugin.getCurrentIndex();

        this.playlistItems.innerHTML = '';

        items.forEach((item, index) => {
            const itemElement = this.createElement('div', {
                className: `ldesign-playlist-item ${index === currentIndex ? 'current' : ''}`,
                draggable: this.enableDragSort,
                innerHTML: `
                    <div class="ldesign-playlist-item-index">${index + 1}</div>
                    <div class="ldesign-playlist-item-info">
                        <div class="ldesign-playlist-item-title">${item.title}</div>
                        ${item.duration ? `<div class="ldesign-playlist-item-duration">${this.formatTime(item.duration)}</div>` : ''}
                    </div>
                    <div class="ldesign-playlist-item-actions">
                        <button class="ldesign-playlist-item-play" title="播放">▶️</button>
                        <button class="ldesign-playlist-item-remove" title="移除">🗑️</button>
                    </div>
                `
            });

            // 绑定项目事件
            this.bindItemEvents(itemElement, item, index);

            this.playlistItems.appendChild(itemElement);
        });

        // 更新统计信息
        this.updatePlaylistStats();
    }

    /**
     * 绑定播放列表项事件
     */
    private bindItemEvents(itemElement: HTMLElement, item: PlaylistItem, index: number): void {
        // 双击播放
        itemElement.addEventListener('dblclick', () => {
            this.playlistPlugin?.playItem(index);
        });

        // 播放按钮
        const playButton = itemElement.querySelector('.ldesign-playlist-item-play');
        playButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.playlistPlugin?.playItem(index);
        });

        // 移除按钮
        const removeButton = itemElement.querySelector('.ldesign-playlist-item-remove');
        removeButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.playlistPlugin?.removeItem(index);
        });

        // 拖拽事件
        if (this.enableDragSort) {
            this.bindDragEvents(itemElement, index);
        }
    }

    /**
     * 绑定拖拽事件
     */
    private bindDragEvents(itemElement: HTMLElement, index: number): void {
        itemElement.addEventListener('dragstart', (e) => {
            this.draggedItem = itemElement;
            this.draggedIndex = index;
            itemElement.classList.add('dragging');
            
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', itemElement.outerHTML);
            }
        });

        itemElement.addEventListener('dragend', () => {
            itemElement.classList.remove('dragging');
            this.draggedItem = null;
            this.draggedIndex = -1;
        });

        itemElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
            }
        });

        itemElement.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (this.draggedIndex !== -1 && this.draggedIndex !== index) {
                this.playlistPlugin?.moveItem(this.draggedIndex, index);
            }
        });
    }

    /**
     * 更新当前播放项
     */
    private updateCurrentItem(): void {
        if (!this.playlistItems || !this.playlistPlugin) return;

        const currentIndex = this.playlistPlugin.getCurrentIndex();
        const items = this.playlistItems.querySelectorAll('.ldesign-playlist-item');

        items.forEach((item, index) => {
            if (index === currentIndex) {
                item.classList.add('current');
            } else {
                item.classList.remove('current');
            }
        });
    }

    /**
     * 更新播放模式按钮
     */
    private updatePlayModeButton(): void {
        if (!this.playModeButton || !this.playlistPlugin) return;

        const mode = this.playlistPlugin.getPlayMode();
        const modeIcons = {
            [PlayMode.SEQUENCE]: '▶️',
            [PlayMode.REPEAT_ALL]: '🔁',
            [PlayMode.SHUFFLE]: '🔀',
            [PlayMode.REPEAT_ONE]: '🔂'
        };

        const modeTitles = {
            [PlayMode.SEQUENCE]: '顺序播放',
            [PlayMode.REPEAT_ALL]: '列表循环',
            [PlayMode.SHUFFLE]: '随机播放',
            [PlayMode.REPEAT_ONE]: '单曲循环'
        };

        this.playModeButton.textContent = modeIcons[mode];
        this.playModeButton.title = modeTitles[mode];
    }

    /**
     * 更新自动播放按钮
     */
    private updateAutoAdvanceButton(): void {
        if (!this.autoAdvanceToggle || !this.playlistPlugin) return;

        const isEnabled = this.playlistPlugin.isAutoAdvanceEnabled();
        this.autoAdvanceToggle.classList.toggle('active', isEnabled);
        this.autoAdvanceToggle.title = isEnabled ? '自动播放: 开' : '自动播放: 关';
    }

    /**
     * 更新播放列表统计信息
     */
    private updatePlaylistStats(): void {
        if (!this.playlistPanel || !this.playlistPlugin) return;

        const items = this.playlistPlugin.getItems();
        const countElement = this.playlistPanel.querySelector('.ldesign-playlist-count');
        const durationElement = this.playlistPanel.querySelector('.ldesign-playlist-duration');

        if (countElement) {
            countElement.textContent = `${items.length} 个项目`;
        }

        if (durationElement) {
            const totalDuration = items.reduce((total, item) => total + (item.duration || 0), 0);
            durationElement.textContent = `总时长: ${this.formatTime(totalDuration)}`;
        }
    }

    /**
     * 清空播放列表
     */
    private clearPlaylist(): void {
        if (!this.playlistPlugin) return;

        if (confirm('确定要清空播放列表吗？')) {
            this.playlistPlugin.clear();
        }
    }

    /**
     * 显示播放历史
     */
    private showPlayHistory(): void {
        if (!this.playlistPlugin) return;

        const history = this.playlistPlugin.getPlayHistory();
        const items = this.playlistPlugin.getItems();
        
        // 创建历史面板
        const historyPanel = this.createElement('div', {
            className: 'ldesign-playlist-history-panel',
            innerHTML: `
                <div class="ldesign-playlist-history-header">
                    <h3>播放历史</h3>
                    <button class="ldesign-playlist-history-close">✕</button>
                </div>
                <div class="ldesign-playlist-history-items">
                    ${history.map(itemId => {
                        const item = items.find(i => i.id === itemId);
                        return item ? `
                            <div class="ldesign-playlist-history-item" data-id="${item.id}">
                                <span class="ldesign-playlist-history-title">${item.title}</span>
                                <button class="ldesign-playlist-history-play">播放</button>
                            </div>
                        ` : '';
                    }).join('')}
                </div>
            `
        });

        // 绑定历史面板事件
        const closeButton = historyPanel.querySelector('.ldesign-playlist-history-close');
        closeButton?.addEventListener('click', () => {
            historyPanel.remove();
        });

        const playButtons = historyPanel.querySelectorAll('.ldesign-playlist-history-play');
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const itemElement = (e.target as HTMLElement).closest('.ldesign-playlist-history-item');
                const itemId = itemElement?.getAttribute('data-id');
                if (itemId) {
                    this.playlistPlugin?.playItemById(itemId);
                    historyPanel.remove();
                }
            });
        });

        this.container?.appendChild(historyPanel);
    }

    /**
     * 格式化时间
     */
    private formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    /**
     * 更新UI状态
     */
    private updateUI(): void {
        this.updatePlayModeButton();
        this.updateAutoAdvanceButton();
        this.updatePlaylistItems();
    }

    /**
     * 插件销毁
     */
    public async destroy(): Promise<void> {
        if (this.playlistPanel) {
            this.playlistPanel.remove();
        }
        
        if (this.controlsContainer) {
            this.controlsContainer.remove();
        }

        await super.destroy();
    }
}
