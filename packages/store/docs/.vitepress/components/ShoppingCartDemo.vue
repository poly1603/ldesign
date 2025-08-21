<script setup lang="ts">
import {
  Action,
  BaseStore,
  Getter,
  PersistentState,
  State,
} from '@ldesign/store'
import { computed, onUnmounted, ref } from 'vue'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  emoji: string
}

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  emoji: string
  addedAt: Date
}

interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount: number
  maxDiscount?: number
}

// 购物车 Store 定义
class ShoppingCartStore extends BaseStore {
  @PersistentState({ default: [] })
  items: CartItem[] = []

  @State({ default: null })
  appliedCoupon: Coupon | null = null

  @State({ default: 0 })
  shippingFee: number = 0

  @State({ default: 0 })
  tax: number = 0

  @Action()
  addItem(product: Product, quantity: number = 1) {
    const existingItem = this.items.find(item => item.productId === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    }
    else {
      this.items.push({
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        emoji: product.emoji,
        addedAt: new Date(),
      })
    }

    this.calculateShippingAndTax()
  }

  @Action()
  removeItem(itemId: string) {
    const index = this.items.findIndex(item => item.id === itemId)
    if (index > -1) {
      this.items.splice(index, 1)
      this.calculateShippingAndTax()
    }
  }

  @Action()
  updateQuantity(itemId: string, quantity: number) {
    const item = this.items.find(item => item.id === itemId)
    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId)
      }
      else {
        item.quantity = quantity
        this.calculateShippingAndTax()
      }
    }
  }

  @Action()
  clearCart() {
    this.items = []
    this.appliedCoupon = null
    this.shippingFee = 0
    this.tax = 0
  }

  @Action()
  applyCoupon(coupon: Coupon) {
    if (this.subtotal >= coupon.minAmount) {
      this.appliedCoupon = coupon
    }
  }

  @Action()
  removeCoupon() {
    this.appliedCoupon = null
  }

  private calculateShippingAndTax() {
    // 计算运费
    if (this.subtotal >= 99) {
      this.shippingFee = 0 // 满99免运费
    }
    else {
      this.shippingFee = 10
    }

    // 计算税费
    this.tax = this.subtotal * 0.1 // 10% 税率
  }

  @Getter()
  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  @Getter()
  get subtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  @Getter()
  get discountAmount() {
    if (!this.appliedCoupon)
      return 0

    let discount = 0
    if (this.appliedCoupon.type === 'percentage') {
      discount = this.subtotal * (this.appliedCoupon.value / 100)
    }
    else {
      discount = this.appliedCoupon.value
    }

    // 应用最大折扣限制
    if (this.appliedCoupon.maxDiscount) {
      discount = Math.min(discount, this.appliedCoupon.maxDiscount)
    }

    return discount
  }

  @Getter()
  get total() {
    return Math.max(
      0,
      this.subtotal - this.discountAmount + this.shippingFee + this.tax,
    )
  }

  @Getter()
  get isEmpty() {
    return this.items.length === 0
  }
}

// 创建 store 实例
const cartStore = new ShoppingCartStore('shopping-cart-demo')

// 模拟商品数据
const products = ref<Product[]>([
  { id: '1', name: 'MacBook Pro', price: 12999, stock: 5, emoji: '💻' },
  { id: '2', name: 'iPhone 15', price: 5999, stock: 10, emoji: '📱' },
  { id: '3', name: 'AirPods Pro', price: 1999, stock: 15, emoji: '🎧' },
  { id: '4', name: 'iPad Air', price: 4599, stock: 8, emoji: '📱' },
  { id: '5', name: 'Apple Watch', price: 2999, stock: 12, emoji: '⌚' },
  { id: '6', name: 'Magic Mouse', price: 799, stock: 20, emoji: '🖱️' },
])

// 模拟优惠券
const availableCoupons: Record<string, Coupon> = {
  SAVE10: { code: 'SAVE10', type: 'percentage', value: 10, minAmount: 100 },
  SAVE50: { code: 'SAVE50', type: 'fixed', value: 50, minAmount: 200 },
  VIP20: {
    code: 'VIP20',
    type: 'percentage',
    value: 20,
    minAmount: 500,
    maxDiscount: 200,
  },
}

