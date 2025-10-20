# @ldesign/progress-react

React 进度条组件封装。

## 安装

```bash
npm install @ldesign/progress-react
```

## 使用

```tsx
import React, { useState } from 'react';
import { LinearProgress, CircleProgress } from '@ldesign/progress-react';
import '@ldesign/progress-core/dist/index.css';

function App() {
  const [value, setValue] = useState(50);

  return (
    <div>
      <LinearProgress
        value={value}
        theme="primary"
        onChange={(v) => console.log('Progress:', v)}
      />
      
      <CircleProgress
        value={value}
        radius={60}
        theme="success"
      />
      
      <button onClick={() => setValue(value + 10)}>+10</button>
    </div>
  );
}
```

## Ref 方法

```tsx
import { useRef } from 'react';
import { LinearProgress, LinearProgressRef } from '@ldesign/progress-react';

function App() {
  const progressRef = useRef<LinearProgressRef>(null);

  const handleClick = () => {
    progressRef.current?.setValue(80);
    progressRef.current?.increment(10);
  };

  return <LinearProgress ref={progressRef} value={50} />;
}
```

查看主项目 README 获取详细文档。


