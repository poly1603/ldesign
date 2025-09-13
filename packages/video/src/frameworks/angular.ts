/**
 * Angular 集成支持
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
  Injectable,
  NgModule,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core'
import { VideoPlayer } from '../core/player'
import type { PlayerOptions, PlayerStatus, IVideoPlayer } from '../types/player'

/**
 * 播放器服务
 */
@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {
  private players = new Map<string, IVideoPlayer>()

  /**
   * 创建播放器实例
   */
  createPlayer(id: string, options: PlayerOptions): IVideoPlayer {
    if (this.players.has(id)) {
      this.destroyPlayer(id)
    }

    const player = new VideoPlayer(options)
    this.players.set(id, player)
    
    return player
  }

  /**
   * 获取播放器实例
   */
  getPlayer(id: string): IVideoPlayer | undefined {
    return this.players.get(id)
  }

  /**
   * 销毁播放器实例
   */
  destroyPlayer(id: string): void {
    const player = this.players.get(id)
    if (player) {
      player.destroy()
      this.players.delete(id)
    }
  }

  /**
   * 销毁所有播放器实例
   */
  destroyAllPlayers(): void {
    this.players.forEach((player, id) => {
      player.destroy()
    })
    this.players.clear()
  }
}

/**
 * Angular 播放器组件
 */
@Component({
  selector: 'lv-video-player',
  template: `
    <div 
      #container 
      class="lv-player-container"
      [class]="className"
      [style]="containerStyle"
    >
      <div *ngIf="isLoading" class="lv-loading">
        <div class="lv-loading-spinner"></div>
        <span>加载中...</span>
      </div>
      <div *ngIf="error" class="lv-error">
        <span>播放器错误: {{ error.message }}</span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>

  // 输入属性
  @Input() src!: string | object
  @Input() autoplay = false
  @Input() muted = false
  @Input() loop = false
  @Input() controls = true
  @Input() volume = 1
  @Input() playbackRate = 1
  @Input() theme: string | object = 'default'
  @Input() plugins: any[] = []
  @Input() className = ''
  @Input() containerStyle: any = {}

  // 输出事件
  @Output() ready = new EventEmitter<void>()
  @Output() play = new EventEmitter<void>()
  @Output() pause = new EventEmitter<void>()
  @Output() ended = new EventEmitter<void>()
  @Output() timeUpdate = new EventEmitter<{ currentTime: number; duration: number }>()
  @Output() volumeChange = new EventEmitter<{ volume: number; muted: boolean }>()
  @Output() rateChange = new EventEmitter<{ playbackRate: number }>()
  @Output() fullscreenChange = new EventEmitter<{ fullscreen: boolean }>()
  @Output() pipChange = new EventEmitter<{ pip: boolean }>()
  @Output() playerError = new EventEmitter<Error>()

  // 组件状态
  player: IVideoPlayer | null = null
  status: PlayerStatus = {
    state: 'uninitialized',
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
    fullscreen: false,
    pip: false
  }
  isReady = false
  isLoading = false
  error: Error | null = null

  private playerId: string

  constructor(
    private playerService: VideoPlayerService,
    private cdr: ChangeDetectorRef
  ) {
    this.playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  ngOnInit() {
    this.initPlayer()
  }

  ngOnDestroy() {
    this.destroyPlayer()
  }

  /**
   * 初始化播放器
   */
  private async initPlayer() {
    try {
      this.isLoading = true
      this.error = null
      this.cdr.detectChanges()

      const options: PlayerOptions = {
        container: this.containerRef.nativeElement,
        src: this.src,
        autoplay: this.autoplay,
        muted: this.muted,
        loop: this.loop,
        controls: this.controls,
        volume: this.volume,
        playbackRate: this.playbackRate,
        theme: this.theme,
        plugins: this.plugins,
        className: this.className
      }

      this.player = this.playerService.createPlayer(this.playerId, options)

      // 绑定事件监听器
      this.bindPlayerEvents()

      // 初始化播放器
      await this.player.initialize()
      
      this.isReady = true
      this.ready.emit()
    } catch (err) {
      this.error = err as Error
      this.playerError.emit(this.error)
    } finally {
      this.isLoading = false
      this.cdr.detectChanges()
    }
  }

  /**
   * 销毁播放器
   */
  private destroyPlayer() {
    this.playerService.destroyPlayer(this.playerId)
    this.player = null
    this.isReady = false
  }

  /**
   * 绑定播放器事件
   */
  private bindPlayerEvents() {
    if (!this.player) return

    this.player.on('ready', () => {
      this.status = { ...this.player!.status }
      this.cdr.detectChanges()
    })

    this.player.on('timeupdate', () => {
      this.status = { ...this.player!.status }
      this.timeUpdate.emit({
        currentTime: this.status.currentTime,
        duration: this.status.duration
      })
      this.cdr.detectChanges()
    })

    this.player.on('play', () => {
      this.status = { ...this.player!.status }
      this.play.emit()
      this.cdr.detectChanges()
    })

    this.player.on('pause', () => {
      this.status = { ...this.player!.status }
      this.pause.emit()
      this.cdr.detectChanges()
    })

    this.player.on('ended', () => {
      this.status = { ...this.player!.status }
      this.ended.emit()
      this.cdr.detectChanges()
    })

    this.player.on('volumechange', () => {
      this.status = { ...this.player!.status }
      this.volumeChange.emit({
        volume: this.status.volume,
        muted: this.status.muted
      })
      this.cdr.detectChanges()
    })

    this.player.on('ratechange', () => {
      this.status = { ...this.player!.status }
      this.rateChange.emit({
        playbackRate: this.status.playbackRate
      })
      this.cdr.detectChanges()
    })

    this.player.on('fullscreenchange', () => {
      this.status = { ...this.player!.status }
      this.fullscreenChange.emit({
        fullscreen: this.status.fullscreen
      })
      this.cdr.detectChanges()
    })

    this.player.on('pipchange', () => {
      this.status = { ...this.player!.status }
      this.pipChange.emit({
        pip: this.status.pip
      })
      this.cdr.detectChanges()
    })

    this.player.on('error', (errorEvent) => {
      this.error = errorEvent.error
      this.playerError.emit(this.error)
      this.cdr.detectChanges()
    })
  }

  /**
   * 播放器控制方法
   */
  async playVideo() {
    if (this.player) {
      await this.player.play()
    }
  }

  pauseVideo() {
    if (this.player) {
      this.player.pause()
    }
  }

  toggleVideo() {
    if (this.player) {
      this.player.toggle()
    }
  }

  seekTo(time: number) {
    if (this.player) {
      this.player.seek(time)
    }
  }

  setVideoVolume(volume: number) {
    if (this.player) {
      this.player.setVolume(volume)
    }
  }

  setVideoPlaybackRate(rate: number) {
    if (this.player) {
      this.player.setPlaybackRate(rate)
    }
  }

  async toggleVideoFullscreen() {
    if (this.player) {
      await this.player.toggleFullscreen()
    }
  }

  async toggleVideoPip() {
    if (this.player) {
      await this.player.togglePip()
    }
  }
}

/**
 * Angular 模块
 */
@NgModule({
  declarations: [VideoPlayerComponent],
  providers: [VideoPlayerService],
  exports: [VideoPlayerComponent]
})
export class VideoPlayerModule {}

/**
 * 导出所有公共API
 */
export {
  VideoPlayerComponent,
  VideoPlayerService,
  VideoPlayerModule
}
