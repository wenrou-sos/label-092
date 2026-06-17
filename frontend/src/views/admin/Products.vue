<template>
  <div class="admin-products-page">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Goods /></el-icon>
        商品管理
      </h2>
      <el-button type="primary" size="large" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
    </div>

    <div class="filter-bar card-shadow">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="茶类">
          <el-select v-model="filterForm.category" placeholder="全部茶类" clearable @change="handleFilter">
            <el-option
              v-for="(label, value) in TeaCategoryMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.isActive" placeholder="全部状态" clearable @change="handleFilter">
            <el-option label="上架中" :value="true" />
            <el-option label="已下架" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input
            v-model="filterForm.keyword"
            placeholder="商品名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleFilter"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon><Search /></el-icon>
            筛选
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container card-shadow">
      <el-table v-loading="loading" :data="products" border stripe>
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="getImageUrl(row.image)"
              :preview-src-list="[getImageUrl(row.image)]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 6px"
            />
            <el-icon v-else :size="40" color="#ccc">
              <Picture />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="category" label="茶类" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ TeaCategoryMap[row.category] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="harvestYear" label="年份" width="80" align="center" />
        <el-table-column prop="reviewScore" label="审评得分" width="100" align="center">
          <template #default="{ row }">
            <span class="score-text">{{ row.reviewScore.toFixed(1) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="180">
          <template #default="{ row }">
            <div class="price-info">
              <div class="price-item">
                <span class="price-label">散茶</span>
                <span class="price-value">¥{{ row.pricePer100g.toFixed(2) }}/100g</span>
              </div>
              <div v-if="row.boxPrice" class="price-item">
                <span class="price-label">盒装</span>
                <span class="price-value">¥{{ row.boxPrice.toFixed(2) }}</span>
              </div>
              <div v-if="row.giftBoxPrice" class="price-item">
                <span class="price-label">礼盒</span>
                <span class="price-value">¥{{ row.giftBoxPrice.toFixed(2) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              :active-text="'上架'"
              :inactive-text="'下架'"
              inline-prompt
              @change="(val: boolean) => handleToggleActive(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="total > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="productDialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="800px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品图片" prop="image">
              <el-upload
                class="image-uploader"
                :show-file-list="false"
                :http-request="handleImageUpload"
                accept="image/*"
              >
                <img v-if="productForm.image" :src="getImageUrl(productForm.image)" class="uploaded-image" />
                <el-icon v-else class="uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">建议尺寸 400x400，支持 JPG、PNG</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="productForm.name" placeholder="请输入商品名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="茶类" prop="category">
              <el-select v-model="productForm.category" placeholder="请选择茶类" style="width: 100%">
                <el-option
                  v-for="(label, value) in TeaCategoryMap"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="采摘年份" prop="harvestYear">
              <el-input-number v-model="productForm.harvestYear" :min="2000" :max="2030" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="产区故事" prop="originStory">
          <el-input
            v-model="productForm.originStory"
            type="textarea"
            :rows="3"
            placeholder="请输入产区故事，介绍茶叶产地风土人情"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="制作工艺" prop="process">
          <el-input
            v-model="productForm.process"
            type="textarea"
            :rows="3"
            placeholder="请输入详细的制作工艺描述"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="审评得分" prop="reviewScore">
              <el-input-number
                v-model="productForm.reviewScore"
                :min="0"
                :max="100"
                :step="0.1"
                :precision="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="库存数量" prop="stock">
              <el-input-number v-model="productForm.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="起售重量(g)" prop="minWeight">
              <el-input-number v-model="productForm.minWeight" :min="100" :step="50" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">定价设置</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="散茶价(100g)" prop="pricePer100g">
              <el-input-number
                v-model="productForm.pricePer100g"
                :min="0"
                :step="1"
                :precision="2"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="盒装价格">
              <el-input-number
                v-model="productForm.boxPrice"
                :min="0"
                :step="1"
                :precision="2"
                :controls="false"
                placeholder="选填"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="礼盒装价格">
              <el-input-number
                v-model="productForm.giftBoxPrice"
                :min="0"
                :step="1"
                :precision="2"
                :controls="false"
                placeholder="选填"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品描述">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品补充描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="上架状态">
          <el-switch
            v-model="productForm.isActive"
            active-text="上架"
            inactive-text="下架"
            inline-prompt
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type UploadRequestOptions } from 'element-plus';
import {
  Goods,
  Plus,
  Search,
  Refresh,
  Picture,
  Edit,
  Delete,
} from '@element-plus/icons-vue';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from '@/api/product';
import { uploadImage } from '@/api/admin';
import { TeaCategoryMap, type Product, type TeaCategory } from '@/types';

const loading = ref(false);
const submitting = ref(false);
const products = ref<Product[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const productDialogVisible = ref(false);
const isEdit = ref(false);
const productFormRef = ref<FormInstance>();

const filterForm = reactive({
  category: '' as TeaCategory | '',
  isActive: '' as boolean | '',
  keyword: '',
});

const productForm = reactive<Partial<Product>>({
  name: '',
  category: 'green' as TeaCategory,
  originStory: '',
  harvestYear: new Date().getFullYear(),
  process: '',
  reviewScore: 85.0,
  pricePer100g: 0,
  boxPrice: null,
  giftBoxPrice: null,
  minWeight: 100,
  stock: 0,
  image: null,
  isActive: true,
  description: '',
});

const productRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择茶类', trigger: 'change' }],
  originStory: [{ required: true, message: '请输入产区故事', trigger: 'blur' }],
  harvestYear: [{ required: true, message: '请选择采摘年份', trigger: 'blur' }],
  process: [{ required: true, message: '请输入制作工艺', trigger: 'blur' }],
  reviewScore: [{ required: true, message: '请输入审评得分', trigger: 'blur' }],
  pricePer100g: [{ required: true, message: '请输入散茶价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
  minWeight: [{ required: true, message: '请输入起售重量', trigger: 'blur' }],
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: filterForm.keyword || undefined,
      category: filterForm.category || undefined,
      isActive: filterForm.isActive === '' ? undefined : filterForm.isActive,
    };
    const res = await getProducts(params);
    products.value = res.data;
    total.value = res.total || 0;
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

const getImageUrl = (image: string | null) => {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  return `/uploads/${image}`;
};

const handleFilter = () => {
  currentPage.value = 1;
  fetchProducts();
};

const handleReset = () => {
  filterForm.category = '';
  filterForm.isActive = '';
  filterForm.keyword = '';
  currentPage.value = 1;
  fetchProducts();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchProducts();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchProducts();
};

const handleAdd = () => {
  isEdit.value = false;
  Object.assign(productForm, {
    name: '',
    category: 'green' as TeaCategory,
    originStory: '',
    harvestYear: new Date().getFullYear(),
    process: '',
    reviewScore: 85.0,
    pricePer100g: 0,
    boxPrice: null,
    giftBoxPrice: null,
    minWeight: 100,
    stock: 0,
    image: null,
    isActive: true,
    description: '',
  });
  productDialogVisible.value = true;
};

const handleEdit = (row: Product) => {
  isEdit.value = true;
  Object.assign(productForm, { ...row });
  productDialogVisible.value = true;
};

const handleDelete = (row: Product) => {
  ElMessageBox.confirm(
    `确定要删除商品"${row.name}"吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await deleteProduct(row.id);
        ElMessage.success('删除成功');
        fetchProducts();
      } catch (error: any) {
        ElMessage.error(error.message || '删除失败');
      }
    })
    .catch(() => {});
};

const handleToggleActive = async (row: Product, val: boolean) => {
  try {
    await updateProductStatus(row.id, val);
    ElMessage.success(val ? '已上架' : '已下架');
  } catch (error: any) {
    row.isActive = !val;
    ElMessage.error(error.message || '操作失败');
  }
};

const handleImageUpload = async (options: UploadRequestOptions) => {
  try {
    const res = await uploadImage('product', options.file);
    productForm.image = res.filename;
    ElMessage.success('图片上传成功');
  } catch (error: any) {
    ElMessage.error(error.message || '图片上传失败');
  }
};

const handleSubmit = async () => {
  if (!productFormRef.value) return;
  await productFormRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      if (isEdit.value && productForm.id) {
        await updateProduct(productForm.id, productForm);
        ElMessage.success('更新成功');
      } else {
        await createProduct(productForm);
        ElMessage.success('创建成功');
      }
      productDialogVisible.value = false;
      fetchProducts();
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败');
    } finally {
      submitting.value = false;
    }
  });
};

const handleDialogClosed = () => {
  productFormRef.value?.resetFields();
};

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.admin-products-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-bar {
  background: #fff;
  padding: 16px 24px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.score-text {
  font-weight: 600;
  color: #c9a227;
  font-size: 15px;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.price-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.price-label {
  color: #999;
  min-width: 30px;
}

.price-value {
  color: #c9a227;
  font-weight: 600;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.image-uploader:hover {
  border-color: #409eff;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.card-shadow {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
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

:deep(.el-pagination.is-background .el-pager li:not(.disabled).is-active) {
  background-color: #2d5a27;
}

:deep(.el-dialog__body) {
  padding-top: 10px;
}
</style>
