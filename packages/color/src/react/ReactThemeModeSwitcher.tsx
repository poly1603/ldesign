import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeModeOption {
  value: ThemeMode
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export interface ReactThemeModeSwitcherProps {
  defaultMode?: ThemeMode
  storageKey?: string
  onModeChange?: (mode: ThemeMode) => void
  className?: string
}

const modes: ThemeModeOption[] = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor }
]

export const ReactThemeModeSwitcher: React.FC<ReactThemeModeSwitcherProps> = ({
  defaultMode = 'system',
  storageKey = 'ld-theme-mode',
  onModeChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<ThemeMode>(defaultMode)
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 获取有效的主题（如果是系统模式，返回系统偏好）
  const effectiveTheme = currentMode === 'system' ? systemPreference : currentMode

  // 获取当前模式的配置
  const currentModeConfig = modes.find(m => m.value === currentMode) || modes[2]
  const CurrentIcon = currentModeConfig.icon

  // 应用主题到 DOM
  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    const root = document.documentElement
    
    // 使用 theme-mode 属性，与 theme.css 保持一致
    if (theme === 'dark') {
      root.setAttribute('theme-mode', 'dark')
    } else {
      root.removeAttribute('theme-mode')
    }
    
    // 同时设置 data-theme-mode 以保持兼容性
    root.setAttribute('data-theme-mode', theme)
    
    // 为了兼容其他主题系统，也设置常见的属性
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [])

  // 更新系统主题偏好
  const updateSystemPreference = useCallback(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light')
  }, [])

  // 切换下拉菜单
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  // 切换主题模式
  const changeMode = (mode: ThemeMode) => {
    setCurrentMode(mode)
    localStorage.setItem(storageKey, mode)
    setIsOpen(false)
    onModeChange?.(mode)
  }

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
    return undefined
  }, [isOpen])

  // 监听系统主题变化
  useEffect(() => {
    updateSystemPreference()
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => updateSystemPreference()
    
    // 兼容不同浏览器的事件监听方法
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // 旧版本浏览器的兼容处理
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [updateSystemPreference])

  // 初始化主题
  useEffect(() => {
    // 从 localStorage 读取保存的主题模式
    const savedMode = localStorage.getItem(storageKey) as ThemeMode | null
    if (savedMode && modes.some(m => m.value === savedMode)) {
      setCurrentMode(savedMode)
    }
  }, [storageKey])

  // 应用主题
  useEffect(() => {
    applyTheme(effectiveTheme)
  }, [effectiveTheme, applyTheme])

  return (
    <div ref={dropdownRef} className={`theme-mode-switcher ${className}`}>
      <button
        className="theme-mode-button"
        onClick={toggleDropdown}
        title={currentModeConfig.label}
      >
        <CurrentIcon className="theme-icon" />
        <span className="theme-label">{currentModeConfig.label}</span>
        <ChevronDown className={`arrow ${isOpen ? 'open' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="theme-dropdown">
          {modes.map(mode => {
            const Icon = mode.icon
            const isActive = currentMode === mode.value
            
            return (
              <button
                key={mode.value}
                className={`theme-option ${isActive ? 'active' : ''}`}
                onClick={() => changeMode(mode.value)}
              >
                <Icon className="option-icon" />
                <span className="option-label">{mode.label}</span>
                {isActive && <Check className="check-icon" />}
              </button>
            )
          })}
        </div>
      )}
      
      <style>{`
        .theme-mode-switcher {
          position: relative;
        }

        .theme-mode-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--ld-bg-color-component, var(--color-background-secondary));
          border: 1px solid var(--ld-component-border, var(--color-border));
          border-radius: 8px;
          color: var(--ld-text-color-primary, var(--color-text-primary));
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .theme-mode-button:hover {
          background: var(--ld-bg-color-component-hover, var(--color-primary-100));
          border-color: var(--ld-brand-color-light, var(--color-primary-200));
        }

        .theme-icon {
          width: 18px;
          height: 18px;
        }

        .theme-label {
          white-space: nowrap;
        }

        .arrow {
          width: 16px;
          height: 16px;
          transition: transform 0.3s;
        }

        .arrow.open {
          transform: rotate(180deg);
        }

        .theme-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: var(--ld-bg-color-container, var(--color-background));
          border: 1px solid var(--ld-component-border, var(--color-border));
          border-radius: 8px;
          box-shadow: var(--ld-shadow-2, 0 4px 12px rgba(0, 0, 0, 0.1));
          overflow: hidden;
          z-index: 1000;
          min-width: 160px;
        }

        .theme-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          background: none;
          border: none;
          color: var(--ld-text-color-primary, var(--color-text-primary));
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }

        .theme-option:hover {
          background: var(--ld-bg-color-component, var(--color-background-secondary));
        }

        .theme-option.active {
          background: var(--ld-brand-color-light, var(--color-primary-100));
          color: var(--ld-brand-color, var(--color-primary-default));
          font-weight: 600;
        }

        .option-icon {
          width: 18px;
          height: 18px;
        }

        .option-label {
          flex: 1;
        }

        .check-icon {
          width: 16px;
          height: 16px;
          color: var(--ld-brand-color, var(--color-primary-default));
        }

        /* Dark mode specific styles */
        :root[theme-mode="dark"] .theme-mode-button {
          background: var(--ld-bg-color-component);
          border-color: var(--ld-component-border);
        }

        :root[theme-mode="dark"] .theme-mode-button:hover {
          background: var(--ld-bg-color-component-hover);
          border-color: var(--ld-brand-color-light);
        }

        :root[theme-mode="dark"] .theme-dropdown {
          background: var(--ld-bg-color-container);
          border-color: var(--ld-component-border);
        }

        :root[theme-mode="dark"] .theme-option:hover {
          background: var(--ld-bg-color-component);
        }

        :root[theme-mode="dark"] .theme-option.active {
          background: var(--ld-brand-color-light);
        }
      `}</style>
    </div>
  )
}