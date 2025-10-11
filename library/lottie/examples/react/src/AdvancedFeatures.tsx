import { useState, useRef, useEffect } from 'react'
import { useLottie } from '../../../src/adapters/react'
import {
  TransitionManager,
  ThemeManager,
  DataBinding,
  GestureController,
  PreloadQueue,
  AccessibilityManager
} from '../../../src'

// 1. 过渡效果示例
export function TransitionExample() {
  const { containerRef, instance } = useLottie({
    path: '/success-checkmark.json',
    autoplay: false,
    loop: false
  })

  const [transition, setTransition] = useState<TransitionManager | null>(null)

  useEffect(() => {
    if (instance) {
      setTransition(new TransitionManager(instance))
    }
  }, [instance])

  const applyFadeIn = async () => {
    if (transition) {
      await transition.fadeIn(600, 'easeOut')
      instance?.play()
    }
  }

  const applySlideIn = async () => {
    if (transition) {
      await transition.slideIn('left', 500)
      instance?.play()
    }
  }

  const applyScale = async () => {
    if (transition) {
      await transition.scale(0, 1, 500, 'easeOutBack')
      instance?.play()
    }
  }

  const applyRotate = async () => {
    if (transition) {
      await transition.rotate(0, 360, 800, 'easeInOut')
      instance?.play()
    }
  }

  return (
    <div className="card">
      <h2>✨ 过渡效果</h2>
      <p className="description">为动画添加各种入场和出场过渡效果</p>
      <div ref={containerRef as any} className="lottie-container" />
      <div className="controls">
        <button onClick={applyFadeIn}>淡入</button>
        <button onClick={applySlideIn}>滑入</button>
        <button onClick={applyScale}>缩放</button>
        <button onClick={applyRotate}>旋转</button>
      </div>
      <div className="badge">12+ 内置缓动函数</div>
    </div>
  )
}

// 2. 主题系统示例
export function ThemeExample() {
  const { containerRef, instance } = useLottie({
    path: '/heart-beat.json',
    autoplay: true,
    loop: true
  })

  const [themeManager, setThemeManager] = useState<ThemeManager | null>(null)
  const [currentTheme, setCurrentTheme] = useState<string>('light')

  useEffect(() => {
    if (instance) {
      const manager = new ThemeManager(instance)
      
      // 注册主题
      manager.registerThemes([
        {
          name: 'light',
          colors: {
            '#ff0000': '#667eea',
            '#ff6b6b': '#764ba2'
          }
        },
        {
          name: 'dark',
          colors: {
            '#ff0000': '#4f46e5',
            '#ff6b6b': '#7c3aed'
          }
        },
        {
          name: 'sunset',
          colors: {
            '#ff0000': '#ff6b6b',
            '#ff6b6b': '#feca57'
          }
        }
      ])
      
      setThemeManager(manager)
    }
  }, [instance])

  const switchTheme = (themeName: string) => {
    if (themeManager) {
      themeManager.switchTheme(themeName)
      setCurrentTheme(themeName)
    }
  }

  return (
    <div className="card">
      <h2>🎨 主题系统</h2>
      <p className="description">动态切换颜色主题，调整亮度和饱和度</p>
      <div ref={containerRef as any} className="lottie-container" />
      <div className="theme-selector">
        <button 
          className={`theme-btn theme-light ${currentTheme === 'light' ? 'active' : ''}`}
          onClick={() => switchTheme('light')}
        >
          浅色
        </button>
        <button 
          className={`theme-btn theme-dark ${currentTheme === 'dark' ? 'active' : ''}`}
          onClick={() => switchTheme('dark')}
        >
          深色
        </button>
        <button 
          className={`theme-btn theme-sunset ${currentTheme === 'sunset' ? 'active' : ''}`}
          onClick={() => switchTheme('sunset')}
        >
          夕阳
        </button>
      </div>
      <div className="controls">
        <button onClick={() => themeManager?.adjustBrightness(1.3)}>增亮</button>
        <button onClick={() => themeManager?.adjustSaturation(1.5)}>增饱和</button>
        <button onClick={() => themeManager?.applyHueShift(30)}>色调偏移</button>
      </div>
    </div>
  )
}

