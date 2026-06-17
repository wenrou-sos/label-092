<template>
  <div class="product-list-page">
    <Header />
    
    <main class="container main-content">
      <div class="page-header">
        <h1 class="page-title">
          <el-icon><Goods /></el-icon>
          茶叶商城
        </h1>
        <p class="page-desc">严选六大茶类优质茶叶，为您呈现最纯正的茶香体验</p>
      </div>

      <div class="content-layout">
        <aside class="sidebar">
          <div class="card-shadow sidebar-card">
            <div class="sidebar-title">
              <el-icon><Menu /></el-icon>
              茶类筛选
            </div>
            <div class="category-list">
              <div
                v-for="(name, key) in TeaCategoryMap"
                :key="key"
                class="category-item"
                :class="{ active: selectedCategory === key }"
                @click="handleCategoryChange(key)"
              >
                <span class="category-icon">{{ getCategoryIcon(key) }}</span>
                <span class="category-name">{{ name }}</span>
                <el-tag v-if="categoryCounts[key]" size="small" type="info">
                  {{ categoryCounts[key] }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="card-shadow sidebar-card mt-20">
            <div class="sidebar-title">
              <el-icon><TrendCharts /></el-icon>
              价格区间
            </div>
            <div class="price-range">
              <el-slider
                v-model="priceRange"
                range
                :min="0"
                :max="1000"
                :step="50"
                :marks="priceMarks"
                @change="handlePriceRangeChange"
              />
              <div class="price-display">
                <span>¥{{ priceRange[0] }}</span>
                <span>-</span>
                <span>¥{{ priceRange[1] }}</span>
              </div>
            </div>
          </div>
        </aside>

        <section class="main-section">
          <div class="card-shadow sort-bar">
            <div class="sort-left">
              <span class="sort-label">排序：</span>
              <el-radio-group v-model="sortBy" size="default" @change="handleSortChange">
                <el-radio-button value="default">综合</el-radio-button>
                <el-radio-button value="price">价格</el-radio-button>
                <el-radio-button value="score">评分</el-radio-button>
                <el-radio-button value="latest">最新</el-radio-button>
              </el-radio-group>
              <el-button
                v-if="sortBy === 'price'"
                :icon="sortOrder === 'asc' ? 'Top' : 'Bottom'"
                text
                @click="toggleSortOrder"
              >
                {{ sortOrder === 'asc' ? '升序' : '降序' }}
              </el-button>
            </div>
            <div class="sort-right">
              <span class="result-count">共 <strong>{{ total }}</strong> 件商品</span>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索商品名称..."
                class="search-input"
                clearable
                :prefix-icon="Search"
                @keyup.enter="handleSearch"
                @clear="handleSearch"
              />
            </div>
          </div>

          <div v-if="searchKeyword" class="search-tip">
            <el-tag type="success" closable @close="clearSearch">
              搜索关键词：<strong>{{ searchKeyword }}</strong>，找到 {{ total }} 个结果
            </el-tag>
          </div>

          <div v-loading="loading" class="product-grid">
            <div
              v-for="product in sortedProducts"
              :key="product.id"
              class="product-card card-shadow"
              @click="goToDetail(product.id)"
            >
              <div class="product-image-wrapper">
                <el-image
                  :src="product.image || '/placeholder-tea.jpg'"
                  :alt="product.name"
                  fit="cover"
                  lazy
                  class="product-image"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon size="48" color="#ccc"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <el-tag
                  class="category-tag"
                  :type="getCategoryTagType(product.category)"
                  size="small"
                >
                  {{ TeaCategoryMap[product.category] }}
                </el-tag>
                <el-tag
                  v-if="product.stock === 0"
                  class="stock-tag"
                  type="danger"
                  size="small"
                >
                  暂时缺货
                </el-tag>
                <el-tag
                  v-else-if="product.stock < 10"
                  class="stock-tag"
                  type="warning"
                  size="small"
                >
                  仅剩{{ product.stock }}件
                </el-tag>
              </div>

              <div class="product-info">
                <h3 class="product-name" v-html="highlightKeyword(product.name)"></h3>
                
                <div class="product-rating">
                  <el-rate
                    v-model="product.reviewScore"
                    disabled
                    allow-half
                    :max="5"
                    :show-score="true"
                    :score-template="{ value: product.reviewScore }"
                    class="rating-star"
                  />
                  <span class="rating-text">审评得分</span>
                </div>

                <div class="product-meta">
                  <div class="meta-item">
                    <el-icon size="14"><Calendar /></el-icon>
                    <span>{{ product.harvestYear }}年采摘</span>
                  </div>
                  <div class="meta-item">
                    <el-icon size="14"><Box /></el-icon>
                    <span :class="{ 'out-of-stock': product.stock === 0 }">
                      {{ product.stock > 0 ? `库存 ${product.stock}kg` : '缺货' }}
                    </span>
                  </div>
                </div>

                <div class="product-footer">
                  <div class="product-price">
                    <span class="price-label">每100g</span>
                    <span class="price-value">
                      <span class="currency">¥</span>{{ product.pricePer100g }}
                    </span>
                  </div>
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="product.stock === 0"
                    @click.stop="addToCart(product)"
                  >
                    <el-icon><ShoppingCart /></el-icon>
                    加入购物车
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <el-empty v-if="!loading && sortedProducts.length === 0" description="暂无符合条件的商品">
            <el-button type="primary" @click="resetFilters">重置筛选条件</el-button>
          </el-empty>

          <div v-if="total > 0" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[8, 12, 16, 24]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </section>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Search,
  Goods,
  Menu,
  TrendCharts,
  Picture,
  Calendar,
  Box,
  ShoppingCart,
  Top,
  Bottom,
} from '@element-plus/icons-vue';
import Header from '@/components/user/Header.vue';
import Footer from '@/components/user/Footer.vue';
import { getProducts } from '@/api/product';
import { useUserStore } from '@/stores/user';
import type { Product, TeaCategory } from '@/types';
import { TeaCategoryMap } from '@/types';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const products = ref<Product[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);
const selectedCategory = ref<TeaCategory | ''>('');
const sortBy = ref('default');
const sortOrder = ref<'asc' | 'desc'>('asc');
const searchKeyword = ref('');
const priceRange = ref([0, 1000]);
const categoryCounts = ref<Record<string, number>>({});

