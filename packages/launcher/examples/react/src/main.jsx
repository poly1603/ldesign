import React from 'https://esm.sh/react@18'
import { createRoot } from 'https://esm.sh/react-dom@18/client'

function App() {
  return <h1>Hello React + @ldesign/launcher</h1>
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
