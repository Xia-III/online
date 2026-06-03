<template>
  <div class="knowledge-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <el-button 
        type="text" 
        :icon="ArrowLeft" 
        class="back-button"
        @click="handleBack"
      />
      
      <el-input
        v-model="searchQuery"
        placeholder="搜索分类名称..."
        :prefix-icon="Search"
        clearable
        @input="handleSearch"
        class="search-input"
      />
      
      <el-button
        type="primary"
        :icon="Plus"
        circle
        size="default"
        class="add-nav-button"
        @click="dialogVisible = true"
      />
    </div>

    <!-- 加载状态 -->
    <el-loading 
      v-if="loading" 
      fullscreen 
      text="正在加载分类..."
    />

    <!-- 卡片列表区域 -->
    <el-row :gutter="20" class="card-list" v-if="cards.length && !loading">
      <el-col
        v-for="card in cards"
        :key="card.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
      >
        <el-card 
          class="card-item" 
          :body-style="{ padding: '20px' }"
          @click="handleCardClick(card.id)" 
        >
          <div class="card-header">
            <h3>{{ card.name }}</h3>
            <el-button
              v-if="role === 1"
              type="danger"
              :icon="Delete"
              circle
              plain
              @click.stop="handleDeleteCard(card.id)"
            />
          </div>
          <p class="card-content">字数: {{ card.word_count }} 字</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页器 -->
    <div class="pagination-container" v-if="total > 0 && !loading">
      <el-pagination 
        :page-size="size" 
        :current-page="currentPage" 
        :pager-count="5" 
        layout="prev, pager, next" 
        :total="total"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 空状态展示示 -->
    <el-empty
      v-else-if="!loading"
      description="没有找到分类"
      :image-size="200"
    >
      <el-button type="primary" @click="dialogVisible = true">
        添加一个分类
      </el-button>
    </el-empty>

    <!-- 添加卡片对话框 - 垂直直居中中且移除字数字段 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加新分类"
      :width="isMobile ? '90%' : '500px'"
      destroy-on-close
      :close-on-click-modal="false"
      @close="handleClose"
      class="custom-dialog"
      :center="true" 
    >
      <el-form
        ref="formRef"
        :model="cardForm"
        :rules="rules"
        :label-width="isMobile ? '70px' : '80px'"
        class="custom-form"
      >
        <el-form-item label="名称" prop="name" class="form-item"> 
          <el-input 
            v-model="cardForm.name" 
            placeholder="请输入分类名称" 
            class="custom-input"
            :class="{ 'input-focus': nameFocused }"
            @focus="nameFocused = true"
            @blur="nameFocused = false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button 
          @click="dialogVisible = false"
          class="cancel-button"
          :size="isMobile ? 'small' : 'default'"
          :disabled="isSubmitting"
        >
          取消
        </el-button>
        <el-button 
          type="primary" 
          @click="handleAddCard"
          class="confirm-button"
          :size="isMobile ? 'small' : 'default'"
          :disabled="isSubmitting"
        >
          <template v-if="isSubmitting">
            <el-icon><Loading /></el-icon>
            提交中...
          </template>
          <template v-else>确认</template>
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeMount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Delete, Plus, ArrowLeft, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getKnowledgeDocumentListAPI, createKnowledgeDocumentAPI, deleteKnowledgeDocumentAPI } from '@/api'
import { useUserStore } from '@/stores/pinia'

// 数据
const searchQuery = ref('') // 搜索分类名称
const dialogVisible = ref(false) 
const cards = ref([])
const loading = ref(false) // 加载状态
const isSubmitting = ref(false) // 用于防止重复提交

// 状态管理
const userStore = useUserStore();
const role = computed(() => {
  return userStore.userInfo?.role ?? 0; // 1：管理员 0：普通用户，默认普通用户
});

// 新增弹窗相关状态
const nameFocused = ref(false)
const isMobile = ref(false) // 检测是否为移动设备

// 分页相关数据
const currentPage = ref(1)
const size = ref(5) // 每页显示5条
const total = ref(0) // 总分类数

const route = useRoute()
const router = useRouter()

// 从路由参数获取 datasetsId
const dataset_id = ref(route.params.id)

