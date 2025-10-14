import React, { useState, useRef } from 'react'
import './App.css'

// Import from the library
import { 
  QRCode, 
  useQRCode, 
  useBatchQRCode,
  useQRCodeInput,
  useQRCodeTheme,
  QRCodeRef 
} from '@qrcode-lib/adapters/react'

function App() {
  const [activeExample, setActiveExample] = useState('basic')

  return (
    <div className="App">
      <h1>QRCode React Examples</h1>
      
      <div className="nav-tabs">
        <button 
          className={activeExample === 'basic' ? 'active' : ''}
          onClick={() => setActiveExample('basic')}
        >
          Basic Example
        </button>
        <button 
          className={activeExample === 'advanced' ? 'active' : ''}
          onClick={() => setActiveExample('advanced')}
        >
          Advanced Styling
        </button>
        <button 
          className={activeExample === 'hooks' ? 'active' : ''}
          onClick={() => setActiveExample('hooks')}
        >
          Hooks Example
        </button>
        <button 
          className={activeExample === 'batch' ? 'active' : ''}
          onClick={() => setActiveExample('batch')}
        >
          Batch Generation
        </button>
        <button 
          className={activeExample === 'interactive' ? 'active' : ''}
          onClick={() => setActiveExample('interactive')}
        >
          Interactive
        </button>
      </div>

      <div className="example-content">
        {activeExample === 'basic' && <BasicExample />}
        {activeExample === 'advanced' && <AdvancedExample />}
        {activeExample === 'hooks' && <HooksExample />}
        {activeExample === 'batch' && <BatchExample />}
        {activeExample === 'interactive' && <InteractiveExample />}
      </div>
    </div>
  )
}

// Basic Example Component
function BasicExample() {
  const [content, setContent] = useState('https://github.com')
  const qrRef = useRef<QRCodeRef>(null)

  const handleDownload = () => {
    qrRef.current?.download('my-qrcode', 'png')
  }

  return (
    <div className="example-section">
      <h2 className="example-title">Basic QR Code</h2>
      
      <div className="controls">
        <div className="control-group">
          <label>Content:</label>
          <input 
            type="text" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter content"
          />
        </div>
        
        <div className="control-group">
          <button onClick={handleDownload}>Download QR Code</button>
        </div>
      </div>

      <div className="qr-display">
        <QRCode
          ref={qrRef}
          content={content}
          size={200}
          fgColor="#000000"
          bgColor="#ffffff"
          onReady={() => console.log('QR Code is ready!')}
        />
      </div>

      <div className="code-block">
        <pre>{`<QRCode
  ref={qrRef}
  content="${content}"
  size={200}
  fgColor="#000000"
  bgColor="#ffffff"
  onReady={() => console.log('QR Code is ready!')}
/>`}</pre>
      </div>
    </div>
  )
}

// Advanced Styling Example
function AdvancedExample() {
  const [config, setConfig] = useState({
    content: 'Advanced QR Code Example',
    size: 250,
    errorCorrectionLevel: 'H' as const,
    dotStyle: 'rounded' as const,
    cornerRadius: 10,
    fgColor: '#4F46E5',
    bgColor: '#F3F4F6',
    logo: {
      url: 'https://via.placeholder.com/50',
      size: 50,
      margin: 5,
    }
  })

  return (
    <div className="example-section">
      <h2 className="example-title">Advanced Styling</h2>
      
      <div className="controls">
        <div className="control-group">
          <label>Dot Style:</label>
          <select 
            value={config.dotStyle}
            onChange={(e) => setConfig({...config, dotStyle: e.target.value as any})}
          >
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
            <option value="dots">Dots</option>
            <option value="classy">Classy</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>Foreground Color:</label>
          <input 
            type="color" 
            value={config.fgColor}
            onChange={(e) => setConfig({...config, fgColor: e.target.value})}
          />
        </div>
        
        <div className="control-group">
          <label>Background Color:</label>
          <input 
            type="color" 
            value={config.bgColor}
            onChange={(e) => setConfig({...config, bgColor: e.target.value})}
          />
        </div>
        
        <div className="control-group">
          <label>Size:</label>
          <input 
            type="range" 
            min="100" 
            max="400" 
            value={config.size}
            onChange={(e) => setConfig({...config, size: Number(e.target.value)})}
          />
          <span>{config.size}px</span>
        </div>
      </div>

      <div className="qr-display">
        <QRCode
          content={config.content}
          size={config.size}
          errorCorrectionLevel={config.errorCorrectionLevel}
          dotStyle={config.dotStyle}
          cornerRadius={config.cornerRadius}
          fgColor={config.fgColor}
          bgColor={config.bgColor}
          logo={config.logo}
          animated={true}
          animationType="scale"
        />
      </div>
    </div>
  )
}

