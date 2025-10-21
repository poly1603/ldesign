# 真实场景示例教程

本文档详细讲解如何使用 @ldesign/form 实现常见的业务场景。

## 目录

- [用户资料表单](#用户资料表单)
- [商品编辑表单](#商品编辑表单)
- [问卷调查表单](#问卷调查表单)
- [设置页面表单](#设置页面表单)
- [动态数组字段](#动态数组字段)

---

## 用户资料表单

### 场景描述
用户资料表单是最常见的表单类型，通常包含基本信息、联系方式、地址信息等多个分组。

### 设计思路

1. **信息分组**: 将相关字段分组，提高可读性
2. **验证策略**: 必填字段（用户名、邮箱、手机）+ 格式验证
3. **动态字段**: 社交账号列表使用动态数组
4. **级联选择**: 省市区三级联动

### 完整实现

**示例文件**: `examples/user-profile-demo.html`

#### 核心代码

```typescript
import { createForm } from '@ldesign/form'
import * as validators from '@ldesign/form/validators'

const form = createForm({
  initialValues: {
    // 基本信息
    avatar: '',
    username: '',
    email: '',
    phone: '',
    gender: '',
    birthday: '',
    bio: '',
    
    // 地址信息
    province: '',
    city: '',
    district: '',
    address: '',
    postalCode: '',
    
    // 工作信息
    company: '',
    position: '',
    website: '',
    
    // 社交账号（动态数组）
    socialAccounts: []
  },
  fields: [
    {
      name: 'username',
      label: '用户名',
      rules: [
        { validator: validators.required, message: '请输入用户名' },
        { validator: validators.minLength(3), message: '用户名至少3个字符' },
        { validator: validators.maxLength(20), message: '用户名最多20个字符' }
      ]
    },
    {
      name: 'email',
      label: '邮箱',
      rules: [
        { validator: validators.required, message: '请输入邮箱' },
        { validator: validators.email, message: '请输入有效的邮箱地址' }
      ]
    },
    {
      name: 'phone',
      label: '手机号',
      rules: [
        { validator: validators.required, message: '请输入手机号' },
        { validator: validators.phone, message: '请输入有效的手机号码' }
      ]
    },
    {
      name: 'postalCode',
      label: '邮政编码',
      rules: [
        { validator: validators.postalCode, message: '请输入有效的邮政编码' }
      ]
    },
    {
      name: 'website',
      label: '个人网站',
      rules: [
        { validator: validators.url, message: '请输入有效的URL地址' }
      ]
    }
  ],
  onSubmit: async (values) => {
    console.log('提交数据:', values)
    // 调用API保存数据
    await api.updateUserProfile(values)
  }
})
```

#### 动态数组字段实现

```javascript
// 添加社交账号
function addSocialAccount() {
  const container = document.getElementById('socialAccounts')
  const index = container.querySelectorAll('.dynamic-item').length
  
  const item = document.createElement('div')
  item.className = 'dynamic-item'
  item.innerHTML = `
    <div class="form-item">
      <label class="form-label">平台</label>
      <select class="form-select social-platform-${index}">
        <option value="">请选择</option>
        <option value="github">GitHub</option>
        <option value="twitter">Twitter</option>
        <option value="linkedin">LinkedIn</option>
      </select>
    </div>
    <div class="form-item">
      <label class="form-label">账号</label>
      <input type="text" class="form-input social-account-${index}" />
    </div>
    <div>
      <button type="button" class="btn btn-remove" onclick="removeSocialAccount(this)">
        删除
      </button>
    </div>
  `
  
  container.appendChild(item)
}

// 删除社交账号
function removeSocialAccount(btn) {
  btn.closest('.dynamic-item').remove()
}
```

### 关键点

1. **验证规则组合**: 使用多个验证器组合实现复杂验证
2. **动态字段**: 使用DOM操作实现添加/删除功能
3. **级联选择**: 监听上级字段变化，动态更新下级选项
4. **错误显示**: 在字段下方实时显示验证错误

---

## 商品编辑表单

### 场景描述
电商后台的商品管理表单，包含商品信息、价格、图片、规格等复杂内容。

### 设计思路

1. **信息分层**: 基本信息、价格库存、图片、规格、发货设置
2. **图片管理**: 多图上传、主图设置、拖拽排序
3. **规格管理**: 动态添加规格（颜色、尺寸等）
4. **条件显示**: 包邮开关控制运费显示

### 完整实现

**示例文件**: `examples/product-form-demo.html`

#### 核心功能

```typescript
const form = createForm({
  initialValues: {
    productName: '',
    category: [],      // 级联选择：一级、二级、三级分类
    brand: '',
    price: '',
    stock: '',
    images: [],        // 图片数组
    description: '',
    specs: [],         // 规格数组
    freeShipping: false,
    shippingFee: '',
    shipFrom: ''
  },
  fields: [
    {
      name: 'productName',
      rules: [
        { validator: validators.required },
        { validator: validators.minLength(2) }
      ]
    },
    {
      name: 'price',
      rules: [
        { validator: validators.required },
        { validator: validators.number },
        { validator: validators.min(0.01) }
      ]
    },
    {
      name: 'stock',
      rules: [
        { validator: validators.required },
        { validator: validators.integer },
        { validator: validators.min(0) }
      ]
    }
  ]
})
```

#### 图片上传实现

```javascript
function handleImageUpload(files) {
  files.forEach(file => {
    // 文件大小验证
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} 超过5MB限制`)
      return
    }

    // 读取文件
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = {
        url: e.target.result,
        name: file.name,
        isMain: productData.images.length === 0  // 第一张设为主图
      }
      productData.images.push(imageData)
      renderImageList()
    }
    reader.readAsDataURL(file)
  })
}

