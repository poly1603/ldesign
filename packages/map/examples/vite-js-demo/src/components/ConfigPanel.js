/**
 * 配置面板组件
 * 左侧地图配置面板，包含各种地图参数设置
 */

/**
 * 配置面板组件类
 */
class ConfigPanel {
  constructor(appState) {
    this.appState = appState
    this.container = null
    
    // 预设位置数据
    this.centerPresets = [
      { name: '北京', coordinate: [116.3974, 39.9093], description: '中国首都' },
      { name: '上海', coordinate: [121.4737, 31.2304], description: '经济中心' },
      { name: '广州', coordinate: [113.2644, 23.1291], description: '南方门户' },
      { name: '深圳', coordinate: [114.0579, 22.5431], description: '科技之城' },
      { name: '杭州', coordinate: [120.1551, 30.2741], description: '人间天堂' }
    ]
    
    // 主题选项
    this.themes = [
      { key: 'default', name: '默认主题', description: '清晰明亮，适合日间使用' },
      { key: 'dark', name: '深色主题', description: '护眼模式，适合夜间使用' },
      { key: 'light', name: '浅色主题', description: '简洁清爽，突出内容' }
    ]
  }

  /**
   * 挂载组件
   * @param {HTMLElement} container - 容器元素
   */
  mount(container) {
    if (!container) {
      throw new Error('ConfigPanel 组件需要一个容器元素')
    }

    this.container = container
    this.render()
    this.setupEventListeners()
  }

