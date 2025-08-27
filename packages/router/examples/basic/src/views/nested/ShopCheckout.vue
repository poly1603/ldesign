<script setup lang="ts">
import { computed, reactive } from 'vue'

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
}

const orderInfo = reactive({
  name: '',
  phone: '',
  address: '',
  paymentMethod: 'alipay',
  note: '',
})

const orderItems = reactive<OrderItem[]>([
  { id: 1, name: '智能手机', price: 2999, quantity: 1 },
  { id: 2, name: '无线耳机', price: 299, quantity: 2 },
  { id: 3, name: '智能手表', price: 1299, quantity: 1 },
])

const subtotal = computed(() =>
  orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
)

const total = computed(() => subtotal.value + 10 - 20) // 商品总价 + 运费 - 优惠券

const canPlaceOrder = computed(() =>
  orderInfo.name && orderInfo.phone && orderInfo.address && orderInfo.paymentMethod,
)

function placeOrder() {
  if (canPlaceOrder.value) {
    // 模拟订单提交操作
  }
}
</script>

<template>
  <div class="shop-checkout">
    <h3>💳 结账</h3>
    <p>完成您的订单，安全快捷的支付体验。</p>

    <div class="checkout-content">
      <div class="checkout-form">
        <div class="form-section">
          <h4>收货信息</h4>
          <div class="form-group">
            <label>收货人姓名</label>
            <input v-model="orderInfo.name" type="text">
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input v-model="orderInfo.phone" type="tel">
          </div>
          <div class="form-group">
            <label>收货地址</label>
            <textarea v-model="orderInfo.address" rows="3" />
          </div>
        </div>

        <div class="form-section">
          <h4>支付方式</h4>
          <div class="payment-methods">
            <label class="payment-option">
              <input v-model="orderInfo.paymentMethod" type="radio" value="alipay">
              <span class="payment-icon">💰</span>
              <span>支付宝</span>
            </label>
            <label class="payment-option">
              <input v-model="orderInfo.paymentMethod" type="radio" value="wechat">
              <span class="payment-icon">💚</span>
              <span>微信支付</span>
            </label>
            <label class="payment-option">
              <input v-model="orderInfo.paymentMethod" type="radio" value="card">
              <span class="payment-icon">💳</span>
              <span>银行卡</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <h4>订单备注</h4>
          <div class="form-group">
            <textarea v-model="orderInfo.note" rows="3" placeholder="请输入订单备注（可选）" />
          </div>
        </div>
      </div>

      <div class="order-summary">
        <h4>订单摘要</h4>
        <div class="summary-items">
          <div v-for="item in orderItems" :key="item.id" class="summary-item">
            <span class="item-name">{{ item.name }} × {{ item.quantity }}</span>
            <span class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <div class="summary-totals">
          <div class="summary-row">
            <span>商品总价：</span>
            <span>¥{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>运费：</span>
            <span>¥10.00</span>
          </div>
          <div class="summary-row">
            <span>优惠券：</span>
            <span class="discount">-¥20.00</span>
          </div>
          <div class="summary-row total">
            <span>应付金额：</span>
            <span>¥{{ total.toFixed(2) }}</span>
          </div>
        </div>

        <button class="place-order-btn" :disabled="!canPlaceOrder" @click="placeOrder">
          立即下单
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-checkout h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.checkout-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.form-section h4 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover {
  border-color: #059669;
}

.payment-option input[type="radio"] {
  width: auto;
}

.payment-icon {
  font-size: 1.25rem;
}

.order-summary {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  height: fit-content;
}

.order-summary h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.summary-items {
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.item-name {
  color: #374151;
}

.item-price {
  font-weight: 500;
}

.summary-totals {
  border-top: 1px solid #d1d5db;
  padding-top: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-row.total {
  font-weight: 700;
  font-size: 1.125rem;
  color: #059669;
  border-top: 1px solid #d1d5db;
  padding-top: 0.5rem;
  margin-top: 1rem;
}

.discount {
  color: #ef4444;
}

.place-order-btn {
  width: 100%;
  background: #059669;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1.125rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
}

.place-order-btn:hover:not(:disabled) {
  background: #047857;
}

.place-order-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
}
</style>
