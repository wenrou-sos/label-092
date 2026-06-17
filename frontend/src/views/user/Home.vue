<template>
  <div class="home">
    <Header />

    <section class="banner-section">
      <el-carousel height="500px" :interval="4000" arrow="always">
        <el-carousel-item v-for="(banner, index) in banners" :key="index">
          <div class="banner-item" :style="{ backgroundImage: `url(${banner.image})` }">
            <div class="banner-content">
              <h2 class="banner-title">{{ banner.title }}</h2>
              <p class="banner-subtitle">{{ banner.subtitle }}</p>
              <el-button type="primary" size="large" @click="handleBannerClick(banner.link)">
                {{ banner.buttonText }}
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <section class="category-section container">
      <div class="section-header">
        <h3 class="section-title">六大茶类</h3>
        <p class="section-subtitle">品味中华茶文化的精髓</p>
      </div>
      <div class="category-grid">
        <div
          v-for="(category, key) in TeaCategoryMap"
          :key="key"
          class="category-card"
          @click="navigateToCategory(key)"
        >
          <div class="category-icon-wrapper" :class="`icon-${key}`">
            <el-icon :size="36">
              <component :is="categoryIcons[key as TeaCategory]" />
            </el-icon>
          </div>
          <h4 class="category-name">{{ category }}</h4>
          <p class="category-desc">{{ categoryDesc[key as TeaCategory] }}</p>
        </div>
      </div>
    </section>

    <section class="products-section container">
      <div class="section-header">
        <h3 class="section-title">精选茶叶</h3>
        <p class="section-subtitle">严选优质好茶，品味生活之美</p>
      </div>
      <div v-loading="productsLoading" class="products-grid">
        <el-card
          v-for="product in products"
          :key="product.id"
          class="product-card card-shadow"
          @click="navigateToProduct(product.id)"
        >
          <div class="product-image">
            <img :src="product.image || defaultProductImage" :alt="product.name" />
            <el-tag v-if="product.reviewScore >= 4.8" type="warning" class="hot-tag">
              <el-icon><Star /></el-icon> 精选
            </el-tag>
          </div>
          <div class="product-info">
            <h4 class="product-name text-ellipsis">{{ product.name }}</h4>
            <div class="product-category">
              <el-tag size="small">{{ TeaCategoryMap[product.category] }}</el-tag>
            </div>
            <div class="product-rating">
              <el-rate v-model="product.reviewScore" disabled :max="5" :show-score="true" />
            </div>
            <div class="product-footer">
              <div class="product-price">
                <span class="price-label">¥</span>
                <span class="price-value">{{ product.pricePer100g }}</span>
                <span class="price-unit">/100g</span>
              </div>
              <el-button type="primary" size="small" @click.stop="handleAddCart(product)">
                加入购物车
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
      <div class="section-more">
        <el-button type="primary" plain @click="navigateToProducts">
          查看更多 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </section>

    <section class="events-section">
      <div class="container">
        <div class="section-header">
          <h3 class="section-title light">品鉴会活动</h3>
          <p class="section-subtitle light">与茶友相聚，共品香茗</p>
        </div>
        <div v-loading="eventsLoading" class="events-grid">
          <el-card
            v-for="event in events"
            :key="event.id"
            class="event-card card-shadow"
            @click="navigateToEvent(event.id)"
          >
            <div class="event-image">
              <img :src="event.image || defaultEventImage" :alt="event.title" />
              <div class="event-status">
                <el-tag :type="eventStatusType(event.status)" effect="dark">
                  {{ TastingStatusMap[event.status] }}
                </el-tag>
              </div>
            </div>
            <div class="event-info">
              <h4 class="event-title text-ellipsis">{{ event.title }}</h4>
              <div class="event-meta">
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatDate(event.eventDate) }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Location /></el-icon>
                  <span class="text-ellipsis">{{ event.location }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ event.currentParticipants }}/{{ event.maxParticipants }}人</span>
                </div>
              </div>
              <p class="event-desc">{{ event.description }}</p>
              <div class="event-footer">
                <div class="event-host">
                  <el-icon><Avatar /></el-icon>
                  <span>主持人：{{ event.host }}</span>
                </div>
                <el-button
                  type="primary"
                  size="small"
                  :disabled="event.status !== 'upcoming'"
                  @click.stop="handleRegisterEvent(event.id)"
                >
                  立即报名
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
        <div class="section-more">
          <el-button type="success" plain @click="navigateToEvents">
            更多活动 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </section>

    <section class="member-section container">
      <div class="section-header">
        <h3 class="section-title">会员权益</h3>
        <p class="section-subtitle">尊享专属礼遇，品味非凡人生</p>
      </div>
      <div class="member-grid">
        <div class="member-card card-shadow" v-for="(benefit, index) in memberBenefits" :key="index">
          <div class="member-icon" :style="{ background: benefit.bgColor }">
            <el-icon :size="32" :color="benefit.iconColor">
              <component :is="benefit.icon" />
            </el-icon>
          </div>
          <h4 class="member-title">{{ benefit.title }}</h4>
          <p class="member-desc">{{ benefit.desc }}</p>
        </div>
      </div>
      <div class="member-cta">
        <el-button type="primary" size="large" @click="navigateToMember">
          立即加入会员 <el-icon><Coin /></el-icon>
        </el-button>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import Header from '@/components/user/Header.vue';