const priceMarks = {
  0: '¥0',
  200: '¥200',
  400: '¥400',
  600: '¥600',
  800: '¥800',
  1000: '¥1000+',
};

const sortedProducts = computed(() => {
  let result = [...products.value];

  if (priceRange.value[1] < 1000) {
    result = result.filter(
      (p) => p.pricePer100g >= priceRange.value[0] && p.pricePer100g <= priceRange.value[1]
    );
  } else {
    result = result.filter((p) => p.pricePer100g >= priceRange.value[0]);
  }

  switch (sortBy.value) {
    case 'price':
      result.sort((a, b) =>
        sortOrder.value === 'asc'
          ? a.pricePer100g - b.pricePer100g
          : b.pricePer100g - a.pricePer100g
      );
      break;
    case 'score':
      result.sort((a, b) => b.reviewScore - a.reviewScore);
      break;
    case 'latest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    default:
      break;
  }

  return result;
});

const fetchProducts = async () => {
  loading.value = true;
  try {
    const params = {
      category: selectedCategory.value || undefined,
      keyword: searchKeyword.value || undefined,
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    const res = await getProducts(params);
    products.value = res.data;
    total.value = res.total || 0;

    const counts: Record<string, number> = {};
    res.data.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    categoryCounts.value = counts;
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    green: '🍃',
    black: '☕',
    oolong: '🍵',
    white: '🌸',
    dark: '🫖',
    yellow: '🌼',
  };
  return icons[category] || '🍵';
};

const getCategoryTagType = (category: string): string => {
  const types: Record<string, string> = {
    green: 'success',
    black: 'danger',
    oolong: 'warning',
    white: 'info',
    dark: '',
    yellow: 'warning',
  };
  return types[category] || 'info';
};

const highlightKeyword = (text: string): string => {
  if (!searchKeyword.value) return text;
  const regex = new RegExp(`(${searchKeyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

const handleCategoryChange = (category: TeaCategory) => {
  selectedCategory.value = selectedCategory.value === category ? '' : category;
  currentPage.value = 1;
  fetchProducts();
};

const handleSortChange = () => {
  currentPage.value = 1;
};

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

const handlePriceRangeChange = () => {
  currentPage.value = 1;
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchProducts();
};

const clearSearch = () => {
  searchKeyword.value = '';
  currentPage.value = 1;
  fetchProducts();
};

const resetFilters = () => {
  selectedCategory.value = '';
  sortBy.value = 'default';
  sortOrder.value = 'asc';
  searchKeyword.value = '';
  priceRange.value = [0, 1000];
  currentPage.value = 1;
  fetchProducts();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchProducts();
};

const goToDetail = (id: number) => {
  router.push(`/products/${id}`);
};

const addToCart = (product: Product) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  userStore.addToCart({
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    packageType: 'loose',
    weight: 100,
    quantity: 1,
    unitPrice: product.pricePer100g,
    stock: product.stock,
  });
  ElMessage.success('已加入购物车');
};

onMounted(() => {
  const category = route.query.category as TeaCategory;
  const keyword = route.query.keyword as string;
  if (category && TeaCategoryMap[category]) {
    selectedCategory.value = category;
  }
  if (keyword) {
    searchKeyword.value = keyword;
  }
  fetchProducts();
});

watch(
  () => route.query,
  (newQuery) => {
    const category = newQuery.category as TeaCategory;
    const keyword = newQuery.keyword as string;
    if (category && TeaCategoryMap[category] && category !== selectedCategory.value) {
      selectedCategory.value = category;
      currentPage.value = 1;
      fetchProducts();
    }
    if (keyword && keyword !== searchKeyword.value) {
      searchKeyword.value = keyword;
      currentPage.value = 1;
      fetchProducts();
    }
  }
);
</script>

<style scoped>
.product-list-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 40px;
}

.page-header {
  padding: 30px 0 20px;
  text-align: center;
}

.page-header .page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 28px;
  margin-bottom: 8px;
}

.page-desc {
  color: #666;
  font-size: 14px;
}

.content-layout {
  display: flex;
  gap: 24px;
  margin-top: 20px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.sidebar-card {
  padding: 20px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2d5a27;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item:hover {
  background: #f5f5f5;
}

.category-item.active {
  background: #2d5a27;
  color: #fff;
}

.category-item.active .el-tag {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  border-color: transparent !important;
}

.category-icon {
  font-size: 18px;
}

.category-name {
  flex: 1;
  font-size: 14px;
}

.price-range {
  padding: 10px 0;
}

.price-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.price-display span:nth-child(2) {
  color: #999;
}

.main-section {
  flex: 1;
  min-width: 0;
}

.sort-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.sort-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-label {
  color: #666;
  font-size: 14px;
}

.sort-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.result-count {
  font-size: 14px;
  color: #666;
}

.result-count strong {
  color: #2d5a27;
  font-size: 16px;
  margin: 0 4px;
}

.search-input {
  width: 220px;
}

.search-tip {
  margin-bottom: 16px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  min-height: 400px;
}

.product-card {
  overflow: hidden;
  background: #fff;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.category-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  font-weight: 500;
}

.stock-tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.4;
  min-height: 44px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.highlight {
  color: #e6a23c;
  font-weight: 600;
  background: #fdf6ec;
  padding: 0 2px;
  border-radius: 2px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.rating-star {
  --el-rate-default-color: #ddd;
}

.rating-text {
  font-size: 12px;
  color: #999;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.meta-item .out-of-stock {
  color: #f56c6c;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-label {
  font-size: 12px;
  color: #999;
}

.price-value {
  font-size: 22px;
  font-weight: 700;
  color: #e6a23c;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency {
  font-size: 14px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .category-list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .category-item {
    flex: 1;
    min-width: calc(33.33% - 8px);
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .sort-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-left,
  .sort-right {
    justify-content: space-between;
  }

  .search-input {
    width: 100%;
  }

  .category-item {
    min-width: calc(50% - 8px);
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .product-name {
    font-size: 14px;
    min-height: 40px;
  }

  .price-value {
    font-size: 18px;
  }

  .product-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .product-footer .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .category-item {
    min-width: 100%;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
