# Button Component Error Fix Summary

## 问题描述
错误信息：`Uncaught (in promise) InvalidCharacterError: Failed to execute 'setAttribute' on 'Element': 'number,' is not a valid attribute name.`

## 根本原因
Stencil 框架在处理复杂对象类型的 `@Prop()` 时存在限制，特别是在处理如 `loading: boolean | { delay?: number; icon?: string }` 这样的联合类型时。

## 解决方案

### 1. 属性拆分
将复杂的 `loading` 属性拆分为三个独立的属性：

**之前：**
```typescript
@Prop() loading: boolean | { delay?: number; icon?: string } = false;
```

**之后：**
```typescript
@Prop() loading: boolean = false;
@Prop() loadingDelay?: number;
@Prop() loadingIcon?: string;
```

### 2. 使用方式更新

**之前的使用方式：**
```html
<!-- 复杂对象方式（不再支持） -->
<ldesign-button loading='{ "delay": 300, "icon": "loader" }'>Loading</ldesign-button>
```

**新的使用方式：**
```html
<!-- 分离属性方式 -->
<ldesign-button loading loading-delay="300" loading-icon="loader">Loading</ldesign-button>

<!-- 简单布尔值方式 -->
<ldesign-button loading>Loading</ldesign-button>

<!-- 自定义加载图标 -->
<ldesign-button loading loading-icon="spinner">Custom Icon</ldesign-button>
```

## API 更新

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| loading | 设置按钮载入状态 | boolean | false |
| loadingDelay | 加载延迟时间（毫秒） | number | - |
| loadingIcon | 自定义加载图标 | string | - |

## 优势
1. **更好的兼容性**：避免了 Stencil 框架对复杂对象属性的解析问题
2. **更清晰的 API**：每个属性都有明确的用途
3. **更灵活的控制**：可以独立设置每个加载相关的属性
4. **向后兼容**：简单的 `loading` 布尔属性用法保持不变

## 测试验证
请使用 `button-test.html` 文件验证所有按钮功能是否正常工作。