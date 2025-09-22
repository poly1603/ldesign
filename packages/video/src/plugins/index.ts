/**
 * 插件导出文件
 * 统一导出所有插件
 */

// 控制栏插件
export { ControlBar, createControlBar, ControlPosition } from './ControlBar';
export { SimpleProgressBar, createSimpleProgressBar } from './SimpleProgressBar';
export { SimpleTimeDisplay, createSimpleTimeDisplay, TimeFormat } from './SimpleTimeDisplay';
export { SimpleFullscreenButton, createSimpleFullscreenButton } from './SimpleFullscreenButton';

// 基础插件
export { PlayButton, createPlayButton } from './PlayButton';
export { ProgressBar, createProgressBar } from './ProgressBar';
export { VolumeControl, createVolumeControl } from './VolumeControl';
export { FullscreenButton, createFullscreenButton } from './FullscreenButton';
export { TimeDisplay, createTimeDisplay } from './TimeDisplay';

// 高级插件
export { PictureInPicture, createPictureInPicture } from './PictureInPicture';
export { Screenshot, createScreenshot } from './Screenshot';
export { PlaybackRate, createPlaybackRate } from './PlaybackRate';
export { Danmaku, DanmakuType } from './Danmaku';
export { DanmakuControl } from './DanmakuControl';
export { Subtitle, SubtitleFormat } from './Subtitle';
export { SubtitleControl } from './SubtitleControl';
export { QualitySwitch } from './QualitySwitch';
export { QualitySwitchControl } from './QualitySwitchControl';
export { Playlist, PlayMode } from './Playlist';
export { PlaylistControl } from './PlaylistControl';

// 增强功能插件
export { ScreenshotPlugin } from './ScreenshotPlugin';
export { VideoRecorder } from './VideoRecorder';
export { VideoFilter } from './VideoFilter';
export { MultiTrack } from './MultiTrack';

// 新增实用插件
export { AdvancedPluginManager } from './AdvancedPluginManager';
export { KeyboardShortcuts, createKeyboardShortcuts } from './KeyboardShortcuts';
export { GestureControl, createGestureControl, GestureType } from './GestureControl';
export { MiniPlayer, createMiniPlayer, MiniPlayerMode, MiniPlayerPosition } from './MiniPlayer';

// 插件配置类型
export type { PlayButtonConfig } from './PlayButton';
export type { ProgressBarConfig } from './ProgressBar';
export type { VolumeControlConfig } from './VolumeControl';
export type { FullscreenButtonConfig } from './FullscreenButton';
export type { TimeDisplayConfig } from './TimeDisplay';
export type { PictureInPictureConfig } from './PictureInPicture';
export type { ScreenshotConfig, ScreenshotData } from './Screenshot';
export type { PlaybackRateConfig } from './PlaybackRate';
export type { DanmakuConfig, DanmakuData } from './Danmaku';
export type { DanmakuControlConfig } from './DanmakuControl';
export type { SubtitleConfig, SubtitleItem, SubtitleStyle, SubtitlePosition, SubtitleTrack } from './Subtitle';
export type { SubtitleControlConfig } from './SubtitleControl';
export type { QualitySwitchConfig, VideoQuality, NetworkInfo } from './QualitySwitch';
export type { QualitySwitchControlConfig } from './QualitySwitchControl';
export type { PlaylistConfig, PlaylistItem } from './Playlist';
export type { PlaylistControlConfig } from './PlaylistControl';

// 增强功能插件类型
export type { ScreenshotConfig } from './ScreenshotPlugin';
export type { VideoRecorderConfig, RecordingSegment } from './VideoRecorder';
export type { VideoFilterConfig, FilterConfig } from './VideoFilter';
export type { MultiTrackConfig, AudioTrack, SubtitleTrack } from './MultiTrack';

// 新增插件类型
export type {
  ExtendedPluginMetadata,
  PluginDependency,
  PluginLifecycleHooks,
  PluginRegistration,
  PluginLoadOptions
} from './AdvancedPluginManager';
export type {
  KeyboardShortcutsConfig,
  ShortcutConfig
} from './KeyboardShortcuts';
export type {
  GestureControlConfig,
  GestureConfig
} from './GestureControl';
export type {
  MiniPlayerConfig
} from './MiniPlayer';