// Hooks Example
function HooksExample() {
  const { 
    containerRef, 
    generate, 
    download, 
    isGenerating,
    error 
  } = useQRCode()

  const [content, setContent] = useState('')

  const handleGenerate = () => {
    if (content) {
      generate({
        content,
        errorCorrectionLevel: 'M',
        renderType: 'canvas',
        style: {
          size: 256,
          fgColor: '#2563eb',
          bgColor: '#ffffff',
        }
      })
    }
  }

  return (
    <div className="example-section">
      <h2 className="example-title">useQRCode Hook</h2>
      
      <div className="controls">
        <div className="control-group">
          <label>Content:</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter content to generate QR code"
            rows={3}
          />
        </div>
        
        <div className="control-group">
          <button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </button>
          <button onClick={() => download('qr-hook-example')}>
            Download
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">Error: {error.message}</div>
      )}

      <div className="qr-display">
        <div ref={containerRef} />
      </div>

      <div className="code-block">
        <pre>{`const { containerRef, generate, download } = useQRCode()

// Generate QR code
generate({
  content: "${content}",
  style: { size: 256 }
})

// Download
download('filename')`}</pre>
      </div>
    </div>
  )
}

// Batch Generation Example
function BatchExample() {
  const { 
    items, 
    addItem, 
    removeItem, 
    generateAll, 
    downloadAll,
    isGenerating,
    progress 
  } = useBatchQRCode()

  const [newContent, setNewContent] = useState('')

  const handleAdd = () => {
    if (newContent) {
      addItem(newContent, {
        style: {
          size: 150,
          margin: 2,
        }
      })
      setNewContent('')
    }
  }

  return (
    <div className="example-section">
      <h2 className="example-title">Batch QR Code Generation</h2>
      
      <div className="controls">
        <div className="control-group">
          <label>Add Content:</label>
          <input 
            type="text" 
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Enter content"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        
        <div className="control-group">
          <button onClick={handleAdd}>Add to Batch</button>
          <button onClick={() => generateAll()} disabled={items.length === 0}>
            Generate All ({items.length})
          </button>
          <button onClick={() => downloadAll()} disabled={items.length === 0}>
            Download All
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <span>{Math.round(progress)}%</span>
        </div>
      )}

      <div className="batch-grid">
        {items.map((item) => (
          <div key={item.id} className="batch-item">
            <div className="batch-item-header">
              <span>{item.content.substring(0, 20)}...</span>
              <button onClick={() => removeItem(item.id)}>×</button>
            </div>
            {item.dataURL && (
              <img src={item.dataURL} alt="QR Code" />
            )}
            <span className={`status status-${item.status}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Interactive Example with Theme
function InteractiveExample() {
  const { value, debouncedValue, inputProps } = useQRCodeInput('Type to generate QR code...')
  const { currentTheme, toggleDarkMode, isDarkMode } = useQRCodeTheme()
  const [renderType, setRenderType] = useState<'canvas' | 'svg'>('canvas')
  const [animated, setAnimated] = useState(true)

  return (
    <div className="example-section">
      <h2 className="example-title">Interactive QR Code</h2>
      
      <div className="controls">
        <div className="control-group">
          <label>Live Input (with debouncing):</label>
          <textarea 
            {...inputProps}
            placeholder="Type something..."
            rows={3}
          />
        </div>
        
        <div className="control-group">
          <label>
            <input 
              type="checkbox" 
              checked={isDarkMode}
              onChange={toggleDarkMode}
            />
            Dark Mode
          </label>
        </div>
        
        <div className="control-group">
          <label>
            <input 
              type="checkbox" 
              checked={animated}
              onChange={(e) => setAnimated(e.target.checked)}
            />
            Animated
          </label>
        </div>
        
        <div className="control-group">
          <label>Render Type:</label>
          <select 
            value={renderType}
            onChange={(e) => setRenderType(e.target.value as 'canvas' | 'svg')}
          >
            <option value="canvas">Canvas</option>
            <option value="svg">SVG</option>
          </select>
        </div>
      </div>

      <div className="qr-display" style={{ 
        background: isDarkMode ? '#1a1a1a' : '#ffffff' 
      }}>
        {debouncedValue && (
          <QRCode
            content={debouncedValue}
            renderType={renderType}
            size={250}
            fgColor={currentTheme.fgColor}
            bgColor={currentTheme.bgColor}
            animated={animated}
            animationType="fade"
            animationDuration={500}
          />
        )}
      </div>

      <div className="info">
        <p>Input value: {value}</p>
        <p>Debounced value: {debouncedValue}</p>
        <p>Theme: {isDarkMode ? 'Dark' : 'Light'}</p>
      </div>
    </div>
  )
}

export default App