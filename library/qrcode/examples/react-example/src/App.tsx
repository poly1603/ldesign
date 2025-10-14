import React, { useState, useRef } from 'react'
import './App.css'

// Import from the library
import { 
  QRCode, 
  useQRCode, 
  QRCodeRef 
} from '@qrcode-lib/adapters/react'

function App() {
  return (
    <div className="App">
      <header className="header">
        <h1>🎯 QRCode Library React Demo</h1>
        <p>Explore various QR code styles and features</p>
      </header>
      
      <div className="demos-container">
        <BasicDemo />
        <StyledDemo />
        <GradientDemo />
        <LogoDemo />
        <ErrorCorrectionDemo />
        <SizeDemo />
        <DotsDemo />
        <DiamondDemo />
        <StarDemo />
        <ClassyDemo />
        <CustomEyesDemo />
        <ShadowDemo />
        <MaskDemo />
        <AdvancedTransformDemo />
      </div>
    </div>
  )
}

// Basic Demo
function BasicDemo() {
  return (
    <div className="demo-card">
      <h2>📱 Basic QR Code</h2>
      <div className="qr-wrapper">
        <QRCode
          content="https://github.com"
          size={200}
        />
      </div>
      <div className="demo-code">
        <code>
{`<QRCode
  content="https://github.com"
  size={200}
/>`}
        </code>
      </div>
    </div>
  )
}

// Styled Demo
function StyledDemo() {
  return (
    <div className="demo-card">
      <h2>🎨 Styled QR Code</h2>
      <div className="qr-wrapper">
        <QRCode
          content="https://example.com"
          size={200}
          fgColor="#FF6B6B"
          bgColor="#FFF5F5"
          margin={4}
        />
      </div>
      <div className="demo-code">
        <code>
{`<QRCode
  content="https://example.com"
  fgColor="#FF6B6B"
  bgColor="#FFF5F5"
  margin={4}
/>`}
        </code>
      </div>
    </div>
  )
}

// Gradient Demo
function GradientDemo() {
  return (
    <div className="demo-card">
      <h2>🌈 Gradient QR Code</h2>
      <div className="qr-wrapper">
        <QRCode
          content="Gradient Example"
          size={200}
          gradient={{
            type: 'linear',
            colors: ['#FF6B6B', '#4ECDC4']
          }}
        />
      </div>
      <div className="demo-code">
        <code>
{`<QRCode
  content="Gradient Example"
  gradient={{
    type: 'linear',
    colors: ['#FF6B6B', '#4ECDC4']
  }}
/>`}
        </code>
      </div>
    </div>
  )
}

// Logo Demo
function LogoDemo() {
  return (
    <div className="demo-card">
      <h2>🖼️ QR Code with Logo</h2>
      <div className="qr-wrapper">
        <QRCode
          content="Logo Example"
          size={200}
          logo={{
            url: 'https://via.placeholder.com/50',
            size: 50,
            margin: 5
          }}
          errorCorrectionLevel="H"
        />
      </div>
      <div className="demo-code">
        <code>
{`<QRCode
  content="Logo Example"
  logo={{
    url: 'logo.png',
    size: 50,
    margin: 5
  }}
  errorCorrectionLevel="H"
/>`}
        </code>
      </div>
    </div>
  )
}

// Error Correction Demo
function ErrorCorrectionDemo() {
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  
  return (
    <div className="demo-card">
      <h2>🛡️ Error Correction Levels</h2>
      <div className="controls-row">
        {(['L', 'M', 'Q', 'H'] as const).map(l => (
          <button
            key={l}
            className={level === l ? 'active' : ''}
            onClick={() => setLevel(l)}
          >
            {l} ({l === 'L' ? '7%' : l === 'M' ? '15%' : l === 'Q' ? '25%' : '30%'})
          </button>
        ))}
      </div>
      <div className="qr-wrapper">
        <QRCode
          content="Error Correction Demo"
          size={200}
          errorCorrectionLevel={level}
        />
      </div>
    </div>
  )
}

// Size Demo
function SizeDemo() {
  const [size, setSize] = useState(200)
  
  return (
    <div className="demo-card">
      <h2>📏 Dynamic Size</h2>
      <div className="controls-row">
        <input
          type="range"
          min="100"
          max="300"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
        <span>{size}px</span>
      </div>
      <div className="qr-wrapper">
        <QRCode
          content="Size Demo"
          size={size}
        />
      </div>
    </div>
  )
}

