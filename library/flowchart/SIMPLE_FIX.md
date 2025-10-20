# 简单直接的修复方案

## 看到的问题

从截图看到：
1. 回路线（"退回修改"）路径不够外侧
2. 多条线进入"审批拒绝"时重叠严重  
3. "金额判断"的出线也很混乱
4. 标签位置遮挡连线

## 简单修复

只改3个关键参数，不添加新功能：

### 1. 增大回路外边距
```typescript
// 在 OptimizedEdgeRouter.ts 中
loopOffset: 250  // 从120改为250
```

### 2. 增大连接点间距
```typescript
// 在 ConnectionPointManager.ts 中
distributions = [
  [0],                    // 1条线
  [-50, 50],             // 2条线：间距50px（原来30）
  [-60, 0, 60],          // 3条线：间距60px
]
```

### 3. 增大最小距离
```typescript
minDistance: 80  // 从50改为80
```

就这么简单。

