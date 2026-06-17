<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h2 class="page-title">控制台</h2>
      <p class="page-subtitle">欢迎回来，查看今日运营数据</p>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card card-shadow" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon icon-order">
              <el-icon :size="32"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayOrders }}</div>
              <div class="stat-label">今日订单</div>
              <div class="stat-trend up">
                <el-icon><ArrowUp /></el-icon>
                <span>12.5%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card card-shadow" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon icon-sales">
              <el-icon :size="32"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ stats.todaySales.toFixed(2) }}</div>
              <div class="stat-label">今日销售额</div>
              <div class="stat-trend up">
                <el-icon><ArrowUp /></el-icon>
                <span>8.3%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card card-shadow" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon icon-member">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalMembers }}</div>
              <div class="stat-label">会员总数</div>
              <div class="stat-trend up">
                <el-icon><ArrowUp /></el-icon>
                <span>5.2%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card card-shadow" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon icon-product">
              <el-icon :size="32"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalProducts }}</div>
              <div class="stat-label">商品总数</div>
              <div class="stat-trend down">
                <el-icon><ArrowDown /></el-icon>
                <span>1.1%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :lg="16" :md="24" :sm="24" :xs="24">
        <el-card class="chart-card card-shadow">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近订单</span>
              <el-button type="primary" link @click="viewAllOrders">
                查看全部 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <el-table :data="recentOrders" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="订单号" width="120" />
            <el-table-column prop="memberName" label="会员" width="120" />
            <el-table-column prop="productName" label="商品" min-width="150" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="totalAmount" label="金额" width="100">
              <template #default="{ row }">
                <span class="amount">¥{{ row.totalAmount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="时间" width="160" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :lg="8" :md="24" :sm="24" :xs="24">
        <el-card class="chart-card card-shadow">
          <template #header>
            <div class="card-header">
              <span class="card-title">热销商品排行</span>
            </div>
          </template>
          <div class="ranking-list" v-loading="loading">
            <div
              v-for="(item, index) in hotProducts"
              :key="item.id"
              class="ranking-item"
            >
              <div class="ranking-number" :class="`rank-${index + 1}`">
                {{ index + 1 }}
              </div>
              <div class="ranking-info">
                <div class="ranking-name text-ellipsis">{{ item.name }}</div>
                <div class="ranking-meta">
                  <span class="sales-count">销量: {{ item.salesCount }}</span>
                </div>
              </div>
              <div class="ranking-amount">
                ¥{{ item.salesAmount.toFixed(2) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card class="chart-card card-shadow">
          <template #header>
            <div class="card-header">
              <span class="card-title">本周销售趋势</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button value="line">折线图</el-radio-button>
                <el-radio-button value="bar">柱状图</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="salesChartOption" autoresize />
          </div>
        </el-card>
      </el-col>
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card class="chart-card card-shadow">
          <template #header>
            <div class="card-header">
              <span class="card-title">商品分类销售占比</span>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="categoryChartOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  ShoppingCart,
  Money,
  User,
  Goods,
  ArrowUp,
  ArrowDown,
  ArrowRight,
} from '@element-plus/icons-vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
} from 'echarts/components';

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
]);

const router = useRouter();
const loading = ref(false);
const chartType = ref<'line' | 'bar'>('line');

const stats = reactive({
  todayOrders: 128,
  todaySales: 28560.5,
  totalMembers: 3256,
  totalProducts: 186,
});

const recentOrders = ref([
  {
    id: 'ORD20240115001',
    memberName: '张三',
    productName: '西湖龙井特级',
    quantity: 2,
    totalAmount: 596.0,
    status: 'paid',
    createTime: '2024-01-15 14:30:25',
  },
  {
    id: 'ORD20240115002',
    memberName: '李四',
    productName: '正山小种红茶',
    quantity: 1,
    totalAmount: 268.0,
    status: 'shipped',
    createTime: '2024-01-15 13:15:42',
  },
  {
    id: 'ORD20240115003',
    memberName: '王五',
    productName: '安溪铁观音清香型',
    quantity: 3,
    totalAmount: 894.0,
    status: 'completed',
    createTime: '2024-01-15 11:20:18',
  },
  {
    id: 'ORD20240115004',
    memberName: '赵六',
    productName: '白毫银针福鼎白茶',
    quantity: 1,
    totalAmount: 458.0,
    status: 'paid',
    createTime: '2024-01-15 10:05:33',
  },
  {
    id: 'ORD20240115005',
    memberName: '钱七',
    productName: '云南普洱熟茶饼',
    quantity: 2,
    totalAmount: 716.0,
    status: 'pending',
    createTime: '2024-01-15 09:30:15',
  },
]);

