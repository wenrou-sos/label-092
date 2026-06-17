<template>
  <el-card class="reviews-card card-shadow">
    <template #header>
      <div class="card-header">
        <h3 class="card-title">
          <el-icon color="#2d5a27"><ChatDotRound /></el-icon>
          我的评价
        </h3>
      </div>
    </template>

    <div v-loading="loading" class="reviews-list">
      <template v-if="reviews.length > 0">
        <el-card
          v-for="review in reviews"
          :key="review.id"
          class="review-item card-shadow"
        >
          <div class="review-header">
            <div class="product-info" @click="goProduct(review.productId)">
              <img
                :src="getProductImage(review.productId) || defaultImage"
                :alt="review.member.name"
                class="product-thumb"
              />
              <span class="product-name text-ellipsis">{{ getProductName(review.productId) }}</span>
            </div>
            <div class="review-date">{{ formatDate(review.createdAt) }}</div>
          </div>
          <div class="review-rating">
            <el-rate v-model="review.rating" disabled :max="5" />
          </div>
          <div class="review-content" v-if="review.content">
            {{ review.content }}
          </div>
          <div class="review-images" v-if="review.images">
            <el-image
              v-for="(img, idx) in parseImages(review.images)"
              :key="idx"
              :src="img"
              :preview-src-list="parseImages(review.images)"
              :initial-index="idx"
              fit="cover"
              class="review-image"
            />
          </div>
        </el-card>
      </template>

      <el-empty v-else description="暂无评价" class="empty-state">
        <el-button type="primary" @click="goShopping">去购物</el-button>
      </el-empty>
    </div>

    <div v-if="total > pageSize" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getMyReviews } from '@/api/review';
import { getProductById } from '@/api/product';
import type { Review } from '@/types';
import { ChatDotRound } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(false);
const reviews = ref<Review[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const productCache = ref<Map<number, { name: string; image: string | null }>>(new Map());

const defaultImage = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=60&h=60&fit=crop';

let isCancelled = false;

const fetchReviews = async () => {
  loading.value = true;
  try {
    const res = await getMyReviews({
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    reviews.value = res.data;
    total.value = res.total || 0;
    if (!isCancelled) {
      fetchProductDetails(res.data);
    }
  } catch (error) {
    ElMessage.error('获取评价列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchProductDetails = async (reviewList: Review[]) => {
  const productIds = [...new Set(reviewList.map((r) => r.productId))];
  for (const id of productIds) {
    if (!productCache.value.has(id)) {
      try {
        const product = await getProductById(id);
        productCache.value.set(id, {
          name: product.name,
          image: product.image,
        });
      } catch (error) {
        console.error(`获取商品 ${id} 信息失败`, error);
      }
    }
  }
};

const getProductName = (productId: number) => {
  return productCache.value.get(productId)?.name || `商品 #${productId}`;
};

const getProductImage = (productId: number) => {
  return productCache.value.get(productId)?.image;
};

const parseImages = (images: string) => {
  try {
    return JSON.parse(images);
  } catch {
    return [images];
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN');
};

const handleSizeChange = () => {
  currentPage.value = 1;
  fetchReviews();
};

const handleCurrentChange = () => {
  fetchReviews();
};

const goProduct = (productId: number) => {
  router.push(`/products/${productId}`);
};

const goShopping = () => {
  router.push('/products');
};

onMounted(() => {
  fetchReviews();
});

onUnmounted(() => {
  isCancelled = true;
});
</script>

<style scoped>
.reviews-card {
  border: none !important;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  border: none !important;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.product-info:hover {
  opacity: 0.8;
}

.product-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  max-width: 200px;
}

.review-date {
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
}

.review-rating {
  margin-bottom: 12px;
}

.review-content {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.review-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.3s;
}

.review-image:hover {
  transform: scale(1.05);
}

.empty-state {
  padding: 60px 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

:deep(.el-button--primary) {
  background: #2d5a27;
  border-color: #2d5a27;
  border-radius: 20px;
}

:deep(.el-button--primary:hover) {
  background: #3d7a37;
  border-color: #3d7a37;
}

:deep(.el-rate__icon) {
  font-size: 18px;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).is-active) {
  background-color: #2d5a27;
}

@media (max-width: 768px) {
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .product-name {
    max-width: 180px;
  }

  .review-image {
    width: 70px;
    height: 70px;
  }
}
</style>