// 3. 数据绑定示例
export function DataBindingExample() {
  const { containerRef, instance } = useLottie({
    path: '/loading-spinner.json',
    autoplay: true,
    loop: true
  })

  const [dataBinding, setDataBinding] = useState<DataBinding | null>(null)
  const [opacity, setOpacity] = useState(1)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (instance) {
      const binding = new DataBinding(instance)
      
      // 绑定属性
      binding.bind({
        path: 'opacity',
        target: 'rootLayer',
        property: 'opacity'
      })
      
      binding.bind({
        path: 'scale',
        target: 'rootLayer',
        property: 'scale'
      })
      
      setDataBinding(binding)
    }
  }, [instance])

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setOpacity(value)
    if (dataBinding) {
      dataBinding.update('opacity', value)
    }
    // 视觉反馈
    if (containerRef.current) {
      (containerRef.current as HTMLElement).style.opacity = String(value)
    }
  }

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setScale(value)
    if (dataBinding) {
      dataBinding.update('scale', value)
    }
    // 视觉反馈
    if (containerRef.current) {
      (containerRef.current as HTMLElement).style.transform = `scale(${value})`
    }
  }

  return (
    <div className="card">
      <h2>📊 数据绑定</h2>
      <p className="description">实时数据驱动动画属性变化</p>
      <div ref={containerRef as any} className="lottie-container" />
      <div className="data-inputs">
        <div className="data-input">
          <label>透明度:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={handleOpacityChange}
          />
          <span>{opacity.toFixed(1)}</span>
        </div>
        <div className="data-input">
          <label>缩放:</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={handleScaleChange}
          />
          <span>{scale.toFixed(1)}</span>
        </div>
      </div>
      <div className="badge">响应式数据更新</div>
    </div>
  )
}

// 4. 手势控制示例
export function GestureExample() {
  const { containerRef, instance } = useLottie({
    path: '/rocket.json',
    autoplay: false,
    loop: false
  })

  const [gestureController, setGestureController] = useState<GestureController | null>(null)

  useEffect(() => {
    if (instance) {
      const controller = new GestureController(instance, {
        enableTouch: true,
        enableSwipe: true,
        enablePinch: true,
        enableRotate: true,
        
        onTap: () => {
          if (instance.isPaused()) {
            instance.play()
          } else {
            instance.pause()
          }
        },
        
        onSwipe: (event) => {
          const currentFrame = instance.getCurrentFrame()
          const totalFrames = instance.getTotalFrames()
          const offset = event.direction === 'left' ? -10 : 10
          const newFrame = Math.max(0, Math.min(totalFrames, currentFrame + offset))
          instance.goToAndStop(newFrame, true)
        }
      })
      
      setGestureController(controller)
    }

    return () => {
      gestureController?.destroy()
    }
  }, [instance])

  return (
    <div className="card">
      <h2>👆 手势控制</h2>
      <p className="description">支持触摸、滑动、捏合、旋转手势</p>
      <div 
        ref={containerRef as any} 
        className="lottie-container" 
        style={{ border: '2px dashed #667eea', cursor: 'pointer' }}
      >
        {!instance && (
          <div style={{ textAlign: 'center', color: '#999' }}>
            <p>👆 触摸此区域</p>
            <p style={{ fontSize: '12px' }}>轻触播放/暂停，滑动跳转</p>
          </div>
        )}
      </div>
      <div className="info">
        <strong>可用手势:</strong><br />
        • 轻触: 播放/暂停<br />
        • 左右滑动: 跳转帧<br />
        • 双指捏合: 缩放（移动端）<br />
        • 双指旋转: 旋转（移动端）
      </div>
    </div>
  )
}