// Dots Demo
function DotsDemo() {
  return (
    <div className="demo-card">
      <h2>⚫ Dots Style</h2>
      <div className="qr-wrapper">
        <QRCode
          content="Dots Style"
          size={200}
          dotStyle="dots"
          fgColor="#6366F1"
        />
      </div>
      <div className="demo-code">
        <code>
{`<QRCode
  content="Dots Style"
  dotStyle="dots"
  fgColor="#6366F1"
/>`}
        </code>
      </div>
    </div>
  )
}

// Diamond Demo
function DiamondDemo() {
  return (
    <div className="demo-card">
      <h2>💎 Diamond Style</h2>
      <div className="qr-wrapper">
        <QRCode
          content="Diamond Style"
          size={200}
          dotStyle="diamond"
          fgColor="#8B5CF6"
        />
      </div>
      <div className="demo-code">
        <code>
{`<QRCode
  content="Diamond Style"
  dotStyle="diamond"
  fgColor="#8B5CF6"
/>`}
        </code>
      </div>
    </div>
  )
}

// Star Demo
function StarDemo() {
  return (
    <div className="demo-card">
      <h2>⭐ Star Style</h2>
      <div className="qr-wrapper">
        <QRCode
          content="Star Style"
          size={200}
          dotStyle="star"
          fgColor="#F59E0B"
        />
      </div>
      <div className="demo-code">
        <code>
{`<QRCode
  content="Star Style"
  dotStyle="star"
  fgColor="#F59E0B"
/>`}
        </code>
      </div>
    </div>
  )
}

// Classy Demo
function ClassyDemo() {
  return (
    <div className="demo-card">
      <h2>🎩 Classy Style</h2>
      <div className="qr-wrapper">
        <QRCode
          content="Classy Style"
          size={200}
          dotStyle="classy"
          fgColor="#1F2937"
        />
      </div>
      <div className="demo-code">
        <code>
{`<QRCode
  content="Classy Style"
  dotStyle="classy"
  fgColor="#1F2937"
/>`}
        </code>
      </div>
    </div>
  )
}

// Custom Eyes Demo
function CustomEyesDemo() {
  return (
    <div className="demo-card">
      <h2>👁️ Custom Eyes</h2>
      <div className="qr-wrapper">
        <QRCode
          content="Custom Eyes"
          size={200}
          eyeStyle="circle"
          eyeColor="#DC2626"
        />
      </div>
      <div className="demo-code">
        <code>
{`<QRCode
  content="Custom Eyes"
  eyeStyle="circle"
  eyeColor="#DC2626"
/>`}
        </code>
      </div>
    </div>
  )
}

// Shadow Demo
function ShadowDemo() {
  return (
    <div className="demo-card">
      <h2>🌑 Shadow Effect</h2>
      <div className="qr-wrapper" style={{ padding: '20px' }}>
        <div style={{
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          borderRadius: '8px',
          display: 'inline-block'
        }}>
          <QRCode
            content="Shadow Effect"
            size={200}
          />
        </div>
      </div>
      <div className="demo-code">
        <code>
{`<div style={{
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
}}>
  <QRCode content="Shadow Effect" />
</div>`}
        </code>
      </div>
    </div>
  )
}

// Mask Demo
function MaskDemo() {
  return (
    <div className="demo-card">
      <h2>🎭 Mask Pattern</h2>
      <div className="qr-wrapper">
        <QRCode
          content="Mask Pattern"
          size={200}
          maskPattern={2}
          fgColor="#059669"
        />
      </div>
      <div className="demo-code">
        <code>
{`<QRCode
  content="Mask Pattern"
  maskPattern={2}
  fgColor="#059669"
/>`}
        </code>
      </div>
    </div>
  )
}

// Advanced Transform Demo
function AdvancedTransformDemo() {
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  
  return (
    <div className="demo-card">
      <h2>🔄 Transform Effects</h2>
      <div className="controls-row">
        <label>
          Rotation: {rotation}°
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
          />
        </label>
        <label>
          Scale: {scale.toFixed(1)}x
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="qr-wrapper">
        <div style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transition: 'transform 0.3s ease'
        }}>
          <QRCode
            content="Transform Demo"
            size={200}
            fgColor="#7C3AED"
          />
        </div>
      </div>
    </div>
  )
}

export default App