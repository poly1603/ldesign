/**
 * Angular 适配器
 * 提供 Angular 组件和服务
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Injectable,
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { Player, createPlayer } from '../core/Player';
import { setupBasicPlayer, PluginFactoryConfig } from '../plugins';
import type { PlayerConfig } from '../types';

/**
 * Angular 播放器服务
 */
@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {
  private players = new Map<string, Player>();

  /**
   * 创建播放器实例
   */
  async createPlayer(id: string, config: PlayerConfig): Promise<Player> {
    try {
      const player = createPlayer(config);
      this.players.set(id, player);
      return player;
    } catch (error) {
      console.error('Failed to create player:', error);
      throw error;
    }
  }

  /**
   * 获取播放器实例
   */
  getPlayer(id: string): Player | undefined {
    return this.players.get(id);
  }

  /**
   * 销毁播放器实例
   */
  destroyPlayer(id: string): void {
    const player = this.players.get(id);
    if (player) {
      player.destroy();
      this.players.delete(id);
    }
  }

  /**
   * 销毁所有播放器
   */
  destroyAll(): void {
    for (const [id, player] of this.players) {
      player.destroy();
    }
    this.players.clear();
  }
}

/**
 * Angular 播放器组件
 */
@Component({
  selector: 'video-player',
  template: `
    <div #container class="ldesign-angular-player" [ngClass]="className" [ngStyle]="style">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .ldesign-angular-player {
      width: 100%;
      height: 100%;
    }
  `]
})
export class VideoPlayerComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  // 输入属性
  @Input() src?: string | string[];
  @Input() poster?: string;
  @Input() autoplay = false;
  @Input() muted = false;
  @Input() loop = false;
  @Input() controls = true;
  @Input() width: string | number = '100%';
  @Input() height: string | number = 'auto';
  @Input() responsive = true;
  @Input() plugins: PluginFactoryConfig = {};
  @Input() theme = 'default';
  @Input() className?: string;
  @Input() style?: { [key: string]: any };

  // 输出事件
  @Output() ready = new EventEmitter<Player>();
  @Output() play = new EventEmitter<any>();
  @Output() pause = new EventEmitter<any>();
  @Output() ended = new EventEmitter<any>();
  @Output() timeUpdate = new EventEmitter<any>();
  @Output() loadStart = new EventEmitter<any>();
  @Output() loadedMetadata = new EventEmitter<any>();
  @Output() canPlay = new EventEmitter<any>();
  @Output() waiting = new EventEmitter<any>();
  @Output() seeking = new EventEmitter<any>();
  @Output() seeked = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();
  @Output() fullscreenEnter = new EventEmitter<any>();
  @Output() fullscreenExit = new EventEmitter<any>();
  @Output() volumeChange = new EventEmitter<any>();
  @Output() rateChange = new EventEmitter<any>();

  // 播放器实例
  player?: Player;
  isReady = false;

  private playerId = `player-${Math.random().toString(36).substr(2, 9)}`;

  constructor(private playerService: VideoPlayerService) { }

  async ngOnInit() {
    await this.createPlayer();
  }

  ngOnDestroy() {
    this.destroyPlayer();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.player) {
      // 处理属性变化
      if (changes['src'] && !changes['src'].firstChange) {
        const newSrc = changes['src'].currentValue;
        if (newSrc) {
          this.player.element.src = Array.isArray(newSrc) ? newSrc[0] : newSrc;
        }
      }

      if (changes['muted'] && !changes['muted'].firstChange) {
        this.player.muted = changes['muted'].currentValue;
      }

      if (changes['autoplay'] && !changes['autoplay'].firstChange) {
        this.player.element.autoplay = changes['autoplay'].currentValue;
      }
    }
  }

  /**
   * 创建播放器
   */
  private async createPlayer() {
    if (!this.containerRef?.nativeElement) return;

    try {
      const config: PlayerConfig = {
        container: this.containerRef.nativeElement,
        src: this.src,
        poster: this.poster,
        autoplay: this.autoplay,
        muted: this.muted,
        loop: this.loop,
        controls: false, // 使用自定义控制栏
        width: this.width,
        height: this.height,
        responsive: this.responsive
      };

      this.player = await this.playerService.createPlayer(this.playerId, config);

      // 设置基础插件
      await setupBasicPlayer(this.player, this.plugins);

      // 绑定事件
      this.bindEvents();

      this.isReady = true;
      this.ready.emit(this.player);

    } catch (error) {
      console.error('Failed to create player:', error);
      this.error.emit(error);
    }
  }

  /**
   * 绑定播放器事件
   */
  private bindEvents() {
    if (!this.player) return;

    this.player.on('media:play', (data) => this.play.emit(data));
    this.player.on('media:pause', (data) => this.pause.emit(data));
    this.player.on('media:ended', (data) => this.ended.emit(data));
    this.player.on('media:timeupdate', (data) => this.timeUpdate.emit(data));
    this.player.on('media:loadstart', (data) => this.loadStart.emit(data));
    this.player.on('media:loadedmetadata', (data) => this.loadedMetadata.emit(data));
    this.player.on('media:canplay', (data) => this.canPlay.emit(data));
    this.player.on('media:waiting', (data) => this.waiting.emit(data));
    this.player.on('media:seeking', (data) => this.seeking.emit(data));
    this.player.on('media:seeked', (data) => this.seeked.emit(data));
    this.player.on('error:media', (data) => this.error.emit(data));
    this.player.on('fullscreen:enter', (data) => this.fullscreenEnter.emit(data));
    this.player.on('fullscreen:exit', (data) => this.fullscreenExit.emit(data));
    this.player.on('media:volumechange', (data) => this.volumeChange.emit(data));
    this.player.on('media:ratechange', (data) => this.rateChange.emit(data));
  }

  /**
   * 销毁播放器
   */
  private destroyPlayer() {
    this.playerService.destroyPlayer(this.playerId);
    this.player = undefined;
    this.isReady = false;
  }

  // 公共方法
  async playVideo(): Promise<void> {
    return this.player?.play();
  }

  pauseVideo(): void {
    this.player?.pause();
  }

  seekTo(time: number): void {
    this.player?.seek(time);
  }

  setVolume(volume: number): void {
    if (this.player) {
      this.player.volume = volume;
    }
  }

  setMuted(muted: boolean): void {
    if (this.player) {
      this.player.muted = muted;
    }
  }

  setPlaybackRate(rate: number): void {
    if (this.player) {
      this.player.playbackRate = rate;
    }
  }

  async enterFullscreen(): Promise<void> {
    return this.player?.enterFullscreen();
  }

  async exitFullscreen(): Promise<void> {
    return this.player?.exitFullscreen();
  }

  getCurrentTime(): number {
    return this.player?.currentTime || 0;
  }

  getDuration(): number {
    return this.player?.duration || 0;
  }

  getVolume(): number {
    return this.player?.volume || 0;
  }

  isMuted(): boolean {
    return this.player?.muted || false;
  }

  isPaused(): boolean {
    return this.player?.paused || true;
  }

  isEnded(): boolean {
    return this.player?.ended || false;
  }
}

/**
 * Angular 模块
 */
@NgModule({
  declarations: [VideoPlayerComponent],
  providers: [VideoPlayerService],
  exports: [VideoPlayerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VideoPlayerModule { }
