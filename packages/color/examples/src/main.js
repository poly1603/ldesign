import {
  generateTailwindTheme,
  generateThemePalettes,
  generateThemedCssVariables,
  injectThemedCssVariables,
  setThemeMode,
  generateThemeCssVars,
  applyThemeCssVars
} from '@ldesign/color/core'
import { runAnalysis } from './analyze.js'

// Initialize app
const app = document.getElementById('app')

// Create the UI
app.innerHTML = `
  <div class="container">
    <div class="controls">
      <div class="control-group">
        <label for="primaryColor">Primary Color:</label>
        <div class="color-input-group">
          <input type="color" id="primaryColor" value="#1890ff">
          <input type="text" id="primaryHex" value="#1890ff">
        </div>
      </div>
      
      <div class="control-group">
        <label for="cssPrefix">CSS Var Prefix:</label>
        <input type="text" id="cssPrefix" placeholder="e.g., td, app" value="" title="Enter prefix without dash, it will be added automatically">
      </div>
      
      <div class="control-group">
        <label>CSS Var Suffix Format:</label>
        <div class="radio-group">
          <label>
            <input type="radio" name="suffixFormat" value="tailwind" checked>
            Tailwind (50, 100, 200...)
          </label>
          <label>
            <input type="radio" name="suffixFormat" value="numeric">
            Numeric (1, 2, 3...)
          </label>
        </div>
      </div>
      
      <div class="control-group">
        <label>Custom Color Names (optional):</label>
        <div class="name-mapping">
          <div class="mapping-row">
            <span>primary →</span>
            <input type="text" id="name-primary" placeholder="e.g., brand" class="mapping-input">
          </div>
          <div class="mapping-row">
            <span>success →</span>
            <input type="text" id="name-success" placeholder="e.g., good" class="mapping-input">
          </div>
          <div class="mapping-row">
            <span>warning →</span>
            <input type="text" id="name-warning" placeholder="e.g., caution" class="mapping-input">
          </div>
          <div class="mapping-row">
            <span>danger →</span>
            <input type="text" id="name-danger" placeholder="e.g., error" class="mapping-input">
          </div>
          <div class="mapping-row">
            <span>info →</span>
            <input type="text" id="name-info" placeholder="e.g., notice" class="mapping-input">
          </div>
          <div class="mapping-row">
            <span>gray →</span>
            <input type="text" id="name-gray" placeholder="e.g., neutral" class="mapping-input">
          </div>
        </div>
      </div>
      
      <div class="control-group">
        <label>
          <input type="checkbox" id="autoApply" checked>
          Auto apply to page
        </label>
      </div>
      
      <div class="control-group">
        <label>Theme Mode:</label>
        <div class="theme-toggle">
          <button id="lightMode" class="theme-btn active">☀️ Light</button>
          <button id="darkMode" class="theme-btn">🌙 Dark</button>
        </div>
      </div>
      
      <div class="actions">
        <button id="generateBtn" class="btn btn-primary">Generate Theme</button>
        <button id="exportBtn" class="btn btn-secondary">Export CSS</button>
      </div>
    </div>

    <div class="content">
      <div class="palettes">
      <section class="palette-section">
        <h3>Primary</h3>
        <div class="palette-grid" id="primary-palette"></div>
      </section>
      
      <section class="palette-section">
        <h3>Success</h3>
        <div class="palette-grid" id="success-palette"></div>
      </section>
      
      <section class="palette-section">
        <h3>Warning</h3>
        <div class="palette-grid" id="warning-palette"></div>
      </section>
      
      <section class="palette-section">
        <h3>Danger</h3>
        <div class="palette-grid" id="danger-palette"></div>
      </section>
      
      <section class="palette-section">
        <h3>Info</h3>
        <div class="palette-grid" id="info-palette"></div>
      </section>
      
      <section class="palette-section">
        <h3>Gray</h3>
        <div class="palette-grid" id="gray-palette"></div>
      </section>
    </div>

    <div class="css-output-section">
      <h3>Generated CSS Variables</h3>
      <pre id="css-output"></pre>
    </div>
    </div>
  </div>
`

// Helper function to render a palette
function renderPalette(palette, containerId) {
  const container = document.getElementById(containerId)
  container.innerHTML = ''

  // Define the order for shades
  // Regular colors use 12 shades, grays use 14 shades
  const regularShadeOrder = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950', '1000']
  const grayShadeOrder = ['50', '100', '150', '200', '300', '400', '500', '600', '700', '800', '850', '900', '950', '1000']

  // Determine which order to use based on whether this is the gray palette
  const isGray = containerId.includes('gray')
  const shadeOrder = isGray ? grayShadeOrder : regularShadeOrder

  // Sort and display based on the defined order
  shadeOrder.forEach(level => {
    if (palette[level]) {
      const colorHex = palette[level]
      const box = document.createElement('div')
      box.className = 'color-box'
      box.style.backgroundColor = colorHex

      // Determine text color based on lightness for better contrast
      const isLight = parseInt(level) <= 400
      box.style.color = isLight ? '#000' : '#fff'

      box.innerHTML = `
        <span class="color-level">${level}</span>
        <span class="color-value">${colorHex}</span>
      `
      box.title = `Click to copy: ${colorHex}`
      box.addEventListener('click', () => {
        navigator.clipboard.writeText(colorHex)
        showToast(`Copied: ${colorHex}`)
      })
      container.appendChild(box)
    }
  })
}