// 设置主图
function setMainImage(index) {
  productData.images.forEach((img, i) => {
    img.isMain = i === index
  })
  renderImageList()
}
```

#### 规格管理实现

```javascript
// 添加规格
function addSpec() {
  const specId = specCounter++
  const item = createSpecItem(specId)
  container.appendChild(item)
}

// 添加规格值
function addSpecValue(specId) {
  const value = prompt('请输入规格值：')
  if (!value) return

  const tag = document.createElement('div')
  tag.className = 'spec-value-tag'
  tag.innerHTML = `
    ${value}
    <span class="remove" onclick="this.parentElement.remove()">✕</span>
  `
  
  container.appendChild(tag)
}
```

#### 条件显示实现

```javascript
// 包邮开关控制运费字段显示
freeShippingSwitch.addEventListener('click', function() {
  productData.freeShipping = !productData.freeShipping
  this.classList.toggle('checked', productData.freeShipping)
  
  // 控制运费字段显示
  shippingSettings.style.display = productData.freeShipping ? 'none' : 'block'
})
```

### 关键点

1. **级联选择**: 三级分类联动，上级变化更新下级选项
2. **图片管理**: 多图上传、主图标记、删除功能
3. **动态规格**: 运行时添加规格名称和规格值
4. **条件显示**: 根据包邮开关显示/隐藏运费设置

---

## 问卷调查表单

### 场景描述
问卷调查表单需要支持多种题型、进度显示、草稿保存等功能。

### 设计思路

1. **多种题型**: 单选、多选、填空、评分、矩阵题
2. **进度跟踪**: 实时显示答题进度
3. **草稿保存**: 使用 localStorage 保存进度
4. **必答题标记**: 清晰标识必填题目

### 完整实现

**示例文件**: `examples/survey-form-demo.html`

#### 进度跟踪实现

```javascript
const totalQuestions = 9
let answeredQuestions = 0

function updateProgress() {
  // 统计已回答问题数
  answeredQuestions = 0
  
  if (document.querySelector('input[name="ageRange"]:checked')) answeredQuestions++
  if (document.querySelector('input[name="usageFrequency"]:checked')) answeredQuestions++
  if (document.querySelectorAll('input[name="features"]:checked').length > 0) answeredQuestions++
  if (currentRating > 0) answeredQuestions++
  // ... 其他题目
  
  // 更新进度条
  const progress = Math.round((answeredQuestions / totalQuestions) * 100)
  document.getElementById('progressFill').style.width = `${progress}%`
  document.getElementById('progressText').textContent = `${progress}%`
}
```

#### 评分功能实现

```javascript
const ratingTexts = ['请选择评分', '非常不满意', '不满意', '一般', '满意', '非常满意']

document.querySelectorAll('.rate-star').forEach((star, index) => {
  star.addEventListener('click', () => {
    currentRating = index + 1
    surveyData.overallRating = currentRating
    updateRatingDisplay()
    updateProgress()
  })

  // 悬停预览
  star.addEventListener('mouseenter', () => {
    document.querySelectorAll('.rate-star').forEach((s, i) => {
      s.classList.toggle('filled', i <= index)
    })
  })
})

function updateRatingDisplay() {
  document.querySelectorAll('.rate-star').forEach((s, i) => {
    s.classList.toggle('filled', i < currentRating)
  })
  document.getElementById('ratingText').textContent = ratingTexts[currentRating]
}
```

#### 草稿保存实现

```javascript
// 保存草稿
document.getElementById('saveDraftBtn').addEventListener('click', () => {
  collectAllData()
  localStorage.setItem('surveyDraft', JSON.stringify(surveyData))
  alert('草稿已保存！')
})

