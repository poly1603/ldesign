import { 
  generateTailwindTheme,
  generateCSSVariables,
  insertCSSVariables
} from '@ldesign/color/core'
import { runAnalysis } from './analyze.js'

// Initialize app
const app = document.getElementById('app')

// Create the UI
app.innerHTML = `
  <div class="container">
    <h1>🎨 @ldesign/color - Color Palette Generator</h1>
    
    <div class="controls">
      <div class="control-group">
        <label for="primaryColor">Primary Color:</label>
        <div class="color-input-group">
          <input type="color" id="primaryColor" value="#1890ff">
          <input type="text" id="primaryHex" value="#1890ff">
        </div>
      </div>
      
      <div class="control-group">
        <label>
          <input type="checkbox" id="autoApply" checked>
          Auto apply to page
        </label>
      </div>
      
      <div class="actions">
        <button id="generateBtn" class="btn btn-primary">Generate Theme</button>
        <button id="exportBtn" class="btn btn-secondary">Export CSS</button>
      </div>
    </div>

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

    <div class="demo-section">
      <h3>Demo Components</h3>
      <div class="demo-grid">
        <button class="demo-btn demo-primary">Primary Button</button>
        <button class="demo-btn demo-success">Success Button</button>
        <button class="demo-btn demo-warning">Warning Button</button>
        <button class="demo-btn demo-danger">Danger Button</button>
        <button class="demo-btn demo-info">Info Button</button>
      </div>
      
      <div class="demo-cards">
        <div class="demo-card card-primary">
          <h4>Primary Card</h4>
          <p>This card uses primary color scheme</p>
        </div>
        <div class="demo-card card-success">
          <h4>Success Card</h4>
          <p>This card uses success color scheme</p>
        </div>
        <div class="demo-card card-warning">
          <h4>Warning Card</h4>
          <p>This card uses warning color scheme</p>
        </div>
        <div class="demo-card card-danger">
          <h4>Danger Card</h4>
          <p>This card uses danger color scheme</p>
        </div>
      </div>
    </div>

    <div class="css-output-section">
      <h3>Generated CSS Variables</h3>
      <pre id="css-output"></pre>
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

// Generate and display theme
function generateAndDisplayTheme() {
  const primaryHex = document.getElementById('primaryColor').value
  
  // Generate Tailwind-style theme with semantic colors and grays
  const theme = generateTailwindTheme(primaryHex, {
    includeSemantics: true,
    includeGrays: true,
    preserveInput: true
  })
  
  // Render all palettes
  renderPalette(theme.colors.primary, 'primary-palette')
  renderPalette(theme.colors.success, 'success-palette')
  renderPalette(theme.colors.warning, 'warning-palette')
  renderPalette(theme.colors.danger, 'danger-palette')
  renderPalette(theme.colors.info, 'info-palette')
  renderPalette(theme.grays, 'gray-palette')
  
  // Generate CSS variables
  const cssVars = generateCSSVariables({
    ...theme.colors,
    gray: theme.grays
  })
  document.getElementById('css-output').textContent = cssVars
  
  // Auto apply if checked
  if (document.getElementById('autoApply').checked) {
    insertCSSVariables({
      ...theme.colors,
      gray: theme.grays
    })
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
  console.log('Running color analysis...')
  runAnalysis()
}, 500)