const couponCode = ref('')
const activeTab = ref('store')

// 方法
function addToCart(product: Product) {
  if (product.stock > 0) {
    cartStore.addItem(product)
    // 模拟减少库存
    product.stock--
  }
}

function getProductStock(productId: string) {
  const product = products.value.find(p => p.id === productId)
  return product ? product.stock : 0
}

function applyCoupon() {
  const coupon = availableCoupons[couponCode.value.toUpperCase()]
  if (coupon) {
    cartStore.applyCoupon(coupon)
    couponCode.value = ''
  }
  else {
    alert('无效的优惠券代码')
  }
}

function checkout() {
  alert(`结算成功！总金额: ¥${cartStore.total.toFixed(2)}`)
  cartStore.clearCart()
  // 重置库存
  products.value.forEach((product) => {
    switch (product.id) {
      case '1':
        product.stock = 5
        break
      case '2':
        product.stock = 10
        break
      case '3':
        product.stock = 15
        break
      case '4':
        product.stock = 8
        break
      case '5':
        product.stock = 12
        break
      case '6':
        product.stock = 20
        break
    }
  })
}

// 代码标签页
const codeTabs = [
  { name: 'store', label: 'Store 定义' },
  { name: 'usage', label: '使用方式' },
  { name: 'features', label: '功能特性' },
]

const codeExamples = {
  store: `import { BaseStore, PersistentState, State, Action, Getter } from '@ldesign/store'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  addedAt: Date
}

interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount: number
  maxDiscount?: number
}

class ShoppingCartStore extends BaseStore {
  @PersistentState({ default: [] })
  items: CartItem[] = []

  @State({ default: null })
  appliedCoupon: Coupon | null = null

  @Action()
  addItem(product: Product, quantity: number = 1) {
    const existingItem = this.items.find(item => item.productId === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      this.items.push({
        id: generateId(),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        addedAt: new Date()
      })
    }
    
    this.calculateShippingAndTax()
  }

  @Getter()
  get subtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  @Getter()
  get discountAmount() {
    if (!this.appliedCoupon) return 0
    
    if (this.appliedCoupon.type === 'percentage') {
      return this.subtotal * (this.appliedCoupon.value / 100)
    } else {
      return this.appliedCoupon.value
    }
  }

  @Getter()
  get total() {
    return this.subtotal - this.discountAmount + this.shippingFee + this.tax
  }
}`,

  usage: `// 创建购物车实例
const cartStore = new ShoppingCartStore('cart')

// 添加商品到购物车
cartStore.addItem({
  id: '1',
  name: 'MacBook Pro',
  price: 12999,
  stock: 5
})

// 更新商品数量
cartStore.updateQuantity('item-1', 2)

// 应用优惠券
cartStore.applyCoupon({
  code: 'SAVE10',
  type: 'percentage',
  value: 10,
  minAmount: 100
})

// 获取购物车信息
console.log(cartStore.itemCount)     // 商品数量
console.log(cartStore.subtotal)      // 小计
console.log(cartStore.discountAmount) // 折扣金额
console.log(cartStore.total)         // 总计`,

  features: `// 主要功能特性

1. 购物车管理
   - 添加/删除商品
   - 更新商品数量
   - 清空购物车

2. 价格计算
   - 自动计算小计
   - 运费计算（满99免运费）
   - 税费计算（10%）
   - 优惠券折扣

3. 优惠券系统
   - 百分比折扣
   - 固定金额折扣
   - 最低消费限制
   - 最大折扣限制

4. 持久化存储
   - 购物车数据自动保存
   - 页面刷新后数据不丢失

5. 响应式计算
   - 实时计算总价
   - 自动更新运费
   - 动态显示优惠信息`,
}

