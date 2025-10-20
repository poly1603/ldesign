import type { PresetTheme } from '../themes/presets'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from './useTheme'
import './ThemePicker.css'

export interface ThemePickerProps {
  value?: string
  onChange?: (value: string, preset?: PresetTheme) => void
  showArrow?: boolean
  showSearch?: boolean
  showCustom?: boolean
  prefix?: string
  storageKey?: string
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  value,
  onChange,
  showArrow = true,
  showSearch = false,
  showCustom = false,
  prefix = 'ld',
  storageKey
}) => {
  const pickerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customColor, setCustomColor] = useState('#1890ff')
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  const {
    // currentTheme,
    presets,
    primaryColor,
    themeName,
    applyTheme,
    applyPresetTheme,
    restoreTheme
  } = useTheme({
    prefix,
    storageKey
  })

  // Current color
  const currentColor = useMemo(() => {
    return value || primaryColor || '#1890ff'
  }, [value, primaryColor])

  // Current label
  const currentLabel = useMemo(() => {
    const preset = presets.find(p => p.name === themeName)
    return preset?.label || '主题色'
  }, [presets, themeName])

// Build visible presets (prepend current custom color if not in presets)
  const visiblePresets = useMemo(() => {
    const list: PresetTheme[] = [...presets]
    const inPresets = list.some(p => p.color.toLowerCase() === (currentColor || '').toLowerCase())
    if (!inPresets) {
      list.unshift({ name: 'custom', label: '自定义', color: currentColor, custom: true })
    }
    return list
  }, [presets, currentColor])

  // Filtered presets (if search enabled)
  const filteredPresets = useMemo(() => {
    if (!searchQuery) return visiblePresets
    const query = searchQuery.toLowerCase()
    return visiblePresets.filter(preset =>
      preset.label.toLowerCase().includes(query) ||
      preset.name.toLowerCase().includes(query) ||
      preset.color.toLowerCase().includes(query)
    )
  }, [visiblePresets, searchQuery])

  // Update dropdown position (prevent overflow on small screens)
  const updateDropdownPosition = useCallback(() => {
    if (!pickerRef.current) return

    const rect = pickerRef.current.getBoundingClientRect()
    const dropdownHeight = 400
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const desiredWidth = Math.min(320, Math.max(240, viewportWidth - 16))

    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    let top = rect.bottom + 4
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      top = rect.top - dropdownHeight - 4
    }
    // Clamp within viewport with 8px margin
    top = Math.max(8, Math.min(top, viewportHeight - 8 - dropdownHeight))

    let left = rect.left
    const maxLeft = viewportWidth - 8 - desiredWidth
    left = Math.max(8, Math.min(left, Math.max(8, maxLeft)))

    setDropdownStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${desiredWidth}px`,
      zIndex: 9999
    })
  }, [])

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        // Defer position update to next tick after state is updated
        queueMicrotask(() => updateDropdownPosition())
      }
      return !prev
    })
  }, [updateDropdownPosition])

  // Select preset
  const selectPreset = useCallback((preset: PresetTheme) => {
    applyPresetTheme(preset.name)
    onChange?.(preset.color, preset)
    setIsOpen(false)
  }, [applyPresetTheme, onChange])

  // Handle custom color
  const handleCustomColor = useCallback(() => {
    if (customColor) {
      applyTheme(customColor)
      onChange?.(customColor)
      setIsOpen(false)
    }
  }, [customColor, applyTheme, onChange])

  // Handle click outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!pickerRef.current?.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  // Handle resize
  const handleResize = useCallback(() => {
    if (isOpen) {
      updateDropdownPosition()
    }
  }, [isOpen, updateDropdownPosition])

  useEffect(() => {
    // Restore theme on mount
    restoreTheme()

    // Add event listeners
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Watch value changes
  useEffect(() => {
    if (value && value !== primaryColor) {
      applyTheme(value)
    }
  }, [value, primaryColor, applyTheme])

  return (
    <div className="ld-theme-picker" ref={pickerRef}>
      <button
        className="ld-theme-picker__trigger"
        onClick={toggleDropdown}
        style={{ backgroundColor: currentColor }}
        title={currentLabel}
      >
        <span 
          className="ld-theme-picker__color" 
          style={{ backgroundColor: currentColor }}
        />
        {showArrow && (
          <svg 
            className={`ld-theme-picker__arrow ${isOpen ? 'is-open' : ''}`}
            width="12" 
            height="12" 
            viewBox="0 0 12 12"
          >
            <path 
              d="M2.5 4.5L6 8L9.5 4.5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              fill="none"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className="ld-theme-picker__dropdown"
          style={dropdownStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {showSearch && (
            <div className="ld-theme-picker__search">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="搜索颜色..."
                className="ld-theme-picker__search-input"
              />
            </div>
          )}

          <div className="ld-theme-picker__content">
            {showCustom && (
              <div className="ld-theme-picker__custom">
                <label className="ld-theme-picker__label">自定义颜色</label>
                <div className="ld-theme-picker__custom-input">
                  <input
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    type="color"
                    className="ld-theme-picker__color-input"
                  />
                  <input
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && handleCustomColor()}
                    type="text"
                    placeholder="#000000"
                    className="ld-theme-picker__hex-input"
                  />
                  <button
                    className="ld-theme-picker__apply-btn"
                    onClick={handleCustomColor}
                  >
                    应用
                  </button>
                </div>
              </div>
            )}

<div className="ld-theme-picker__presets">
              <label className="ld-theme-picker__label">选择主题色</label>
              <div className="ld-theme-picker__grid">
                {filteredPresets.map((preset) => (
                  <div
                    key={`${preset.name}-${preset.color}`}
                    className={`ld-theme-picker__preset ${
                      (preset.name === themeName) || (!themeName && preset.custom) ? 'is-active' : ''
                    }`}
                    onClick={() => selectPreset(preset)}
                  >
                    <span
                      className="ld-theme-picker__preset-color"
                      style={{ backgroundColor: preset.color }}
                      title={preset.label}
                    >
                      {((preset.name === themeName) || (!themeName && preset.custom)) && (
                        <svg 
                          className="ld-theme-picker__check" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 16 16"
                        >
                          <path 
                            d="M3 8L6 11L13 4" 
                            stroke="white" 
                            strokeWidth="2" 
                            fill="none"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="ld-theme-picker__preset-label">
                      {preset.custom ? '自定义' : preset.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}