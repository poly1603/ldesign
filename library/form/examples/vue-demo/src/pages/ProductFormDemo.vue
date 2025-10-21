<template>
  <div class="product-form-demo">
    <div class="demo-form">
      <div class="form-section">
        <h3>📝 基本信息</h3>
        <div class="form-grid">
          <div class="form-item" style="grid-column: 1 / -1;">
            <label>商品名称 *</label>
            <InputField v-model="product.name" placeholder="请输入商品名称" />
          </div>
          <div class="form-item">
            <label>商品分类</label>
            <CascaderField
              v-model="product.category"
              :options="categoryOptions"
              placeholder="请选择分类"
            />
          </div>
          <div class="form-item">
            <label>品牌</label>
            <InputField v-model="product.brand" placeholder="请输入品牌" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>💰 价格和库存</h3>
        <div class="form-grid">
          <div class="form-item">
            <label>销售价格（元）*</label>
            <InputField v-model="product.price" type="number" placeholder="0.00" />
          </div>
          <div class="form-item">
            <label>原价（元）</label>
            <InputField v-model="product.originalPrice" type="number" placeholder="0.00" />
          </div>
          <div class="form-item">
            <label>库存数量 *</label>
            <InputField v-model="product.stock" type="number" placeholder="0" />
          </div>
          <div class="form-item">
            <label>单位</label>
            <SelectField v-model="product.unit" :options="unitOptions" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>📷 商品图片</h3>
        <UploadField
          v-model="product.images"
          accept="image/*"
          listType="picture"
          :maxCount="9"
          :maxSize="5 * 1024 * 1024"
          tip="支持 JPG、PNG，最多9张，单张不超过5MB"
        />
      </div>

      <div class="form-section">
        <h3>📄 商品详情</h3>
        <TextareaField
          v-model="product.description"
          placeholder="请输入商品描述..."
          :autosize="{ minRows: 4, maxRows: 10 }"
          showCount
          :maxLength="1000"
        />
      </div>

      <div class="form-section">
        <h3>🏷️ 商品规格</h3>
        <div v-for="(spec, index) in product.specs" :key="index" class="spec-item">
          <InputField v-model="spec.name" placeholder="规格名（如颜色）" style="width: 150px;" />
          <div class="spec-values">
            <span v-for="(val, vIndex) in spec.values" :key="vIndex" class="spec-tag">
              {{ val }}
              <span class="remove" @click="removeSpecValue(index, vIndex)">✕</span>
            </span>
            <button type="button" class="btn-add-value" @click="addSpecValue(index)">+</button>
          </div>
          <button type="button" class="btn btn-icon btn-danger" @click="removeSpec(index)">🗑️</button>
        </div>
        <button type="button" class="btn btn-add" @click="addSpec">+ 添加规格</button>
      </div>

      <div class="form-section">
        <h3>🚚 发货设置</h3>
        <div class="switch-group">
          <SwitchField v-model="product.freeShipping" checkedChildren="包邮" uncheckedChildren="不包邮" />
        </div>
        <div v-if="!product.freeShipping" class="form-grid" style="margin-top: 16px;">
          <div class="form-item">
            <label>运费（元）</label>
            <InputField v-model="product.shippingFee" type="number" placeholder="0.00" />
          </div>
          <div class="form-item">
            <label>发货地</label>
            <SelectField v-model="product.shipFrom" :options="cityOptions" />
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">保存商品</button>
        <button type="button" class="btn" @click="resetForm">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import {
  InputField,
  TextareaField,
  SelectField,
  CascaderField,
  SwitchField,
  UploadField
} from '../../../src/adapters/vue/components/fields'

const product = reactive({
  name: '',
  category: [],
  brand: '',
  price: '',
  originalPrice: '',
  stock: '',
  unit: 'piece',
  images: [],
  description: '',
  specs: [],
  freeShipping: false,
  shippingFee: '',
  shipFrom: ''
})

const categoryOptions = [
  {
    label: '电子产品',
    value: 'electronics',
    children: [
      { label: '手机', value: 'phone' },
      { label: '电脑', value: 'computer' }
    ]
  },
  {
    label: '服装',
    value: 'clothing',
    children: [
      { label: '上衣', value: 'top' },
      { label: '裤子', value: 'pants' }
    ]
  }
]

const unitOptions = [
  { label: '件', value: 'piece' },
  { label: '盒', value: 'box' },
  { label: '千克', value: 'kg' }
]

const cityOptions = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' }
]

const addSpec = () => {
  product.specs.push({ name: '', values: [] })
}

const removeSpec = (index) => {
  product.specs.splice(index, 1)
}

const addSpecValue = (index) => {
  const value = prompt('请输入规格值：')
  if (value) {
    product.specs[index].values.push(value)
  }
}

const removeSpecValue = (specIndex, valueIndex) => {
  product.specs[specIndex].values.splice(valueIndex, 1)
}

const handleSubmit = async () => {
  console.log('商品数据:', product)
  alert('商品保存成功！')
}

const resetForm = () => {
  Object.assign(product, {
    name: '',
    category: [],
    brand: '',
    price: '',
    originalPrice: '',
    stock: '',
    unit: 'piece',
    images: [],
    description: '',
    specs: [],
    freeShipping: false,
    shippingFee: '',
    shipFrom: ''
  })
}
</script>

<style scoped>
.product-form-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.demo-form {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.switch-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spec-item {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.spec-values {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-tag {
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  font-size: 13px;
}

.spec-tag .remove {
  margin-left: 6px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
}

.spec-tag .remove:hover {
  color: #ff4d4f;
}

.btn-add-value {
  width: 28px;
  height: 28px;
  border: 1px dashed #d9d9d9;
  background: transparent;
  border-radius: 2px;
  cursor: pointer;
  font-size: 16px;
}

.btn {
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #722ED1;
  border-color: #722ED1;
  color: #fff;
}

.btn-primary:hover {
  background: #5c24a8;
}

.btn-add {
  width: 100%;
  border-style: dashed;
}

.btn-icon {
  padding: 6px 12px;
}

.btn-danger {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.btn-danger:hover {
  background: #ff4d4f;
  color: #fff;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}
</style>