const highlightedCode = computed(() => {
  const code = codeExamples[activeTab.value]
  return code
    .replace(/(@\w+)/g, '<span class="decorator">$1</span>')
    .replace(
      /(class|interface|import|export|from|const|let|var)/g,
      '<span class="keyword">$1</span>',
    )
    .replace(/(string|number|boolean|void)/g, '<span class="type">$1</span>')
    .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
})

onUnmounted(() => {
  cartStore.$dispose()
})
</script>

<template>
  <div class="shopping-cart-demo">
    <div class="demo-header">
      <h3>🛒 购物车示例</h3>
      <p>体验复杂业务逻辑和计算属性</p>
    </div>

    <div class="demo-content">
      <!-- 商品列表 -->
      <div class="products-section">
        <h4>商品列表</h4>
        <div class="products-grid">
          <div
            v-for="product in products"
            :key="product.id"
            class="product-card"
          >
            <div class="product-image">
              {{ product.emoji }}
            </div>
            <div class="product-info">
              <h5 class="product-name">
                {{ product.name }}
              </h5>
              <div class="product-price">
                ¥{{ product.price }}
              </div>
              <div class="product-stock">
                库存: {{ product.stock }}
              </div>
            </div>
            <button
              :disabled="product.stock === 0"
              class="btn btn-primary btn-sm"
              @click="addToCart(product)"
            >
              {{ product.stock === 0 ? '缺货' : '加入购物车' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 购物车 -->
      <div class="cart-section">
        <div class="cart-header">
          <h4>购物车 ({{ cartStore.itemCount }})</h4>
          <button
            v-if="!cartStore.isEmpty"
            class="btn btn-outline btn-sm"
            @click="cartStore.clearCart"
          >
            清空购物车
          </button>
        </div>

        <div v-if="cartStore.isEmpty" class="empty-cart">
          <div class="empty-icon">
            🛒
          </div>
          <div class="empty-text">
            购物车是空的
          </div>
        </div>

        <div v-else class="cart-items">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <div class="item-image">
              {{ item.emoji }}
            </div>
            <div class="item-info">
              <div class="item-name">
                {{ item.name }}
              </div>
              <div class="item-price">
                ¥{{ item.price }}
              </div>
            </div>
            <div class="item-quantity">
              <button
                class="quantity-btn"
                :disabled="item.quantity <= 1"
                @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
              >
                -
              </button>
              <span class="quantity">{{ item.quantity }}</span>
              <button
                class="quantity-btn"
                :disabled="item.quantity >= getProductStock(item.productId)"
                @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
              >
                +
              </button>
            </div>
            <div class="item-total">
              ¥{{ (item.price * item.quantity).toFixed(2) }}
            </div>
            <button
              class="btn btn-danger btn-sm"
              @click="cartStore.removeItem(item.id)"
            >
              删除
            </button>
          </div>
        </div>

        <!-- 优惠券 -->
        <div v-if="!cartStore.isEmpty" class="coupon-section">
          <div class="coupon-input">
            <input
              v-model="couponCode"
              placeholder="输入优惠券代码"
              class="coupon-field"
              :disabled="cartStore.appliedCoupon !== null"
            >
            <button
              v-if="cartStore.appliedCoupon === null"
              :disabled="!couponCode.trim()"
              class="btn btn-outline btn-sm"
              @click="applyCoupon"
            >
              使用
            </button>
            <button
              v-else
              class="btn btn-outline btn-sm"
              @click="cartStore.removeCoupon"
            >
              移除
            </button>
          </div>
          <div v-if="cartStore.appliedCoupon" class="applied-coupon">
            <span class="coupon-info">
              已使用优惠券: {{ cartStore.appliedCoupon.code }} (-¥{{
                cartStore.discountAmount.toFixed(2)
              }})
            </span>
          </div>
        </div>

        <!-- 价格汇总 -->
        <div v-if="!cartStore.isEmpty" class="price-summary">
          <div class="summary-row">
            <span>商品小计:</span>
            <span>¥{{ cartStore.subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="cartStore.discountAmount > 0" class="summary-row discount">
            <span>优惠金额:</span>
            <span>-¥{{ cartStore.discountAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>运费:</span>
            <span>{{
              cartStore.shippingFee === 0
                ? '免费'
                : `¥${cartStore.shippingFee.toFixed(2)}`
            }}</span>
          </div>
          <div class="summary-row">
            <span>税费:</span>
            <span>¥{{ cartStore.tax.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>总计:</span>
            <span>¥{{ cartStore.total.toFixed(2) }}</span>
          </div>
          <div class="shipping-notice">
            {{
              cartStore.subtotal >= 99
                ? '🎉 已享受免运费'
                : `还差 ¥${(99 - cartStore.subtotal).toFixed(2)} 即可免运费`
            }}
          </div>
        </div>

        <!-- 结算按钮 -->
        <div v-if="!cartStore.isEmpty" class="checkout-section">
          <button class="btn btn-primary btn-large" @click="checkout">
            立即结算 (¥{{ cartStore.total.toFixed(2) }})
          </button>
        </div>
      </div>
    </div>

    <!-- 代码展示 -->
    <div class="code-section">
      <details>
        <summary>查看源代码</summary>
        <div class="code-tabs">
          <button
            v-for="tab in codeTabs"
            :key="tab.name"
            :class="{ active: activeTab === tab.name }"
            class="tab-button"
            @click="activeTab = tab.name"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="code-content">
          <pre><code v-html="highlightedCode" /></pre>
        </div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.shopping-cart-demo {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  background: #fafafa;
}

.demo-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.demo-header h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.demo-header p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

.demo-content {
  background: white;
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.products-section {
  margin-bottom: 2rem;
}

.products-section h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  transition: all 0.2s;
}

.product-card:hover {
  border-color: #3182ce;
  box-shadow: 0 2px 8px rgba(49, 130, 206, 0.1);
}

.product-image {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.product-name {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.product-price {
  font-size: 1.1rem;
  font-weight: bold;
  color: #e53e3e;
  margin-bottom: 0.25rem;
}

.product-stock {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 1rem;
}

.cart-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 2rem;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cart-header h4 {
  margin: 0;
  color: #2d3748;
}

.empty-cart {
  text-align: center;
  padding: 3rem 1rem;
  color: #a0aec0;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.1rem;
}

.cart-items {
  margin-bottom: 1.5rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.item-image {
  font-size: 1.5rem;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.item-price {
  color: #718096;
  font-size: 0.875rem;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  background: #f7fafc;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  min-width: 2rem;
  text-align: center;
  font-weight: 600;
}

.item-total {
  font-weight: bold;
  color: #e53e3e;
  min-width: 80px;
  text-align: right;
}

.coupon-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.coupon-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.coupon-field {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.applied-coupon {
  color: #38a169;
  font-weight: 500;
  font-size: 0.875rem;
}

.price-summary {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-row.discount {
  color: #38a169;
}

.summary-row.total {
  font-weight: bold;
  font-size: 1.1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.shipping-notice {
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background: #e6fffa;
  color: #234e52;
  border-radius: 4px;
  font-size: 0.875rem;
}

.checkout-section {
  text-align: center;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2c5aa0;
}

.btn-outline {
  background: transparent;
  color: #3182ce;
  border: 1px solid #3182ce;
}

.btn-outline:hover {
  background: #3182ce;
  color: white;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover {
  background: #c53030;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-large {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.code-section {
  margin-top: 1rem;
}

.code-section details {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.code-section summary {
  padding: 0.75rem 1rem;
  background: #f7fafc;
  cursor: pointer;
  font-weight: 500;
  color: #4a5568;
}

.code-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: #718096;
}

.tab-button.active {
  color: #3182ce;
  border-bottom-color: #3182ce;
  background: white;
}

.code-content {
  padding: 1rem;
  background: white;
  overflow-x: auto;
}

.code-content pre {
  margin: 0;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.code-content :deep(.decorator) {
  color: #d69e2e;
  font-weight: bold;
}

.code-content :deep(.keyword) {
  color: #805ad5;
  font-weight: bold;
}

.code-content :deep(.type) {
  color: #38a169;
}

.code-content :deep(.comment) {
  color: #a0aec0;
  font-style: italic;
}
</style>