  /**
   * 渲染组件
   */
  render() {
    const config = this.appState.mapConfig
    
    this.container.innerHTML = `
      <div class="config-panel">
        <!-- 面板标题 -->
        <div class="panel-header">
          <h2 class="panel-title">🎛️ 地图配置</h2>
          <p class="panel-description">调整地图参数和设置</p>
        </div>

        <!-- 配置表单 -->
        <div class="config-form">
          <!-- 地图中心点配置 -->
          <div class="config-section">
            <h3 class="section-title">📍 地图中心点</h3>
            
            <!-- 预设位置选择 -->
            <div class="form-group">
              <label class="form-label">选择预设位置：</label>
              <select id="preset-select" class="form-select">
                <option value="">自定义位置</option>
                ${this.centerPresets.map(preset => 
                  `<option value="${preset.name}">${preset.name}</option>`
                ).join('')}
              </select>
            </div>

            <!-- 自定义坐标输入 -->
            <div class="form-group">
              <label class="form-label">经度：</label>
              <input
                id="longitude-input"
                type="number"
                step="0.000001"
                min="-180"
                max="180"
                class="form-input"
                value="${config.center[0]}"
              />
            </div>

            <div class="form-group">
              <label class="form-label">纬度：</label>
              <input
                id="latitude-input"
                type="number"
                step="0.000001"
                min="-90"
                max="90"
                class="form-input"
                value="${config.center[1]}"
              />
            </div>
          </div>

          <!-- 缩放级别配置 -->
          <div class="config-section">
            <h3 class="section-title">🔍 缩放级别</h3>
            
            <div class="form-group">
              <label class="form-label">
                缩放级别：<span id="zoom-value">${config.zoom}</span>
              </label>
              <input
                id="zoom-range"
                type="range"
                min="1"
                max="20"
                step="1"
                class="form-range"
                value="${config.zoom}"
              />
              <div class="range-labels">
                <span>1</span>
                <span>20</span>
              </div>
            </div>
          </div>

          <!-- 地图主题配置 -->
          <div class="config-section">
            <h3 class="section-title">🎨 地图主题</h3>
            
            <div class="theme-options">
              ${this.themes.map(theme => `
                <label class="theme-option ${config.theme === theme.key ? 'active' : ''}">
                  <input
                    type="radio"
                    name="theme"
                    value="${theme.key}"
                    class="theme-radio"
                    ${config.theme === theme.key ? 'checked' : ''}
                  />
                  <div class="theme-info">
                    <div class="theme-name">${theme.name}</div>
                    <div class="theme-description">${theme.description}</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- 地图控件配置 -->
          <div class="config-section">
            <h3 class="section-title">🎮 地图控件</h3>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  id="show-controls"
                  type="checkbox"
                  class="form-checkbox"
                  ${config.showControls ? 'checked' : ''}
                />
                <span class="checkbox-text">显示地图控件</span>
              </label>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  id="enable-interaction"
                  type="checkbox"
                  class="form-checkbox"
                  ${config.enableInteraction ? 'checked' : ''}
                />
                <span class="checkbox-text">启用地图交互</span>
              </label>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="config-actions">
            <button id="apply-config" class="btn btn-primary">
              应用配置
            </button>
            
            <button id="reset-config" class="btn btn-secondary">
              重置配置
            </button>
          </div>
        </div>
      </div>
    `
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 预设位置选择
    const presetSelect = this.container.querySelector('#preset-select')
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        this.onPresetChange(e.target.value)
      })
    }

    // 坐标输入
    const longitudeInput = this.container.querySelector('#longitude-input')
    const latitudeInput = this.container.querySelector('#latitude-input')
    
    if (longitudeInput) {
      longitudeInput.addEventListener('input', () => this.onConfigChange())
    }
    if (latitudeInput) {
      latitudeInput.addEventListener('input', () => this.onConfigChange())
    }

    // 缩放级别
    const zoomRange = this.container.querySelector('#zoom-range')
    if (zoomRange) {
      zoomRange.addEventListener('input', (e) => {
        const zoomValue = this.container.querySelector('#zoom-value')
        if (zoomValue) {
          zoomValue.textContent = e.target.value
        }
        this.onConfigChange()
      })
    }

    // 主题选择
    const themeRadios = this.container.querySelectorAll('input[name="theme"]')
    themeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        this.updateThemeOptions()
        this.onConfigChange()
      })
    })

    // 控件复选框
    const showControlsCheckbox = this.container.querySelector('#show-controls')
    const enableInteractionCheckbox = this.container.querySelector('#enable-interaction')
    
    if (showControlsCheckbox) {
      showControlsCheckbox.addEventListener('change', () => this.onConfigChange())
    }
    if (enableInteractionCheckbox) {
      enableInteractionCheckbox.addEventListener('change', () => this.onConfigChange())
    }

    // 操作按钮
    const applyBtn = this.container.querySelector('#apply-config')
    const resetBtn = this.container.querySelector('#reset-config')
    
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.onApplyConfig())
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.onResetConfig())
    }

    // 监听状态变更
    window.addEventListener('app-state-change', (event) => {
      this.updateUI(event.detail.state)
    })
  }

  /**
   * 预设位置变更处理
   * @param {string} presetName - 预设位置名称
   */
  onPresetChange(presetName) {
    if (presetName) {
      const preset = this.centerPresets.find(p => p.name === presetName)
      if (preset) {
        const longitudeInput = this.container.querySelector('#longitude-input')
        const latitudeInput = this.container.querySelector('#latitude-input')
        
        if (longitudeInput && latitudeInput) {
          longitudeInput.value = preset.coordinate[0]
          latitudeInput.value = preset.coordinate[1]
          this.onConfigChange()
        }
      }
    }
  }

  /**
   * 配置变更处理
   */
  onConfigChange() {
    const newConfig = this.getCurrentConfig()
    this.appState.updateState({ mapConfig: newConfig })
  }

  /**
   * 应用配置处理
   */
  onApplyConfig() {
    const newConfig = this.getCurrentConfig()
    this.appState.updateState({ 
      mapConfig: newConfig,
      appliedConfig: { ...newConfig }
    })
    this.appState.showStatus('配置已应用到地图', 'success')
  }

  /**
   * 重置配置处理
   */
  onResetConfig() {
    const defaultConfig = {
      center: [116.3974, 39.9093],
      zoom: 10,
      theme: 'default',
      showControls: true,
      enableInteraction: true
    }
    
    this.appState.updateState({ 
      mapConfig: defaultConfig,
      appliedConfig: { ...defaultConfig }
    })
    this.appState.showStatus('配置已重置为默认值', 'info')
    
    // 重新渲染
    this.render()
    this.setupEventListeners()
  }

  /**
   * 获取当前配置
   * @returns {Object} 当前配置对象
   */
  getCurrentConfig() {
    const longitudeInput = this.container.querySelector('#longitude-input')
    const latitudeInput = this.container.querySelector('#latitude-input')
    const zoomRange = this.container.querySelector('#zoom-range')
    const themeRadio = this.container.querySelector('input[name="theme"]:checked')
    const showControlsCheckbox = this.container.querySelector('#show-controls')
    const enableInteractionCheckbox = this.container.querySelector('#enable-interaction')

    return {
      center: [
        parseFloat(longitudeInput?.value || 0),
        parseFloat(latitudeInput?.value || 0)
      ],
      zoom: parseInt(zoomRange?.value || 10),
      theme: themeRadio?.value || 'default',
      showControls: showControlsCheckbox?.checked || false,
      enableInteraction: enableInteractionCheckbox?.checked || false
    }
  }

  /**
   * 更新主题选项样式
   */
  updateThemeOptions() {
    const themeOptions = this.container.querySelectorAll('.theme-option')
    const checkedRadio = this.container.querySelector('input[name="theme"]:checked')
    
    themeOptions.forEach(option => {
      const radio = option.querySelector('input[type="radio"]')
      if (radio === checkedRadio) {
        option.classList.add('active')
      } else {
        option.classList.remove('active')
      }
    })
  }

  /**
   * 更新 UI
   * @param {Object} state - 应用状态
   */
  updateUI(state) {
    // 这里可以根据状态更新 UI
    // 目前配置面板主要通过重新渲染来更新
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = ''
      this.container = null
    }
  }
}

/**
 * 创建配置面板组件实例
 * @param {Object} appState - 应用状态
 * @returns {ConfigPanel} 配置面板组件实例
 */
export function createConfigPanel(appState) {
  return new ConfigPanel(appState)
}
