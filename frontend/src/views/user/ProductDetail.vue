<template>
  <div class="product-detail-page">
    <Header />
    <main class="container main-content">
      <div v-loading="loading" class="detail-wrapper">
        <div class="product-main card-shadow p-20">
          <div class="product-gallery">
            <el-carousel height="500px" arrow="always" :interval="4000">
              <el-carousel-item v-for="(img, idx) in productImages" :key="idx">
                <div class="image-container">
                  <img :src="img" :alt="product?.name" class="product-image" />
                </div>
              </el-carousel-item>
            </el-carousel>
            <div class="thumbnail-list">
              <div
                v-for="(img, idx) in productImages"
                :key="idx"
                class="thumbnail-item"
                :class="{ active: activeThumb === idx }"
                @click="activeThumb = idx"
              >
                <img :src="img" alt="" />
              </div>
            </div>
          </div>
          <div class="product-info">
            <div class="product-header">
              <h1 class="product-name">{{ product?.name }}</h1>
              <div class="product-tags">
                <el-tag type="success" effect="dark" size="large">
                  {{ TeaCategoryMap[product?.category || 'green'] }}
                </el-tag>
                <el-tag type="warning" effect="dark" size="large" class="score-tag">
                  <el-icon><Star /></el-icon>
                  审评得分 {{ product?.reviewScore }}
                </el-tag>
              </div>
            </div>
            <div class="price-section">
              <div class="price-row">
                <span class="price-label">散茶称重</span>
                <span class="price-value">
                  <span class="currency">¥</span>
                  <span class="price">{{ product?.pricePer100g }}</span>
                  <span class="unit">/100g</span>
                </span>
              </div>
              <div class="price-row" v-if="product?.boxPrice">
                <span class="price-label">盒装</span>
                <span class="price-value">
                  <span class="currency">¥</span>
                  <span class="price">{{ product.boxPrice }}</span>
                  <span class="unit">/盒</span>
                </span>
              </div>
              <div class="price-row" v-if="product?.giftBoxPrice">
                <span class="price-label">礼盒装</span>
                <span class="price-value">
                  <span class="currency">¥</span>
                  <span class="price">{{ product.giftBoxPrice }}</span>
                  <span class="unit">/盒</span>
                </span>
              </div>
            </div>
            <div class="purchase-section">
              <div class="option-group">
                <label class="option-label">包装类型</label>
                <div class="option-items">
                  <div
                    v-for="type in availablePackageTypes"
                    :key="type"
                    class="option-item"
                    :class="{ active: selectedPackage === type }"
                    @click="selectPackage(type)"
                  >
                    {{ PackageTypeMap[type] }}
                  </div>
                </div>
              </div>
              <div class="option-group" v-if="selectedPackage === 'loose'">
                <label class="option-label">选择重量</label>
                <div class="weight-selector">
                  <el-input-number
                    v-model="selectedWeight"
                    :min="product?.minWeight || 100"
                    :max="5000"
                    :step="50"
                    size="large"
                    :controls="true"
                  />
                  <span class="weight-unit">克 (g)</span>
                </div>
                <div class="weight-tips">
                  起购 {{ product?.minWeight || 100 }}g，每次可增加50g
                </div>
              </div>
              <div class="option-group">
                <label class="option-label">购买数量</label>
                <el-input-number
                  v-model="quantity"
                  :min="1"
                  :max="product?.stock || 99"
                  size="large"
                />
              </div>
              <div class="total-price">
                <span class="total-label">合计：</span>
                <span class="total-value">
                  <span class="currency">¥</span>
                  <span class="price">{{ calculatedTotal.toFixed(2) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="product-detail-section card-shadow">
          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="产区故事" name="origin">
              <div class="tab-content">
                <h3 class="tab-title">
                  <el-icon><Location /></el-icon>
                  产区故事
                </h3>
                <div class="tab-text">{{ product?.originStory }}</div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="采摘年份" name="harvest">
              <div class="tab-content">
                <h3 class="tab-title">
                  <el-icon><Calendar /></el-icon>
                  采摘年份
                </h3>
                <div class="harvest-info">
                  <el-timeline>
                    <el-timeline-item
                      :timestamp="`${product?.harvestYear}年`"
                      placement="top"
                      type="success"
                    >
                      <el-card>
                        <h4>{{ product?.harvestYear }}年春茶</h4>
                        <p>精选当年明前嫩芽，严格把控采摘时间与品质标准。</p>
                        <p>每一片茶叶都来自高海拔茶园，云雾缭绕，昼夜温差大，茶叶内含物质丰富。</p>
                      </el-card>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="制作工艺" name="process">
              <div class="tab-content">
                <h3 class="tab-title">
                  <el-icon><Tools /></el-icon>
                  制作工艺
                </h3>
                <div class="tab-text">{{ product?.process }}</div>
              </div>
            </el-tab-pane>
            <el-tab-pane :label="`用户评价 (${reviewCount})`" name="reviews">
              <div class="tab-content">
                <h3 class="tab-title">
                  <el-icon><ChatDotRound /></el-icon>
                  用户评价
                </h3>
                <div v-loading="reviewsLoading" class="reviews-list">
                  <div v-if="reviews.length === 0" class="empty-reviews">
                    <el-empty description="暂无评价" />
                  </div>
                  <div v-else>
                    <div
                      v-for="review in reviews"
                      :key="review.id"
                      class="review-item"
                    >
                      <div class="review-header">
                        <div class="review-user">
                          <el-avatar size="40" :icon="UserFilled" />
                          <div class="user-info">
                            <span class="user-name">{{ review.member.name }}</span>
                            <span class="review-time">
                              {{ formatDate(review.createdAt) }}
                            </span>
                          </div>
                        </div>
                        <div class="review-rating">
                          <el-rate
                            v-model="review.rating"
                            disabled
                            size="small"
                            text-color="#ff9900"
                          />
                        </div>
                      </div>
                      <div class="review-content">{{ review.content }}</div>
                      <div v-if="review.images" class="review-images">
                        <img
                          v-for="(img, idx) in parseImages(review.images)"
                          :key="idx"
                          :src="img"
                          alt="评价图片"
                          class="review-image"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="reviews.length > 0" class="pagination-wrapper">
                  <el-pagination
                    v-model:current-page="reviewPage"
                    v-model:page-size="reviewPageSize"
                    :total="reviewCount"
                    layout="prev, pager, next, total"
                    background
                    @current-change="loadReviews"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </main>
    <div class="bottom-action-bar">
      <div class="container action-bar-inner">
        <div class="action-left">
          <div class="bar-total">
            <span class="bar-label">合计：</span>
            <span class="bar-price">
              <span class="currency">¥</span>
              <span class="price">{{ calculatedTotal.toFixed(2) }}</span>
            </span>
          </div>
        </div>
        <div class="action-right">
          <el-button size="large" type="warning" @click="addToCart">
            <el-icon><ShoppingCart /></el-icon>
            加入购物车
          </el-button>
          <el-button size="large" type="success" @click="buyNow">
            立即购买
          </el-button>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Star,
  Location,
  Calendar,
  Tools,
  ChatDotRound,
  UserFilled,
  ShoppingCart,
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import Header from '@/components/user/Header.vue';
import Footer from '@/components/user/Footer.vue';
import {
  getProductById,
  getProductReviews,
} from '@/api/product';
import {
  Product,
  Review,
  TeaCategoryMap,
  PackageType,
  PackageTypeMap,
  CartItem,
} from '@/types';
import { useUserStore } from '@/stores/user';
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);
const reviewsLoading = ref(false);
const product = ref<Product | null>(null);
const reviews = ref<Review[]>([]);
const reviewCount = ref(0);
const activeTab = ref('origin');
const activeThumb = ref(0);
const selectedPackage = ref<PackageType>('loose');
const selectedWeight = ref(100);
const quantity = ref(1);
const reviewPage = ref(1);
const reviewPageSize = ref(5);
const productImages = computed(() => {
  const images: string[] = [];
  if (product.value?.image) {
    images.push(product.value.image);
  }
  if (images.length === 0) {
    images.push('https://via.placeholder.com/600x500/2d5a27/ffffff?text=' + encodeURIComponent(product.value?.name || '茶叶'));
  }
  return images;
});
const availablePackageTypes = computed((): PackageType[] => {
  const types: PackageType[] = ['loose'];
  if (product.value?.boxPrice) {
    types.push('box');
  }
  if (product.value?.giftBoxPrice) {
    types.push('giftbox');
  }
  return types;
});
const unitPrice = computed(() => {
  if (!product.value) return 0;
  switch (selectedPackage.value) {
    case 'box':
      return product.value.boxPrice || 0;
    case 'giftbox':
      return product.value.giftBoxPrice || 0;
    case 'loose':
    default:
      return (product.value.pricePer100g * selectedWeight.value) / 100;
  }
});
const calculatedTotal = computed(() => {
  return unitPrice.value * quantity.value;
});
const selectPackage = (type: PackageType) => {
  selectedPackage.value = type;
  if (type !== 'loose') {
    selectedWeight.value = 100;
  }
};
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};
const parseImages = (images: string) => {
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
};
const loadProduct = async () => {
  const id = route.params.id as string;
  if (!id) return;
  loading.value = true;
  try {
    const res = await getProductById(Number(id));
    product.value = res.product;
    reviews.value = res.reviews || [];
    reviewCount.value = res.reviewCount || 0;
    if (product.value) {
      selectedWeight.value = product.value.minWeight || 100;
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载商品详情失败');
  } finally {
    loading.value = false;
  }
};
const loadReviews = async () => {
  const id = route.params.id as string;
  if (!id) return;
  reviewsLoading.value = true;
  try {
    const res = await getProductReviews(Number(id), {
      page: reviewPage.value,
      pageSize: reviewPageSize.value,
    });
    reviews.value = res.data;
    reviewCount.value = res.total || 0;
  } catch (error: any) {
    ElMessage.error(error.message || '加载评价失败');
  } finally {
    reviewsLoading.value = false;
  }
};
const addToCart = () => {
  if (!product.value) return;
  const cartItem: CartItem = {
    productId: product.value.id,
    productName: product.value.name,
    productImage: product.value.image,
    packageType: selectedPackage.value,
    weight: selectedPackage.value === 'loose' ? selectedWeight.value : 0,
    quantity: quantity.value,
    unitPrice: unitPrice.value,
    stock: product.value.stock,
  };
  userStore.addToCart(cartItem);
  ElMessage.success('已加入购物车');
};
const buyNow = () => {
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录后再购买', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        window.location.href = '/login';
      })
      .catch(() => {});
    return;
  }
  if (!product.value) return;
  const cartItem: CartItem = {
    productId: product.value.id,
    productName: product.value.name,
    productImage: product.value.image,
    packageType: selectedPackage.value,
    weight: selectedPackage.value === 'loose' ? selectedWeight.value : 0,
    quantity: quantity.value,
    unitPrice: unitPrice.value,
    stock: product.value.stock,
  };
  userStore.addToCart(cartItem);
  window.location.href = '/cart';
};
onMounted(() => {
  loadProduct();
});
</script>
<style scoped>
.product-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}
.main-content {
  padding-top: 20px;
}
.detail-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.product-main {
  display: flex;
  gap: 40px;
  background: #fff;
}
.product-gallery {
  width: 500px;
  flex-shrink: 0;
}
.image-container {
  width: 100%;
  height: 500px;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
}
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumbnail-list {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}
.thumbnail-item {
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}
.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumbnail-item.active {
  border-color: #2d5a27;
}
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.product-header {
  margin-bottom: 20px;
}
.product-name {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.4;
}
.product-tags {
  display: flex;
  gap: 12px;
}
.score-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}
.price-section {
  background: linear-gradient(135deg, #fdf6e3 0%, #faf0d7 100%);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
}
.price-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.price-row:last-child {
  margin-bottom: 0;
}
.price-label {
  width: 80px;
  font-size: 14px;
  color: #666;
}
.price-value {
  display: flex;
  align-items: baseline;
}
.currency {
  font-size: 18px;
  color: #e74c3c;
  font-weight: 600;
}
.price {
  font-size: 32px;
  font-weight: 700;
  color: #e74c3c;
  line-height: 1;
}
.unit {
  font-size: 14px;
  color: #999;
  margin-left: 5px;
}
.purchase-section {
  flex: 1;
}
.option-group {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}
.option-label {
  width: 80px;
  font-size: 14px;
  color: #666;
  padding-top: 8px;
  flex-shrink: 0;
}
.option-items {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.option-item {
  padding: 10px 20px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #333;
  background: #fff;
}
.option-item:hover {
  border-color: #2d5a27;
  color: #2d5a27;
}
.option-item.active {
  border-color: #2d5a27;
  background: #2d5a27;
  color: #fff;
}
.weight-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}
.weight-unit {
  font-size: 14px;
  color: #666;
}
.weight-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}
.total-price {
  display: flex;
  align-items: center;
  padding-top: 20px;
  border-top: 1px dashed #e8e8e8;
  margin-top: 10px;
}
.total-label {
  font-size: 14px;
  color: #666;
}
.total-value {
  display: flex;
  align-items: baseline;
}
.total-value .currency {
  font-size: 20px;
}
.total-value .price {
  font-size: 36px;
}
.product-detail-section {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
.detail-tabs {
  padding: 0 20px;
}
.tab-content {
  padding: 30px 20px;
}
.tab-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d5a27;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.tab-text {
  font-size: 15px;
  line-height: 2;
  color: #555;
  white-space: pre-wrap;
}
.harvest-info {
  max-width: 600px;
}
.reviews-list {
  min-height: 200px;
}
.review-item {
  padding: 25px 0;
  border-bottom: 1px solid #f0f0f0;
}
.review-item:last-child {
  border-bottom: none;
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}
.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.user-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.review-time {
  font-size: 12px;
  color: #999;
}
.review-content {
  font-size: 14px;
  line-height: 1.8;
  color: #555;
  margin-bottom: 15px;
}
.review-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.review-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.3s;
}
.review-image:hover {
  transform: scale(1.05);
}
.empty-reviews {
  padding: 60px 0;
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 30px;
}
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
}
.action-bar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}
.action-left {
  display: flex;
  align-items: center;
}
.bar-total {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.bar-label {
  font-size: 14px;
  color: #666;
}
.bar-price {
  display: flex;
  align-items: baseline;
}
.bar-price .currency {
  font-size: 18px;
}
.bar-price .price {
  font-size: 30px;
}
.action-right {
  display: flex;
  gap: 15px;
}
.action-right .el-button {
  min-width: 140px;
  height: 48px;
  font-size: 16px;
  border-radius: 24px;
}
:deep(.el-tabs__header) {
  margin: 0;
}
:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 30px;
  height: 60px;
  line-height: 60px;
}
:deep(.el-tabs__active-bar) {
  background-color: #2d5a27;
}
:deep(.el-tabs__item.is-active) {
  color: #2d5a27;
}
:deep(.el-tabs__item:hover) {
  color: #2d5a27;
}
:deep(.el-input-number) {
  --el-input-number-control-bg: #fff;
}
:deep(.el-carousel__arrow) {
  width: 40px;
  height: 40px;
  font-size: 20px;
  background: rgba(0, 0, 0, 0.3);
}
:deep(.el-carousel__arrow:hover) {
  background: rgba(0, 0, 0, 0.5);
}
</style>