import Footer from '@/components/user/Footer.vue';
import { getProducts } from '@/api/product';
import { getEvents } from '@/api/tasting';
import { useUserStore } from '@/stores/user';
import {
  TeaCategoryMap,
  TeaCategory,
  TastingStatusMap,
  TastingStatus,
  type Product,
  type TastingEvent,
} from '@/types';
import dayjs from 'dayjs';
import {
  IceTea,
  HotWater,
  Sunny,
  ColdDrink,
  MoonNight,
  Sunrise,
  Star,
  ArrowRight,
  Calendar,
  Location,
  User,
  Avatar,
  Coin,
  Discount,
  Present,
  Medal,
  Coffee,
} from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

const productsLoading = ref(false);
const eventsLoading = ref(false);
const products = ref<Product[]>([]);
const events = ref<TastingEvent[]>([]);

const defaultProductImage = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop';
const defaultEventImage = 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=250&fit=crop';

const banners = [
  {
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=1920&h=500&fit=crop',
    title: '春茶新上市',
    subtitle: '明前龙井，鲜嫩清香，品味春天的味道',
    buttonText: '立即选购',
    link: '/products?category=green',
  },
  {
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1920&h=500&fit=crop',
    title: '品鉴会邀请',
    subtitle: '与茶艺大师面对面，感受茶文化的魅力',
    buttonText: '报名参加',
    link: '/tastings',
  },
  {
    image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=1920&h=500&fit=crop',
    title: '会员专享',
    subtitle: '注册即送100积分，购物享专属折扣',
    buttonText: '加入会员',
    link: '/register',
  },
];

const categoryIcons: Record<TeaCategory, any> = {
  green: IceTea,
  black: HotWater,
  oolong: Sunny,
  white: ColdDrink,
  dark: MoonNight,
  yellow: Sunrise,
};

const categoryDesc: Record<TeaCategory, string> = {
  green: '清香鲜爽，回甘持久',
  black: '醇厚甘甜，香气浓郁',
  oolong: '香气馥郁，滋味醇厚',
  white: '清甜鲜爽，毫香明显',
  dark: '陈香浓郁，顺滑甘醇',
  yellow: '甘醇鲜爽，香气清悦',
};

const memberBenefits = [
  {
    icon: Discount,
    title: '专属折扣',
    desc: '最高享8折优惠，钻石会员更有专属礼遇',
    bgColor: 'linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%)',
    iconColor: '#fff',
  },
  {
    icon: Present,
    title: '生日好礼',
    desc: '生日当月赠送精美茶叶礼盒，双倍积分',
    bgColor: 'linear-gradient(135deg, #c9a227 0%, #d4b237 100%)',
    iconColor: '#fff',
  },
  {
    icon: Medal,
    title: '积分兑换',
    desc: '消费累计积分，可兑换精选茶叶和周边',
    bgColor: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
    iconColor: '#fff',
  },
  {
    icon: Coffee,
    title: '品鉴优先',
    desc: '优先预约品鉴会，专属茶艺体验活动',
    bgColor: 'linear-gradient(135deg, #5d4037 0%, #795548 100%)',
    iconColor: '#fff',
  },
];

const fetchProducts = async () => {
  productsLoading.value = true;
  try {
    const res = await getProducts({ pageSize: 6 });
    products.value = res.data;
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  } finally {
    productsLoading.value = false;
  }
};

const fetchEvents = async () => {
  eventsLoading.value = true;
  try {
    const res = await getEvents({ status: 'upcoming', pageSize: 3 });
    events.value = res.data;
  } catch (error) {
    ElMessage.error('获取活动列表失败');
  } finally {
    eventsLoading.value = false;
  }
};

const handleBannerClick = (link: string) => {
  router.push(link);
};

const navigateToCategory = (category: string) => {
  router.push(`/products?category=${category}`);
};

const navigateToProduct = (id: number) => {
  router.push(`/products/${id}`);
};

const navigateToProducts = () => {
  router.push('/products');
};

const navigateToEvent = (id: number) => {
  router.push(`/tastings/${id}`);
};

const navigateToEvents = () => {
  router.push('/tastings');
};

const navigateToMember = () => {
  if (userStore.isLoggedIn) {
    router.push('/member');
  } else {
    router.push('/login');
  }
};

const handleAddCart = (product: Product) => {
  userStore.addToCart({
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    packageType: 'loose',
    weight: product.minWeight,
    quantity: 1,
    unitPrice: product.pricePer100g,
    stock: product.stock,
  });
  ElMessage.success('已加入购物车');
};

const handleRegisterEvent = (eventId: number) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  router.push(`/tastings/${eventId}`);
};

