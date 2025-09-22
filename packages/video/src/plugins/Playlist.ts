import { BasePlugin } from '../core/BasePlugin';
import { IPlugin, PluginConfig } from '../types/plugins';
import { Player } from '../core/Player';

/**
 * 播放列表项接口
 */
export interface PlaylistItem {
    /** 唯一标识符 */
    id: string;
    /** 视频标题 */
    title: string;
    /** 视频源地址 */
    src: string;
    /** 视频类型 */
    type?: string;
    /** 封面图片 */
    poster?: string;
    /** 视频时长（秒） */
    duration?: number;
    /** 视频描述 */
    description?: string;
    /** 自定义数据 */
    data?: Record<string, any>;
}

/**
 * 播放模式枚举
 */
export enum PlayMode {
    /** 顺序播放 */
    SEQUENCE = 'sequence',
    /** 随机播放 */
    SHUFFLE = 'shuffle',
    /** 单曲循环 */
    REPEAT_ONE = 'repeat-one',
    /** 列表循环 */
    REPEAT_ALL = 'repeat-all'
}

/**
 * 播放列表配置接口
 */
export interface PlaylistConfig extends PluginConfig {
    /** 是否启用播放列表 */
    enabled?: boolean;
    /** 初始播放列表 */
    items?: PlaylistItem[];
    /** 当前播放索引 */
    currentIndex?: number;
    /** 播放模式 */
    playMode?: PlayMode;
    /** 是否自动播放下一个 */
    autoAdvance?: boolean;
    /** 是否显示播放列表UI */
    showPlaylist?: boolean;
    /** 是否记住播放位置 */
    rememberPosition?: boolean;
    /** 播放列表最大长度 */
    maxItems?: number;
}

/**
 * 播放列表插件
 * 提供多视频连续播放功能
 */
export class Playlist extends BasePlugin implements IPlugin {
    public readonly type = 'playlist';
    
    private items: PlaylistItem[] = [];
    private currentIndex: number = 0;
    private playMode: PlayMode = PlayMode.SEQUENCE;
    private autoAdvance: boolean = true;
    private showPlaylist: boolean = true;
    private rememberPosition: boolean = true;
    private maxItems: number = 100;
    private shuffleOrder: number[] = [];
    private originalOrder: number[] = [];
    private playHistory: string[] = [];
    private positionMemory: Map<string, number> = new Map();

    constructor(config: PlaylistConfig = {}) {
        super(config);
        
        this.items = config.items || [];
        this.currentIndex = config.currentIndex || 0;
        this.playMode = config.playMode || PlayMode.SEQUENCE;
        this.autoAdvance = config.autoAdvance !== false;
        this.showPlaylist = config.showPlaylist !== false;
        this.rememberPosition = config.rememberPosition !== false;
        this.maxItems = config.maxItems || 100;
        
        this.initializeOrder();
    }

    /**
     * 初始化播放顺序
     */
    private initializeOrder(): void {
        this.originalOrder = this.items.map((_, index) => index);
        this.generateShuffleOrder();
    }

