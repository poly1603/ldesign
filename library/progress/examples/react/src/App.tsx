import React, { useState } from 'react';
import { 
  LinearProgress, 
  CircleProgress,
  PolygonProgress,
  HeartProgress,
} from '@ldesign/progress-react';

function App() {
  const [value, setValue] = useState(50);

  const handleChange = (newValue: number) => {
    console.log('Progress changed:', newValue);
  };

  return (
    <div className="app">
      <h1>🎨 Progress React 示例</h1>

      <section className="demo-section">
        <h2>线性进度条</h2>
        
        <div className="demo-item">
          <div className="demo-label">基础线性进度条</div>
          <LinearProgress
            value={value}
            theme="primary"
            onChange={handleChange}
          />
        </div>

        <div className="demo-item">
          <div className="demo-label">渐变色进度条</div>
          <LinearProgress
            value={value}
            color={['#409eff', '#67c23a']}
          />
        </div>

        <div className="demo-item">
          <div className="demo-label">条纹进度条</div>
          <LinearProgress
            value={value}
            striped={true}
            active={true}
            theme="warning"
          />
        </div>
      </section>

      <section className="demo-section">
        <h2>圆形进度条</h2>
        <div className="circle-container">
          <CircleProgress
            value={value}
            radius={60}
            theme="primary"
          />
          
          <CircleProgress
            value={value}
            radius={60}
            color={['#ff6b6b', '#feca57', '#48dbfb']}
          />
          
          <CircleProgress
            value={value}
            radius={60}
            strokeWidth={8}
            theme="success"
          />
        </div>
      </section>

      <section className="demo-section">
        <h2>🆕 多边形进度条</h2>
        <div className="circle-container">
          <PolygonProgress
            value={value}
            sides={6}
            radius={50}
            theme="primary"
          />
          
          <PolygonProgress
            value={value}
            sides={3}
            radius={50}
            color="#f56c6c"
          />
          
          <PolygonProgress
            value={value}
            sides={8}
            radius={50}
            rotation={22.5}
            theme="warning"
          />
        </div>
      </section>

      <section className="demo-section">
        <h2>🆕 心形进度条</h2>
        <div className="circle-container">
          <HeartProgress
            value={value}
            heartSize={100}
            fillMode="bottom-up"
            color={['#ff6b6b', '#ee5a6f']}
          />
          
          <HeartProgress
            value={value}
            heartSize={100}
            fillMode="center-out"
            color="#ff4757"
          />
          
          <HeartProgress
            value={value}
            heartSize={100}
            fillMode="bottom-up"
            beatAnimation={true}
            beatSpeed={800}
            color={['#ff6b6b', '#ee5a6f']}
          />
        </div>
      </section>

      <div className="controls">
        <button onClick={() => setValue(25)}>25%</button>
        <button onClick={() => setValue(50)}>50%</button>
        <button onClick={() => setValue(75)}>75%</button>
        <button onClick={() => setValue(100)}>100%</button>
        <button onClick={() => setValue(0)}>重置</button>
      </div>
    </div>
  );
}

export default App;