const eventStatusType = (status: TastingStatus) => {
  switch (status) {
    case 'upcoming':
      return 'success';
    case 'ongoing':
      return 'primary';
    case 'completed':
      return 'info';
    case 'cancelled':
      return 'danger';
    default:
      return '';
  }
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

onMounted(() => {
  fetchProducts();
  fetchEvents();
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.banner-section {
  position: relative;
}

.banner-item {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(45, 90, 39, 0.7) 0%, rgba(0, 0, 0, 0.3) 100%);
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 15%;
  transform: translateY(-50%);
  color: #fff;
  max-width: 500px;
}

.banner-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-subtitle {
  font-size: 20px;
  margin-bottom: 32px;
  opacity: 0.95;
}

.banner-content :deep(.el-button--primary) {
  background: #c9a227;
  border-color: #c9a227;
  padding: 12px 40px;
  font-size: 16px;
  border-radius: 30px;
}

.banner-content :deep(.el-button--primary:hover) {
  background: #d4b237;
  border-color: #d4b237;
}

.section-header {
  text-align: center;
  padding: 60px 0 40px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d5a27;
  margin-bottom: 12px;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #c9a227;
  border-radius: 2px;
}

.section-title.light {
  color: #fff;
}

.section-title.light::after {
  background: #c9a227;
}

.section-subtitle {
  font-size: 16px;
  color: #666;
  margin-top: 20px;
}

.section-subtitle.light {
  color: rgba(255, 255, 255, 0.8);
}

.section-more {
  text-align: center;
  margin-top: 40px;
}

.section-more :deep(.el-button) {
  padding: 12px 40px;
  border-radius: 30px;
}

.category-section {
  padding-bottom: 60px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px;
}

.category-card {
  text-align: center;
  padding: 32px 20px;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(45, 90, 39, 0.15);
  border-color: #2d5a27;
}

.category-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #fff;
  transition: transform 0.3s ease;
}

.category-card:hover .category-icon-wrapper {
  transform: scale(1.1);
}

.icon-green {
  background: linear-gradient(135deg, #81c784 0%, #4caf50 100%);
}

.icon-black {
  background: linear-gradient(135deg, #e57373 0%, #f44336 100%);
}

.icon-oolong {
  background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
}

.icon-white {
  background: linear-gradient(135deg, #b3e5fc 0%, #03a9f4 100%);
}

.icon-dark {
  background: linear-gradient(135deg, #9575cd 0%, #673ab7 100%);
}

.icon-yellow {
  background: linear-gradient(135deg, #fff176 0%, #ffeb3b 100%);
  color: #333 !important;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.category-desc {
  font-size: 13px;
  color: #999;
}

.products-section {
  padding-bottom: 60px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.product-card {
  overflow: hidden;
  border: none !important;
}

.product-image {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

.hot-tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.product-category {
  margin-bottom: 12px;
}

.product-rating {
  margin-bottom: 16px;
}

.product-rating :deep(.el-rate__text) {
  color: #c9a227;
  font-size: 14px;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-label {
  font-size: 14px;
  color: #c9a227;
}

.price-value {
  font-size: 24px;
  font-weight: 700;
  color: #c9a227;
}

.price-unit {
  font-size: 12px;
  color: #999;
}

.product-footer :deep(.el-button--primary) {
  background: #2d5a27;
  border-color: #2d5a27;
  border-radius: 20px;
  padding: 8px 20px;
}

.product-footer :deep(.el-button--primary:hover) {
  background: #3d7a37;
  border-color: #3d7a37;
}

.events-section {
  background: linear-gradient(135deg, #2d5a27 0%, #1a3a17 100%);
  padding-bottom: 60px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.event-card {
  overflow: hidden;
  border: none !important;
}

.event-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.08);
}

.event-status {
  position: absolute;
  top: 12px;
  left: 12px;
}

.event-info {
  padding: 20px;
}

.event-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.meta-item .el-icon {
  color: #2d5a27;
}

.event-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.event-host {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.event-host .el-icon {
  color: #c9a227;
}

.event-footer :deep(.el-button--primary) {
  background: #2d5a27;
  border-color: #2d5a27;
  border-radius: 20px;
}

.event-footer :deep(.el-button--primary:hover) {
  background: #3d7a37;
  border-color: #3d7a37;
}

.events-section .section-more :deep(.el-button) {
  border-color: #c9a227;
  color: #c9a227;
}

.events-section .section-more :deep(.el-button:hover) {
  background: #c9a227;
  color: #fff;
}

.member-section {
  padding-bottom: 60px;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.member-card {
  text-align: center;
  padding: 40px 24px;
  transition: all 0.3s ease;
}

.member-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.member-icon {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.member-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.member-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.member-cta {
  text-align: center;
  margin-top: 48px;
}

.member-cta :deep(.el-button--primary) {
  background: linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%);
  border: none;
  padding: 14px 48px;
  font-size: 16px;
  border-radius: 30px;
}

.member-cta :deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #3d7a37 0%, #4d8a47 100%);
}

@media (max-width: 1024px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .products-grid,
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .member-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .banner-title {
    font-size: 32px;
  }

  .banner-subtitle {
    font-size: 16px;
  }

  .category-grid,
  .products-grid,
  .events-grid,
  .member-grid {
    grid-template-columns: 1fr;
  }
}
</style>
