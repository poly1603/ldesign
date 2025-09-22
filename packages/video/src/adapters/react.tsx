/**
 * React 适配器
 * 提供 React 组件和 Hooks
 */

import React, { 
  useRef, 
  useEffect, 
  useState, 
  useCallback, 
  forwardRef, 
  useImperativeHandle,
  ReactNode
} from 'react';

import { Player, createPlayer } from '../core/Player';
import { setupBasicPlayer, PluginFactoryConfig } from '../plugins';
import type { PlayerConfig } from '../types';

/**
 * React 播放器属性
 */
export interface ReactPlayerProps {
  src?: string | string[];
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
  responsive?: boolean;
  plugins?: PluginFactoryConfig;
  theme?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  
  // 事件处理器
  onReady?: (player: Player) => void;
  onPlay?: (data: any) => void;
  onPause?: (data: any) => void;
  onEnded?: (data: any) => void;
  onTimeUpdate?: (data: any) => void;
  onLoadStart?: (data: any) => void;
  onLoadedMetadata?: (data: any) => void;
  onCanPlay?: (data: any) => void;
  onWaiting?: (data: any) => void;
  onSeeking?: (data: any) => void;
  onSeeked?: (data: any) => void;
  onError?: (data: any) => void;
  onFullscreenEnter?: (data: any) => void;
  onFullscreenExit?: (data: any) => void;
  onVolumeChange?: (data: any) => void;
  onRateChange?: (data: any) => void;
}

/**
 * 播放器实例方法
 */
export interface PlayerRef {
  player: Player | null;
  play: () => Promise<void> | undefined;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  enterFullscreen: () => Promise<void> | undefined;
  exitFullscreen: () => Promise<void> | undefined;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVolume: () => number;
  isMuted: () => boolean;
  isPaused: () => boolean;
  isEnded: () => boolean;
}

/**
 * React 播放器组件
 */