// Show toast notification
function showToast(message) {
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('show')
  }, 10)

  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

// Track current theme mode
let currentTheme = 'light'
let generatedThemes = { light: null, dark: null }

// Generate and display theme
function generateAndDisplayTheme() {
  const primaryHex = document.getElementById('primaryColor').value

  // Generate both light and dark themes
  const themes = generateThemePalettes(primaryHex, {
    preserveInput: true
  })

  // Store themes
  generatedThemes.light = themes.light
  generatedThemes.dark = themes.dark

  // Display current theme
  displayTheme(currentTheme)
}

// Display a specific theme (light or dark)
function displayTheme(mode) {
  const theme = mode === 'dark' ? generatedThemes.dark : generatedThemes.light

  if (!theme) {
    return
  }

  // Render all palettes
  renderPalette(theme.primary, 'primary-palette')
  renderPalette(theme.success, 'success-palette')
  renderPalette(theme.warning, 'warning-palette')
  renderPalette(theme.danger, 'danger-palette')
  renderPalette(theme.info, 'info-palette')
  renderPalette(theme.gray, 'gray-palette')

  // Get CSS variable configuration from UI
  const prefix = document.getElementById('cssPrefix').value || ''
  const suffixFormat = document.querySelector('input[name="suffixFormat"]:checked').value

  // Get custom name mappings
  const nameMap = {}
  const colorNames = ['primary', 'success', 'warning', 'danger', 'info', 'gray']
  colorNames.forEach(name => {
    const customName = document.getElementById(`name-${name}`).value.trim()
    if (customName) {
      nameMap[name] = customName
    }
  })

  // Prepare theme object for CSS var generation
  const themeForCss = {
    colors: {
      primary: theme.primary,
      success: theme.success,
      warning: theme.warning,
      danger: theme.danger,
      info: theme.info
    },
    grays: theme.gray
  }

  // Generate CSS variables with custom configuration
  const cssVars = generateThemeCssVars(themeForCss, {
    prefix,
    suffixFormat,
    nameMap
  })

  // Display complete CSS with both light and dark mode variables if available
  let fullCss = ''
  if (generatedThemes.light && generatedThemes.dark) {
    const lightTheme = {
      colors: {
        primary: generatedThemes.light.primary,
        success: generatedThemes.light.success,
        warning: generatedThemes.light.warning,
        danger: generatedThemes.light.danger,
        info: generatedThemes.light.info
      },
      grays: generatedThemes.light.gray
    }
    const darkTheme = {
      colors: {
        primary: generatedThemes.dark.primary,
        success: generatedThemes.dark.success,
        warning: generatedThemes.dark.warning,
        danger: generatedThemes.dark.danger,
        info: generatedThemes.dark.info
      },
      grays: generatedThemes.dark.gray
    }

    const lightCss = generateThemeCssVars(lightTheme, { prefix, suffixFormat, nameMap })
    const darkCss = generateThemeCssVars(darkTheme, { prefix, suffixFormat, nameMap })

    fullCss = `/* Light Mode */\n:root {\n${lightCss}\n}\n\n/* Dark Mode */\n:root[data-theme-mode="dark"] {\n${darkCss}\n}`
  } else {
    fullCss = `:root {\n${cssVars}\n}`
  }

  document.getElementById('css-output').textContent = fullCss

  // Auto apply if checked
  if (document.getElementById('autoApply').checked) {
    applyThemeCssVars(themeForCss, {
      prefix,
      suffixFormat,
      nameMap,
      styleId: `ldesign-theme-${mode}`
    })

    // Apply the current theme mode using the proper function
    setThemeMode(mode)
  }
}

// Export CSS
function exportCSS() {
  const css = document.getElementById('css-output').textContent
  if (!css) {
    showToast('Please generate a theme first')
    return
  }

  const blob = new Blob([css], { type: 'text/css' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ldesign-theme.css'
  a.click()
  URL.revokeObjectURL(url)
  showToast('CSS file downloaded!')
}

// Event listeners
document.getElementById('generateBtn').addEventListener('click', generateAndDisplayTheme)
document.getElementById('exportBtn').addEventListener('click', exportCSS)

// Theme mode toggle
document.getElementById('lightMode').addEventListener('click', () => {
  currentTheme = 'light'
  document.getElementById('lightMode').classList.add('active')
  document.getElementById('darkMode').classList.remove('active')
  displayTheme('light')
  setThemeMode('light')
})

document.getElementById('darkMode').addEventListener('click', () => {
  currentTheme = 'dark'
  document.getElementById('darkMode').classList.add('active')
  document.getElementById('lightMode').classList.remove('active')
  displayTheme('dark')
  setThemeMode('dark')
})

// Sync color inputs
document.getElementById('primaryColor').addEventListener('input', (e) => {
  document.getElementById('primaryHex').value = e.target.value
  generateAndDisplayTheme()
})

document.getElementById('primaryHex').addEventListener('input', (e) => {
  const hex = e.target.value
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    document.getElementById('primaryColor').value = hex
    generateAndDisplayTheme()
  }
})

// Initial generation
generateAndDisplayTheme()

// Run analysis in console
setTimeout(() => {
  
  runAnalysis()
}, 500)