    /**
     * 生成随机播放顺序
     */
    private generateShuffleOrder(): void {
        this.shuffleOrder = [...this.originalOrder];
        for (let i = this.shuffleOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffleOrder[i], this.shuffleOrder[j]] = [this.shuffleOrder[j], this.shuffleOrder[i]];
        }
    }

    /**
     * 插件初始化
     */
    public async init(): Promise<void> {
        await super.init();
        
        if (!this.player) {
            throw new Error('Player instance is required');
        }

        this.bindEvents();
        
        // 如果有播放列表且当前索引有效，加载当前项
        if (this.items.length > 0 && this.isValidIndex(this.currentIndex)) {
            await this.loadCurrentItem();
        }

        this.emit('playlist:init', {
            items: this.items,
            currentIndex: this.currentIndex,
            playMode: this.playMode
        });
    }

    /**
     * 绑定事件监听器
     */
    private bindEvents(): void {
        if (!this.player) return;

        // 监听视频结束事件
        this.player.on('ended', () => {
            if (this.autoAdvance) {
                this.next();
            }
        });

        // 监听时间更新事件，记住播放位置
        this.player.on('timeupdate', () => {
            if (this.rememberPosition && this.getCurrentItem()) {
                const currentTime = this.player!.getCurrentTime();
                const currentItem = this.getCurrentItem();
                if (currentItem) {
                    this.positionMemory.set(currentItem.id, currentTime);
                }
            }
        });

        // 监听播放事件，记录播放历史
        this.player.on('play', () => {
            const currentItem = this.getCurrentItem();
            if (currentItem) {
                this.addToHistory(currentItem.id);
            }
        });
    }

    /**
     * 添加播放列表项
     */
    public addItem(item: PlaylistItem, index?: number): void {
        if (this.items.length >= this.maxItems) {
            throw new Error(`Playlist cannot exceed ${this.maxItems} items`);
        }

        if (index !== undefined && index >= 0 && index <= this.items.length) {
            this.items.splice(index, 0, item);
            // 如果插入位置在当前播放位置之前，需要调整当前索引
            if (index <= this.currentIndex) {
                this.currentIndex++;
            }
        } else {
            this.items.push(item);
        }

        this.updateOrder();
        this.emit('playlist:add', { item, index: index || this.items.length - 1 });
    }

    /**
     * 移除播放列表项
     */
    public removeItem(index: number): PlaylistItem | null {
        if (!this.isValidIndex(index)) {
            return null;
        }

        const removedItem = this.items.splice(index, 1)[0];
        
        // 调整当前播放索引
        if (index < this.currentIndex) {
            this.currentIndex--;
        } else if (index === this.currentIndex) {
            // 如果移除的是当前播放项
            if (this.currentIndex >= this.items.length) {
                this.currentIndex = this.items.length - 1;
            }
            // 加载新的当前项
            if (this.items.length > 0) {
                this.loadCurrentItem();
            }
        }

        this.updateOrder();
        this.emit('playlist:remove', { item: removedItem, index });
        
        return removedItem;
    }

    /**
     * 移除播放列表项（通过ID）
     */
    public removeItemById(id: string): PlaylistItem | null {
        const index = this.items.findIndex(item => item.id === id);
        return index !== -1 ? this.removeItem(index) : null;
    }

    /**
     * 清空播放列表
     */
    public clear(): void {
        this.items = [];
        this.currentIndex = 0;
        this.shuffleOrder = [];
        this.originalOrder = [];
        this.playHistory = [];
        this.positionMemory.clear();
        
        this.emit('playlist:clear');
    }

    /**
     * 播放指定索引的项目
     */
    public async playItem(index: number): Promise<void> {
        if (!this.isValidIndex(index)) {
            throw new Error('Invalid playlist index');
        }

        this.currentIndex = index;
        await this.loadCurrentItem();
        
        if (this.player) {
            this.player.play();
        }
    }

    /**
     * 播放指定ID的项目
     */
    public async playItemById(id: string): Promise<void> {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error('Item not found in playlist');
        }
        
        await this.playItem(index);
    }

    /**
     * 播放下一个项目
     */
    public async next(): Promise<void> {
        const nextIndex = this.getNextIndex();
        if (nextIndex !== -1) {
            await this.playItem(nextIndex);
        }
    }

    /**
     * 播放上一个项目
     */
    public async previous(): Promise<void> {
        const prevIndex = this.getPreviousIndex();
        if (prevIndex !== -1) {
            await this.playItem(prevIndex);
        }
    }

    /**
     * 获取下一个播放索引
     */
    private getNextIndex(): number {
        if (this.items.length === 0) return -1;

        switch (this.playMode) {
            case PlayMode.SEQUENCE:
                return this.currentIndex + 1 < this.items.length ? this.currentIndex + 1 : -1;
                
            case PlayMode.REPEAT_ALL:
                return (this.currentIndex + 1) % this.items.length;
                
            case PlayMode.REPEAT_ONE:
                return this.currentIndex;
                
            case PlayMode.SHUFFLE:
                const currentShuffleIndex = this.shuffleOrder.indexOf(this.currentIndex);
                const nextShuffleIndex = (currentShuffleIndex + 1) % this.shuffleOrder.length;
                return this.shuffleOrder[nextShuffleIndex];
                
            default:
                return -1;
        }
    }

    /**
     * 获取上一个播放索引
     */
    private getPreviousIndex(): number {
        if (this.items.length === 0) return -1;

        switch (this.playMode) {
            case PlayMode.SEQUENCE:
                return this.currentIndex - 1 >= 0 ? this.currentIndex - 1 : -1;
                
            case PlayMode.REPEAT_ALL:
                return this.currentIndex - 1 >= 0 ? this.currentIndex - 1 : this.items.length - 1;
                
            case PlayMode.REPEAT_ONE:
                return this.currentIndex;
                
            case PlayMode.SHUFFLE:
                const currentShuffleIndex = this.shuffleOrder.indexOf(this.currentIndex);
                const prevShuffleIndex = currentShuffleIndex - 1 >= 0 ? 
                    currentShuffleIndex - 1 : this.shuffleOrder.length - 1;
                return this.shuffleOrder[prevShuffleIndex];
                
            default:
                return -1;
        }
    }

    /**
     * 设置播放模式
     */
    public setPlayMode(mode: PlayMode): void {
        this.playMode = mode;
        
        if (mode === PlayMode.SHUFFLE) {
            this.generateShuffleOrder();
        }
        
        this.emit('playlist:mode-change', { mode });
    }

    /**
     * 获取当前播放模式
     */
    public getPlayMode(): PlayMode {
        return this.playMode;
    }

    /**
     * 设置自动播放下一个
     */
    public setAutoAdvance(enabled: boolean): void {
        this.autoAdvance = enabled;
        this.emit('playlist:auto-advance-change', { enabled });
    }

    /**
     * 获取自动播放状态
     */
    public isAutoAdvanceEnabled(): boolean {
        return this.autoAdvance;
    }

    /**
     * 获取播放列表
     */
    public getItems(): PlaylistItem[] {
        return [...this.items];
    }

    /**
     * 获取当前播放项
     */
    public getCurrentItem(): PlaylistItem | null {
        return this.isValidIndex(this.currentIndex) ? this.items[this.currentIndex] : null;
    }

    /**
     * 获取当前播放索引
     */
    public getCurrentIndex(): number {
        return this.currentIndex;
    }

    /**
     * 获取播放列表长度
     */
    public getLength(): number {
        return this.items.length;
    }

    /**
     * 检查索引是否有效
     */
    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.items.length;
    }

    /**
     * 加载当前播放项
     */
    private async loadCurrentItem(): Promise<void> {
        const currentItem = this.getCurrentItem();
        if (!currentItem || !this.player) return;

        // 设置视频源
        this.player.setSrc(currentItem.src);
        
        // 设置封面图片
        if (currentItem.poster) {
            this.player.setPoster(currentItem.poster);
        }

        // 恢复播放位置
        if (this.rememberPosition && this.positionMemory.has(currentItem.id)) {
            const savedPosition = this.positionMemory.get(currentItem.id)!;
            this.player.on('loadedmetadata', () => {
                this.player!.setCurrentTime(savedPosition);
            }, { once: true });
        }

        this.emit('playlist:item-change', {
            item: currentItem,
            index: this.currentIndex,
            total: this.items.length
        });
    }

    /**
     * 更新播放顺序
     */
    private updateOrder(): void {
        this.originalOrder = this.items.map((_, index) => index);
        if (this.playMode === PlayMode.SHUFFLE) {
            this.generateShuffleOrder();
        }
    }

    /**
     * 添加到播放历史
     */
    private addToHistory(itemId: string): void {
        // 移除重复项
        const existingIndex = this.playHistory.indexOf(itemId);
        if (existingIndex !== -1) {
            this.playHistory.splice(existingIndex, 1);
        }
        
        // 添加到开头
        this.playHistory.unshift(itemId);
        
        // 限制历史记录长度
        if (this.playHistory.length > 50) {
            this.playHistory = this.playHistory.slice(0, 50);
        }
    }

    /**
     * 获取播放历史
     */
    public getPlayHistory(): string[] {
        return [...this.playHistory];
    }

    /**
     * 移动播放列表项
     */
    public moveItem(fromIndex: number, toIndex: number): boolean {
        if (!this.isValidIndex(fromIndex) || toIndex < 0 || toIndex >= this.items.length) {
            return false;
        }

        const item = this.items.splice(fromIndex, 1)[0];
        this.items.splice(toIndex, 0, item);

        // 调整当前播放索引
        if (fromIndex === this.currentIndex) {
            this.currentIndex = toIndex;
        } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
            this.currentIndex--;
        } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
            this.currentIndex++;
        }

        this.updateOrder();
        this.emit('playlist:move', { fromIndex, toIndex, item });
        
        return true;
    }

    /**
     * 查找播放列表项
     */
    public findItem(predicate: (item: PlaylistItem, index: number) => boolean): PlaylistItem | null {
        const index = this.items.findIndex(predicate);
        return index !== -1 ? this.items[index] : null;
    }

    /**
     * 过滤播放列表项
     */
    public filterItems(predicate: (item: PlaylistItem, index: number) => boolean): PlaylistItem[] {
        return this.items.filter(predicate);
    }

    /**
     * 插件销毁
     */
    public async destroy(): Promise<void> {
        this.clear();
        await super.destroy();
    }
}