// 加载草稿
const draft = localStorage.getItem('surveyDraft')
if (draft) {
  const confirmed = confirm('检测到未提交的草稿，是否继续填写？')
  if (confirmed) {
    const data = JSON.parse(draft)
    // 恢复数据到表单
    restoreFormData(data)
    alert('草稿已恢复')
  }
}

// 提交成功后清除草稿
function onSubmitSuccess() {
  localStorage.removeItem('surveyDraft')
}
```

### 关键点

1. **进度管理**: 实时计算和显示答题进度
2. **评分交互**: 星星评分的悬停预览和点击选择
3. **草稿功能**: localStorage 保存和恢复
4. **验证逻辑**: 提交前检查必答题

---

## 设置页面表单

### 场景描述
应用设置页面，包含账户、隐私、通知、外观等多个设置分类。

### 设计思路

1. **侧边导航**: 使用侧边栏切换不同设置类别
2. **即时保存**: 修改后自动保存，无需点击提交按钮
3. **开关组件**: 大量使用开关控制功能开启/关闭
4. **实时应用**: 主题和样式设置立即生效

### 完整实现

**示例文件**: `examples/settings-demo.html`

#### 即时保存实现

```javascript
// 自动保存（防抖）
let saveTimeout
function autoSave() {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    // 保存到 localStorage
    localStorage.setItem('userSettings', JSON.stringify(settingsData))
    
    // 显示保存提示
    showSaveIndicator()
    
    console.log('设置已保存:', settingsData)
  }, 500)  // 500ms 防抖
}

// 为所有输入添加自动保存
function setupAutoSave(id, dataKey) {
  const input = document.getElementById(id)
  if (!input) return

  input.addEventListener('blur', () => {
    settingsData[dataKey] = input.value
    autoSave()
  })
}

// 为所有开关添加自动保存
function setupSwitch(id, dataKey) {
  const switchEl = document.getElementById(id)
  if (!switchEl) return

  switchEl.addEventListener('click', function() {
    settingsData[dataKey] = !settingsData[dataKey]
    this.classList.toggle('checked', settingsData[dataKey])
    autoSave()
  })
}
```

#### 主题实时应用

```javascript
// 主题切换
document.getElementById('theme').addEventListener('change', (e) => {
  settingsData.theme = e.target.value
  applyTheme(e.target.value)
  autoSave()
})

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.style.background = '#1f1f1f'
    document.body.style.color = '#fff'
  } else {
    document.body.style.background = '#f5f5f5'
    document.body.style.color = 'inherit'
  }
}
```

### 关键点

1. **侧边导航**: 清晰的设置分类
2. **即时保存**: 修改后自动保存，提供保存提示
3. **开关控制**: 大量使用 SwitchField
4. **实时预览**: 主题设置立即应用到界面

---

## 动态数组字段

### 场景描述
动态数组字段用于管理可变数量的相关数据，如联系人、工作经历、教育背景等。

### 设计思路

1. **添加/删除**: 允许用户动态添加和删除项
2. **排序功能**: 支持上下移动调整顺序
3. **空状态**: 无数据时显示友好的空状态提示
4. **验证支持**: 每个数组项内的字段也需要验证

### 完整实现

**示例文件**: `examples/array-fields-demo.html`

#### 联系人列表实现

```javascript
const formData = {
  contacts: []
}

// 添加联系人
function addContact() {
  const index = formData.contacts.length
  
  formData.contacts.push({
    name: '',
    phone: '',
    email: '',
    relationship: ''
  })

  renderContactItem(index)
}

// 渲染单个联系人项
function renderContactItem(index) {
  const item = document.createElement('div')
  item.className = 'array-item'
  item.dataset.index = index
  item.innerHTML = `
    <div class="array-item-header">
      <span class="array-item-title">联系人 #${index + 1}</span>
      <div class="array-item-actions">
        <button onclick="moveContact(${index}, -1)">↑</button>
        <button onclick="moveContact(${index}, 1)">↓</button>
        <button onclick="removeContact(${index})">删除</button>
      </div>
    </div>
    <div class="array-item-fields">
      <input class="contact-name-${index}" placeholder="姓名" />
      <input class="contact-phone-${index}" placeholder="电话" />
      <input class="contact-email-${index}" placeholder="邮箱" />
      <!-- ... -->
    </div>
  `
  
  container.appendChild(item)
}

// 删除联系人
function removeContact(index) {
  formData.contacts.splice(index, 1)
  renderContactList()  // 重新渲染整个列表
}

// 移动联系人
function moveContact(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= formData.contacts.length) return
  
  // 交换位置
  const temp = formData.contacts[index]
  formData.contacts[index] = formData.contacts[newIndex]
  formData.contacts[newIndex] = temp
  
  renderContactList()
}
```

#### 工作经历实现

```javascript
// 工作经历包含"至今"复选框
function addExperience() {
  formData.experiences.push({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,    // 是否在职
    description: ''
  })

  renderExperienceItem(index)
}