const hotProducts = ref([
  { id: 1, name: '西湖龙井特级', salesCount: 328, salesAmount: 98400.0 },
  { id: 2, name: '正山小种红茶', salesCount: 256, salesAmount: 68608.0 },
  { id: 3, name: '安溪铁观音清香型', salesCount: 218, salesAmount: 65084.0 },
  { id: 4, name: '云南普洱熟茶饼', salesCount: 189, salesAmount: 67662.0 },
  { id: 5, name: '白毫银针福鼎白茶', salesCount: 156, salesAmount: 71448.0 },
  { id: 6, name: '武夷山大红袍', salesCount: 134, salesAmount: 57752.0 },
]);

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const salesData = [12500, 15800, 13200, 18900, 21500, 28560, 25800];
const orderData = [45, 62, 52, 78, 85, 128, 106];

const salesChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(45, 90, 39, 0.9)',
    borderColor: '#2d5a27',
    textStyle: { color: '#fff' },
  },
  legend: {
    data: ['销售额', '订单数'],
    textStyle: { color: '#666' },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: chartType.value === 'bar',
    data: weekDays,
    axisLine: { lineStyle: { color: '#ddd' } },
    axisLabel: { color: '#666' },
  },
  yAxis: [
    {
      type: 'value',
      name: '销售额(元)',
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { color: '#666' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    {
      type: 'value',
      name: '订单数',
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { color: '#666' },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '销售额',
      type: chartType.value,
      yAxisIndex: 0,
      data: salesData,
      smooth: chartType.value === 'line',
      itemStyle: { color: '#2d5a27' },
      areaStyle:
        chartType.value === 'line'
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(45, 90, 39, 0.3)' },
                  { offset: 1, color: 'rgba(45, 90, 39, 0.05)' },
                ],
              },
            }
          : undefined,
      barWidth: chartType.value === 'bar' ? '30%' : undefined,
    },
    {
      name: '订单数',
      type: chartType.value,
      yAxisIndex: 1,
      data: orderData,
      smooth: chartType.value === 'line',
      itemStyle: { color: '#c9a227' },
      areaStyle:
        chartType.value === 'line'
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(201, 162, 39, 0.3)' },
                  { offset: 1, color: 'rgba(201, 162, 39, 0.05)' },
                ],
              },
            }
          : undefined,
      barWidth: chartType.value === 'bar' ? '30%' : undefined,
    },
  ],
}));

const categoryChartOption = {
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(45, 90, 39, 0.9)',
    borderColor: '#2d5a27',
    textStyle: { color: '#fff' },
    formatter: '{b}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    textStyle: { color: '#666' },
  },
  color: ['#2d5a27', '#4a7c42', '#679a5d', '#85b878', '#c9a227', '#e0b84a'],
  series: [
    {
      name: '销售占比',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#2d5a27',
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 32, name: '绿茶' },
        { value: 25, name: '红茶' },
        { value: 18, name: '乌龙茶' },
        { value: 12, name: '白茶' },
        { value: 8, name: '黑茶' },
        { value: 5, name: '黄茶' },
      ],
    },
  ],
};

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'info',
    paid: 'primary',
    shipped: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  };
  return textMap[status] || status;
};

const viewAllOrders = () => {
  router.push('/admin/orders');
};

onMounted(() => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #2d5a27;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(45, 90, 39, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.icon-order {
  background: linear-gradient(135deg, #2d5a27 0%, #4a7c42 100%);
}

.icon-sales {
  background: linear-gradient(135deg, #c9a227 0%, #e0b84a 100%);
}

.icon-member {
  background: linear-gradient(135deg, #3d7a37 0%, #5a9a52 100%);
}

.icon-product {
  background: linear-gradient(135deg, #1e4a1a 0%, #2d5a27 100%);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2d5a27;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-top: 6px;
}

.stat-trend.up {
  color: #67c23a;
}

.stat-trend.down {
  color: #f56c6c;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border: none;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d5a27;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.amount {
  color: #2d5a27;
  font-weight: 600;
}

.ranking-list {
  padding: 10px 0;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-item:hover {
  background-color: #f8faf8;
}

.ranking-number {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin-right: 12px;
  flex-shrink: 0;
  background-color: #ccc;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
}

.rank-4,
.rank-5,
.rank-6 {
  background-color: #e0e0e0;
  color: #666;
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.ranking-meta {
  margin-top: 4px;
}

.sales-count {
  font-size: 12px;
  color: #999;
}

.ranking-amount {
  font-size: 15px;
  font-weight: 600;
  color: #2d5a27;
  margin-left: 12px;
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 22px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .chart-container {
    height: 260px;
  }
}
</style>