// 插件工厂函数
import type { IPlayer } from '../types';
import { PlayButton, PlayButtonConfig } from './PlayButton';
import { ProgressBar, ProgressBarConfig } from './ProgressBar';
import { VolumeControl, VolumeControlConfig } from './VolumeControl';
import { FullscreenButton, FullscreenButtonConfig } from './FullscreenButton';
import { TimeDisplay, TimeDisplayConfig } from './TimeDisplay';
import { PictureInPicture, PictureInPictureConfig } from './PictureInPicture';
import { Screenshot, ScreenshotConfig } from './Screenshot';
import { PlaybackRate, PlaybackRateConfig } from './PlaybackRate';

/**
 * 插件工厂配置
 */
export interface PluginFactoryConfig {
  playButton?: PlayButtonConfig;
  progressBar?: ProgressBarConfig;
  volumeControl?: VolumeControlConfig;
  fullscreenButton?: FullscreenButtonConfig;
  timeDisplay?: TimeDisplayConfig;
  pictureInPicture?: PictureInPictureConfig;
  screenshot?: ScreenshotConfig;
  playbackRate?: PlaybackRateConfig;
}

/**
 * 插件工厂类
 * 提供便捷的插件创建方法
 */
export class PluginFactory {
  private readonly player: IPlayer;

  constructor(player: IPlayer) {
    this.player = player;
  }

  /**
   * 创建播放按钮
   */
  createPlayButton(config?: PlayButtonConfig): PlayButton {
    return new PlayButton(this.player, config);
  }

  /**
   * 创建进度条
   */
  createProgressBar(config?: ProgressBarConfig): ProgressBar {
    return new ProgressBar(this.player, config);
  }

  /**
   * 创建音量控制
   */
  createVolumeControl(config?: VolumeControlConfig): VolumeControl {
    return new VolumeControl(this.player, config);
  }

  /**
   * 创建全屏按钮
   */
  createFullscreenButton(config?: FullscreenButtonConfig): FullscreenButton {
    return new FullscreenButton(this.player, config);
  }

  /**
   * 创建时间显示
   */
  createTimeDisplay(config?: TimeDisplayConfig): TimeDisplay {
    return new TimeDisplay(this.player, config);
  }

  /**
   * 创建画中画按钮
   */
  createPictureInPicture(config?: PictureInPictureConfig): PictureInPicture {
    return new PictureInPicture(this.player, config);
  }

  /**
   * 创建截图按钮
   */
  createScreenshot(config?: ScreenshotConfig): Screenshot {
    return new Screenshot(this.player, config);
  }

  /**
   * 创建播放速度控制
   */
  createPlaybackRate(config?: PlaybackRateConfig): PlaybackRate {
    return new PlaybackRate(this.player, config);
  }

  /**
   * 创建基础控制栏插件集合
   */
  createBasicControls(config: PluginFactoryConfig = {}): {
    playButton: PlayButton;
    progressBar: ProgressBar;
    volumeControl: VolumeControl;
    fullscreenButton: FullscreenButton;
    timeDisplay: TimeDisplay;
  } {
    return {
      playButton: this.createPlayButton(config.playButton),
      progressBar: this.createProgressBar(config.progressBar),
      volumeControl: this.createVolumeControl(config.volumeControl),
      fullscreenButton: this.createFullscreenButton(config.fullscreenButton),
      timeDisplay: this.createTimeDisplay(config.timeDisplay)
    };
  }

  /**
   * 创建所有基础插件并自动注册到播放器
   */
  async setupBasicControls(config: PluginFactoryConfig = {}): Promise<void> {
    const plugins = this.createBasicControls(config);

    // 初始化所有插件
    for (const [name, plugin] of Object.entries(plugins)) {
      try {
        await plugin.init();
        await plugin.mount(this.player.container);
        console.log(`Plugin ${name} initialized successfully`);
      } catch (error) {
        console.error(`Failed to initialize plugin ${name}:`, error);
      }
    }
  }
}

/**
 * 创建插件工厂
 */
export function createPluginFactory(player: IPlayer): PluginFactory {
  return new PluginFactory(player);
}

/**
 * 默认插件配置
 */
export const defaultPluginConfig: PluginFactoryConfig = {
  playButton: {
    showLabel: false
  },
  progressBar: {
    showBuffer: true,
    showTooltip: true,
    seekOnClick: true,
    seekOnDrag: true
  },
  volumeControl: {
    showSlider: true,
    orientation: 'horizontal'
  },
  fullscreenButton: {
    showLabel: false
  },
  timeDisplay: {
    format: 'both',
    clickToToggle: true
  }
};

/**
 * 快速设置基础控制栏
 */
export async function setupBasicPlayer(player: IPlayer, config?: PluginFactoryConfig): Promise<PluginFactory> {
  const factory = createPluginFactory(player);
  await factory.setupBasicControls({ ...defaultPluginConfig, ...config });
  return factory;
}
