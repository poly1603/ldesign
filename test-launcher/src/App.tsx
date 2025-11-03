import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Launcher Test</h1>
      <p>This is a test project for @ldesign/launcher</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  )
}

export default App
