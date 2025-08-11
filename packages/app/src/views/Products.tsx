import { RouterLink } from '@ldesign/router'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Products',
  setup() {
    const products = ref([
      {
        id: 1,
        name: 'MacBook Pro',
        category: '电脑',
        price: 12999,
        stock: 15,
        status: 'active',
        image: '💻',
      },
      {
        id: 2,
        name: 'iPhone 15',
        category: '手机',
        price: 5999,
        stock: 32,
        status: 'active',
        image: '📱',
      },
      {
        id: 3,
        name: 'AirPods Pro',
        category: '音频',
        price: 1999,
        stock: 8,
        status: 'low_stock',
        image: '🎧',
      },
      {
        id: 4,
        name: 'iPad Air',
        category: '平板',
        price: 4599,
        stock: 0,
        status: 'out_of_stock',
        image: '📱',
      },
    ])

    const getStatusBadge = (status: string, stock: number) => {
      switch (status) {
        case 'active':
          return { text: '正常', color: '#28a745' }
        case 'low_stock':
          return { text: '库存不足', color: '#ffc107' }
        case 'out_of_stock':
          return { text: '缺货', color: '#dc3545' }
        default:
          return { text: '未知', color: '#6c757d' }
      }
    }

    return () => (
      <div class='products'>
        <div class='products-header'>
          <h2>📦 产品管理</h2>
          <p>管理您的产品库存和信息</p>

          <div class='header-actions'>
            <RouterLink
              to='/products/add'
              variant='button'
              icon='➕'
              track-event='add_product'
            >
              添加产品
            </RouterLink>

            <RouterLink
              to='/products/import'
              variant='button'
              icon='📥'
              track-event='import_products'
            >
              批量导入
            </RouterLink>

            <RouterLink
              to='/products/export'
              variant='button'
              icon='📤'
              confirm-message='确定要导出所有产品数据吗？'
              track-event='export_products'
            >
              导出数据
            </RouterLink>
          </div>
        </div>

        <div class='products-stats'>
          <div class='stat-card'>
            <div class='stat-icon'>📊</div>
            <div class='stat-info'>
              <div class='stat-value'>{products.value.length}</div>
              <div class='stat-label'>总产品数</div>
            </div>
          </div>

          <div class='stat-card'>
            <div class='stat-icon'>✅</div>
            <div class='stat-info'>
              <div class='stat-value'>
                {products.value.filter(p => p.status === 'active').length}
              </div>
              <div class='stat-label'>正常库存</div>
            </div>
          </div>

          <div class='stat-card'>
            <div class='stat-icon'>⚠️</div>
            <div class='stat-info'>
              <div class='stat-value'>
                {products.value.filter(p => p.status === 'low_stock').length}
              </div>
              <div class='stat-label'>库存不足</div>
            </div>
          </div>

          <div class='stat-card'>
            <div class='stat-icon'>❌</div>
            <div class='stat-info'>
              <div class='stat-value'>
                {products.value.filter(p => p.status === 'out_of_stock').length}
              </div>
              <div class='stat-label'>缺货</div>
            </div>
          </div>
        </div>

        <div class='products-grid'>
          {products.value.map(product => {
            const statusBadge = getStatusBadge(product.status, product.stock)

            return (
              <div key={product.id} class='product-card'>
                <div class='product-image'>{product.image}</div>

                <div class='product-info'>
                  <h3 class='product-name'>{product.name}</h3>
                  <p class='product-category'>{product.category}</p>
                  <p class='product-price'>¥{product.price.toLocaleString()}</p>

                  <div class='product-stock'>
                    <span>
                      库存:
                      {product.stock}
                    </span>
                    <span
                      class='status-badge'
                      style={{ backgroundColor: statusBadge.color }}
                    >
                      {statusBadge.text}
                    </span>
                  </div>
                </div>

                <div class='product-actions'>
                  <RouterLink
                    to={`/products/${product.id}`}
                    variant='button'
                    size='small'
                    icon='👁️'
                    preload='hover'
                    track-event='view_product'
                    track-data={{
                      productId: product.id,
                      productName: product.name,
                    }}
                  >
                    查看
                  </RouterLink>

                  <RouterLink
                    to={`/products/${product.id}/edit`}
                    variant='button'
                    size='small'
                    icon='✏️'
                    permission='products.edit'
                    track-event='edit_product'
                    track-data={{ productId: product.id }}
                  >
                    编辑
                  </RouterLink>

                  <RouterLink
                    to={`/products/${product.id}/delete`}
                    variant='button'
                    size='small'
                    icon='🗑️'
                    permission='products.delete'
                    confirm-message={`确定要删除产品 "${product.name}" 吗？此操作不可撤销。`}
                    confirm-title='删除确认'
                    track-event='delete_product'
                    track-data={{ productId: product.id }}
                  >
                    删除
                  </RouterLink>
                </div>
              </div>
            )
          })}
        </div>

        <div class='products-footer'>
          <RouterLink to='/dashboard' variant='breadcrumb' icon='📊'>
            返回仪表板
          </RouterLink>
        </div>

        <style>
          {`
          .products {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .products-header {
            margin-bottom: 2rem;
          }
          
          .products-header h2 {
            color: #333;
            margin-bottom: 0.5rem;
          }
          
          .products-header p {
            color: #666;
            margin-bottom: 1rem;
          }
          
          .header-actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
          }
          
          .products-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
          }
          
          .stat-card {
            display: flex;
            align-items: center;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
          }
          
          .stat-icon {
            font-size: 2rem;
            margin-right: 1rem;
          }
          
          .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
          }
          
          .stat-label {
            font-size: 0.875rem;
            color: #666;
          }
          
          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }
          
          .product-card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          
          .product-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          .product-image {
            font-size: 3rem;
            text-align: center;
            margin-bottom: 1rem;
          }
          
          .product-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
            margin: 0 0 0.5rem 0;
          }
          
          .product-category {
            color: #666;
            font-size: 0.875rem;
            margin: 0 0 0.5rem 0;
          }
          
          .product-price {
            font-size: 1.25rem;
            font-weight: bold;
            color: #007bff;
            margin: 0 0 1rem 0;
          }
          
          .product-stock {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            font-size: 0.875rem;
          }
          
          .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            color: white;
            font-size: 0.75rem;
            font-weight: 500;
          }
          
          .product-actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          
          .products-footer {
            padding-top: 2rem;
            border-top: 1px solid #e0e0e0;
          }
        `}
        </style>
      </div>
    )
  },
})