// 5. 预加载队列示例
export function PreloadQueueExample() {
  const [progress, setProgress] = useState(0)
  const [state, setState] = useState<string>('空闲')
  const [status, setStatus] = useState<string>('准备就绪')
  const preloadQueueRef = useRef<PreloadQueue | null>(null)

  useEffect(() => {
    preloadQueueRef.current = new PreloadQueue({
      concurrency: 3,
      onProgress: (prog) => {
        setProgress(Math.round(prog.percentage))
        setStatus(`加载中... (${prog.loaded}/${prog.total})`)
      },
      onComplete: (results) => {
        setState('已完成')
        setStatus(`✅ 成功加载 ${results.length} 个动画`)
      },
      onError: (error) => {
        setState('错误')
        setStatus(`❌ 加载失败: ${error.message}`)
      }
    })

    return () => {
      preloadQueueRef.current?.destroy()
    }
  }, [])

  const startPreload = async () => {
    if (!preloadQueueRef.current) return
    
    setState('加载中')
    
    const animations = [
      { url: '/loading-spinner.json', priority: 10 },
      { url: '/success-checkmark.json', priority: 8 },
      { url: '/heart-beat.json', priority: 6 },
      { url: '/rocket.json', priority: 4 },
      { url: '/confetti.json', priority: 2 }
    ]
    
    await preloadQueueRef.current.addMany(animations)
    preloadQueueRef.current.start()
  }

  const pausePreload = () => {
    preloadQueueRef.current?.pause()
    setState('已暂停')
  }

  const showProgress = () => {
    if (!preloadQueueRef.current) return
    
    const prog = preloadQueueRef.current.getProgress()
    const loaded = preloadQueueRef.current.getLoadedAnimations()
    
    alert(
      `总进度: ${Math.round(prog.percentage)}%\n` +
      `已加载: ${prog.loaded}/${prog.total}\n` +
      `已缓存: ${loaded.length} 个动画`
    )
  }

  return (
    <div className="card">
      <h2>⚡ 预加载队列</h2>
      <p className="description">智能管理多个动画的批量加载</p>
      <div className="lottie-container">
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '10px' }}>🔄</p>
          <p style={{ color: '#666' }}>{status}</p>
        </div>
      </div>
      <div className="controls">
        <button onClick={startPreload}>开始预加载</button>
        <button onClick={pausePreload}>暂停</button>
        <button onClick={showProgress}>查看进度</button>
      </div>
      <div className="info">
        <strong>进度:</strong> {progress}%<br />
        <strong>状态:</strong> {state}
      </div>
    </div>
  )
}

// 6. 无障碍支持示例
export function AccessibilityExample() {
  const { containerRef, instance } = useLottie({
    path: '/confetti.json',
    autoplay: false,
    loop: true
  })

  const [accessibilityManager, setAccessibilityManager] = useState<AccessibilityManager | null>(null)

  useEffect(() => {
    if (instance) {
      const manager = new AccessibilityManager(instance, {
        keyboardNavigation: true,
        screenReader: true,
        description: '庆祝动画：彩色纸屑从天空飘落',
        title: '庆祝',
        skipOption: false,
        respectReducedMotion: true
      })
      
      setAccessibilityManager(manager)
    }

    return () => {
      accessibilityManager?.destroy()
    }
  }, [instance])

  return (
    <div className="card">
      <h2>♿ 无障碍支持</h2>
      <p className="description">键盘导航和屏幕阅读器支持</p>
      <div ref={containerRef as any} className="lottie-container" tabIndex={0} />
      <div className="info">
        <strong>键盘快捷键:</strong><br />
        • <kbd>空格</kbd>: 播放/暂停<br />
        • <kbd>←</kbd> / <kbd>→</kbd>: 快退/快进<br />
        • <kbd>Home</kbd> / <kbd>End</kbd>: 首/末帧<br />
        • <kbd>R</kbd>: 重新播放
      </div>
      <div className="badge">符合 WCAG 2.1 标准</div>
    </div>
  )
}

// 主入口组件
export default function AdvancedFeatures() {
  return (
    <div className="advanced-features">
      <header>
        <h1>🚀 Lottie 高级功能演示</h1>
        <p>React 版本</p>
      </header>

      <div className="grid">
        <TransitionExample />
        <ThemeExample />
        <DataBindingExample />
        <GestureExample />
        <PreloadQueueExample />
        <AccessibilityExample />
      </div>
    </div>
  )
}
