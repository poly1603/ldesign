# Manhattan路由方案

## ✅ 最终方案

参考 **BPMN.js、AntV X6、mxGraph** 的成熟实现，采用标准的 **Manhattan路由**。

## 核心特点

### 1. 连接点规则
```
正常流程：
- 出口：底部（BOTTOM）
- 入口：顶部（TOP）

回路：
- 出口：侧面（LEFT或RIGHT，根据目标位置）
- 入口：顶部（TOP）
```

### 2. 路径规则
```
正常流程（底部→顶部）：
Source (底部)
    ↓ 向下到中点
    → 水平移动到目标X
    ↓ 向上到目标
Target (顶部)

回路（侧面→顶部）：
Source (侧面)
    → 水平延伸
    ↓ 走外侧大弧
    → 水平到目标X
    ↓ 进入目标
Target (顶部)
```

### 3. 多线分散
```
2条线：±45px
3条线：-55px, 0, +55px
4条线：-60px, -20px, +20px, +60px
```

### 4. 参数
```
MIN_DISTANCE = 60     // 最小距离
LOOP_OFFSET = 180     // 回路外边距
CORNER_RADIUS = 8     // 圆角半径
```

## 查看效果

访问 `http://localhost:8000` 并**刷新页面**！

---
**核心文件**: `src/renderer/ManhattanRouter.ts`  
**代码行数**: ~280行  
**方案**: 参考业界标准Manhattan路由

