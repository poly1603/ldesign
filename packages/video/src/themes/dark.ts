/**
 * 暗色主题配置
 * 提供完整的暗色主题样式，适合夜间使用
 */
import type { ThemeConfig } from '../types/themes';

export const darkTheme: ThemeConfig = {
  name: 'dark',
  type: 'dark',
  description: '暗色主题，适合夜间使用，护眼舒适',
  variables: {
    // 颜色系统
    colors: {
      // 主色调
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryActive: '#1d4ed8',
      
      // 次要色调
      secondary: '#6b7280',
      secondaryHover: '#4b5563',
      secondaryActive: '#374151',
      
      // 成功色
      success: '#10b981',
      successHover: '#059669',
      successActive: '#047857',
      
      // 警告色
      warning: '#f59e0b',
      warningHover: '#d97706',
      warningActive: '#b45309',
      
      // 错误色
      error: '#ef4444',
      errorHover: '#dc2626',
      errorActive: '#b91c1c',
      
      // 信息色
      info: '#06b6d4',
      infoHover: '#0891b2',
      infoActive: '#0e7490',
      
      // 背景色
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      backgroundTertiary: '#334155',
      
      // 表面色
      surface: '#1e293b',
      surfaceHover: '#334155',
      surfaceActive: '#475569',
      
      // 文本色
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      textTertiary: '#94a3b8',
      textDisabled: '#64748b',
      
      // 边框色
      border: '#334155',
      borderHover: '#475569',
      borderActive: '#64748b',
      
      // 控制栏相关
      controlBackground: 'rgba(15, 23, 42, 0.9)',
      controlBackgroundHover: 'rgba(30, 41, 59, 0.95)',
      controlText: '#f8fafc',
      controlTextSecondary: '#cbd5e1',
      
      // 进度条
      progressBackground: 'rgba(100, 116, 139, 0.3)',
      progressForeground: '#3b82f6',
      progressBuffer: 'rgba(59, 130, 246, 0.3)',
      
      // 音量
      volumeBackground: 'rgba(100, 116, 139, 0.3)',
      volumeForeground: '#3b82f6',
      
      // 遮罩
      overlay: 'rgba(15, 23, 42, 0.8)',
      overlayLight: 'rgba(15, 23, 42, 0.6)',
      overlayDark: 'rgba(15, 23, 42, 0.9)',
      
      // 阴影
      shadow: 'rgba(0, 0, 0, 0.5)',
      shadowLight: 'rgba(0, 0, 0, 0.3)',
      shadowDark: 'rgba(0, 0, 0, 0.7)'
    },
    
    // 字体系统
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: '14px',
      sizeSmall: '12px',
      sizeLarge: '16px',
      sizeXLarge: '18px',
      weight: '400',
      weightBold: '600',
      weightLight: '300',
      lineHeight: '1.5',
      letterSpacing: '0.01em'
    },
    
    // 尺寸系统
    sizes: {
      controlsHeight: '48px',
      controlsHeightCompact: '40px',
      buttonSize: '40px',
      buttonSizeSmall: '32px',
      buttonSizeLarge: '48px',
      iconSize: '20px',
      iconSizeSmall: '16px',
      iconSizeLarge: '24px',
      borderRadius: '8px',
      borderRadiusSmall: '4px',
      borderRadiusLarge: '12px',
      spacing: '8px',
      spacingSmall: '4px',
      spacingLarge: '16px',
      spacingXLarge: '24px'
    },
    
    // 动画系统
    animations: {
      duration: '0.2s',
      durationSlow: '0.3s',
      durationFast: '0.15s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easingIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easingOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easingInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  
  // 组件样式
  components: {
    // 播放器容器
    player: {
      background: 'var(--lv-color-background)',
      borderRadius: 'var(--lv-border-radius)',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'var(--lv-font-family)',
      fontSize: 'var(--lv-font-size)',
      lineHeight: 'var(--lv-line-height)',
      color: 'var(--lv-color-text)'
    },
    
    // 视频元素
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      background: '#000000'
    },
    
    // 控制栏
    controls: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      height: 'var(--lv-controls-height)',
      background: 'var(--lv-color-control-background)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--lv-spacing)',
      gap: 'var(--lv-spacing)',
      transition: 'opacity var(--lv-animation-duration) var(--lv-animation-easing)',
      zIndex: '10'
    },
    
    // 按钮
    button: {
      width: 'var(--lv-button-size)',
      height: 'var(--lv-button-size)',
      borderRadius: 'var(--lv-border-radius-small)',
      border: 'none',
      background: 'transparent',
      color: 'var(--lv-color-control-text)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all var(--lv-animation-duration) var(--lv-animation-easing)',
      fontSize: 'var(--lv-icon-size)',
      
      '&:hover': {
        background: 'var(--lv-color-surface-hover)',
        transform: 'scale(1.05)'
      },
      
      '&:active': {
        background: 'var(--lv-color-surface-active)',
        transform: 'scale(0.95)'
      },
      
      '&:disabled': {
        opacity: '0.5',
        cursor: 'not-allowed',
        transform: 'none'
      }
    },
    
    // 进度条
    progress: {
      flex: '1',
      height: '4px',
      borderRadius: '2px',
      background: 'var(--lv-color-progress-background)',
      position: 'relative',
      cursor: 'pointer',
      
      '&:hover': {
        height: '6px'
      },
      
      '.progress-buffer': {
        position: 'absolute',
        top: '0',
        left: '0',
        height: '100%',
        background: 'var(--lv-color-progress-buffer)',
        borderRadius: 'inherit',
        transition: 'width var(--lv-animation-duration-fast) linear'
      },
      
      '.progress-played': {
        position: 'absolute',
        top: '0',
        left: '0',
        height: '100%',
        background: 'var(--lv-color-progress-foreground)',
        borderRadius: 'inherit',
        transition: 'width var(--lv-animation-duration-fast) linear'
      },
      
      '.progress-thumb': {
        position: 'absolute',
        top: '50%',
        right: '-6px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: 'var(--lv-color-progress-foreground)',
        transform: 'translateY(-50%)',
        opacity: '0',
        transition: 'opacity var(--lv-animation-duration) var(--lv-animation-easing)',
        
        '&:hover': {
          opacity: '1'
        }
      }
    },
    
    // 音量控制
    volume: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--lv-spacing-small)',
      
      '.volume-slider': {
        width: '60px',
        height: '4px',
        borderRadius: '2px',
        background: 'var(--lv-color-volume-background)',
        position: 'relative',
        cursor: 'pointer',
        
        '.volume-filled': {
          position: 'absolute',
          top: '0',
          left: '0',
          height: '100%',
          background: 'var(--lv-color-volume-foreground)',
          borderRadius: 'inherit',
          transition: 'width var(--lv-animation-duration-fast) linear'
        }
      }
    },
    
    // 时间显示
    time: {
      color: 'var(--lv-color-control-text-secondary)',
      fontSize: 'var(--lv-font-size-small)',
      fontWeight: 'var(--lv-font-weight)',
      whiteSpace: 'nowrap',
      userSelect: 'none'
    },
    
    // 加载指示器
    loading: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'var(--lv-color-primary)',
      fontSize: 'var(--lv-icon-size-large)',
      zIndex: '20'
    },
    
    // 错误提示
    error: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'var(--lv-color-overlay)',
      color: 'var(--lv-color-text)',
      padding: 'var(--lv-spacing-large)',
      borderRadius: 'var(--lv-border-radius)',
      textAlign: 'center',
      zIndex: '30'
    }
  }
};
