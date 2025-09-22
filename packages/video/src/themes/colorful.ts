/**
 * 彩色主题配置
 * 使用渐变色彩和现代化设计，充满活力
 */
import type { ThemeConfig } from '../types/themes';

export const colorfulTheme: ThemeConfig = {
  name: 'colorful',
  type: 'light',
  description: '彩色主题，使用渐变色彩和现代化设计，充满活力',
  variables: {
    // 颜色系统
    colors: {
      // 主色调 - 使用渐变蓝紫色
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      primaryHover: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
      primaryActive: 'linear-gradient(135deg, #4e60c6 0%, #5e377e 100%)',
      
      // 次要色调 - 使用渐变灰色
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      secondaryHover: 'linear-gradient(135deg, #ee84f9 0%, #f34860 100%)',
      secondaryActive: 'linear-gradient(135deg, #ec75f7 0%, #f13954 100%)',
      
      // 成功色 - 渐变绿色
      success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      successHover: 'linear-gradient(135deg, #3d9bfc 0%, #00e8fc 100%)',
      successActive: 'linear-gradient(135deg, #2b8afa 0%, #00defa 100%)',
      
      // 警告色 - 渐变橙色
      warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      warningHover: 'linear-gradient(135deg, #f9618b 0%, #fedd2e 100%)',
      warningActive: 'linear-gradient(135deg, #f8527c 0%, #fed91c 100%)',
      
      // 错误色 - 渐变红色
      error: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      errorHover: 'linear-gradient(135deg, #ff8a8f 0%, #fec5ed 100%)',
      errorActive: 'linear-gradient(135deg, #ff7a80 0%, #febb eb 100%)',
      
      // 信息色 - 渐变青色
      info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      infoHover: 'linear-gradient(135deg, #9ee9e6 0%, #fed0df 100%)',
      infoActive: 'linear-gradient(135deg, #94e5e2 0%, #fecadb 100%)',
      
      // 背景色 - 渐变白色
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      backgroundSecondary: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      backgroundTertiary: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      
      // 表面色
      surface: 'rgba(255, 255, 255, 0.9)',
      surfaceHover: 'rgba(255, 255, 255, 0.95)',
      surfaceActive: 'rgba(248, 249, 250, 0.9)',
      
      // 文本色
      text: '#2d3748',
      textSecondary: '#4a5568',
      textTertiary: '#718096',
      textDisabled: '#a0aec0',
      
      // 边框色
      border: 'rgba(226, 232, 240, 0.8)',
      borderHover: 'rgba(203, 213, 225, 0.8)',
      borderActive: 'rgba(148, 163, 184, 0.8)',
      
      // 控制栏相关 - 使用渐变背景
      controlBackground: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%)',
      controlBackgroundHover: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.95) 100%)',
      controlText: '#2d3748',
      controlTextSecondary: '#4a5568',
      
      // 进度条 - 使用渐变色
      progressBackground: 'rgba(226, 232, 240, 0.6)',
      progressForeground: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      progressBuffer: 'rgba(102, 126, 234, 0.3)',
      
      // 音量 - 使用渐变色
      volumeBackground: 'rgba(226, 232, 240, 0.6)',
      volumeForeground: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
      
      // 遮罩
      overlay: 'rgba(45, 55, 72, 0.8)',
      overlayLight: 'rgba(45, 55, 72, 0.6)',
      overlayDark: 'rgba(45, 55, 72, 0.9)',
      
      // 阴影 - 彩色阴影
      shadow: 'rgba(102, 126, 234, 0.3)',
      shadowLight: 'rgba(102, 126, 234, 0.2)',
      shadowDark: 'rgba(102, 126, 234, 0.4)'
    },
    
    // 字体系统
    fonts: {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      size: '14px',
      sizeSmall: '12px',
      sizeLarge: '16px',
      sizeXLarge: '18px',
      weight: '500',
      weightBold: '700',
      weightLight: '300',
      lineHeight: '1.6',
      letterSpacing: '0.02em'
    },
    
    // 尺寸系统
    sizes: {
      controlsHeight: '52px',
      controlsHeightCompact: '44px',
      buttonSize: '44px',
      buttonSizeSmall: '36px',
      buttonSizeLarge: '52px',
      iconSize: '22px',
      iconSizeSmall: '18px',
      iconSizeLarge: '26px',
      borderRadius: '12px',
      borderRadiusSmall: '6px',
      borderRadiusLarge: '16px',
      spacing: '10px',
      spacingSmall: '6px',
      spacingLarge: '18px',
      spacingXLarge: '28px'
    },
    
    // 动画系统 - 更活泼的动画
    animations: {
      duration: '0.3s',
      durationSlow: '0.5s',
      durationFast: '0.2s',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      easingIn: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
      easingOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      easingInOut: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)'
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
      color: 'var(--lv-color-text)',
      boxShadow: '0 20px 40px var(--lv-color-shadow)'
    },
    
    // 视频元素
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      background: '#000000',
      borderRadius: 'var(--lv-border-radius-small)'
    },
    
    // 控制栏
    controls: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      height: 'var(--lv-controls-height)',
      background: 'var(--lv-color-control-background)',
      backdropFilter: 'blur(20px) saturate(180%)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--lv-spacing-large)',
      gap: 'var(--lv-spacing)',
      transition: 'all var(--lv-animation-duration) var(--lv-animation-easing)',
      zIndex: '10',
      borderTop: '1px solid var(--lv-color-border)'
    },
    
    // 按钮
    button: {
      width: 'var(--lv-button-size)',
      height: 'var(--lv-button-size)',
      borderRadius: 'var(--lv-border-radius)',
      border: 'none',
      background: 'transparent',
      color: 'var(--lv-color-control-text)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all var(--lv-animation-duration) var(--lv-animation-easing)',
      fontSize: 'var(--lv-icon-size)',
      position: 'relative',
      
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        borderRadius: 'inherit',
        background: 'var(--lv-color-primary)',
        opacity: '0',
        transition: 'opacity var(--lv-animation-duration) var(--lv-animation-easing)',
        zIndex: '-1'
      },
      
      '&:hover': {
        transform: 'translateY(-2px) scale(1.05)',
        boxShadow: '0 8px 16px var(--lv-color-shadow)',
        
        '&::before': {
          opacity: '0.1'
        }
      },
      
      '&:active': {
        transform: 'translateY(0) scale(0.98)',
        
        '&::before': {
          opacity: '0.2'
        }
      },
      
      '&:disabled': {
        opacity: '0.5',
        cursor: 'not-allowed',
        transform: 'none',
        
        '&::before': {
          opacity: '0'
        }
      }
    },
    
    // 进度条
    progress: {
      flex: '1',
      height: '6px',
      borderRadius: '3px',
      background: 'var(--lv-color-progress-background)',
      position: 'relative',
      cursor: 'pointer',
      overflow: 'hidden',
      
      '&:hover': {
        height: '8px',
        transform: 'scaleY(1.2)'
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
        transition: 'width var(--lv-animation-duration-fast) linear',
        boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
      },
      
      '.progress-thumb': {
        position: 'absolute',
        top: '50%',
        right: '-8px',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: 'var(--lv-color-progress-foreground)',
        transform: 'translateY(-50%)',
        opacity: '0',
        transition: 'all var(--lv-animation-duration) var(--lv-animation-easing)',
        boxShadow: '0 4px 8px var(--lv-color-shadow)',
        
        '&:hover': {
          opacity: '1',
          transform: 'translateY(-50%) scale(1.2)'
        }
      }
    }
  }
};