// 检测屏幕尺寸
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768 // 小于768px视为移动设备
}

// 初始化时检测屏幕尺寸
onBeforeMount(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

// 监听路由参数变化，当dataset_id变化时重新加载数据
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      dataset_id.value = newId
      currentPage.value = 1 // 重置到第一页
      getKnowledgeDocumentList()
    }
  }
)

// 获取分类列表
const getKnowledgeDocumentList = async () => {
  try {
    loading.value = true
    const res = await getKnowledgeDocumentListAPI(dataset_id.value, {
      page: currentPage.value,
      limit: size.value,
      keyword: searchQuery.value
    })
    
    if (res.status === 200) {
      cards.value = res.data.data || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error('获取分类列表失败: ' + (res.msg || '未知错误'))
      cards.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取分类列表出错:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    cards.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 返回按钮处理函数
const handleBack = () => {
  // 这里可以添加返回上一页的逻辑
  history.back()
}

// 页面加载时自动获取数据
onMounted(() => {
  if (dataset_id.value) {
    getKnowledgeDocumentList()
  } else { 
    ElMessage.error('未找到知识库ID')
  }
})

// 搜索分类
const handleSearch = () => {
  currentPage.value = 1 // 搜索时重置到第一页
  getKnowledgeDocumentList()
}

// 表单相关
const formRef = ref(null)
const cardForm = ref({
  name: '' 
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

// 对话框关闭处理
const handleClose = () => {
  dialogVisible.value = false
  // 重置表单
  cardForm.value = {
    name: ''
  }
  // 重置表单验证
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 重置焦点状态和提交状态
  nameFocused.value = false
  isSubmitting.value = false
}

// 删除分类
const handleDeleteCard = async (document_id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await deleteKnowledgeDocumentAPI(dataset_id.value, document_id)
    if (res.status === 200) {
      ElMessage.success('删除成功')
      getKnowledgeDocumentList()
    } else {
      ElMessage.error('删除失败: ' + (res.msg || '未知错误'))
    }
    getKnowledgeDocumentList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    } else {
      ElMessage.info('已取消删除')
    }
  }
}

// 添加分类
const handleAddCard = async () => {
  // 如果正在提交，直接返回，防止重复提交
  if (isSubmitting.value) return;
  
  if (!formRef.value) return
  
  try {
    // 开始提交，设置状态为true
    isSubmitting.value = true;
    await formRef.value.validate()
    // 调用实际的添加API
    const res = await createKnowledgeDocumentAPI(dataset_id.value, cardForm.value.name)
    
    if (res.status === 200) {
      ElMessage.success('添加成功')
      dialogVisible.value = false
      getKnowledgeDocumentList() // 重新获取列表
      
      // 重置表单
      cardForm.value = {
        name: ''
      }
    } else {
      ElMessage.error('添加失败: ' + (res.msg || '未知错误'))
    }
  } catch (error) {
    if (error.name !== 'ValidationError') {
      console.error('添加分类失败:', error)
      ElMessage.error('添加失败，请稍后重试')
    }
  } finally {
    // 无论成功失败，最后都重置提交状态
    isSubmitting.value = false;
  }
}

// 分页方法
const handlePageChange = (val) => {
  currentPage.value = val
  getKnowledgeDocumentList()
}

// 卡片点击处理
const handleCardClick = (documentId) => {
  router.push(`/manage/knowledge/${dataset_id.value}/document/${documentId}`)
}
</script>

<style scoped>
.knowledge-container {
  padding: 0;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏样式 - 优化后 */
.top-nav {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  transition: box-shadow 0.3s ease;
}

.top-nav:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.back-button {
  margin-right: 20px;
  color: #606266;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #f5f7fa;
  color: #409eff;
  transform: translateX(-2px);
}
 
.search-input {
  flex: 1;
  max-width: 600px;
  transition: all 0.3s ease;
}

.search-input .el-input__wrapper {
  border-radius: 8px;
  padding: 6px 12px;
  border-color: #e5e7eb;
}

.search-input .el-input__wrapper:focus-within {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  border-color: #409eff;
}

/* 导航栏添加按钮样式 */
.add-nav-button {
  margin-left: 20px;
  background-color: #409eff;
  transition: all 0.2s ease;
  /* 确保按钮保持圆形 */
  border-radius: 50% !important;
  min-width: 40px;
  min-height: 40px;
  aspect-ratio: 1;
  /* 强制宽高相等，覆盖Element Plus默认样式 */
  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: unset !important;
  min-height: unset !important;
}

/* 移动端保持原有50x50px大小 */
@media screen and (max-width: 767px) {
  .add-nav-button {
    width: 50px !important;
    height: 50px !important;
    min-width: unset !important;
    min-height: unset !important;
  }
}

/* PC端固定为40x40px大小 */
@media screen and (min-width: 768px) {
  .add-nav-button {
    width: 40px !important;
    height: 40px !important;
    min-width: unset !important;
    min-height: unset !important;
  }
}

.add-nav-button:hover {
  background-color: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.card-list {
  padding: 0 20px;
  margin-bottom: 20px;
}

/* 卡片基础样式 */
.card-item {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

/* 移动端卡片样式保持不变 */
@media screen and (max-width: 767px) {
  .card-header h3 {
    margin: 0;
    font-size: 33px;
    font-weight: bold;
  }
  
  .card-content {
    font-size: 24px;
    margin-bottom: 16px;
    color: #606266;
    line-height: 1.5;
  }
}

/* PC端卡片样式优化 - 固定高度确保整齐 */
@media screen and (min-width: 768px) {
  .card-item {
    height: 180px; /* 固定卡片高度 */
    display: flex;
    flex-direction: column;
  }
  
  .card-header {
    flex: 1; /* 让头部占据可用空间 */
  }
  
  .card-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: bold;
    color: #333;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* 最多显示2行 */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
  }
  
  .card-content {
    font-size: 16px;
    color: #606266;
    line-height: 1.5;
    margin-top: auto; /* 推到容器底部 */
    padding-top: 10px;
  }
}

.add-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  padding: 10px 0;
}

/* 弹窗基础样式 */
.custom-dialog {
  --el-dialog-border-radius: 16px;
  --el-dialog-padding-primary: 24px;
}

.custom-dialog .el-dialog__header {
  margin: 0;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.custom-dialog .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.5;
}

.custom-dialog .el-dialog__body {
  padding: 24px;
}

.custom-dialog .el-dialog__footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 表单样式优化 */
.custom-form {
  width: 100%;
}

.form-item {
  margin-bottom: 20px;
}

.form-item .el-form-item__label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  padding: 0 0 8px;
  line-height: 1.4;
}

/* 输入框样式优化 */
.custom-input {
  --el-input-border-radius: 8px;
  transition: all 0.3s ease;
}

.custom-input .el-input__wrapper {
  height: 44px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  box-shadow: none !important;
  transition: all 0.3s ease;
}

.custom-input .el-input__wrapper:hover {
  border-color: #d1d5db;
  background-color: #ffffff;
}

.custom-input.input-focus .el-input__wrapper {
  border-color: #409eff;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1) !important;
}

.custom-input .el-input__inner {
  font-size: 15px;
  color: #1f2937;
  padding: 0 16px;
}

.custom-input .el-input__inner::placeholder {
  color: #9ca3af;
}

/* 按钮样式优化 */
.cancel-button, .confirm-button {
  min-width: 88px;
  padding: 9px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 移动端按钮字体保持30px */
@media screen and (max-width: 767px) {
  .cancel-button, .confirm-button {
    font-size: 30px;
  }
}

/* PC端按钮字体调整为14px */
@media screen and (min-width: 768px) {
  .cancel-button, .confirm-button {
    font-size: 14px;
  }
}

.cancel-button {
  border: 1px solid #e5e7eb;
  color: #4b5563;
  background-color: #ffffff;
}

.cancel-button:hover {
  border-color: #d1d5db;
  color: #374151;
  background-color: #f9fafb;
}

.confirm-button {
  background-color: #409eff;
  border-color: #409eff;
}

.confirm-button:hover {
  background-color: #4096ff;
  border-color: #4096ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

/* 提交中状态样式 */
.confirm-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

</style>