export const VideoPlayer = forwardRef<PlayerRef, ReactPlayerProps>((props, ref) => {
  const {
    src,
    poster,
    autoplay = false,
    muted = false,
    loop = false,
    controls = true,
    width = '100%',
    height = 'auto',
    responsive = true,
    plugins = {},
    theme = 'default',
    className,
    style,
    children,
    onReady,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onLoadStart,
    onLoadedMetadata,
    onCanPlay,
    onWaiting,
    onSeeking,
    onSeeked,
    onError,
    onFullscreenEnter,
    onFullscreenExit,
    onVolumeChange,
    onRateChange
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 创建播放器
  const createPlayerInstance = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      const config: PlayerConfig = {
        container: containerRef.current,
        src,
        poster,
        autoplay,
        muted,
        loop,
        controls: false, // 使用自定义控制栏
        width,
        height,
        responsive
      };

      const playerInstance = createPlayer(config);
      
      // 设置基础插件
      await setupBasicPlayer(playerInstance, plugins);
      
      setPlayer(playerInstance);
      setIsReady(true);
      
      onReady?.(playerInstance);

    } catch (error) {
      console.error('Failed to create player:', error);
      onError?.(error);
    }
  }, [src, poster, autoplay, muted, loop, width, height, responsive, plugins, onReady, onError]);

  // 绑定事件
  useEffect(() => {
    if (!player) return;

    const eventHandlers = [
      { event: 'media:play', handler: onPlay },
      { event: 'media:pause', handler: onPause },
      { event: 'media:ended', handler: onEnded },
      { event: 'media:timeupdate', handler: onTimeUpdate },
      { event: 'media:loadstart', handler: onLoadStart },
      { event: 'media:loadedmetadata', handler: onLoadedMetadata },
      { event: 'media:canplay', handler: onCanPlay },
      { event: 'media:waiting', handler: onWaiting },
      { event: 'media:seeking', handler: onSeeking },
      { event: 'media:seeked', handler: onSeeked },
      { event: 'error:media', handler: onError },
      { event: 'fullscreen:enter', handler: onFullscreenEnter },
      { event: 'fullscreen:exit', handler: onFullscreenExit },
      { event: 'media:volumechange', handler: onVolumeChange },
      { event: 'media:ratechange', handler: onRateChange }
    ];

    eventHandlers.forEach(({ event, handler }) => {
      if (handler) {
        player.on(event as any, handler);
      }
    });

    return () => {
      eventHandlers.forEach(({ event, handler }) => {
        if (handler) {
          player.off(event as any, handler);
        }
      });
    };
  }, [
    player,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onLoadStart,
    onLoadedMetadata,
    onCanPlay,
    onWaiting,
    onSeeking,
    onSeeked,
    onError,
    onFullscreenEnter,
    onFullscreenExit,
    onVolumeChange,
    onRateChange
  ]);

  // 监听 src 变化
  useEffect(() => {
    if (player && src) {
      player.element.src = Array.isArray(src) ? src[0] : src;
    }
  }, [player, src]);

  // 监听其他属性变化
  useEffect(() => {
    if (player) {
      player.muted = muted;
    }
  }, [player, muted]);

  useEffect(() => {
    if (player) {
      player.element.autoplay = autoplay;
    }
  }, [player, autoplay]);

  // 初始化播放器
  useEffect(() => {
    createPlayerInstance();
    
    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [createPlayerInstance]);

  // 暴露播放器方法
  useImperativeHandle(ref, () => ({
    player,
    play: () => player?.play(),
    pause: () => player?.pause(),
    seek: (time: number) => player?.seek(time),
    setVolume: (volume: number) => {
      if (player) player.volume = volume;
    },
    setMuted: (muted: boolean) => {
      if (player) player.muted = muted;
    },
    setPlaybackRate: (rate: number) => {
      if (player) player.playbackRate = rate;
    },
    enterFullscreen: () => player?.enterFullscreen(),
    exitFullscreen: () => player?.exitFullscreen(),
    getCurrentTime: () => player?.currentTime || 0,
    getDuration: () => player?.duration || 0,
    getVolume: () => player?.volume || 0,
    isMuted: () => player?.muted || false,
    isPaused: () => player?.paused || true,
    isEnded: () => player?.ended || false
  }), [player]);

  return (
    <div
      ref={containerRef}
      className={`ldesign-react-player ${className || ''}`}
      style={style}
    >
      {children}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

/**
 * React Hook for video player
 */
export function useVideoPlayer(config: PlayerConfig) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMutedState] = useState(false);
  const [paused, setPaused] = useState(true);
  const [ended, setEnded] = useState(false);
  const [buffered, setBuffered] = useState(0);

  // 创建播放器
  const createPlayer = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      const playerInstance = new Player({
        container: containerRef.current,
        ...config
      });

      // 绑定状态更新
      playerInstance.on('media:timeupdate', (data) => {
        setCurrentTime(data.currentTime);
        setDuration(data.duration);
      });

      playerInstance.on('media:volumechange', () => {
        setVolumeState(playerInstance.volume);
        setMutedState(playerInstance.muted);
      });

      playerInstance.on('media:play', () => {
        setPaused(false);
        setEnded(false);
      });

      playerInstance.on('media:pause', () => {
        setPaused(true);
      });

      playerInstance.on('media:ended', () => {
        setEnded(true);
        setPaused(true);
      });

      playerInstance.on('media:loadedmetadata', (data) => {
        setDuration(data.duration);
      });

      setPlayer(playerInstance);
      setIsReady(true);

    } catch (error) {
      console.error('Failed to create player:', error);
      throw error;
    }
  }, [config]);

  // 播放器方法
  const play = useCallback(() => player?.play(), [player]);
  const pause = useCallback(() => player?.pause(), [player]);
  const seek = useCallback((time: number) => player?.seek(time), [player]);
  const setVolume = useCallback((vol: number) => {
    if (player) player.volume = vol;
  }, [player]);
  const setMuted = useCallback((mut: boolean) => {
    if (player) player.muted = mut;
  }, [player]);
  const setPlaybackRate = useCallback((rate: number) => {
    if (player) player.playbackRate = rate;
  }, [player]);
  const enterFullscreen = useCallback(() => player?.enterFullscreen(), [player]);
  const exitFullscreen = useCallback(() => player?.exitFullscreen(), [player]);

  // 销毁播放器
  const destroy = useCallback(() => {
    if (player) {
      player.destroy();
      setPlayer(null);
      setIsReady(false);
    }
  }, [player]);

  return {
    // Refs
    containerRef,
    
    // 播放器实例
    player,
    
    // 状态
    isReady,
    currentTime,
    duration,
    volume,
    muted,
    paused,
    ended,
    buffered,
    
    // 方法
    createPlayer,
    play,
    pause,
    seek,
    setVolume,
    setMuted,
    setPlaybackRate,
    enterFullscreen,
    exitFullscreen,
    destroy
  };
}

export default VideoPlayer;