// "至今"复选框逻辑
function toggleCurrent(index) {
  const checkbox = document.querySelector(`.exp-current-${index}`)
  const endDateInput = document.getElementById(`exp-endDate-${index}`)
  
  if (checkbox.checked) {
    endDateInput.disabled = true
    endDateInput.value = ''
    formData.experiences[index].current = true
  } else {
    endDateInput.disabled = false
    formData.experiences[index].current = false
  }
}
```

### 关键点

1. **数据同步**: 及时收集和更新数组数据
2. **索引管理**: 删除和移动时正确维护索引
3. **UI更新**: 操作后重新渲染列表
4. **边界检查**: 移动时检查是否到达边界

---

## 条件字段和表单分组

### 场景描述
根据某些字段的值动态显示或隐藏其他字段，以及使用分组组织大型表单。

### 设计思路

1. **一级条件**: 开关控制字段组显示（如"是否有工作"）
2. **二级条件**: 嵌套的条件显示（如"其他行业"）
3. **分组折叠**: 点击分组标题展开/收起
4. **平滑过渡**: 显示/隐藏时有动画效果

### 完整实现

**示例文件**: `examples/conditional-fields-demo.html`

#### 条件显示实现

```javascript
// 一级条件：是否有工作
const hasJobSwitch = document.getElementById('hasJobSwitch')
const jobFields = document.getElementById('jobFields')

hasJobSwitch.addEventListener('click', function() {
  formData.hasJob = !formData.hasJob
  this.classList.toggle('checked', formData.hasJob)
  
  // 显示/隐藏工作相关字段
  if (formData.hasJob) {
    jobFields.style.display = 'block'
  } else {
    jobFields.style.display = 'none'
    // 清空工作相关字段
    clearJobFields()
  }
})

// 二级条件：其他行业
document.getElementById('industry').addEventListener('change', (e) => {
  const otherField = document.getElementById('otherIndustryField')
  
  if (e.target.value === 'other') {
    otherField.style.display = 'block'
  } else {
    otherField.style.display = 'none'
    document.getElementById('otherIndustry').value = ''
  }
})
```

#### 分组折叠实现

```javascript
function toggleGroup(groupName) {
  const group = document.getElementById(`group-${groupName}`)
  group.classList.toggle('expanded')
}

// CSS 动画
.form-group-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.form-group.expanded .form-group-body {
  max-height: 2000px;
}
```

### 关键点

1. **条件逻辑**: 监听触发字段变化，控制目标字段显示
2. **数据清理**: 隐藏字段时清空其值
3. **平滑动画**: 使用 CSS transition 实现过渡效果
4. **嵌套条件**: 支持多级条件判断

---

## 布局系统

### 场景描述
展示表单系统支持的各种布局方式。

### 完整实现

**示例文件**: `examples/layout-showcase.html`

#### 多列布局

```css
/* 单列 */
.layout-single {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* 双列 */
.layout-double {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* 三列 */
.layout-triple {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 响应式 */
.layout-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

#### 字段跨列

```css
.span-2 {
  grid-column: span 2;
}

.span-full {
  grid-column: 1 / -1;
}
```

---

## 最佳实践总结

### 1. 用户资料表单
- ✅ 使用分组组织字段
- ✅ 必要字段添加验证
- ✅ 动态数组管理相关数据
- ✅ 提供清晰的字段说明

### 2. 商品编辑表单
- ✅ 级联选择优化分类选择
- ✅ 多图上传增强商品展示
- ✅ 动态规格适应不同商品
- ✅ 条件显示简化界面

### 3. 问卷调查表单
- ✅ 进度显示增强用户体验
- ✅ 草稿保存避免数据丢失
- ✅ 多种题型覆盖需求
- ✅ 清晰的题目编号和标识

### 4. 设置页面表单
- ✅ 侧边导航组织设置类别
- ✅ 即时保存减少操作步骤
- ✅ 实时预览增强反馈
- ✅ 开关组件简化交互

---

## 相关文档

- [字段类型文档](./field-types.md)
- [高级功能指南](./advanced-features.md)
- [最佳实践](./best-practices.md)
- [API 参考](../README.md)

---

## 示例代码

所有示例的完整代码都可以在 `examples/` 目录中找到：

- `user-profile-demo.html` - 用户资料表单
- `product-form-demo.html` - 商品编辑表单
- `survey-form-demo.html` - 问卷调查表单
- `settings-demo.html` - 设置页面表单
- `array-fields-demo.html` - 动态数组字段
- `conditional-fields-demo.html` - 条件字段和分组
- `layout-showcase.html` - 布局系统展示
- `theme-showcase.html` - 主题和样式展示

每个示例都是完整可运行的，可以直接在浏览器中打开查看效果。




