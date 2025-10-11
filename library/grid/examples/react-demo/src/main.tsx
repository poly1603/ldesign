import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App-simple' // 使用简化版本
// import '@ldesign/gridstack/styles'
import 'gridstack/dist/gridstack.min.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
